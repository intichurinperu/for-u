import test from 'node:test';import assert from 'node:assert/strict';
import {emptySocial,parseSocial} from '../src/social/model.ts';
import {addGridIdea,setMainSlot} from '../src/social/organization.ts';
import {blankContent,contentSizes} from '../src/components/shared/contentModel.ts';
import {prepareGridDesign} from '../src/social/gridDesign.ts';
const project='c902defd-93f6-4542-bd79-24545e231315',user='11111111-1111-4111-8111-111111111111',id='510b157f-22ee-4fd7-b51c-ce07ee2ff529';
function fixture(){const doc=setMainSlot(addGridIdea(emptySocial(project),'Mi idea',id,user),2,id,user);doc.pieces[0]={...doc.pieces[0],script:'Mi guion previo',shots:'Mi lista de tomas',date:'2026-10-27',text:'Mi explicación'};return doc;}
test('developing a grid idea reuses its UUID and preserves the grid, pin, script, date and other pieces',()=>{
 const profile=fixture(),before=JSON.stringify(profile),draft={...blankContent(project),title:'Mi idea',subtitle:'Mi explicación',usage:'reel-cover',format:'story',creative:{intent:'conversation',sourceKey:'piece:'+id}};
 const next=prepareGridDesign(profile,{version:1,drafts:[]},id,draft,project,user);
 assert.equal(next.design.id,id);assert.equal(next.designs.drafts.length,1);assert.equal(next.profile.pieces.length,1);assert.deepEqual(next.profile.gridOrder,profile.gridOrder);assert.deepEqual(next.profile.mainSlots,profile.mainSlots);
 const piece=next.profile.pieces[0];assert.equal(piece.status,'draft');assert.equal(piece.objective,'conversation');assert.equal(piece.script,'Mi guion previo');assert.equal(piece.shots,'Mi lista de tomas');assert.equal(piece.text,'Mi explicación');assert.equal(piece.date,'2026-10-27');assert.equal(JSON.stringify(profile),before);
 assert.equal(next.design.usage,'reel-cover');assert.deepEqual(contentSizes[next.design.format],{width:1080,height:1920});assert.equal(parseSocial(JSON.parse(JSON.stringify(next.profile)),project,user).pieces[0].id,id);
});
test('an existing design or foreign project cannot be overwritten by developing an idea',()=>{
 const profile=fixture(),draft={...blankContent(project),title:'Mi idea'};
 assert.throws(()=>prepareGridDesign(profile,{version:1,drafts:[{...draft,id}]},id,draft,project,user),/ya tiene un diseño/);
 assert.throws(()=>prepareGridDesign(profile,{version:1,drafts:[]},id,{...draft,projectId:'otro'},project,user),/otro proyecto/);
 assert.throws(()=>prepareGridDesign({...profile,projectId:'otro'},{version:1,drafts:[]},id,draft,project,user));
});
test('campaign and source references remain attached without requiring property-order equality',()=>{
 const profile=fixture(),campaign='22222222-2222-4222-8222-222222222222';profile.pieces[0].campaignId=campaign;profile.pieces[0].source={kind:'page',id:'hero',revision:'saved-revision',projectId:project};
 const draft={...blankContent(project),title:'Mi idea',creative:{intent:'awareness',sourceKey:'piece:'+id,campaignId:campaign,reference:{projectId:project,id:'hero',kind:'page',revision:'saved-revision'}}};
 const next=prepareGridDesign(profile,{version:1,drafts:[]},id,draft,project,user);assert.equal(next.profile.pieces[0].campaignId,campaign);assert.deepEqual(next.profile.pieces[0].source,profile.pieces[0].source);
 assert.throws(()=>prepareGridDesign(profile,{version:1,drafts:[]},id,{...draft,creative:{...draft.creative,campaignId:undefined}},project,user),/campaña/);
 assert.throws(()=>prepareGridDesign(profile,{version:1,drafts:[]},id,{...draft,creative:{...draft.creative,reference:{...draft.creative.reference,id:'other'}}},project,user),/fuente original/);
});
