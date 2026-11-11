import {useDialogFocus} from '../toolkit/useDialogFocus';
import {useEffect,useRef,useState} from 'react';
import Logo from '../components/Logo';
export default function BrandWelcome(){
 const [open,setOpen]=useState(()=>{try{return !sessionStorage.getItem('foru-welcome-seen-v1');}catch{return false;}}),[failed,setFailed]=useState(false),[sound,setSound]=useState(false),[closing,setClosing]=useState(false);const video=useRef<HTMLVideoElement>(null);const dialog=useRef<HTMLDivElement>(null);
 function close(){try{sessionStorage.setItem('foru-welcome-seen-v1','1');}catch{}video.current?.pause();setClosing(true);}
 useDialogFocus(dialog,open,close);
 useEffect(()=>{if(!closing)return;const timer=setTimeout(()=>setOpen(false),250);return()=>clearTimeout(timer);},[closing]);
 useEffect(()=>{if(!open)return;const media=matchMedia('(prefers-reduced-motion: reduce)');if(media.matches){close();return;}const changed=()=>{if(media.matches)close();};media.addEventListener('change',changed);const timer=setTimeout(close,10000);return()=>{clearTimeout(timer);media.removeEventListener('change',changed);};},[open]);
 if(!open)return null;
 return <div ref={dialog} className={`brand-welcome ${closing?'is-closing':''}`} role="dialog" aria-modal="true" aria-label="Bienvenida a FOR U" onKeyDown={e=>{if(e.key==='Escape')close();}}>{failed?<Logo/>:<video ref={video} src="/brand/foru-welcome.mp4" autoPlay playsInline muted={!sound} onEnded={close} onError={()=>setFailed(true)}/>}<div><button autoFocus onClick={close}>Entrar a mi espacio →</button>{!failed&&<button onClick={()=>setSound(v=>!v)}>{sound?'Silenciar':'Activar sonido'}</button>}</div></div>;
}
