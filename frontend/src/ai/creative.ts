import {responseProvenance} from './sourceContext';
import {supabase} from '../lib/supabaseClient';
import {useActiveProjectsStore} from '../stores/useActiveProjectsStore';
export async function requestCreative(projectId:string,body:Record<string,unknown>):Promise<Record<string,any>>{
 if(!supabase)throw new Error('Inicia sesión para usar Gemini.');
 const {cloudUserId:account,activeProjectId}=useActiveProjectsStore.getState();
 const {data,error}=await supabase.functions.invoke('toolkit-ai',{body:{...body,projectId,prompt:typeof body.prompt==='string'?body.prompt:'Preparar propuesta revisable'}});
 const current=useActiveProjectsStore.getState();
 // An explicit Studio URL can open a project other than the last selected one.
 const expectedProject=body.action==='idea-design'?activeProjectId:projectId;
 if(current.cloudUserId!==account || current.activeProjectId!==expectedProject)throw new Error('Cambiaste de cuenta o proyecto. La respuesta no se aplicó.');
 if(error||data?.error){let detail=data;if(!detail&&error&&'context'in error){try{detail=await(error.context as Response).json();}catch{}}throw new Error(detail?.error||'Gemini no está disponible. Puedes seguir creando sin IA.');}
 if(data?.sourceRevision!==body.sourceRevision)throw new Error('La fuente cambió. Revisa su versión antes de usar la respuesta.');
 if(!data?.structured||typeof data.structured!=='object'||Array.isArray(data.structured))throw new Error('La respuesta no es válida. Tu trabajo sigue intacto.');const provenance=body.action==='studio'?responseProvenance(data,projectId,body):undefined;return {...data.structured,__sourceRevision:body.sourceRevision,...(provenance?{__provenance:provenance}:{})};
}
