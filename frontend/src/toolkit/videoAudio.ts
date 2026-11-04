/** Keep the audio track of an MP4/MOV without moving any media bytes or chunk offsets.
 * The caller owns this disposable buffer; the original File is never modified. */
export function isolateMp4Audio(buffer:ArrayBuffer):ArrayBuffer|null {
 const bytes=new Uint8Array(buffer),view=new DataView(buffer);
 type Box={start:number;end:number;header:number;type:string};
 const word=(offset:number)=>String.fromCharCode(...bytes.subarray(offset,offset+4));
 function boxes(start:number,end:number):Box[]{
  const result:Box[]=[];let offset=start;
  while(offset+8<=end&&result.length<10000){let size=view.getUint32(offset),header=8;
   if(size===1){if(offset+16>end)return [];size=view.getUint32(offset+8)*4294967296+view.getUint32(offset+12);header=16;}
   else if(size===0)size=end-offset;
   if(!Number.isSafeInteger(size)||size<header||offset+size>end)return [];
   result.push({start:offset,end:offset+size,header,type:word(offset+4)});offset+=size;
  }
  return offset===end?result:[];
 }
 const root=boxes(0,bytes.length),moov=root.find(box=>box.type==='moov'),ftyp=root.find(box=>box.type==='ftyp');
 if(!moov||!ftyp||root.some(box=>box.type==='moof'))return null;
 const tracks=boxes(moov.start+moov.header,moov.end).filter(box=>box.type==='trak');
 const audio=tracks.find(track=>{const mdia=boxes(track.start+track.header,track.end).find(box=>box.type==='mdia');if(!mdia)return false;const handler=boxes(mdia.start+mdia.header,mdia.end).find(box=>box.type==='hdlr');return !!handler&&handler.start+handler.header+12<=handler.end&&word(handler.start+handler.header+8)==='soun';});
 if(!audio)return null;
 const write=(offset:number,value:string)=>{for(let i=0;i<4;i++)bytes[offset+i]=value.charCodeAt(i);};
 for(const track of tracks)if(track!==audio)write(track.start+4,'free');
 if(ftyp.end-ftyp.start>=16){write(ftyp.start+ftyp.header,'M4A ');for(let offset=ftyp.start+ftyp.header+8;offset+4<=ftyp.end;offset+=4)if(word(offset)==='qt  ')write(offset,'isom');}
 return buffer;
}

export type AudioReadOptions={signal?:AbortSignal;onProgress?:(message:string)=>void;onPlaybackRequired?:(start:()=>void)=>void};
const pcmProcessor=`class ForUPcm extends AudioWorkletProcessor {
 constructor(){super();this.active=false;this.chunk=new Float32Array(4096);this.offset=0;this.port.onmessage=e=>{if(e.data==='finish'){this.active=false;if(this.offset){const tail=this.chunk.slice(0,this.offset);this.port.postMessage(tail,[tail.buffer]);this.offset=0;}this.port.postMessage({done:true});}else this.active=e.data===true;};}
 process(inputs){const channels=inputs[0];if(this.active&&channels&&channels.length){for(let i=0;i<channels[0].length;i++){let value=0;for(const channel of channels)value+=channel[i]||0;this.chunk[this.offset++]=value/channels.length;if(this.offset===4096){this.port.postMessage(this.chunk,[this.chunk.buffer]);this.chunk=new Float32Array(4096);this.offset=0;}}}return true;}
}registerProcessor('foru-pcm',ForUPcm);`;

/** Compatibility path: let the browser's video decoder read its own supported container.
 * This is local, runs in real time, and sends no frames or audio over the network. */
export async function readVideoPcm(file:File,context:AudioContext,options:AudioReadOptions={}):Promise<AudioBuffer>{
 const element=document.createElement('video'),url=URL.createObjectURL(file);
 element.src=url;element.playsInline=true;element.preload='auto';element.setAttribute('playsinline','');
 element.style.cssText='position:fixed;width:1px;height:1px;left:-100px;pointer-events:none;';
 document.body.append(element);
 const source=context.createMediaElementSource(element),monitor=context.createGain();monitor.gain.value=0;monitor.connect(context.destination);
 let processor:AudioWorkletNode|undefined,workletUrl='';
 try{
  if(!context.audioWorklet)throw new Error('Este navegador no permite leer la voz de esta toma. Tu video y tus cortes se conservan.');
  await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>done(new Error('No pudimos abrir el audio. Reintenta con esta misma toma.')),15000);const abort=()=>done(new DOMException('Cancelado','AbortError'));const loaded=()=>done();const error=()=>done(new Error('El teléfono no pudo reproducir esta toma. Tu original se conserva.'));function done(err?:Error){clearTimeout(timer);element.removeEventListener('loadedmetadata',loaded);element.removeEventListener('error',error);options.signal?.removeEventListener('abort',abort);err?reject(err):resolve();}element.addEventListener('loadedmetadata',loaded);element.addEventListener('error',error);options.signal?.addEventListener('abort',abort,{once:true});if(options.signal?.aborted)abort();else if(element.readyState>=1)loaded();});
  const duration=element.duration;
  if(!Number.isFinite(duration)||duration<=0||duration>180)throw new Error('Para leer la voz en este teléfono, usa una toma de hasta tres minutos. Tu original se conserva.');
  workletUrl=URL.createObjectURL(new Blob([pcmProcessor],{type:'text/javascript'}));await context.audioWorklet.addModule(workletUrl);
  processor=new AudioWorkletNode(context,'foru-pcm');source.connect(processor);processor.connect(monitor);
  const chunks:Float32Array[]=[];let count=0;let flushed=()=>{};
  processor.port.onmessage=event=>{if(event.data?.done){flushed();return;}if(count>context.sampleRate*(duration+2))return;const data=event.data as Float32Array;if(data instanceof Float32Array){chunks.push(data);count+=data.length;}};
  await context.resume();
  await new Promise<void>((resolve,reject)=>{let settled=false,waitingForTap=false,started=Date.now();let tick:ReturnType<typeof setInterval>;
   const playing=()=>processor?.port.postMessage(true);
   const abort=()=>finish(new DOMException('Cancelado','AbortError')),ended=()=>finish(),error=()=>finish(new Error('No pudimos terminar de leer la voz. Reintenta con esta misma toma.'));
   function finish(err?:Error){if(settled)return;settled=true;clearInterval(tick);element.removeEventListener('playing',playing);element.removeEventListener('ended',ended);element.removeEventListener('error',error);options.signal?.removeEventListener('abort',abort);processor?.port.postMessage(false);err?reject(err):resolve();}
   element.addEventListener('playing',playing);element.addEventListener('ended',ended);element.addEventListener('error',error);options.signal?.addEventListener('abort',abort,{once:true});
   tick=setInterval(()=>{if(document.hidden)finish(new Error('Mantén esta pestaña abierta mientras leemos la voz. Puedes reintentar sin cambiar tu video.'));else if(!waitingForTap&&Date.now()-started>(duration+20)*1000)error();else if(!waitingForTap)options.onProgress?.(`Leyendo la voz · ${Math.floor(element.currentTime)} de ${Math.ceil(duration)} s`);},500);
   if(options.signal?.aborted){abort();return;}const start=()=>{waitingForTap=false;started=Date.now();void context.resume();void element.play().catch(error=>{if(error?.name==='NotAllowedError'&&options.onPlaybackRequired){waitingForTap=true;options.onPlaybackRequired(start);}else finish(new Error('El teléfono no pudo iniciar la lectura de voz. Tu video y tus cortes se conservan.'));});};start();
  });
  await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('No pudimos completar la lectura del audio. Reintenta.')),2000);flushed=()=>{clearTimeout(timer);resolve();};processor!.port.postMessage('finish');});
  if(!count)throw new Error('No recibimos audio de esta toma. Tu video y tus cortes se conservan.');
  // Keep the source time base, including any silent tail after the decoder ends.
  const length=Math.ceil(duration*context.sampleRate),result=context.createBuffer(1,length,context.sampleRate),channel=result.getChannelData(0);let offset=0;
  for(const chunk of chunks){const keep=Math.min(chunk.length,length-offset);if(keep<=0)break;channel.set(chunk.subarray(0,keep),offset);offset+=keep;}
  return result;
 }finally{element.pause();processor?.disconnect();if(processor)processor.port.onmessage=null;source.disconnect();monitor.disconnect();element.removeAttribute('src');element.load();element.remove();URL.revokeObjectURL(url);if(workletUrl)URL.revokeObjectURL(workletUrl);}
}
