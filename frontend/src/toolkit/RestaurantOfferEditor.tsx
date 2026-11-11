import {prepareRestaurantOfferSave} from './restaurantOfferSource';
import type {Proposal} from '../proposal/model';
import {useEffect,useRef,useState} from 'react';
import {useToolkit} from './ToolkitContext';
import EditorDecision from './EditorDecision';
import {Input,Textarea,ButtonPrimary} from '../components/ui/DesignSystem';
import ProjectImageField from '../components/shared/ProjectImageField';
import DishOptionsEditor from '../modules/restaurant/DishOptionsEditor';
import {emptyRestaurant,type Dish,type RestaurantData} from '../modules/restaurant/model';
import {parseRestaurantDocument} from '../modules/restaurant/restaurantDocument';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
export default function RestaurantOfferEditor({offerId,onSaved,onPending,linkToProposal=false}:{offerId?:string;linkToProposal?:boolean;onSaved:(data:RestaurantData,proposal?:Proposal,savedId?:string)=>void;onPending:(pending:boolean)=>void}){
 const {docs,business}=useToolkit();const [newDish]=useState<Dish>(()=>({id:crypto.randomUUID(),name:'',description:'',price:Number.NaN,image:'',category:'Productos',available:true}));let data:RestaurantData;
 try{data=docs['module-restaurant']===undefined&&!offerId?emptyRestaurant(business.name):parseRestaurantDocument(docs['module-restaurant']);}catch(error){return <p role="alert">{(error as Error).message}</p>;}
 const dish=offerId?data.dishes.find(item=>item.id===offerId):newDish;
 return dish?<Session key={offerId||'new'} creating={!offerId} linkToProposal={linkToProposal} initial={dish} onSaved={onSaved} onPending={onPending}/>:<p role="alert">Este producto ya no está en el menú. Conservamos la página; vuelve a elegir una oferta guardada.</p>;
}
function Session({initial,creating,linkToProposal,onSaved,onPending}:{initial:Dish;creating:boolean;linkToProposal:boolean;onSaved:(data:RestaurantData,proposal?:Proposal,savedId?:string)=>void;onPending:(pending:boolean)=>void}){
 const {docs,save,documentRevision,business}=useToolkit();const [firstChoice,setFirstChoice]=useState('name');const [dish,setDish]=useState(initial),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');const revision=useRef(documentRevision('module-restaurant')),proposalRevision=useRef(documentRevision('module-proposal')),lock=useRef(false);
 useUnsavedNavigation(dirty||busy);
 useEffect(()=>{onPending(dirty||busy);return()=>onPending(false);},[dirty,busy,onPending]);
 function change(patch:Partial<Dish>){if(lock.current)return;setDish(current=>({...current,...patch}));setDirty(true);setError('');}
 async function store(){if(lock.current)return;lock.current=true;setBusy(true);setError('');let menuSaved=false;try{
  if(documentRevision('module-restaurant')!==revision.current)throw new Error('El menú cambió mientras editabas. Conserva tus cambios y revisa la versión guardada antes de reintentar.');
  if(linkToProposal&&creating&&documentRevision('module-proposal')!==proposalRevision.current)throw new Error('Tu propuesta cambió. Revisa la versión guardada antes de vincular este producto.');
  const data=docs['module-restaurant']===undefined?emptyRestaurant(business.name):parseRestaurantDocument(docs['module-restaurant']);
  const next=prepareRestaurantOfferSave(data,dish,docs['module-proposal'],linkToProposal&&creating);
  await save('module-restaurant',next.menu);menuSaved=true;revision.current=documentRevision('module-restaurant');
  if(next.proposal){await save('module-proposal',next.proposal);proposalRevision.current=documentRevision('module-proposal');}
  setDirty(false);onSaved(next.menu,next.proposal,dish.id);
 }catch(error){setError((menuSaved&&linkToProposal&&creating?'El producto está guardado en el menú; falta vincularlo a esta página. Reintentar conservará el mismo producto. ':'')+(error as Error).message);}finally{lock.current=false;setBusy(false);}}

 return <section className="pe-catalog-offer"><p>Edita un detalle por vez. Se guarda en tu menú; tu página pública se conserva.</p><fieldset disabled={busy}><EditorDecision key={firstChoice} initialChoice={firstChoice} choices={[
 {id:'name',title:'Su nombre',hint:'Como quieres que aparezca en el menú.',icon:'✎',content:<Input label="Nombre del producto" value={dish.name} maxLength={150} onChange={event=>change({name:event.target.value})}/>},
 {id:'price',title:'Su precio',hint:'Precio base en soles. Las presentaciones y extras conservan sus propios precios.',icon:'S/',content:<Input label="Precio base (S/)" type="number" min="0" max="1000000" step="0.01" value={Number.isFinite(dish.price)?dish.price:''} onChange={event=>change({price:event.target.valueAsNumber})}/>},
 {id:'description',title:'Qué lo hace especial',hint:'Describe ingredientes, tamaño o lo que tu cliente necesita saber.',icon:'≋',content:<Textarea label="Descripción del producto" value={dish.description} maxLength={2000} onChange={event=>change({description:event.target.value})}/>},
 {id:'photo',title:'Su foto',hint:'Puedes añadirla después; no necesitas un enlace.',icon:'▧',content:<ProjectImageField label="Foto del producto" value={dish.image} onChange={image=>change({image})}/>},
 ]}/><details className="pe-offer-advanced"><summary>Presentaciones, extras y más opciones</summary><EditorDecision choices={[
 {id:'category',title:'Dónde aparece',hint:'Agrupa productos similares en tu menú.',icon:'▤',content:<Input label="Categoría" value={dish.category} maxLength={100} onChange={event=>change({category:event.target.value})}/>},
 {id:'variants',title:'Sus presentaciones',hint:'Unidad, caja o tamaños. Cada presentación conserva su identificador.',icon:'◇',content:<DishOptionsEditor title="Presentaciones" help="El cliente elige una presentación; su precio reemplaza el precio base." options={dish.variants} onChange={variants=>change({variants})}/>},
 {id:'extras',title:'Sus extras',hint:'Opcionales que se suman a cada unidad.',icon:'＋',content:<DishOptionsEditor title="Extras" help="Cada extra se suma al precio de cada unidad." options={dish.extras} onChange={extras=>change({extras})}/>},
 {id:'available',title:'Su disponibilidad',hint:'Decide si puede pedirse en tu menú.',icon:'✓',content:<label><input type="checkbox" checked={dish.available} onChange={event=>change({available:event.target.checked})}/> Disponible para pedir</label>},
 {id:'conditions',title:'Sus condiciones',hint:'Añade restricciones reales de esta oferta, si corresponden.',icon:'ⓘ',content:<Textarea label="Condiciones de la oferta" value={dish.conditions||''} maxLength={2000} onChange={event=>change({conditions:event.target.value})}/>}
 ]}/></details></fieldset>{error&&<p role="alert">{error}</p>}{creating&&firstChoice==='name'&&!Number.isFinite(dish.price)?<ButtonPrimary disabled={!dish.name.trim()||busy} onClick={()=>setFirstChoice('price')}>Continuar con el precio →</ButtonPrimary>:<ButtonPrimary disabled={!dirty||busy||!dish.name.trim()||!Number.isFinite(dish.price)} onClick={()=>void store()}>{busy?'Guardando producto…':'Guardar producto'}</ButtonPrimary>}</section>;
}
