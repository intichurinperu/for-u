import EditorSheet from '../toolkit/EditorSheet';
import MapIdea from './MapIdea';
import {emptyInbox,parseInbox} from './journeyModel';
import TaskBoard from './TaskBoard';
import {useActiveProjectsStore} from '../stores/useActiveProjectsStore';
import {taskWorkPath} from '../pages/dashboard/workspaceFocusModel';
import {emptyProjectRoute,parseProjectRoute} from '../workspace/contracts';
import {useAuth} from '../contexts/AuthContext';
import {usePrivateDocument} from './usePrivateDocument';
import ProjectCalendar from './ProjectCalendar';
import {lazy,Suspense,useState,useEffect} from 'react';
import {useSearchParams,useNavigate} from 'react-router-dom';
import {useAreaDocuments} from '../pages/dashboard/AreaDocuments';
import {updateTaskState,type AreaId,type AreaTask} from '../pages/dashboard/areaModel';
import type {ModuleType} from '../modules/moduleProjects';
import {ButtonPrimary,ButtonSecondary} from '../components/ui/DesignSystem';
const MindWorkspace=lazy(()=>import('./MindWorkspace'));
export default function ProjectViews({projectId,type,onArea}:{projectId:string;type:ModuleType;onArea:(id:AreaId)=>void}){
 const [scheduleId,setScheduleId]=useState<string|null>(null);
 const [mapFocus,setMapFocus]=useState<AreaId|null>(null);
 const [ideaOpen,setIdeaOpen]=useState(false),[ideaId,setIdeaId]=useState<string|undefined>();
 const projectName=useActiveProjectsStore(state=>state.projectsById[projectId]?.name)||'Tu proyecto';
 const {user}=useAuth();
 const route=usePrivateDocument(user!.id,projectId,'project-route',()=>emptyProjectRoute(projectId),v=>parseProjectRoute(v,projectId));
 const inbox=usePrivateDocument(user!.id,projectId,'idea-inbox',emptyInbox,parseInbox);
 const {entry,change,save}=useAreaDocuments(projectId,type);const [params,setParams]=useSearchParams();
 const storageKey=`foru-view:${user!.id}:${projectId}`;const [remembered,setRemembered]=useState(()=>{try{return localStorage.getItem(storageKey)||'map';}catch{return 'map';}});
 useEffect(()=>{setScheduleId(null);setMapFocus(null);setIdeaOpen(false);setIdeaId(undefined);try{const saved=localStorage.getItem(storageKey);setRemembered(['map','kanban','calendar'].includes(saved||'')?saved!:'map');}catch{setRemembered('map');}},[storageKey]);
 const requested=params.get('view');const view=['map','kanban','calendar'].includes(requested||'')?requested!:requested==='management'?'map':remembered;
 useEffect(()=>{if(['map','kanban','calendar'].includes(requested||'')){setRemembered(requested!);try{localStorage.setItem(storageKey,requested!);}catch{}}},[storageKey,requested]);

 const navigate=useNavigate();
 const open=(t:AreaTask)=>{const path=taskWorkPath(projectId,t,type);if(path){navigate(path);return;}const next=new URLSearchParams(params);next.set('area',t.area);next.set('task',t.id);setParams(next,{replace:true});};
 const update=(id:string,value:Partial<AreaTask>)=>{if(!entry)return;change({tasks:{...entry.tasks,version:2,tasks:entry.tasks.tasks.map(t=>t.id===id?{...t,...value}:t)}});};
 if(!entry?.loaded)return <p role="status">Tu mapa está tomando forma…</p>;
 const scheduledTask=entry.tasks.tasks.find(task=>task.id===scheduleId);
 return <section className="project-views">{route.error&&<p role="alert">No se pudieron cargar todos los motivos de tu ruta. Tus tareas siguen disponibles.</p>}
 {view==='map'&&<section className="map-thought-space">{ideaOpen?<MapIdea key={projectId+':'+(ideaId||'new')} user={user!.id} project={projectId} type={type} ideaId={ideaId} onClose={()=>setIdeaOpen(false)}/>:<><div><h2>¿Qué tienes en mente?</h2><p>Guárdalo a tu manera. FOR U puede ayudarte a encontrar su lugar.</p></div><ButtonPrimary onClick={()=>{setIdeaId(undefined);setIdeaOpen(true);}}>＋ Tengo una idea</ButtonPrimary>{inbox.error&&<p role="alert">No se pudieron leer tus ideas. Tus tareas siguen disponibles.</p>}{inbox.data.ideas.some(idea=>idea.category==='unclear')&&<details><summary>Ideas por descubrir · {inbox.data.ideas.filter(idea=>idea.category==='unclear').length}</summary>{inbox.data.ideas.filter(idea=>idea.category==='unclear').map(idea=><button type="button" key={idea.id} className="map-saved-idea" onClick={()=>{setIdeaId(idea.id);setIdeaOpen(true);}}>✦ {idea.text.slice(0,160)}</button>)}</details>}</>}</section>}
 {view==='map'?(ideaOpen?null:<Suspense fallback={<p role="status">Abriendo tu mapa…</p>}><MindWorkspace key={projectId} projectName={projectName} focus={mapFocus} onFocus={setMapFocus} tasks={entry.tasks.tasks} ideas={inbox.data.ideas} onIdea={id=>{setIdeaId(id);setIdeaOpen(true);window.scrollTo({top:0,behavior:'auto'});}} onTask={open} onArea={onArea}/></Suspense>):view==='kanban'?<TaskBoard projectId={projectId} tasks={entry.tasks.tasks} busy={entry.busy||entry.taskStatus==='conflict'} onOpen={open} onMove={(task,status)=>{update(task.id,updateTaskState(task,status));void save();}}/>:<section><ProjectCalendar projectId={projectId} tasks={entry.tasks.tasks} onOpen={open}/><details className="calendar-unscheduled-tasks"><summary>Elegir fecha para una tarea</summary>{entry.tasks.tasks.map(task=><button type="button" key={task.id} onClick={()=>setScheduleId(task.id)}>{task.title}<small>{task.date||'Sin fecha'}</small></button>)}</details></section>}
 <EditorSheet open={Boolean(scheduledTask)} title="¿Cuándo quieres hacerlo?" onClose={()=>setScheduleId(null)}>{scheduledTask&&<><p>{scheduledTask.title}</p><label className="calendar-task-date">Fecha de este paso<input type="date" value={scheduledTask.date||''} disabled={entry.busy||entry.taskStatus==='conflict'} onInput={event=>update(scheduledTask.id,{date:event.currentTarget.value||undefined})} onChange={event=>update(scheduledTask.id,{date:event.target.value||undefined})}/></label><ButtonPrimary disabled={entry.busy||entry.taskStatus==='conflict'} onClick={()=>void save().then(ok=>{if(ok)setScheduleId(null);})}>Guardar fecha</ButtonPrimary>{entry.error&&<p role="alert">{entry.error}</p>}</>}</EditorSheet>
 <div className="experience-save"><span role={entry.error?'alert':'status'}>{entry.error|| (entry.busy?'Guardando…':entry.taskDirty?'Cambios pendientes':entry.taskRevision?'Tareas guardadas':'Guía inicial · guarda para conservarla')}</span>{(entry.taskDirty||!entry.taskRevision&&entry.tasks.tasks.length>0)&&<ButtonPrimary disabled={entry.busy||entry.taskStatus==='conflict'} onClick={()=>void save()}>Guardar mis pasos</ButtonPrimary>}</div></section>;
}
