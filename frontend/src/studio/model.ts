import {validBrandProfile,type BrandProfile} from '../experience/brandProfile';
import {nativeOffers,offerPrice,parseProposal,type Proposal} from '../proposal/model';
import {pageSections} from '../experience/pageComposition';
import {privateMediaPath,externalImageUrl} from '../components/shared/mediaReference';
import {blankContent,type ContentDraft} from '../components/shared/contentModel';
import type {LandingDraft,Business} from '../toolkit/types';
import type {ModuleType} from '../modules/moduleProjects';
import type {Campaign,SourceReference} from '../workspace/contracts';
export const intentions=[
 {id:'awareness',title:'Dar a conocer',hint:'Presenta quién eres y qué estás construyendo.',icon:'✦',category:'reconocimiento'},
 {id:'conversation',title:'Conversar y conectar',hint:'Abre una conversación con tus personas.',icon:'◌',category:'interaccion'},
 {id:'trust',title:'Construir confianza',hint:'Explica tu proceso con información real.',icon:'◇',category:'conversion'},
 {id:'offer',title:'Presentar una oferta',hint:'Haz visible lo que ya puedes ofrecer.',icon:'↗',category:'venta'},
 {id:'followup',title:'Retomar el contacto',hint:'Invita a volver a quienes ya te conocen.',icon:'↻',category:'retargeting'},
 {id:'loyalty',title:'Cuidar a mis clientes',hint:'Mantén la relación después de una compra.',icon:'♡',category:'fidelizacion'},
] as const;
export type Intent=Campaign['intent'];
export type CreativeSource={key:string;title:string;body:string;image:string;cta:string;reference:SourceReference|null;group:'offer'|'page'|'proposal'|'idea'};
export const firstContentIntentions=[
 {id:'awareness',title:'Que me conozcan',hint:'Cuenta quién eres y por qué existe tu negocio.',label:'Conóceme'},
 {id:'conversation',title:'Conversar con mis clientes',hint:'Comparte una idea y abre una conversación.',label:'Conversemos'},
 {id:'offer',title:'Mostrar mi oferta',hint:'Presenta lo que pueden comprar o reservar.',label:'Mi oferta'},
] as const;
export function firstContentSource(sources:CreativeSource[],intent:Intent,sectionId?:string,offerId?:string):CreativeSource|undefined {
 if(offerId)return sources.find(source=>source.group==='offer'&&source.reference?.id===offerId)||sources.find(source=>source.group==='offer'&&source.reference?.kind==='page'&&source.reference.id==='offer:'+offerId);
 if(intent==='offer'){const offers=sources.filter(source=>source.group==='offer');return offers.length===1?offers[0]:undefined;}
 if(sectionId)return sources.find(source=>source.reference?.kind==='page'&&source.reference.id===sectionId);
 if(intent==='conversation')return sources.find(source=>source.group==='page'&&source.reference?.id!=='hero'&&source.body.trim())||sources.find(source=>source.key==='proposal')||sources.find(source=>source.key==='page:hero');
 return sources.find(source=>source.key==='page:hero')||sources.find(source=>source.group==='proposal');
}
export function studioSources({project,type,proposal,page,catalog,revisions}:{project:string;type:ModuleType;proposal:Proposal;page:LandingDraft|null;catalog:unknown;revisions:{proposal:string|null;page:string|null;catalog:string|null}}):CreativeSource[]{
 const rows:CreativeSource[]=[];parseProposal(proposal);
 if(revisions.catalog)for(const offer of nativeOffers(type,catalog))rows.push({key:'catalog:'+offer.id,title:offer.name,body:[offer.description,offerPrice(offer),offer.conditions].filter(Boolean).join('\n'),image:offer.image,cta:proposal.cta||'Conoce esta oferta',reference:{projectId:project,kind:'catalog',id:offer.id,revision:revisions.catalog},group:'offer'});
 if(revisions.proposal){
  for(const offer of proposal.offers)rows.push({key:'proposal:'+offer.id,title:offer.name,body:[offer.description,offerPrice(offer),offer.conditions].filter(Boolean).join('\n'),image:offer.image,cta:proposal.cta||'Conoce esta oferta',reference:{projectId:project,kind:'proposal',id:offer.id,revision:revisions.proposal},group:'offer'});
  if(proposal.offering.trim())rows.push({key:'proposal',title:proposal.message||proposal.offering,body:[proposal.value,proposal.conditions].filter(Boolean).join('\n'),image:'',cta:proposal.cta||'Conversemos',reference:{projectId:project,kind:'proposal',id:'proposal',revision:revisions.proposal},group:'proposal'});
 }
 if(page&&revisions.page)for(const section of pageSections(page).filter(section=>section.id==='hero'||section.body.trim())){const offer=section.id.startsWith('offer:');if(offer&&(page.catalogSource==='module'||page.catalogSource==='proposal'||rows.some(row=>row.group==='offer'&&row.reference?.id===section.id.slice(6))))continue;rows.push({key:'page:'+section.id,title:section.title,body:section.body,image:section.image,cta:page.cta,reference:{projectId:project,kind:'page',id:section.id,revision:revisions.page},group:offer?'offer':'page'});}
 return rows;
}
export function compositionOptions(source:CreativeSource,intent:Intent,format:ContentDraft['format'],project:string,user:string,brand:string,campaign?:Campaign,identity?:BrandProfile,pillar?:string):ContentDraft[]{
 if(!source.title.trim())throw new Error('Cuéntanos una idea o elige información guardada.');
 if(source.reference?.projectId&&source.reference.projectId!==project)throw new Error('Esta información pertenece a otro proyecto.');
 if(campaign&&campaign.intent!==intent)throw new Error('Revisa el objetivo de la campaña antes de crear.');
 if(identity&&!validBrandProfile(identity,project))throw new Error('La identidad no pertenece a este proyecto.');
 if(pillar&&!identity?.pillars.includes(pillar))throw new Error('Revisa el pilar de este contenido.');
 const layouts:NonNullable<ContentDraft['layout']>[]=identity?.voice.includes('Divertida')?['poster','split','editorial']:identity?.voice.includes('Educativa')?['split','editorial','poster']:['editorial','poster','split'];
 const path=privateMediaPath(source.image,user,project);const external=!path?externalImageUrl(source.image):'';
 if(source.image&&!path&&!external)throw new Error('La imagen necesita revisión. Elige un archivo de este proyecto.');
 if(external&&(/\/object\/sign\//.test(external)||/[?&](token|signature|expires|x-amz-credential)=/i.test(external)))throw new Error('Elige la imagen desde tu biblioteca; no guardamos enlaces temporales.');
 const cta=({awareness:'Conócenos un poco más',conversation:'¿Qué te gustaría saber?',trust:'Cuéntanos tus dudas',followup:'¿Seguimos conversando?',loyalty:'Comparte tu experiencia',offer:source.cta||'Consultar esta oferta'} as Record<Intent,string>)[intent];
 const captionTitle=intent==='conversation'?`¿Qué te gustaría saber de ${source.title}?`:source.title;
 return layouts.map((layout,i)=>({...blankContent(project),layout,format,title:source.title.slice(0,160),subtitle:source.body,caption:[captionTitle,source.body,cta].filter(Boolean).join('\n\n'),cta,brandName:brand,imagePath:path||'',sourceImageUrl:external||'',background:['#F4F0EA','#EDE7F7','#A9E8D7'][i],foreground:'#24232A',creative:{intent,...(identity?{brand:{...identity,feelings:[...identity.feelings],voice:[...identity.voice],avoid:[...identity.avoid],pillars:[...identity.pillars],...(identity.inspiration?{inspiration:identity.inspiration.map(r=>({...r,likes:[...r.likes]}))}:{})}}:{}),...(pillar?{pillar}:{}),...(campaign?{campaignId:campaign.id}:{}),...(source.reference?{reference:source.reference}:{}),sourceKey:source.key},...(source.reference?.kind==='page'?{source:{kind:'landing' as const,mode:'draft' as const,sectionId:source.reference.id,revision:source.reference.revision}}:{})}));
}
export function campaignWithPiece(campaigns:{campaigns:Campaign[]},id:string,pieceId:string):Campaign[]{
 if(!campaigns.campaigns.some(c=>c.id===id))throw new Error('Esta campaña ya no está disponible. Tu diseño se conserva.');
 return campaigns.campaigns.map(c=>c.id===id?{...c,pieceIds:[...new Set([...c.pieceIds,pieceId])]}:c);
}
