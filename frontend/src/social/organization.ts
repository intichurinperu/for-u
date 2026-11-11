import {parseSocial,type SocialDocument,type Piece} from './model';
import type {ContentDraft} from '../components/shared/contentModel';
export const mainIntentions=[{title:'Conóceme',intent:'awareness',hint:'Presenta tu historia y lo que haces.'},{title:'Conversemos',intent:'conversation',hint:'Abre una conversación con tus personas.'},{title:'Mi oferta',intent:'offer',hint:'Muestra cómo pueden comprarte o consultarte.'}] as const;
export function mainSlots(document:SocialDocument):(string|null)[]{return document.mainSlots??[document.main[0]??null,document.main[1]??null,document.main[2]??null];}
/** Only explicit structural edits upgrade the legacy document. No piece or date is copied. */
export function setMainSlot(document:SocialDocument,index:number,id:string|null,user?:string):SocialDocument{
 if(!Number.isInteger(index)||index<0||index>2||id!==null&&!document.pieces.some(p=>p.id===id))throw new Error('Elige una pieza disponible para este espacio.');
 const slots=mainSlots(document).map(value=>id&&value===id?null:value);slots[index]=id;
 return parseSocial({...document,version:2,gridOrder:document.gridOrder??document.pieces.map(p=>p.id),mainSlots:slots,main:slots.filter((value):value is string=>value!==null)},document.projectId,user);
}
export function orderedPieces(document:SocialDocument):Piece[]{
 const pinned=mainSlots(document).filter((id):id is string=>!!id),ids=[...new Set([...pinned,...document.gridOrder??[],...document.pieces.map(p=>p.id)])];
 return ids.flatMap(id=>{const piece=document.pieces.find(p=>p.id===id);return piece?[piece]:[];});
}
/** Reordering the planning grid never changes a date, status, pin or published platform. */
export function moveGridPiece(document:SocialDocument,id:string,before:string|null,user?:string):SocialDocument{
 if(document.main.includes(id)||!document.pieces.some(p=>p.id===id)||before===id||before!==null&&(document.main.includes(before)||!document.pieces.some(p=>p.id===before)))return document;
 const ids=orderedPieces(document).filter(p=>!document.main.includes(p.id)).map(p=>p.id).filter(value=>value!==id);ids.splice(before===null?ids.length:ids.indexOf(before),0,id);
 return parseSocial({...document,version:2,gridOrder:[...document.main,...ids]},document.projectId,user);
}
export type PieceFilters={pillar?:string;query:string;intent:string;campaign:string;status:string};
export function filteredPieces(document:SocialDocument,designs:ContentDraft[],filters:PieceFilters):Piece[]{return orderedPieces(document).filter(p=>{
 const design=designs.find(d=>d.id===p.id),intent=design?.creative?.intent||p.objective,campaign=p.campaignId||design?.creative?.campaignId||'';
 return (!filters.pillar||filters.pillar===design?.creative?.pillar)&&(!filters.query||`${p.title} ${design?.title||''} ${p.text}`.toLocaleLowerCase().includes(filters.query.toLocaleLowerCase()))&&(!filters.intent||filters.intent===intent)&&(!filters.campaign||(filters.campaign==='none'?!campaign:filters.campaign===campaign))&&(!filters.status||filters.status===p.status);
});}
export function highlightTopics(route:string){route=({restaurante:'restaurant',tienda:'ecommerce',turismo:'tourism',hospedaje:'hospitality',cursos:'courses',servicios:'services'} as Record<string,string>)[route.toLocaleLowerCase()]||route;return ({restaurant:['Nuestra historia','Menú','Cómo pedir','Ubicación','Preguntas frecuentes'],ecommerce:['Nuestra historia','Productos','Cómo comprar','Entregas','Preguntas frecuentes'],hospitality:['El lugar','Habitaciones','Servicios','Cómo llegar','Reservas'],tourism:['Nuestra historia','Experiencias','Qué llevar','Punto de encuentro','Reservas'],courses:['Sobre mí','Cursos','Cómo aprender','Materiales','Preguntas frecuentes'],services:['Sobre mí','Servicios','Cómo trabajamos','Consultas','Preguntas frecuentes']} as Record<string,string[]>)[route]??['Sobre mí','Qué ofrecemos','Cómo trabajamos','Contacto','Preguntas frecuentes'];}

/** An idea is the same piece that later receives a design, script and video. */
export function addGridIdea(document:SocialDocument,title:string,id:string,user?:string):SocialDocument{
 const value=title.trim();if(!value||value.length>160)throw new Error('Escribe un título de hasta 160 caracteres.');
 if(document.pieces.length>=100||document.pieces.some(p=>p.id===id))throw new Error('No se pudo añadir otra idea. Conservamos las anteriores.');
 const piece:Piece={id,title:value,objective:'',text:'',script:'',shots:'',date:'',status:'idea',files:[]};
 return parseSocial({...document,version:2,pieces:[...document.pieces,piece],gridOrder:[...orderedPieces(document).map(p=>p.id),id]},document.projectId,user);
}
