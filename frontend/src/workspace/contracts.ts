import {parsePillarDetails,type PillarDetail} from '../experience/pillarDetails';
import {parseProposal,type Proposal} from '../proposal/model';
import {parseSocial,type SocialDocument} from '../social/model';
import {parseJourney,type Journey} from '../experience/journeyModel';
import {uuid} from '../social/model';
export const businessRoutes=['restaurant','ecommerce','hospitality','tourism','courses','services'] as const;
export type BusinessRoute=typeof businessRoutes[number];
export type ProjectReference={projectId:string;id:string};
export type SourceReference=ProjectReference&{kind:'proposal'|'catalog'|'page'|'offer';revision:string};
export type Material={id:string;path:string;name:string;mime:string;kind:'image'|'audio'|'video'|'document'};
export type InspirationReference={id:string;label:string;likes:string[];notes:string;different:string;files:{path:string;name:string}[]};
export type Diagnostic={version:2;projectId:string;route:BusinessRoute;answers:Record<string,string|string[]>;cursor:string|null;inspiration?:InspirationReference[];pillarDetails?:PillarDetail[]};
export type ProjectRoute={version:1;projectId:string;stage:'explore'|'shape'|'prepare'|'operate'|'improve';diagnosticRevision:string|null;taskIds:string[];reasons:Record<string,string>};
export type Campaign={id:string;title:string;intent:'awareness'|'conversation'|'trust'|'offer'|'followup'|'loyalty';offer:SourceReference|null;start:string|null;end:string|null;pieceIds:string[]};
export type Campaigns={version:1;projectId:string;campaigns:Campaign[]};
// Commercial prices remain in the source catalog, never in these references.
export type SpecificOffer={id:string;title:string;source:SourceReference|null;benefit:string;conditions:string;pageId:string|null};
export type SpecificOffers={version:1;projectId:string;offers:SpecificOffer[]};
export type Materials={version:1;projectId:string;materials:Material[]};
const areas=['marketing','finance','logistics','operations'];
const questions=new Set(['projectName','route','age','team','teamSize','stage','origin','purpose','vision','audience','offering','need','needs','goal','web','sales','salesPeriod','brandFeeling','difference','voice','brandAvoid','pillars','inspiration','inspirationStep','inspirationEditing','marketingStart','intent','comfort','avoid','resources','tools','time','friction','channel','diffusion','budget','reminders','sections','otherAreas','prices','cost','moneyTracking','delivery','control','logisticsFriction','requests','tracking','responsible','operationGoal']);
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown,n=3000):v is string=>typeof v==='string'&&v.length<=n;
const unique=(ids:unknown,n=200):ids is string[]=>Array.isArray(ids)&&ids.length<=n&&ids.every(x=>text(x,200)&&!!x)&&new Set(ids).size===ids.length;
const date=(v:unknown)=>v===null||typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const fail=():never=>{throw new Error('Documento incompatible o de otro proyecto. Se conserva sin reemplazar.');};
function scope(v:unknown,project:string,version:number):Record<string,unknown>{if(!uuid(project)||!record(v)||v.version!==version||v.projectId!==project)fail();return v as Record<string,unknown>;}
function source(v:unknown,project:string):boolean{return v===null||record(v)&&v.projectId===project&&text(v.id,200)&&!!v.id&&['proposal','catalog','page','offer'].includes(String(v.kind))&&text(v.revision,100)&&!!v.revision&&Object.keys(v).every(key=>['projectId','id','kind','revision'].includes(key));}
export const emptyDiagnostic=(projectId:string,route:BusinessRoute):Diagnostic=>({version:2,projectId,route,answers:{},cursor:null});
export function parseDiagnostic(v:unknown,project:string):Diagnostic|Journey {
 if(record(v)&&v.version===1)return parseJourney(v); // Historical shape stays unchanged on read.
 const d=scope(v,project,2);
 if(!businessRoutes.includes(d.route as BusinessRoute)||!record(d.answers)||Object.keys(d.answers).length>100||!(d.cursor===null||text(d.cursor,100)))fail();
 for(const [key,value] of Object.entries(d.answers as Record<string,unknown>)){
  const base=key.endsWith('Custom')?key.slice(0,-6):key;
  if(!questions.has(base)||!(text(value)||Array.isArray(value)&&value.length<=30&&value.every(x=>text(x,200))))fail();
 }
 if(d.pillarDetails!==undefined)parsePillarDetails(d.pillarDetails);
 if(d.inspiration!==undefined){
  if(!Array.isArray(d.inspiration)||d.inspiration.length>10||new Set(d.inspiration.map(r=>r?.id)).size!==d.inspiration.length||!d.inspiration.every(r=>record(r)&&uuid(r.id)&&text(r.label,500)&&unique(r.likes,12)&&text(r.notes,2000)&&text(r.different,2000)&&Array.isArray(r.files)&&r.files.length<=20&&r.files.every(f=>record(f)&&text(f.name,200)&&text(f.path,2000)&&new RegExp('^[\\w-]+/'+project+'/[\\w.-]+$').test(f.path)&&!f.path.includes('..'))))fail();
 }
 return v as Diagnostic;
}
/** Explicit replacement, not an automatic legacy migration. Personal answers
 * never enter this project contract; unknown legacy keys are not discarded. */
export function changeDiagnostic(current:Diagnostic|Journey,next:Diagnostic,project:string):Diagnostic{parseDiagnostic(current,project);return parseDiagnostic(next,project) as Diagnostic;}
export const emptyProjectRoute=(projectId:string):ProjectRoute=>({version:1,projectId,stage:'explore',diagnosticRevision:null,taskIds:[],reasons:{}});
export function parseProjectRoute(v:unknown,project:string):ProjectRoute {
 const d=scope(v,project,1);if(!['explore','shape','prepare','operate','improve'].includes(String(d.stage))||!(d.diagnosticRevision===null||text(d.diagnosticRevision,100))||!unique(d.taskIds)||!record(d.reasons)||!Object.entries(d.reasons).every(([id,reason])=>(d.taskIds as string[]).includes(id)&&text(reason,1000)))fail();return v as ProjectRoute;
}
export const emptyCampaigns=(projectId:string):Campaigns=>({version:1,projectId,campaigns:[]});
export function parseCampaigns(v:unknown,project:string):Campaigns{
 const d=scope(v,project,1);if(!Array.isArray(d.campaigns)||d.campaigns.length>100||new Set(d.campaigns.map(c=>c?.id)).size!==d.campaigns.length||!d.campaigns.every(c=>record(c)&&uuid(c.id)&&text(c.title,160)&&['awareness','conversation','trust','offer','followup','loyalty'].includes(String(c.intent))&&source(c.offer,project)&&date(c.start)&&date(c.end)&&(!c.start||!c.end||String(c.start)<=String(c.end))&&unique(c.pieceIds,100)&&c.pieceIds.every(uuid)))fail();return v as Campaigns;
}
export const emptySpecificOffers=(projectId:string):SpecificOffers=>({version:1,projectId,offers:[]});
export function parseSpecificOffers(v:unknown,project:string):SpecificOffers{
 const d=scope(v,project,1);if(!Array.isArray(d.offers)||d.offers.length>100||new Set(d.offers.map(o=>o?.id)).size!==d.offers.length||!d.offers.every(o=>record(o)&&uuid(o.id)&&text(o.title,160)&&source(o.source,project)&&text(o.benefit,2000)&&text(o.conditions,3000)&&(o.pageId===null||uuid(o.pageId))&&!('price' in o)))fail();return v as SpecificOffers;
}
export const emptyMaterials=(projectId:string):Materials=>({version:1,projectId,materials:[]});
export function parseMaterials(v:unknown,project:string,user:string):Materials{
 const d=scope(v,project,1);if(!Array.isArray(d.materials)||d.materials.length>300||new Set(d.materials.map(m=>m?.id)).size!==d.materials.length||!d.materials.every(m=>record(m)&&uuid(m.id)&&text(m.name,200)&&text(m.mime,100)&&['image','audio','video','document'].includes(String(m.kind))&&text(m.path,2000)&&m.path.startsWith(`${user}/${project}/`)&&/^[\w-]+\/[\w-]+\/[\w.-]+$/.test(m.path)&&m.path.split('/').length===3&&m.path.split('/').every(x=>x&&x!=='.'&&x!=='..'&&!x.includes('\\'))))fail();return v as Materials;
}
export type ProjectStructure={diagnostic:Diagnostic|Journey;route:ProjectRoute;proposal:Proposal;offers:SpecificOffers;campaigns:Campaigns;profile:SocialDocument;materials:Materials};
/** Cross-document references are resolved; neither tasks nor pieces are copied. */
export function validateStructureReferences(structure:ProjectStructure,taskIds:string[]){
 const pieces=new Set(structure.profile.pieces.map(p=>p.id));
 const campaigns=new Set(structure.campaigns.campaigns.map(c=>c.id));const materials=new Map(structure.materials.materials.map(m=>[m.id,m]));
 if(structure.profile.pieces.some(piece=>(piece.campaignId&&!campaigns.has(piece.campaignId))||piece.materialIds?.some(id=>!materials.has(id))||(piece.videoId&&materials.get(piece.videoId)?.kind!=='video')||(piece.coverId&&materials.get(piece.coverId)?.kind!=='image')))throw new Error('Una pieza tiene referencias pendientes. Recupera su campaña o material original.');
 if(structure.route.taskIds.some(id=>!taskIds.includes(id))||structure.campaigns.campaigns.some(c=>c.pieceIds.some(id=>!pieces.has(id))))throw new Error('Hay referencias pendientes. Recupera su fuente antes de guardar el conjunto.');
}
export function readExistingProposal(v:unknown):Proposal{return parseProposal(v);}
export function readExistingProfile(v:unknown,project:string,user:string):SocialDocument{return parseSocial(v,project,user);}
export const projectAreaIds=areas;
