import test from 'node:test';
import assert from 'node:assert/strict';
import {brandProfile,contentPillars,pillarSuggestions} from '../src/experience/brandProfile.ts';
import {buildQuestions,selectChoice} from '../src/experience/personalizationModel.ts';
import {emptyDiagnostic,parseDiagnostic} from '../src/workspace/contracts.ts';
import {emptyProposal} from '../src/proposal/model.ts';
import {canonicalAnswer} from '../src/experience/routePreparation.ts';
import {compositionOptions} from '../src/studio/model.ts';
import {validateCreativeContext} from '../src/components/shared/contentModel.ts';
const project='c902defd-93f6-4542-bd79-24545e231315';
function identity(voice=['Cálida','Educativa']){const proposal={...emptyProposal(),value:'Atención personal'};const doc={...emptyDiagnostic(project,'services'),answers:{brandFeeling:['Cercanía'],voice,brandAvoid:['Exagerar promesas'],pillars:['Proceso y método'],pillarsCustom:'Consejos prácticos'}};return brandProfile(doc,proposal,project,'diagnostic-r1');}
test('six routes offer editable pillars, separate from commercial intentions, one question per topic',()=>{
 for(const route of Object.keys(pillarSuggestions)){
  const qs=buildQuestions(route,{});for(const key of ['brandFeeling','difference','voice','brandAvoid','pillars'])assert.equal(qs.filter(q=>q.key===key).length,1);
  const pillars=qs.find(q=>q.key==='pillars');assert.equal(pillars.multi,true);assert.equal(pillars.maxSelections,5);
  assert.ok(pillarSuggestions[route].every(p=>pillars.options.includes(p)));
  assert.ok(!pillars.options.includes('Presentar una oferta'));
 }
});
test('custom pillars remain explicit and a sixth cannot be silently dropped',()=>{
 const q=buildQuestions('services',{}).find(q=>q.key==='pillars');
 assert.deepEqual(selectChoice(q,['a','b','c','d','e'],'f'),['a','b','c','d','e']);
 assert.throws(()=>contentPillars({pillars:['a','b','c','d','e'],pillarsCustom:'f'}),/cinco pilares/);
 assert.deepEqual(contentPillars({pillars:['a'],pillarsCustom:'a\nb'}),['a','b']);
 const postponed={pillars:['Lo definiré después'],pillarsCustom:'a\nb\nc\nd\ne\nf'};assert.deepEqual(contentPillars(postponed),[]);assert.ok(postponed.pillarsCustom.endsWith('f'));
});
test('brand answers survive contract parsing, while difference uses the canonical proposal',()=>{
 const d={...emptyDiagnostic(project,'services'),answers:{voice:['Cálida'],pillars:['Consejos prácticos'],pillarsCustom:'Mi tema',difference:['Antigua']}};
 assert.equal(parseDiagnostic(d,project),d);
 const proposal={...emptyProposal(),value:'Mi diferencia confirmada'};
 assert.equal(canonicalAnswer(d,proposal,'difference'),proposal.value);
 const brand=brandProfile(d,proposal,project,'r1');assert.equal(brand.difference,proposal.value);assert.deepEqual(brand.pillars,['Consejos prácticos','Mi tema']);
 assert.throws(()=>brandProfile(d,proposal,'aa420f8a-2267-4fbf-b1bb-e756278fd352','r1'),/otro proyecto/);
});
test('composition retains an isolated, versioned brand snapshot without inventing public copy',()=>{
 const source={key:'idea',title:'Mensaje del propietario',body:'Texto confirmado',image:'',cta:'Consultar',reference:null,group:'idea'};
 const brand=identity();const drafts=compositionOptions(source,'trust','post',project,'qa','Mi negocio',undefined,brand,'Proceso y método');
 assert.equal(drafts[0].layout,'split');assert.equal(drafts[0].subtitle,source.body);assert.equal(drafts[0].creative.pillar,'Proceso y método');assert.equal(drafts[0].creative.brand.revision,'diagnostic-r1');
 assert.ok(!drafts[0].caption.includes('Cercanía'));
 brand.voice.push('Divertida');assert.deepEqual(drafts[0].creative.brand.voice,['Cálida','Educativa']);
 assert.throws(()=>compositionOptions(source,'trust','post',project,'qa','Mi negocio',undefined,brand,'Pilar inventado'),/pilar/);
 assert.throws(()=>validateCreativeContext({...drafts[0],creative:{...drafts[0].creative,brand:{...brand,projectId:'foreign'}}},project),/identidad/);
});
test('content can be organized by pillar without changing campaign, date, order or piece identity',async()=>{
 const {emptySocial}=await import('../src/social/model.ts');const {filteredPieces}=await import('../src/social/organization.ts');
 const id='510b157f-22ee-4fd7-b51c-ce07ee2ff529';const piece={id,title:'Idea',objective:'trust',text:'Texto',script:'Guion',shots:'',date:'2026-10-22',status:'draft',files:[]};const doc={...emptySocial(project),pieces:[piece]};
 const design={id,creative:{pillar:'Proceso y método',intent:'trust'}};
 assert.equal(filteredPieces(doc,[design],{query:'',intent:'trust',campaign:'',status:'',pillar:'Proceso y método'})[0],piece);
 assert.equal(filteredPieces(doc,[design],{query:'',intent:'',campaign:'',status:'',pillar:'Consejos prácticos'}).length,0);
 assert.equal(doc.pieces[0].date,'2026-10-22');assert.equal(doc.pieces[0].script,'Guion');
});
test('inspiration references retain owner intent privately, scoped and without copying public copy',()=>{
 const reference={id:'510b157f-22ee-4fd7-b51c-ce07ee2ff529',label:'@referencia-qa',likes:['Fotografías','Forma de escribir'],notes:'La luz natural',different:'Una voz propia',files:[{path:`qa/${project}/capture.png`,name:'Referencia QA'}]};
 const doc={...emptyDiagnostic(project,'services'),inspiration:[reference]};
 assert.equal(parseDiagnostic(doc,project),doc);
 assert.throws(()=>parseDiagnostic({...doc,inspiration:[{...reference,files:[{path:'qa/foreign/capture.png',name:'Otra'}]}]},project));
 assert.throws(()=>parseDiagnostic({...doc,inspiration:[reference,reference]},project));
 const brand=brandProfile(doc,emptyProposal(),project,'r2');assert.equal(brand.inspiration[0].label,reference.label);assert.equal('files' in brand.inspiration[0],false);
 const source={key:'idea',title:'Mi mensaje',body:'Mi texto',image:'',cta:'Consultar',reference:null,group:'idea'};
 const draft=compositionOptions(source,'trust','post',project,'qa','Mi negocio',undefined,brand)[0];
 brand.inspiration[0].likes.push('Videos');assert.equal(draft.creative.brand.inspiration[0].likes.length,2);
 assert.equal(draft.caption.includes('@referencia-qa'),false);assert.equal(draft.caption.includes('La luz natural'),false);
 assert.ok(buildQuestions('restaurant',{}).some(q=>q.key==='inspiration'));
});
