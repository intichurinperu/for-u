import {useContext,useEffect,useState} from 'react';
import {MediaScope} from './mediaScope';
import {privateMediaPath,externalImageUrl,isPrivateMedia,mediaReference} from './mediaReference';
import {resolveMediaPath} from './mediaStorage';
import {supabase} from '../../services/supabase';
import {randomId} from '../../lib/randomId';
import {ButtonSecondary,Input} from '../ui/DesignSystem';
export function ResourceField({value,type,onChange}:{value:string;type:'video'|'file';onChange:(value:string)=>void}){
 const scope=useContext(MediaScope);const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function upload(file:File|undefined){if(!file||!scope||!supabase||busy)return;const allowed=type==='video'?['video/mp4','video/webm']:['application/pdf','image/jpeg','image/png','image/webp','audio/mpeg','audio/wav'];if(file.size>20*1024*1024||!allowed.includes(file.type)){setError('Usa un formato admitido de hasta 20 MB. Para videos mayores puedes usar un enlace autorizado.');return;}setBusy(true);setError('');try{const ext=file.name.split('.').pop()?.replace(/[^a-z0-9]/gi,'').slice(0,8)||'bin';const path=`${scope.userId}/${scope.projectId}/${randomId()}.${ext}`;const {error}=await supabase.storage.from('user-uploads').upload(path,file,{contentType:file.type,upsert:false});if(error)throw new Error('No se pudo subir el recurso. Revisa formato, capacidad o conexión.');onChange(mediaReference(path));}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <section><label>{type==='video'?'Subir video de la lección':'Subir material de la lección'}<input type="file" accept={type==='video'?'video/mp4,video/webm':'application/pdf,image/jpeg,image/png,image/webp,audio/mpeg,audio/wav'} disabled={!scope||busy} onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}}/></label><small>Hasta 20 MB · privado en tu biblioteca · guarda el curso para conservar el vínculo.</small>{value&&<ButtonSecondary disabled={busy} onClick={()=>onChange('')}>Desvincular recurso</ButtonSecondary>}<details><summary>Usar enlace externo · avanzado</summary><Input label={type==='video'?'Enlace del video':'Enlace del material'} type="url" value={isPrivateMedia(value)?'':value} onChange={e=>onChange(e.target.value)}/></details>{busy&&<p role="status">Subiendo recurso…</p>}{error&&<p role="alert">{error}</p>}</section>;
}
export function ResourcePreview({value,type}:{value:string;type:'video'|'file'}){
 const scope=useContext(MediaScope),path=scope?privateMediaPath(value,scope.userId,scope.projectId):null;const [resolved,setResolved]=useState({path:'',url:'',error:''}),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(!path)return;let live=true;void resolveMediaPath(path).then(url=>{if(live)setResolved({path,url,error:''});}).catch(e=>{if(live)setResolved({path,url:'',error:e.message});});return()=>{live=false;};},[path,attempt]);
 if(isPrivateMedia(value)&&!path)return <p>Recurso privado no disponible en este contexto.</p>;
 const url=path?(resolved.path===path?resolved.url:''):externalImageUrl(value);
 if(path&&resolved.path===path&&resolved.error)return <p role="alert">{resolved.error}<ButtonSecondary onClick={()=>setAttempt(i=>i+1)}>Reintentar recurso</ButtonSecondary></p>;
 if(!url)return <p>{value?'Cargando recurso…':'Agrega el recurso de esta lección.'}</p>;
 return type==='video'?<video controls src={url} preload="metadata" playsInline/>:<a href={url} target="_blank" rel="noreferrer">Abrir material de la lección</a>;
}
