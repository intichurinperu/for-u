import {createPortal} from 'react-dom';
import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {ButtonSecondary,Input} from '../../components/ui/DesignSystem';
import {useDialogFocus} from '../../toolkit/useDialogFocus';
import {areaToolPath} from './areaModel';
import type {ModuleType} from '../../modules/moduleProjects';
type Tool={title:string;path:string;icon:string;help:string};
export default function WorkspaceTools({links,projectId,type,onNavigate}:{links:Tool[];projectId?:string;type:ModuleType;onNavigate:(path:string)=>void}){
 const [open,setOpen]=useState(false),[search,setSearch]=useState('');const dialog=useRef<HTMLDivElement>(null);
 const close=()=>setOpen(false);useDialogFocus(dialog,open,close);
 useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;};},[open]);
 const extra=projectId?[['Creador visual','creator','🎨'],['Plantillas','landing&page=templates','🪄'],['Contenido con IA','content','✨'],['Teleprompter','teleprompter','🎬'],['Reservas','bookings','📆'],['Contacto y respuestas','automation','💬']].map(([title,key,icon])=>({title,icon,help:'',path:key.includes('&')?`/dashboard/tools/landing?project=${projectId}&page=templates`:areaToolPath(key,type,projectId)})):[];
 const tools=[...links,...extra].filter((tool,i,all)=>all.findIndex(v=>v.path===tool.path)===i).filter(tool=>tool.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
 return <><ButtonSecondary className="workspace-tool-search" disabled={!projectId} onClick={()=>{setSearch('');setOpen(true);}}>⌕ Todas las herramientas</ButtonSecondary>{open&&createPortal(<div className="foru-experience foru-tools-portal"><div className="area-modal-backdrop"><div ref={dialog} className="area-modal-dialog workspace-tool-dialog" role="dialog" aria-modal="true" aria-labelledby="tools-title"><header className="area-modal-heading"><div><h2 id="tools-title">¿Qué quieres hacer?</h2><p>Herramientas de este proyecto</p></div><ButtonSecondary aria-label="Cerrar herramientas" onClick={close}>Cerrar ×</ButtonSecondary></header><Input autoFocus label="Buscar herramienta" placeholder="Ej. teleprompter, calendario…" value={search} onChange={e=>setSearch(e.target.value)}/><nav className="workspace-tool-grid" aria-label="Todas las herramientas">{tools.map(tool=><Link key={tool.path} to={tool.path} onClick={()=>{onNavigate(tool.path);close();}}><span aria-hidden="true">{tool.icon}</span>{tool.title}<span aria-hidden="true">→</span></Link>)}</nav>{!tools.length&&<p role="status">No encontramos una herramienta con ese nombre.</p>}</div></div></div>,document.body)}</>;
}
