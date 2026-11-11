import {changePiece,parseSocial} from '../social/model';
import {mainSlots,setMainSlot} from '../social/organization';
import {nativeOffers,parseProposal} from '../proposal/model';
import {pageSections} from '../experience/pageComposition';
import type {LandingDraft} from '../toolkit/types';
import type {ModuleType} from '../modules/moduleProjects';
import type {ModuleDocumentKind} from '../services/moduleDocuments';
import {saveContentDraft,validateCreativeContext,type ContentDocument,type ContentDraft} from '../components/shared/contentModel';
import {connectDesignPiece} from '../experience/designPiece';
import {emptyCampaigns,parseCampaigns} from '../workspace/contracts';
import {mediaReference} from '../components/shared/mediaReference';
import {campaignWithPiece} from './model';
export const studioStorage={load:async(...args:Parameters<typeof import('../services/moduleDocuments').loadModuleDocument>)=>(await import('../services/moduleDocuments')).loadModuleDocument(...args),save:async(...args:Parameters<typeof import('../services/moduleDocuments').saveModuleDocument>)=>(await import('../services/moduleDocuments')).saveModuleDocument(...args)};
export function contentDocument(value:unknown,project:string):ContentDocument{
 if(value==null)return {version:1,drafts:[]};const d=value as ContentDocument;
 if(d.version!==1||!Array.isArray(d.drafts)||d.drafts.some(row=>row.projectId!==project))throw new Error('El diseño guardado necesita recuperación. No lo reemplazamos.');
 d.drafts.forEach(row=>validateCreativeContext(row,project));return d;
}
/** Ordered, retryable writes. A partial success is retained and named, not rolled back or hidden. */
export async function saveComposition(user:string,project:string,draft:ContentDraft,status:(message:string)=>void=()=>{},storage=studioStorage,mainIndex?:number,canvasFiles?:{path:string;name:string}[],seedScript=false){
 validateCreativeContext(draft,project);if(draft.projectId!==project)throw new Error('El diseño pertenece a otro proyecto.');
 for(const path of [draft.imagePath,draft.logoPath,draft.voice?.path])if(path){mediaReference(path);if(!path.startsWith(`${user}/${project}/`))throw new Error('Un archivo pertenece a otro proyecto.');}
 const reference=draft.creative?.reference;
 if(reference?.kind==='offer')throw new Error('Esta fuente necesita abrirse desde su oferta antes de crear.');
 const kind:ModuleDocumentKind|undefined=reference?.kind==='catalog'?reference.id.split(':')[0] as ModuleDocumentKind:reference?.kind==='page'?'landing':reference?.kind==='proposal'?'proposal':undefined;
 if(reference?.kind==='catalog'&&!['restaurant','ecommerce','tourism','hospitality','courses'].includes(String(kind)))throw new Error('La fuente del catálogo no es válida.');
 const origin=draft.creative?.origin;
 const [designs,profile,campaigns,source,originPage]=await Promise.all([storage.load(user,project,'content-creator'),storage.load(user,project,'social-profile'),draft.creative?.campaignId?storage.load(user,project,'campaigns'):null,kind?storage.load(user,project,kind):null,origin?.pageRevision&&kind!=='landing'?storage.load(user,project,'landing'):null]);
 if(kind&&source?.revision!==reference?.revision)throw new Error('La información cambió. Vuelve a preparar las propuestas; tus diseños guardados siguen intactos.');
 if(reference&&source){const valid=reference.kind==='catalog'?nativeOffers(kind as ModuleType,source.payload).some(o=>o.id===reference.id):reference.kind==='page'?pageSections(source.payload as LandingDraft).some(s=>s.id===reference.id):reference.kind==='proposal'?(reference.id==='proposal'||parseProposal(source.payload).offers.some(o=>o.id===reference.id)):false;if(!valid)throw new Error('La fuente ya no está disponible. Vuelve a elegirla sin cambiar tus diseños guardados.');}
 if(origin?.pageRevision){
  const snapshot=kind==='landing'?source:originPage,page=snapshot?.payload as LandingDraft|undefined;
  if(snapshot?.revision!==origin.pageRevision||!page||origin.sectionId!=='hero'&&!page.blocks.some(block=>block.id===origin.sectionId))throw new Error('La página de origen cambió. Vuelve a preparar las propuestas; no se sobrescribió ningún diseño.');
  if(origin.offerId&&!page.offers?.some(offer=>offer.id===origin.offerId)){
   let linked=page.catalogSource==='module'&&reference?.kind==='catalog'&&reference.id===origin.offerId;
   if(page.catalogSource==='proposal'){const proposalSource=kind==='proposal'?source:await storage.load(user,project,'proposal');if(proposalSource){const proposal=parseProposal(proposalSource.payload);linked=proposal.nativeIds.includes(origin.offerId)||proposal.offers.some(offer=>offer.id===origin.offerId);}}
   if(!linked)throw new Error('Esta oferta ya no aparece en la página de origen. Revisa tu selección.');
  }
 }

 const campaignDoc=campaigns?parseCampaigns(campaigns.payload,project):emptyCampaigns(project);
 if(draft.creative?.campaignId&&!campaignDoc.campaigns.some(row=>row.id===draft.creative!.campaignId))throw new Error('La campaña no está disponible. Vuelve a elegirla.');
 const next=saveContentDraft(contentDocument(designs?.payload,project),draft,project);
 let social=connectDesignPiece(profile?.payload,project,user,draft);
 if(canvasFiles){
  for(const file of canvasFiles){mediaReference(file.path);if(!file.path.startsWith(`${user}/${project}/`))throw new Error('Un material pertenece a otro proyecto.');}
  const piece=social.pieces.find(row=>row.id===draft.id)!;
  social=parseSocial(changePiece(social,draft.id,{title:draft.title,text:draft.caption||draft.subtitle,...(seedScript&&!piece.script.trim()?{script:draft.caption||[draft.title,draft.subtitle,draft.cta].filter(Boolean).join('\n\n')}:{}),files:[...piece.files,...canvasFiles.filter(file=>!piece.files.some(existing=>existing.path===file.path))]}),project,user);
 }

 if(mainIndex!==undefined){if(!Number.isInteger(mainIndex)||mainIndex<0||mainIndex>2)throw new Error('Este espacio del perfil no es válido.');const current=mainSlots(social)[mainIndex];if(current&&current!==draft.id)throw new Error('Este espacio ya tiene una pieza. Vuelve al perfil para revisarla; no la reemplazamos.');social=setMainSlot(social,mainIndex,draft.id,user);}
 let saved='';
 try{
  status('Guardando tu diseño…');await storage.save(user,project,'content-creator',next,designs?.revision??null);saved='El diseño ya está guardado. ';
  status('Conectando texto y guion…');if(social!==profile?.payload)await storage.save(user,project,'social-profile',social,profile?.revision??null);saved='El diseño y su pieza ya están guardados. ';
  if(draft.creative?.campaignId){status('Vinculando tu campaña…');const id=draft.creative.campaignId;const updated={...campaignDoc,campaigns:campaignWithPiece(campaignDoc,id,draft.id)};if(JSON.stringify(updated)!==JSON.stringify(campaignDoc))await storage.save(user,project,'campaigns',parseCampaigns(updated,project),campaigns?.revision??null);}
 }catch(e){throw new Error(saved+(e as Error).message+' Puedes reintentar; no se crearán copias.');}
}
