import {linkedPieceQuery} from '../studio/navigation';
import {useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {usePrivateDocument} from '../experience/usePrivateDocument';
import {emptyMaterials,parseMaterials} from '../workspace/contracts';
import {resolveMediaPath} from '../components/shared/mediaStorage';
import {ButtonSecondary} from '../components/ui/DesignSystem';
import {type Piece} from './model';
export default function PieceMediaPreview({user,project,piece}:{user:string;project:string;piece:Piece}){
 const [params]=useSearchParams();
 const doc=usePrivateDocument(user,project,'materials',()=>emptyMaterials(project),v=>parseMaterials(v,project,user));
 const [urls,setUrls]=useState<Record<string,string>>({}),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const video=doc.data.materials.find(row=>row.id===piece.videoId&&row.kind==='video');
 const cover=doc.data.materials.find(row=>row.id===piece.coverId&&row.kind==='image');
 useEffect(()=>{let active=true;setError('');Promise.all([video,cover].filter(Boolean).map(async row=>[row!.id,await resolveMediaPath(row!.path)] as const)).then(rows=>{if(active)setUrls(Object.fromEntries(rows));}).catch(()=>{if(active)setError('No se pudo abrir el archivo privado. Puedes reintentar.');});return()=>{active=false;};},[video?.path,cover?.path,attempt]);
 if(!piece.videoId&&!piece.coverId)return null;
 return <section className="piece-saved-media" aria-label="Video y portada guardados">{!doc.loaded?<p role="status">Abriendo tus archivos…</p>:doc.error?<p role="alert">{doc.error}</p>:<>{video&&urls[video.id]&&<video src={urls[video.id]} poster={cover&&urls[cover.id]||undefined} controls playsInline preload="metadata" aria-label="Video guardado de esta pieza"/>}{!video&&cover&&urls[cover.id]&&<img src={urls[cover.id]} alt="Portada de reel guardada"/>}{(piece.videoId&&!video||piece.coverId&&!cover)&&<p role="alert">Hay un archivo pendiente de recuperar en esta pieza.</p>}<small>{video?'Video guardado en tu biblioteca.':cover?'Portada guardada en tu biblioteca.':''}</small>{video&&<Link className="pe-action-link" to={'/dashboard/tools/video'+linkedPieceQuery(project,piece.id,params)}>Editar mi video →</Link>}</>}{(doc.error||error)&&<><p role="alert">{error}</p><ButtonSecondary onClick={()=>{setAttempt(v=>v+1);void doc.reload();}}>Reintentar archivos</ButtonSecondary></>}</section>;
}
