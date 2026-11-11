export type PrivateEntry<T>={data:T;revision:string|null;loaded:boolean;dirty:boolean;busy:boolean;error:string;conflict:boolean;operation:'loading'|'saving'|null};
export type PrivateTransport={load:()=>Promise<{payload:unknown;revision:string}|null>;save:(payload:unknown,revision:string|null)=>Promise<string>};
/** A controller belongs to exactly one owner/project/kind; no response changes scope. */
export class PrivateDocumentController<T>{
 private entry:PrivateEntry<T>;private listeners=new Set<()=>void>();private edits=0;
 private transport:PrivateTransport;private initial:()=>T;private parse:(v:unknown)=>T;
 constructor(transport:PrivateTransport,initial:()=>T,parse:(v:unknown)=>T){this.transport=transport;this.initial=initial;this.parse=parse;this.entry={data:initial(),revision:null,loaded:false,dirty:false,busy:false,error:'',conflict:false,operation:null};}
 snapshot=()=>this.entry;
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};
 private patch(value:Partial<PrivateEntry<T>>){this.entry={...this.entry,...value};this.listeners.forEach(fn=>fn());}
 change=(data:T)=>{if(!this.entry.loaded)return;this.edits++;this.patch({data,dirty:true});};
 async load(recover=false){
  if(this.entry.busy)return false;
  const before=this.edits;this.patch({busy:true,operation:'loading'});
  try{const saved=await this.transport.load(),data=saved?this.parse(saved.payload):this.initial(),current=this.entry;
   if(recover&&this.edits!==before){this.patch({conflict:true,error:'Llegaron cambios durante la recuperación. Conservamos tus pendientes; revisa antes de recuperar otra vez.'});return false;}
   if(current.dirty&&!recover){if(current.revision!==(saved?.revision??null))this.patch({conflict:true,error:'Hay otra versión guardada. Conservamos tus cambios; recupera explícitamente para sustituirlos.'});return false;}
   this.patch({data,revision:saved?.revision??null,loaded:true,dirty:false,error:'',conflict:false});return true;
  }catch(e){this.patch({error:(e as Error).message});return false;}finally{this.patch({busy:false,operation:null});}
 }
 async save(){
  const before=this.entry,edits=this.edits;if(!before.loaded||before.busy||before.conflict)return false;
  this.patch({busy:true,operation:'saving',error:''});
  try{const revision=await this.transport.save(this.parse(before.data),before.revision);const dirty=this.edits!==edits;this.patch({revision,dirty});return !dirty;
  }catch(e){const error=(e as Error).message;this.patch({error,conflict:/conflict|otra pestaña|otra versión|otra ventana|cambió/i.test(error)});return false;}finally{this.patch({busy:false,operation:null});}
 }
}
export type SaveOutcome={kind:string;status:'saved'|'failed';error?:string};
/** Independent documents are not a fake transaction. Retry only failed members,
 * retaining each successful member's revision at its own controller. */
export async function saveDocumentGroup(operations:{kind:string;save:()=>Promise<boolean>}[]):Promise<SaveOutcome[]>{
 return Promise.all(operations.map(async op=>{try{return {kind:op.kind,status:await op.save()?'saved':'failed'} as SaveOutcome;}catch(e){return {kind:op.kind,status:'failed',error:(e as Error).message} as SaveOutcome;}}));
}
