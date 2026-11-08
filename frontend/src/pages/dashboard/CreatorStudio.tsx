import PillarWorkshop from '../../experience/PillarWorkshop';
import {brandProfile,type BrandProfile} from '../../experience/brandProfile';
import {confirmWorkspaceNavigation} from '../../lib/useUnsavedNavigation';
import {lazy,Suspense,useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import {useActiveProjectsStore} from '../../stores/useActiveProjectsStore';
import {projectModuleType} from '../../modules/moduleProjects';
import {isSavedProject} from './areaModel';
import {ToolkitProvider,useToolkit} from '../../toolkit/ToolkitContext';
import {businessFromProject,type LandingDraft} from '../../toolkit/types';
import {readableStudioDraft} from './studioJourney';
import UnifiedDashboard from './UnifiedDashboard';
import PageComposer from '../../experience/PageComposer';
import {emptyProposal,parseProposal} from '../../proposal/model';
import {studioSources,type CreativeSource} from '../../studio/model';
import {ButtonSecondary} from '../../components/ui/DesignSystem';
import StudioComposer from '../../studio/StudioComposer';
import CampaignStudio from '../../studio/CampaignStudio';
import StudioLibrary from '../../studio/StudioLibrary';
const SocialProfile=lazy(()=>import('../../social/SocialProfile'));
import './creatorStudio.css';
import '../../studio/studio.css';
export default function CreatorStudio() {
  const { user } = useAuth();
  const store = useActiveProjectsStore();
  const [params] = useSearchParams();
  useEffect(() => { if (user && store.cloudUserId !== user.id) void store.hydrateFromSupabase(user.id); }, [user?.id, store.cloudUserId]);
  const projects = store.cloudUserId === user?.id ? Object.values(store.projectsById).filter(p => isSavedProject(p.id) && !p.cloudPending && projectModuleType(p)) : [];
  const requested = params.get('project');
  const project = requested ? projects.find(p => p.id === requested) : projects.find(p => p.id === store.activeProjectId) ?? projects[0];
  if (!user || store.cloudUserId !== user.id) return <p role="status">Cargando tu espacio creativo…</p>;
  if (params.get('create') === '1' || params.get('view') === 'management') return <UnifiedDashboard />;
  if (!project) return <section className="cs-empty"><h1>{requested ? 'No encontramos este proyecto' : 'Tu próxima idea empieza aquí'}</h1><Link to={requested ? '/creator-studio' : '/dashboard?create=1'}>{requested ? 'Ver mis proyectos' : '＋ Crear mi proyecto'}</Link></section>;
  return <ToolkitProvider key={`${user.id}:${project.id}`} userId={user.id} projectId={project.id} business={businessFromProject(project)}><StudioHome type={projectModuleType(project)!} /></ToolkitProvider>;
}
function StudioHome({type}:{type:NonNullable<ReturnType<typeof projectModuleType>>}){
 const {business,docs,loading,loadError,reload,projectId,documentRevision}=useToolkit();
 const [params,setParams]=useSearchParams(),[working,setWorking]=useState(false);
 const pillarWorkshop=params.get('start')==='pillars';
 const firstContent=params.get('start')==='first-content'||pillarWorkshop;
 const focusedPiece=params.get('tab')==='profile'&&Boolean(params.get('piece'));
 const tab=['create','campaigns','profile','library'].includes(params.get('tab')||'')?params.get('tab')!:'create';
 if(loading)return <p role="status" className="studio-loading">Abriendo tu estudio…</p>;
 if(loadError)return <section role="alert"><h1>No pudimos abrir tu estudio</h1><ButtonSecondary onClick={()=>void reload()}>Reintentar</ButtonSecondary></section>;
 let sources:CreativeSource[],brand:BrandProfile|undefined;
 try{brand=brandProfile(docs['module-project-diagnostic'],docs['module-proposal']===undefined?emptyProposal():parseProposal(docs['module-proposal']),projectId,documentRevision('module-project-diagnostic'));sources=studioSources({project:projectId,type,proposal:docs['module-proposal']===undefined?emptyProposal():parseProposal(docs['module-proposal']),page:readableStudioDraft(docs.landing)?docs.landing as LandingDraft:null,catalog:docs[`module-${type}`],revisions:{proposal:documentRevision('module-proposal'),page:documentRevision('landing'),catalog:documentRevision(`module-${type}`)}});}catch(e){return <section role="alert"><h1>Conservamos tu información.</h1><p>{(e as Error).message}</p><ButtonSecondary onClick={()=>void reload()}>Reintentar lectura</ButtonSecondary></section>;}
 function switchTab(value:string){if(!confirmWorkspaceNavigation())return;const next=new URLSearchParams(params);next.set('tab',value);next.delete('piece');next.delete('campaign');next.delete('section');next.delete('pin');next.delete('intent');if(next.get('return')!=='island')next.delete('return');next.delete('from');next.delete('offer');next.delete('pageRevision');next.delete('viewport');next.delete('start');next.delete('task');next.delete('pillar');next.delete('topic');next.delete('compose');next.delete('creation');next.delete('design');setParams(next);}
 return <section className={`studio-integrated${firstContent?' studio-first-content':''}`} >{!firstContent&&!focusedPiece&&<header className="studio-heading"><div><small>{business.name}</small>{tab!=='create'&&<h1>{tab==='profile'?'Tu contenido, a tu manera.':'Tu estudio creativo.'}</h1>}</div><label className="studio-small-select"><span className="sr-only">Vista de Creator Studio</span><select aria-label="Vista de Creator Studio" disabled={working} value={tab} onChange={e=>switchTab(e.target.value)}><option value="create">Crear</option><option value="campaigns">Campañas</option><option value="profile">Mi perfil</option><option value="library">Biblioteca</option></select></label></header>}<Suspense fallback={<p role="status">Abriendo tu espacio…</p>}>{pillarWorkshop?<PillarWorkshop/>:tab==='campaigns'?<CampaignStudio sources={sources} onBusy={setWorking} startNew={params.get('start')==='campaign'}/>:tab==='profile'?<SocialProfile/>:tab==='library'?<StudioLibrary/>:<StudioComposer brand={brand} key={projectId+':'+(params.get('campaign')||'independent')} sources={sources} onBusy={setWorking}/>}</Suspense>{!firstContent&&!focusedPiece&&<details className="studio-more-tools"><summary>Otras formas de crear y continuar</summary><nav><Link to={`/dashboard/tools/landing?project=${projectId}`}>Editar mi página</Link><Link to={`/dashboard/tools/proposal?project=${projectId}`}>Revisar mis ofertas</Link><Link to={`/dashboard/tools/content?project=${projectId}`}>Preparar texto con IA</Link><Link to={`/dashboard/tools/teleprompter?project=${projectId}`}>Abrir teleprompter</Link><Link to={`/content-creator?project=${projectId}`}>Biblioteca de plantillas y editor manual</Link></nav><details><summary>Piezas de mi página y carrusel</summary><PageComposer/></details></details>}</section>;
}
