import test from 'node:test';
import assert from 'node:assert/strict';
import {landingOrigin,landingReturn} from '../src/studio/navigation.ts';
import {blankContent,saveContentDraft,validateCreativeContext} from '../src/components/shared/contentModel.ts';
const project='aa420f8a-2267-4fbf-b1bb-e756278fd352';
test('entry origin is explicit, survives save and reload, and cannot redirect to another site',()=>{
 assert.equal(landingOrigin(new URLSearchParams('section=history'),project),undefined);
 const origin=landingOrigin(new URLSearchParams('from=landing&section=history'),project);
 const draft={...blankContent(project),title:'Historia confirmada',creative:{intent:'awareness',sourceKey:'page:history',origin}};
 const saved=JSON.parse(JSON.stringify(saveContentDraft({version:1,drafts:[]},draft,project)));
 assert.equal(landingReturn(saved.drafts[0].creative.origin,project),`/dashboard/tools/landing?project=${project}&section=history&resume=1`);
 assert.equal(landingReturn(origin,'foreign-project'),undefined);
 assert.throws(()=>validateCreativeContext({...draft,creative:{...draft.creative,origin:{...origin,projectId:'foreign-project'}}},project),/origen/);
 assert.equal(landingReturn({...origin,sectionId:'bad\nsection'},project),undefined);
 const closed=landingReturn({...origin,sectionId:'https://evil.example/path?x=1'},project);
 assert.ok(closed.startsWith('/dashboard/tools/landing?'));
 assert.ok(closed.includes('section=https%3A%2F%2Fevil.example'));
});
test('landing return retains mobile preview and rejects invalid presentation modes',()=>{
 const origin=landingOrigin(new URLSearchParams('from=landing&section=faq&viewport=mobile'),project);
 assert.ok(landingReturn(origin,project).endsWith('&resume=1&viewport=mobile'));
 assert.equal(landingReturn({...origin,viewport:'external'},project),undefined);
});
test('workspace restoration is scoped and ignores removed sections and malformed cache',async()=>{
 const {parseLandingWorkspace,workspaceKey}=await import('../src/toolkit/landingWorkspace.ts');
 const blocks=[{id:'faq',title:'FAQ',body:''}];
 assert.deepEqual(parseLandingWorkspace(JSON.stringify({sectionId:'faq',viewport:'mobile'}),blocks),{sectionId:'faq',viewport:'mobile'});
 assert.deepEqual(parseLandingWorkspace(JSON.stringify({sectionId:'removed',viewport:'javascript:bad'}),blocks),{sectionId:'hero',viewport:'desktop'});
 assert.deepEqual(parseLandingWorkspace('{broken',blocks),{sectionId:'hero',viewport:'desktop'});
 assert.notEqual(workspaceKey('user',project),workspaceKey('user','other'));
 assert.notEqual(workspaceKey('user',project),workspaceKey('other',project));
});

test('changing the content source cannot change the original landing return target',()=>{
 const entry=new URLSearchParams('from=landing&section=story&viewport=mobile&pageRevision=old');
 assert.deepEqual(landingOrigin(entry,project,'new'),{kind:'landing',projectId:project,sectionId:'story',viewport:'mobile',pageRevision:'new'});
 entry.set('offer','original-offer');const origin=landingOrigin(entry,project,'new');
 assert.equal(origin.offerId,'original-offer');assert.match(landingReturn(origin,project),/section=story&resume=1&viewport=mobile&offer=original-offer$/);
 assert.equal(landingOrigin(entry,project,'bad\nrevision'),undefined);
});


test('opening historical page content from the grid or library returns to the current entry without changing lineage',async()=>{
 const {studioReturn}=await import('../src/studio/navigation.ts');
 const origin=landingOrigin(new URLSearchParams('from=landing&section=story&viewport=mobile'),project),before=JSON.stringify(origin);
 assert.deepEqual(studioReturn(new URLSearchParams('return=grid'),origin,project),{path:`/creator-studio?project=${project}&tab=profile&view=grid`,label:'← Mi cuadrícula'});
 assert.deepEqual(studioReturn(new URLSearchParams('return=library'),origin,project),{path:`/creator-studio?project=${project}&tab=library`,label:'← Mi biblioteca'});
 assert.equal(studioReturn(new URLSearchParams('return=first-content'),origin,project).path,landingReturn(origin,project));assert.equal(JSON.stringify(origin),before);
 assert.equal(studioReturn(new URLSearchParams('return=https://evil.example&project=other'),origin,project).path,landingReturn(origin,project));
 assert.equal(studioReturn(new URLSearchParams(),undefined,project,'profile').label,'← Mi perfil');
});
test('script and video handoffs forward only internal return contexts and keep the same project and piece',async()=>{
 const {linkedPieceQuery,studioReturn}=await import('../src/studio/navigation.ts');
 const campaign='22222222-2222-4222-8222-222222222222',piece='33333333-3333-4333-8333-333333333333';
 const params=new URLSearchParams({return:'library',campaign,project:'foreign',piece:'foreign',redirect:'https://evil.example'});
 const query=new URLSearchParams(linkedPieceQuery(project,piece,params));assert.equal(query.get('project'),project);assert.equal(query.get('piece'),piece);assert.equal(query.get('return'),'library');assert.equal(query.has('redirect'),false);
 assert.equal(studioReturn(query,undefined,project).path,`/creator-studio?project=${project}&tab=library&campaign=${campaign}`);
 assert.equal(new URLSearchParams(linkedPieceQuery(project,piece,new URLSearchParams('return=https://evil.example'))).has('return'),false);
});


test('a material opened from the library returns to the same file view through a piece handoff',async()=>{
 const {linkedPieceQuery,studioReturn}=await import('../src/studio/navigation.ts');
 const query=new URLSearchParams(linkedPieceQuery(project,'33333333-3333-4333-8333-333333333333',new URLSearchParams('return=library&library=materials')));
 assert.equal(query.get('library'),'materials');assert.equal(studioReturn(query,undefined,project).path,`/creator-studio?project=${project}&tab=library&library=materials`);
 const grid=new URLSearchParams(linkedPieceQuery(project,'33333333-3333-4333-8333-333333333333',new URLSearchParams('return=grid&library=materials')));assert.equal(grid.has('library'),false);
});
test('workspace continuation retains the current editor context without accepting a different project',async()=>{
 const {locationDestination,destinationPath}=await import('../src/workspace/navigation.ts');
 const current=locationDestination('/creator-studio',`?project=${project}&from=landing&section=story&viewport=mobile&compose=idea&panel=script&return=grid&library=materials`,project);
 assert.equal(current.params.from,'landing');assert.equal(current.params.viewport,'mobile');assert.equal(current.params.compose,'idea');
 const resumed=new URL(destinationPath(project,current),'http://localhost');assert.equal(resumed.searchParams.get('project'),project);assert.equal(resumed.searchParams.get('panel'),'script');
 assert.equal(locationDestination('/creator-studio','?project=foreign&return=grid',project),null);
});

test('a video started from a design returns to that topic and design step',async()=>{
 const {linkedPieceQuery,studioDesignReturn}=await import('../src/studio/navigation.ts');
 const params=new URLSearchParams({return:'studio-design',start:'first-content',topic:'Café y productos',task:'route:content',project:'other',redirect:'https://evil.example'});
 const design='32b8d089-1910-4b81-8881-c9955651c3ad';
 const handoff=new URLSearchParams(linkedPieceQuery(project,design,params));
 const back=new URL(studioDesignReturn(handoff,project),'http://localhost');
 assert.equal(back.pathname,'/creator-studio');
 assert.deepEqual(Object.fromEntries(back.searchParams),{project,tab:'create',compose:'idea',creation:'design',start:'first-content',task:'route:content',topic:'Café y productos',design});
 const {pendingNavigation}=await import('../src/lib/pendingNavigation.ts');
 const guard=pendingNavigation();
 guard.register(Symbol('draft'));
 const idea=new URL(back);
 idea.searchParams.delete('creation');
 idea.searchParams.delete('design');
 assert.equal(guard.blocks(back,idea),false);
 const topics=new URL(idea);
 topics.searchParams.delete('compose');
 topics.searchParams.delete('topic');
 assert.equal(guard.blocks(idea,topics),false);
 idea.searchParams.set('topic','Otro tema');
 assert.equal(guard.blocks(back,idea),true);
});
