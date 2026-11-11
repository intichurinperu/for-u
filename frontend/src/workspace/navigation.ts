import type {ModuleType} from '../modules/moduleProjects';
export const projectViews = ['map','kanban','calendar','world'] as const;
export type ProjectView = typeof projectViews[number];
export type ProjectDestination = {path:string; params:Record<string,string>};
const paths = new Set(['/dashboard','/dashboard/world','/dashboard/settings','/creator-studio','/content-creator',...['profile','proposal','landing','summary','content','teleprompter','video','assistant','automation','orders','calendar','bookings','images','analytics'].map(x=>'/dashboard/tools/'+x),...['restaurant','ecommerce','tourism','hospitality','courses'].flatMap(x=>['','/editor',...(x==='restaurant'?['/orders','/categorias','/estilos']:[])].map(s=>'/modules/'+x+s))]);
const params = new Set(['from','viewport','compose','creation','topic','pin','panel','library','pillar','view','area','task','piece','design','campaign','section','tab','format','start','return','offer','pageRevision']);
export function validDestination(value:unknown):value is ProjectDestination {
 const d=value as ProjectDestination;
 return !!d&&paths.has(d.path)&&!!d.params&&typeof d.params==='object'&&!Array.isArray(d.params)&&Object.entries(d.params).every(([key,val])=>params.has(key)&&typeof val==='string'&&val.length>0&&val.length<=200&&!/[\u0000-\u001f]/.test(val));
}
export function locationDestination(path:string,search:string,projectId:string):ProjectDestination|null {
 const query=new URLSearchParams(search);if(query.get('project')!==projectId||!paths.has(path)||query.has('create')||query.has('setup'))return null;
 const values:Record<string,string>={};for(const [key,value] of query)if(params.has(key))values[key]=value;
 const destination={path,params:values};return validDestination(destination)?destination:null;
}
export function destinationPath(projectId:string,destination:ProjectDestination):string {
 if(!validDestination(destination))throw new Error('Este destino no es compatible. No se abrió otro proyecto.');
 const query=new URLSearchParams({project:projectId});Object.entries(destination.params).forEach(([k,v])=>query.set(k,v));return `${destination.path}?${query}`;
}
export function projectViewPath(projectId:string,view:ProjectView):string {
 return destinationPath(projectId,{path:view==='world'?'/dashboard/world':'/dashboard',params:view==='world'?{}:{view}});
}
export function workspaceSpaces(projectId:string,type:ModuleType){
 const q=`?project=${encodeURIComponent(projectId)}`;
 return [
  {id:'page',title:'Mi página',path:'/dashboard/tools/landing'+q},
  {id:'studio',title:'Creator Studio',path:'/creator-studio'+q},
  {id:'operation',title:'Mi operación',path:`/modules/${type}`+q},
  {id:'results',title:'Resultados',path:'/dashboard/tools/analytics'+q},
  {id:'settings',title:'Configuración',path:'/dashboard/settings'+q},
 ];
}

export function destinationMatchesRoute(destination:ProjectDestination,type:ModuleType):boolean{const match=destination.path.match(/^\/modules\/([^/]+)/);return !match||match[1]===type;}

/** Opening a project is predictable; resuming a tool is an explicit separate action. */
export function projectStartPath(projectId:string,taskId?:string|null){
 const params:Record<string,string>={view:'start'};
 if(taskId&&taskId.length<=200&&!/[\u0000-\u001f]/.test(taskId))params.task=taskId;
 return destinationPath(projectId,{path:'/dashboard',params});
}
