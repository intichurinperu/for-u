import PieceMediaPreview from './PieceMediaPreview';
import DesignSource from '../experience/DesignSource';
import PieceSchedule from './PieceSchedule';
import {AIProvenanceView} from '../experience/AIContextSources';
import {linkedPieceQuery} from '../studio/navigation';
import DesignArtwork from '../studio/DesignArtwork';
import {resolveMediaPath} from '../components/shared/mediaStorage';
import EditorDecision from '../toolkit/EditorDecision';
import {useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {ButtonPrimary,ButtonSecondary,Input,Textarea,Select} from '../components/ui/DesignSystem';
import InlineText from '../components/shared/InlineText';
import ProjectImage from '../components/shared/ProjectImage';
import MediaGallery from '../components/shared/MediaGallery';
import {MediaScope} from '../components/shared/mediaScope';
import {mediaReference} from '../components/shared/mediaReference';
import type {ContentDraft} from '../components/shared/contentModel';
import EditorSheet from '../toolkit/EditorSheet';
import PieceAI from '../experience/PieceAI';
import MaterialAttachments from '../experience/MaterialAttachments';
import {type Piece} from './model';
import './pieceWorkspace.css';
type Panel='photo'|'script'|'plan'|'ai'|'material'|null;
export default function PieceWorkspace({piece,design,user,project,dirty,busy,error,status,revision,onEdit,onDesign,onSave,onBack,onRecover,startWithScript=false,backLabel='← Mi perfil'}:{backLabel?:string;startWithScript?:boolean;piece:Piece;design:ContentDraft;user:string;project:string;dirty:boolean;busy:boolean;error:string;status:string;revision:string|null;onEdit:(v:Partial<Piece>)=>void;onDesign:(v:Partial<ContentDraft>)=>void;onSave:()=>void;onBack:()=>void;onRecover:()=>void}){
 const [params]=useSearchParams();
 const [panel,setPanel]=useState<Panel>(startWithScript?'script':null),[view,setView]=useState<'design'|'caption'>('design');
 const [resolved,setResolved]=useState({path:'',url:''}),[logo,setLogo]=useState({path:'',url:''});
 useEffect(()=>{let active=true;if(design.imagePath)void resolveMediaPath(design.imagePath).then(url=>{if(active)setResolved({path:design.imagePath,url});}).catch(()=>{});return()=>{active=false;};},[design.imagePath]);
 useEffect(()=>{let active=true;if(design.logoPath)void resolveMediaPath(design.logoPath).then(url=>{if(active)setLogo({path:design.logoPath!,url});}).catch(()=>{});return()=>{active=false;};},[design.logoPath]);
 const pageSource=design.source||(design.creative?.origin?.pageRevision?{revision:design.creative.origin.pageRevision,sectionId:design.creative.origin.sectionId,mode:'draft' as const}:undefined);
 const image=design.imagePath?mediaReference(design.imagePath):design.sourceImageUrl||'';
 const title=panel==='photo'?'Tu imagen':panel==='script'?'Tu voz y tus tomas':panel==='plan'?'Cuándo compartirla':panel==='material'?'Material de esta pieza':'Crear conmigo';
 return <MediaScope.Provider value={{userId:user,projectId:project}}><section className="piece-workspace">
  <header className="piece-topbar"><ButtonSecondary disabled={busy} onClick={onBack}>{backLabel}</ButtonSecondary><span role="status">{busy?'Guardando…':error?'No se guardó':dirty?'Cambios pendientes':'Guardado'}</span><ButtonPrimary disabled={busy||!dirty} onClick={onSave}>Guardar</ButtonPrimary></header>
  <div className="piece-intro"><small>CREATOR STUDIO · TU PIEZA</small><h1>{design.usage==='reel-cover'?'Tu portada de reel.':'Tu publicación.'}</h1><p>{design.creative?.pillar?'Tu tema: '+design.creative.pillar+'. ':''}Toca el texto o la foto para editar.</p></div>
  {pageSource&&<DesignSource user={user} project={project} revision={pageSource.revision} section={pageSource.sectionId} mode={pageSource.mode} offer={design.creative?.origin?.offerId} quiet/>}
  <div className="piece-view-switch" role="group" aria-label="Qué editar"><ButtonSecondary aria-pressed={view==='design'} onClick={()=>setView('design')}>◈ Diseño</ButtonSecondary><ButtonSecondary aria-pressed={view==='caption'} onClick={()=>setView('caption')}>≋ Texto del post</ButtonSecondary></div>
  {view==='design'&&<div className="piece-stage" aria-busy={busy}><div className={'piece-poster piece-poster-'+design.format+(design.layout?' piece-poster-composed':'')} aria-label="Tu publicación editable" style={{background:design.background,color:design.foreground}}>
   {design.layout?<DesignArtwork draft={design} imageUrl={design.imagePath?(resolved.path===design.imagePath?resolved.url:''):design.sourceImageUrl||''} logoUrl={design.logoPath&&logo.path===design.logoPath?logo.url:undefined} onImage={()=>setPanel('photo')} onChange={busy?undefined:patch=>{onDesign(patch);if(patch.title!==undefined)onEdit({title:patch.title});}}/>:<><button className={'piece-photo '+(!image?'piece-photo-empty':'')} disabled={busy} onClick={()=>setPanel('photo')} aria-label="Cambiar foto de la publicación">{image?<ProjectImage value={image} alt={design.title||'Imagen de tu publicación'}/>:<span>＋<br/>Tu primera foto</span>}<span className="piece-photo-hint">Cambiar foto</span></button>
   <div className="piece-poster-copy"><small>{design.brandName}</small>{design.logoPath&&<ProjectImage className="piece-logo" value={mediaReference(design.logoPath)} alt="Logo"/>}<InlineText as="h2" value={design.title} label="Editar titular de la publicación" onChange={value=>{if(!busy){onDesign({title:value});onEdit({title:value});}}}/><InlineText value={design.subtitle} label="Editar texto del diseño" onChange={subtitle=>{if(!busy)onDesign({subtitle});}}/>{design.cta&&<strong>{design.cta}</strong>}</div></>}
  </div></div>}
  {view==='caption'&&<section className="piece-caption">{image&&<ProjectImage className="piece-caption-photo" value={image} alt="Imagen del post"/>}<small>TEXTO QUE ACOMPAÑA TU PUBLICACIÓN</small><InlineText value={piece.text} label="Editar texto del post" onChange={text=>{if(!busy){onEdit({text});onDesign({caption:text});}}}/>{!piece.text&&<p>Toca arriba para escribir tu mensaje.</p>}</section>}
  {(piece.videoId||piece.coverId)&&<PieceMediaPreview user={user} project={project} piece={piece}/>}
  <nav className="piece-dock" aria-label="Herramientas de esta pieza"><ButtonSecondary disabled={busy} onClick={()=>setPanel('photo')}>▧ Foto</ButtonSecondary><ButtonSecondary disabled={busy} onClick={()=>setPanel('script')}>◉ Preparar video</ButtonSecondary><ButtonSecondary disabled={busy} onClick={()=>setPanel('plan')}>◷ Planificar</ButtonSecondary><ButtonSecondary disabled={busy} onClick={()=>setPanel('ai')}>✦ Ayuda IA</ButtonSecondary></nav>
  <p className="piece-feedback" role={error?'alert':'status'}>{error||status||'Planificación privada · todavía no se publica en Instagram.'}{error&&<ButtonSecondary onClick={onRecover}>Recuperar versión guardada</ButtonSecondary>}</p>
  <EditorSheet open={panel!==null} title={title} onClose={()=>setPanel(null)}>
   {panel==='photo'&&<MediaGallery userId={user} projectId={project} onSelect={file=>{onDesign({imagePath:file.path,sourceImageUrl:''});if(!piece.files.some(f=>f.path===file.path))onEdit({files:[...piece.files,{path:file.path,name:file.name}]});setPanel(null);}}/>}
   {panel==='script'&&<><p>Parte de esta misma pieza: prepara tu guion, ensaya y abre la grabación. La portada puede conservar este diseño en vertical.</p><Textarea label="Guion" value={piece.script} disabled={busy} maxLength={20000} onChange={e=>onEdit({script:e.target.value})}/><details><summary>Lista de tomas</summary><Textarea label="Tomas" value={piece.shots} maxLength={10000} disabled={busy} onChange={e=>onEdit({shots:e.target.value})}/></details>{dirty?<ButtonPrimary disabled={busy} onClick={onSave}>Guardar para ensayar</ButtonPrimary>:<Link className="pe-action-link" to={'/dashboard/tools/teleprompter'+linkedPieceQuery(project,piece.id,params)}>▶ Ensayar en teleprompter</Link>}</>}
   {panel==='plan'&&<EditorDecision initialChoice="date" choices={[
     {id:'usage',title:'Imagen o portada de reel',hint:'Conserva la misma idea, guion y lugar en tu cuadrícula.',icon:'▯',content:<div className="profile-topic-choices"><button type="button" disabled={busy} aria-pressed={design.usage!=='reel-cover'} onClick={()=>onDesign({usage:'image'})}>Diseño de imagen</button><button type="button" disabled={busy} aria-pressed={design.usage==='reel-cover'} onClick={()=>onDesign({usage:'reel-cover',format:'story'})}>Portada de reel · vertical</button></div>},
     {id:'goal',title:'Mi intención',hint:'Qué quieres conseguir con esta pieza.',icon:'↗',content:<Textarea label="Objetivo de la pieza" value={piece.objective} maxLength={2000} disabled={busy} onChange={e=>onEdit({objective:e.target.value})}/>},
     {id:'date',title:'Cuándo compartirla',hint:'Planifica una fecha; no publica contenido.',icon:'◷',content:<PieceSchedule value={piece.date} disabled={busy} onChange={date=>onEdit({date})}/>},
     {id:'state',title:'Mi avance',hint:'Distingue preparación y publicación manual.',icon:'✓',content:<Select label="Estado" value={piece.status} disabled={busy} onChange={e=>onEdit({status:e.target.value as Piece['status']})}><option value="idea">Idea</option><option value="draft">En preparación</option><option value="ready">Lista</option><option value="published-manual">Publicada por mí · sin verificación</option></Select>},
     {id:'format',title:'El formato',hint:'Cambia la proporción del diseño.',icon:'▯',content:<Select label="Formato" value={design.format} onChange={e=>onDesign({format:e.target.value as ContentDraft['format']})}><option value="post">Cuadrado</option><option value="portrait">Vertical</option><option value="story">Historia</option></Select>},
     {id:'background',title:'Fondo',hint:'Color del diseño.',icon:'◒',content:<Input label="Fondo" type="color" value={design.background} onChange={e=>onDesign({background:e.target.value})}/>},
     {id:'foreground',title:'Texto',hint:'Color legible sobre el fondo.',icon:'T',content:<Input label="Texto" type="color" value={design.foreground} onChange={e=>onDesign({foreground:e.target.value})}/>}
   ]}/>}
   {panel==='material'&&<MaterialAttachments user={user} project={project} files={piece.files} disabled={busy} onChange={files=>onEdit({files})}/>}
   {panel==='ai'&&<>{piece.aiProvenance&&<AIProvenanceView value={piece.aiProvenance}/>}<PieceAI project={project} source={piece.id} revision={revision} disabled={dirty||busy} onApply={onEdit}/></>}
  </EditorSheet>
  <details className="piece-more"><summary>Archivos, plantillas y exportación</summary><ButtonSecondary onClick={()=>setPanel('material')}>Ver y añadir material · {piece.files.length}</ButtonSecondary>{dirty?<p>Guarda para abrir otra herramienta con estos cambios.</p>:<><Link className="pe-action-link" to={'/content-creator'+linkedPieceQuery(project,piece.id,params)}>Variantes y exportar PNG</Link><Link className="pe-action-link" to={'/content-creator'+linkedPieceQuery(project,piece.id,params)+'&templates=1'}>Cambiar plantilla</Link></>}</details>
 </section></MediaScope.Provider>;
}
