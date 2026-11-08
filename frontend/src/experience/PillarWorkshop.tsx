import {useRef,useState} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {useToolkit} from '../toolkit/ToolkitContext';
import {parseDiagnostic,emptyDiagnostic,type Diagnostic} from '../workspace/contracts';
import {contentPillars} from './brandProfile';
import {parsePillarDetails,updatePillarDetails,type PillarDetail} from './pillarDetails';
import PearlButton from '../components/ui/PearlButton';
import {Input,Textarea} from '../components/ui/DesignSystem';
import {firstContentReturn} from '../studio/navigation';
import '../studio/studioTopicPicker.css';
import {useUnsavedNavigation,confirmWorkspaceNavigation} from '../lib/useUnsavedNavigation';
export default function PillarWorkshop(){
 const {docs,projectId,business}=useToolkit();let doc:Diagnostic;
 try{const parsed=docs['module-project-diagnostic']===undefined?emptyDiagnostic(projectId,business.route||'services'):parseDiagnostic(docs['module-project-diagnostic'],projectId);if(parsed.version!==2)throw new Error('Tus elecciones anteriores se conservan. Recupera su formato antes de editar pilares.');doc=parsed;contentPillars(doc.answers);}catch(e){return <p role="alert">{(e as Error).message}</p>;}
 return <Session key={projectId} initial={doc}/>;
}
function Session({initial}:{initial:Diagnostic}){
 const {save,documentRevision,projectId}=useToolkit(),navigate=useNavigate();const [doc,setDoc]=useState(initial),[current,setCurrent]=useState<PillarDetail|null>(null),[previous,setPrevious]=useState<string|undefined>(),[step,setStep]=useState<'name'|'notes'>('notes'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[dirty,setDirty]=useState(false);
 const revision=useRef(documentRevision('module-project-diagnostic')),lock=useRef(false);
 useUnsavedNavigation(dirty||busy);
 const names=contentPillars(doc.answers),details=parsePillarDetails(doc.pillarDetails);
 function open(index:number){if(!confirmWorkspaceNavigation())return;const name=names[index];setCurrent(details.find(row=>row.name===name)||{id:crypto.randomUUID(),name:name||'',notes:''});setPrevious(name);setStep(name?'notes':'name');setDirty(false);setError('');}
 function edit(patch:Partial<PillarDetail>){if(!current||lock.current)return;setCurrent({...current,...patch});setDirty(true);setError('');}
 async function store(){if(!current||lock.current)return;lock.current=true;setBusy(true);setError('');try{if(documentRevision('module-project-diagnostic')!==revision.current)throw new Error('Tus pilares cambiaron en otra ventana. Conservamos estas notas; revisa la versión guardada antes de reintentar.');const next=updatePillarDetails(names,details,previous,current);const updated={...doc,answers:{...doc.answers,pillars:next.names,pillarsCustom:''},pillarDetails:next.details};parseDiagnostic(updated,projectId);await save('module-project-diagnostic',updated);revision.current=documentRevision('module-project-diagnostic');setDoc(updated);setCurrent(next.details.find(row=>row.name===current.name.trim())!);setPrevious(current.name.trim());setDirty(false);}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}}
 const [params]=useSearchParams();
 const returnParams=new URLSearchParams(params);
 returnParams.set('return','first-content');
 const contentPath=firstContentReturn(returnParams,projectId)!;
 const back=params.has('task')?contentPath:`/creator-studio?${new URLSearchParams({project:projectId,tab:'create'})}`;
 const topics=Array.from({length:Math.max(3,names.length)},(_,index)=>names[index]);
 return <section className="studio-flow first-content-flow pillar-workshop studio-topic-picker">
  <header className="studio-flow-trail"><PearlButton tone="neutral" compact subtle to={back}>Volver a crear</PearlButton></header>
  {!current?<>
   <h1>Tus temas, con tus palabras.</h1>
   <p>Elige un tema para anotar ideas que quieras compartir en tus publicaciones.</p>
   <div className="studio-topic-choices">
    {topics.map((name,index)=><PearlButton tone="neutral" key={index} className="studio-topic-choice" onClick={()=>open(index)}>
     <strong>{name||`Crear un tema · ${index+1}`}</strong>
    </PearlButton>)}
   </div>
  </>:<>
   <PearlButton tone="neutral" compact subtle disabled={busy} onClick={()=>{if(confirmWorkspaceNavigation()){setCurrent(null);setDirty(false);}}}>Mis temas</PearlButton>
   <h1>{step==='name'?'¿Cómo llamarías a este tema?':current.name}</h1>
   {step==='name'?<>
    <Input label="Nombre del tema" maxLength={200} value={current.name} disabled={busy} onChange={e=>edit({name:e.target.value})}/>
    <PearlButton tone="solid" compact disabled={busy||!current.name.trim()} onClick={()=>setStep('notes')}>Continuar</PearlButton>
   </>:<>
    <Textarea label="¿Qué te gustaría compartir sobre este tema?" value={current.notes} maxLength={2000} disabled={busy} onChange={e=>edit({notes:e.target.value})}/>
    <div className="studio-topic-actions">
     <PearlButton tone="solid" compact disabled={busy||!dirty||!current.name.trim()} onClick={()=>void store()}>{busy?'Guardando…':'Guardar este tema'}</PearlButton>
     {!dirty&&previous&&details.some(row=>row.name===previous)&&<PearlButton tone="neutral" compact subtle disabled={busy||!current.notes.trim()} onClick={()=>{
      navigate(`${contentPath}&${new URLSearchParams({pillar:current.name})}`);
     }}>Crear con este tema</PearlButton>}
     <PearlButton tone="neutral" compact subtle disabled={busy} onClick={()=>setStep('name')}>Cambiar el nombre</PearlButton>
    </div>
   </>}
   {error&&<p role="alert">{error}</p>}
   {!dirty&&previous&&details.some(row=>row.name===previous)&&<p role="status">Tema guardado en tu proyecto.</p>}
  </>}
 </section>;
}
