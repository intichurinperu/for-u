import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyRestaurant} from '../src/modules/restaurant/model.ts';
import {emptyProposal,nativeOffers} from '../src/proposal/model.ts';
import {prepareRoutePage} from '../src/experience/routePreparation.ts';
import {studioSources,firstContentSource,compositionOptions} from '../src/studio/model.ts';
import {landingOrigin,landingReturn,validLandingOrigin} from '../src/studio/navigation.ts';
import {saveContentDraft,validateCreativeContext} from '../src/components/shared/contentModel.ts';
import {saveComposition} from '../src/studio/saveComposition.ts';
const project='aa420f8a-2267-4fbf-b1bb-e756278fd352',user='qa-owner';
const menu=emptyRestaurant('QA');menu.dishes=[{id:'coffee',name:'Coffee QA',description:'Confirmed coffee',price:6.5,image:'',category:'Products',available:true},{id:'alfajor',name:'Alfajor QA',description:'Confirmed alfajor',price:3.5,image:'',category:'Products',available:true}];
const page={...prepareRoutePage('QA','restaurant',{},emptyProposal()),offers:nativeOffers('restaurant',menu)};
const section=page.blocks.find(block=>block.kind==='catalog').id;
const origin=landingOrigin(new URLSearchParams({from:'landing',section,offer:'restaurant:alfajor',pageRevision:'page-r1',viewport:'mobile'}),project);
function sources(data=menu){return studioSources({project,type:'restaurant',proposal:emptyProposal(),page,catalog:data,revisions:{catalog:'menu-r1',page:'page-r1',proposal:null}});}
function draft(){const source=firstContentSource(sources(),'offer',section,'restaurant:alfajor');const d=compositionOptions(source,'offer','portrait',project,user,'QA')[0];return {...d,creative:{...d.creative,origin}};}
function storage(pageValue=page){const docs=new Map([['restaurant',{payload:menu,revision:'menu-r1'}],['landing',{payload:pageValue,revision:'page-r1'}]]);const writes=[];return {docs,writes,load:async(u,p,k)=>{assert.equal(u,user);assert.equal(p,project);return docs.get(k)||null;},save:async(u,p,k,payload,revision)=>{assert.equal(u,user);assert.equal(p,project);assert.equal(revision,docs.get(k)?.revision??null);writes.push(k);docs.set(k,{payload,revision:k+'-'+writes.length});}};}
test('an exact selected offer survives every first-content intent and a cached removed offer is never substituted',()=>{
 const rows=sources(),before=JSON.stringify(rows);assert.equal(rows.filter(row=>row.group==='offer').length,2);
 for(const intent of ['awareness','conversation','offer']){const selected=firstContentSource(rows,intent,section,'restaurant:alfajor');assert.equal(selected.title,'Alfajor QA');assert.match(selected.body,/3.50/);}
 const removed=sources({...menu,dishes:[menu.dishes[0]]});assert.equal(firstContentSource(removed,'offer',section,'restaurant:alfajor'),undefined);assert.equal(firstContentSource(removed,'awareness',section,'restaurant:alfajor'),undefined);assert.equal(JSON.stringify(rows),before);
});
test('saved origin preserves section offer page revision and mobile return without cross-project redirection',()=>{
 const d=draft(),saved=JSON.parse(JSON.stringify(saveContentDraft({version:1,drafts:[]},d,project))).drafts[0];
 assert.equal(saved.creative.reference.id,'restaurant:alfajor');assert.equal(saved.creative.origin.pageRevision,'page-r1');const path=new URL(landingReturn(saved.creative.origin,project),'http://localhost');assert.equal(path.searchParams.get('section'),section);assert.equal(path.searchParams.get('offer'),'restaurant:alfajor');assert.equal(path.searchParams.get('viewport'),'mobile');
 assert.equal(landingReturn(origin,'other-project'),undefined);assert.equal(validLandingOrigin({...origin,offerId:'bad\noffer'},project),false);assert.equal(validLandingOrigin({...origin,pageRevision:42},project),false);
 assert.throws(()=>validateCreativeContext({...d,creative:{...d.creative,origin:{...origin,offerId:'restaurant:coffee'}}},project),/oferta/);
});
test('composition persists the same offer in design and piece while page changes stop all writes',async()=>{
 const s=storage(),d=draft();await saveComposition(user,project,d,()=>{},s);assert.deepEqual(s.writes,['content-creator','social-profile']);assert.equal(s.docs.get('content-creator').payload.drafts[0].creative.origin.offerId,'restaurant:alfajor');assert.equal(s.docs.get('social-profile').payload.pieces[0].source.id,'restaurant:alfajor');
 const stale=storage();stale.docs.set('landing',{payload:page,revision:'page-r2'});await assert.rejects(()=>saveComposition(user,project,draft(),()=>{},stale),/página de origen cambió/);assert.deepEqual(stale.writes,[]);
 const missing=storage({...page,blocks:[]});await assert.rejects(()=>saveComposition(user,project,draft(),()=>{},missing),/página de origen cambió/);assert.deepEqual(missing.writes,[]);
 const foreign={...draft(),creative:{...draft().creative,origin:{...origin,projectId:'other-project'}}};await assert.rejects(()=>saveComposition(user,project,foreign,()=>{},storage()),/origen/);
});
test('module binding resolves current catalog without stale price copies; proposal binding must actually include the offer',async()=>{
 const bound=storage({...page,offers:[]});await saveComposition(user,project,draft(),()=>{},bound);assert.equal(bound.writes.length,2);
 const mixed=storage({...page,catalogSource:'proposal',offers:[]});mixed.docs.set('proposal',{payload:{...emptyProposal(),nativeIds:['restaurant:alfajor']},revision:'proposal-r1'});await saveComposition(user,project,draft(),()=>{},mixed);assert.equal(mixed.writes.length,2);
 const unselected=storage({...page,catalogSource:'proposal',offers:[]});unselected.docs.set('proposal',{payload:emptyProposal(),revision:'proposal-r1'});await assert.rejects(()=>saveComposition(user,project,draft(),()=>{},unselected),/oferta ya no aparece/);assert.deepEqual(unselected.writes,[]);
});
