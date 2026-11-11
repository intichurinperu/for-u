import {useEffect,useRef,useState} from 'react';
import PearlButton from '../components/ui/PearlButton';

/** The microphone opens only on request. A failed upload keeps the local recording. */
export default function AudioCapture({disabled,onSave,onPendingChange,forAnswer=false,attached=false}:{
 disabled:boolean;
 onSave:(file:File)=>Promise<boolean>;
 onPendingChange?:(pending:boolean)=>void;
 forAnswer?:boolean;
 attached?:boolean;
}){
 const recorder=useRef<MediaRecorder|null>(null);
 const stream=useRef<MediaStream|null>(null);
 const limit=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const alive=useRef(true),starting=useRef(false);
 const [requesting,setRequesting]=useState(false),[recording,setRecording]=useState(false);
 const [file,setFile]=useState<File|null>(null),[url,setUrl]=useState('');
 const [error,setError]=useState(''),[saving,setSaving]=useState(false);
 const pending=requesting||recording||saving||(!forAnswer&&!!file);
 useEffect(()=>{onPendingChange?.(pending);},[onPendingChange,pending]);
 useEffect(()=>()=>onPendingChange?.(false),[onPendingChange]);
 useEffect(()=>{
  alive.current=true;
  return()=>{
   alive.current=false;
   clearTimeout(limit.current);
   if(recorder.current?.state==='recording')recorder.current.stop();
   stream.current?.getTracks().forEach(track=>track.stop());
  };
 },[]);
 useEffect(()=>{
  if(!file||forAnswer){setUrl('');return;}
  const next=URL.createObjectURL(file);
  setUrl(next);
  return()=>URL.revokeObjectURL(next);
 },[file,forAnswer]);

 async function start(){
  if(disabled||starting.current||recording||saving)return;
  starting.current=true;setRequesting(true);setError('');
  try{
   if(!window.isSecureContext)throw new Error('El micrófono requiere una conexión segura.');
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('Este navegador no permite grabar aquí.');
   const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));
   if(!mime)throw new Error('No encontramos un formato de grabación compatible.');
   const next=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!alive.current){next.getTracks().forEach(track=>track.stop());return;}
   stream.current=next;
   const chunks:Blob[]=[];
   const rec=new MediaRecorder(next,{mimeType:mime});
   recorder.current=rec;
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   let interrupted=false;
   rec.onstop=()=>{
    clearTimeout(limit.current);
    next.getTracks().forEach(track=>track.stop());
    if(!alive.current)return;
    const blob=new Blob(chunks,{type:mime.split(';')[0]});
    if(!interrupted&&blob.size){
     const captured=new File([blob],`nota-de-voz-${Date.now()}.${mime.includes('mp4')?'m4a':'webm'}`,{type:blob.type});
     setFile(captured);
     if(forAnswer)void save(captured);
    }else if(!interrupted)setError('No se capturó audio. Vuelve a intentarlo.');
    setRecording(false);
   };
   rec.onerror=()=>{
    if(!alive.current)return;
    interrupted=true;
    setError('La grabación se interrumpió. Vuelve a intentarlo.');
    if(rec.state==='recording')rec.stop();
   };
   rec.start(1000);
   setRecording(true);
   limit.current=setTimeout(()=>{if(rec.state==='recording')rec.stop();},90_000);
  }catch(e){
   stream.current?.getTracks().forEach(track=>track.stop());
   if(alive.current)setError((e as Error).name==='NotAllowedError'?'Dale permiso al micrófono para grabar.':(e as Error).message);
  }finally{
   starting.current=false;
   if(alive.current)setRequesting(false);
  }
 }

 async function save(recorded=file){
  if(!recorded||disabled||saving)return;
  setSaving(true);setError('');
  try{if(await onSave(recorded)&&alive.current)setFile(null);}
  catch(e){if(alive.current)setError((e as Error).message);}
  finally{if(alive.current)setSaving(false);}
 }

 function stop(){
  if(recorder.current?.state==='recording')recorder.current.stop();
 }

 if(forAnswer){
  const label=requesting?'Activando micrófono…':recording?'Detener y adjuntar':saving?'Adjuntando…':file?'Reintentar audio':attached?'Volver a grabar':'Grabar audio';
  return <div className="answer-audio">
   <PearlButton compact subtle className="answer-audio-button" disabled={requesting||saving||(!recording&&disabled)} onClick={()=>{if(recording)stop();else if(file)void save();else void start();}}>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
     {recording?<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>:<><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-3 0h6"/></>}
    </svg>
    {label}
   </PearlButton>
   {attached&&!pending&&!file&&!error&&<small role="status">Audio adjunto</small>}
   {error&&<small role="alert">{error}</small>}
  </div>;
 }

 return <section className="offer-audio" aria-label="Contar por audio">
  <p>Cuéntalo a tu manera · hasta 90 segundos</p>
  {recording?<><p role="status">Grabando · se detendrá a los 90 segundos</p>
   <PearlButton compact onClick={stop}>Detener y escuchar</PearlButton>
  </>:file?<><audio controls src={url} aria-label="Escuchar mi grabación"/>
   <div className="audio-capture-actions">
    <PearlButton compact disabled={disabled||saving} onClick={()=>void save()}>{saving?'Subiendo audio…':'Guardar este audio'}</PearlButton>
    <PearlButton compact subtle disabled={saving} onClick={()=>{setFile(null);setError('');}}>Descartar grabación</PearlButton>
   </div>
  </>:<PearlButton compact disabled={disabled||requesting} onClick={()=>void start()}>{requesting?'Esperando permiso…':'Grabar audio'}</PearlButton>}
  {error&&<p role="alert">{error}</p>}
 </section>;
}
