import { ButtonSecondary as DSButtonSecondary } from '../ui/DesignSystem';
import { useEffect, useId, useRef, useState } from 'react';
import { supabase } from '../../services/supabase';
import { compressImage } from '../../toolkit/media';
import { resolveMediaPath } from './mediaStorage';
export type SelectedMedia = { path: string; url: string; name: string };
type GalleryProps = { userId: string; projectId: string; onSelect: (media: SelectedMedia) => void };
export default function MediaGallery(props: GalleryProps) {
  return <MediaGallerySession key={`${props.userId}:${props.projectId}`} {...props} />;
}
function MediaGallerySession({ userId, projectId, onSelect }: GalleryProps) {
  const [images, setImages] = useState<SelectedMedia[]>([]);
  const [loading,setLoading]=useState(true);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [revision, setRevision] = useState(0);
  const uploading = useRef(false);
  const alive = useRef(true);
  const uploadId = useId();
  const [failed, setFailed] = useState(false);
  const [dragging, setDragging] = useState(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let active = true; setLoading(true); setFailed(false);
    (async () => {
      if (!supabase) { setNotice('Conecta tu cuenta para abrir la biblioteca.'); setLoading(false); return; }
      const prefix = `${userId}/${projectId}`;
      const { data: files, error } = await supabase.storage.from('user-uploads').list(prefix, { limit: 40, offset: page * 40, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw new Error('No se pudo cargar la biblioteca. Reintenta.');
      const paths = (files ?? []).filter(file => file.id && /\.(jpe?g|png|webp|avif)$/i.test(file.name)).map(file => ({ path: `${prefix}/${file.name}`, name: file.name }));
      const results = await Promise.allSettled(paths.map(async file => ({ ...file, url: await resolveMediaPath(file.path) })));
      const resolved = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
      if (active) { setLoading(false); setImages(resolved); setMore((files?.length ?? 0) === 40); setNotice(results.some(result => result.status === 'rejected') ? 'Algunas imágenes no se pudieron cargar. Actualiza la biblioteca para reintentar.' : ''); }
    })().catch(error => { if (active) {setLoading(false);setFailed(true);setNotice(error.message);} });
    return () => { active = false; };
  }, [userId, projectId, page, revision]);
  async function upload(file: File | undefined) {
    if (!file || !supabase || uploading.current) return;
    uploading.current = true; setBusy(true); setNotice('Subiendo imagen…');
    try {
      const blob = await compressImage(file);
      const path = `${userId}/${projectId}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from('user-uploads').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (error) throw new Error('No se pudo subir la imagen. Revisa la conexión y reintenta.');
      const url = await resolveMediaPath(path);
      if (alive.current) { setPage(0); setRevision(value => value + 1); onSelect({path,url,name:file.name}); }
    } catch (error) { if (alive.current) { setFailed(true);setNotice((error as Error).message); } }
    finally { uploading.current = false; if (alive.current) setBusy(false); }
  }
  return <section className="creator-gallery" aria-busy={busy||loading}>
    <label htmlFor={uploadId} className={`media-upload-target${dragging?' is-dragging':''}${busy?' is-busy':''}`} onDragOver={event=>{event.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={event=>{event.preventDefault();setDragging(false);void upload(event.dataTransfer.files[0]);}}>
      <input id={uploadId} className="media-upload-input" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>{void upload(event.target.files?.[0]);event.target.value='';}}/>
      <span className="media-upload-symbol" aria-hidden="true">＋</span><strong>{busy?'Subiendo tu foto…':'Añadir una foto'}</strong><span>Elige de tu dispositivo o arrástrala aquí</span><small>JPG, PNG o WebP</small>
    </label>
    {(notice||loading)&&<p className="media-notice" role={failed?'alert':'status'}>{notice||(loading?'Cargando tus fotos…':'')}</p>}
    {failed&&<DSButtonSecondary type="button" disabled={busy||loading} onClick={()=>setRevision(value=>value+1)}>Reintentar biblioteca</DSButtonSecondary>}
    {images.length>0&&<><h3 className="media-gallery-title">O elige una de tu proyecto</h3><div className="creator-media-grid">{images.map((image,index)=><button className="media-image-choice" type="button" disabled={busy} key={image.path} aria-label={`Usar foto ${page*40+index+1}`} onClick={()=>onSelect(image)}><img src={image.url} alt=""/><span>Usar foto</span></button>)}</div></>}
    {(page>0||more)&&<nav className="creator-actions" aria-label="Páginas de fotos">{page>0&&<DSButtonSecondary type="button" disabled={loading||busy} onClick={()=>setPage(value=>value-1)}>Anteriores</DSButtonSecondary>}{more&&<DSButtonSecondary type="button" disabled={loading||busy} onClick={()=>setPage(value=>value+1)}>Más fotos</DSButtonSecondary>}</nav>}
  </section>;
}
