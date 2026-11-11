import {parsePillarDetails,type PillarDetail} from './pillarDetails';
import {parseDiagnostic,type BusinessRoute} from '../workspace/contracts';
import type {Proposal} from '../proposal/model';
export const pillarSuggestions:Record<BusinessRoute,string[]>={
 restaurant:['Café y productos','Personas y comunidad','Historia y proceso','Consejos para disfrutar','Vida del espacio'],
 ecommerce:['Productos y usos','Cómo lo hacemos','Personas y comunidad','Consejos de cuidado','Historia de la marca'],
 tourism:['Lugares y cultura','Experiencias y recorridos','Personas del viaje','Consejos para viajar','Historia del proyecto'],
 hospitality:['Espacios y estadías','Vida local','Personas y hospitalidad','Consejos para tu visita','Historia del lugar'],
 courses:['Ideas para aprender','Práctica y proceso','Personas y comunidad','Dudas frecuentes','Historia de quien enseña'],
 services:['Problemas que ayudamos a resolver','Proceso y método','Personas y comunidad','Consejos prácticos','Historia y propósito'],
};
export type BrandProfile={version:1;projectId:string;revision:string|null;feelings:string[];difference:string;voice:string[];avoid:string[];pillars:string[];pillarDetails?:PillarDetail[];inspiration?:{id:string;label:string;likes:string[];notes:string;different:string}[]};
const choices=(value:unknown)=>Array.isArray(value)?value.filter((v):v is string=>typeof v==='string'&&!!v.trim()&&v!=='Lo definiré después').map(v=>v.trim().slice(0,200)):typeof value==='string'&&value.trim()&&value!=='Lo definiré después'?[value.trim().slice(0,200)]:[];
export function contentPillars(a:Record<string,string|string[]>):string[]{
 if(a.pillars==='Lo definiré después'||Array.isArray(a.pillars)&&a.pillars.includes('Lo definiré después'))return [];
 const custom=typeof a.pillarsCustom==='string'?a.pillarsCustom.split('\n').map(s=>s.trim().slice(0,200)).filter(Boolean):[];
 const values=[...new Set([...choices(a.pillars),...custom])];
 if(values.length>5)throw new Error('Elige hasta cinco pilares entre las opciones y tus temas propios. Conservamos lo que escribiste.');
 return values;
}
/** Choices are intentions confirmed by the owner, never customer testimonials or claims. */
export function brandProfile(raw:unknown,proposal:Proposal,project:string,revision:string|null):BrandProfile|undefined{
 if(raw===undefined)return undefined;
 const doc=parseDiagnostic(raw,project);if(doc.version!==2)return undefined;
 const a=doc.answers;
 const pillars=contentPillars(a);
 const pillarDetails=parsePillarDetails(doc.pillarDetails).filter(row=>pillars.includes(row.name));
 const inspiration=doc.inspiration?.filter(r=>r.label.trim()||r.likes.length||r.notes.trim()||r.different.trim()).map(({id,label,likes,notes,different})=>({id,label,likes:[...likes],notes,different}));
 const result:BrandProfile={version:1,projectId:project,revision,...(pillarDetails.length?{pillarDetails}:{}),...(inspiration?.length?{inspiration}:{}),feelings:[...choices(a.brandFeeling),...choices(a.brandFeelingCustom)],difference:proposal.value==='Lo definiré después'?'':proposal.value.trim(),voice:choices(a.voice),avoid:[...choices(a.brandAvoid),...choices(a.brandAvoidCustom)],pillars};
 return inspiration?.length||pillars.length||result.feelings.length||result.voice.length||result.avoid.length||result.difference?result:undefined;
}
export function validBrandProfile(value:unknown,project:string):value is BrandProfile{
 if(!value||typeof value!=='object')return false;const b=value as BrandProfile;try{parsePillarDetails(b.pillarDetails);}catch{return false;}
 return b.version===1&&b.projectId===project&&(b.revision===null||typeof b.revision==='string'&&b.revision.length<=100)&&typeof b.difference==='string'&&b.difference.length<=2000&&[b.feelings,b.voice,b.avoid,b.pillars].every(a=>Array.isArray(a)&&a.length<=30&&a.every(v=>typeof v==='string'&&v.length>0&&v.length<=200))&&b.pillars.length<=5&&(b.inspiration===undefined||Array.isArray(b.inspiration)&&b.inspiration.length<=10&&b.inspiration.every(r=>typeof r.id==='string'&&typeof r.label==='string'&&r.label.length<=500&&Array.isArray(r.likes)&&r.likes.length<=12&&r.likes.every(l=>typeof l==='string'&&l.length<=200)&&typeof r.notes==='string'&&r.notes.length<=2000&&typeof r.different==='string'&&r.different.length<=2000));
}
