import {useEffect,useRef,useState} from 'react';
import {ButtonPrimary,ButtonSecondary,Input,Textarea} from '../components/ui/DesignSystem';
import {initialLocationDetails,updateLocationDetails,type LocationDetails} from './locationSection';
import type {LandingBlock} from './types';
type Field=Exclude<keyof LocationDetails,'version'>;
const fields:{id:Field;title:string;question:string;icon:string;hint:string;limit:number}[]=[
 {id:'address',title:'Dónde encontrarte',question:'¿Dónde pueden encontrarte?',icon:'⌖',hint:'Escribe solo la dirección que quieras mostrar públicamente.',limit:400},
 {id:'hours',title:'Cuándo atiendes',question:'¿Cuándo pueden visitarte o escribirte?',icon:'◷',hint:'Indica días y horas confirmados. Este horario es informativo; no controla reservas ni pedidos.',limit:600},
 {id:'mapUrl',title:'Enlace de ubicación',question:'¿Qué enlace abre tu ubicación?',icon:'↗',hint:'Pega un enlace HTTPS. El mapa se abrirá solo cuando alguien lo pulse; no cargamos mapas externos al visitar tu página.',limit:1000},
 {id:'note',title:'Una indicación más',question:'¿Qué más deberían saber para encontrarte?',icon:'≋',hint:'Es opcional. Conservamos aquí el texto que ya tenías en esta sección.',limit:2000}
];
export default function LocationSectionEditor({block,disabled,onChange,onPending}:{block:LandingBlock;disabled:boolean;onChange:(next:LandingBlock)=>void;onPending?:(value:boolean)=>void}){
 const [active,setActive]=useState<Field|null>(null),[value,setValue]=useState(''),[error,setError]=useState('');const details=initialLocationDetails(block),field=fields.find(row=>row.id===active);
 const question=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{if(active)question.current?.focus({preventScroll:true});},[active]);
 useEffect(()=>{onPending?.(Boolean(active&&value!==details[active]));},[active,value,details.address,details.hours,details.mapUrl,details.note,onPending]);
 useEffect(()=>()=>onPending?.(false),[onPending]);
 function select(id:Field){setValue(details[id]);setError('');setActive(id);}
 function apply(){if(!active)return;try{onChange(updateLocationDetails(block,active,value));setActive(null);setError('');}catch(error){setError((error as Error).message);}}
 if(!field)return <div className="section-content-list"><p>Elige qué quieres preparar. Cada dato tendrá su lugar en la página.</p>{fields.map(row=><button type="button" key={row.id} disabled={disabled} onClick={()=>select(row.id)}><span aria-hidden="true">{row.icon}</span><strong>{row.title}<small className="location-editor-preview">{details[row.id]||'Lo definiré después'}</small></strong><span aria-hidden="true">→</span></button>)}</div>;
 return <div className="section-content-item"><ButtonSecondary disabled={disabled} onClick={()=>{setActive(null);setError('');}}>{value!==details[field.id]?'Cancelar este cambio':'← Ver opciones'}</ButtonSecondary><h3 ref={question} tabIndex={-1}>{field.question}</h3><p>{field.hint}</p>{field.id==='address'||field.id==='mapUrl'?<Input label={field.id==='address'?'Dirección pública':'Enlace HTTPS de ubicación'} type={field.id==='mapUrl'?'url':'text'} disabled={disabled} value={value} maxLength={field.limit} onChange={event=>setValue(event.target.value)}/>:<Textarea label={field.id==='hours'?'Horario de atención':'Indicación adicional'} disabled={disabled} value={value} maxLength={field.limit} onChange={event=>setValue(event.target.value)}/>}<ButtonPrimary disabled={disabled} onClick={apply}>Aplicar a mi página</ButtonPrimary>{error&&<p role="alert">{error}</p>}</div>;
}
