import test from 'node:test';
import assert from 'node:assert/strict';
import {changedPreparationFields,emptyProposal,prepareLanding,preparationFields} from '../src/proposal/model.ts';
import {insertEditorSection,createEditorSection} from '../src/toolkit/editorSections.ts';
import {parseCtaDesign,parseSiteData} from '../src/toolkit/publicData.ts';
import {authorizedMaterialPaths,parseMaterial} from '../../supabase/functions/toolkit-ai/material.ts';
const page={name:'QA',slug:'qa-editor',template:'services',headline:'',description:'',cta:'',whatsapp:'',calendly:'',color:'#7751B8',blocks:[],fields:[]};
test('preparation proposes real differences and detects a changed catalog price',()=>{
 const p={...emptyProposal(),offering:'Café QA',message:'Mi café',cta:'Consultar'};const offer={id:'qa',name:'Café',description:'QA',image:'',kind:'product',pricing:'fixed',price:6,conditions:''};
 const prepared=prepareLanding(page,p,[offer],{proposalRevision:'1',catalogRevision:null},[...preparationFields]);assert.deepEqual(changedPreparationFields(prepared,p,[offer]),[]);assert.deepEqual(changedPreparationFields(prepared,p,[{...offer,price:7}]),['offers']);assert.deepEqual(changedPreparationFields({...prepared,headline:'Edición manual'},p,[offer]),['headline']);
});
test('insertion validates destination, retains IDs and leaves commercial content blank',()=>{
 const blocks=[{id:'a',title:'A',body:'Manual'},{id:'b',title:'B',body:'Manual B'}];const next=createEditorSection('restaurant','menu');assert.equal(next.body,'');assert.deepEqual(insertEditorSection(blocks,next,'b').map(b=>b.id),['a',next.id,'b']);assert.equal(insertEditorSection(blocks,next,'foreign'),blocks);assert.equal(insertEditorSection(blocks,blocks[0],null),blocks);
});
test('CTA rejects unsafe URLs, unknown enums and unsupported versions; legacy pages read normally',()=>{
 assert.equal(parseCtaDesign({url:'javascript:alert(1)',align:'absolute',tone:'black'}).url,'');assert.equal(parseCtaDesign({version:9}),undefined);assert.equal(parseSiteData(page).ctaDesign,undefined);assert.equal(parseSiteData({...page,ctaDesign:{version:1,url:'https://example.com/contact',tone:'mint',align:'center'}}).ctaDesign.tone,'mint');
});
test('material references reject foreign, unlisted, duplicate and traversing objects',()=>{
 const stored=[{path:'owner/project/voice.m4a'}];assert.deepEqual(authorizedMaterialPaths(['owner/project/voice.m4a'],stored,'owner','project'),['owner/project/voice.m4a']);for(const paths of [['other/project/voice.m4a'],['owner/project/private.m4a'],['owner/project/../voice.m4a'],['owner/project/voice.m4a','owner/project/voice.m4a']])assert.throws(()=>authorizedMaterialPaths(paths,stored,'owner','project'));
});
test('material response excludes prices and actions and rejects oversized text',()=>{
 const value={transcript:'Café QA',offering:'Café',audience:'',message:'',cta:'',offers:[{name:'Café',description:'Propio'}]};assert.deepEqual(parseMaterial(value),value);assert.throws(()=>parseMaterial({...value,publish:true}));assert.throws(()=>parseMaterial({...value,offers:[{...value.offers[0],price:6}]}));assert.throws(()=>parseMaterial({...value,transcript:'x'.repeat(6001)}));
});
import {applyPreviewText} from '../src/toolkit/editorBridge.ts';
test('preview preserves paragraphs and rejects fields/IDs outside its closed operations',()=>{
 const current={...page,blocks:[{id:'local',title:'T',body:'Original'}]};
 assert.equal(applyPreviewText(current,{field:'blocks.0.body',value:'overwrite'}),current);
 assert.equal(applyPreviewText(current,{field:'body',blockId:'foreign',value:'overwrite'}),current);
 assert.equal(applyPreviewText(current,{field:'__proto__',value:'overwrite'}),current);
 assert.equal(applyPreviewText(current,{field:'description',value:'Uno\n\nDos'}).description,'Uno\n\nDos');
 assert.equal(applyPreviewText(current,{field:'body',blockId:'local',value:'Uno\nDos'}).blocks[0].body,'Uno\nDos');
 assert.equal(current.blocks[0].body,'Original');
});
import {readableStudioDraft,validStudioDraft} from '../src/pages/dashboard/studioJourney.ts';
test('an intentionally blank draft stays editable without claiming it is ready to publish',()=>{
 assert.equal(readableStudioDraft(page),true);assert.equal(validStudioDraft(page),false);
 assert.equal(readableStudioDraft({...page,blocks:[{id:'bad'}]}),false);
 assert.equal(readableStudioDraft({...page,presentationVersion:99}),false);
});

import {connectDesignPiece} from '../src/experience/designPiece.ts';
import {blankContent} from '../src/components/shared/contentModel.ts';
test('design links one editorial piece without replacing a script or duplicating on retry',()=>{
 const draft={...blankContent('project'),title:'Café QA',subtitle:'Texto QA'};
 const first=connectDesignPiece(null,'project','owner',draft);assert.equal(first.pieces[0].id,draft.id);
 const edited={...first,pieces:[{...first.pieces[0],script:'Mi guion manual'}]};
 assert.equal(connectDesignPiece(edited,'project','owner',{...draft,title:'Otro título'}),edited);
 assert.equal(edited.pieces.length,1);assert.equal(edited.pieces[0].script,'Mi guion manual');
 assert.throws(()=>connectDesignPiece(null,'foreign','owner',draft));
});


test('module-bound editor previews confirmed catalog without modifying the saved draft or proposal-bound page',async()=>{
 const {editorCatalog}=await import('../src/toolkit/editorCatalog.ts');
 const {prepareRoutePage}=await import('../src/experience/routePreparation.ts');
 const {emptyProposal,blankOffer}=await import('../src/proposal/model.ts');
 const {createNativeProduct}=await import('../src/proposal/catalogEditing.ts');
 const page=prepareRoutePage('QA','restaurant',{},emptyProposal());
 const before=JSON.stringify(page);
 const offer={...blankOffer(),kind:'product',name:'Prueba QA',pricing:'fixed',price:6};
 const catalog=createNativeProduct('restaurant',undefined,offer,'QA');
 const result=editorCatalog(page,'restaurant',catalog);
 assert.equal(result.offers[0].price,6);assert.equal(result.offers[0].name,'Prueba QA');
 assert.equal(JSON.stringify(page),before);assert.equal(result.headline,page.headline);
 const independent={...page,catalogSource:'proposal',offers:[]};
 assert.equal(editorCatalog(independent,'restaurant',catalog),independent);
 assert.equal(editorCatalog(page,'restaurant',undefined),page);
});
