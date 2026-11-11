export type AIContextSelection={diagnosticRevision:string;proposalRevision:string|null;identity:boolean;pillars:string[];references:string[]};
export type AISource={projectId:string;kind:'landing'|'module-proposal'|'module-social-profile'|'module-project-diagnostic';id:string|null;revision:string};
export type AIProvenance={version:1;action:'content'|'script'|'landing'|'layout';sources:AISource[];context:AIContextSelection|null};
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function validContextSelection(v:unknown):v is AIContextSelection{
 if(!record(v)||Object.keys(v).some(k=>!['diagnosticRevision','proposalRevision','identity','pillars','references'].includes(k)))return false;
 const names=(x:unknown,n:number,l:number):x is string[]=>Array.isArray(x)&&x.length<=n&&new Set(x).size===x.length&&x.every(s=>typeof s==='string'&&s.length>0&&s.length<=l);
 return typeof v.diagnosticRevision==='string'&&v.diagnosticRevision.length>0&&v.diagnosticRevision.length<=100&&(v.proposalRevision===null||typeof v.proposalRevision==='string'&&v.proposalRevision.length<=100)&&typeof v.identity==='boolean'&&names(v.pillars,5,200)&&names(v.references,3,100)&&(v.identity||v.pillars.length>0||v.references.length>0);
}
export function validProvenance(value:unknown,project:string):value is AIProvenance{
 if(!record(value)||value.version!==1||!['content','script','landing','layout'].includes(String(value.action))||!(value.context===null||validContextSelection(value.context))||!Array.isArray(value.sources)||value.sources.length<1||value.sources.length>4)return false;
 return value.sources.every(s=>record(s)&&s.projectId===project&&['landing','module-proposal','module-social-profile','module-project-diagnostic'].includes(String(s.kind))&&(s.id===null||typeof s.id==='string'&&s.id.length<=200)&&typeof s.revision==='string'&&s.revision.length>0&&s.revision.length<=100);
}
export function responseProvenance(data:Record<string,any>,project:string,body:Record<string,unknown>):AIProvenance|undefined{
 if(!data.sources){if(body.sourceContext)throw new Error('El servidor aún no confirmó estas fuentes adicionales. No aplicamos la respuesta; puedes crear manualmente o usar solo la fuente principal.');return undefined;}
 const provenance={version:1,action:body.creativeKind,sources:data.sources,context:data.sourceContext??null};
 if(!validProvenance(provenance,project))throw new Error('La procedencia de la respuesta no es válida. Tu trabajo sigue intacto.');
 const primaryKind=body.sourceKind==='piece'?'module-social-profile':body.sourceKind==='proposal'?'module-proposal':'landing';
 if(!provenance.sources.some(s=>s.kind===primaryKind&&s.revision===body.sourceRevision&&s.id===(body.sourceId??null))||JSON.stringify(provenance.context)!==JSON.stringify(body.sourceContext??null))throw new Error('La respuesta no corresponde a las fuentes elegidas. No se aplicó.');
 if(provenance.context&&!provenance.sources.some(s=>s.kind==='module-project-diagnostic'&&s.revision===provenance.context!.diagnosticRevision))throw new Error('No pudimos verificar la identidad utilizada.');
 if(provenance.context?.identity&&provenance.context.proposalRevision&&!provenance.sources.some(s=>s.kind==='module-proposal'&&s.revision===provenance.context!.proposalRevision))throw new Error('No pudimos verificar la propuesta utilizada.');
 return provenance;
}
export function provenanceCurrent(value:AIProvenance|undefined,revision:(kind:string)=>string|null):boolean{return !value||value.sources.every(source=>revision(source.kind)===source.revision);}

export const sourceLabels:Record<AISource['kind'],string>={'landing':'Sección de tu página','module-proposal':'Tu propuesta','module-social-profile':'Esta pieza','module-project-diagnostic':'Tus elecciones de identidad'};
