import { ButtonPrimary as DSButtonPrimary, ButtonSecondary as DSButtonSecondary, Input as DSInput } from '../../components/ui/DesignSystem';
import { useEffect, useRef, useState } from 'react';
import { loadRestaurantPublication, publishRestaurant, unpublishRestaurant, type ModulePublication } from '../../services/modulePublishing';
import type { ModuleProject } from '../moduleProjects';
import type { RestaurantData } from './model';
import PublicationQr from '../../components/shared/PublicationQr';
import { restaurantPublicPath, suggestRestaurantSlug } from '../validationLaunch';

const publicationStorage = { load: loadRestaurantPublication, publish: publishRestaurant, unpublish: unpublishRestaurant };
export default function RestaurantPublishing({ data, userId, project, disabled, storage = publicationStorage }: { data: RestaurantData; userId: string; project: ModuleProject; disabled: boolean; storage?: typeof publicationStorage }) {
  const [publication, setPublication] = useState<ModulePublication | null>(null);
  const [slug, setSlug] = useState(() => suggestRestaurantSlug(project.name));
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    storage.load(userId, project.id).then(value => { if (active) { setPublication(value); setSlug(current => value?.slug ?? current); setLoaded(true); setNotice(''); } }).catch(error => { if (active) setNotice(error.message); });
    return () => { active = false; };
  }, [userId, project.id, attempt, storage]);
  async function change(publish: boolean) {
    if (submitting.current || !loaded || (publish && disabled)) return;
    submitting.current = true; setBusy(true); setNotice('');
    try {
      const next = publish ? await storage.publish(userId, project.id, data, slug, publication) : publication && await storage.unpublish(userId, project.id, publication);
      if (next) { setPublication(next); setNotice(next.published ? 'Tu carta está publicada. Ya puedes compartir el enlace.' : 'La carta dejó de estar publicada.'); }
    } catch (error) { setNotice((error as Error).message); setLoaded(false); }
    finally { submitting.current = false; setBusy(false); }
  }
  const url = publication?.published ? `${window.location.origin}${restaurantPublicPath(publication.slug)}` : '';
  const localLink = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  return <details id="restaurant-publish" open className="component-card restaurant-publishing"><summary>3. Publicar y compartir mi menú</summary><p role="status">{notice}</p>
    {!loaded ? <><p>Comprobando el estado de publicación.</p>{notice && <DSButtonSecondary type="button" onClick={() => setAttempt(value => value + 1)}>Revisar estado</DSButtonSecondary>}</> : <>
      <p>Publica los platos disponibles y las secciones visibles de tu carta. Las fotos seleccionadas también serán públicas.</p>
      <label>Dirección de tu carta<DSInput value={slug} disabled={busy} maxLength={60} placeholder="alfajores-del-valle" onChange={event => setSlug(event.target.value.toLowerCase())} /></label>
      <p className="restaurant-public-url">Tu enlace: {window.location.origin}/{slug || "nombre-de-tu-negocio"}</p>
      {disabled && <p>Aplica los formularios y guarda tus cambios antes de publicar.</p>}
      {localLink && <p>Estás usando una dirección local. Abre For U desde su dominio publicado para generar el enlace y QR que compartirás con tus clientes.</p>}
      <DSButtonPrimary type="button" disabled={busy || disabled} onClick={() => change(true)}>{busy ? 'Actualizando…' : publication?.published ? 'Actualizar carta publicada' : 'Publicar mi menú'}</DSButtonPrimary>
      {url && <><p className="restaurant-public-url"><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p><DSButtonSecondary type="button" onClick={async () => { try { await navigator.clipboard.writeText(url); setNotice('Enlace copiado.'); } catch { setNotice(`Copia este enlace: ${url}`); } }}>Copiar enlace</DSButtonSecondary><PublicationQr url={url} /><DSButtonSecondary type="button" disabled={busy} onClick={() => { if (window.confirm('¿Retirar la carta pública? Las copias públicas de las fotos conservarán sus enlaces.')) void change(false); }}>Retirar publicación</DSButtonSecondary></>}
    </>}
  </details>;
}
