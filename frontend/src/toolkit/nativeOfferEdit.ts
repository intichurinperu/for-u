import {experienceDetails} from '../proposal/experienceDetails';
import {nativeOffers,publicOffer} from '../proposal/model';
import {emptyEcommerce,saveProduct,type EcommerceData,type Product} from '../modules/ecommerce/model';
import {emptyHospitality,saveRoom,type HospitalityData,type Room} from '../modules/hospitality/model';
import {emptyTourism,saveTour,type TourismData,type Tour} from '../modules/tourism/model';
import {emptyCourses,saveCourse,type CoursesData,type Course} from '../modules/courses/model';
export type NativeEditableType='ecommerce'|'hospitality'|'tourism'|'courses';
export type NativeEditableData=EcommerceData|HospitalityData|TourismData|CoursesData;
export const editableNativeTypes:NativeEditableType[]=['ecommerce','hospitality','tourism','courses'];
const collection={ecommerce:'products',hospitality:'rooms',tourism:'tours',courses:'courses'} as const;
const arrays={ecommerce:['products','orders'],hospitality:['rooms','bookings','finances','sections'],tourism:['tours','guides','departures','bookings'],courses:['courses','enrollments','sales','certificates']} as const;
const fields:Record<NativeEditableType,string[]>={ecommerce:['name','price','description','image','conditions','category','stock'],hospitality:['name','price','image','type','capacity','amenities'],tourism:['name','price','description','image','durationMinutes','meetingPoint','itinerary'],courses:['name','price','description','cover']};
export function readNativeEditable(type:NativeEditableType,payload:unknown):NativeEditableData{
 if(!editableNativeTypes.includes(type)||!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('No pudimos leer el catálogo de este proyecto. Conservamos tu página.');
 const data=payload as Record<string,unknown>;
 if(data.version!==1||!data.settings||typeof data.settings!=='object'||Array.isArray(data.settings)||arrays[type].some(key=>!Array.isArray(data[key])))throw new Error('El catálogo necesita revisión. No sustituimos sus registros ni su historial.');
 const entries=data[collection[type]] as Record<string,unknown>[];
 if(entries.some(item=>!item||typeof item.id!=='string')||new Set(entries.map(item=>item.id)).size!==entries.length)throw new Error('Revisa los identificadores de tu catálogo.');
 nativeOffers(type,data);
 return payload as NativeEditableData;
}
export function nativeEditableItem(type:NativeEditableType,payload:unknown,id:string):Record<string,unknown>{
 const data=readNativeEditable(type,payload) as unknown as Record<string,unknown>;
 const item=(data[collection[type]] as Record<string,unknown>[]).find(item=>item.id===id);
 if(!item)throw new Error('Esta oferta ya no está en el catálogo. Vuelve a elegir una oferta guardada.');
 return item;
}
/** Edit public presentation in its original catalog; all private records and immutable IDs stay there. */
export function prepareNativeOfferEdit(type:NativeEditableType,payload:unknown,id:string,patch:Record<string,unknown>):NativeEditableData{
 const data=readNativeEditable(type,payload),original=nativeEditableItem(type,data,id);
 if(Object.keys(patch).some(key=>!fields[type].includes(key)))throw new Error('Ese ajuste no corresponde a esta oferta.');
 for(const [key,value] of Object.entries(patch)){
  if(['price','stock','capacity','durationMinutes'].includes(key)){if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1000000)throw new Error('Confirma un valor válido antes de guardar.');}
  else if(key==='itinerary'){experienceDetails({version:1,durationMinutes:original.durationMinutes,meetingPoint:original.meetingPoint,itinerary:value});}
  else if(key==='amenities'){if(!Array.isArray(value)||value.length>30||value.some(row=>typeof row!=='string'||row.length>200))throw new Error('Revisa las comodidades de esta habitación.');}
  else if(typeof value!=='string'||value.length>(key==='name'?120:['category','type'].includes(key)?100:['description','conditions','image','cover'].includes(key)?2000:500))throw new Error('Acorta este dato antes de guardar.');
 }
 const next={...original,...patch};
 const result=type==='ecommerce'?saveProduct(data as EcommerceData,next as Product):type==='hospitality'?saveRoom(data as HospitalityData,next as Room):type==='tourism'?saveTour(data as TourismData,next as Tour):saveCourse(data as CoursesData,next as Course);
 nativeOffers(type,result).forEach(publicOffer);
 return result;
}

/** Blank native records have no invented price, stock, duration, capacity or map. */
export function blankNativeItem(type:NativeEditableType,id:string):Record<string,unknown>{
 const base={id,name:'',price:NaN};
 if(type==='ecommerce')return {...base,description:'',category:'',stock:NaN,image:'',active:true};
 if(type==='hospitality')return {...base,type:'',capacity:NaN,image:'',status:null,amenities:[]};
 if(type==='tourism')return {...base,description:'',durationMinutes:NaN,image:'',active:true,itinerary:[],meetingPoint:'',latitude:null,longitude:null};
 return {...base,description:'',cover:'',modules:[]};
}
export function prepareNativeOfferCreate(type:NativeEditableType,payload:unknown,id:string,patch:Record<string,unknown>,name:string):NativeEditableData{
 if(!id||id.length>100||id.includes(':'))throw new Error('La referencia de la nueva oferta no es válida.');
 const extra=type==='hospitality'?['status']:[];
 if(Object.keys(patch).some(key=>!fields[type].includes(key)&&!extra.includes(key)))throw new Error('Ese ajuste no corresponde a esta oferta.');
 let data:NativeEditableData;
 if(payload===undefined){data=type==='ecommerce'?emptyEcommerce(name):type==='hospitality'?emptyHospitality(name):type==='tourism'?emptyTourism(name):emptyCourses(name);if(type==='hospitality'){const hotel=data as HospitalityData;data={...hotel,settings:{...hotel.settings,checkIn:'',checkOut:''}};}}
 else data=readNativeEditable(type,payload);
 const record=data as unknown as Record<string,unknown>,items=record[collection[type]] as Record<string,unknown>[];
 const original=items.find(item=>item.id===id)||blankNativeItem(type,id),item={...original,...patch};
 if(type==='hospitality'&&!['clean','dirty'].includes(String(item.status)))throw new Error('Confirma si la habitación está lista o en preparación.');
 const seeded={...data,[collection[type]]:items.some(row=>row.id===id)?items.map(row=>row.id===id?item:row):[...items,item]};
 const normalPatch={...patch};delete normalPatch.status;
 const next=prepareNativeOfferEdit(type,seeded,id,normalPatch);
 if(nativeOffers(type,next).length>30)throw new Error('Esta página admite hasta treinta ofertas. Conserva el catálogo mayor en su módulo.');
 return next;
}
