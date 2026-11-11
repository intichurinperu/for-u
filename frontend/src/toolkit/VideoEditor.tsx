import PearlButton from '../components/ui/PearlButton';
import Logo from '../components/Logo';
import {videoTemplate,templateLook,templateCaptions} from './videoTemplateModel';
import {createTemplateVideo} from './templateVideo';
import {contentDocument} from '../studio/saveComposition';
import {prepareTransparentLogo} from './logoBackground';
import {Scissors, Captions, Layers, Ratio, Download, Play, Pause, Sparkles, Upload, Maximize, ArrowLeft} from 'lucide-react';
import {clipAppearance,layerAppearance,type ClipMotion,type VideoLayer} from './videoComposition';
import TextStylePicker from './TextStylePicker';
import CaptionArtwork from './CaptionArtwork';
import {readVisualBrand,defaultTextLook,type TextLook,type TextPreset} from './textStyles';
import VideoTimeline from './VideoTimeline';
import {splitTimeline,timelineClock,removeTimelineSilences,montageAtSource,sourceAtMontage,montageTimeline} from './videoTimelineModel';
import {Link,useSearchParams} from 'react-router-dom';
import {linkedPieceQuery,studioReturn} from '../studio/navigation';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import {recordingFrames,type RecordingRatio} from './prompterFrame';
import {prepareCaptionAudio} from './captionAudio';
import {beginMagic,finishMagic} from '../experience/magicTransition';
import {readSrt,validCaptionTimes} from './videoEditing';
import VideoGuide from './VideoGuide';
import './videoEditorGuided.css';
import './videoWorkspace.css';
import {getPiece} from '../social/model';
import {parseMaterials} from '../workspace/contracts';
import {resolveMediaPath} from '../components/shared/mediaStorage';
import SavePieceFile from '../social/SavePieceFile';
import {ButtonSecondary as DSButtonSecondary, ButtonPrimary as DSButtonPrimary} from '../components/ui/DesignSystem';
import {useEffect,useRef,useState} from 'react';
import {detectSilences,type Segment} from './engine';
import {decodeAudio,exportVideo} from './media';
import {downloadBlob,transcribe} from './api';
import {useToolkit} from './ToolkitContext';

export default function VideoEditor({
  initialFile,
  initialSubtitles = [],
}: {
  initialFile: File | null;
  initialSubtitles?: Segment[];
}) {
  const { track,userId,projectId,docs,save,loading,loadError } = useToolkit();
  const [params]=useSearchParams();
  const [toolPanelOpen,setToolPanelOpen]=useState(false);
  const [styleDockOpen,setStyleDockOpen]=useState(false);
  const [compactEditor,setCompactEditor]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width: 900px)').matches);
  useEffect(()=>{const media=window.matchMedia('(max-width: 900px)'),change=()=>setCompactEditor(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  const template=videoTemplate(params.get('template'));
  const [look,setLook]=useState<TextLook>(template ? templateLook(template.id) : {...defaultTextLook}),[favorites,setFavorites]=useState<TextPreset[]>([]),[styleDirty,setStyleDirty]=useState(false),[styleSaving,setStyleSaving]=useState(false),[styleStatus,setStyleStatus]=useState(''),[styleInvalid,setStyleInvalid]=useState(false);
  const styleEdited=useRef(false);
  useEffect(()=>{if(styleEdited.current||loading||loadError)return;try{const value=readVisualBrand(docs['module-visual-brand'],projectId);if(!template)setLook(value.look);setFavorites(value.favorites);setStyleInvalid(false);}catch(e){setStyleInvalid(true);setStyleStatus((e as Error).message);}},[docs['module-visual-brand'],projectId,loading,loadError,template]);
  function changeLook(value:TextLook){const el=video.current;const rows=captionProposal??subtitles;if(el&&rows.length&&!rows.some(row=>el.currentTime>=row.start&&el.currentTime<row.end)){const target=rows[captionIndex]??rows[0];el.pause();el.currentTime=target.start+Math.min(.3,(target.end-target.start)/2);setTime(el.currentTime);}styleEdited.current=true;setLook(value);setDirty(true);setStyleDirty(true);setStyleStatus('Vista previa. Guarda para recordarlo en este proyecto.');}
  async function saveStyle(){if(styleSaving||styleInvalid||loading||loadError)return;setStyleSaving(true);setStyleStatus('');try{await save('module-visual-brand',{version:1,projectId,look,favorites});styleEdited.current=false;setStyleDirty(false);setStyleStatus('Estilo y favoritos guardados en este proyecto.');}catch(e){setStyleStatus((e as Error).message);}finally{setStyleSaving(false);}}
  const [step,setStep]=useState<'review'|'cuts'|'captions'|'export'|'layers'>(params.get('panel')==='logos'?'layers':'captions'),[dirty,setDirty]=useState(false),[savedExport,setSavedExport]=useState(false),[captionIndex,setCaptionIndex]=useState(-1),[framing,setFraming]=useState<RecordingRatio|'original'>('original'),[focus,setFocus]=useState(.5),[originalSize,setOriginalSize]=useState({width:16,height:9});
  const [layers,setLayers]=useState<VideoLayer[]>([]),[layerIndex,setLayerIndex]=useState(-1),[motions,setMotions]=useState<ClipMotion[]>([]);
  const logoResize=useRef<{x:number;width:number;canvasWidth:number;id:string}|null>(null);
  const layerUrls=useRef<string[]>([]);useEffect(()=>()=>{layerUrls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
  const [logoPreparing,setLogoPreparing]=useState(false),[backgroundPreview,setBackgroundPreview]=useState<{id:string;url:string}|null>(null);
  async function addLayers(files:File[]){
   if(!files.length||logoPreparing)return;if(files.length+layers.length>8){setNotice('Puedes usar hasta ocho logos o imágenes.');return;}
   setLogoPreparing(true);const token=version.current,added:VideoLayer[]=[];
   try{for(const file of files){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024)throw new Error('Elige logos PNG, JPG o WebP de hasta 8 MB cada uno.');
    const url=URL.createObjectURL(file);layerUrls.current.push(url);const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('No pudimos abrir uno de los logos.'));image.src=url;});
    added.push({id:crypto.randomUUID(),url,name:file.name,start:Math.max(0,Math.min(segments.reduce((n,row)=>n+row.end-row.start,0)-.1,montageAtSource(segments,time))),end:Math.min(segments.reduce((n,row)=>n+row.end-row.start,0),Math.max(0,Math.min(segments.reduce((n,row)=>n+row.end-row.start,0)-.1,montageAtSource(segments,time)))+3),x:(added.length+1)/(files.length+1),y:.5,width:files.length>1?.23:.32,ratio:image.width/image.height,animation:'pop',placement:'overlay'});
   }
   if(!alive.current||token!==version.current)return;const total=segments.reduce((n,row)=>n+row.end-row.start,0);setLayers(rows=>[...rows,...added]);setLayerIndex(layers.length+added.length-1);setBackgroundPreview(null);setDirty(true);setStep('layers');setToolPanelOpen(true);seek(sourceAtMontage(segments,Math.min(total-.01,added[0].start+.75)));setNotice('Arrastra cada logo sobre el video. Su pista permite mover cuándo aparece.');
   }catch(error){if(alive.current&&token===version.current)setNotice((error as Error).message);}finally{if(alive.current&&token===version.current)setLogoPreparing(false);}
  }
  async function previewBackground(){const layer=layers[layerIndex];if(!layer||logoPreparing)return;setLogoPreparing(true);setNotice('');try{const blob=await prepareTransparentLogo(layer.originalUrl??layer.url),url=URL.createObjectURL(blob);layerUrls.current.push(url);setBackgroundPreview({id:layer.id,url});}catch(error){setNotice((error as Error).message);}finally{setLogoPreparing(false);}}
  function previewLogo(){const el=video.current;if(!el||!segments.length)return;const total=segments.reduce((n,row)=>n+row.end-row.start,0),start=Math.min(total-.01,layers[layerIndex]?.start??0),rows=montageTimeline(segments),index=rows.findIndex(row=>start>=row.start&&start<row.end);el.pause();previewCuts.current=segments;previewIndex.current=Math.max(0,index);el.currentTime=sourceAtMontage(segments,start);void el.play().catch(()=>setNotice('Pulsa reproducir para ver el cierre.'));}
  const silenceUndo=useRef<Segment[]|null>(null);
  const previewCuts=useRef<Segment[]|null>(null),previewIndex=useRef(0);
  const [exported,setExported]=useState<File|null>(null),[exportedUrl,setExportedUrl]=useState('');
  useEffect(()=>{if(!exported){setExportedUrl('');return;}const url=URL.createObjectURL(exported);setExportedUrl(url);return()=>URL.revokeObjectURL(url);},[exported]);
  const [file, setFile] = useState<File | null>(initialFile);
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [silences, setSilences] = useState<Segment[]>([]);
  const [subtitles, setSubtitles] = useState<Segment[]>(initialSubtitles);
  const [captionProposal,setCaptionProposal]=useState<Segment[]|null>(null);
  const alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false;version.current++;};},[]);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [threshold, setThreshold] = useState(-38);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const toolPanel=useRef<HTMLElement>(null);
  useEffect(()=>{if(compactEditor&&toolPanelOpen)toolPanel.current?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});},[compactEditor,toolPanelOpen,step]);
  function closeToolPanel(){setToolPanelOpen(false);if(compactEditor)video.current?.closest<HTMLElement>('.video-workbench')?.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}

  const abort = useRef<AbortController | null>(null);
  const audioStart=useRef<(()=>void)|null>(null);
  const version = useRef(0);
  const selection=useRef(0);
  const [clipIndex,setClipIndex]=useState(0),[playing,setPlaying]=useState(false);
  const [recoverAttempt,setRecoverAttempt]=useState(0),[recoverError,setRecoverError]=useState(''),[recovering,setRecovering]=useState(false);
  const pieceId=params.get('piece');
  const generatedText=useRef<{file:File;text:string}|null>(null);
  const [templatePreparing,setTemplatePreparing]=useState(false);

  useUnsavedNavigation(templatePreparing||dirty||styleDirty||styleSaving||!!busy||!!exported&&!savedExport);
  useEffect(()=>{setExported(null);setSavedExport(false);},[segments,subtitles,framing,focus,look,layers,motions]);
  useEffect(()=>{previewCuts.current=null;video.current?.pause();},[step]);
  const editSegments=(value:Segment[])=>{silenceUndo.current=null;previewCuts.current=null;setMotions(value.map(row=>{const i=segments.findIndex(previous=>row===previous||row.start>=previous.start&&row.end<=previous.end);return motions[i]??{enter:'none',exit:'none'};}));setSegments(value);setDirty(true);};
  const editSubtitles=(value:Segment[])=>{setSubtitles(value);setDirty(true);};
  function playCuts(value:Segment[]){if(!video.current||!value.length)return;previewCuts.current=value;previewIndex.current=0;video.current.currentTime=value[0].start;void video.current.play().catch(()=>setNotice('Pulsa reproducir sobre el video para escuchar la propuesta.'));}
  function playback(element:HTMLVideoElement){setTime(element.currentTime);const rows=previewCuts.current;if(!rows)return;const row=rows[previewIndex.current];if(!row){element.pause();previewCuts.current=null;return;}if(element.currentTime<row.start-.05){element.currentTime=row.start;return;}if(element.currentTime>=row.end-.025){previewIndex.current++;const next=rows[previewIndex.current];if(!next){element.pause();previewCuts.current=null;}else{element.currentTime=next.start;if(element.paused)void element.play().catch(()=>{});}}}

  useEffect(()=>{
    if(initialFile||file||!pieceId||loading||loadError)return;
    let active=true;const controller=new AbortController();const token=selection.current;
    async function recover(){setRecoverError('');setRecovering(true);try{
      const {piece}=getPiece(docs['module-social-profile'],projectId,pieceId!,userId);
      if(!piece.videoId)return;
      const manifest=parseMaterials(docs['module-materials'],projectId,userId);
      const material=manifest.materials.find(row=>row.id===piece.videoId&&row.kind==='video');
      if(!material)throw new Error('El video de esta pieza necesita recuperar su archivo original.');
      const url=await resolveMediaPath(material.path);const response=await fetch(url,{signal:controller.signal});
      if(!response.ok)throw new Error('No se pudo abrir el video guardado. Reintenta.');
      const blob=await response.blob();if(!blob.size||blob.size>20*1024*1024)throw new Error('Este archivo no se puede recuperar en el editor. Conservamos su referencia en la pieza.');
      if(active&&selection.current===token)setFile(new File([blob],material.name,{type:material.mime}));
    }catch(error){if(active&&!controller.signal.aborted)setRecoverError((error as Error).message);}finally{if(active)setRecovering(false);}}
    void recover();return()=>{active=false;controller.abort();};
  },[pieceId,initialFile,file,projectId,userId,recoverAttempt,loading,loadError,docs['module-social-profile'],docs['module-materials']]);

  useEffect(()=>{
    if(!template||!pieceId||initialFile||file||loading||loadError)return;
    let active=true;
    const controller=new AbortController(),token=selection.current;
    async function prepare(){
      try{
        const {piece}=getPiece(docs['module-social-profile'],projectId,pieceId!,userId);
        if(piece.videoId)return;
        const draft=contentDocument(docs['module-content-creator'],projectId).drafts.find(row=>row.id===pieceId);
        if(!draft)throw new Error('No encontramos el diseño de esta pieza. Vuelve a Creator Studio o elige una grabación.');
        const text=piece.script.trim()||piece.text.trim()||[draft.title,draft.subtitle,draft.cta].filter(Boolean).join(' ');
        if(!text.trim())throw new Error('Añade texto a tu diseño antes de preparar el video.');
        setTemplatePreparing(true);setRecoverError('');
        const imageUrl=draft.imagePath?await resolveMediaPath(draft.imagePath):draft.sourceImageUrl||'';
        const result=await createTemplateVideo(draft.background,imageUrl,template!.recommendedDuration,controller.signal);
        if(!active||selection.current!==token)return;
        generatedText.current={file:result,text};setFile(result);setTemplatePreparing(false);setDirty(true);setStep('captions');setToolPanelOpen(false);
        setNotice('Plantilla lista con tu texto. Revisa los tiempos y el estilo antes de descargar. El video no incluye voz ni música.');
      }catch(error){if(active&&!controller.signal.aborted)setRecoverError((error as Error).message);}
      finally{if(active)setTemplatePreparing(false);}
    }
    void prepare();
    return()=>{active=false;controller.abort();};
  },[template,pieceId,initialFile,file,loading,loadError,projectId,userId,docs['module-social-profile'],docs['module-content-creator'],recoverAttempt]);

  useEffect(() => {
    version.current++;
    setCaptionProposal(null);
    setExported(null);
    setDuration(0);
    setSegments([]);setLayers([]);setMotions([]);setLayerIndex(-1);setBackgroundPreview(null);setLogoPreparing(false);
    silenceUndo.current=null;
    setSilences([]);
    setTime(0);
    if (!file) return;
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => {
      URL.revokeObjectURL(next);
      abort.current?.abort();
    };
  }, [file]);

  async function analyze(applyNow=false) {
    if (!file||busy) return;
    video.current?.pause();
    audioStart.current=null;setBusy("Analizando audio…");
    setNotice("");
    const token = version.current;
    try {
      abort.current?.abort();abort.current=new AbortController();
      const audio = await decodeAudio(file,{signal:abort.current.signal,onProgress:message=>{if(alive.current&&token===version.current)setBusy(message);},onPlaybackRequired:start=>{if(alive.current&&token===version.current){audioStart.current=start;setBusy('Un toque para leer tu voz');}}});
      if (token !== version.current) return;
      const found = detectSilences(
        Array.from({ length: audio.numberOfChannels }, (_, i) =>
          audio.getChannelData(i),
        ),
        audio.sampleRate,
        threshold,
      );
      if(applyNow){
        const next=removeTimelineSilences(segments,found,duration);
        if(!next.length||found.reduce((sum,row)=>sum+row.end-row.start,0)>=duration-.03){setNotice('No encontramos voz suficiente para cortar. Conservamos tus clips.');return;}
        if(!found.length||segments.reduce((sum,row)=>sum+row.end-row.start,0)-next.reduce((sum,row)=>sum+row.end-row.start,0)<.001){setNotice('No encontramos silencios para quitar en tus clips actuales. Tus cortes se conservan.');return;}
        const previous=segments.map(row=>({...row}));editSegments(next);silenceUndo.current=previous;setClipIndex(0);setSilences([]);setNotice('Silencios quitados. Puedes deshacer este corte.');return;
      }
      setSilences(found);
      setNotice(
        `${found.length} ${found.length===1?'pausa detectada':'pausas detectadas'}. Revisa antes de aplicar los cortes.`,
      );
    } catch (e) {
      if(alive.current&&token===version.current)setNotice((e as Error).message);
    } finally {
      if(alive.current&&token===version.current)setBusy("");
    }
  }

  async function createCaptions(){
    if(!file||busy||!duration)return;
    const token=version.current,magic=beginMagic('Tu voz se convierte en subtítulos…');
    audioStart.current=null;setBusy('Preparando tu voz…');setNotice('');video.current?.pause();
    try{
      abort.current?.abort();abort.current=new AbortController();
      const audio=await prepareCaptionAudio(file,{signal:abort.current.signal,onProgress:message=>{if(alive.current&&token===version.current)setBusy(message);},onPlaybackRequired:start=>{if(alive.current&&token===version.current){audioStart.current=start;setBusy('Un toque para leer tu voz');}}});
      if(!alive.current||token!==version.current)return;
      setBusy('FOR U está escuchando tu toma…');
      const rows=await transcribe(audio,projectId);
      if(!alive.current||token!==version.current)return;
      if(!validCaptionTimes(rows,duration))throw new Error('Los tiempos necesitan otro intento. Tu video y tus subtítulos anteriores se conservan.');
      if(!rows.length){setNotice('No encontramos palabras claras en esta toma. Escucha el audio antes de reintentar.');return;}
      setCaptionProposal(rows);setCaptionIndex(0);setNotice('Tu voz ya tiene subtítulos. Reprodúcelos y decide si quieres usarlos.');
    }catch(error){if(alive.current&&token===version.current)setNotice((error as Error).message);}
    finally{finishMagic(magic);if(alive.current&&token===version.current)setBusy('');}
  }

  async function exportClip() {
    if (!file) return;
    setBusy("Exportando en tiempo real…");
    setNotice('');
    if(!validCaptionTimes(subtitles,duration)){setNotice('Revisa los tiempos y completa el texto de tus subtítulos antes de exportar.');setBusy('');return;}
    setProgress(0);
    abort.current = new AbortController();
    try {
      const output = await exportVideo(
        file,
        segments,
        subtitles,
        setProgress,
        abort.current.signal,
        framing==='original'?undefined:{ratio:framing,focus},
        look,
        {layers,motions},
      );
      setExported(new File([output],`for-u-editado.${output.type.includes("mp4")?"mp4":"webm"}`,{type:output.type}));
      downloadBlob(
        output,
        `for-u-editado.${output.type.includes("mp4") ? "mp4" : "webm"}`,
      );
      setDirty(false);setSavedExport(true);
      track("video-edit", true, duration);
      setNotice("Video exportado con tus cortes y subtítulos.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  function loadFile(next?: File) {
    if (!next) return;
    const ext = next.name.split('.').pop()?.toLowerCase() ?? '';
    const mobileVideo = ['mov', 'mp4', 'm4v', '3gp', 'avi', 'mkv', 'webm', 'hevc'].includes(ext);
    if (!next.type.startsWith('video/') && !mobileVideo) {
      setNotice('Elige un archivo de video. Se aceptan MP4, MOV y los formatos de iPhone.');
      return;
    }
    if (next.size > 500 * 1024 * 1024) {
      setNotice('Usa un video de hasta 500 MB.');
      return;
    }
    selection.current++;
    generatedText.current=null;setTemplatePreparing(false);setRecovering(false);setToolPanelOpen(false);
    setSubtitles([]);setDirty(false);setStep(params.get('panel')==='logos'?'layers':'captions');setFraming('original');setCaptionIndex(-1);setClipIndex(0);
    setFile(next);
    setNotice("");
  }

  function metadata(element: HTMLVideoElement) {
    setOriginalSize({width:element.videoWidth||16,height:element.videoHeight||9});
    if (Number.isFinite(element.duration)) {
      setDuration(element.duration);
      if(generatedText.current?.file===file){setSubtitles(templateCaptions(generatedText.current.text,element.duration));generatedText.current=null;}
      setSegments([{ start: 0, end: element.duration }]);
    } else {
      element.currentTime = 1e10;
    }
  }

  const proposed=removeTimelineSilences(segments,silences,duration),captionRows=captionProposal??subtitles,selectedCaption=subtitles[captionIndex];
  const previewRatio=framing==='original'?originalSize:recordingFrames[framing];
  const previewFactor=framing==='original'?Math.min(1,1920/Math.max(originalSize.width,originalSize.height)):1;
  const artworkWidth=Math.round(previewRatio.width*previewFactor),artworkHeight=Math.round(previewRatio.height*previewFactor);
  function seek(next:number){previewCuts.current=null;video.current?.pause();if(video.current)video.current.currentTime=Math.max(0,Math.min(duration,next));setTime(next);}
  function splitHere(){if(busy||!duration)return;const next=splitTimeline(segments,time);if(next!==segments){editSegments(next);setClipIndex(next.findIndex(row=>row.start===time));setStep('cuts');}else setNotice('Mueve el cursor dentro de una toma para dividirla.');}
  useEffect(()=>{const handle=(e:KeyboardEvent)=>{const target=e.target as HTMLElement;if((target.isContentEditable||target.closest('input,textarea,select,[role=dialog],.video-game-result-preview'))||busy||!file||e.altKey)return;if(e.code==='Space'&&!e.metaKey&&!e.ctrlKey){e.preventDefault();togglePlay();}else if(e.key.toLowerCase()==='b'&&(e.metaKey||e.ctrlKey)){e.preventDefault();splitHere();}};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);});
  function togglePlay(){const element=video.current;if(!element)return;if(playing){element.pause();return;}let index=segments.findIndex(row=>element.currentTime>=row.start&&element.currentTime<row.end-.025);if(index<0){index=segments.findIndex(row=>row.start>element.currentTime);if(index<0)index=0;element.currentTime=segments[index]?.start??0;}previewCuts.current=segments;previewIndex.current=index;void element.play().catch(()=>setNotice('Toca reproducir para escuchar tu video.'));}
  function toggleFullscreen(){const container=video.current?.parentElement;if(!document.fullscreenElement){if(container?.requestFullscreen)void container.requestFullscreen();else if((video.current as unknown as {webkitEnterFullscreen?:()=>void})?.webkitEnterFullscreen)(video.current as unknown as {webkitEnterFullscreen:()=>void}).webkitEnterFullscreen();}else if(document.exitFullscreen)void document.exitFullscreen();}
  const outputDuration=segments.reduce((n,row)=>n+row.end-row.start,0),outputTime=montageAtSource(segments,time,playing?previewIndex.current:undefined),chosenLayer=layers[layerIndex];
  const activeClip=segments[playing?previewIndex.current:segments.findIndex(row=>time>=row.start&&time<=row.end)]??segments[0];
  const appearance=activeClip?clipAppearance(time,activeClip,motions[segments.indexOf(activeClip)]):{opacity:1,scale:1};
  useEffect(()=>{const element=video.current;if(!element||!playing)return;let frame=0;const draw=()=>{const clip=segments[previewIndex.current];if(clip){const value=clipAppearance(element.currentTime,clip,motions[previewIndex.current]);element.style.opacity=String(value.opacity);element.style.transform=`scale(${value.scale})`;}for(const image of Array.from(element.parentElement?.querySelectorAll<HTMLImageElement>('.video-layer-preview')??[])){const layer=layers.find(row=>row.id===image.dataset.layerId);if(layer){const value=layerAppearance(layer,montageAtSource(segments,element.currentTime,previewIndex.current));image.style.opacity=String(value.opacity);image.style.top=`${(layer.y+value.rise)*100}%`;image.style.transform=`translate(-50%,-50%) scale(${value.scale})`;}}frame=requestAnimationFrame(draw);};draw();return()=>cancelAnimationFrame(frame);},[playing,segments,motions,layers]);

  const recordingQuery=new URLSearchParams(pieceId?linkedPieceQuery(projectId,pieceId,params):{project:projectId});
  const routeTask=params.get('task');
  if(routeTask)recordingQuery.set('task',routeTask);
  const activeTool=step==='review'?'captions':step;
  const returnTarget=studioReturn(params,null,projectId,pieceId?'profile':'library');
  const activeCaption=selectedCaption??captionRows[0];

  return <section className={`video-game video-workbench${file?' has-video':''}`} aria-busy={!!busy||templatePreparing}>
   <header className="workbench-foru-header">
    <div className="workbench-top-aura" aria-hidden="true"/>
    <div className="workbench-header-bar">
      <div className="workbench-header-left">
        <Link to={returnTarget.path} className="workbench-back-link">
          <ArrowLeft size={16} aria-hidden="true"/>
          <span className="workbench-back-text">{returnTarget.label}</span>
        </Link>
      </div>
      <div className="workbench-header-center">
        <Logo compact className="workbench-header-logo"/>
        <strong className="workbench-header-title">Editor de video</strong>
      </div>
      <div className="workbench-header-right">
        {file&&<details className="workbench-file-menu"><summary aria-label="Archivo y descargas">•••</summary><div>
          {exported&&<details className="workbench-cloud"><summary>✓ Descargado · guardar también en FOR U</summary><video className="video-game-result-preview" src={exportedUrl} controls playsInline/><p>Guardarlo aquí ocupa espacio en tu cuenta. Descargarlo a tu dispositivo no lo sube a FOR U.</p>{pieceId&&<SavePieceFile key={exported.name+exported.lastModified} file={exported} user={userId} project={projectId} piece={pieceId} kind="video" disabled={!!busy} label="Guardar en mi pieza" onSaved={()=>{setDirty(false);setSavedExport(true);}}/>}</details>}
          <details className="video-game-extra"><summary>Archivo original</summary><div className="workbench-inline-actions"><DSButtonSecondary onClick={()=>downloadBlob(file,file.name)}>Descargar original</DSButtonSecondary><label className="video-game-file-button">Cambiar toma<input type="file" accept="video/*,.mov,.MOV,.m4v,.M4V,video/quicktime" disabled={!!busy} onChange={e=>{if(dirty&&!window.confirm('¿Cambiar de toma y descartar estos ajustes? Tu original se conserva.'))return;loadFile(e.target.files?.[0]);}}/></label></div></details>
        </div></details>}
        {file&&<PearlButton className="workbench-download foru-pearl-button" compact disabled={!!busy||!duration||!!captionProposal||!!backgroundPreview||logoPreparing} onClick={()=>void exportClip()}>
          {busy.startsWith('Exportando')?`${Math.round(progress*100)}%`:<><Download size={15} aria-hidden="true"/><span className="workbench-download-text">Descargar</span></>}
        </PearlButton>}
      </div>
    </div>
   </header>

   {!file?<>
    <h1>{template ? template.name : params.get('panel')==='logos'?'Dale tu sello al video.':'¿Cómo quieres empezar tu video?'}</h1>
    {!template&&<div className="workbench-inline-actions">
      <PearlButton tone="neutral" compact to={`/dashboard/tools/teleprompter?${recordingQuery}`}>Grabar con teleprompter</PearlButton>
      {!pieceId&&<PearlButton tone="neutral" compact to={`/creator-studio?${new URLSearchParams({project:projectId,tab:'create',start:'first-content',...(routeTask?{task:routeTask}:{})})}`}>Crear desde una idea</PearlButton>}
    </div>}
    {template&&pieceId&&!recoverError&&!loadError
      ? <div className="video-game-upload video-template-loading" role="status">
        <Sparkles size={25} strokeWidth={1.5} aria-hidden="true"/>
        <p>{recovering?'Abriendo tu toma…':'Preparando tu video con esta plantilla…'}</p>
      </div>
      : <div className="video-game-upload" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();if(!busy&&!recovering)loadFile(event.dataTransfer.files[0]);}}>
        <Upload size={24} strokeWidth={1.5} aria-hidden="true"/>
        <p>{recovering?'Abriendo tu toma…':params.get('panel')==='logos'?'Elige tu video editado para añadir tus logos.':'Arrastra tu video aquí o elige un archivo.'}</p>
        <label className="video-game-file-button">Elegir video<input type="file" accept="video/*,.mov,.MOV,.m4v,.M4V,video/quicktime" disabled={!!busy||recovering} onChange={event=>loadFile(event.target.files?.[0])}/></label>
      </div>}
    {!template&&params.get('panel')!=='logos'&&<TextStylePicker compact look={look} favorites={favorites} sample="Tu idea merece brillar" disabled={loading||loadError||styleInvalid} onChange={changeLook} onFavorites={value=>{styleEdited.current=true;setFavorites(value);setStyleDirty(true);}} onSave={()=>void saveStyle()} saving={styleSaving} status={styleStatus}/>}
   </>:<>
    <nav className="workbench-tool-switcher-bar" aria-label="Herramientas de edición">
      {([{id:'cuts',label:'Recortar',icon:Scissors},{id:'captions',label:'Subtítulos',icon:Captions},{id:'layers',label:'Logos',icon:Layers},{id:'export',label:'Formato',icon:Ratio}] as const).map(tool=>{
        const isActive=activeTool===tool.id;
        return <button
          key={tool.id}
          type="button"
          className={`workbench-tool-pill ${isActive?'is-active':''}`}
          aria-pressed={isActive}
          aria-expanded={isActive&&(!compactEditor||toolPanelOpen)}
          aria-controls="video-tool-panel"
          disabled={!!busy}
          onClick={()=>{
            setStep(tool.id);
            if(compactEditor){setToolPanelOpen(activeTool===tool.id?!toolPanelOpen:true);}else{setToolPanelOpen(true);}
            setNotice('');
          }}
        >
          <tool.icon size={16} aria-hidden="true"/>
          <span>{tool.label}</span>
        </button>;
      })}
    </nav>

    <div className="workbench-stage-grid">
      <div className="workbench-video-col">
        <div className="workbench-preview-stage">
          <div className="video-game-preview" style={{aspectRatio:`${previewRatio.width}/${previewRatio.height}`,width:`min(100%,420px,${38*previewRatio.width/previewRatio.height}dvh)`}}>
            <video
              aria-label="Vista previa de tu video"
              ref={video}
              src={url}
              playsInline
              style={{opacity:appearance.opacity,transform:`scale(${appearance.scale})`,objectFit:framing==='original'?'contain':'cover',objectPosition:`${focus*100}% 50%`}}
              onLoadedMetadata={e=>metadata(e.currentTarget)}
              onDurationChange={e=>{if(!duration&&Number.isFinite(e.currentTarget.duration)){metadata(e.currentTarget);e.currentTarget.currentTime=0;}}}
              onPlay={()=>setPlaying(true)}
              onPause={()=>setPlaying(false)}
              onTimeUpdate={e=>playback(e.currentTarget)}
              onEnded={e=>{playback(e.currentTarget);setPlaying(false);}}
              onError={()=>setNotice('No pudimos reproducir esta toma. En iPhone usa MP4 o MOV grabado en modo normal (no Cinematic).')}
            />
            <CaptionArtwork rows={captionRows} time={time} width={artworkWidth} height={artworkHeight} look={look} playing={playing} clock={()=>video.current?.currentTime??time}/>
            {layers.map(layer=><img key={layer.id} data-layer-id={layer.id} src={layer.url} alt={layer.name} className={`video-layer-preview${layers.indexOf(layer)===layerIndex?' is-selected':''}`} role="button" tabIndex={0} aria-label={`Mover logo: ${layer.name}`} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const delta=e.shiftKey?.05:.01;setLayers(rows=>rows.map(row=>row.id===layer.id?{...row,x:Math.max(0,Math.min(1,row.x+(e.key==='ArrowLeft'?-delta:e.key==='ArrowRight'?delta:0))),y:Math.max(0,Math.min(1,row.y+(e.key==='ArrowUp'?-delta:e.key==='ArrowDown'?delta:0)))}:row));setDirty(true);}} style={{position:'absolute',left:`${layer.x*100}%`,top:`${(layer.y+layerAppearance(layer,outputTime).rise)*100}%`,width:`${layer.width*100}%`,height:'auto',transform:`translate(-50%,-50%) scale(${layerAppearance(layer,outputTime).scale})`,opacity:layerAppearance(layer,outputTime).opacity,pointerEvents:layerAppearance(layer,outputTime).opacity?'auto':'none',cursor:'move',touchAction:'none'}} onPointerDown={e=>{if(busy)return;e.currentTarget.setPointerCapture(e.pointerId);setLayerIndex(layers.indexOf(layer));setStep('layers');}} onPointerMove={e=>{if(!e.currentTarget.hasPointerCapture(e.pointerId)||busy)return;const rect=e.currentTarget.parentElement!.getBoundingClientRect();setLayers(rows=>rows.map(row=>row.id===layer.id?{...row,x:Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height))}:row));setDirty(true);}}/>)}
            {chosenLayer&&layerAppearance(chosenLayer,outputTime).opacity>.2&&<button type="button" className="logo-resize-handle" aria-label="Cambiar tamaño del logo" style={{left:`${Math.min(1,chosenLayer.x+chosenLayer.width/2)*100}%`,top:`${Math.min(1,chosenLayer.y+chosenLayer.width*artworkWidth/(chosenLayer.ratio*artworkHeight)/2)*100}%`}} onPointerDown={e=>{e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);logoResize.current={x:e.clientX,width:chosenLayer.width,canvasWidth:e.currentTarget.parentElement!.getBoundingClientRect().width,id:chosenLayer.id};}} onPointerMove={e=>{const drag=logoResize.current;if(!drag)return;const width=Math.max(.05,Math.min(1,drag.width+2*(e.clientX-drag.x)/drag.canvasWidth));setLayers(rows=>rows.map(row=>row.id===drag.id?{...row,width}:row));setDirty(true);}} onPointerUp={()=>{logoResize.current=null;}} onPointerCancel={()=>{logoResize.current=null;}} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setLayers(rows=>rows.map(row=>row.id===chosenLayer.id?{...row,width:Math.max(.05,Math.min(1,row.width+(e.key==='ArrowRight'?.02:-.02)))}:row));setDirty(true);}}}>↘</button>}
          </div>
        </div>
        <div className="workbench-player-bar">
          <button type="button" className="player-play-btn" aria-label={playing?'Pausar video':'Reproducir montaje'} disabled={!!busy||!duration} onClick={togglePlay}>
            {playing?<Pause size={17} aria-hidden="true"/>:<Play size={17} aria-hidden="true"/>}
          </button>
          <time className="player-time-badge">{timelineClock(outputTime)} / {timelineClock(outputDuration)}</time>
          <div className="player-scrubber-track">
            <input type="range" className="player-scrubber-slider" aria-label="Posición de reproducción" min={0} max={duration||1} step={0.01} value={time} disabled={!!busy||!duration} onChange={e=>seek(Number(e.target.value))}/>
          </div>
          <button type="button" className="player-fullscreen-btn" aria-label="Pantalla completa" disabled={!!busy||!duration} onClick={toggleFullscreen}>
            <Maximize size={16} aria-hidden="true"/>
          </button>
          <VideoGuide step={activeTool} user={userId} project={projectId} disabled={!!busy||recovering}/>
        </div>
      </div>

      <aside ref={toolPanel} className="workbench-inspector-card" id="video-tool-panel" data-panel-open={toolPanelOpen}>
        <button type="button" className="workbench-sheet-close" aria-label="Cerrar ajustes" onClick={closeToolPanel}>Cerrar ×</button>

        {activeTool==='captions'&&<div className="inspector-panel-content">
          <h3 className="inspector-title">Subtítulos</h3>
          {captionProposal ? <div className="workbench-subtitle-proposal">
            <p>Reproduce los subtítulos en la línea de tiempo antes de usarlos.</p>
            <div className="workbench-inline-actions">
              <DSButtonPrimary disabled={!!busy} onClick={()=>{editSubtitles(captionProposal);setCaptionProposal(null);setCaptionIndex(-1);seek(0);setNotice('Subtítulos listos. Toca cualquier bloque para corregirlo.');}}>Usar estos subtítulos</DSButtonPrimary>
              <button className="workbench-text-button" onClick={()=>{setCaptionProposal(null);setCaptionIndex(-1);}}>Conservar mi versión</button>
            </div>
          </div> : <>
            <div className="inspector-caption-card">
              <label htmlFor="inspector-caption-textarea" className="sr-only">Texto del subtítulo</label>
              <textarea
                id="inspector-caption-textarea"
                className="inspector-caption-input"
                rows={2}
                maxLength={120}
                value={activeCaption ? activeCaption.text : ''}
                placeholder={subtitles.length?'Toca un bloque de subtítulo para editar':'Escribe tu subtítulo aquí…'}
                disabled={!!busy}
                onChange={e=>{
                  const newText=e.target.value;
                  if(selectedCaption){
                    editSubtitles(subtitles.map((row,i)=>i===captionIndex?{...row,text:newText}:row));
                  }else if(subtitles.length>0){
                    editSubtitles(subtitles.map((row,i)=>i===0?{...row,text:newText}:row));
                  }else if(duration>0){
                    const start=Math.max(0,Math.min(time,duration-.1));
                    const row={start,end:Math.min(duration,start+2),text:newText};
                    editSubtitles([row]);
                    setCaptionIndex(0);
                  }
                }}
              />
              <div className="inspector-caption-actions">
                <PearlButton tone="neutral" compact className="inspector-style-btn foru-pearl-button" disabled={!!busy||loading||loadError||styleInvalid} onClick={()=>setStyleDockOpen(true)}>
                  <span className="pearl-btn-glyph">A</span> Estilo
                </PearlButton>
                {selectedCaption&&<DSButtonSecondary disabled={!!busy} onClick={()=>{editSubtitles(subtitles.filter((_,i)=>i!==captionIndex));setCaptionIndex(-1);}}>Eliminar</DSButtonSecondary>}
              </div>
            </div>

            {!subtitles.length&&<div className="workbench-inline-actions" style={{marginBottom:12}}>
              <DSButtonPrimary disabled={!!busy||!duration} onClick={()=>void createCaptions()}><Sparkles size={15} aria-hidden="true"/> Crear subtítulos con IA</DSButtonPrimary>
              <small>FOR U escucha tu audio y genera el texto.</small>
            </div>}

            <details className="video-game-extra"><summary>Más opciones de subtítulos</summary><div className="workbench-inline-actions">
              {!!subtitles.length&&<DSButtonSecondary disabled={!!busy} onClick={()=>void createCaptions()}>✦ Volver a generar con IA</DSButtonSecondary>}
              <DSButtonSecondary disabled={!!busy||duration<.1} onClick={()=>{const nextStart=Math.max(0,Math.min(time,duration-.1));if(subtitles.some(row=>nextStart<row.end&&nextStart+1>row.start)){setNotice('Mueve el cursor a un espacio libre antes de añadir un subtítulo.');return;}const row={start:nextStart,end:Math.min(duration,nextStart+1),text:'Tu texto'};const next=[...subtitles,row].sort((a,b)=>a.start-b.start);editSubtitles(next);setCaptionIndex(next.indexOf(row));}}>＋ Subtítulo</DSButtonSecondary>
              <label className="video-game-file-button">Importar SRT<input type="file" accept=".srt,text/plain" disabled={!!busy} onChange={async e=>{const selected=e.target.files?.[0];if(!selected)return;try{if(selected.size>300000)throw new Error('Usa un archivo SRT de hasta 300 KB.');const rows=readSrt(await selected.text());if(!validCaptionTimes(rows,duration))throw new Error('Los tiempos superan la duración de tu toma.');editSubtitles(rows);setCaptionIndex(-1);}catch(error){setNotice((error as Error).message);}}}/></label>
            </div></details>
          </>}

          <TextStylePicker
            isOpen={styleDockOpen}
            onOpenChange={setStyleDockOpen}
            look={look}
            favorites={favorites}
            sample={activeCaption?.text||'Tu idea merece brillar'}
            disabled={!!busy||loading||loadError||styleInvalid}
            onChange={changeLook}
            onFavorites={value=>{styleEdited.current=true;setFavorites(value);setStyleDirty(true);setStyleStatus('Favoritos en vista previa. Guarda para recordarlos.');}}
            onSave={()=>void saveStyle()}
            saving={styleSaving}
            status={styleStatus}
          />
        </div>}

        {activeTool==='cuts'&&<div className="inspector-panel-content">
          <h3 className="inspector-title">Recortar</h3>
          <div className="workbench-inline-actions" style={{marginBottom:12}}>
            <DSButtonPrimary disabled={!!busy||!duration} title="Dividir en el cursor · ⌘B / Ctrl+B" onClick={splitHere}><Scissors size={15} aria-hidden="true"/> Dividir en cursor</DSButtonPrimary>
            <DSButtonSecondary disabled={!!busy||!duration} onClick={()=>void analyze(true)}><Sparkles size={15} aria-hidden="true"/> Quitar silencios en 1 clic</DSButtonSecondary>
            {segments.length>1&&segments[clipIndex]&&<DSButtonSecondary disabled={!!busy} onClick={()=>{editSegments(segments.filter((_,i)=>i!==clipIndex));setClipIndex(0);}}>Quitar clip</DSButtonSecondary>}
          </div>
          {silenceUndo.current&&<button type="button" className="workbench-text-button" disabled={!!busy} onClick={()=>{const previous=silenceUndo.current;if(previous){editSegments(previous);silenceUndo.current=null;setNotice('Corte de silencios deshecho.');}}}>↶ Deshacer corte</button>}
          {silences.length>0&&<div className="workbench-subtitle-proposal"><p>{silences.length} pausas detectadas. Escucha antes de cortar.</p><div className="workbench-inline-actions"><DSButtonSecondary disabled={!!busy||!proposed.length} onClick={()=>playCuts(proposed)}>▶ Escuchar propuesta</DSButtonSecondary><DSButtonPrimary disabled={!!busy||!proposed.length} onClick={()=>{editSegments(proposed);setClipIndex(0);setSilences([]);setNotice('Cortes aplicados. Tu original se conserva.');}}>Aplicar cortes</DSButtonPrimary></div></div>}
          {segments[clipIndex]&&<details className="workbench-motion-options"><summary>Animaciones de toma · opcional</summary><div className="workbench-clip-motion">{(['enter','exit'] as const).map(edge=><div key={edge}><small>{edge==='enter'?'Entrada':'Salida'} · toma {clipIndex+1}</small>{(['none','fade','zoom'] as const).map(effect=><button type="button" key={effect} aria-pressed={(motions[clipIndex]?.[edge]??'none')===effect} onClick={()=>{setMotions(segments.map((_,i)=>i===clipIndex?{enter:motions[i]?.enter??'none',exit:motions[i]?.exit??'none',[edge]:effect}:motions[i]??{enter:'none',exit:'none'}));setDirty(true);}}>{effect==='none'?'Sin efecto':effect==='fade'?'Fundido':'Zoom'}</button>)}</div>)}</div></details>}
          <details className="video-game-extra"><summary>Ajustes de recorte</summary><DSButtonSecondary disabled={!!busy||!duration} onClick={()=>void analyze()}>Detectar y revisar antes de cortar</DSButtonSecondary><label>Sensibilidad<input aria-label="Sensibilidad del silencio" type="range" min="-55" max="-20" value={threshold} disabled={!!busy} onChange={e=>{setThreshold(Number(e.target.value));setSilences([]);}}/></label><DSButtonSecondary disabled={!!busy} onClick={()=>{editSegments([{start:0,end:duration}]);setSilences([]);setClipIndex(0);setNotice('Video completo restaurado.');}}>Restaurar video completo</DSButtonSecondary></details>
        </div>}

        {activeTool==='layers'&&<div className="inspector-panel-content">
          <h3 className="inspector-title">Logos y animación</h3>
          <label className="video-game-file-button">{logoPreparing?'Preparando…':'＋ Añadir logos'}<input type="file" multiple accept="image/png,image/jpeg,image/webp" disabled={!!busy||logoPreparing} onChange={e=>{void addLayers(Array.from(e.target.files??[]));e.target.value='';}}/></label>
          {!!layers.length&&<div className="logo-layer-list" aria-label="Tus logos" style={{margin:'10px 0'}}>{layers.map((layer,index)=><button type="button" key={layer.id} aria-label={`Elegir logo ${index+1}: ${layer.name}`} aria-pressed={layerIndex===index} onClick={()=>{setLayerIndex(index);setBackgroundPreview(null);seek(sourceAtMontage(segments,Math.min(outputDuration-.01,layer.start+.7)));}}><img src={layer.url} alt=""/><span>{index+1}</span></button>)}</div>}
          {chosenLayer?<>
            {backgroundPreview?.id===chosenLayer.id?<div className="logo-background-review"><strong>Revisa tu logo</strong><div className="logo-checker"><img src={backgroundPreview.url} alt="Vista previa del logo sin fondo"/></div><small>El cuadriculado indica transparencia.</small><div className="workbench-inline-actions"><button type="button" onClick={()=>{setLayers(rows=>rows.map(row=>row.id===chosenLayer.id?{...row,originalUrl:row.originalUrl??row.url,url:backgroundPreview.url}:row));setBackgroundPreview(null);setDirty(true);}}>Usar sin fondo</button><button type="button" onClick={()=>setBackgroundPreview(null)}>Conservar original</button></div></div>:<div className="workbench-inline-actions" style={{margin:'8px 0'}}><button type="button" disabled={!!busy||logoPreparing} onClick={()=>void previewBackground()}>Quitar fondo liso</button>{chosenLayer.originalUrl&&<button type="button" onClick={()=>{setLayers(rows=>rows.map(row=>row.id===chosenLayer.id?{...row,url:row.originalUrl!,originalUrl:undefined}:row));setDirty(true);}}>Restaurar logo original</button>}</div>}
            <div className="logo-motion-picker" role="group" aria-label="Animación del logo" style={{margin:'8px 0'}}>{([{id:'fade',label:'Suave'},{id:'pop',label:'Pop'},{id:'rise',label:'Flotar'}] as const).map(effect=><button type="button" key={effect.id} aria-pressed={chosenLayer.animation===effect.id} onClick={()=>{setLayers(rows=>rows.map((row,i)=>i===layerIndex?{...row,animation:effect.id}:row));setDirty(true);}}>{effect.label}</button>)}</div>
            <button type="button" className="logo-preview-ending" disabled={!!busy} onClick={previewLogo}><Play size={15} aria-hidden="true"/> Ver animación</button>
            <details className="logo-adjustments"><summary>Tamaño, posición y duración</summary><label>Tamaño<input aria-label="Tamaño del logo" type="range" min=".05" max="1" step=".01" value={chosenLayer.width} onChange={e=>{setLayers(rows=>rows.map((row,i)=>i===layerIndex?{...row,width:Number(e.target.value)}:row));setDirty(true);}}/></label><small>Arrastra el logo sobre el video para colocarlo.</small><div className="workbench-inline-actions"><button type="button" onClick={()=>{setLayers(rows=>rows.map((row,i)=>i===layerIndex?{...row,placement:'end',start:Math.max(0,outputDuration-3),end:outputDuration}:row));setDirty(true);}}>Últimos 3 s</button><button type="button" onClick={()=>{setLayers(rows=>rows.map((row,i)=>i===layerIndex?{...row,placement:'overlay',start:0,end:outputDuration}:row));setDirty(true);}}>Todo el video</button></div><div className="workbench-layer-times">{(['start','end'] as const).map(edge=><label key={edge}>{edge==='start'?'Desde':'Hasta'}<input aria-label={edge==='start'?'Inicio del logo':'Final del logo'} type="number" min="0" max={outputDuration} step=".1" value={chosenLayer[edge]} onChange={e=>{const n=Number(e.target.value);setLayers(rows=>rows.map((row,i)=>i!==layerIndex?row:{...row,placement:'overlay',[edge]:edge==='start'?Math.max(0,Math.min(row.end-.05,n)):Math.max(row.start+.05,Math.min(outputDuration,n))}));setDirty(true);}}/></label>)}</div><button type="button" onClick={()=>{setLayers(rows=>rows.filter((_,i)=>i!==layerIndex));setLayerIndex(-1);setDirty(true);}}>Eliminar logo</button></details>
          </>:<small>Añade uno o varios logos. Colócalos donde quieras y mueve su pista para elegir cuándo aparecen.</small>}
        </div>}

        {activeTool==='export'&&<div className="inspector-panel-content">
          <h3 className="inspector-title">Formato</h3>
          <nav aria-label="Formato de exportación" style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
            <button type="button" disabled={!!busy} aria-pressed={framing==='original'} onClick={()=>{setFraming('original');setDirty(true);}}>Original</button>
            {(Object.keys(recordingFrames) as RecordingRatio[]).map(id=><button key={id} type="button" disabled={!!busy} aria-pressed={framing===id} onClick={()=>{setFraming(id);setFocus(.5);setDirty(true);}}>{recordingFrames[id].label}</button>)}
          </nav>
          {framing!=='original'&&<label className="video-game-focus">Encuadre<input aria-label="Encuadre de exportación" type="range" min="0" max="1" step=".01" value={focus} disabled={!!busy} onChange={e=>{setFocus(Number(e.target.value));setDirty(true);}}/></label>}
          <small>El marco muestra el recorte que se descargará.</small>
        </div>}
      </aside>
    </div>

    {busy&&!busy.startsWith('Exportando')&&<div className="workbench-audio-progress" role="status">
      <span>{busy}</span>
      {audioStart.current&&<button type="button" onClick={()=>{const start=audioStart.current;audioStart.current=null;setBusy('Leyendo tu voz…');start?.();}}>Leer voz</button>}
      <button type="button" onClick={()=>{abort.current?.abort();audioStart.current=null;version.current++;setBusy('');setNotice('Lectura cancelada. Tu video y tus cortes se conservan.');}}>Cancelar</button>
    </div>}
    {notice&&<p role="status" className="video-game-notice">{notice}</p>}

    {duration>0&&<VideoTimeline
      url={url}
      duration={duration}
      time={time}
      clips={segments}
      layers={layers}
      onLayer={index=>{setLayerIndex(index);setStep('layers');setToolPanelOpen(true);seek(sourceAtMontage(segments,Math.min(outputDuration-.01,layers[index].start+.7)));}}
      onLayers={rows=>{setLayers(rows);setDirty(true);}}
      captions={captionRows}
      captionIndex={captionIndex}
      clipIndex={activeTool==='cuts'?clipIndex:-1}
      proposal={!!captionProposal}
      disabled={!!busy}
      onSeek={seek}
      onCaption={index=>{setStep('captions');setCaptionIndex(index);setToolPanelOpen(true);}}
      onClip={index=>{setStep('cuts');setClipIndex(index);setToolPanelOpen(true);}}
      onClips={editSegments}
      onCaptions={editSubtitles}
    />}

    {busy.startsWith('Exportando')&&<div className="workbench-inline-actions workbench-export-progress" style={{marginTop:10}}>
      <progress aria-label="Progreso de exportación" value={progress} max={1}/>
      <button className="workbench-text-button" onClick={()=>abort.current?.abort()}>Cancelar descarga</button>
      <small>Mantén la pestaña visible mientras se prepara.</small>
    </div>}
   </>}

   {styleInvalid&&<p role="alert">{styleStatus}</p>}
   {!file&&notice&&<p role="status" className="video-game-notice">{notice}</p>}
   {recoverError&&<div role="alert"><p>{recoverError}</p><DSButtonSecondary disabled={recovering||templatePreparing} onClick={()=>setRecoverAttempt(value=>value+1)}>{template?'Reintentar plantilla':'Reintentar video guardado'}</DSButtonSecondary></div>}
  </section>;
}
