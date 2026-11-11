import test from 'node:test';
import assert from 'node:assert/strict';
import {buildQuestions,selectChoice} from '../src/experience/personalizationModel.ts';
import {routeSuggestions,mergeRouteTasks,prepareRoutePage} from '../src/experience/routePreparation.ts';
import {emptyProposal} from '../src/proposal/model.ts';
import {knownTaskTool,taskDestination,resumePath} from '../src/pages/dashboard/workspaceFocusModel.ts';
import {parseAreaTasks} from '../src/pages/dashboard/areaModel.ts';
import {parseSiteData} from '../src/toolkit/publicData.ts';
const project='135fcc67-e2e5-4d2d-be7e-d290caf98605';
test('questions adapt to team, ads and optional areas without demanding materials',()=>{
 const questions=buildQuestions('restaurant',{team:'Por mi cuenta',marketingStart:'Más adelante'});
 assert(!questions.some(q=>['teamSize','budget','cost','comfort','owner','addressing','route','projectName'].includes(q.key)));
 assert(questions.some(q=>q.key==='sections'));
 const expanded=buildQuestions('restaurant',{team:'Somos un equipo',diffusion:'Explorar anuncios con presupuesto',otherAreas:['Finanzas','Logística']});
 assert(['teamSize','budget','cost','delivery'].every(k=>expanded.some(q=>q.key===k)));
 assert(!expanded.some(q=>q.key==='requests'));
 assert(expanded.find(q=>q.key==='budget').why.includes('No garantiza'));
});
test('comfort changes the next content task; avoiding camera overrides camera preference',()=>{
 const camera=routeSuggestions('services',{comfort:['Hablando a cámara'],resources:['Fotos'],goal:'Crear contenido'});
 const quiet=routeSuggestions('services',{comfort:['Hablando a cámara','Escribiendo'],avoid:['Mostrar mi cara'],resources:['Ninguno todavía'],goal:'Crear contenido'});
 assert.equal(camera[0].title,'Preparar mi primer guion');
 assert.equal(quiet[0].title,'Crear mi primer contenido');
 assert(quiet[0].reason.includes('no mostrar tu cara'));
 assert(quiet[0].reason.includes('sin pedir fotografías'));
 assert(!quiet.some(t=>t.area==='finance'));
});
test('preparing twice preserves edited tasks, historical UUIDs and reward history',()=>{
 const previous={version:2,earnedAreas:['marketing'],tasks:[{id:'existing-uuid',title:'Lo que ya hice',area:'marketing',done:true,createdAt:'2026-01-01',firstCompletedAt:'2026-01-02'}]};
 const suggestions=routeSuggestions('restaurant',{});
 const first=mergeRouteTasks(previous,project,suggestions,['page']);
 assert.equal(first.tasks.tasks.length,2);
 const edited={...first.tasks,tasks:first.tasks.tasks.map(t=>t.id===first.ids[0]?{...t,title:'Mi título editado',status:'doing'}:t)};
 const second=mergeRouteTasks(edited,project,suggestions,['page','content']);
 const again=mergeRouteTasks(second.tasks,project,suggestions,['page','content']);
 assert.equal(again.tasks.tasks.length,3);
 assert.equal(again.tasks.tasks.find(t=>t.id===first.ids[0]).title,'Mi título editado');
 assert.equal(again.tasks.tasks[0].firstCompletedAt,'2026-01-02');
 assert.deepEqual(again.tasks.earnedAreas,['marketing']);
 assert(again.tasks.tasks.slice(1).every(t=>!t.done));
 parseAreaTasks(again.tasks);
 assert.notEqual(mergeRouteTasks({version:2,tasks:[]},'another-project',suggestions,['page']).ids[0],first.ids[0]);
});
test('six route drafts have real structures without fabricated commercial facts',()=>{
 for(const route of ['restaurant','ecommerce','tourism','hospitality','courses','services']){
  const page=prepareRoutePage('Proyecto QA',route,{},emptyProposal());
  assert.equal(page.template,route);assert.equal(page.headline,'Proyecto QA');
  assert.equal(page.description,'');assert.equal(page.bookingEnabled,false);assert.equal(page.presentationVersion,4);
  assert(page.blocks.length>=2);assert(page.blocks.every(b=>b.body===''));
  assert.equal(page.offers,undefined);assert.equal(page.heroImage,undefined);assert.equal(page.published,undefined);
  assert(parseSiteData(page));
 }
 const selected=prepareRoutePage('Mi café','restaurant',{sections:['Nuestra historia','Ubicación y horarios'],origin:'Proyecto familiar'},emptyProposal());
 assert.equal(selected.blocks.length,2);assert.equal(selected.blocks[0].body,'');
 const published={...prepareRoutePage('Anterior','restaurant',{},emptyProposal()),presentationVersion:2};
 const before=JSON.stringify(published);prepareRoutePage('Nuevo','restaurant',{},emptyProposal());assert.equal(JSON.stringify(published),before);
});

test('unknown or no-material choices are exclusive and never contradict selected resources',()=>{
 assert.deepEqual(selectChoice({multi:true},['Fotos'],'Ninguno todavía'),['Ninguno todavía']);
 assert.deepEqual(selectChoice({multi:true},['Ninguno todavía'],'Fotos'),['Fotos']);
 assert.deepEqual(selectChoice({multi:true},['Finanzas'],'Por ahora, seguir con lo elegido'),['Por ahora, seguir con lo elegido']);
 assert.equal(selectChoice({multi:false},['Uno'],'Otro'),'Otro');
 const later=routeSuggestions('restaurant',{marketingStart:'Más adelante',comfort:['Hablando a cámara']});
 assert(later.every(task=>task.key!=='content'));
});

test('every prepared task can open and resume its actual tool in the same project',()=>{
 for(const route of ['restaurant','ecommerce','tourism','hospitality','courses','services']){
  const type=route==='services'?'ecommerce':route;
  const suggestions=routeSuggestions(route,{goal:'Vender una oferta',otherAreas:['Finanzas','Logística','Operaciones']});
  const merged=mergeRouteTasks({version:2,tasks:[]},project,suggestions,suggestions.map(s=>s.key));
  for(const task of merged.tasks.tasks){
   assert(knownTaskTool(task.tool),task.tool+' must be reachable from its task');
   const path=resumePath(taskDestination(project,task),type);
   assert.equal(new URL(path,'http://localhost').searchParams.get('project'),project);
   if(task.tool==='studio')assert.equal(new URL(path,'http://localhost').pathname,'/creator-studio');
  }
 }
});

test('compatible answers allow multiple needs, retain them when changing priority, and restore canonical choices',async()=>{
 const {choiceValues,normalizePriority}=await import('../src/experience/personalizationModel.ts');
 const needs=['Mostrar lo que ofrezco','Preparar contenido para darme a conocer'];
 const a=normalizePriority({needs,goal:needs[1]});
 assert.deepEqual(a.needs,needs);assert.equal(a.goal,needs[1]);
 const qs=buildQuestions('restaurant',a);
 assert.equal(qs.find(q=>q.key==='needs').multi,true);
 assert.deepEqual(qs.find(q=>q.key==='goal').options,needs);
 for(const key of ['offering','audience','need','sections','tools','comfort','intent'])assert.equal(qs.find(q=>q.key===key)?.multi,true,key);
 assert.deepEqual(choiceValues({multi:true},'Café · Pasteles'),['Café','Pasteles']);
 assert.equal(normalizePriority({...a,needs:[needs[0]]}).goal,needs[0]);
 assert.equal(normalizePriority({...a,needs:[]}).goal,'');
 assert.equal(normalizePriority({goal:'Crear contenido'}).goal,'Crear contenido');
});
test('multiple needs produce separate referenced tasks, with only the selected priority sorted first',()=>{
 const needs=['Mostrar lo que ofrezco','Preparar contenido para darme a conocer','Organizar mis pendientes'];
 const suggestions=routeSuggestions('restaurant',{needs,goal:needs[2]});
 assert.equal(suggestions[0].key,'planning');
 assert.ok(suggestions.some(t=>t.key==='page'));
 assert.ok(suggestions.some(t=>t.key==='content'));
 assert.equal(suggestions.find(t=>t.key==='planning').tool,'kanban');
});
