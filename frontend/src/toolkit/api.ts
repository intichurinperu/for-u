import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { supabase } from "../lib/supabaseClient";
import type { Business } from "./types";
import type { Segment } from "./engine";
export async function askAI(
  action: "caption" | "script" | "hashtags" | "chat" | "tags" | "landing",
  prompt: string,
  business: Business,
  extra: Record<string, unknown> = {},
): Promise<string> {
  if (!supabase)
    throw new Error(
      "Conecta tu cuenta para usar la IA. Puedes trabajar con una plantilla mientras tanto.",
    );
  const scope=useActiveProjectsStore.getState();
  const projectId=typeof extra.projectId==='string'?extra.projectId:scope.activeProjectId;
  if(!projectId)throw new Error('Elige un proyecto guardado antes de usar la IA.');
  const { data, error } = await supabase.functions.invoke("toolkit-ai", {
    body: { action, prompt, business, ...extra, projectId },
  });
  const currentScope=useActiveProjectsStore.getState();
  if(currentScope.cloudUserId!==scope.cloudUserId||currentScope.activeProjectId!==projectId)throw new Error('Cambiaste de cuenta o proyecto. La respuesta anterior no se aplicó.');
  if (error || data?.error)
    throw new Error(
      data?.error ??
        "La IA no está disponible. Revisa la conexión o usa una plantilla.",
    );
  if (typeof data?.text !== "string" || !data.text.trim())
    throw new Error("La IA no devolvió contenido. Inténtalo de nuevo.");
  return data.text;
}
export async function transcribe(file:File,projectId:string,options?:{explicitProject?:boolean}):Promise<Segment[]>{
 if(!supabase)throw new Error('Inicia sesión para transcribir el audio.');
 const scope=useActiveProjectsStore.getState();
 const body=new FormData();body.set('action','transcribe');body.set('projectId',projectId);body.set('file',file);
 const {data,error}=await supabase.functions.invoke('toolkit-ai',{body});
 const current=useActiveProjectsStore.getState();
 const expectedProject=options?.explicitProject?scope.activeProjectId:projectId;
 if(scope.cloudUserId!==current.cloudUserId||current.activeProjectId!==expectedProject)throw new Error('Cambiaste de cuenta o proyecto. La transcripción no se aplicó.');
 let message=data?.error;
 if(error&&!message){try{message=(await error.context?.json())?.error;}catch{}}
 if(error||message)throw new Error(message||'No pudimos transcribir. Puedes reintentar.');
 if(!Array.isArray(data?.segments))throw new Error('No se recibió una transcripción válida.');
 return data.segments;
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
export function templateContent(b: Business, topic: string, format: string) {
  if (format === "script")
    return `¿Buscas ${b.offer}?\n\nEn ${b.name} lo hacemos pensando en ${b.audience}.\nHoy te mostramos ${topic || "cómo trabajamos"}.\n[Cuenta un beneficio real y muestra el proceso.]\n\nEscríbenos para conocer las opciones y elegir la tuya.`;
  if (format === "hashtags")
    return "#Emprendimiento #NegocioLocal #HechoConCariño #CompraLocal #MiNegocio";
  return `${topic || b.offer}: una idea para ti.\n\nEn ${b.name} creamos ${b.offer} para ${b.audience}. [Agrega aquí un beneficio concreto y verificable.]\n\nEscríbenos y te ayudamos a elegir.\n\n#Emprendimiento #NegocioLocal`;
}
