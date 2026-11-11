import InspirationJourney from './InspirationJourney';
import {createPortal} from 'react-dom';
import ProjectStageStep from './ProjectStageStep';
import ProjectAgeStep from './ProjectAgeStep';
import ProjectOriginStep from './ProjectOriginStep';
import ProjectPurposeStep from './ProjectPurposeStep';
import ProjectVisionStep from './ProjectVisionStep';
import ProjectAudienceStep from './ProjectAudienceStep';
import ProjectQuestionStep from './ProjectQuestionStep';
import StandardJourneyQuestion from './StandardJourneyQuestion';
import OfferPhotos from './OfferPhotos';
import PearlButton from '../components/ui/PearlButton';
import {initialQuestions,missingRouteAnswers,personalizedRouteSuggestions,resumeInitialStep} from './initialJourney';
import ProjectTeamStep,{ProjectTeamSizeStep} from './ProjectTeamStep';
import {contentPillars} from './brandProfile';
import {useEffect,useRef,useState} from 'react';
import {useLocation,useNavigate,useSearchParams} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {useActiveProjectsStore} from '../stores/useActiveProjectsStore';
import {projectModuleType} from '../modules/moduleProjects';
import {emptyDiagnostic,parseDiagnostic,emptyProjectRoute,parseProjectRoute,type Diagnostic} from '../workspace/contracts';
import {emptyProposal,parseProposal} from '../proposal/model';
import {readableStudioDraft} from '../pages/dashboard/studioJourney';
import {useAreaDocuments} from '../pages/dashboard/AreaDocuments';
import {usePrivateDocument} from './usePrivateDocument';
import {emptyJourney,parseJourney} from './journeyModel';
import {buildQuestions,groupNames,list,selectChoice,choiceValues,normalizePriority,type Answer} from './personalizationModel';
import {canonicalAnswer,mergeRouteTasks,prepareRoutePage,suggestedStage} from './routePreparation';
import {projectRouteType,routeNames} from './GuidedProject';
import {ButtonPrimary,ButtonSecondary} from '../components/ui/DesignSystem';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import MaterialAttachments from './MaterialAttachments';
import OrganizeMaterial from './OrganizeMaterial';
import {blankOffer} from '../proposal/model';
import './guidedProject.css';
import './initialJourney.css';
const multipleQuestionScreens={origin:ProjectOriginStep,purpose:ProjectPurposeStep,vision:ProjectVisionStep,audience:ProjectAudienceStep};
const projectQuestionScreens={stage:ProjectStageStep,age:ProjectAgeStep,team:ProjectTeamStep,teamSize:ProjectTeamSizeStep};
export default function GuidedJourney({projectId}:{projectId:string}){
 const {user}=useAuth(),store=useActiveProjectsStore();const project=store.getProjectById(projectId)!;
 const businessRoute=projectRouteType(project),type=projectModuleType(project)!;
 const diagnostic=usePrivateDocument(user!.id,projectId,'project-diagnostic',()=>emptyDiagnostic(projectId,businessRoute),v=>{const parsed=parseDiagnostic(v,projectId);if(parsed.version!==2)throw new Error('Conservamos el diagnóstico anterior. Necesita una conversión explícita antes de editarse.');return parsed;});
 const proposal=usePrivateDocument(user!.id,projectId,'proposal',emptyProposal,parseProposal);
 const history=usePrivateDocument(user!.id,projectId,'project-journey',emptyJourney,parseJourney);
 const route=usePrivateDocument(user!.id,projectId,'project-route',()=>emptyProjectRoute(projectId),v=>parseProjectRoute(v,projectId));
 const page=usePrivateDocument(user!.id,projectId,'landing',()=>prepareRoutePage(project.name,businessRoute,{},emptyProposal()),v=>{if(!readableStudioDraft(v))throw new Error('Conservamos tu página anterior; su formato necesita recuperación.');return v;});
 const areas=useAreaDocuments(projectId,type),[params]=useSearchParams(),navigate=useNavigate(),location=useLocation();
 const [error,setError]=useState(''),[operation,setOperation]=useState(''),[recovery,setRecovery]=useState(false);
 const [audioPending,setAudioPending]=useState(false),[materialPending,setMaterialPending]=useState(false);
 const [materialOpen,setMaterialOpen]=useState(false);
 const [transition,setTransition]=useState<{to:string;replace?:boolean;previous?:string;pop?:boolean}|null>(null);
 const attachmentPending=audioPending||materialPending;
 const lock=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const busy=diagnostic.busy||proposal.busy||history.busy||route.busy||page.busy||!!operation;
 const dirty=diagnostic.dirty||proposal.dirty||history.dirty||route.dirty||page.dirty;
 useUnsavedNavigation(dirty||!!operation||attachmentPending);
 const commercial={offering:'offering',audience:'audience',need:'need',difference:'value'} as const;
 const a={...diagnostic.data.answers,difference:proposal.data.value||diagnostic.data.answers.difference||'',offering:proposal.data.offering||diagnostic.data.answers.offering||'',audience:proposal.data.audience||diagnostic.data.answers.audience||'',need:proposal.data.need||diagnostic.data.answers.need||''};
 const allQuestions=buildQuestions(businessRoute,a);
 const questions=initialQuestions(allQuestions,a);
 const requested=params.get('question');
 const singleQuestion=allQuestions.find(question=>question.key===requested);
 const step=params.get('step');
 const cursor=singleQuestion?.key||(step==='answers'?'answers':resumeInitialStep(step||diagnostic.data.cursor,allQuestions,questions));
 const question=singleQuestion||questions.find(question=>question.key===cursor)||questions[0];
 const index=questions.findIndex(item=>item.key===question.key);
 const suggestions=personalizedRouteSuggestions(businessRoute,a);
 const loaded=diagnostic.loaded&&proposal.loaded&&history.loaded&&route.loaded&&page.loaded&&!!areas.entry?.loaded;
 const problem=error||diagnostic.error||proposal.error||history.error||route.error||page.error||areas.entry?.error;
 const projectQuery=new URLSearchParams({project:projectId});
 const startPath=`/dashboard?${projectQuery}&view=start`;
 const studioPath=`/creator-studio?${projectQuery}`;
 const stepPath=(step:string)=>`/dashboard?${projectQuery}&setup=1&step=${encodeURIComponent(step)}`;
 const editPath=(key:string,source='answers')=>`/dashboard?${projectQuery}&setup=1&question=${encodeURIComponent(key)}&return=${source}`;
 const singleReturn=params.get('return')==='studio'?studioPath:params.get('return')==='route'?startPath:stepPath('answers');
 const previousInHistory=(location.state as {previous?:string}|null)?.previous;
 useEffect(()=>{
  if(!loaded||busy||dirty||attachmentPending)return;
  if(transition){
   setTransition(null);
   if(transition.pop)navigate(-1);
   else navigate(transition.to,{replace:transition.replace,state:{previous:transition.previous}});
  }else if(!singleQuestion&&cursor==='prepared'){
   navigate(startPath,{replace:true});
  }else if(!singleQuestion&&cursor&&step!==cursor){
   navigate(stepPath(cursor),{replace:true});
  }
 },[loaded,busy,dirty,attachmentPending,transition,singleQuestion?.key,cursor,step,location.key]);
 useEffect(()=>{setMaterialOpen(false);setRecovery(false);setError('');},[location.key]);
 async function saveInputs(){
  if(proposal.dirty&&!await proposal.save())throw new Error('No se guardó la respuesta. Vuelve a intentarlo.');
  if(history.dirty&&!await history.save())throw new Error('No se guardó el material. Vuelve a intentarlo.');
 }
 async function close(){
  if(lock.current||busy||attachmentPending)return;
  lock.current=true;setError('');setOperation('Guardando…');
  try{
   await saveInputs();
   if(diagnostic.dirty&&!await diagnostic.save())throw new Error('No se guardó este paso. Vuelve a intentarlo.');
   if(alive.current)setTransition({to:singleQuestion?singleReturn:startPath,replace:true});
  }catch(error){if(alive.current)setError((error as Error).message);}
  finally{lock.current=false;if(alive.current)setOperation('');}
 }
 function changeAnswer(key:string,value:Answer){
  setError('');const field=commercial[key as keyof typeof commercial];
  if(field){
   const text=Array.isArray(value)?value.join(' · '):value;
   if(text.length>2000){setError('La respuesta admite hasta 2000 caracteres. Acorta el texto e inténtalo de nuevo.');return;}
   proposal.change({...proposal.data,[field]:text});
  }
  else diagnostic.change({...diagnostic.data,answers:normalizePriority({...diagnostic.data.answers,[key]:value})});
 }
 async function go(next:string,{skip=false,back=false}:{skip?:boolean;back?:boolean}={}){
  if(lock.current||busy||attachmentPending)return;
  lock.current=true;setError('');setOperation('Guardando…');
  const previous=diagnostic.data;
  let moved=false;
  try{
   const answers=normalizePriority({...diagnostic.data.answers});
   if(question.key==='pillars'&&!skip&&!back)contentPillars(answers);
   if(skip&&question.key==='marketingStart')answers.marketingStart='Más adelante';
   if(skip&&question.key==='pillars')answers.pillars=['Lo definiré después'];
   await saveInputs();
   const nextCursor=singleQuestion?previous.cursor:next;
   if(diagnostic.dirty||nextCursor!==previous.cursor||skip){
    diagnostic.change({...previous,answers,cursor:nextCursor});moved=true;
    if(!await diagnostic.save())throw new Error('No se guardó este paso. Vuelve a intentarlo.');
   }
   if(alive.current)setTransition(singleQuestion
    ?{to:singleReturn,replace:true}
    :{to:stepPath(next),replace:back,previous:cursor||undefined,pop:back&&previousInHistory===next});
  }catch(error){
   if(alive.current){if(moved)diagnostic.change(previous);setError((error as Error).message);}
  }finally{lock.current=false;if(alive.current)setOperation('');}
 }
 async function prepare(){
  if(lock.current||busy||attachmentPending||!loaded||!areas.entry)return;lock.current=true;setError('');setOperation('Guardando tus elecciones…');
  try{
   if([diagnostic,proposal,history,route,page].some(d=>d.conflict)||areas.entry.taskStatus==='conflict')throw new Error('Hay una versión guardada en otra ventana. Revisa el conflicto antes de preparar; tus cambios se conservan.');
   if(proposal.dirty&&!await proposal.save())throw new Error('Tu propuesta necesita reintento. No se modificó tu página.');
   if(history.dirty&&!await history.save())throw new Error('Tu material necesita reintento. No se modificó tu página.');
   if(diagnostic.dirty&&!await diagnostic.save())throw new Error('Tus respuestas necesitan reintento.');
   const merged=mergeRouteTasks(areas.entry.tasks,projectId,suggestions,suggestions.map(step=>step.key));
   const tasksChanged=JSON.stringify(merged.tasks)!==JSON.stringify(areas.entry.tasks);
   if(tasksChanged||areas.entry.taskDirty){
    setOperation('Guardando los pasos de tu ruta…');
    if(tasksChanged)areas.change({tasks:merged.tasks});
    if(!await areas.save())throw new Error('No se guardaron tus pasos. Vuelve a intentarlo.');
   }
   if(!page.revision){setOperation('Preparando la estructura de tu página…');page.change(prepareRoutePage(project.name,businessRoute,a,proposal.data));if(!await page.save())throw new Error('Tus pasos están guardados. Falta guardar la página; reintenta para continuar.');}
   setOperation('Conectando tu ruta y tu mapa…');route.change({...route.data,stage:suggestedStage(a),diagnosticRevision:diagnostic.revision,taskIds:merged.ids,reasons:merged.reasons});if(!await route.save())throw new Error('Tu página y tus pasos están guardados. Falta conectar la ruta; el reintento no los duplicará.');
   diagnostic.change({...diagnostic.data,cursor:'prepared'});if(!await diagnostic.save())throw new Error('Tu espacio está preparado. Falta guardar el punto donde retomarás.');
   if(alive.current)setTransition({to:startPath,replace:true});
  }catch(e){if(alive.current)setError((e as Error).message);}finally{lock.current=false;if(alive.current)setOperation('');}
 }
 if(!loaded||(!singleQuestion&&cursor==='prepared')){
  return <section className="journey-loading" aria-busy={!problem}>
   <p role={problem?'alert':'status'}>{problem||'Abriendo tu ruta…'}</p>
   {problem&&<PearlButton compact onClick={()=>{void diagnostic.reload();void proposal.reload();void history.reload();void route.reload();void page.reload();void areas.reload();}}>Reintentar</PearlButton>}
   <PearlButton compact subtle to={startPath}>Volver a mi proyecto</PearlButton>
  </section>;
 }
 const files=history.data.files||[];
 const updateFiles=(files:typeof history.data.files)=>history.change({...history.data,files});
 const generalFiles=files.filter(file=>!file.question&&!file.offerOption);
 const audioQuestions=new Set(files.flatMap(file=>file.question?[file.question]:[]));
 const missing=missingRouteAnswers(a,audioQuestions);
 const audioResponse=<MaterialAttachments key={question.key} user={user!.id} project={projectId} question={question.key}
  files={files} disabled={busy||materialPending} onPendingChange={setAudioPending} onChange={updateFiles}/>;
 const feedback=<>
  {problem&&<p role="alert" className="guide-error">{problem}</p>}
  {problem&&!recovery&&<ButtonSecondary type="button" disabled={busy||attachmentPending} onClick={()=>setRecovery(true)}>Opciones de recuperación</ButtonSecondary>}
  {recovery&&<section className="guide-error">
   <p>¿Recuperar la versión guardada? Se sustituirán los cambios pendientes.</p>
   <ButtonSecondary type="button" onClick={()=>setRecovery(false)}>Conservar mis cambios</ButtonSecondary>
   <ButtonPrimary type="button" disabled={busy||attachmentPending} onClick={()=>void Promise.all([diagnostic.recover(),proposal.recover(),history.recover(),route.recover(),page.recover(),areas.recover()]).then(()=>{setRecovery(false);setError('');})}>Recuperar versión guardada</ButtonPrimary>
  </section>}
 </>;
 const routeLabel=routeNames[businessRoute];
 if(cursor==='answers'||cursor==='review'){
  const isAnswers=cursor==='answers';
  const presentation={
   key:cursor,label:routeLabel,title:isAnswers?'Tus respuestas':'Ya podemos armar tu ruta',
   intro:isAnswers?'Abre la pregunta que quieras completar o cambiar.':'Con tus respuestas elegimos por dónde puedes empezar.',
   fieldLabel:'',placeholder:'',hint:'',choices:[],
  };
  const answerContent=isAnswers?<div className="journey-response-list">
   {allQuestions.map(item=>{
    const hasAnswer=list(a[item.key]).some(Boolean)||list(a[item.customKey||item.key+'Custom']).some(Boolean)||audioQuestions.has(item.key);
    return <PearlButton key={item.key} compact subtle to={editPath(item.key)}>{item.title}<span className="journey-response-status">{hasAnswer?'✓':'Opcional'}</span></PearlButton>;
   })}
   <PearlButton compact subtle aria-expanded={materialOpen} disabled={busy||attachmentPending} onClick={()=>setMaterialOpen(!materialOpen)}>Material del proyecto</PearlButton>
   {materialOpen&&<div>
    <MaterialAttachments user={user!.id} project={projectId} files={files} disabled={busy} onChange={updateFiles} onPendingChange={setMaterialPending}/>
    <OrganizeMaterial project={projectId} files={generalFiles} revision={history.revision} proposalRevision={proposal.revision}
     disabled={busy||attachmentPending||history.dirty||proposal.dirty} onAccept={value=>{
      const names=new Set(proposal.data.offers.map(offer=>offer.name.trim().toLowerCase()));
      const additions=value.offers.filter(offer=>!names.has(offer.name.trim().toLowerCase()));
      if(proposal.data.offers.length+additions.length>30){setError('Puedes conservar hasta 30 ofertas.');return;}
      proposal.change({...proposal.data,...Object.fromEntries((['offering','audience','message','cta'] as const).filter(key=>value[key]).map(key=>[key,value[key]])),offers:[...proposal.data.offers,...additions.map(offer=>({...blankOffer(),name:offer.name,description:offer.description}))]});
      history.change({...history.data,transcript:value.transcript});
     }}/>
   </div>}
  </div>:<div className="journey-review-preview">
   <p className="journey-review-kicker">Primer paso</p>
   <strong>{suggestions[0].title}</strong>
   <p>{suggestions[0].reason}</p>
   {missing.length>0&&<small>Podrás completar tus respuestas desde tu ruta.</small>}
  </div>;
  const reviewBack=previousInHistory==='answers'?'answers':questions.at(-1)?.key;
  return createPortal(<ProjectQuestionStep key={cursor} name={project.name} presentation={presentation} busy={busy} audioPending={attachmentPending}
   value="" onChange={()=>{}} feedback={feedback} answerContent={answerContent} saveHint={null}
   continueLabel={isAnswers?'Revisar mi ruta':'Crear mi ruta digital'}
   onContinue={isAnswers?()=>void go('review'):()=>void prepare()}
   onBack={isAnswers?()=>void close():reviewBack?()=>void go(reviewBack,{back:true}):undefined}
   onClose={()=>void close()}/>,document.body);
 }
 const current=canonicalAnswer(diagnostic.data,proposal.data,question.key);
 const values=choiceValues(question,current);
 const isCommercial=Object.hasOwn(commercial,question.key);
 const nextQuestion=questions[index+1]?.key||'review';
 const previousQuestion=index>0?questions[index-1].key:undefined;
 const commonProps={
  name:project.name,route:businessRoute,busy,feedback,audioResponse,audioPending:attachmentPending,saveHint:null,
  progress:singleQuestion?undefined:{current:index+1,total:questions.length},
  continueLabel:singleQuestion?(params.get('return')==='studio'?'Guardar y volver a Studio':'Guardar respuesta'):(nextQuestion==='review'?'Ver mi ruta':'Continuar'),
  onBack:singleQuestion?()=>void close():previousQuestion?()=>void go(previousQuestion,{back:true}):undefined,
  onContinue:()=>void go(nextQuestion),
  onSkip:singleQuestion?undefined:()=>void go(nextQuestion,{skip:true}),
  onClose:()=>void close(),
 };
 const Screen=projectQuestionScreens[question.key as keyof typeof projectQuestionScreens];
 const MultipleScreen=multipleQuestionScreens[question.key as keyof typeof multipleQuestionScreens];
 const customKey=isCommercial||!question.options?question.key:question.customKey||question.key+'Custom';
 const customAnswer=isCommercial?list(current).join(' · '):diagnostic.data.answers[customKey];
 const selectedOffers=(question.options||[]).filter(option=>values.includes(option));
 const extra=question.key==='offering'?<OfferPhotos user={user!.id} project={projectId} options={selectedOffers} files={files}
  disabled={busy||audioPending} onChange={updateFiles} onPending={setMaterialPending}/>:
  question.key==='inspiration'?<InspirationJourney embedded data={diagnostic.data} user={user!.id} project={projectId}
   busy={busy} audioPending={attachmentPending} change={diagnostic.change} save={diagnostic.save} finish={()=>void go(nextQuestion)}/>:undefined;
 const choiceProps={
  values,customText:typeof customAnswer==='string'?customAnswer:'',
  onSelect:(value:string)=>{if(!materialPending)changeAnswer(question.key,selectChoice(question,values,value));},
  onCustom:(value:string)=>changeAnswer(customKey,value),
 };
 return createPortal(
  MultipleScreen?<MultipleScreen key={question.key} {...commonProps} {...choiceProps} options={question.options??[]}/>:
  Screen?<Screen key={question.key} {...commonProps} value={typeof current==='string'?current:''} onChange={value=>changeAnswer(question.key,value)}/>:
  <StandardJourneyQuestion key={question.key} {...commonProps} {...choiceProps} question={question} group={question.key==='offering'?routeLabel:groupNames[question.group]} commercial={isCommercial} extra={extra}/>,
  document.body,
 );
}
