import { ButtonSecondary as DSButtonSecondary } from '../ui/DesignSystem';
import { useContext, useEffect, useState } from 'react';
import { MediaScope } from './mediaScope';
import { externalImageUrl, isPrivateMedia, privateMediaPath } from './mediaReference';
import { resolveMediaPath } from './mediaStorage';

export default function ProjectImage({ value, alt, className }: { value: string; alt: string; className?: string }) {
  const scope = useContext(MediaScope);
  const path = scope ? privateMediaPath(value, scope.userId, scope.projectId) : null;
  const [resolved, setResolved] = useState({ path: '', url: '', error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!path) return;
    let active = true;
    async function refresh() {
      try { const url = await resolveMediaPath(path!); if (active) setResolved({ path: path!, url, error: url ? '' : 'No se pudo cargar la imagen.' }); }
      catch { if (active) setResolved({ path: path!, url: '', error: 'No se pudo cargar la imagen.' }); }
    }
    void refresh();
    const interval = window.setInterval(() => void refresh(), 45 * 60 * 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, [path, attempt]);
  if (!value) return null;
  if (!isPrivateMedia(value)) { const url = externalImageUrl(value); return url ? <img className={className} src={url} alt={alt} /> : null; }
  if (!path) return <span role="status">Esta imagen no pertenece al proyecto abierto.</span>;
  if (resolved.path !== path) return <span role="status">Cargando imagen…</span>;
  if (resolved.error) return <span role="status">{resolved.error} <DSButtonSecondary type="button" onClick={() => setAttempt(value => value + 1)}>Reintentar imagen</DSButtonSecondary></span>;
  return <img className={className} src={resolved.url} alt={alt} />;
}
