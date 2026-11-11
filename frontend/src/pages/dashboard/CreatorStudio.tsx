import PillarWorkshop from '../../experience/PillarWorkshop';
import {brandProfile,type BrandProfile} from '../../experience/brandProfile';
import {confirmWorkspaceNavigation} from '../../lib/useUnsavedNavigation';
import {lazy,Suspense,useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {FileText,Image as ImageIcon,Play,X,Video,Mic,LayoutTemplate,Sparkles,Globe} from 'lucide-react';
import PearlButton from '../../components/ui/PearlButton';
import {useAuth} from '../../contexts/AuthContext';
import {useActiveProjectsStore} from '../../stores/useActiveProjectsStore';
import {projectModuleType, type ModuleType} from '../../modules/moduleProjects';
import {isSavedProject} from './areaModel';
import {ToolkitProvider,useToolkit} from '../../toolkit/ToolkitContext';
import {businessFromProject,type LandingDraft} from '../../toolkit/types';
import {readableStudioDraft} from './studioJourney';
import UnifiedDashboard from './UnifiedDashboard';
import PageComposer from '../../experience/PageComposer';
import {emptyProposal,parseProposal} from '../../proposal/model';
import {studioSources,type CreativeSource} from '../../studio/model';
import {contentDocument} from '../../studio/saveComposition';
import {type ContentDraft} from '../../components/shared/contentModel';
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
  const type = projectModuleType(project) || 'restaurant';
  return <ToolkitProvider key={`${user.id}:${project.id}`} userId={user.id} projectId={project.id} business={businessFromProject(project)}><StudioHome type={type} /></ToolkitProvider>;
}
function StudioHome({type}:{type:ModuleType}){
 const {business,docs,loading,loadError,reload,projectId,documentRevision}=useToolkit();
 const [params,setParams]=useSearchParams(),[working,setWorking]=useState(false);
 const pillarWorkshop=params.get('start')==='pillars';
 const firstContent=params.get('start')==='first-content'||pillarWorkshop;
 const focusedPiece=params.get('tab')==='profile'&&Boolean(params.get('piece'));
 const inCanvasEditor=params.get('compose')==='idea'||params.get('creation')==='design';

 if(loading)return <p role="status" className="studio-loading">Abriendo tu estudio…</p>;
 if(loadError)return <section role="alert"><h1>No pudimos abrir tu estudio</h1><ButtonSecondary onClick={()=>void reload()}>Reintentar</ButtonSecondary></section>;

 let sources:CreativeSource[],brand:BrandProfile|undefined;
 try{
  const proposalDoc = !docs['module-proposal'] ? emptyProposal() : parseProposal(docs['module-proposal']);
  brand=brandProfile(docs['module-project-diagnostic'],proposalDoc,projectId,documentRevision('module-project-diagnostic'));
  sources=studioSources({project:projectId,type,proposal:proposalDoc,page:readableStudioDraft(docs.landing)?docs.landing as LandingDraft:null,catalog:docs[`module-${type}`],revisions:{proposal:documentRevision('module-proposal'),page:documentRevision('landing'),catalog:documentRevision(`module-${type}`)}});
 }catch(e){
  return <section role="alert"><h1>Conservamos tu información.</h1><p>{(e as Error).message}</p><ButtonSecondary onClick={()=>void reload()}>Reintentar lectura</ButtonSecondary></section>;
 }

 const rawOffers=params.get('offers')||'';
 const landingParams = new URLSearchParams({ project: projectId, return: 'studio-page' });
 if (rawOffers && rawOffers.length <= 500) landingParams.set('offers', rawOffers);
 const landingEditorPath = '/dashboard/tools/landing?' + landingParams;
 const requestedOfferIds=rawOffers.split(',').map(s=>s.trim()).filter(Boolean);
 const offerSources=sources.filter(s=>s.group==='offer');
 const selectedOfferSources=offerSources.filter(s=>{
  const id=s.reference?.id||'';
  const keyNoPrefix=s.key.replace(/^(proposal|catalog):/,'');
  return requestedOfferIds.includes(id)||requestedOfferIds.includes(s.key)||requestedOfferIds.includes(keyNoPrefix);
 });

 function removeOffer(source:CreativeSource){
  const idToRemove=source.reference?.id||source.key;
  const keyNoPrefix=source.key.replace(/^(proposal|catalog):/,'');
  const nextIds=requestedOfferIds.filter(id=>id!==idToRemove&&id!==source.key&&id!==keyNoPrefix);
  const next=new URLSearchParams(params);
  if(nextIds.length>0)next.set('offers',nextIds.join(','));
  else next.delete('offers');
  setParams(next);
 }

 const rawTab=params.get('tab')||'posts';
 const activeArea:'page'|'posts'|'videos'|'campaigns'|'profile'|'library'=
  rawTab==='page'||rawTab==='pagina'?'page':
  rawTab==='videos'||rawTab==='video'?'videos':
  rawTab==='campaigns'?'campaigns':
  rawTab==='profile'?'profile':
  rawTab==='library'?'library':
  'posts';

 function switchArea(area:'page'|'posts'|'videos'|'campaigns'|'profile'|'library'){
  if(!confirmWorkspaceNavigation())return;
  const next=new URLSearchParams(params);
  next.set('tab',area);
  next.delete('piece');
  next.delete('creation');
  next.delete('compose');
  next.delete('design');
  next.delete('section');
  next.delete('start');
  setParams(next);
 }

 let drafts:ContentDraft[]=[];
 try{
  drafts=contentDocument(docs['module-content-creator'],projectId).drafts;
 }catch{
  drafts=[];
 }
 const page=readableStudioDraft(docs.landing)?(docs.landing as LandingDraft):null;

 return <section className={`studio-integrated${firstContent?' studio-first-content':''}`}>
  {!firstContent&&!focusedPiece&&<header className="studio-unified-header">
   <div className="studio-title-row">
    <div className="studio-brand-badge">
     <small>{business.name}</small>
     <h1>Creator Studio</h1>
    </div>
    <div className="studio-secondary-nav">
     <details className="studio-aux-menu">
      <summary aria-label="Más secciones de Creator Studio">Más opciones ▾</summary>
      <nav>
       <button type="button" onClick={()=>switchArea('campaigns')}>Campañas</button>
       <button type="button" onClick={()=>switchArea('profile')}>Mi perfil</button>
       <button type="button" onClick={()=>switchArea('library')}>Biblioteca</button>
      </nav>
     </details>
    </div>
   </div>

   {selectedOfferSources.length>0&&<div className="studio-offer-chips" aria-label="Ofertas seleccionadas">
    {selectedOfferSources.map(source=><span key={source.key} className="studio-offer-chip">
     {source.image?<img src={source.image} alt="" className="studio-chip-thumb"/>:<span className="studio-chip-icon" aria-hidden="true">🏷️</span>}
     <strong className="studio-chip-title">{source.title}</strong>
     <button type="button" className="studio-chip-remove" aria-label={`Quitar oferta ${source.title}`} onClick={()=>removeOffer(source)}>
      <X size={14} aria-hidden="true"/>
     </button>
    </span>)}
   </div>}

   <nav className="studio-tab-bar" aria-label="Áreas de creación">
    <button
     type="button"
     className={`studio-tab-btn${activeArea==='page'?' is-active':''}`}
     aria-current={activeArea==='page'?'page':undefined}
     onClick={()=>switchArea('page')}
    >
     <FileText size={18} aria-hidden="true"/>
     <span>Mi página</span>
    </button>
    <button
     type="button"
     className={`studio-tab-btn${activeArea==='posts'?' is-active':''}`}
     aria-current={activeArea==='posts'?'page':undefined}
     onClick={()=>switchArea('posts')}
    >
     <ImageIcon size={18} aria-hidden="true"/>
     <span>Publicaciones</span>
    </button>
    <button
     type="button"
     className={`studio-tab-btn${activeArea==='videos'?' is-active':''}`}
     aria-current={activeArea==='videos'?'page':undefined}
     onClick={()=>switchArea('videos')}
    >
     <Play size={18} aria-hidden="true"/>
     <span>Videos</span>
    </button>
   </nav>
  </header>}

  <Suspense fallback={<p role="status">Abriendo tu espacio…</p>}>
   {pillarWorkshop ? <PillarWorkshop/> :
    activeArea==='campaigns' ? <CampaignStudio sources={sources} onBusy={setWorking} startNew={params.get('start')==='campaign'}/> :
    activeArea==='profile' ? <SocialProfile/> :
    activeArea==='library' ? <StudioLibrary/> :
    activeArea==='page' ? <StudioPageView businessName={business.name} editorPath={landingEditorPath} page={page} selectedOffers={selectedOfferSources}/> :
    activeArea==='videos' ? <StudioVideosView project={projectId} selectedOffers={selectedOfferSources} featuredDraft={drafts[0]} offersQuery={rawOffers}/> :
    inCanvasEditor ? <StudioComposer brand={brand} key={projectId+':'+(params.get('campaign')||'independent')} sources={sources} onBusy={setWorking}/> :
    <StudioPostsView
     projectId={projectId}
     businessName={business.name}
     brand={brand}
     sources={sources}
     drafts={drafts}
     selectedOffers={selectedOfferSources}
     offersQuery={rawOffers}
     onBusy={setWorking}
    />
   }
  </Suspense>

  {!firstContent&&!focusedPiece&&<details className="studio-more-tools">
   <summary>Otras formas de crear y continuar</summary>
   <nav>
    <Link to={landingEditorPath}>Editar mi página</Link>
    <Link to={`/dashboard/tools/proposal?project=${projectId}&section=offers`}>Revisar mis ofertas</Link>
    <Link to={`/dashboard/tools/content?project=${projectId}`}>Preparar texto con IA</Link>
    <Link to={`/dashboard/tools/teleprompter?project=${projectId}`}>Abrir teleprompter</Link>
    <Link to={`/content-creator?project=${projectId}`}>Biblioteca de plantillas y editor manual</Link>
   </nav>
   <details><summary>Piezas de mi página y carrusel</summary><PageComposer/></details>
  </details>}
 </section>;
}

function StudioPostsView({
 projectId,
 businessName,
 brand,
 sources,
 drafts,
 selectedOffers,
 offersQuery,
 onBusy,
}:{
 projectId:string;
 businessName:string;
 brand?:BrandProfile;
 sources:CreativeSource[];
 drafts:ContentDraft[];
 selectedOffers:CreativeSource[];
 offersQuery:string;
 onBusy:(value:boolean)=>void;
}){
 const featuredDraft=drafts[0];
 const featuredOffer=selectedOffers[0]||sources.find(s=>s.group==='offer');
 const featuredImage=featuredDraft?.imagePath||featuredDraft?.sourceImageUrl||featuredOffer?.image||'/brand/foru-project-pavilion.png';
 const featuredTitle=featuredDraft?.title||(featuredOffer?`Publicación: ${featuredOffer.title}`:`Tu próxima pieza para ${businessName}`);
 const editLink=`/creator-studio?${new URLSearchParams({
  project:projectId,
  tab:'posts',
  compose:'idea',
  creation:'design',
  ...(featuredDraft?{design:featuredDraft.id}:{}),
  ...(featuredOffer?.reference?.id?{offer:featuredOffer.reference.id}:{}),
  ...(offersQuery?{offers:offersQuery}:{}),
 })}`;

 return <div className="studio-posts-overview">
  <section className="studio-piece-spotlight" aria-labelledby="next-piece-title">
   <h2 id="next-piece-title" className="studio-section-heading">Tu próxima pieza</h2>
   <div className="studio-featured-piece-card">
    <div className="studio-featured-visual">
     <img src={featuredImage} alt="" />
    </div>
    <div className="studio-featured-content">
     <h3>{featuredTitle}</h3>
     <p>{featuredDraft?.subtitle||featuredOffer?.body||'Crea un post con tus ofertas y publícalo en tus redes.'}</p>
     <PearlButton className="studio-featured-btn" to={editLink}>
      Editar publicación
     </PearlButton>
    </div>
   </div>
  </section>

  <section className="studio-designs-section" aria-labelledby="my-designs-title">
   <h2 id="my-designs-title" className="studio-section-heading">Mis diseños</h2>
   {drafts.length>0?<div className="studio-designs-grid">
    {drafts.map(draft=><Link
     key={draft.id}
     className="studio-design-card"
     to={`/creator-studio?${new URLSearchParams({
      project:projectId,
      tab:'posts',
      compose:'idea',
      creation:'design',
      design:draft.id,
      ...(offersQuery?{offers:offersQuery}:{}),
     })}`}
    >
     <div className="studio-design-art">
      <img src={draft.imagePath||draft.sourceImageUrl||'/brand/foru-project-pavilion.png'} alt="" />
      <span className="studio-design-badge">{draft.format==='story'?'9:16':draft.format==='portrait'?'4:5':'1:1'}</span>
     </div>
     <div className="studio-design-info">
      <strong>{draft.title||'Diseño sin título'}</strong>
      <small>{draft.subtitle?.slice(0,60)||'Borrador guardado'}</small>
     </div>
    </Link>)}
   </div>:<div className="studio-designs-grid studio-designs-examples">
    {(selectedOffers.length>0?selectedOffers:sources.filter(s=>s.group==='offer').slice(0,3)).map(item=><Link
     key={item.key}
     className="studio-design-card"
     to={`/creator-studio?${new URLSearchParams({
      project:projectId,
      tab:'posts',
      compose:'idea',
      creation:'design',
      ...(item.reference?.id?{offer:item.reference.id}:{}),
      ...(offersQuery?{offers:offersQuery}:{}),
     })}`}
    >
     <div className="studio-design-art">
      <img src={item.image||'/brand/foru-project-pavilion.png'} alt="" />
      <span className="studio-design-badge">1:1</span>
     </div>
     <div className="studio-design-info">
      <strong>{item.title}</strong>
      <small>Crear diseño</small>
     </div>
    </Link>)}
   </div>}
  </section>

  <section className="studio-composer-section">
   <StudioComposer brand={brand} sources={sources} onBusy={onBusy}/>
  </section>
 </div>;
}

function StudioPageView({
 businessName,
 editorPath,
 page,
 selectedOffers,
}:{
 businessName:string;
 editorPath:string;
 page:LandingDraft|null;
 selectedOffers:CreativeSource[];
}){
 const isPublished=Boolean(page?.published);
 const blocksCount=page?.blocks?.length||0;

 return <div className="studio-page-view">
  <section className="studio-page-status-card">
   <div className="studio-page-info">
    <span className={`studio-status-pill${isPublished?' is-live':' is-draft'}`}>
     {isPublished?'● Página publicada':page?'○ Borrador guardado':'○ Nueva página'}
    </span>
    <h2>{page?.headline||page?.name||businessName}</h2>
    <p>{page?.description||'Tu página reúne lo que vendes, tus horarios y un botón directo a WhatsApp.'}</p>
    <div className="studio-page-meta">
     <span>{blocksCount} {blocksCount===1?'sección':'secciones'} en tu página</span>
     {page?.cta&&<span className="studio-cta-tag">Botón: {page.cta}</span>}
    </div>
   </div>
   <div className="studio-page-actions">
    <PearlButton to={editorPath}>Abrir el editor</PearlButton>
    {isPublished&&page?.slug&&<a className="studio-live-link" href={`/s/${page.slug}`} target="_blank" rel="noreferrer">
     Ver página en vivo ↗
    </a>}
   </div>
  </section>

  {selectedOffers.length>0&&<section className="studio-page-offers-section">
   <h3 className="studio-section-heading">Ofertas seleccionadas</h3>
   <div className="studio-page-offers-grid">
    {selectedOffers.map(offer=><div key={offer.key} className="studio-page-offer-item">
     {offer.image&&<img src={offer.image} alt="" className="studio-page-offer-thumb"/>}
     <div>
      <strong>{offer.title}</strong>
      <p>{offer.body}</p>
     </div>
    </div>)}
   </div>
  </section>}
 </div>;
}

function StudioVideosView({
 project,
 selectedOffers,
 featuredDraft,
 offersQuery,
}:{
 project:string;
 selectedOffers:CreativeSource[];
 featuredDraft?:ContentDraft;
 offersQuery:string;
}){
 const primary=selectedOffers[0];
 const ideaText=featuredDraft?.title||primary?.title||'';

 return <div className="studio-videos-view">
  {ideaText&&<section className="studio-video-idea-banner">
   <div className="studio-video-idea-copy">
    <span className="studio-kicker">Tu idea para video</span>
    <h2>{ideaText}</h2>
    <p>{featuredDraft?.subtitle||primary?.body||'Convierte esta oferta en un guion o video corto vertical.'}</p>
   </div>
   <div className="studio-video-idea-actions">
    <PearlButton to={`/dashboard/tools/teleprompter?${new URLSearchParams({project,source:'offer',...(offersQuery?{offers:offersQuery}:{})})}`}>
     Grabar con teleprompter
    </PearlButton>
    <PearlButton tone="neutral" to={`/dashboard/tools/video?${new URLSearchParams({project,template:'product',...(offersQuery?{offers:offersQuery}:{})})}`}>
     Usar plantilla
    </PearlButton>
   </div>
  </section>}

  <div className="studio-video-options-grid">
   <article className="studio-video-option-card">
    <div className="studio-video-option-icon" aria-hidden="true"><LayoutTemplate size={28}/></div>
    <h3>Elegir plantilla de video</h3>
    <p>Plantillas en formato 9:16 listas con subtítulos automáticos y llamadas a la acción para tu rubro.</p>
    <PearlButton compact to={`/dashboard/tools/video?${new URLSearchParams({project,action:'template',...(offersQuery?{offers:offersQuery}:{})})}`}>
     Ver plantillas
    </PearlButton>
   </article>

   <article className="studio-video-option-card">
    <div className="studio-video-option-icon" aria-hidden="true"><Mic size={28}/></div>
    <h3>Grabar con teleprompter</h3>
    <p>Lee tu guion en pantalla a tu propio ritmo mientras te grabas frente a la cámara.</p>
    <PearlButton compact to={`/dashboard/tools/teleprompter?${new URLSearchParams({project,...(offersQuery?{offers:offersQuery}:{})})}`}>
     Abrir teleprompter
    </PearlButton>
   </article>

   <article className="studio-video-option-card">
    <div className="studio-video-option-icon" aria-hidden="true"><Video size={28}/></div>
    <h3>Editor de video</h3>
    <p>Sube tu video o edita clips, corta silencios en 1 clic y añade subtítulos automáticos con IA.</p>
    <PearlButton compact to={`/dashboard/tools/video?${new URLSearchParams({project,...(offersQuery?{offers:offersQuery}:{})})}`}>
     Abrir editor de video
    </PearlButton>
   </article>
  </div>
 </div>;
}
