import { ButtonSecondary as DSButtonSecondary, Input as DSInput } from '../../components/ui/DesignSystem';
import { useEffect, useRef, useState } from 'react';
import { loadTourismPublication, publishTourism, unpublishTourism, type ModulePublication } from '../../services/modulePublishing';
import type { ModuleProject } from '../moduleProjects';
import type { TourismData } from './model';
import PublicationQr from '../../components/shared/PublicationQr';

const publicationStorage = { load: loadTourismPublication, publish: publishTourism, unpublish: unpublishTourism };
export default function TourismPublishing({ data, userId, project, disabled, storage = publicationStorage }: { data: TourismData; userId: string; project: ModuleProject; disabled: boolean; storage?: typeof publicationStorage }) {
  const [publication, setPublication] = useState<ModulePublication | null>(null);
  const [slug, setSlug] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    storage.load(userId, project.id).then(value => { if (active) { setPublication(value); setSlug(value?.slug ?? ''); setLoaded(true); setNotice(''); } }).catch(error => { if (active) setNotice(error.message); });
    return () => { active = false; };
  }, [userId, project.id, attempt, storage]);
  async function change(publish: boolean) {
    if (submitting.current || !loaded || (publish && disabled)) return;
    submitting.current = true; setBusy(true); setNotice('');
    try {
      const next = publish ? await storage.publish(userId, project.id, data, slug, publication) : publication && await storage.unpublish(userId, project.id, publication);
      if (next) { setPublication(next); setNotice(next.published ? 'Tu página de experiencias está publicada. Ya puedes compartir el enlace.' : 'La página dejó de estar publicada.'); }
    } catch (error) { setNotice((error as Error).message); setLoaded(false); }
    finally { submitting.current = false; setBusy(false); }
  }
  const url = publication?.published ? `${window.location.origin}/experiencias/${publication.slug}` : '';
  const localLink = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  return <details className="tour-card"><summary>Publicar y compartir mis experiencias</summary><p role="status">{notice}</p>
    {!loaded ? <><p>Comprobando el estado de publicación.</p>{notice && <DSButtonSecondary type="button" onClick={() => setAttempt(value => value + 1)}>Revisar estado</DSButtonSecondary>}</> : <>
      <p>Publica tus experiencias activas. Las salidas y plazas se consultan en tiempo real. Las fotos seleccionadas también serán públicas.</p>
      <label>Dirección de tus experiencias<DSInput value={slug} disabled={busy} maxLength={60} placeholder="mi-agencia" onChange={event => setSlug(event.target.value.toLowerCase())} /></label>
      {disabled && <p>Aplica los formularios y guarda tus cambios antes de publicar.</p>}
      {localLink && <p>Estás usando una dirección local. Abre For U desde su dominio publicado para generar el enlace y QR que compartirás con tus clientes.</p>}
      <DSButtonSecondary type="button" disabled={busy || disabled} onClick={() => change(true)}>{busy ? 'Actualizando…' : publication?.published ? 'Actualizar página publicada' : 'Publicar experiencias'}</DSButtonSecondary>
      {url && <><p><a href={url} target="_blank" rel="noopener noreferrer">Abrir mis experiencias públicas</a></p><DSButtonSecondary type="button" onClick={async () => { try { await navigator.clipboard.writeText(url); setNotice('Enlace copiado.'); } catch { setNotice(`Copia este enlace: ${url}`); } }}>Copiar enlace</DSButtonSecondary><PublicationQr url={url} label="tus experiencias publicadas" filename="qr-mis-experiencias.svg" caption="Escanea para ver las experiencias." /><DSButtonSecondary type="button" disabled={busy} onClick={() => { if (window.confirm('¿Retirar la página pública? Las copias públicas de las fotos conservarán sus enlaces.')) void change(false); }}>Retirar publicación</DSButtonSecondary></>}
    </>}
  </details>;
}
