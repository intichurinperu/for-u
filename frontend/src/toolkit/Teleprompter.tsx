import {Camera, Circle, Minus, Plus, Settings2} from 'lucide-react';
import PearlButton from '../components/ui/PearlButton';
import PrompterGuide from './PrompterGuide';
import {useEffect,useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {linkedPieceQuery,studioReturn} from '../studio/navigation';
import SavePieceFile from '../social/SavePieceFile';
import {getPiece,changePiece} from '../social/model';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import {ButtonPrimary,ButtonSecondary,Textarea,Input} from '../components/ui/DesignSystem';
import {useToolkit} from './ToolkitContext';
import {sectionContext} from './sectionContext';
import {downloadBlob} from './api';
import {recordingMime} from './media';
import {scriptLines} from './reading';
import {hasLiveSpeech,startLiveCaptions} from './speech';
import {recordingFrames,recordingCrop,type RecordingRatio} from './prompterFrame';
import {beginMagic,finishMagic} from '../experience/magicTransition';
import PrompterScriptAssist from './PrompterScriptAssist';
import type {Segment} from './engine';
import './teleprompter.css';
type Moment='prepare'|'rehearse'|'record'|'review';
type Take={file:File;captions:Segment[];ratio:RecordingRatio;saved:boolean};
export default function Teleprompter({initialScript,onEdit}:{initialScript:string;onEdit:(file:File,captions:Segment[])=>void}){
 const {docs,save,track,projectId,userId}=useToolkit(),[params]=useSearchParams();
 const pieceId=params.get('piece'),section=sectionContext(docs.landing,params.get('section'));
 const returnTarget=studioReturn(params,null,projectId,pieceId?'profile':'library');
 let pieceContext:ReturnType<typeof getPiece>|undefined,pieceError='';try{if(pieceId)pieceContext=getPiece(docs['module-social-profile'],projectId,pieceId,userId);}catch(e){pieceError=(e as Error).message;}
 const scriptKey=section?`script-section-${section.id}`:'script';
 const [script,setScript]=useState(pieceContext?pieceContext.piece.script||pieceContext.piece.text:initialScript||String(docs[scriptKey]||(section?[section.title,section.body].join('\n\n'):'')));
 const [handoff,setHandoff]=useState<Take|null>(null);
 const [moment,setMoment]=useState<Moment>('record'),[scriptDirty,setScriptDirty]=useState(false),[speed,setSpeed]=useState(()=>Math.max(8,Math.min(70,Number(docs.readingSpeed)||28))),[fontSize,setFontSize]=useState(32),[playing,setPlaying]=useState(false),[ratio,setRatio]=useState<RecordingRatio>('vertical'),[focus,setFocus]=useState(.5),[mirror,setMirror]=useState(true),[autoPause,setAutoPause]=useState(false),[quiet,setQuiet]=useState(false),[liveCaptions,setLiveCaptions]=useState(false),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[recording,setRecording]=useState(false),[countdown,setCountdown]=useState<number|null>(null),[elapsed,setElapsed]=useState(0),[take,setTake]=useState<Take|null>(null),[previousTake,setPreviousTake]=useState<Take|null>(null),[clipUrl,setClipUrl]=useState(''),[cover,setCover]=useState<File|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const alive=useRef(true),lock=useRef(false),video=useRef<HTMLVideoElement>(null),reviewVideo=useRef<HTMLVideoElement>(null),text=useRef<HTMLDivElement>(null),stream=useRef<MediaStream|null>(null),recorder=useRef<MediaRecorder|null>(null),renderStream=useRef<MediaStream|null>(null),drawFrame=useRef(0),countTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),started=useRef(0),stopSpeech=useRef<(()=>void)|null>(null),captions=useRef<Segment[]>([]);
 const lines=scriptLines(script),frame=recordingFrames[take&&moment==='review'?take.ratio:ratio];
 useUnsavedNavigation(!handoff&&(scriptDirty||recording||countdown!==null||!!take&&!take.saved||!!previousTake&&!previousTake.saved||busy));
 useEffect(()=>{if(!handoff)return;try{onEdit(handoff.file,handoff.captions);}catch(e){setHandoff(null);setError((e as Error).message);}},[handoff]);
 function releaseCamera(){stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;if(alive.current)setReady(false);}
 function stopReading(){setPlaying(false);if(text.current)text.current.scrollTop=0;}
 useEffect(()=>{alive.current=true;finishMagic();return()=>{alive.current=false;clearTimeout(countTimer.current);cancelAnimationFrame(drawFrame.current);stopSpeech.current?.();if(recorder.current?.state==='recording')recorder.current.stop();stream.current?.getTracks().forEach(track=>track.stop());renderStream.current?.getTracks().forEach(track=>track.stop());};},[]);
 useEffect(()=>{if(!take){setClipUrl('');return;}const url=URL.createObjectURL(take.file);setClipUrl(url);return()=>URL.revokeObjectURL(url);},[take?.file]);
 useEffect(()=>{if(ready&&moment==='record'&&video.current&&stream.current){video.current.srcObject=stream.current;void video.current.play().catch(()=>setError('Toca la vista previa para iniciar la cámara.'));}},[ready,moment]);
 useEffect(()=>{if(!playing||autoPause&&quiet)return;let frameId=0,last=0;const tick=(now:number)=>{if(text.current&&last){text.current.scrollTop+=speed*Math.min(.05,(now-last)/1000);if(text.current.scrollTop>=text.current.scrollHeight-text.current.clientHeight-1){setPlaying(false);return;}}last=now;frameId=requestAnimationFrame(tick);};frameId=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frameId);},[playing,speed,quiet,autoPause,moment]);
 useEffect(()=>{if(!recording)return;const timer=setInterval(()=>setElapsed(Math.floor((Date.now()-started.current)/1000)),500);return()=>clearInterval(timer);},[recording]);
 useEffect(()=>{if(!ready||!autoPause||!stream.current){setQuiet(false);return;}const context=new AudioContext(),source=context.createMediaStreamSource(stream.current),analyser=context.createAnalyser();source.connect(analyser);analyser.fftSize=2048;const samples=new Float32Array(analyser.fftSize);let lastVoice=Date.now();void context.resume();const timer=setInterval(()=>{analyser.getFloatTimeDomainData(samples);const rms=Math.sqrt(samples.reduce((sum,v)=>sum+v*v,0)/samples.length);if(rms>.025)lastVoice=Date.now();setQuiet(Date.now()-lastVoice>1600);},150);return()=>{clearInterval(timer);source.disconnect();void context.close();};},[ready,autoPause]);
 function move(next:Moment){if(recording||busy||countdown!==null)return;stopReading();if(next!=='record')releaseCamera();setMoment(next);setError('');const magic=beginMagic(next==='rehearse'?'Tu voz, a tu ritmo…':'Preparando tu espacio…');requestAnimationFrame(()=>finishMagic(magic));}
 async function saveScript(){if(lock.current)return false;lock.current=true;setBusy(true);setError('');try{if(pieceId){if(!pieceContext)throw new Error(pieceError||'Esta pieza no está disponible.');await save('module-social-profile',changePiece(pieceContext.document,pieceId,{script}));}else await save(scriptKey,script);setScriptDirty(false);await save('readingSpeed',speed);setNotice('Tu guion está guardado.');return true;}catch(e){setError((e as Error).message);return false;}finally{lock.current=false;if(alive.current)setBusy(false);}}
 async function rehearse(){if(!script.trim()||busy)return;if(scriptDirty&&!await saveScript())return;stopReading();setMoment('rehearse');const magic=beginMagic('Tu voz, a tu ritmo…');requestAnimationFrame(()=>finishMagic(magic));}
 async function directRecord(){if(!script.trim()||busy)return;if(scriptDirty&&!await saveScript())return;move('record');}
 async function enableCamera(){if(busy||ready||recording||countdown!==null)return;setBusy(true);setError('');try{if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('Para grabar desde tu teléfono necesitas el enlace HTTPS de prueba. En esta computadora puedes usar localhost.');if(typeof MediaRecorder==='undefined')throw new Error('Este navegador no permite grabar aquí. Puedes ensayar o adjuntar un video desde el editor.');const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:true});if(!alive.current){next.getTracks().forEach(track=>track.stop());return;}stream.current=next;setReady(true);}catch(e){setError((e as Error).name==='NotAllowedError'?'La cámara o el micrófono no tienen permiso. Puedes seguir ensayando; vuelve a activarlos cuando quieras.':(e as Error).message);}finally{if(alive.current)setBusy(false);}}
 function recordNow(){const feed=video.current;if(!stream.current||!feed)return;setError('');try{
  if(!feed.videoWidth||feed.readyState<2)throw new Error('Espera un momento a que la vista de cámara esté lista.');
  const canvas=document.createElement('canvas');canvas.width=recordingFrames[ratio].width;canvas.height=recordingFrames[ratio].height;
  if(!canvas.captureStream)throw new Error('Este navegador no permite grabar este encuadre. Puedes ensayar y adjuntar una grabación desde tu teléfono.');
  const context=canvas.getContext('2d');if(!context)throw new Error('No se pudo preparar el encuadre.');
  const paint=()=>{if(feed.videoWidth&&feed.videoHeight){const crop=recordingCrop(feed.videoWidth,feed.videoHeight,canvas.width,canvas.height,focus);context.drawImage(feed,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);}drawFrame.current=requestAnimationFrame(paint);};paint();
  const output=new MediaStream([...canvas.captureStream(30).getVideoTracks(),...stream.current.getAudioTracks()]);renderStream.current=output;
  const mime=recordingMime(),next=new MediaRecorder(output,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:2_000_000});const chunks:Blob[]=[];let bytes=0;
  next.ondataavailable=event=>{if(event.data.size){chunks.push(event.data);bytes+=event.data.size;}if(bytes>18*1024*1024&&next.state==='recording'){setNotice('Terminamos esta toma antes de superar el límite de guardado.');next.stop();}};
  next.onstop=()=>{cancelAnimationFrame(drawFrame.current);stopSpeech.current?.();stopSpeech.current=null;output.getTracks().forEach(track=>track.stop());releaseCamera();if(!alive.current)return;const blob=new Blob(chunks,{type:next.mimeType.split(';')[0]});setRecording(false);setPlaying(false);if(!blob.size){setError('No se capturó video. Tu toma anterior se conserva.');setMoment(take?'review':'record');return;}const file=new File([blob],`mi-toma-${recordingFrames[ratio].label.replace(':','x')}.${blob.type.includes('mp4')?'mp4':'webm'}`,{type:blob.type});setTake({file,captions:[...captions.current],ratio,saved:false});setCover(null);setMoment('review');track('video',true,(Date.now()-started.current)/1000,60);};
  next.onerror=()=>{setError('La grabación se interrumpió. Revisa la toma; la anterior se conserva.');if(next.state==='recording')next.stop();};recorder.current=next;captions.current=[];started.current=Date.now();setElapsed(0);if(text.current)text.current.scrollTop=0;next.start(500);setRecording(true);setPlaying(true);
  if(liveCaptions)try{stopSpeech.current=startLiveCaptions(segment=>captions.current.push(segment),setError);}catch(e){setError((e as Error).message);}
 }catch(e){cancelAnimationFrame(drawFrame.current);renderStream.current?.getTracks().forEach(track=>track.stop());releaseCamera();setError((e as Error).message);setRecording(false);}}
 async function startCountdown(){
  if(!ready||recording||countdown!==null||busy||lock.current)return;
  if(scriptDirty&&!await saveScript())return;
  if(!alive.current||!stream.current)return;
  if(take)setPreviousTake(take);setCountdown(3);let remaining=3;const tick=()=>{remaining--;if(!alive.current)return;if(remaining>0){setCountdown(remaining);countTimer.current=setTimeout(tick,1000);}else{setCountdown(null);recordNow();}};countTimer.current=setTimeout(tick,1000);}
 async function chooseCover(){const preview=reviewVideo.current;if(!preview||preview.readyState<2)return;try{const canvas=document.createElement('canvas');canvas.width=preview.videoWidth;canvas.height=preview.videoHeight;const context=canvas.getContext('2d');if(!context)throw new Error('No se pudo preparar la portada.');context.drawImage(preview,0,0);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('No se pudo preparar la portada.')),'image/png'));setCover(new File([blob],'portada-de-mi-toma.png',{type:'image/png'}));}catch(e){setError((e as Error).message);}}
 const back=()=>{if(countdown!==null){clearTimeout(countTimer.current);setCountdown(null);return;}move('record');};
 if(pieceError)return <section role="alert">{pieceError}<Link to={`/creator-studio?project=${projectId}&tab=profile`}>Volver a mi contenido</Link></section>;
 const lockControls=recording||countdown!==null||busy;
 const editScript=(value:string)=>{setScript(value);setScriptDirty(true);setNotice('');};
 const changeSpeed=(amount:number)=>setSpeed(value=>Math.max(8,Math.min(70,value+amount)));
 return <section className={`prompter-workshop${moment==='record'?' prompter-camera-workspace':''}`} aria-busy={busy}>
 {moment!=='record'&&<><header className="prompter-top"><div>{moment==='prepare'?pieceId&&params.get('return')!=='studio-design'&&<Link to={'/creator-studio'+linkedPieceQuery(projectId,pieceId,params)+'&tab=profile'}>← Mi contenido</Link>:<button type="button" disabled={recording||busy} onClick={back}>← Atrás</button>}<small>{moment==='prepare'?'1 · TU GUION':moment==='rehearse'?'2 · ENSAYA':'REVISA TU TOMA'}</small></div><nav aria-label="Proporción de grabación">{(Object.entries(recordingFrames) as [RecordingRatio,typeof recordingFrames[RecordingRatio]][]).map(([id,item])=><button type="button" key={id} aria-label={`Grabar en ${item.label}`} aria-pressed={(moment==='review'?take?.ratio:ratio)===id} disabled={lockControls||moment==='review'} onClick={()=>{setRatio(id);setFocus(.5);}}>{item.label}</button>)}</nav></header><PrompterGuide stage={moment} user={userId} project={projectId} disabled={busy||recording||countdown!==null}/></>}
 {moment==='prepare'&&<div className="prompter-prepare"><h1>Prepara tu guion para grabar.</h1><p>El texto te acompañará cerca de la cámara. Puedes practicar primero o ir directamente a grabar.</p><div className="prompter-entry-actions"><ButtonPrimary disabled={busy||!script.trim()} onClick={()=>void rehearse()}>{busy?'Guardando…':'▷ Ensayar sin cámara'}</ButtonPrimary><ButtonSecondary disabled={busy||!script.trim()} onClick={()=>void directRecord()}>Ir a grabar →</ButtonSecondary></div><Textarea label="Lo que voy a decir" value={script} maxLength={20000} disabled={busy} onChange={e=>{setScript(e.target.value);setScriptDirty(true);setNotice('');}}/><PrompterScriptAssist script={script} disabled={busy} onAccept={value=>{setScript(value);setScriptDirty(true);}}/>{take&&<button className="prompter-quiet" onClick={()=>move('review')}>Revisar mi última toma</button>}</div>}
 {moment==='rehearse'&&<><h1>Encuentra tu ritmo.</h1><p className="prompter-lead">Solo tú y tus palabras. La cámara está apagada.</p><div className="prompter-reading" ref={text} style={{fontSize}} aria-label="Ensayo de tu guion">{lines.map((line,index)=><p key={index}>{line||'\u00a0'}</p>)}<div aria-hidden="true" className="prompter-reading-tail"/></div><div className="prompter-reading-controls"><ButtonPrimary disabled={!script.trim()} onClick={()=>setPlaying(!playing)}>{playing?'Ⅱ Pausar':'▷ Reproducir'}</ButtonPrimary><label>Velocidad<input aria-label="Velocidad de lectura" type="range" min="8" max="70" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/><small>{speed<24?'Con calma':speed<45?'A tu ritmo':'Más ágil'}</small></label></div><details className="prompter-options"><summary>Ajustar mi lectura</summary><label>Tamaño del texto<input aria-label="Tamaño del texto" type="range" min="24" max="58" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}/></label><ButtonSecondary onClick={stopReading}>Volver al inicio del texto</ButtonSecondary></details><footer className="prompter-next"><ButtonPrimary onClick={()=>move('record')}>Preparar grabación →</ButtonPrimary></footer></>}
 {moment==='record'&&<>
  <header className="prompter-top prompter-record-top">
   <div><Link to={returnTarget.path} className="prompter-back-link">← {returnTarget.label}</Link><strong>Graba tu video</strong></div>
   <nav aria-label="Proporción de grabación">{(Object.entries(recordingFrames) as [RecordingRatio,typeof recordingFrames[RecordingRatio]][]).map(([id,item])=><button type="button" key={id} aria-label={`Grabar en ${item.label}`} aria-pressed={ratio===id} disabled={lockControls} onClick={()=>{setRatio(id);setFocus(.5);}}>{item.label}</button>)}</nav>
  </header>
  <div className="prompter-camera-stage">
   <div className="prompter-record-frame" style={{aspectRatio:`${frame.width}/${frame.height}`,width:`min(100%, ${54*frame.width/frame.height}dvh)`}}>
    {ready
     ? <video ref={video} aria-label="Vista previa de tu cámara" autoPlay playsInline muted className={mirror?'is-mirrored':''} style={{objectPosition:`${(mirror?1-focus:focus)*100}% 50%`}}/>
     : <div className="prompter-camera-empty"><Camera size={32} strokeWidth={1.4} aria-hidden="true"/><strong>Tu cámara aparecerá aquí</strong></div>}
    {ready&&script.trim()&&<div className="prompter-camera-script" ref={text} aria-hidden="true" style={{fontSize:`clamp(14px, ${fontSize/4}cqi, ${fontSize}px)`}}>
     {lines.map((line,index)=><p key={index}>{line||'\u00a0'}</p>)}
     <div className="prompter-reading-tail"/>
    </div>}
    {ready&&<div className="prompter-record-badge" aria-label={recording?'Tiempo de grabación':'Cámara lista'}>
     {recording&&<Circle size={8} fill="currentColor" aria-hidden="true"/>}
     {String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}
    </div>}
    {countdown!==null&&<div className="prompter-countdown" role="status">{countdown}</div>}
   </div>
  </div>
  <div className="prompter-record-action">
   {!ready?<PearlButton compact disabled={busy} onClick={()=>void enableCamera()}>{busy?'Abriendo cámara…':'Activar cámara y micrófono'}</PearlButton>
    :recording?<button type="button" className="prompter-stop" onClick={()=>recorder.current?.state==='recording'&&recorder.current.stop()}>Terminar grabación</button>
    :countdown!==null?<PearlButton tone="neutral" compact onClick={()=>{clearTimeout(countTimer.current);setCountdown(null);}}>Cancelar cuenta regresiva</PearlButton>
    :<PearlButton compact disabled={busy} onClick={()=>void startCountdown()}><span className="prompter-record-label"><Circle size={12} fill="currentColor" aria-hidden="true"/>{busy?'Preparando…':'Empezar a grabar'}</span></PearlButton>}
  </div>
  {error&&<p role="alert" className="prompter-message is-error">{error}</p>}
  <div className="prompter-script-controls">
   <Textarea label="Tu guion" placeholder="Escribe aquí lo que quieres decir." value={script} rows={2} maxLength={20000} disabled={lockControls} onChange={event=>editScript(event.target.value)}/>
   <div className="prompter-speed">
    <span>Velocidad</span>
    <div role="group" aria-label="Velocidad de lectura">
     <PearlButton tone="neutral" compact aria-label="Bajar velocidad" disabled={lockControls||speed<=8} onClick={()=>changeSpeed(-7)}><Minus size={16} aria-hidden="true"/></PearlButton>
     <output aria-label="Velocidad actual">{+(speed/28).toFixed(2)}×</output>
     <PearlButton tone="neutral" compact aria-label="Subir velocidad" disabled={lockControls||speed>=70} onClick={()=>changeSpeed(7)}><Plus size={16} aria-hidden="true"/></PearlButton>
    </div>
   </div>
  </div>
  {!lockControls&&<details className="prompter-options prompter-camera-options">
   <summary><Settings2 size={16} aria-hidden="true"/>Opciones de grabación</summary>
   <div className="prompter-format-options" role="group" aria-label="Proporción de grabación">
    {Object.entries(recordingFrames).map(([id,format])=><PearlButton key={id} tone="neutral" compact aria-pressed={ratio===id} onClick={()=>{setRatio(id as RecordingRatio);setFocus(.5);}}>{format.label}</PearlButton>)}
   </div>
   <label>Tamaño del texto<input type="range" min="24" max="58" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}/></label>
   {ready&&<>
    <label>Encuadre horizontal<input type="range" min="0" max="1" step=".01" value={focus} onChange={e=>setFocus(Number(e.target.value))}/></label>
    <label><Input type="checkbox" checked={mirror} onChange={e=>setMirror(e.target.checked)}/> Vista previa como espejo</label>
    <label><Input type="checkbox" checked={autoPause} onChange={e=>setAutoPause(e.target.checked)}/> Pausar lectura cuando deje de hablar</label>
    <label><Input type="checkbox" disabled={!hasLiveSpeech()} checked={liveCaptions} onChange={e=>setLiveCaptions(e.target.checked)}/> Crear subtítulos mientras hablo</label>
    <small>El reconocimiento de voz del navegador procesa audio para crear subtítulos.</small>
    <PearlButton tone="neutral" compact onClick={releaseCamera}>Apagar cámara</PearlButton>
   </>}
   <PearlButton tone="neutral" compact onClick={()=>move('prepare')}>Preparar guion</PearlButton>
   <PearlButton tone="neutral" compact disabled={!script.trim()} onClick={()=>{releaseCamera();void rehearse();}}>Ensayar sin cámara</PearlButton>
   {take&&<PearlButton tone="neutral" compact onClick={()=>move('review')}>Revisar mi última toma</PearlButton>}
  </details>}
  {autoPause&&quiet&&playing&&<p role="status">Texto en pausa. Continúa hablando para avanzar.</p>}
 </>}
 {moment==='review'&&take&&<><h1>Tu toma, a tu manera.</h1><p className="prompter-lead">Reprodúcela antes de elegir. Grabada en {recordingFrames[take.ratio].label} · {take.file.type.includes('mp4')?'MP4':'WebM'}.</p><video key={clipUrl} ref={reviewVideo} src={clipUrl} controls playsInline className="prompter-review-video" style={{aspectRatio:`${frame.width}/${frame.height}`}}/>{pieceId?<SavePieceFile key={clipUrl} file={take.file} user={userId} project={projectId} piece={pieceId} kind="video" label="Guardar esta toma" onSaved={()=>{setTake(value=>value?{...value,saved:true}:value);setPreviousTake(null);}}/>:<ButtonPrimary onClick={()=>{downloadBlob(take.file,take.file.name);setTake({...take,saved:true});setPreviousTake(null);}}>Descargar esta toma</ButtonPrimary>}<div className="prompter-review-actions"><PearlButton compact onClick={()=>setHandoff(take)}>Editar mi video</PearlButton><ButtonSecondary onClick={()=>{setPreviousTake(take);move('record');}}>Volver a grabar</ButtonSecondary>{previousTake&&previousTake.file!==take.file&&<ButtonSecondary onClick={()=>{setTake(previousTake);setPreviousTake(null);setCover(null);}}>Conservar mi toma anterior</ButtonSecondary>}</div>{take.saved&&<section className="prompter-cover"><h2>Elige tu portada.</h2><p>Pausa el video en el momento que prefieras y captura ese fotograma, o vuelve a tu pieza para usar el diseño.</p><ButtonSecondary onClick={()=>void chooseCover()}>Usar este fotograma como portada</ButtonSecondary>{cover&&pieceId&&<SavePieceFile key={cover.name+cover.lastModified} file={cover} user={userId} project={projectId} piece={pieceId} kind="image"/>}{pieceId&&<Link to={'/creator-studio'+linkedPieceQuery(projectId,pieceId,params)+'&tab=profile'}>Volver a mi diseño y portada →</Link>}</section>}<details className="prompter-options"><summary>Descargar original</summary><ButtonSecondary onClick={()=>downloadBlob(take.file,take.file.name)}>Descargar video original</ButtonSecondary><small>Cambiar las proporciones de un video ya grabado requiere revisar y exportar su encuadre. Este archivo mantiene {recordingFrames[take.ratio].label}.</small></details></>}
 {moment!=='record'&&(error||notice)&&<p role={error?'alert':'status'} className={`prompter-message${error?' is-error':''}`}>{error||notice}</p>}
 </section>;
}
