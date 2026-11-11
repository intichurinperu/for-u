import LocationSectionEditor from './LocationSectionEditor';
import {useState} from 'react';
import {ButtonPrimary,ButtonSecondary,Input,Textarea} from '../components/ui/DesignSystem';
import FaqSectionEditor from './FaqSectionEditor';
import {sectionKind,sectionLayout} from './sectionComposition';
import type {LandingBlock} from './types';

/** Keep the historical body string; edit one item/question, with no copied document. */
export default function SectionContentEditor({block,disabled,onChange,onContactChange,onPending}:{block:LandingBlock;disabled:boolean;onChange:(body:string)=>void;onContactChange?:(next:LandingBlock)=>void;onPending?:(value:boolean)=>void}){
 const [error,setError]=useState('');
 const kind=sectionKind(block),layout=sectionLayout(block);
 function commit(body:string){if(body.length>2000){setError('Esta sección admite hasta 2000 caracteres. Acorta un elemento para continuar.');return;}setError('');onChange(body);}
 return <>{kind==='location'&&onContactChange?<LocationSectionEditor block={block} disabled={disabled} onChange={onContactChange} onPending={onPending}/>:kind==='faq'?<FaqSectionEditor body={block.body} disabled={disabled} onChange={commit}/>:layout!=='prose'?<ListContent key={block.id} body={block.body} disabled={disabled} layout={layout} onChange={commit}/>:<Textarea label={kind==='story'?(/^quién enseña$/i.test(block.title.trim())?'¿Quién acompañará el aprendizaje?':'¿Cómo empezó tu negocio?'):kind==='location'?'¿Dónde y cuándo pueden encontrarte?':'¿Qué quieres contar aquí?'} value={block.body} disabled={disabled} maxLength={2000} onChange={event=>commit(event.target.value)}/>} {error&&<p role="alert">{error}</p>}</>;
}
function ListContent({body,disabled,layout,onChange}:{body:string;disabled:boolean;layout:'steps'|'features'|'quotes';onChange:(body:string)=>void}){
 const rows=body?body.split(/\r?\n/):[];
 const [active,setActive]=useState<number|null>(rows.length?null:0);
 const name=layout==='steps'?'paso':layout==='features'?'elemento':'testimonio';
 const label=layout==='steps'?'¿Qué hará la persona en este paso?':layout==='features'?'¿Qué incluye esta parte?':'¿Qué testimonio real quieres compartir?';
 function edit(value:string){const next=[...rows];while(next.length<=(active??0))next.push('');next[active??0]=value.replace(/[\r\n]+/g,' ');onChange(next.join('\n'));}
 if(active!==null)return <div className="section-content-item"><ButtonSecondary disabled={disabled} onClick={()=>setActive(null)}>Ver todos</ButtonSecondary><p>{layout==='quotes'?'Usa solo palabras y autoría confirmadas, con permiso para publicarlas.':'Un elemento por vez. Verás el resultado en tu página.'}</p><Input label={label} value={rows[active]||''} disabled={disabled} maxLength={2000} onChange={event=>edit(event.target.value)}/><ButtonPrimary disabled={disabled||!rows[active]?.trim()} onClick={()=>setActive(null)}>Listo</ButtonPrimary>{rows[active]!==undefined&&<details><summary>Otras opciones</summary><ButtonSecondary disabled={disabled} onClick={()=>{onChange(rows.filter((_,index)=>index!==active).join('\n'));setActive(null);}}>Quitar este {name}</ButtonSecondary></details>}</div>;
 return <div className="section-content-list"><p>{layout==='steps'?'Cada paso aparece en orden.':layout==='features'?'Cada elemento tendrá su propia tarjeta.':'Solo se mostrarán los testimonios que escribas.'}</p>{rows.map((row,index)=><button type="button" key={index} disabled={disabled} onClick={()=>setActive(index)}><span>{layout==='steps'?String(index+1).padStart(2,'0'):layout==='features'?'✓':'“'}</span><strong>{row.trim()||`Completar ${name}`}</strong><span aria-hidden="true">→</span></button>)}<ButtonPrimary disabled={disabled||rows.length>=20} onClick={()=>setActive(rows.length)}>Añadir {name}</ButtonPrimary>{rows.length>=20&&<p>Puedes editar los elementos existentes. Esta composición admite hasta veinte.</p>}</div>;
}
