import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ButtonPrimary} from '../components/ui/DesignSystem';
import './prompterGuide.css';
type Stage='prepare'|'rehearse'|'record'|'review';
const guides:Record<Stage,{title:string;text:string;target:string}[]>={
 prepare:[
  {title:'¿Para qué sirve el teleprompter?',text:'Te muestra tus palabras cerca de la cámara para que puedas hablar sin memorizar. Primero preparas, luego practicas o grabas.',target:'.prompter-workshop h1'},
  {title:'Estas son tus palabras',text:'Revisa este guion y cámbialo como lo dirías tú. FOR U puede proponerte una versión; tú decides si usarla.',target:'.prompter-prepare textarea'},
  {title:'Elige cómo empezar',text:'Ensayar sin cámara mueve el texto para practicar. Ir a grabar abre tu encuadre; después tú activas cámara y micrófono.',target:'.prompter-entry-actions'},
 ],
 rehearse:[
  {title:'Practica a tu ritmo',text:'Pulsa Reproducir y lee en voz alta. Puedes pausar cuando quieras. Aquí la cámara está apagada.',target:'.prompter-reading-controls button'},
  {title:'Encuentra tu velocidad',text:'Mueve este control hasta que el texto siga tu ritmo. El tamaño de letra está en Ajustar mi lectura.',target:'.prompter-reading-controls label'},
  {title:'Cuando quieras, pasa a cámara',text:'Preparar grabación abre el marco. Aún no empieza a grabar ni pide permisos.',target:'.prompter-next'},
 ],
 record:[
  {title:'Tú enciendes la cámara',text:'Pulsa Activar cámara y micrófono y permite el acceso. Podrás revisar tu encuadre antes de grabar.',target:'.prompter-record-action'},
  {title:'Revisa qué entra en el video',text:'El marco muestra el recorte del tamaño elegido arriba. El texto te guía, pero no aparece en la grabación.',target:'.prompter-record-frame'},
  {title:'Graba cuando quieras',text:'Al pulsar Grabar tendrás una cuenta de tres segundos. Al terminar podrás revisar la toma o repetir; la anterior se conserva hasta guardar la nueva.',target:'.prompter-record-action'},
 ],
 review:[
  {title:'Escucha y revisa tu toma',text:'Reproduce el video. Si quieres repetir, pulsa Volver a grabar; tu toma anterior seguirá disponible.',target:'.prompter-review-video'},
  {title:'Guarda lo que te gusta',text:'Guardar esta toma la vincula a tu contenido. Después puedes elegir portada y seguir con recorte y subtítulos.',target:'.prompter-workshop .piece-file-save'},
 ],
};
export default function PrompterGuide({stage,user,project,disabled}:{stage:Stage;user:string;project:string;disabled:boolean}){
 const key=`foru:prompter-guide:v1:${user}:${project}`;
 const [seen,setSeen]=useState<Stage[]>(()=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter((v):v is Stage=>Object.hasOwn(guides,v)):[];}catch{return [];}}),[index,setIndex]=useState(0),[replay,setReplay]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null),opener=useRef<HTMLButtonElement>(null);
 const open=!disabled&&(replay||!seen.includes(stage)),step=guides[stage][Math.min(index,guides[stage].length-1)];
 function store(value:Stage[]){setSeen(value);try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
 function close(all=false){store(all?['prepare','rehearse','record','review']:[...new Set([...seen,stage])]);setReplay(false);setIndex(0);opener.current?.focus({preventScroll:true});}
 useEffect(()=>{setIndex(0);setReplay(false);},[stage]);
 useEffect(()=>{if(!open)return;const node=document.querySelector<HTMLElement>(step.target);node?.classList.add('prompter-guide-target');node?.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});heading.current?.focus({preventScroll:true});const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')close(true);};document.addEventListener('keydown',escape);return()=>{node?.classList.remove('prompter-guide-target');document.removeEventListener('keydown',escape);};},[open,index,stage]);
 return <><button type="button" ref={opener} className="prompter-guide-launch" disabled={disabled} onClick={()=>{setIndex(0);setReplay(true);}}>ⓘ Ver guía</button>{open&&createPortal(<aside role="dialog" aria-modal="false" aria-labelledby="prompter-guide-title" className="prompter-guide-card"><div className="prompter-guide-progress"><span>GUÍA FOR U · {index+1}/{guides[stage].length}</span><button type="button" aria-label="Omitir guía" onClick={()=>close(true)}>×</button></div><h2 id="prompter-guide-title" ref={heading} tabIndex={-1}>{step.title}</h2><p>{step.text}</p><div className="prompter-guide-actions"><button type="button" onClick={()=>close(true)}>Omitir guía</button><ButtonPrimary onClick={()=>index<guides[stage].length-1?setIndex(index+1):close()}>{index<guides[stage].length-1?'Siguiente →':'Entendido'}</ButtonPrimary></div></aside>,document.body)}</>;
}
