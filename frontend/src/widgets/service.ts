import { supabase } from '../lib/supabaseClient';
import { parseWidgetData, type ProjectWidget } from './model';
export type WidgetSource={projectId:string;name:string;slug:string;choices:{type:'offer'|'section';id:string;label:string}[]};
export async function widgetSources(projectId:string):Promise<WidgetSource[]>{
 if(!supabase)throw new Error('Conecta tu cuenta para elegir otro proyecto.');
 const {data,error}=await supabase.rpc('toolkit_widget_sources',{host_project:projectId});
 if(error)throw new Error('No pudimos consultar proyectos autorizados. Reintenta; si persiste, revisa la instalación del servicio de widgets en Supabase.');
 if(!Array.isArray(data))throw new Error('La consulta de proyectos devolvió un formato incompatible.');return data;
}
export async function widgetPreview(host:string,widget:ProjectWidget){
 if(!supabase)throw new Error('Conecta tu cuenta para comprobar la fuente.');
 const {data,error}=await supabase.rpc('toolkit_widget_preview',{host_project:host,source_project:widget.sourceProject,selection_type:widget.selectionType,selection_id:widget.selectionId,presentation:widget.presentation});
 if(error)throw new Error('No pudimos comprobar el contenido publicado o su autorización. Reintenta.');return parseWidgetData(data);
}
