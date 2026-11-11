export type ContextSelection={diagnosticRevision:string;proposalRevision:string|null;identity:boolean;pillars:string[];references:string[]};
const obj=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const strings=(v:unknown,max:number,length=200):v is string[]=>Array.isArray(v)&&v.length<=max&&new Set(v).size===v.length&&v.every(s=>typeof s==='string'&&s.length>0&&s.length<=length);
export function contextSelection(value:unknown):ContextSelection{
 if(!obj(value)||Object.keys(value).some(k=>!['diagnosticRevision','proposalRevision','identity','pillars','references'].includes(k))||typeof value.diagnosticRevision!=='string'||!value.diagnosticRevision||value.diagnosticRevision.length>100||!(value.proposalRevision===null||typeof value.proposalRevision==='string'&&value.proposalRevision.length<=100)||typeof value.identity!=='boolean'||!strings(value.pillars,5)||!strings(value.references,3,100)||!value.identity&&!value.pillars.length&&!value.references.length)throw new Error('Elige qué información guardada quieres usar.');
 return value as ContextSelection;
}
const choices=(v:unknown,max=5)=>Array.isArray(v)?v.filter(s=>typeof s==='string'&&s.trim()&&s!=='Lo definiré después').slice(0,max).map(s=>s.slice(0,200)):typeof v==='string'&&v.trim()&&v!=='Lo definiré después'?[v.slice(0,200)]:[];
export function selectedContext(diagnostic:unknown,proposal:unknown,project:string,selection:ContextSelection){
 if(!obj(diagnostic)||diagnostic.version!==2||diagnostic.projectId!==project||!obj(diagnostic.answers))throw new Error('La identidad de este proyecto necesita revisión.');
 const a=diagnostic.answers,result:Record<string,unknown>={};
 if(selection.identity){if(proposal!==null&&(!obj(proposal)||proposal.version!==1))throw new Error('Tu propuesta necesita revisión.');result.identity={desiredFeelings:[...choices(a.brandFeeling),...choices(a.brandFeelingCustom)].slice(0,10),voice:choices(a.voice),avoid:[...choices(a.brandAvoid),...choices(a.brandAvoidCustom)].slice(0,10),difference:obj(proposal)&&typeof proposal.value==='string'?proposal.value.slice(0,1500):''};}
 const custom=typeof a.pillarsCustom==='string'?a.pillarsCustom.split('\n').map(v=>v.trim()).filter(Boolean):[];
 const available=a.pillars==='Lo definiré después'||Array.isArray(a.pillars)&&a.pillars.includes('Lo definiré después')?[]:[...choices(a.pillars),...custom];
 if(selection.pillars.some(p=>!available.includes(p)))throw new Error('Un pilar cambió. Recupera tus elecciones antes de usar IA.');
 if(selection.pillars.length)result.pillars=[...selection.pillars];
 if(selection.references.length){if(!Array.isArray(diagnostic.inspiration))throw new Error('Tus referencias ya no están disponibles.');result.inspiration=selection.references.map(id=>{const r=diagnostic.inspiration.find((r:any)=>obj(r)&&r.id===id);if(!r||typeof r.label!=='string'||typeof r.notes!=='string'||typeof r.different!=='string'||!strings(r.likes,12))throw new Error('Una referencia cambió. Recupera tus elecciones antes de usar IA.');return {id,label:r.label.slice(0,500),likes:r.likes.map((s:string)=>s.slice(0,200)),notes:r.notes.slice(0,1000),different:r.different.slice(0,1000)};});}
 return result;
}
