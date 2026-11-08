import {useEffect,useRef,useState} from 'react';
import PearlButton from '../components/ui/PearlButton';
import {mediaReference,privateMediaPath} from '../components/shared/mediaReference';
import type {ContentVoice} from '../components/shared/contentModel';
import AudioCapture from '../experience/AudioCapture';
import {randomId} from '../lib/randomId';
import {supabase} from '../lib/supabaseClient';
import {transcribe} from '../toolkit/api';
import {prepareCaptionAudio} from '../toolkit/captionAudio';
import '../experience/answerAudio.css';

const audioExtensions:Record<string,string>={'audio/mpeg':'mp3','audio/mp3':'mp3','audio/wav':'wav','audio/x-wav':'wav','audio/mp4':'m4a','audio/m4a':'m4a','audio/x-m4a':'m4a','audio/webm':'webm'};
const audioContentTypes:Record<string,string>={mp3:'audio/mpeg',wav:'audio/wav',m4a:'audio/mp4',webm:'audio/webm'};

export default function StudioVoice({user,project,voice,onVoice,onText,onPendingChange,textCapacity}:{
 user:string;project:string;voice?:ContentVoice;onVoice:(value:ContentVoice|undefined)=>void;
 onText:(value:string)=>void;onPendingChange:(value:boolean)=>void;textCapacity:number;
}){
 const [pending,setPending]=useState(false),[recording,setRecording]=useState(false);
 const [message,setMessage]=useState(''),[error,setError]=useState(''),[text,setText]=useState('');
 const input=useRef<File|null>(null),lock=useRef(false),alive=useRef(true);
 const decode=useRef<AbortController|null>(null);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;decode.current?.abort();onPendingChange(false);};},[onPendingChange]);
 useEffect(()=>{onPendingChange(pending||recording);},[onPendingChange,pending,recording]);
 let path:string|null=null;
 try{if(voice)path=privateMediaPath(mediaReference(voice.path),user,project);}catch{/* An invalid saved reference must never be downloaded. */}

 async function upload(file:File){
  if(lock.current)return false;
  const extension=audioExtensions[file.type.split(';')[0]];
  if(!extension||file.size>20*1024*1024){setError('Elige un audio MP3, WAV, M4A o WebM de hasta 20 MB.');return false;}
  if(!supabase){setError('La conexión para guardar el audio no está disponible.');return false;}
  lock.current=true;setPending(true);setError('');setMessage('Guardando tu audio…');
  try{
   const target=`${user}/${project}/${randomId()}.${extension}`;
   const {error}=await supabase.storage.from('user-uploads').upload(target,file,{contentType:audioContentTypes[extension],upsert:false});
   if(error)throw new Error('No se pudo guardar el audio. Revisa la conexión y vuelve a intentar.');
   if(!alive.current)return false;
   input.current=file;setText('');onVoice({path:target,name:file.name.slice(0,200)});return true;
  }catch(e){if(alive.current)setError((e as Error).message);return false;}
  finally{lock.current=false;if(alive.current){setPending(false);setMessage('');}}
 }

 async function readVoice(){
  if(!path||!voice||lock.current||!supabase)return;
  lock.current=true;setPending(true);setError('');setMessage('Preparando tu audio…');
  const controller=new AbortController();decode.current=controller;
  try{
   let file=input.current;
   if(!file){
    const {data,error}=await supabase.storage.from('user-uploads').download(path);
    if(error||!data)throw new Error('No pudimos abrir tu audio guardado.');
    file=new File([data],voice.name,{type:data.type});
    input.current=file;
   }
   const wav=await prepareCaptionAudio(file,{signal:controller.signal});
   if(!alive.current)return;
   setMessage('Transcribiendo tu audio…');
   const segments=await transcribe(wav,project,{explicitProject:true});
   if(!alive.current)return;
   const result=segments.map(segment=>segment.text).join(' ').trim();
   if(!result)throw new Error('No encontramos palabras en este audio.');
   setText(result);
  }catch(e){if(alive.current)setError((e as Error).message);}
  finally{lock.current=false;if(alive.current){setPending(false);setMessage('');}}
 }

 return <div>
  <AudioCapture disabled={pending} onSave={upload} onPendingChange={setRecording}/>
  <label>Adjuntar un audio<input type="file" accept="audio/*,.m4a" disabled={pending||recording} onChange={event=>{
   const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(file)void upload(file);
  }}/></label>
  {path&&<div className="studio-idea-actions">
   <small>Audio guardado · {voice?.name}</small>
   {!text&&<PearlButton tone="neutral" compact disabled={pending||recording} onClick={()=>void readVoice()}>Transcribir audio</PearlButton>}
   <PearlButton tone="neutral" compact disabled={pending||recording} onClick={()=>{input.current=null;setText('');setError('');onVoice(undefined);}}>Quitar audio</PearlButton>
  </div>}
  {message&&<p role="status">{message}</p>}
  {error&&<p role="alert">{error} Puedes seguir con tu texto.</p>}
  {text&&<div className="studio-idea-writing">
   <label>Revisa la transcripción<textarea rows={5} value={text} onChange={event=>setText(event.target.value)}/></label>
   {text.trim().length>textCapacity&&<small>Acorta la transcripción para añadirla al texto.</small>}
   <PearlButton compact disabled={pending||recording||!text.trim()||text.trim().length>textCapacity} onClick={()=>onText(text.trim())}>Añadir al texto</PearlButton>
  </div>}
 </div>;
}
