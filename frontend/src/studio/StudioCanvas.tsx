import {beginMagic,finishMagic} from '../experience/magicTransition';
import {useEffect,useId,useRef,useState} from 'react';
import {useLocation,useNavigate,useSearchParams} from 'react-router-dom';
import {FolderOpen,LayoutTemplate,Save,SlidersHorizontal,Type,Upload,Video} from 'lucide-react';
import {useToolkit} from '../toolkit/ToolkitContext';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import {useSavedNavigation} from '../lib/useSavedNavigation';
import {Textarea} from '../components/ui/DesignSystem';
import Logo from '../components/Logo';
import PearlButton from '../components/ui/PearlButton';
import DesignArtwork from './DesignArtwork';
import IdeaSalesAssist from './IdeaSalesAssist';
import ProjectImageField from '../components/shared/ProjectImageField';
import {resolveMediaPath} from '../components/shared/mediaStorage';
import {privateMediaPath,mediaReference} from '../components/shared/mediaReference';
import EditorSheet from '../toolkit/EditorSheet';
import MaterialAttachments,{type Material} from '../experience/MaterialAttachments';
import {exportContentImage} from '../components/shared/contentExport';
import {downloadBlob} from '../toolkit/api';
import {blankContent,contentSizes,type ContentDraft} from '../components/shared/contentModel';
import VideoTemplateSelector from '../toolkit/VideoTemplateSelector';
import { type VideoTemplateId } from '../toolkit/videoTemplates';
import type {BrandProfile} from '../experience/brandProfile';
import type {Campaign} from '../workspace/contracts';
import {compositionOptions,type CreativeSource} from './model';
import {contentDocument,saveComposition} from './saveComposition';
import {localCanvasDrafts,readCanvasDraft,storeCanvasDraft,type CanvasDraft} from './canvasDrafts';
import DesignThumbnail from '../experience/DesignThumbnail';
import {landingOrigin,linkedPieceQuery,studioDesignPath} from './navigation';
import {adaptCanvas,ideaWords,canvasCaption} from './canvasModel';
import './studioCanvas.css';
import './studioIdeaEditor.css';
type Props={idea:string;onIdea:(text:string)=>void;pillar:string;brand?:BrandProfile;source?:CreativeSource|null;campaign?:Campaign;mainIndex?:number;onBack:()=>void;onBusy:(value:boolean)=>void};
export default function StudioCanvas({idea,onIdea,pillar,brand,source,campaign,mainIndex,onBack,onBusy}:Props){
 const {projectId,userId,business,docs,documentRevision}=useToolkit(),[params,setParams]=useSearchParams();
 const location=useLocation(),navigate=useNavigate();
 const trackedIdea=params.get('compose')==='idea';
 const designOpen=params.get('creation')==='design';
 const key=`foru:canvas:v1:${userId}:${projectId}:${campaign?.id||''}:${pillar}:${source?.key||'idea'}`;
 const requestedDesign=params.get('design');
 const [initialDesigns]=useState(()=>{
  const entries=new Map<string,CanvasDraft>();
  try {
   for(const draft of contentDocument(docs['module-content-creator'],projectId).drafts) {
    entries.set(draft.id,{draft,files:[],dirty:false});
   }
  } catch { /* Local drafts are still available if the cloud document needs recovery. */ }
  for(const entry of localCanvasDrafts(userId,projectId)) {
   const cloud=entries.get(entry.draft.id);
   if(!cloud||entry.dirty||entry.draft.updatedAt>cloud.draft.updatedAt)entries.set(entry.draft.id,entry);
  }
  try {
   const entry=readCanvasDraft(sessionStorage.getItem(key),projectId);
   if(entry&&!entries.has(entry.draft.id))entries.set(entry.draft.id,entry);
   return {entries,legacy:entry};
  } catch { return {entries,legacy:null}; }
 });
 const initial=requestedDesign ? initialDesigns.entries.get(requestedDesign)
  : designOpen||!trackedIdea ? initialDesigns.legacy : null;
 const [legacyBriefOpen,setLegacyBriefOpen]=useState(!initial?.draft);
 const [draft,setDraft]=useState<ContentDraft|null>(initial?.draft||null),[files,setFiles]=useState<Material[]>(initial?.files||[]),[dirty,setDirty]=useState(initial?.dirty||false),[busy,setBusy]=useState(false),[aiBusy,setAiBusy]=useState(false),[magic,setMagic]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState(''),[panel,setPanel]=useState<'photo'|'audio'|'colors'|'text'|'video'|null>(null),[format,setFormat]=useState<ContentDraft['format']>(initial?.draft.format||'portrait'),[image,setImage]=useState({path:'',url:''}),[sound,setSound]=useState(false),[templateOpen,setTemplateOpen]=useState(false);
 const briefOpen=trackedIdea?!designOpen||!draft:legacyBriefOpen;
 const [storedLocally,setStoredLocally]=useState(false);
 const [savedHere,setSavedHere]=useState(false);
 const lock=useRef(false),alive=useRef(true),animation=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const editorHeading=useRef<HTMLHeadingElement>(null),ideaId=useId();
 const navigateAfterSave=useSavedNavigation(!dirty&&!busy&&!aiBusy);
 useUnsavedNavigation(dirty&&(!trackedIdea||!storedLocally)||busy||aiBusy);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;clearTimeout(animation.current);};},[]);
 useEffect(()=>{onBusy(busy||aiBusy);return()=>onBusy(false);},[busy,aiBusy]);
 useEffect(()=>{
  if(!draft)return;
  const entry={draft,files,dirty};
  setStoredLocally(trackedIdea&&storeCanvasDraft(userId,projectId,entry));
  try{sessionStorage.setItem(key,JSON.stringify(entry));}catch{}
 },[draft,files,dirty,key,trackedIdea,userId,projectId]);
 useEffect(()=>{let active=true;const path=draft?.imagePath||'';if(!path){setImage({path:'',url:''});return;}void resolveMediaPath(path).then(url=>{if(active)setImage({path,url});}).catch(e=>{if(active)setError((e as Error).message);});return()=>{active=false;};},[draft?.imagePath]);
 useEffect(()=>{if(!designOpen){setPanel(null);setTemplateOpen(false);}},[designOpen]);
 function backToIdea(){
  if(!trackedIdea){setLegacyBriefOpen(true);return;}
  if(location.state?.fromStudioIdea){navigate(-1);return;}
  const next=new URLSearchParams(params);
  next.delete('creation');next.delete('design');
  setParams(next,{replace:true});
 }
 function openDesign(entry:CanvasDraft,revealDesign=false){
  setDraft(entry.draft);setDirty(entry.dirty);setFiles(entry.files);
  if(!trackedIdea){setLegacyBriefOpen(false);return;}
  storeCanvasDraft(userId,projectId,entry);
  try{sessionStorage.setItem(key,JSON.stringify(entry));}catch{}
  navigate(studioDesignPath(params,projectId,entry.draft.id),{state:{fromStudioIdea:true,revealDesign}});
 }
 function shimmer(){clearTimeout(animation.current);setMagic(true);animation.current=setTimeout(()=>setMagic(false),650);if(sound){try{const audio=new AudioContext(),osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(540,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(810,audio.currentTime+.12);gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.2);osc.onended=()=>void audio.close();}catch{}}}
 useEffect(()=>{
  if(!designOpen||!draft)return;
  editorHeading.current?.focus({preventScroll:true});
  if(location.state?.revealDesign)shimmer();
 },[designOpen,location.key]);
 function patch(value:Partial<ContentDraft>){if(!draft||busy||aiBusy)return;const next={...draft,...value};setDraft({...next,caption:canvasCaption(next)});setDirty(true);setStatus('');setError('');}
 function openManual(){
  if(busy||aiBusy)return;
  const next=(!trackedIdea&&draft)||{
   ...blankContent(projectId),format,layout:'editorial' as const,
   creative:{intent:campaign?.intent||'awareness' as const,sourceKey:'idea',...(campaign?{campaignId:campaign.id}:{}),...(brand?.pillars.includes(pillar)?{pillar,brand}:{})},
  };
  openDesign({draft:next,files,dirty:!trackedIdea&&dirty});
  setError('');setStatus('');
  requestAnimationFrame(()=>editorHeading.current?.focus());
 }
 function convert(text=idea){
  if(busy||aiBusy)return;
  try {
   const words=ideaWords(text);
   const chosen:CreativeSource={...(source||{key:'idea',image:'',cta:'',reference:null,group:'idea'}),...words};
   const option=compositionOptions(chosen,campaign?.intent||'awareness',format,projectId,userId,business.name,campaign,brand,brand?.pillars.includes(pillar)?pillar:undefined)[0];
   const existing=trackedIdea?null:draft;
   const next={...option,id:existing?.id||option.id,...(existing?{layout:existing.layout,background:existing.background,foreground:existing.foreground,imagePath:existing.imagePath,sourceImageUrl:existing.sourceImageUrl}:{}),creative:option.creative?{...option.creative,origin:landingOrigin(params,projectId,documentRevision('landing'))}:undefined};
   openDesign({draft:next,files,dirty:true},true);
   setError('');setStatus('Tu idea ya tiene forma. Toca el texto para editarlo.');
   if(!trackedIdea){shimmer();requestAnimationFrame(()=>editorHeading.current?.focus());}
  }catch(e){setError((e as Error).message);}
 }
 async function save(destination?:'video'|'teleprompter', template?:VideoTemplateId){
  if(!draft||lock.current)return;
  const transition=destination?beginMagic('Preparando tu video…'):undefined;
  lock.current=true;setBusy(true);setError('');
  try{
   await saveComposition(userId,projectId,draft,setStatus,undefined,mainIndex,files,!!destination);
   if(!alive.current)return;
   setDraft({...draft,updatedAt:new Date().toISOString()});setDirty(false);setSavedHere(true);setStatus('Contenido guardado en FOR U.');
   if(destination){
    const returnParams=new URLSearchParams(params);
    returnParams.set('return',trackedIdea?'studio-design':'library');returnParams.set('library','designs');
    const query=new URLSearchParams(linkedPieceQuery(projectId,draft.id,returnParams));
    const task=params.get('task');
    if(task)query.set('task',task);
    if(template)query.set('template',template);
    navigateAfterSave(`/dashboard/tools/${destination}?${query}`,trackedIdea?{fromStudioDesign:true}:undefined);
   }
  }catch(e){if(alive.current)setError((e as Error).message);}
  finally{if(transition)finishMagic(transition);lock.current=false;if(alive.current)setBusy(false);}
 }
 const imageUrl=draft?.imagePath?(image.path===draft.imagePath?image.url:''):draft?.sourceImageUrl||'';
 async function exportCurrent(){if(!draft||lock.current)return;lock.current=true;setBusy(true);setError('');try{if(draft.imagePath&&!imageUrl)throw new Error('Espera a que cargue tu foto.');const blob=await exportContentImage(draft,imageUrl);const title=(draft.title||'mi-contenido').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,60)||'mi-contenido';downloadBlob(blob,`${title}-${draft.format==='post'?'1x1':draft.format==='portrait'?'4x5':'9x16'}.png`);setStatus('Imagen PNG preparada para descargar en el tamaño seleccionado.');}catch(e){setError((e as Error).message);}finally{lock.current=false;if(alive.current)setBusy(false);}}
 async function exportAll(){if(!draft||lock.current)return;lock.current=true;setBusy(true);setError('');try{if(draft.imagePath&&!imageUrl)throw new Error('Espera a que cargue tu foto.');const versions=await Promise.all((['post','portrait','story'] as const).map(async ratio=>({ratio,blob:await exportContentImage(adaptCanvas(draft,ratio),imageUrl)})));for(const value of versions)downloadBlob(value.blob,`mi-contenido-${value.ratio==='post'?'1x1':value.ratio==='portrait'?'4x5':'9x16'}.png`);setStatus('Tres imágenes preparadas. Revisa cada encuadre antes de anunciar.');}catch(e){setError((e as Error).message);}finally{lock.current=false;if(alive.current)setBusy(false);}}
 const canSave=!!(draft?.title.trim()||draft?.caption.trim());
 const dimensions=contentSizes[draft?.format||format];
 const designs=briefOpen&&trackedIdea?[...initialDesigns.entries.values()]
  .filter(entry=>!campaign||entry.draft.creative?.campaignId===campaign.id)
  .sort((a,b)=>b.draft.updatedAt.localeCompare(a.draft.updatedAt)):[];

 return <section className="studio-canvas" aria-busy={busy||aiBusy}>
 <div className={briefOpen?'studio-idea-composer':'studio-idea-composer studio-idea-summary'}>
  <div className="studio-idea-context">
   <small>{pillar||'Tu primera publicación'}</small>
   {briefOpen
    ? <PearlButton tone="neutral" compact disabled={busy||aiBusy} onClick={onBack}>Mis temas</PearlButton>
    : <PearlButton tone="neutral" compact disabled={busy||aiBusy} onClick={backToIdea}>Atrás a mi idea</PearlButton>}
  </div>
  {briefOpen?<><h1>Empieza con una idea</h1><p>¿Qué te gustaría contar de tu negocio?</p>
   <div className="studio-idea-writing">
    <label htmlFor={ideaId}>Tu idea</label>
    <textarea id={ideaId} rows={3} maxLength={2000} value={idea} disabled={busy||aiBusy}
     placeholder={business.route==='restaurant'?'Ejemplo: quiero contar que este viernes vuelve nuestro brownie de chocolate.':'Ejemplo: quiero contar cómo preparamos lo que más nos piden.'}
     onChange={event=>onIdea(event.target.value)}/>
    <PearlButton tone="neutral" compact disabled={busy||aiBusy} onClick={()=>setPanel('audio')}>
     <span className="studio-idea-audio"><svg aria-hidden="true" width="16" height="18" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="5" y="1" width="6" height="10" rx="3"/><path d="M2.5 8v1a5.5 5.5 0 0 0 11 0V8M8 14.5V17m-2 0h4"/></svg>Añadir audio</span>
    </PearlButton>
   </div>
   <div className="studio-idea-actions">
    <PearlButton className="studio-idea-create" disabled={!idea.trim()||busy||aiBusy} onClick={()=>convert()}>Crear mi diseño</PearlButton>
    <PearlButton tone="neutral" compact disabled={busy||aiBusy} onClick={openManual}>Abrir editor manualmente</PearlButton>
   </div>
   {designOpen&&requestedDesign&&!draft&&<p role="status">Este diseño no está disponible. Puedes abrir otro diseño guardado abajo.</p>}
   {idea.trim()&&<IdeaSalesAssist idea={idea} pillar={pillar} brand={brand} disabled={busy} onAccept={value=>{onIdea(value);convert(value);}} onBusy={setAiBusy}/>}
  </>:null}
 </div>
 {briefOpen&&trackedIdea&&<section className="studio-saved-designs" aria-labelledby="studio-saved-heading">
  <h2 id="studio-saved-heading">Mis diseños</h2>
  {designs.length
   ? <ul>{designs.map(entry=><li key={entry.draft.id}>
     <button type="button" className="studio-saved-card" disabled={busy||aiBusy} onClick={()=>openDesign(entry)}>
      <DesignThumbnail draft={entry.draft} user={userId} project={projectId}/>
      <span><strong>{entry.draft.title||'Diseño sin título'}</strong><small>{entry.dirty?'Borrador en este dispositivo':'Abrir diseño'}</small></span>
     </button>
    </li>)}</ul>
   : <p>Aquí aparecerán los diseños que empieces.</p>}
 </section>}
 {draft&&(!trackedIdea||designOpen)&&<section className="studio-image-editor" aria-labelledby="studio-image-editor-title">
  <h2 id="studio-image-editor-title" ref={editorHeading} tabIndex={-1}>Editor de imagen</h2>
  <p>Toca el texto del lienzo para editarlo o usa las herramientas.</p>
  <div className="studio-canvas-toolbar">
   <div role="group" aria-label="Proporción del diseño">
    <span className="studio-format-label">Formato</span>
    {([{id:'post',label:'1:1',hint:'Cuadrado'},{id:'portrait',label:'4:5',hint:'Vertical'},{id:'story',label:'9:16',hint:'Pantalla completa'}] as const).map(option=><button type="button" key={option.id}
     aria-label={option.hint+' · '+option.label} aria-pressed={draft.format===option.id} disabled={busy||aiBusy}
     onClick={()=>{if(draft.format===option.id)return;setFormat(option.id);setDraft(adaptCanvas(draft,option.id));setDirty(true);}}>{option.label}</button>)}
   </div>
   <button type="button" aria-label={sound?'Desactivar sonidos':'Activar sonidos'} aria-pressed={sound} className="studio-sound-toggle" onClick={()=>setSound(!sound)}>{sound?'♪ Sonido':'♪ Sin sonido'}</button>
  </div>
  <div className="studio-image-tools" role="group" aria-label="Herramientas del diseño">
   <PearlButton tone="neutral" compact disabled={busy||aiBusy} onClick={()=>setPanel('text')}><Type aria-hidden="true"/>Texto</PearlButton>
   <PearlButton tone="neutral" compact disabled={busy||aiBusy} onClick={()=>setPanel('photo')}><FolderOpen aria-hidden="true"/>Mis archivos</PearlButton>
   <PearlButton tone="neutral" compact disabled={busy||aiBusy} onClick={()=>setPanel('colors')}><SlidersHorizontal aria-hidden="true"/>Estilo</PearlButton>
  </div>
  <div className={`studio-canvas-stage${magic?' is-transforming':''}`}>
   <div className="studio-canvas-art" style={{width:`min(100%, 420px, ${540*dimensions.width/dimensions.height}px)`}}>
    <DesignArtwork draft={draft} imageUrl={imageUrl} onChange={patch} onImage={()=>setPanel('photo')}/>
   </div>
   {magic&&<div className="studio-canvas-magic" aria-hidden="true"><Logo/></div>}
  </div>
  <footer className="studio-canvas-actions">
   <PearlButton className="studio-idea-create" compact disabled={busy||aiBusy||!canSave} onClick={()=>setPanel('video')}>Crear esta idea en video</PearlButton>
   <div className="studio-image-file-actions">
    <PearlButton tone="neutral" compact disabled={busy||aiBusy||(!dirty&&savedHere)||!canSave} onClick={()=>void save()}><Save aria-hidden="true"/>{busy?'Guardando…':'Guardar diseño'}</PearlButton>
    <PearlButton tone="neutral" compact disabled={busy||aiBusy} onClick={()=>void exportCurrent()}>Descargar imagen</PearlButton>
    <PearlButton tone="neutral" compact disabled={busy||aiBusy} onClick={()=>void exportAll()}>Descargar los tres tamaños</PearlButton>
   </div>
  </footer>
 </section>}
 {(error||status)&&<p className="studio-canvas-status" role={error?'alert':'status'}>{error||status}</p>}
 {panel&&<EditorSheet open title={{photo:'Mis archivos',colors:'Colores y estilo',audio:'Tu voz y tus materiales',text:'Texto del diseño',video:'¿Cómo quieres empezar tu video?'}[panel]} closeLabel={panel==='video'?'Cerrar':undefined} onClose={()=>setPanel(null)}><>
 {panel==='text'&&draft&&<div className="studio-text-fields">
  <Textarea label="Título" maxLength={160} rows={2} value={draft.title} onChange={e=>patch({title:e.target.value})}/>
  <Textarea label="Texto" maxLength={2000} rows={3} value={draft.subtitle} onChange={e=>patch({subtitle:e.target.value})}/>
  <Textarea label="Llamada a la acción" maxLength={200} rows={2} value={draft.cta||''} onChange={e=>patch({cta:e.target.value})}/>
 </div>}
 {panel==='video'&&<div className="studio-video-start-actions">
  {draft?.title&&<p className="studio-video-idea">{draft.title}</p>}
  <PearlButton tone="neutral" compact className="studio-video-option" onClick={()=>{setPanel(null);setTemplateOpen(true);}}>
   <LayoutTemplate aria-hidden="true"/><span><strong>Elegir una plantilla</strong><span>Usa una plantilla lista y personalízala.</span></span>
  </PearlButton>
  <PearlButton tone="neutral" compact className="studio-video-option studio-video-option-record" onClick={()=>{setPanel(null);void save('teleprompter');}}>
   <Video aria-hidden="true"/><span><strong>Grabar con teleprompter</strong><span>Graba con tu guion en pantalla.</span></span>
  </PearlButton>
  <PearlButton tone="neutral" compact className="studio-video-option" onClick={()=>{setPanel(null);void save('video');}}>
   <Upload aria-hidden="true"/><span><strong>Subir un video</strong><span>Edita un video que ya tengas.</span></span>
  </PearlButton>
 </div>}
 {panel==='photo'&&draft&&<ProjectImageField label="Foto del post" value={draft.imagePath?mediaReference(draft.imagePath):draft.sourceImageUrl||''} onChange={value=>{const path=privateMediaPath(value,userId,projectId);patch({imagePath:path||'',sourceImageUrl:path?'':value});setPanel(null);}}/>}{panel==='colors'&&draft&&<><div className="studio-canvas-colors"><label>Fondo<input type="color" value={draft.background} onChange={e=>patch({background:e.target.value})}/></label><label>Texto<input type="color" value={draft.foreground} onChange={e=>patch({foreground:e.target.value})}/></label></div><div className="studio-canvas-layouts" role="group" aria-label="Composición">{(['editorial','poster','split'] as const).map(layout=><button type="button" aria-pressed={draft.layout===layout} key={layout} onClick={()=>patch({layout})}>{layout==='editorial'?'Editorial':layout==='poster'?'Protagonista':'Contraste'}</button>)}</div></>}{panel==='audio'&&<><p>Graba o adjunta tu idea. Se conservará como material privado de este contenido.</p><p>La conversión actual usa el texto que escribas; el audio todavía no se transcribe en este espacio.</p><MaterialAttachments user={userId} project={projectId} files={files} disabled={busy||aiBusy} onChange={value=>{setFiles(value);setDirty(true);}}/></>}</></EditorSheet>}
 {templateOpen&&<VideoTemplateSelector busy={busy} error={error} onClose={()=>{setTemplateOpen(false);setPanel('video');setError('');}} onSelect={templateId=>void save('video',templateId)} sourceText={draft?.title||idea}/>}
 </section>;
}
