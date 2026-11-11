import {useState} from 'react';
import { Input, ButtonSecondary } from '../../components/ui/DesignSystem';
import type { DishOption } from './orderOptions';
export default function DishOptionsEditor({ title, help, options = [], onChange }: { title: string; help: string; options?: DishOption[]; onChange: (options: DishOption[]) => void }) {
 const [selected,setSelected]=useState<string|null>(null),[field,setField]=useState<'name'|'price'|'available'>('name'),[error,setError]=useState('');
 const option=options.find(item=>item.id===selected);
 const patch=(value:Partial<DishOption>)=>{if(option)onChange(options.map(item=>item.id===option.id?{...item,...value}:item));setError('');};
 function next(){if(!option)return;if(field==='name'&&!option.name.trim()){setError('Escribe un nombre para reconocer esta opción.');return;}if(field==='price'&&(!Number.isFinite(option.price)||option.price<0||option.price>1000000)){setError('Confirma un precio válido. Si no tiene costo, escribe 0.');return;}if(field==='available')setSelected(null);else setField(field==='name'?'price':'available');}
 return <details className="restaurant-options"><summary>{title}{options.length?` (${options.length})`:''}</summary><p>{help}</p>
 {option?<section className="restaurant-option-step" aria-label={`Editar ${title.toLowerCase()}`}><p>{field==='name'?'¿Cómo se llama esta opción?':field==='price'?'¿Cuál es su precio?':'¿Está disponible para pedir?'}</p>
 {field==='name'&&<Input label="Nombre de la opción" required maxLength={100} value={option.name} onChange={event=>patch({name:event.target.value})}/>}
 {field==='price'&&<Input label="Precio de la opción (S/)" type="number" required min="0" max="1000000" step="0.01" value={Number.isFinite(option.price)?option.price:''} onChange={event=>patch({price:event.target.valueAsNumber})}/>}
 {field==='available'&&<label><input type="checkbox" checked={option.available} onChange={event=>patch({available:event.target.checked})}/> Disponible para pedir</label>}
 {error&&<p role="alert">{error}</p>}<div className="tk-toolbar">{field!=='name'&&<ButtonSecondary type="button" onClick={()=>{setField(field==='available'?'price':'name');setError('');}}>← Atrás</ButtonSecondary>}<ButtonSecondary type="button" onClick={next}>{field==='available'?'Listo':'Continuar →'}</ButtonSecondary><ButtonSecondary type="button" onClick={()=>{onChange(options.filter(item=>item.id!==option.id));setSelected(null);setError('');}}>Quitar esta opción</ButtonSecondary></div></section>:<>{options.map(item=><ButtonSecondary type="button" key={item.id} onClick={()=>{setSelected(item.id);setField('name');setError('');}}>{item.name||'Opción pendiente'} · {Number.isFinite(item.price)?`S/ ${item.price.toFixed(2)}`:'Precio pendiente'}{item.available?'':' · No disponible'} →</ButtonSecondary>)}<ButtonSecondary type="button" disabled={options.length>=20} onClick={()=>{const id=crypto.randomUUID();onChange([...options,{id,name:'',price:Number.NaN,available:true}]);setSelected(id);setField('name');setError('');}}>Agregar {title.toLowerCase()}</ButtonSecondary></>}
 </details>;
}
