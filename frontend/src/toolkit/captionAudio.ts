import type {AudioReadOptions} from './videoAudio';
import {decodeAudio} from './media';
// Downmix and resample locally: send only mono speech audio, never camera frames.
export function captionWav(channels:Float32Array[],sampleRate:number):ArrayBuffer{
 if(!channels.length||!Number.isFinite(sampleRate)||sampleRate<8000||channels.some(row=>row.length!==channels[0].length))throw new Error('No pudimos leer el audio de esta toma.');
 const duration=channels[0].length/sampleRate;if(duration<.1||duration>180)throw new Error('Los subtítulos automáticos admiten tomas de hasta tres minutos.');
 const count=Math.floor(duration*16000),buffer=new ArrayBuffer(44+count*2),view=new DataView(buffer),tag=(offset:number,text:string)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};
 tag(0,'RIFF');view.setUint32(4,36+count*2,true);tag(8,'WAVE');tag(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);tag(36,'data');view.setUint32(40,count*2,true);
 for(let i=0;i<count;i++){const position=i*sampleRate/16000,index=Math.floor(position),fraction=position-index;let value=0;for(const channel of channels)value+=channel[index]*(1-fraction)+channel[Math.min(index+1,channel.length-1)]*fraction;value=Math.max(-1,Math.min(1,value/channels.length));view.setInt16(44+i*2,Math.round(value*(value<0?32768:32767)),true);}return buffer;
}
export async function prepareCaptionAudio(file:File,options:AudioReadOptions={}){const audio=await decodeAudio(file,options);return new File([captionWav(Array.from({length:audio.numberOfChannels},(_,i)=>audio.getChannelData(i)),audio.sampleRate)],'for-u-voz.wav',{type:'audio/wav'});}
