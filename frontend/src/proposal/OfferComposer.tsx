import {useEffect,useRef,useState} from 'react';
import {ButtonPrimary,ButtonSecondary,Input,Textarea} from '../components/ui/DesignSystem';
import ProjectImageField from '../components/shared/ProjectImageField';
import DishOptionsEditor from '../modules/restaurant/DishOptionsEditor';
import {offerPrice,validateOffer,type Offer} from './model';
import EditorDecision from '../toolkit/EditorDecision';
const kinds=[['product','Un producto','Algo que tu cliente compra.'],['service','Un servicio','Tu trabajo, experiencia o acompañamiento.'],['package','Un paquete','Varias cosas reunidas en una oferta.'],['experience','Una experiencia','Una actividad o recorrido.'],['stay','Una estadía','Una opción de alojamiento.'],['course','Un curso','Contenido para aprender.']] as const;
export default function OfferComposer({offer,onChange,onApply,onCancel,busy}:{offer:Offer;onChange:(value:Offer)=>void;onApply:()=>void;onCancel:()=>void;busy:boolean}){
 const [step,setStep]=useState(offer.name?'review':'kind'),[error,setError]=useState('');
 const heading=useRef<HTMLHeadingElement>(null);
 const steps=['kind','name','description','pricing',...(offer.pricing==='fixed'?['price']:[]),'review'];
 const index=steps.indexOf(step);
 const title=({kind:'¿Qué vas a ofrecer?',name:'¿Cómo se llama tu oferta?',description:'¿Qué recibe tu cliente?',pricing:'¿Cómo quieres mostrar su precio?',price:'¿Cuál es el precio confirmado?',review:'Tu oferta está tomando forma.'} as Record<string,string>)[step];
 useEffect(()=>{heading.current?.focus();},[step]);
 const change=(patch:Partial<Offer>)=>{onChange({...offer,...patch});setError('');};
 function next(){if(step==='name'&&!offer.name.trim()){setError('Dale un nombre antes de continuar. No tiene que ser definitivo.');return;}if(step==='price'&&(!Number.isFinite(offer.price)||!offer.price||offer.price>1000000)){setError('Confirma un precio mayor que cero. Para una oferta gratis, vuelve a elegir Gratis.');return;}setStep(steps[index+1]||'review');}
 const choose=(values:{id:string;title:string;hint:string}[],value:string,onSelect:(id:string)=>void)=><div className="pe-decision-choices">{values.map(item=><button type="button" key={item.id} aria-pressed={value===item.id} onClick={()=>onSelect(item.id)}><span aria-hidden="true">{value===item.id?'✓':'◇'}</span><span><strong>{item.title}</strong><small>{item.hint}</small></span></button>)}</div>;
 return <fieldset disabled={busy} className="offer-composer"><small>UN PASO A LA VEZ</small><h3 ref={heading} tabIndex={-1}>{title}</h3>
 {step==='kind'&&choose(kinds.map(([id,title,hint])=>({id,title,hint})),offer.kind,id=>change({kind:id as Offer['kind']}))}
 {step==='name'&&<Input label="Nombre de la oferta" maxLength={120} value={offer.name} onChange={e=>change({name:e.target.value})}/>}
 {step==='description'&&<><p>Cuenta qué incluye, con tus palabras. Puedes completarlo después.</p><Textarea label="Descripción de la oferta" maxLength={2000} value={offer.description} onChange={e=>change({description:e.target.value})}/></>}
 {step==='pricing'&&choose([{id:'quote',title:'Que me consulten',hint:'No mostrar un precio todavía.'},{id:'fixed',title:'Un precio confirmado',hint:'Lo escribirás en el siguiente paso.'},{id:'free',title:'Es gratis',hint:'Confirmo que esta oferta no tiene costo.'}],offer.pricing,id=>change({pricing:id as Offer['pricing'],price:id==='free'?0:id===offer.pricing?offer.price:null}))}
 {step==='price'&&<Input label="Precio confirmado (S/)" type="number" min="0.01" max="1000000" step="0.01" value={offer.price??''} onChange={e=>change({price:e.target.value===''?null:e.target.valueAsNumber})}/>}
 {step==='review'&&<><article className="offer-composer-summary"><strong>{offer.name||'Tu oferta'}</strong><p>{offer.description||'La descripción puede venir después.'}</p><b>{offerPrice(offer)}</b><ButtonSecondary onClick={()=>setStep('kind')}>Revisar lo esencial</ButtonSecondary></article><details className="offer-optional"><summary>Foto, condiciones y opciones · opcional</summary><EditorDecision choices={[
 {id:'conditions',title:'Añadir condiciones',hint:'Opcional: vigencia, requisitos o lo que necesita saber tu cliente.',icon:'≋',content:<Textarea label="Condiciones de esta oferta" value={offer.conditions} maxLength={2000} onChange={e=>change({conditions:e.target.value})}/>},
 {id:'photo',title:'Añadir una foto',hint:'Opcional. Tu oferta también puede empezar sin imágenes.',icon:'▧',content:<ProjectImageField label="Foto de la oferta" value={offer.image} onChange={image=>change({image})}/>},
 ...(offer.kind==='product'?[
 {id:'variants',title:'Presentaciones',hint:'Cada presentación reemplaza el precio base.',icon:'◇',content:<DishOptionsEditor title="Presentaciones" help="Conserva las opciones y precios de tu catálogo." options={offer.variants} onChange={variants=>change({variants})}/>},
 {id:'extras',title:'Extras',hint:'Cada extra se suma por unidad.',icon:'＋',content:<DishOptionsEditor title="Extras" help="Son opcionales al hacer un pedido." options={offer.extras} onChange={extras=>change({extras})}/>}
 ]:[])
 ]}/></details><ButtonPrimary disabled={busy} onClick={()=>{try{validateOffer(offer,true);setError('');onApply();}catch(e){setError((e as Error).message);}}}>{busy?'Guardando…':'Guardar esta oferta'}</ButtonPrimary></>}
 {error&&<p role="alert">{error}</p>}<div className="offer-composer-actions">{index>0&&step!=='review'&&<ButtonSecondary disabled={busy} onClick={()=>setStep(steps[index-1])}>← Atrás</ButtonSecondary>}{step!=='review'&&<ButtonPrimary disabled={busy} onClick={next}>{step==='pricing'&&offer.pricing!=='fixed'?'Revisar mi oferta →':'Continuar →'}</ButtonPrimary>}<ButtonSecondary disabled={busy} onClick={onCancel}>Cancelar edición de oferta</ButtonSecondary></div></fieldset>;
}
