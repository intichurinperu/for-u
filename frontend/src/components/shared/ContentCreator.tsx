import SavePieceFile from '../../social/SavePieceFile';
import {useSavedNavigation} from '../../lib/useSavedNavigation';
import {studioReturn,linkedPieceQuery} from '../../studio/navigation';
import EditorSheet from '../../toolkit/EditorSheet';
import EditorDecision from '../../toolkit/EditorDecision';
import DesignArtwork from '../../studio/DesignArtwork';
import InlineText from './InlineText';
import {connectDesignPiece} from '../../experience/designPiece';
import {useUnsavedNavigation,confirmWorkspaceNavigation} from '../../lib/useUnsavedNavigation';
import DesignSource from '../../experience/DesignSource';
import {externalImageUrl} from './mediaReference';
import { getPiece, type Piece } from '../../social/model';
import { ButtonPrimary as DSButtonPrimary, ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea } from '../ui/DesignSystem';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loadModuleDocument, loadModuleProjects, saveModuleDocument } from '../../services/moduleDocuments';
import { moduleLabels, type ModuleProject } from '../../modules/moduleProjects';
import { downloadBlob } from '../../toolkit/api';
import ProjectSelector from './ProjectSelector';
import TemplateLibrary from './TemplateLibrary';
import MediaGallery from './MediaGallery';
import { resolveMediaPath } from './mediaStorage';
import { blankContent, contentFromTemplate, saveContentDraft, type ContentDocument, type ContentDraft } from './contentModel';
import { exportContentImage } from './contentExport';
import { useAgentInsights, type ContenidoSugerido } from '../../hooks/useAgentInsights';
import './contentCreator.css';

export type ContentCreatorProps = { currentProject?: ModuleProject; onProjectChange?: (projectId: string) => void };
export default function ContentCreator({ currentProject, onProjectChange }: ContentCreatorProps = {}) {
  const { user } = useAuth(); const userId = user?.id;
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState<ModuleProject[]>([]);
  const [loadedFor, setLoadedFor] = useState('');
  const [error, setError] = useState(''); const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadModuleProjects(userId).then(value => { if (active) { setProjects(value); setLoadedFor(userId); setError(''); } }).catch(reason => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [userId, attempt]);
  if (error) return <main className="content-creator"><p role="alert">{error}</p><DSButtonSecondary onClick={() => setAttempt(value => value + 1)}>Reintentar</DSButtonSecondary><Link to="/dashboard?view=projects">Mis proyectos</Link></main>;
  if (!userId || loadedFor !== userId) return <main className="content-creator"><p role="status">Cargando tus proyectos…</p></main>;
  const requested = currentProject?.id ?? params.get('project');
  const project = requested ? projects.find(item => item.id === requested) : projects[0];
  if (!project) return <main className="content-creator"><h1>Elige un proyecto para crear contenido</h1><p>{projects.length ? 'Este proyecto no está disponible en tu cuenta.' : 'Crea primero tu proyecto y selecciona su rubro.'}</p><Link to="/dashboard?view=projects">Ir a mis proyectos</Link></main>;
  function change(id: string) { if (onProjectChange) onProjectChange(id); if (!currentProject) { const next = new URLSearchParams(params); next.set('project', id); next.delete('piece'); next.delete('templates'); setParams(next); } }
  return <ContentSession key={`${userId}:${project.id}:${params.get('piece') ?? ''}:${params.get('templates') ?? ''}:${params.get('design')??''}:${params.get('create')??''}`} userId={userId} project={project} projects={projects} onProjectChange={change} />;
}

const contentStorage = { load: loadModuleDocument, save: saveModuleDocument };
export function ContentSession({ userId, project, projects, onProjectChange, storage = contentStorage }: { userId: string; project: ModuleProject; projects: ModuleProject[]; onProjectChange: (id: string) => void; storage?: typeof contentStorage }) {
  const navigate = useNavigate();
  const [pieceParams] = useSearchParams();
  const pieceId = pieceParams.get('piece');
  const [linkedPiece,setLinkedPiece] = useState<Piece|null>(null);
  const [document, setDocument] = useState<ContentDocument | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState(false);
  const [exportedCover,setExportedCover]=useState<{file:File;signature:string}|null>(null);
  const [notice, setNotice] = useState(''); const [attempt, setAttempt] = useState(0);
  const [adjusting,setAdjusting]=useState(false);
  const [gallery, setGallery] = useState(false);const [galleryTarget,setGalleryTarget]=useState<'image'|'logo'>('image');const [logo,setLogo]=useState({path:'',url:''});
  const [image, setImage] = useState({ path: '', url: '' });
  useUnsavedNavigation(dirty||busy);
  const navigateAfterSave=useSavedNavigation(!dirty&&!busy);
  const previewRef=useRef<HTMLElement>(null);const [overflow,setOverflow]=useState(false);

  const alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  const saving = useRef(false);const undoStack=useRef<ContentDraft[]>([]),redoStack=useRef<ContentDraft[]>([]);
  const rubro = project.type || 'restaurante';
  const sugerenciasContenido = useAgentInsights(project.id, rubro);

  const usarIdea = (idea: ContenidoSugerido) => {
    if (mayDiscard()) {
      open({
        id: crypto.randomUUID(),
        projectId: project.id,
        templateId: undefined,
        format: idea.tipo === 'Historia' ? 'story' : 'post',
        title: idea.titulo,
        subtitle: idea.descripcion,
        caption: `[Sugerido por ${idea.agente}]\n\nEscribe aquí tu contenido basado en: ${idea.titulo}`,
        background: '#ffffff',
        foreground: '#000000',
        imagePath: '',
        updatedAt: new Date().toISOString(),
      }, true);
    }
  };
  const imageUrl = draft?.imagePath ? image.path === draft.imagePath ? image.url : '' : externalImageUrl(draft?.sourceImageUrl||'')||'';
  useEffect(()=>{const el=previewRef.current;if(!el)return;const check=()=>setOverflow(el.scrollHeight>el.clientHeight+2);const observer=new ResizeObserver(check);observer.observe(el);if(el.lastElementChild)observer.observe(el.lastElementChild);check();return()=>observer.disconnect();},[draft,imageUrl]);
  useEffect(() => {
    let active = true;
    Promise.all([storage.load(userId, project.id, 'content-creator'), pieceId ? loadModuleDocument(userId,project.id,'social-profile') : Promise.resolve(null)]).then(([result, social]) => {
      const data = result?.payload as ContentDocument | undefined;
      if (data && (data.version !== 1 || !Array.isArray(data.drafts) || data.drafts.some(item => item.projectId !== project.id))) throw new Error('El contenido guardado tiene un formato incompatible. No se ha sobrescrito.');
      const piece = pieceId ? getPiece(social?.payload,project.id,pieceId,userId).piece : null;
      if (active) {
        const create=pieceParams.get('create');if(!piece&&!pieceParams.get('design')&&['post','portrait','story'].includes(create||'')){setDraft({...blankContent(project.id),format:create as ContentDraft['format']});setDirty(false);}const design=pieceParams.get('design');if(design&&!piece){const saved=data?.drafts.find(d=>d.id===design);if(saved){setDraft(saved);setDirty(false);}}setDocument(data ?? { version: 1, drafts: [] }); setRevision(result?.revision ?? null); setNotice(''); setLinkedPiece(piece);
        if(piece){const existing=data?.drafts.find(d=>d.id===piece.id); if(existing && pieceParams.get('templates')!=='1'){setDraft(existing);setDirty(false);}else if(pieceParams.get('templates')!=='1'){setDraft({...blankContent(project.id),id:piece.id,title:piece.title,caption:piece.text});setDirty(true);}}
      }
    }).catch(error => { if (active) setNotice(error.message); });
    return () => { active = false; };
  }, [userId, project.id, pieceId, attempt, storage]);
  useEffect(() => {
    if (!draft?.imagePath) return;
    const path = draft.imagePath; let active = true;
    resolveMediaPath(path).then(url => { if (active) setImage({ path, url }); }).catch(error => { if (active) setNotice(error.message); });
    return () => { active = false; };
  }, [draft?.imagePath]);
  useEffect(()=>{let active=true;if(draft?.logoPath)void resolveMediaPath(draft.logoPath).then(url=>{if(active)setLogo({path:draft.logoPath!,url});}).catch(e=>{if(active)setNotice(e.message);});return()=>{active=false;};},[draft?.logoPath]);
  function mayDiscard() { return !dirty || confirmWorkspaceNavigation(); }
  function open(value: ContentDraft, changed: boolean) { if (!mayDiscard()) return; undoStack.current=[];redoStack.current=[];setDraft(linkedPiece ? { ...value,id:linkedPiece.id,caption:linkedPiece.text } : value); setDirty(changed); setGallery(false); setNotice(''); }
  function update(patch: Partial<ContentDraft>) { if (draft) {if(JSON.stringify({...draft,...patch})===JSON.stringify(draft))return;undoStack.current=[...undoStack.current,draft].slice(-30);redoStack.current=[];setDraft({ ...draft, ...patch }); setDirty(true); } }
  function undo(){if(!draft)return;const previous=undoStack.current.pop();if(previous){redoStack.current.push(draft);setDraft(previous);setDirty(true);}}
  function redo(){if(!draft)return;const next=redoStack.current.pop();if(next){undoStack.current.push(draft);setDraft(next);setDirty(true);}}
  function variant(){if(!draft||!mayDiscard())return;setDraft({...draft,id:crypto.randomUUID(),updatedAt:new Date().toISOString()});setDirty(true);undoStack.current=[];redoStack.current=[];setNotice('Nueva variante preparada. Guárdala para conservar ambas versiones.');}
  async function save() {
    if (!document || !draft || saving.current) return;
    saving.current = true; setBusy(true);
    try {
      const next = saveContentDraft(document, draft, project.id);
      const nextRevision = await storage.save(userId, project.id, 'content-creator', next, revision);
      setDocument(next); setRevision(nextRevision); setDirty(false); setNotice('Contenido guardado en este proyecto.');
    } catch (error) { setNotice((error as Error).message); }
    finally { saving.current = false; setBusy(false); }
  }
  async function openScript() {
    if (!document || !draft || saving.current) return;
    saving.current=true;setBusy(true);setNotice('');
    try {
      if(dirty){const next=saveContentDraft(document,draft,project.id);const rev=await storage.save(userId,project.id,'content-creator',next,revision);setDocument(next);setRevision(rev);setDirty(false);}
      const saved=await storage.load(userId,project.id,'social-profile');
      const next=connectDesignPiece(saved?.payload,project.id,userId,draft);
      if(next!==saved?.payload)await storage.save(userId,project.id,'social-profile',next,saved?.revision??null);
      if(alive.current)navigateAfterSave('/creator-studio'+linkedPieceQuery(project.id,draft.id,pieceParams)+'&tab=profile&panel=script');
    }catch(error){setNotice((error as Error).message);}
    finally{saving.current=false;setBusy(false);}
  }
  async function download() {
    if (!draft) return; setBusy(true);
    try { if (draft.logoPath&&logo.path!==draft.logoPath) throw new Error('Espera a que cargue el logo antes de exportar.');if (draft.imagePath && !imageUrl) throw new Error('Espera a que cargue la imagen antes de exportar.'); const blob=await exportContentImage(draft, imageUrl,draft.logoPath&&logo.path===draft.logoPath?logo.url:'');if(draft.usage==='reel-cover')setExportedCover({file:new File([blob],'portada-reel.png',{type:'image/png'}),signature:JSON.stringify(draft)});downloadBlob(blob, `${(draft.title||'mi-contenido').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,60)||'mi-contenido'}-${draft.usage==='reel-cover'?'portada-reel':draft.format==='story'?'historia':draft.format==='portrait'?'publicacion-vertical':'publicacion'}.png`); setNotice('Imagen lista para descargar.'); }
    catch (error) { setNotice((error as Error).message); } finally { setBusy(false); }
  }
  const back=studioReturn(pieceParams,draft?.creative?.origin,project.id);
  const pageSource=draft?.source||(draft?.creative?.origin?.pageRevision?{revision:draft.creative.origin.pageRevision,sectionId:draft.creative.origin.sectionId,mode:'draft' as const}:undefined);
  if (!document) return <main className="content-creator"><p role="status">{notice || 'Cargando el contenido del proyecto…'}</p>{notice && <DSButtonSecondary onClick={() => setAttempt(value => value + 1)}>Reintentar carga</DSButtonSecondary>}</main>;
  return <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }} className="creator-studio-layout">
    <style>{`
      @media (max-width: 900px) {
        .creator-studio-layout { grid-template-columns: 1fr !important; }
      }
      .content-creator.magic-card {
         padding: 2rem;
         animation: foru-focus-step-in 0.4s ease-out;
         border: 1px solid rgba(212, 212, 212, 0.76);
         border-radius: var(--border-radius-grande);
         background: var(--color-superficie);
         box-shadow: var(--sombra-magica);
      }
      .content-creator .magic-button-primary {
         background: var(--gradient-boton); color: var(--color-texto); border-radius: 999px; padding: 0.75rem 1.1rem; font-weight: 900; box-shadow: var(--sombra-media);
      }
      .content-creator .magic-button-soft {
         background: rgba(212, 212, 212, 0.16); color: var(--color-texto); border-radius: 999px; padding: 0.5rem 1rem; font-weight: 600; border: none;
      }
    `}</style>
    <main className="content-creator magic-card">
      <header className="studio-design-toolbar">
        <DSButtonSecondary disabled={busy} onClick={()=>{if(mayDiscard())navigate(back.path);}}>{back.label}</DSButtonSecondary>
        <div><small>{project.name}</small><strong>{dirty?'Cambios sin guardar':'Tu diseño'}</strong></div>
        {draft&&<DSButtonPrimary disabled={busy||!dirty} onClick={save}>{busy?'Guardando…':'Guardar'}</DSButtonPrimary>}
      </header>
      {linkedPiece&&<p>Diseño de {linkedPiece.title||'esta pieza'} · guarda antes de volver al perfil.</p>}<>{notice&&<p role="status">{notice}</p>}</><details className="creator-project-switch"><summary>Cambiar proyecto</summary><ProjectSelector projects={projects} value={project.id} disabled={busy} onChange={id => { if (mayDiscard()) onProjectChange(id); }} /></details>
      {draft?.creative?.pillar&&<p className="creator-pillar-context">Tu tema: <strong>{draft.creative.pillar}</strong></p>}{pageSource&&<DesignSource user={userId} project={project.id} revision={pageSource.revision} section={pageSource.sectionId} mode={pageSource.mode} offer={draft?.creative?.origin?.offerId} quiet/>}<fieldset className="creator-controls" disabled={busy}>
      {draft ? <>
        <div className="studio-design-context"><small>Toca el texto para hacerlo tuyo.</small><DSButtonSecondary onClick={()=>setAdjusting(true)}>Ajustar diseño</DSButtonSecondary><details><summary>••• <span className="sr-only">Más acciones del diseño</span></summary><div className="studio-design-menu"><DSButtonSecondary onClick={undo} disabled={!undoStack.current.length}>Deshacer</DSButtonSecondary><DSButtonSecondary onClick={redo} disabled={!redoStack.current.length}>Rehacer</DSButtonSecondary><DSButtonSecondary onClick={download}>Exportar imagen</DSButtonSecondary><DSButtonSecondary disabled={Boolean(linkedPiece)} onClick={variant}>Crear variante</DSButtonSecondary><DSButtonSecondary onClick={()=>{if(mayDiscard()){setDraft(null);setDirty(false);}}}>Cambiar plantilla</DSButtonSecondary></div></details></div>
        <EditorSheet open={adjusting} title="¿Qué quieres transformar?" onClose={()=>setAdjusting(false)}><EditorDecision choices={[
         {id:'title',title:'El titular',hint:'La idea que verá primero tu audiencia.',icon:'T',content:<DSInput label="Título del diseño" value={draft.title} maxLength={160} onChange={e=>update({title:e.target.value})}/>},
         {id:'subtitle',title:'El mensaje',hint:'Información confirmada, con tus palabras.',icon:'≋',content:<DSTextarea label="Texto del diseño" value={draft.subtitle} onChange={e=>update({subtitle:e.target.value})}/>},
         {id:'caption',title:'Texto del post',hint:linkedPiece?'El texto de esta pieza se edita junto a su guion.':'Se guarda con tu pieza; no se publica automáticamente.',icon:'✎',content:linkedPiece?<DSButtonSecondary onClick={openScript}>Abrir texto y guion</DSButtonSecondary>:<DSTextarea label="Texto del post" value={draft.caption} onChange={e=>update({caption:e.target.value})}/>},
         {id:'image',title:'La fotografía',hint:'Usa tus archivos; una foto es opcional.',icon:'▧',content:<><DSButtonSecondary onClick={()=>{setAdjusting(false);setGalleryTarget('image');setGallery(true);}}>Elegir de mi biblioteca</DSButtonSecondary>{(draft.imagePath||draft.sourceImageUrl)&&<DSButtonSecondary onClick={()=>update({imagePath:'',sourceImageUrl:''})}>Quitar foto</DSButtonSecondary>}</>},
         {id:'format',title:'El formato',hint:'Conserva tu contenido al cambiar la proporción.',icon:'▯',content:<label>Formato<select value={draft.format} onChange={e=>update({format:e.target.value as ContentDraft['format']})}><option value="post">Cuadrado · 1:1</option><option value="portrait">Vertical · 4:5</option><option value="story">Historia · 9:16</option></select></label>},
         {id:'brand',title:'Nombre de marca',hint:'Tu identidad en esta pieza.',icon:'◇',content:<DSInput label="Nombre de marca" value={draft.brandName||''} onChange={e=>update({brandName:e.target.value})}/>},
         {id:'cta',title:'La invitación',hint:'Qué quieres que haga quien lo vea.',icon:'↗',content:<DSInput label="Llamada a la acción" value={draft.cta||''} onChange={e=>update({cta:e.target.value})}/>},
         {id:'background',title:'Color de fondo',hint:'Elige un fondo que permita leer tu mensaje.',icon:'◒',content:<DSInput label="Fondo" type="color" value={draft.background} onChange={e=>update({background:e.target.value})}/>},
         {id:'foreground',title:'Color del texto',hint:'Mantén contraste con el fondo.',icon:'◐',content:<DSInput label="Texto" type="color" value={draft.foreground} onChange={e=>update({foreground:e.target.value})}/>},
         {id:'logo',title:'Tu logo',hint:'Conserva el archivo original en la biblioteca.',icon:'✦',content:<><DSButtonSecondary onClick={()=>{setAdjusting(false);setGalleryTarget('logo');setGallery(true);}}>Elegir logo</DSButtonSecondary>{draft.logoPath&&<DSButtonSecondary onClick={()=>update({logoPath:''})}>Quitar logo</DSButtonSecondary>}</>}
        ]}/></EditorSheet><div className="creator-editor">
        <section ref={previewRef} className={`creator-preview creator-preview-${draft.format}${draft.layout?' creator-preview-composed':''}`} aria-label="Vista previa del contenido" style={{ background: draft.background, color: draft.foreground }}>{draft.layout?<DesignArtwork draft={draft} imageUrl={imageUrl} logoUrl={draft.logoPath&&logo.path===draft.logoPath?logo.url:undefined} onChange={busy?undefined:update} onImage={()=>{setGalleryTarget('image');setGallery(true);}}/>:<>{imageUrl && <button className="creator-canvas-image" aria-label="Reemplazar imagen del diseño" onClick={()=>{setGalleryTarget('image');setGallery(true);}}><img src={imageUrl} alt="Imagen seleccionada para el contenido" /></button>}<div>{draft.logoPath&&logo.path===draft.logoPath&&<img className="creator-design-logo" src={logo.url} alt="Logo de tu proyecto"/>}<small>{draft.brandName}</small><InlineText as="h2" value={draft.title} label="Editar título en el diseño" onChange={title=>update({title})}/><InlineText value={draft.subtitle} label="Editar texto en el diseño" onChange={subtitle=>update({subtitle})}/><strong>{draft.cta}</strong></div></>}</section></div>
        {draft.usage==='reel-cover'&&exportedCover?.signature===JSON.stringify(draft)&&(linkedPiece||draft.creative)&&<SavePieceFile key={exportedCover.file.lastModified} file={exportedCover.file} user={userId} project={project.id} piece={draft.id} kind="image" disabled={busy||dirty}/>}
        <section className="creator-video-next"><div><small>DE POST A VIDEO</small><strong>Tu idea también puede tener voz.</strong><p>Prepara el guion de esta misma pieza. La grabación empieza cuando tú decidas.</p></div><DSButtonPrimary disabled={busy} onClick={openScript}>Crear video de este post →</DSButtonPrimary></section>
        {overflow&&<p role="alert">El texto no cabe completo en este formato. Acórtalo o elige un formato más alto antes de exportar.</p>}{gallery && <MediaGallery userId={userId} projectId={project.id} onSelect={media => { if(galleryTarget==='logo'){setLogo({path:media.path,url:media.url});update({logoPath:media.path});}else{setImage({ path: media.path, url: media.url }); update({ imagePath: media.path,sourceImageUrl:'' });} setGallery(false); }} />}
      </> : <TemplateLibrary key={project.type} type={project.type} onSelect={template => open(contentFromTemplate(project, template), true)} onCreateFromScratch={() => open(blankContent(project.id), true)} />}
      {!linkedPiece && document.drafts.length > 0 && <details><summary>Mis otros diseños guardados</summary><div className="creator-saved-grid">{document.drafts.map(item => <DSButtonSecondary key={item.id} onClick={() => open({ ...item }, false)}><strong>{item.title || item.caption.slice(0, 60)}</strong><span>{item.format === 'story' ? 'Historia' : item.format === 'portrait' ? 'Publicación vertical' : 'Publicación'}</span></DSButtonSecondary>)}</div></details>}
    </fieldset>
  </main>
  {!linkedPiece && <details className="magic-card" style={{ padding: '1.5rem', animation: 'foru-focus-step-in 0.4s ease-out 0.2s both', border: '1px solid rgba(212, 212, 212, 0.76)', borderRadius: 'var(--border-radius-grande)', background: 'var(--color-superficie)', boxShadow: 'var(--sombra-magica)' }}>
    <summary>Más ideas para crear</summary><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
      <span style={{ fontSize: '1.5rem' }}>💡</span>
      <h3 style={{ fontFamily: 'var(--font-titulos)', fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>Ideas basadas en tus conversaciones</h3>
    </div>
    <p style={{ color: 'var(--color-texto-suave)', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
      Sugerencias de tus notas disponibles. Revísalas antes de usarlas:
    </p>
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {sugerenciasContenido.map((idea, i) => (
        <div key={i} className="magic-card" style={{ padding: '1rem', cursor: 'pointer', animation: `animate-fade-in 0.3s ease-out ${i * 0.1}s both`, border: '1px solid rgba(212, 212, 212, 0.4)', borderRadius: '12px', background: 'rgba(250, 250, 250, 0.86)' }} onClick={() => usarIdea(idea)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="magic-badge">{idea.tipo}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-suave)' }}>{idea.agente}</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-texto)' }}>{idea.titulo}</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--color-texto-suave)', lineHeight: 1.4 }}>{idea.descripcion}</p>
        </div>
      ))}
    </div>
  </details>}
  </div>;
}
