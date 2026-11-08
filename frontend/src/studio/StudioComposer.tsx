import {useEffect,useState} from 'react';
import {useLocation,useNavigate,useSearchParams} from 'react-router-dom';
import {useToolkit} from '../toolkit/ToolkitContext';
import {usePrivateDocument} from '../experience/usePrivateDocument';
import {emptyCampaigns,parseCampaigns} from '../workspace/contracts';
import PearlButton from '../components/ui/PearlButton';
import {confirmWorkspaceNavigation} from '../lib/useUnsavedNavigation';
import {pillarSuggestions,type BrandProfile} from '../experience/brandProfile';
import {readIdeaDraft,writeIdeaDraft} from './ideaDrafts';
import {firstContentSource,intentions,type Intent,type CreativeSource} from './model';
import StudioCanvas from './StudioCanvas';
import './studioTopicPicker.css';

const topicExamples: Record<string, string> = {
 'Café y productos': 'Presenta un favorito de tu menú.',
 'Personas y comunidad': 'Cuenta una historia de las personas que te acompañan.',
 'Historia y proceso': 'Muestra cómo preparas algo, paso a paso.',
 'Productos y usos': 'Muestra cómo usar uno de tus productos.',
 'Cómo lo hacemos': 'Enseña un detalle de tu proceso.',
 'Lugares y cultura': 'Presenta un lugar que merece una visita.',
 'Experiencias y recorridos': 'Muestra qué se vive en uno de tus recorridos.',
 'Personas del viaje': 'Presenta a alguien que hace especial la experiencia.',
 'Espacios y estadías': 'Muestra tu rincón favorito del hospedaje.',
 'Vida local': 'Comparte algo para hacer cerca de tu hospedaje.',
 'Personas y hospitalidad': 'Presenta a quienes reciben a tus huéspedes.',
 'Ideas para aprender': 'Comparte un consejo que se pueda probar hoy.',
 'Práctica y proceso': 'Muestra un ejercicio corto de tu curso.',
 'Problemas que ayudamos a resolver': 'Cuenta cómo ayudas con una duda frecuente.',
 'Proceso y método': 'Muestra cómo empiezas a trabajar con un cliente.',
};
export default function StudioComposer({sources,onBusy,brand}:{brand?:BrandProfile;sources:CreativeSource[];onBusy:(value:boolean)=>void}){
 const {projectId,userId,business}=useToolkit(),[params,setParams]=useSearchParams();
 const location=useLocation(),navigate=useNavigate();
 const campaigns=usePrivateDocument(userId,projectId,'campaigns',()=>emptyCampaigns(projectId),value=>parseCampaigns(value,projectId));
 const campaign=campaigns.data.campaigns.find(row=>row.id===params.get('campaign'));
 const requestedIntent=intentions.some(row=>row.id===params.get('intent'))?params.get('intent') as Intent:'awareness';
 const suggested=pillarSuggestions[business.route||'services'];
 const incoming=brand?.pillars.includes(params.get('pillar')||'')?params.get('pillar')!:suggested.includes(params.get('topic')||'')?params.get('topic')!:'';
 const notes=brand?.pillarDetails?.find(row=>row.name===incoming)?.notes||'';
 const themes=brand?.pillars.length?brand.pillars.slice(0,3):suggested.slice(0,3);
 const fromLanding=params.get('from')==='landing';
 const linked=fromLanding?firstContentSource(sources,campaign?.intent||requestedIntent,params.get('section')||undefined,params.get('offer')||undefined):undefined;
 const [step,setStep]=useState<'topic'|'source'|'canvas'>(incoming||params.get('compose')==='idea'||linked?'canvas':fromLanding?'source':'topic'),[pillar,setPillar]=useState(incoming),[source,setSource]=useState<CreativeSource|null>(linked||null),[idea,setIdea]=useState(()=>readIdeaDraft(sessionStorage,userId,projectId,incoming,notes));
 useEffect(()=>{if(fromLanding){setSource(linked||null);if(linked)setIdea([linked.title,linked.body].filter(Boolean).join('\n\n'));setStep(linked?'canvas':'source');}else if(incoming||params.get('compose')==='idea'){setPillar(incoming);setIdea(readIdeaDraft(sessionStorage,userId,projectId,incoming,notes));setSource(null);setStep('canvas');}},[incoming,params.get('compose'),params.get('section'),params.get('offer'),params.get('pageRevision')]);
 function editIdea(value:string){setIdea(value);writeIdeaDraft(sessionStorage,userId,projectId,pillar,value);}
 function independentParams() {
  const next=new URLSearchParams(params);
  for(const key of ['compose','topic','pillar','from','section','offer','pageRevision','viewport','creation','design'])next.delete(key);
  return next;
 }
 function openIdea(theme:string){
  setPillar(theme);setSource(null);
  setIdea(readIdeaDraft(sessionStorage,userId,projectId,theme,brand?.pillarDetails?.find(row=>row.name===theme)?.notes||''));
  setStep('canvas');
  const next=independentParams();
  next.set('compose','idea');
  if(brand?.pillars.includes(theme))next.set('pillar',theme);
  else if(theme)next.set('topic',theme);
  setParams(next,{state:{fromStudioTopics:true}});
 }
 function showTopics(){
  if(params.get('compose')!=='idea'&&!confirmWorkspaceNavigation())return;
  if(location.state?.fromStudioTopics){navigate(-1);return;}
  setStep('topic');
  setParams(independentParams(),{replace:true});
 }
 function openSource(item:CreativeSource){
  setPillar('');setSource(item);
  setIdea([item.title,item.body].filter(Boolean).join('\n\n'));
  setStep('canvas');
 }
 const pillarsParams=new URLSearchParams(params);
 pillarsParams.set('start','pillars');
 for(const key of ['compose','topic','pillar'])pillarsParams.delete(key);
 const mainIndex=/^[012]$/.test(params.get('pin')||'')?Number(params.get('pin')):undefined;
 if(!campaigns.loaded)return <p role="status">Abriendo tu espacio creativo…</p>;
 if(campaigns.error)return <section role="alert"><p>{campaigns.error}</p><PearlButton tone="neutral" compact onClick={()=>void campaigns.reload()}>Reintentar</PearlButton></section>;
 if(params.get('campaign')&&!campaign)return <p role="alert">Esta campaña no está disponible en este proyecto. Tu contenido sigue guardado.</p>;
 if(step==='canvas'&&(params.get('compose')==='idea'||incoming||fromLanding))return <StudioCanvas key={projectId+':'+pillar+':'+(source?.key||'idea')+':'+(params.get('design')||'')} idea={idea} onIdea={editIdea} pillar={pillar} brand={brand} source={source} campaign={campaign} mainIndex={mainIndex} onBack={showTopics} onBusy={onBusy}/>;
 return <section className="studio-flow studio-topic-picker">
  <header hidden={!campaign} className="studio-topic-campaign"><small>{campaign?.title}</small></header>
  {step!=='source'?<>
   <h1>{params.get('start')==='first-content'?'Crea tu primera publicación':'Crea una publicación'}</h1>
   <p>Elige un tema. Después escribe tu idea para crear el diseño.</p>
   <div className="studio-topic-choices studio-topic-colors">
    {themes.map((theme,index)=><PearlButton key={theme} tone="neutral" className="studio-topic-choice" onClick={()=>openIdea(theme)}>
     <span className="studio-topic-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
     <span className="studio-topic-copy">
      <strong>{theme}</strong>
      <small>{topicExamples[theme]||'Comparte una idea de tu negocio sobre este tema.'}</small>
     </span>
    </PearlButton>)}
   </div>
   <div className="studio-topic-actions">
    <PearlButton tone="neutral" compact onClick={()=>openIdea('')}>Escribir mi propia idea</PearlButton>
    {sources.length>0&&<PearlButton tone="neutral" compact className="studio-topic-utility" onClick={()=>setStep('source')}>Usar una oferta o sección</PearlButton>}
    <PearlButton tone="neutral" compact className="studio-topic-utility" to={`/creator-studio?${pillarsParams}`}>Ajustar mis temas</PearlButton>
   </div>
  </>:<>
   <h1>Elige qué quieres compartir</h1>
   <p>{sources.length?'Toca una oferta o una sección para usar su texto como punto de partida.':'Puedes empezar con un tema o escribir una idea propia.'}</p>
   {sources.length>0&&<div className="studio-topic-choices">
    {sources.map(item=><PearlButton key={item.key} tone="neutral" className="studio-topic-choice" onClick={()=>openSource(item)}>
     <strong>{item.title}</strong>
     {item.body&&<small>{item.body.length>100?`${item.body.slice(0,100)}…`:item.body}</small>}
    </PearlButton>)}
   </div>}
   <div className="studio-topic-actions">
    <PearlButton tone="neutral" compact onClick={showTopics}>Ver mis temas</PearlButton>
    <PearlButton tone="neutral" compact onClick={()=>openIdea('')}>Escribir mi propia idea</PearlButton>
   </div>
  </>}
 </section>;
}
