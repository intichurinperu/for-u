import {validProvenance,type AIProvenance} from '../ai/sourceContext';
import { privateMediaPath, isPrivateMedia, mediaReference } from '../components/shared/mediaReference';
export type Piece = { aiProvenance?:AIProvenance; id:string; title:string; objective:string; text:string; script:string; shots:string; date:string; status:'idea'|'draft'|'ready'|'published-manual'; files:{path:string;name:string}[]; campaignId?:string; materialIds?:string[]; videoId?:string; coverId?:string; source?:{projectId:string;id:string;kind:'proposal'|'catalog'|'page'|'offer';revision:string} };
export type SocialDocument = { version:1|2; mainSlots?:(string|null)[]; gridOrder?:string[]; projectId:string; photo:string; name:string; bio:string; link:string; highlights:{id:string;title:string;cover:string}[]; main:string[]; pieces:Piece[] };
export const uuid = (value:unknown):value is string => typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function emptySocial(projectId:string):SocialDocument {return {version:1,projectId,photo:'',name:'',bio:'',link:'',highlights:[],main:[],pieces:[]};}
export function newPiece():Piece {return {id:crypto.randomUUID(),title:'',objective:'',text:'',script:'',shots:'',date:'',status:'idea',files:[]};}
export function parseSocial(value:unknown,projectId:string,userId?:string):SocialDocument {
 const d=value as SocialDocument;
 const text=(v:unknown,n:number)=>typeof v==='string'&&v.length<=n;
 const file=(p:string)=>{try{mediaReference(p);return !userId||p.startsWith(`${userId}/${projectId}/`);}catch{return false;}};
 const photo=(p:string)=>!isPrivateMedia(p)||!userId||!!privateMediaPath(p,userId,projectId);
 if(!d||![1,2].includes(d.version)||d.projectId!==projectId||!text(d.photo,2000)||!text(d.name,120)||!text(d.bio,2000)||!text(d.link,2000)||!Array.isArray(d.main)||d.main.length>3||new Set(d.main).size!==d.main.length||!Array.isArray(d.pieces)||d.pieces.length>100||!Array.isArray(d.highlights)||d.highlights.length>20) throw new Error('El perfil guardado no es compatible. No se reemplazó.');
 if(!photo(d.photo)||d.highlights.some(h=>typeof h.cover==='string'&&!photo(h.cover)))throw new Error('Una foto no pertenece a este proyecto.');
 if(d.link&&!/^https?:\/\//i.test(d.link))throw new Error('El enlace del perfil debe comenzar con https:// o http://.');
 if(d.pieces.some(p=>!uuid(p.id)||!text(p.title,160)||!text(p.objective,2000)||!text(p.text,10000)||!text(p.script,20000)||!text(p.shots,10000)||!text(p.date,10)||(p.date!==''&&!/^\d{4}-\d{2}-\d{2}$/.test(p.date))||!['idea','draft','ready','published-manual'].includes(p.status)||!Array.isArray(p.files)||p.files.length>30||p.files.some(f=>!text(f.path,2000)||!text(f.name,200)||!file(f.path))))throw new Error('Revisa los datos y archivos de las piezas.');
 if(d.pieces.some(p=>p.aiProvenance!==undefined&&!validProvenance(p.aiProvenance,projectId)))throw new Error('Las fuentes de una sugerencia no pertenecen a este proyecto.');
 if(new Set(d.pieces.map(p=>p.id)).size!==d.pieces.length||d.main.some(id=>!d.pieces.some(p=>p.id===id))||d.highlights.some(h=>!uuid(h.id)||!text(h.title,80)||!text(h.cover,2000)))throw new Error('Revisa las referencias del perfil.');
 const ids=(v:unknown):v is string[]=>Array.isArray(v)&&v.length<=300&&v.every(uuid)&&new Set(v).size===v.length;
 if(d.version===2&&(!ids(d.gridOrder)||d.gridOrder.some(id=>!d.pieces.some(p=>p.id===id))))throw new Error('El orden del perfil contiene una pieza no disponible.');
 if(d.mainSlots!==undefined&&(d.version!==2||!Array.isArray(d.mainSlots)||d.mainSlots.length!==3||d.mainSlots.some(id=>id!==null&&(!uuid(id)||!d.pieces.some(p=>p.id===id)))||JSON.stringify(d.mainSlots.filter(id=>id!==null))!==JSON.stringify(d.main)))throw new Error('Los espacios principales del perfil necesitan revisión. Se conservan sin reemplazar.');
 if(d.pieces.some(p=>(p.campaignId!==undefined&&!uuid(p.campaignId))||(p.materialIds!==undefined&&!ids(p.materialIds))||(p.videoId!==undefined&&!uuid(p.videoId))||(p.coverId!==undefined&&!uuid(p.coverId))||(p.source!==undefined&&(!p.source||p.source.projectId!==projectId||!text(p.source.id,200)||!p.source.id||!['proposal','catalog','page','offer'].includes(p.source.kind)||!text(p.source.revision,100)||!p.source.revision))))throw new Error('Una referencia de la pieza no es compatible con este proyecto.');
 return d;
}
export function getPiece(value:unknown,projectId:string,pieceId:string,userId?:string){const document=parseSocial(value,projectId,userId);const piece=document.pieces.find(p=>p.id===pieceId);if(!piece)throw new Error('Esta pieza no está disponible en el proyecto.');return {document,piece};}
export function changePiece(document:SocialDocument,pieceId:string,patch:Partial<Piece>):SocialDocument {if(!document.pieces.some(p=>p.id===pieceId))throw new Error('Esta pieza no está disponible.');return {...document,pieces:document.pieces.map(p=>p.id===pieceId?{...p,...patch,id:p.id}:p)};}
export const pieceQuery=(projectId:string,id:string)=>`?project=${encodeURIComponent(projectId)}&piece=${encodeURIComponent(id)}`;

/** Explicit structural edit preserves all legacy pieces, UUIDs and file paths. */
export function changeSocialStructure(document:SocialDocument,patch:Pick<Partial<SocialDocument>,'gridOrder'>,user?:string):SocialDocument{return parseSocial({...document,version:2,gridOrder:document.gridOrder??document.pieces.map(p=>p.id),...patch},document.projectId,user);}
