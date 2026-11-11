import {AIError} from './core.ts';
// One bounded row per account/project/action; RLS and project authorization remain in force.
// A database revision claim prevents duplicate generation across server isolates.
export async function sharedRequest<T>(db:any,userId:string,projectId:string,action:string,key:string,work:()=>Promise<T>):Promise<T>{
 const kind=`module-ai-request-${action}`;
 const query=()=>db.from('toolkit_documents');
 const read=await query().select('payload,updated_at').eq('user_id',userId).eq('project_id',projectId).eq('kind',kind).maybeSingle();
 if(read.error)throw new AIError('cache_unavailable','No pudimos comprobar la solicitud de IA. No se inició otra generación.',503);
 const previous=read.data;const payload=previous?.payload;const now=Date.now();
 if(payload&&(payload.version!==1||!['done','pending','error'].includes(payload.state)||typeof payload.key!=='string'||typeof payload.until!=='number'))throw new AIError('cache_format','La solicitud guardada requiere revisión. No se sobrescribió.',503);
 if(payload?.state==='done'&&payload.key===key&&payload.until>now)return payload.result as T;
 if(payload?.state==='pending'&&payload.until>now)throw new AIError('request_in_progress','Ya hay una solicitud para este proyecto en curso. Espera antes de reintentar.',409);
 const revision=new Date(Math.max(now,previous?Date.parse(previous.updated_at)+1:0)).toISOString();
 const values={user_id:userId,project_id:projectId,kind,updated_at:revision,payload:{version:1,key,state:'pending',until:now+120_000}};
 const claim=previous?await query().update({payload:values.payload,updated_at:revision}).eq('user_id',userId).eq('project_id',projectId).eq('kind',kind).eq('updated_at',previous.updated_at).select('updated_at').maybeSingle():await query().insert(values).select('updated_at').single();
 if(claim.error?.code==='23505'||!claim.error&&!claim.data)throw new AIError('request_in_progress','Otra pestaña inició esta solicitud. Espera antes de reintentar.',409);
 if(claim.error)throw new AIError('cache_unavailable','No pudimos preparar la solicitud. No se inició una generación.',503);
 const finish=async(payload:unknown)=>query().update({payload,updated_at:new Date(Math.max(Date.now(),Date.parse(revision)+1)).toISOString()}).eq('user_id',userId).eq('project_id',projectId).eq('kind',kind).eq('updated_at',claim.data.updated_at).select('updated_at').maybeSingle();
 let result:T;
 try{result=await work();}catch(error){await finish({version:1,key,state:'error',until:0});throw error;}
 const saved=await finish({version:1,key,state:'done',until:Date.now()+300_000,result});
 if(saved.error||!saved.data)throw new AIError('result_uncertain','La generación terminó, pero no pudimos confirmar su guardado. Espera dos minutos antes de reintentar; tu tarea no cambió.',503);
 return result;
}
