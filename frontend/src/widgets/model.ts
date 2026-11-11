import { publicOffer, type Offer } from '../proposal/model';
import { externalImageUrl } from '../components/shared/mediaReference';
export type ProjectWidget = {version:1;id:string;sourceProject:string;selectionType:'offer'|'section';selectionId:string;presentation:'embed'|'card'};
export type WidgetData = {sourceName:string;slug:string;headline:string;cta:string;contact:string;offer?:Offer;section?:{title:string;body:string}};
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export function parseWidgets(value:unknown,host?:string):ProjectWidget[]{
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>8)throw new Error('Revisa los bloques de otros proyectos (máximo 8).');
 const widgets=value.map(w=>{if(!w||w.version!==1||!uuid(w.id)||!uuid(w.sourceProject)||w.sourceProject===host||!['offer','section'].includes(w.selectionType)||typeof w.selectionId!=='string'||!w.selectionId.trim()||w.selectionId.length>80||!['embed','card'].includes(w.presentation))throw new Error('Hay una conexión incompatible. Se conservó el borrador.');return {version:1,id:w.id,sourceProject:w.sourceProject,selectionType:w.selectionType,selectionId:w.selectionId,presentation:w.presentation} as ProjectWidget;});
 if(new Set(widgets.map(w=>w.id)).size!==widgets.length)throw new Error('Los bloques tienen identificadores duplicados.');
 return widgets;
}
export function parseWidgetData(value:unknown):WidgetData|null{
 if(!value||typeof value!=='object')return null;
 const v=value as Record<string,unknown>;if(typeof v.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug)||v.slug.length>60)return null;
 const text=(key:string,max:number)=>typeof v[key]==='string'?(v[key] as string).slice(0,max):'';
 let offer:Offer|undefined,section:WidgetData['section'];
 try{if(v.offer){offer=publicOffer(v.offer as Offer);offer.image=externalImageUrl(offer.image)&&!offer.image.includes('/storage/v1/object/sign/')?offer.image:'';}}catch{return null;}
 if(v.section&&typeof v.section==='object'){const s=v.section as Record<string,unknown>;if(typeof s.title!=='string'||typeof s.body!=='string')return null;section={title:s.title.slice(0,150),body:s.body.slice(0,2000)};}
 if(!offer&&!section)return null;
 const contact=text('contact',2000);return {sourceName:text('sourceName',100),slug:v.slug,headline:text('headline',180),cta:text('cta',50)||'Ver proyecto',contact:/^https:\/\/wa.me\/\d{8,15}$/.test(contact)?contact:'/s/'+v.slug,offer,section};
}
