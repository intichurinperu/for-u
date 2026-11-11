import ItineraryEditor from './ItineraryEditor';
import type {ExperienceDetails} from '../proposal/experienceDetails';
import {useEffect,useRef,useState} from 'react';
import {ButtonPrimary,Input,Textarea} from '../components/ui/DesignSystem';
import ProjectImageField from '../components/shared/ProjectImageField';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import {useToolkit} from './ToolkitContext';
import EditorDecision from './EditorDecision';
import {nativeEditableItem,prepareNativeOfferEdit,type NativeEditableData,type NativeEditableType} from './nativeOfferEdit';
const labels={ecommerce:{name:'Producto',price:'Precio por unidad (S/)',description:'Descripción del producto',image:'Foto del producto'},hospitality:{name:'Habitación',price:'Precio por noche (S/)',description:'Comodidades de la habitación',image:'Foto de la habitación'},tourism:{name:'Experiencia',price:'Precio por persona (S/)',description:'Qué incluye la experiencia',image:'Foto de la experiencia'},courses:{name:'Curso',price:'Precio del curso (S/)',description:'Qué aprenderá tu estudiante',image:'Portada del curso'}};
export default function NativeCatalogOfferEditor({type,offerId,onSaved,onPending}:{type:NativeEditableType;offerId:string;onSaved:(data:NativeEditableData,id:string)=>void;onPending:(value:boolean)=>void}){
 const {docs}=useToolkit();let initial:Record<string,unknown>;
 try{initial=nativeEditableItem(type,docs['module-'+type],offerId);}catch(error){return <p role="alert">{(error as Error).message}</p>;}
 return <Session key={type+':'+offerId} type={type} initial={initial} onSaved={onSaved} onPending={onPending}/>;
}
function Session({type,initial,onSaved,onPending}:{type:NativeEditableType;initial:Record<string,unknown>;onSaved:(data:NativeEditableData,id:string)=>void;onPending:(value:boolean)=>void}){
 const {docs,save,documentRevision}=useToolkit();const [patch,setPatch]=useState<Record<string,unknown>>({}),[busy,setBusy]=useState(false),[error,setError]=useState('');const revision=useRef(documentRevision('module-'+type)),lock=useRef(false);const item={...initial,...patch},dirty=Object.keys(patch).length>0,label=labels[type];
 useUnsavedNavigation(dirty||busy);useEffect(()=>{onPending(dirty||busy);return()=>onPending(false);},[dirty,busy,onPending]);
 const text=(key:string)=>typeof item[key]==='string'?item[key] as string:'';
 const number=(key:string)=>typeof item[key]==='number'&&Number.isFinite(item[key])?item[key] as number:'';
 function change(key:string,value:unknown){if(lock.current)return;setPatch(current=>({...current,[key]:value}));setError('');}
 async function store(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const kind='module-'+type;if(documentRevision(kind)!==revision.current)throw new Error('El catálogo cambió mientras editabas. Conservamos tus cambios; revisa la versión guardada antes de reintentar.');const next=prepareNativeOfferEdit(type,docs[kind],String(initial.id),patch);await save(kind,next);revision.current=documentRevision(kind);setPatch({});onSaved(next,String(initial.id));}catch(error){setError((error as Error).message);}finally{lock.current=false;setBusy(false);}}
 const description=type==='hospitality'?<Textarea label={label.description} value={Array.isArray(item.amenities)?item.amenities.join('\n'):''} maxLength={2000} onChange={event=>change('amenities',event.target.value.split(/\r?\n/))}/>:<Textarea label={label.description} value={text('description')} maxLength={2000} onChange={event=>change('description',event.target.value)}/>;
 const options=type==='ecommerce'?[
 {id:'category',title:'Su categoría',hint:'Agrupa productos similares.',icon:'▤',content:<Input label="Categoría del producto" maxLength={100} value={text('category')} onChange={event=>change('category',event.target.value)}/>},
 {id:'stock',title:'Su stock confirmado',hint:'Cantidad real disponible. Esto actualiza tu catálogo privado; no registra una compra.',icon:'▣',content:<Input label="Stock disponible" type="number" min="0" step="1" value={number('stock')} onChange={event=>change('stock',event.target.valueAsNumber)}/>},
 {id:'conditions',title:'Sus condiciones',hint:'Solo condiciones confirmadas de este producto.',icon:'≋',content:<Textarea label="Condiciones de la oferta" maxLength={2000} value={text('conditions')} onChange={event=>change('conditions',event.target.value)}/>}
 ]:type==='hospitality'?[
 {id:'capacity',title:'Su capacidad',hint:'No podrá ser menor a la cantidad de huéspedes de una reserva activa.',icon:'◌',content:<Input label="Capacidad de la habitación" type="number" min="1" step="1" value={number('capacity')} onChange={event=>change('capacity',event.target.valueAsNumber)}/>},
 {id:'type',title:'Tipo de habitación',hint:'Conserva la descripción de tu catálogo original.',icon:'⌂',content:<Input label="Tipo de habitación" maxLength={100} value={text('type')} onChange={event=>change('type',event.target.value)}/>}
 ]:type==='tourism'?[
 {id:'itinerary',title:'El recorrido',hint:'Edita y ordena las paradas de esta experiencia, una por vez.',icon:'↗',content:<ItineraryEditor value={item.itinerary as ExperienceDetails['itinerary']} onChange={next=>change('itinerary',next)}/>},
 {id:'duration',title:'Su duración',hint:'Las salidas y los horarios del guía se comprobarán antes de guardar.',icon:'◷',content:<Input label="Duración en minutos" type="number" min="1" step="1" value={number('durationMinutes')} onChange={event=>change('durationMinutes',event.target.valueAsNumber)}/>},
 {id:'meeting',title:'Punto de encuentro',hint:'Cambia las indicaciones escritas; se conservan las coordenadas confirmadas.',icon:'⌖',content:<Input label="Punto de encuentro" maxLength={500} value={text('meetingPoint')} onChange={event=>change('meetingPoint',event.target.value)}/>}
 ]:[];
 return <section className="pe-catalog-offer"><p>Un detalle por vez. Se guarda en tu catálogo original; tu publicación y el historial se conservan.</p><fieldset disabled={busy}><EditorDecision initialChoice="name" choices={[
 {id:'name',title:'Su nombre',hint:'Como quieres que aparezca en tu página.',icon:'✎',content:<Input label={type==='ecommerce'?'Nombre del producto':type==='hospitality'?'Nombre de la habitación':type==='tourism'?'Nombre de la experiencia':'Nombre del curso'} maxLength={120} value={text('name')} onChange={event=>change('name',event.target.value)}/>},
 {id:'price',title:'Su precio confirmado',hint:'En soles. Escribe cero únicamente si confirmas que no tiene costo.',icon:'S/',content:<Input label={label.price} type="number" min="0" max="1000000" step="0.01" value={number('price')} onChange={event=>change('price',event.target.valueAsNumber)}/>},
 {id:'description',title:type==='hospitality'?'Qué incluye':'Qué lo hace especial',hint:type==='hospitality'?'Una comodidad confirmada por línea. No se modifica el estado de limpieza.':'Describe lo que recibe tu cliente. El resto de la operación se conserva.',icon:'≋',content:description},
 {id:'photo',title:'Su imagen',hint:'Puedes empezar sin foto o elegirla de tu biblioteca.',icon:'▧',content:<ProjectImageField label={label.image} value={text(type==='courses'?'cover':'image')} onChange={image=>change(type==='courses'?'cover':'image',image)}/>},
 ...(options.length?[{id:'details',title:type==='ecommerce'?'Categoría, stock y condiciones':type==='hospitality'?'Tipo y capacidad':'Recorrido, duración y encuentro',hint:'Abre solo el detalle que necesitas ajustar.',icon:'＋',content:<EditorDecision choices={options}/>}]:[])]}/></fieldset>{type==='courses'&&<p className="pe-catalog-note">Módulos, lecciones, materiales e inscripciones se conservan. Esta edición no activa un aula ni concede accesos.</p>}{error&&<p role="alert">{error}</p>}<ButtonPrimary disabled={busy||!dirty} onClick={()=>void store()}>{busy?'Guardando…':`Guardar ${label.name.toLowerCase()}`}</ButtonPrimary></section>;
}
