import test from 'node:test';
import assert from 'node:assert/strict';
import {sectionKind,sectionConfigured,faqRows} from '../src/toolkit/sectionComposition.ts';
import {createEditorSection} from '../src/toolkit/editorSections.ts';
import {prepareRoutePage} from '../src/experience/routePreparation.ts';
import {emptyProposal} from '../src/proposal/model.ts';
import {parseSiteData} from '../src/toolkit/publicData.ts';
import {editorCatalog} from '../src/toolkit/editorCatalog.ts';
import {emptyRestaurant} from '../src/modules/restaurant/model.ts';
test('six routes prepare a typed catalog section without inventing products',()=>{
 for(const route of ['restaurant','ecommerce','tourism','hospitality','courses','services']){
  const d=prepareRoutePage('Proyecto',route,{},emptyProposal());
  assert.equal(sectionKind(d.blocks[0]),'catalog',route);
  assert.equal(sectionConfigured(d.blocks[0],d),false);
  assert.ok(d.blocks.every(b=>!b.body));
  const parsed=parseSiteData(d);assert.ok(parsed);assert.equal(parsed.blocks[0].kind,'catalog');
 }
});
test('section configuration is retained through public parsing and unknown kinds are rejected',()=>{
 const d=prepareRoutePage('QA','restaurant',{},emptyProposal());
 const b=createEditorSection('restaurant','faq');assert.equal(b.kind,'faq');
 assert.equal(parseSiteData({...d,blocks:[{...b,kind:'arbitrary-script'}]}),null);
 assert.equal(parseSiteData({...d,blocks:[b]}).blocks[0].kind,'faq');
});
test('FAQ accordion only uses question and answer pairs explicitly supplied',()=>{
 assert.deepEqual(faqRows('¿Abren hoy?\nConsultar horario.\n\n¿Es real?\nDatos QA.'),[{question:'¿Abren hoy?',answer:'Consultar horario.'},{question:'¿Es real?',answer:'Datos QA.'}]);
 assert.deepEqual(faqRows('Todavía sin respuesta'),[]);
});
test('catalog projection reuses confirmed public details without replacing manual edits or leaking costs',()=>{
 const data=emptyRestaurant('QA');data.settings.about='Historia confirmada';data.settings.address='Dirección confirmada';data.settings.hours='Horario confirmado';
 const d=prepareRoutePage('QA','restaurant',{},emptyProposal());d.blocks.push({id:'location',kind:'location',useModuleDetails:true,title:'Ubicación',body:''});
 const rendered=editorCatalog(d,'restaurant',data);
 assert.equal(rendered.blocks.find(b=>b.kind==='story').body,'Historia confirmada');
 assert.equal(rendered.blocks.find(b=>b.id==='location').body,'Dirección confirmada\nHorario confirmado');
 d.blocks.find(b=>b.kind==='story').body='Mi edición manual';
 assert.equal(editorCatalog(d,'restaurant',data).blocks.find(b=>b.kind==='story').body,'Mi edición manual');
 assert.equal(d.blocks.find(b=>b.id==='location').body,'');
 assert.equal('inventory' in rendered,false);
});

test('clearing an auto-sourced section explicitly keeps it empty after reload',async()=>{const {applyPreviewText}=await import('../src/toolkit/editorBridge.ts');const data=emptyRestaurant('QA');data.settings.about='Historia';const page=editorCatalog(prepareRoutePage('QA','restaurant',{},emptyProposal()),'restaurant',data);const block=page.blocks.find(b=>b.kind==='story');const cleared=applyPreviewText(page,{field:'body',blockId:block.id,value:''});assert.equal(editorCatalog(cleared,'restaurant',data).blocks.find(b=>b.id===block.id).body,'');});
test('service pages resolve their own proposal offers without a fabricated module catalog',async()=>{
 const {proposalOffers}=await import('../src/proposal/model.ts');
 const proposal=emptyProposal();proposal.offers=[{id:'service-qa',name:'Asesoría QA',kind:'service',description:'Servicio confirmado',conditions:'Coordinación previa',pricing:'quote',price:null,image:''}];
 const page=prepareRoutePage('QA Servicios','services',{},proposal);
 assert.equal(page.catalogSource,'proposal');
 const projected=editorCatalog(page,undefined,undefined,proposal);
 assert.equal(projected.offers[0].id,'service-qa');
 assert.equal(projected.offers[0].price,null);
 assert.equal(proposalOffers(proposal,undefined,undefined).length,1);
 assert.throws(()=>proposalOffers({...proposal,nativeIds:['restaurant:foreign']},undefined,undefined),/catálogo/);
});

test('guided FAQ editing preserves unfinished questions and only publishes complete pairs',async()=>{
 const {draftFaqRows,serializeFaqRows}=await import('../src/toolkit/sectionComposition.ts');
 const rows=[{question:'¿Cómo coordino?',answer:'Escribe al contacto confirmado.\nCoordinamos antes de atender.'},{question:'¿Cuándo?',answer:''}];
 const body=serializeFaqRows(rows);assert.deepEqual(draftFaqRows(body),rows);assert.deepEqual(faqRows(body),[rows[0]]);
 const page=prepareRoutePage('QA','services',{},emptyProposal());
 const incomplete={id:'faq',kind:'faq',title:'Preguntas frecuentes',body:serializeFaqRows([rows[1]])};
 assert.equal(sectionConfigured(incomplete,page),false);
 // Clearing a question must not reinterpret its answer as a new public question.
 const cleared=serializeFaqRows([{question:'',answer:'Primera línea\nSegunda línea'}]);
 assert.deepEqual(draftFaqRows(cleared),[{question:'',answer:'Primera línea\nSegunda línea'}]);assert.deepEqual(faqRows(cleared),[]);
 assert.equal(sectionConfigured({...incomplete,body},page),true);
});

test('FAQ typing keeps trailing spaces between keystrokes until public rendering',async()=>{const {draftFaqRows,serializeFaqRows}=await import('../src/toolkit/sectionComposition.ts');let rows=[{question:'Cómo ',answer:''}];rows=draftFaqRows(serializeFaqRows(rows));assert.equal(rows[0].question,'Cómo ');rows[0].question+='pedir';rows[0].answer='Con ';rows=draftFaqRows(serializeFaqRows(rows));assert.equal(rows[0].answer,'Con ');rows[0].answer+='calma';assert.deepEqual(faqRows(serializeFaqRows(rows)),[{question:'Cómo pedir',answer:'Con calma'}]);});

test('route-specific structured sections keep confirmed text and distinguish amenities from room catalogs',async()=>{
 const {sectionLayout,compositionRows,routeSectionKind}=await import('../src/toolkit/sectionComposition.ts');
 const page=prepareRoutePage('QA','hospitality',{sections:['Habitaciones','Servicios']},emptyProposal());
 assert.equal(page.blocks[0].kind,'catalog');assert.equal(page.blocks[1].kind,'details');assert.equal(sectionLayout(page.blocks[1]),'features');
 assert.equal(sectionLayout(createEditorSection('courses','syllabus')),'steps');
 assert.equal(sectionLayout(createEditorSection('tourism','included')),'features');
 assert.equal(sectionLayout(createEditorSection('restaurant','delivery')),'steps');
 assert.equal(sectionLayout(createEditorSection('services','testimonials')),'quotes');
 assert.equal(routeSectionKind({id:'legacy',title:'Servicios',body:'',kind:'catalog'},'hospitality'),'catalog');
 const body=' Primera indicacion confirmada.\n\nSegunda indicacion. ';
 assert.deepEqual(compositionRows(body),['Primera indicacion confirmada.','Segunda indicacion.']);
 assert.deepEqual(compositionRows('   '),[]);
 assert.equal(body,' Primera indicacion confirmada.\n\nSegunda indicacion. ');
 const parsed=parseSiteData({...page,blocks:[{...page.blocks[1],body}]});assert.equal(parsed.blocks[0].body,body);
});


test('arrival and teacher sections get the right widgets without borrowing a business history as a teacher biography',()=>{
 const hotel=prepareRoutePage('QA Hospedaje','hospitality',{sections:['Habitaciones','Cómo llegar']},emptyProposal());
 assert.equal(hotel.blocks[1].kind,'location');
 const course=prepareRoutePage('QA Cursos','courses',{sections:['Cursos','Quién enseña','Materiales']},emptyProposal());
 assert.equal(course.blocks[1].kind,'story');assert.equal(course.blocks[1].useModuleDetails,false);assert.equal(course.blocks[1].body,'');
 assert.equal(course.color,'#6B6B6B');assert.equal(parseSiteData(course).blocks[1].body,'');
});
