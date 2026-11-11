import {supabase} from '../lib/supabaseClient';
import {validGuidance,type Suggestion} from './model';
export type {Guidance,Suggestion} from './model';
export async function suggestTask(projectId:string,kind:'tasks'|'calendar',sourceId:string,title:string):Promise<Suggestion>{
 if(!supabase)throw new Error('Inicia sesión para usar la IA.');
 const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Tu sesión venció. Inicia sesión nuevamente.');
 const doc=await supabase.from('toolkit_documents').select('payload,updated_at').eq('project_id',projectId).eq('user_id',user.id).eq('kind',kind==='tasks'?'module-area-tasks':'calendar').maybeSingle();
 if(doc.error||!doc.data)throw new Error('Guarda la tarea antes de pedir ayuda. No se inició una llamada de IA.');
 const rows=kind==='tasks'?doc.data.payload?.tasks:doc.data.payload;
 if(!Array.isArray(rows)||!rows.some(t=>t.id===sourceId&&t.title===title))throw new Error('La tarea tiene cambios pendientes. Guarda o recupera su versión antes de pedir ayuda.');
 const {data,error}=await supabase.functions.invoke('toolkit-ai',{body:{action:'mission',prompt:'Preparar siguiente paso',projectId,sourceKind:kind,sourceId,sourceRevision:doc.data.updated_at}});
 if(error||data?.error){let detail=data;if(!detail&&error&&'context'in error){try{detail=await(error.context as Response).json();}catch{}}throw new Error(detail?.error??'No se pudo consultar la IA. Tu tarea sigue intacta.');}
 const s=data?.suggestion;if(!s||s.sourceId!==sourceId||typeof s.title!=='string'||typeof s.description!=='string'||!Array.isArray(s.steps)||s.steps.length<1||s.steps.length>3||!s.steps.every((step:unknown)=>typeof step==='string')||!validGuidance(s))throw new Error('La respuesta no es válida. Tu tarea sigue intacta.');
 return s as Suggestion;
}
