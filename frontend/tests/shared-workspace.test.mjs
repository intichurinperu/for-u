import test from 'node:test';
import assert from 'node:assert/strict';
import {PrivateDocumentController,saveDocumentGroup} from '../src/services/privateDocumentController.ts';
import {locationDestination,projectViewPath,workspaceSpaces} from '../src/workspace/navigation.ts';
import {emptyFocus,rememberDestination,projectDestination,resumePath,changeAccountPreferences,accountPreferences} from '../src/pages/dashboard/workspaceFocusModel.ts';
import {emptyDiagnostic,parseDiagnostic,parseProjectRoute,parseCampaigns,parseSpecificOffers,parseMaterials,emptyMaterials,emptyProjectRoute} from '../src/workspace/contracts.ts';
import {emptyJourney} from '../src/experience/journeyModel.ts';
import {emptySocial,newPiece,parseSocial,changeSocialStructure} from '../src/social/model.ts';
import {nextDocumentRevision} from '../src/services/revisionDocuments.ts';
const a=crypto.randomUUID(),b=crypto.randomUUID(),u=crypto.randomUUID();
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const parse=x=>{if(!x||x.version!==1||typeof x.title!=='string')throw Error('Formato desconocido');return x;};
const initial=()=>({version:1,title:''});
function memoryTransport(){let doc=null,writes=0,fail=false;return {get doc(){return structuredClone(doc);},get writes(){return writes;},set fail(v){fail=v;},async load(){if(fail)throw Error('offline');return structuredClone(doc);},async save(payload,revision){writes++;if(fail)throw Error('offline');if(revision!==(doc?.revision??null))throw Error('Cambió en otra ventana');doc={payload:structuredClone(payload),revision:String(writes)};return doc.revision;}};}
test('each project resumes its own exact piece or view; no source project in destination params',()=>{
 const piece=crypto.randomUUID();let focus=emptyFocus();const destination=locationDestination('/dashboard/tools/profile',`?project=${a}&piece=${piece}&foreign=drop`,a);
 focus=rememberDestination(focus,{projectId:a,destination});focus=rememberDestination(focus,{projectId:b,destination:locationDestination('/dashboard',`?project=${b}&view=kanban`,b)});
 assert.equal(resumePath(projectDestination(focus,a),'restaurant'),`/dashboard/tools/profile?project=${a}&piece=${piece}`);
 assert.equal(resumePath(projectDestination(focus,b),'courses'),`/dashboard?project=${b}&view=kanban`);
 assert.equal(locationDestination('/dashboard',`?project=${a}`,b),null);
 assert.equal(locationDestination('https://evil.example',`?project=${a}`,a),null);
 assert.equal(locationDestination('/dashboard',`?project=${a}&setup=1`,a),null);
 for(const view of ['map','kanban','calendar','world'])assert.match(projectViewPath(b,view),new RegExp(b));
 for(const type of ['restaurant','ecommerce','tourism','hospitality','courses'])assert.equal(workspaceSpaces(b,type).length,5);
});
test('personal preferences belong to account focus, never diagnostic; reading legacy is unchanged',()=>{
 const legacy={version:2,today:[],destinations:{[a]:{projectId:a,tool:'studio'}}},before=structuredClone(legacy);
 const focus=changeAccountPreferences(legacy,{version:1,preferredName:'Alex',addressing:'neutral',reducedMotion:true});
 assert.deepEqual(legacy,before);assert.equal(focus.version,3);assert.equal(accountPreferences(focus).preferredName,'Alex');assert.equal(projectDestination(focus,a).tool,'studio');
 const old=emptyJourney();assert.equal(parseDiagnostic(old,a),old);assert.equal(old.version,1);
 assert.throws(()=>parseDiagnostic({...emptyDiagnostic(a,'restaurant'),answers:{owner:'Private name'}},a));
 assert.throws(()=>parseDiagnostic(emptyDiagnostic(a,'restaurant'),b));
});
test('new contracts reject unknown formats and foreign references without mutating historical documents',()=>{
 assert.throws(()=>parseProjectRoute({...emptyProjectRoute(a),version:99},a));
 const ref={projectId:b,id:'restaurant:legacy-id',kind:'catalog',revision:'source-revision'};
 assert.throws(()=>parseCampaigns({version:1,projectId:a,campaigns:[{id:crypto.randomUUID(),title:'Campaign',intent:'offer',offer:ref,start:null,end:null,pieceIds:[]}]},a));
 assert.throws(()=>parseSpecificOffers({version:1,projectId:a,offers:[{id:crypto.randomUUID(),title:'Offer',source:null,benefit:'2x1',conditions:'confirmed',pageId:null,price:10}]},a));
 const material={id:crypto.randomUUID(),path:`${u}/${a}/photo.jpg`,name:'Photo',mime:'image/jpeg',kind:'image'};
 assert.equal(parseMaterials({...emptyMaterials(a),materials:[material]},a,u).materials[0].path,material.path);
 assert.throws(()=>parseMaterials({...emptyMaterials(a),materials:[{...material,path:`${u}/${b}/photo.jpg`}]},a,u));
});
test('profile structural edit retains UUIDs, legacy text and files; foreign piece source rejected',()=>{
 const doc=emptySocial(a),piece=newPiece();piece.script='Existing script';doc.pieces=[piece];doc.main=[piece.id];const before=structuredClone(doc);
 assert.equal(parseSocial(doc,a),doc);const next=changeSocialStructure(doc,{gridOrder:[piece.id]});assert.equal(next.version,2);assert.deepEqual(doc,before);assert.equal(next.pieces[0].script,piece.script);assert.equal(next.pieces[0].id,piece.id);
 assert.throws(()=>parseSocial({...next,gridOrder:[crypto.randomUUID()]},a));
 assert.throws(()=>parseSocial({...next,pieces:[{...piece,source:{projectId:b,id:'offer',kind:'offer',revision:'v'}}]},a));
});
test('two project controllers keep late saves scoped and edits made during saving remain dirty',async()=>{
 const pending=deferred(),ta=memoryTransport(),tb=memoryTransport();let calls=0;
 const ca=new PrivateDocumentController({load:ta.load,save:async()=>{calls++;return pending.promise;}},initial,parse),cb=new PrivateDocumentController(tb,initial,parse);
 await Promise.all([ca.load(),cb.load()]);ca.change({version:1,title:'Project A'});cb.change({version:1,title:'Project B'});
 const saving=ca.save();assert.equal(await ca.save(),false);assert.equal(calls,1);ca.change({version:1,title:'New A edit'});assert.equal(await cb.save(),true);
 pending.resolve('revision-a');assert.equal(await saving,false);assert.equal(ca.snapshot().dirty,true);assert.equal(ca.snapshot().data.title,'New A edit');assert.equal(cb.snapshot().data.title,'Project B');assert.equal(cb.snapshot().revision,'1');
});
test('late refresh and recovery never overwrite newer edits; unknown formats stay recoverable',async()=>{
 const t=memoryTransport(),c=new PrivateDocumentController(t,initial,parse);await c.load();c.change({version:1,title:'saved'});await c.save();
 const pending=deferred();let load=()=>pending.promise;const d=new PrivateDocumentController({load:()=>load(),save:t.save},initial,parse);
 pending.resolve(t.doc);await d.load();const delayed=deferred();load=()=>delayed.promise;
 const loading=d.load(true);d.change({version:1,title:'Edit during recovery'});delayed.resolve(t.doc);assert.equal(await loading,false);assert.equal(d.snapshot().data.title,'Edit during recovery');assert.equal(d.snapshot().conflict,true);
 const bad=new PrivateDocumentController({load:async()=>({revision:'x',payload:{version:99}}),save:t.save},initial,parse);assert.equal(await bad.load(),false);assert.equal(bad.snapshot().loaded,false);assert.equal(await bad.save(),false);
});
test('network failure retains draft, retry/reload preserves work, stale CAS requires explicit recovery',async()=>{
 const t=memoryTransport(),c=new PrivateDocumentController(t,initial,parse);await c.load();c.change({version:1,title:'Keep me'});t.fail=true;assert.equal(await c.save(),false);assert.equal(c.snapshot().dirty,true);assert.equal(c.snapshot().data.title,'Keep me');
 t.fail=false;assert.equal(await c.save(),true);const tab=new PrivateDocumentController(t,initial,parse);await tab.load();tab.change({version:1,title:'Other tab'});await tab.save();c.change({version:1,title:'Unsaved'});assert.equal(await c.save(),false);assert.equal(c.snapshot().conflict,true);assert.equal(await c.save(),false);assert.equal(await c.load(true),true);assert.equal(c.snapshot().data.title,'Other tab');
});
test('partial saves report per-document success; retry does not repeat successful document',async()=>{
 const a=memoryTransport(),b=memoryTransport(),ca=new PrivateDocumentController(a,initial,parse),cb=new PrivateDocumentController(b,initial,parse);await Promise.all([ca.load(),cb.load()]);ca.change({version:1,title:'Design'});cb.change({version:1,title:'Script'});b.fail=true;
 const operations=[{kind:'design',save:()=>ca.save()},{kind:'script',save:()=>cb.save()}];const result=await saveDocumentGroup(operations);assert.deepEqual(result.map(r=>r.status),['saved','failed']);assert.equal(ca.snapshot().dirty,false);assert.equal(cb.snapshot().dirty,true);
 b.fail=false;await saveDocumentGroup(operations.filter(op=>op.kind==='script'));assert.equal(a.writes,1);assert.equal(cb.snapshot().dirty,false);
});
test('CAS revision advances under same-millisecond writes and a clock behind server',()=>{const before='2026-10-21T20:00:00.000Z';assert.equal(nextDocumentRevision(before,Date.parse(before)), '2026-10-21T20:00:00.001Z');assert.equal(nextDocumentRevision(before,0),'2026-10-21T20:00:00.001Z');});
