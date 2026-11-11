import DesignThumbnail from '../experience/DesignThumbnail';
import {contentDocument} from './saveComposition';
import {randomId} from '../lib/randomId';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import {useEffect,useRef,useState} from 'react';
import {Link,useNavigate,useSearchParams} from 'react-router-dom';
import {useToolkit} from '../toolkit/ToolkitContext';
import {usePrivateDocument} from '../experience/usePrivateDocument';
import {emptyCampaigns,parseCampaigns,type Campaign} from '../workspace/contracts';
import {ButtonPrimary,ButtonSecondary,Input} from '../components/ui/DesignSystem';
import {intentions,type CreativeSource} from './model';
import EditorDecision from '../toolkit/EditorDecision';
const blankCampaign = (): Campaign => ({ id: randomId(), title: '', intent: 'awareness', offer: null, start: null, end: null, pieceIds: [] });

export default function CampaignStudio({sources,onBusy,startNew=false}:{sources:CreativeSource[];onBusy:(value:boolean)=>void;startNew?:boolean}){
 const {userId,projectId}=useToolkit(),navigate=useNavigate();
 const [params,setParams]=useSearchParams();
 const doc=usePrivateDocument(userId,projectId,'campaigns',()=>emptyCampaigns(projectId),v=>parseCampaigns(v,projectId));
 const designs=usePrivateDocument(userId,projectId,'content-creator',()=>contentDocument(null,projectId),v=>contentDocument(v,projectId));
 const [draft,setDraft]=useState<Campaign|null>(()=>startNew?blankCampaign():null),[step,setStep]=useState<'intent'|'offer'|'title'|'review'>('intent'),[error,setError]=useState('');const lock=useRef(false);
 useEffect(()=>{onBusy(Boolean(draft));return()=>onBusy(false);},[Boolean(draft)]);
 useUnsavedNavigation(Boolean(draft&&(!startNew||step!=='intent'))||doc.dirty);
 function create(){setDraft(blankCampaign());setStep('intent');setError('');}
 function closeDraft(){
  setDraft(null);
  if(params.get('start')==='campaign'){
   const next=new URLSearchParams(params);
   next.delete('start');
   setParams(next,{replace:true});
  }
 }
 async function save(){if(!draft||lock.current)return;setError('');if(!draft.title.trim()){setError('Dale un nombre para reconocer esta campaña.');return;}lock.current=true;try{const next=parseCampaigns({...doc.data,campaigns:doc.data.campaigns.some(c=>c.id===draft.id)?doc.data.campaigns.map(c=>c.id===draft.id?draft:c):[...doc.data.campaigns,draft]},projectId);doc.change(next);if(!await doc.save())throw new Error('Tu campaña sigue en pantalla. Revisa el guardado y vuelve a intentarlo.');closeDraft();}catch(e){setError((e as Error).message);}finally{lock.current=false;}}
 if(!doc.loaded)return <p role="status">Abriendo tus campañas…</p>;
 if(doc.error&&(!draft||step==='intent'))return <section role="alert"><p>{doc.error}</p><ButtonSecondary onClick={()=>void doc.reload()}>Reintentar lectura</ButtonSecondary></section>;
 const offers=sources.filter(s=>s.group==='offer');
 if(draft)return <section className="studio-flow"><ButtonSecondary disabled={doc.busy} onClick={()=>{if(step==='intent'||step==='review')closeDraft();else setStep(step==='offer'?'intent':'offer');}}>← {step==='intent'||step==='review'?'Mis campañas':'Atrás'}</ButtonSecondary><h2>{({intent:'¿Qué quieres conseguir con esta campaña?',offer:'¿Qué oferta la acompaña?',title:'¿Cómo la reconocerás?',review:'Tu campaña, con un rumbo claro.'})[step]}</h2>
 {step==='intent'&&<div className="studio-answer-grid">{intentions.map(item=><button key={item.id} onClick={()=>{setDraft({...draft,intent:item.id});setStep('offer');}}><span aria-hidden="true">{item.icon}</span><strong>{item.title}</strong><small>{item.hint}</small></button>)}</div>}
 {step==='offer'&&<><p>Puedes vincular una oferta confirmada o hablar de tu negocio en general.</p><div className="studio-source-list">{offers.map(item=><button key={item.key} onClick={()=>{setDraft({...draft,offer:item.reference});setStep('title');}}><strong>{item.title}</strong><span>{item.body.slice(0,100)}</span></button>)}<button onClick={()=>{setDraft({...draft,offer:null});setStep('title');}}><strong>Mi negocio en general</strong><span>Sin una oferta específica.</span></button></div></>}
 {step==='title'&&<><p>Un nombre para ti. No se publica.</p><Input disabled={doc.busy} label="Nombre de la campaña" value={draft.title} maxLength={160} onChange={e=>setDraft({...draft,title:e.target.value})}/><ButtonPrimary disabled={!draft.title.trim()} onClick={()=>setStep('review')}>Revisar mi campaña →</ButtonPrimary></>}
 {step==='review'&&<><article className="studio-campaign-summary"><strong>{draft.title}</strong><p>{intentions.find(i=>i.id===draft.intent)?.title}</p><small>{sources.find(s=>s.reference?.id===draft.offer?.id&&s.reference?.kind===draft.offer?.kind)?.title||'Mi negocio en general'}</small><p>{draft.pieceIds.length} piezas vinculadas</p></article><details><summary>Periodo y ajustes · opcional</summary><EditorDecision choices={[{id:'title',title:'Nombre de la campaña',hint:'Cámbialo sin alterar sus piezas.',icon:'✎',content:<Input disabled={doc.busy} label="Nombre de la campaña" value={draft.title} maxLength={160} onChange={e=>setDraft({...draft,title:e.target.value})}/>},{id:'start',title:'Cuándo comienza',hint:'Opcional. No activa anuncios ni recordatorios.',icon:'◷',content:<Input disabled={doc.busy} label="Inicio de campaña" type="date" value={draft.start||''} onChange={e=>setDraft({...draft,start:e.target.value||null})}/>},{id:'end',title:'Cuándo termina',hint:'Opcional. Debe ser posterior o igual al inicio.',icon:'◷',content:<Input disabled={doc.busy} label="Fin de campaña" type="date" min={draft.start||undefined} value={draft.end||''} onChange={e=>setDraft({...draft,end:e.target.value||null})}/>} ]}/></details><ButtonPrimary disabled={doc.busy} onClick={()=>void save()}>{doc.busy?'Guardando…':'Guardar campaña'}</ButtonPrimary></>}{(error||doc.error)&&<p role="alert">{error||doc.error}</p>}</section>;
 return <section className="studio-campaigns"><header><div><h2>Tus campañas</h2><p>Un objetivo, una oferta y las piezas que van tomando forma.</p></div><ButtonPrimary onClick={create}>Crear campaña</ButtonPrimary></header>{doc.data.campaigns.length?<div className="studio-campaign-list">{doc.data.campaigns.map(c=><article key={c.id}><small>{intentions.find(i=>i.id===c.intent)?.title}</small><h3>{c.title}</h3><p>{c.pieceIds.length} {c.pieceIds.length===1?'pieza':'piezas'} · {c.start?`${c.start}${c.end?' → '+c.end:''}`:'Sin periodo definido'}</p><div className="studio-campaign-pieces">{designs.data.drafts.filter(d=>c.pieceIds.includes(d.id)).slice(-3).map(d=><Link key={d.id} to={`/content-creator?project=${projectId}&design=${d.id}`}><DesignThumbnail draft={d} user={userId} project={projectId}/><span>{d.title||'Mi pieza'} · Editar</span></Link>)}</div>{designs.error&&<p role="alert">No pudimos leer las miniaturas. Tus piezas siguen guardadas.</p>}<ButtonSecondary onClick={()=>navigate(`/creator-studio?project=${projectId}&campaign=${c.id}&tab=create`)}>Crear contenido</ButtonSecondary>{c.pieceIds.length>3&&<Link className="pe-action-link" to={`/creator-studio?project=${projectId}&tab=library&campaign=${c.id}`}>Ver todas las piezas</Link>}<details><summary>Ajustar campaña</summary><ButtonSecondary onClick={()=>{setDraft(c);setStep('review');}}>Nombre y periodo</ButtonSecondary></details></article>)}</div>:<div className="studio-empty-state"><span aria-hidden="true">⌁</span><h3>Un espacio para unir tus ideas.</h3><p>Puedes crear contenido sin campaña. Cuando quieras reunir varias piezas con el mismo objetivo, empieza aquí.</p></div>}</section>;
}
