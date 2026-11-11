import {useEffect,useMemo,useSyncExternalStore} from 'react';
import ReactFlow,{Handle,Position,Controls,Background,ReactFlowProvider,useReactFlow,useNodesInitialized,type NodeProps,type Node,type Edge} from 'reactflow';
import 'reactflow/dist/style.css';
import {areaDefinitions,type AreaId,type AreaTask} from '../pages/dashboard/areaModel';
import type {Idea} from './journeyModel';
import './mindWorkspace.css';
type CardData={label:string;caption:string;tone:string;kind:'root'|'area'|'idea'|'task';onOpen:()=>void};
function ThoughtNode({data}:NodeProps<CardData>){return <><Handle type="target" position={Position.Left}/><button className={`thought-node nodrag nopan thought-node-${data.kind}`} style={{'--thought-tone':data.tone} as React.CSSProperties} onClick={event=>{event.stopPropagation();data.onOpen();}}><small>{data.caption}</small><strong>{data.label}</strong><span aria-hidden="true">{data.kind==='root'?'＋':'↗'}</span></button><Handle type="source" position={Position.Right}/></>;}
const nodeTypes={thought:ThoughtNode};
const desktopQuery='(min-width: 768px)';
function observeViewport(notify:()=>void){const media=window.matchMedia(desktopQuery);media.addEventListener('change',notify);return()=>media.removeEventListener('change',notify);}
function isDesktop(){return window.matchMedia(desktopQuery).matches;}

function Fit({signature}:{signature:string}){const {fitView}=useReactFlow();const ready=useNodesInitialized();useEffect(()=>{if(!ready)return;const id=requestAnimationFrame(()=>void fitView({padding:.16,maxZoom:1,minZoom:.55,duration:0}));return()=>cancelAnimationFrame(id);},[signature,fitView,ready]);return null;}
export default function MindWorkspace({projectName,tasks,ideas,onIdea,onTask,onArea,focus,onFocus:setFocus}:{projectName:string;tasks:AreaTask[];ideas:Idea[];onIdea:(id?:string)=>void;onTask:(task:AreaTask)=>void;onArea:(area:AreaId)=>void;focus:AreaId|null;onFocus:(area:AreaId|null)=>void}){
 const desktop=useSyncExternalStore(observeViewport,isDesktop,()=>false);
 const graph=useMemo(()=>{
  const nodes:Node<CardData>[]=[];const edges:Edge[]=[];
  const add=(id:string,label:string,caption:string,kind:CardData['kind'],x:number,y:number,tone:string,onOpen:()=>void)=>nodes.push({id,type:'thought',position:{x,y},data:{label,caption,kind,tone,onOpen},draggable:false});
  const link=(source:string,target:string,color:string)=>edges.push({id:`${source}→${target}`,source,target,type:'smoothstep',style:{stroke:color,strokeWidth:2},focusable:false});
  const visible=areaDefinitions.filter(a=>!focus||a.id===focus);
  const areaItems=(area:AreaId)=>[...ideas.filter(i=>i.category===area).map(i=>({id:`idea:${i.id}`,label:i.text,caption:'Idea · abrir para organizar',kind:'idea' as const,onOpen:()=>onIdea(i.id),source:i.id})),...tasks.filter(t=>t.area===area).map(t=>({id:`task:${t.id}`,label:t.title,caption:t.done?'Paso terminado':t.status==='doing'?'Paso en curso':'Paso pendiente',kind:'task' as const,onOpen:()=>onTask(t),source:t.id}))];
  const count=focus?Math.max(1,areaItems(focus).length):4;
  const middle=(count-1)*70;
  add('project',projectName,'Tu proyecto · añadir idea','root',0,middle,'#e7eaf5',()=>onIdea());
  visible.forEach((a,index)=>{
   const ownTasks=tasks.filter(t=>t.area===a.id);const ownIdeas=ideas.filter(i=>i.category===a.id);
   const y=focus?middle:index*140;
   add(a.id,a.title,ownIdeas.length||ownTasks.length?`${ownIdeas.length} ${ownIdeas.length===1?'idea':'ideas'} · ${ownTasks.filter(t=>t.done).length}/${ownTasks.length} pasos`:'Un espacio por descubrir','area',330,y,a.color,()=>setFocus(focus?null:a.id));link('project',a.id,a.color);
   if(focus)areaItems(a.id).forEach((item,i)=>{add(item.id,item.label,item.caption,item.kind,660,i*140,a.color,item.onOpen);const parent=item.kind==='task'&&ownIdeas.some(idea=>idea.id===item.source||idea.taskId===item.source)?`idea:${ownIdeas.find(idea=>idea.id===item.source||idea.taskId===item.source)!.id}`:a.id;link(parent,item.id,a.color);});
  });return {nodes,edges};
 },[focus,projectName,tasks,ideas,onIdea,onTask,setFocus]);
 const active=areaDefinitions.find(a=>a.id===focus);
 return <section className="thinking-map" aria-label="Mapa de ideas y pasos de tu proyecto"><div className="thinking-map-heading"><div><span className="thinking-map-eyebrow">Tu espacio para pensar</span><h2>{active?active.title:'Todo parte de tu proyecto'}</h2><p>{active?'Abre una idea para trabajarla o un paso para hacerlo.':'Elige un área para desplegar sus ideas y pasos.'}</p></div>{active&&<button type="button" className="thinking-map-back" onClick={()=>setFocus(null)}>← Mapa completo</button>}</div>
 {desktop?<div className="thinking-map-desktop"><ReactFlowProvider><ReactFlow nodes={graph.nodes} edges={graph.edges} onNodeClick={(_,node)=>node.data.onOpen()} nodeTypes={nodeTypes} fitView fitViewOptions={{maxZoom:1,padding:.16}} minZoom={.35} maxZoom={1.5} nodesFocusable={false} nodesConnectable={false} nodesDraggable={false} elementsSelectable={false} zoomOnScroll={false} panOnScroll={false} preventScrolling={false} proOptions={{hideAttribution:false}}><Background color="#dce3dc" gap={24}/><Controls showInteractive={false}/><Fit signature={`${focus}:${graph.nodes.map(n=>n.id).join(',')}`}/></ReactFlow></ReactFlowProvider></div>:
 <div className="thinking-map-mobile"><button className="thinking-mobile-root" onClick={()=>onIdea()}><small>Tu proyecto</small><strong>{projectName}</strong><span>＋ Añadir idea</span></button>{areaDefinitions.filter(a=>!focus||a.id===focus).map(a=><section key={a.id} style={{'--thought-tone':a.color} as React.CSSProperties}><button className="thinking-mobile-area" onClick={()=>setFocus(focus?null:a.id)}><strong>{a.title}</strong><span>{ideas.some(i=>i.category===a.id)||tasks.some(t=>t.area===a.id)?`${ideas.filter(i=>i.category===a.id).length} ${ideas.filter(i=>i.category===a.id).length===1?'idea':'ideas'} · ${tasks.filter(t=>t.area===a.id).length} pasos`:'Un espacio por descubrir'}</span></button>{focus&&<div className="thinking-mobile-children">{ideas.filter(i=>i.category===a.id).map(i=><button key={`idea:${i.id}`} onClick={()=>onIdea(i.id)}><small>Idea</small>{i.text}</button>)}{tasks.filter(t=>t.area===a.id).map(t=><button key={`task:${t.id}`} onClick={()=>onTask(t)}><small>{t.done?'Terminado':t.status==='doing'?'En curso':'Paso pendiente'}</small>{t.title}</button>)}</div>}</section>)}</div>
 }{active&&<div className="thinking-area-footer">{!tasks.some(t=>t.area===focus)&&!ideas.some(i=>i.category===focus)&&<p>Este espacio está libre para tus ideas.</p>}<button onClick={()=>onArea(active.id)}>Trabajar en {active.title} →</button></div>}
 </section>;
}
