import type {LandingBlock,LandingDraft} from './types';
export const sectionKinds=['catalog','story','faq','location','details'] as const;
export type SectionKind=typeof sectionKinds[number];
/** Titles from earlier drafts remain readable; only new/explicit saves persist a kind. */
export function sectionKind(block:LandingBlock):SectionKind|undefined{
 if(block.kind)return block.kind;
 const title=block.title.toLocaleLowerCase();
 if(/menú|productos|habitaciones|servicios|experiencias|cursos|catálogo/.test(title))return 'catalog';
 if(/preguntas|faq/.test(title))return 'faq';
 if(/historia|conócenos/.test(title))return 'story';
 if(/ubicación|visítanos|contacto/.test(title))return 'location';
 return undefined;
}
/** New structures know the route; a hotel's amenities are not a second room catalog. */
export function routeSectionKind(block:LandingBlock,route:string):SectionKind|undefined {
 if(!block.kind&&route==='hospitality'&&/^servicios$/i.test(block.title.trim()))return 'details';
 if(!block.kind&&route==='hospitality'&&/^(cómo llegar|tu llegada)$/i.test(block.title.trim()))return 'location';
 if(!block.kind&&route==='courses'&&/^quién enseña$/i.test(block.title.trim()))return 'story';
 return sectionKind(block);
}
export type SectionLayout='steps'|'features'|'quotes'|'prose';
export function sectionLayout(block:LandingBlock):SectionLayout {
 if(sectionKind(block)&&sectionKind(block)!=='details')return 'prose';
 const title=block.title.toLocaleLowerCase();
 if(/testimonios|reseñas/.test(title))return 'quotes';
 if(/paso|cómo pedir|cómo comprar|cómo trabajamos|pedidos y entregas|itinerario|temario|aprender|proceso/.test(title))return 'steps';
 if(/incluye|qué llevar|comodidades|servicios y comodidades|^servicios$|materiales|beneficios/.test(title))return 'features';
 return 'prose';
}
export function compositionRows(body:string):string[]{return body.split(/\r?\n/).map(row=>row.trim()).filter(Boolean);}
export function draftFaqRows(body:string):{question:string;answer:string}[]{
 return body.split(/\n[ \t]*\n/).filter(group=>group.trim()).map(group=>{const [question,...answer]=group.split('\n');return {question,answer:answer.join('\n')};});
}
export function serializeFaqRows(rows:{question:string;answer:string}[]):string{
 return rows.map(row=>row.question.replace(/[\r\n]+/g,' ')+'\n'+row.answer.replace(/\n[ \t]*\n/g,'\n')).join('\n\n');
}
export function faqRows(body:string):{question:string;answer:string}[]{return draftFaqRows(body).map(row=>({question:row.question.trim(),answer:row.answer.trim()})).filter(row=>row.question&&row.answer);}
export function sectionConfigured(block:LandingBlock,draft:LandingDraft):boolean{
 if(sectionKind(block)==='location'&&block.contact)return Boolean(block.contact.address||block.contact.hours||block.contact.note||block.contact.mapUrl);
 return sectionKind(block)==='catalog'?Boolean(draft.offers?.length):sectionKind(block)==='faq'?faqRows(block.body).length>0:Boolean(block.body.trim());
}
export function sectionHint(kind:SectionKind|undefined,route:string):string{
 if(kind==='catalog')return ({restaurant:'Añade tu primer plato o bebida. Su precio y opciones vendrán de tu menú.',ecommerce:'Añade tu primer producto con sus opciones.',tourism:'Añade una experiencia con duración y condiciones.',hospitality:'Añade una habitación o estadía.',courses:'Añade un curso y organiza sus materiales.'} as Record<string,string>)[route]||'Define tu primer servicio o paquete.';
 if(kind==='faq')return 'Añade una duda real y su respuesta. Las personas podrán abrir cada pregunta en tu página.';
 if(kind==='location')return 'Comparte dónde te encuentran y cuándo pueden contactarte. Puedes completarlo después.';
 if(kind==='story')return 'Tu historia tiene su lugar aquí. Escríbela cuando quieras, con tus propias palabras.';
 return 'Cuenta esta parte a tu manera. Solo se publicará lo que hayas definido.';
}
