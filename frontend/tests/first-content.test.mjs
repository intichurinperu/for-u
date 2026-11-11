import test from 'node:test';
import assert from 'node:assert/strict';
import {taskWorkPath,taskDestination,resumePath} from '../src/pages/dashboard/workspaceFocusModel.ts';
import {firstContentReturn} from '../src/studio/navigation.ts';
import {locationDestination,destinationPath} from '../src/workspace/navigation.ts';
import {firstContentSource,compositionOptions} from '../src/studio/model.ts';
const project='aa420f8a-2267-4fbf-b1bb-e756278fd352';
test('task launches work directly and resume keeps the first-content entry without completing the task',()=>{
 const task={id:'route:'+project+':content',area:'marketing',tool:'studio',done:false};
 const before=JSON.stringify(task);const path=taskWorkPath(project,task,'restaurant');const url=new URL(path,'http://localhost');
 assert.equal(url.pathname,'/creator-studio');assert.equal(url.searchParams.get('start'),'first-content');assert.equal(url.searchParams.get('task'),task.id);
 assert.equal(resumePath(taskDestination(project,task),'restaurant'),path);
 const destination=locationDestination(url.pathname,url.search,project);assert.equal(destination.params.start,'first-content');assert.equal(destinationPath(project,destination),path);
 assert.equal(taskWorkPath(project,{id:'manual'},'restaurant'),null);
 assert.equal(JSON.stringify(task),before);
});
test('first content uses confirmed sources and preserves their revision without inventing an offer or requiring a photo',()=>{
 const ref=id=>({kind:'page',projectId:project,id,revision:'page-r1'});
 const hero={key:'page:hero',title:'Nuestro espacio',body:'Cafe y conversaciones',image:'',cta:'Conocenos',reference:ref('hero'),group:'page'};
 const story={...hero,key:'page:story',title:'Como empezamos',body:'Una idea familiar.',reference:ref('story')};
 const offer={...hero,key:'proposal:offer-1',title:'Cafe confirmado',body:'S/ 6.00',reference:{kind:'proposal',projectId:project,id:'offer-1',revision:'proposal-r2'},group:'offer'};
 const sources=[offer,hero,story];const before=JSON.stringify(sources);
 assert.equal(firstContentSource(sources,'awareness'),hero);assert.equal(firstContentSource(sources,'conversation'),story);assert.equal(firstContentSource(sources,'offer'),offer);assert.equal(firstContentSource(sources,'awareness','story'),story);assert.equal(firstContentSource(sources,'awareness','removed-section'),undefined);
 assert.equal(firstContentSource([hero,story],'offer'),undefined);assert.equal(firstContentSource([],'awareness'),undefined);
 const drafts=compositionOptions(firstContentSource(sources,'awareness'),'awareness','portrait',project,'user-qa','QA');
 assert.equal(drafts.length,3);assert(drafts.every(d=>d.title===hero.title&&d.subtitle===hero.body&&d.source.revision==='page-r1'&&d.imagePath===''));
 assert.equal(JSON.stringify(sources),before);
});

test('first-content editor return is a same-project route and never an arbitrary URL',()=>{
 const params=new URLSearchParams({return:'first-content',task:'route:content'});
 const url=new URL(firstContentReturn(params,project),'http://localhost');
 assert.equal(url.pathname,'/creator-studio');assert.equal(url.searchParams.get('project'),project);assert.equal(url.searchParams.get('task'),'route:content');assert.equal(url.searchParams.get('start'),'first-content');
 assert.equal(firstContentReturn(new URLSearchParams({return:'https://example.com'}),project),undefined);
});

test('several confirmed offers require a choice and an explicit missing offer never falls back to another',()=>{
 const offer=id=>({key:'catalog:'+id,title:id,body:'Oferta confirmada',image:'',cta:'Consultar',reference:{kind:'catalog',projectId:project,id,revision:'catalog-r1'},group:'offer'});
 const one=offer('one'),two=offer('two');const sources=[one,two];
 assert.equal(firstContentSource(sources,'offer'),undefined);
 assert.equal(firstContentSource(sources,'offer',undefined,'two'),two);
 assert.equal(firstContentSource(sources,'awareness',undefined,'missing'),undefined);
 assert.equal(firstContentSource([two],'offer'),two);
 assert.deepEqual(sources,[one,two]);
});
