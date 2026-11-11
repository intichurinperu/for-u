import {useEffect,useRef,useState} from 'react';
import AudioCapture from './AudioCapture';
import {randomId} from '../lib/randomId';
import {supabase} from '../lib/supabaseClient';
import {resolveMediaPath} from '../components/shared/mediaStorage';
import {ButtonSecondary} from '../components/ui/DesignSystem';
import type {Material} from './journeyModel';
import './answerAudio.css';
export type {Material} from './journeyModel';

const imageTypes=['image/jpeg','image/png','image/webp'];
const audioTypes=['audio/mpeg','audio/wav','audio/mp4','audio/webm'];
const materialTypes=[...imageTypes,...audioTypes,'video/mp4','video/webm','application/pdf'];

export default function MaterialAttachments({user,project,files,disabled,onChange,imagesOnly=false,question,onPendingChange}:{
 user:string;project:string;files:Material[];disabled:boolean;imagesOnly?:boolean;question?:string;
 onChange:(files:Material[])=>void;
 onPendingChange?:(pending:boolean)=>void;
}){
 const own=(path:string)=>path.startsWith(`${user}/${project}/`)&&path.split('/').length===3&&!path.includes('..');
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [audioPending,setAudioPending]=useState(false);
 const uploading=useRef(false);
 const latest=useRef({files,onChange});
 useEffect(()=>{latest.current={files,onChange};},[files,onChange]);
 const pending=audioPending||busy;
 useEffect(()=>{onPendingChange?.(pending);},[onPendingChange,pending]);
 useEffect(()=>()=>onPendingChange?.(false),[onPendingChange]);
 const visibleFiles=files.filter(file=>file.question===question&&!file.offerOption);
 const currentAnswer=question?visibleFiles.filter(file=>own(file.path)).at(-1):undefined;
 const full=files.length>=20&&!currentAnswer;

 async function upload(file:File|undefined){
  if(!file||uploading.current||disabled||full)return false;
  if(!supabase){setError('La conexión para adjuntar archivos no está disponible. Inténtalo otra vez.');return false;}
  const ext=file.name.split('.').pop()?.replace(/[^a-z0-9]/gi,'').slice(0,8).toLowerCase()||'bin';
  const contentType=file.type==='audio/x-m4a'||file.type==='audio/m4a'?'audio/mp4':file.type==='audio/x-wav'?'audio/wav':file.type==='audio/mp3'?'audio/mpeg':file.type;
  const allowed=question?audioTypes:imagesOnly?imageTypes:materialTypes;
  if(!allowed.includes(contentType)||file.size>20*1024*1024){
   setError(question?'Elige un audio MP3, WAV, M4A o WebM de hasta 20 MB.':imagesOnly?'Elige una captura JPG, PNG o WebP de hasta 20 MB.':'Usa JPG, PNG, WebP, audio MP3/WAV/M4A/WebM, MP4 o PDF de hasta 20 MB.');
   return false;
  }
  uploading.current=true;setBusy(true);setError('');
  try{
   const path=`${user}/${project}/${randomId()}.${ext}`;
   const result=await supabase.storage.from('user-uploads').upload(path,file,{contentType,upsert:false});
   if(result.error)throw new Error(question?'No se adjuntó el audio.':'No se pudo subir. Revisa el formato, capacidad o conexión.');
   const current=latest.current;
   const attachment={path,name:file.name.slice(0,200),...(question?{question}:{})};
   current.onChange(currentAnswer&&current.files.some(file=>file.path===currentAnswer.path)
    ?current.files.map(file=>file.path===currentAnswer.path?attachment:file)
    :[...current.files,attachment]);
   return true;
  }catch(e){setError((e as Error).message);return false;}
  finally{uploading.current=false;setBusy(false);}
 }

 function pick(event:React.ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];
  event.target.value='';
  void upload(file);
 }

 if(question)return <div className="answer-audio-slot">
  <AudioCapture forAnswer attached={!!currentAnswer} disabled={disabled||busy||full} onSave={upload} onPendingChange={setAudioPending}/>
  {full&&<small>Límite de audios alcanzado</small>}
  {error&&<small role="alert">{error}</small>}
 </div>;

 return <details>
  <summary>{imagesOnly?'Capturas de referencia':'Fotos, audio y material'} · {visibleFiles.length}</summary>
  <p>Solo se guarda el archivo. No se interpreta ni transcribe automáticamente.</p>
  {!imagesOnly&&<AudioCapture disabled={disabled||busy||full} onSave={upload} onPendingChange={setAudioPending}/>}
  {visibleFiles.map(file=><div key={file.path}>
   <ButtonSecondary type="button" disabled={pending||disabled||!own(file.path)} onClick={()=>void resolveMediaPath(file.path).then(url=>window.open(url,'_blank','noopener,noreferrer')).catch(e=>setError(e.message))}>{own(file.path)?file.name:'Archivo de otro proyecto · no disponible'}</ButtonSecondary>
   <ButtonSecondary type="button" disabled={pending||disabled} onClick={()=>onChange(files.filter(item=>item.path!==file.path))}>Desvincular</ButtonSecondary>
  </div>)}
  <label>Adjuntar material<input type="file" accept={(imagesOnly?imageTypes:materialTypes).join(',')} disabled={disabled||pending||full} onChange={pick}/></label>
  {busy&&<p role="status">Subiendo archivo…</p>}{error&&<p role="alert">{error}</p>}
 </details>;
}
