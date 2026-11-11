import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Link,useLocation,useNavigate,useSearchParams} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {useActiveProjectsStore} from '../stores/useActiveProjectsStore';
import {projectModuleType,type ModuleType} from '../modules/moduleProjects';
import {loadModuleDocument,persistModuleProject,saveModuleDocument} from '../services/moduleDocuments';
import {useWorkspaceFocus} from '../pages/dashboard/WorkspaceFocus';
import {accountPreferences} from '../pages/dashboard/workspaceFocusModel';
import {useDialogFocus} from '../toolkit/useDialogFocus';
import {businessRoutes,type BusinessRoute} from '../workspace/contracts';
import {ButtonPrimary,ButtonSecondary,Input} from '../components/ui/DesignSystem';
import Logo from '../components/Logo';
import ProjectNameStep from './ProjectNameStep';
import ProjectActivityStep from './ProjectActivityStep';
import {creationDraft,type CreationDraft} from './creationDraft';
import './guidedProject.css';
export type {CreationDraft} from './creationDraft';
export function BoatArt(){return <div className="guide-horizon" aria-hidden="true"><span className="guide-sun"/><span className="guide-island"/><span className="guide-boat"><i/><b/></span><span className="guide-wave"/><span className="guide-star">✦</span></div>;}
export const routeNames:Record<BusinessRoute,string>={restaurant:'Restaurante',ecommerce:'Tienda',hospitality:'Hospedaje',tourism:'Turismo',courses:'Cursos',services:'Servicios y ofertas mixtas'};
export const routeSymbols:Record<BusinessRoute,string>={restaurant:'☕',ecommerce:'◈',hospitality:'⌂',tourism:'⌁',courses:'✎',services:'✦'};
export function projectRouteType(project:{strategyProfile?:Record<string,unknown>;industryKey?:string}|undefined):BusinessRoute{const saved=project?.strategyProfile?.businessRoute;return businessRoutes.includes(saved as BusinessRoute)?saved as BusinessRoute:project?projectModuleType(project)??'services':'services';}
export function ProjectWizard({onClose,startWithName=false}:{onClose:()=>void;startWithName?:boolean}){
 const {user}=useAuth(),store=useActiveProjectsStore(),focus=useWorkspaceFocus(),navigate=useNavigate();
 const {pathname}=useLocation();
 const key=`foru-create-v2:${user!.id}`,dialog=useRef<HTMLDivElement>(null),lock=useRef(false);
 const [draft,setDraft]=useState<CreationDraft>(()=>{const prefs=accountPreferences(focus.state.data);try{return creationDraft(JSON.parse(localStorage.getItem(key)||'null'),prefs,startWithName);}catch{return creationDraft(null,prefs,startWithName);}});
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const patch=(value:Partial<CreationDraft>)=>{const next={...draft,...value};setDraft(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{setError('Tu navegador no permite conservar este paso al cerrar. Puedes continuar; guardaremos el proyecto en tu cuenta.');}return next;};
 const nameScreen=startWithName&&draft.step===2;
 const activityScreen=startWithName&&draft.step===3;
 useDialogFocus(dialog,!nameScreen&&!activityScreen,()=>{if(!lock.current)onClose();});
 useEffect(()=>{const old=document.body.style.overflow,root=document.getElementById('root'),inert=root?.inert;document.body.style.overflow='hidden';if(root)root.inert=true;return()=>{document.body.style.overflow=old;if(root)root.inert=inert??false;};},[]);
 async function create(){
  if(lock.current||!user||!draft.route)return;lock.current=true;setBusy(true);setError('');
  try{
   const type:ModuleType=draft.route==='services'?'ecommerce':draft.route;
   const id=draft.projectId??store.openProject({name:draft.name.trim()||'Mi proyecto',industryKey:(type==='restaurant'?'gastronomy':type) as never,strategyProfile:{moduleType:type,businessRoute:draft.route}});
   const savedDraft=patch({projectId:id});
   const project=useActiveProjectsStore.getState().getProjectById(id);if(!project)throw new Error('No encontramos el proyecto preparado en este dispositivo. Conservamos tus respuestas.');
   await persistModuleProject(user.id,project);
   const tasks=await loadModuleDocument(user.id,id,'area-tasks');if(!tasks)await saveModuleDocument(user.id,id,'area-tasks',{version:2,tasks:[]},null);
   store.switchProject(id);
   if(savedDraft.entry==='guided'&&savedDraft.savePreferences!==false){if(!focus.state.loaded)throw new Error('Tu proyecto está guardado. Falta cargar las preferencias de tu cuenta; reintenta para continuar.');focus.setPreferences({...accountPreferences(focus.state.data),preferredName:savedDraft.preferredName.trim()||accountPreferences(focus.state.data).preferredName,addressing:savedDraft.addressing});if(!await focus.save())throw new Error('Tu proyecto está guardado. Falta guardar tus preferencias personales; reintenta para continuar.');}
   localStorage.removeItem(key);
   navigate(savedDraft.entry==='manual'?`/dashboard/tools/landing?project=${id}`:savedDraft.entry==='explore'?`/dashboard?project=${id}&view=map`:`/dashboard?project=${id}&setup=1`,{replace:pathname==='/dashboard'});
  }catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}
 }
 if(nameScreen)return createPortal(<ProjectNameStep name={draft.name} readOnly={!!draft.projectId} error={error} onName={name=>patch({name})} onNext={()=>patch({step:3})} onClose={onClose}/>,document.body);
 if(activityScreen)return createPortal(<ProjectActivityStep name={draft.name} route={draft.route} entry={draft.entry} prepared={!!draft.projectId} busy={busy} error={error} onRoute={route=>{if(!lock.current&&!draft.projectId)patch({route});}} onBack={()=>{if(!lock.current&&!draft.projectId)patch({step:2});}} onCreate={()=>void create()} onClose={onClose}/>,document.body);
 const titles=['Antes de tu proyecto, estás tú.','¿Cómo prefieres que te hablemos?','Démosle nombre a tu barco.','¿Qué estás construyendo?'];
 return createPortal(<div className="guided-overlay"><div ref={dialog} className="guided-create" role="dialog" aria-modal="true" aria-labelledby="create-title"><header className="guided-chrome"><Link to="/dashboard" className="guide-wordmark" onClick={e=>{e.preventDefault();if(!busy)onClose();}}><Logo/></Link><ButtonSecondary disabled={busy} onClick={onClose} aria-label="Cerrar creación">×</ButtonSecondary></header>
 {draft.step===-1?<div className="guided-welcome"><div><small>UN ESPACIO PARA TI</small><h1 id="create-title">Tu manera de crear<br/>tiene un lugar.</h1><p>No necesitas tenerlo todo listo. Vamos a descubrir un siguiente paso que tenga sentido para ti.</p><ButtonPrimary onClick={()=>patch({entry:'guided',step:0})}>Preparar mi ruta <span aria-hidden="true">→</span></ButtonPrimary><div className="guide-alternatives"><ButtonSecondary onClick={()=>patch({entry:'explore',step:2})}>Explorar primero</ButtonSecondary><ButtonSecondary onClick={()=>patch({entry:'manual',step:2})}>Crear manualmente</ButtonSecondary></div><p className="guide-reassurance">Sin fotos obligatorias. Sin hacerlo todo hoy.</p></div><BoatArt/></div>:<section className="guided-question"><span className="guide-question-symbol" aria-hidden="true">{['☺','◌','⛵','✦'][draft.step]}</span><small>{draft.step<2?'TÚ AL MANDO':'TU BARCO'}</small><h1 id="create-title">{titles[draft.step]}</h1><p>{['¿Cómo te gusta que te llamen? Puedes dejarlo para después.','Tú eliges. No lo deducimos de tu nombre ni de tu voz.','¿Cómo se llama tu proyecto? Podrás cambiarlo más adelante.','Solo elegimos un punto de partida. Tu negocio puede combinar varias ofertas.'][draft.step]}</p>
 {draft.step===0?<Input label="Tu nombre preferido" value={draft.preferredName} maxLength={120} onChange={e=>patch({preferredName:e.target.value})}/>:draft.step===1?<div className="guide-options">{([['neutral','Lenguaje neutral'],['feminine','En femenino'],['masculine','En masculino'],['at','Con @']] as const).map(([id,label])=><button key={id} type="button" className={draft.addressing===id?'is-selected':''} aria-pressed={draft.addressing===id} onClick={()=>patch({addressing:id})}><span aria-hidden="true">{draft.addressing===id?'✓':'◌'}</span>{label}</button>)}</div>:draft.step===2?<Input label="Nombre de tu proyecto" value={draft.name} maxLength={120} disabled={!!draft.projectId} onChange={e=>patch({name:e.target.value})} placeholder="Mi próxima gran idea"/>:<div className="guide-options">{businessRoutes.map(route=><button type="button" key={route} className={draft.route===route?'is-selected':''} aria-pressed={draft.route===route} disabled={!!draft.projectId} onClick={()=>patch({route})}><span aria-hidden="true">{routeSymbols[route]}</span>{routeNames[route]}</button>)}</div>}
 <footer className="guide-question-actions"><ButtonSecondary disabled={busy||!!draft.projectId} onClick={()=>patch({step:draft.step===2&&draft.entry!=='guided'?-1:draft.step-1})}>← Atrás</ButtonSecondary><ButtonPrimary disabled={busy||(draft.step===3&&!draft.route)} onClick={()=>draft.step===3?void create():patch({step:draft.step+1})}>{busy?'Guardando tu espacio…':draft.step===3?(draft.projectId?'Reintentar guardado':draft.entry==='manual'?'Abrir mi página':draft.entry==='explore'?'Entrar a explorar':'Continuar →'):'Continuar →'}</ButtonPrimary>{draft.step<3&&<ButtonSecondary disabled={busy} onClick={()=>patch({step:draft.step+1})}>Omitir</ButtonSecondary>}</footer><small className="guide-save-note">{draft.projectId?'El proyecto está preparado. Un reintento conserva su identidad.':'Puedes salir y retomar este paso en este dispositivo.'}</small></section>}
 {error&&<p className="guide-error" role="alert">{error}</p>}
 </div></div>,document.body);
}
