import test from 'node:test';
import assert from 'node:assert/strict';
import {compositionOptions,campaignWithPiece,studioSources} from '../src/studio/model.ts';
import {artworkLayout} from '../src/studio/artworkLayout.ts';
import {saveComposition} from '../src/studio/saveComposition.ts';
import {validateCreativeContext} from '../src/components/shared/contentModel.ts';
import {emptyProposal} from '../src/proposal/model.ts';
const project='aa420f8a-2267-4fbf-b1bb-e756278fd352',user='qa-owner';
const source={key:'idea',title:'Un café para encontrarnos',body:'Una pausa para conversar.',image:'',cta:'Conversemos',reference:null,group:'idea'};
const campaign={id:'e307ce43-029a-4379-8a47-556b53953edf',title:'Mi campaña QA',intent:'conversation',offer:null,start:null,end:null,pieceIds:[]};
function draft(){return compositionOptions(source,'conversation','portrait',project,user,'Café QA',campaign)[0];}
function store(failAt){const docs=new Map([['campaigns',{payload:{version:1,projectId:project,campaigns:[campaign]},revision:'r1'}]]);let n=1,failed=false;return {docs,load:async(u,p,k)=>docs.get(k)||null,save:async(u,p,k,payload,revision)=>{if(k===failAt&&!failed){failed=true;throw new Error('Red interrumpida');}assert.equal(revision,docs.get(k)?.revision||null);const rev='r'+(++n);docs.set(k,{payload,revision:rev});return rev;}};}
test('three compositions preserve confirmed content and expose genuinely different geometry',()=>{const variants=compositionOptions(source,'conversation','portrait',project,user,'Café QA');assert.equal(new Set(variants.map(v=>v.id)).size,3);assert.deepEqual(variants.map(v=>v.layout),['editorial','poster','split']);for(const d of variants){assert.equal(d.subtitle,source.body);assert.equal(d.imagePath,'');assert.ok(!d.caption.includes('S/'));}const geo=variants.map(v=>artworkLayout(v,true,(t,s)=>t.length*s*.5));assert.equal(new Set(geo.map(g=>JSON.stringify(g.image))).size,3);});
test('context rejects foreign sources, temporary images and malformed reference fields',()=>{assert.throws(()=>compositionOptions({...source,reference:{projectId:'other'}},'offer','post',project,user,''),/otro proyecto/);assert.throws(()=>compositionOptions({...source,image:'https://example.com/object/sign/a?token=secret'},'offer','post',project,user,''),/temporales/);assert.throws(()=>validateCreativeContext({...draft(),creative:{...draft().creative,reference:{projectId:project,kind:'page',id:42,revision:'r'}}},project),/fuente/);});
test('campaign link is idempotent and does not invent a missing campaign',()=>{assert.deepEqual(campaignWithPiece({campaigns:[campaign]},campaign.id,'piece')[0].pieceIds,['piece']);assert.deepEqual(campaignWithPiece({campaigns:[{...campaign,pieceIds:['piece']}]},campaign.id,'piece')[0].pieceIds,['piece']);assert.throws(()=>campaignWithPiece({campaigns:[]},campaign.id,'piece'),/campaña/);});
test('partial save can retry the same design without duplicating piece or campaign references',async()=>{const storage=store('campaigns'),d=draft();await assert.rejects(()=>saveComposition(user,project,d,()=>{},storage),/pieza ya están guardados/);assert.equal(storage.docs.get('content-creator').payload.drafts.length,1);await saveComposition(user,project,d,()=>{},storage);assert.equal(storage.docs.get('content-creator').payload.drafts.length,1);assert.equal(storage.docs.get('social-profile').payload.pieces.length,1);assert.deepEqual(storage.docs.get('campaigns').payload.campaigns[0].pieceIds,[d.id]);});
test('stale source or unavailable campaign does not write a design',async()=>{const storage=store(),d=draft();d.creative.reference={kind:'proposal',projectId:project,id:'proposal',revision:'old'};await assert.rejects(()=>saveComposition(user,project,d,()=>{},storage),/cambió/);assert.equal(storage.docs.has('content-creator'),false);const missing=store();missing.docs.clear();await assert.rejects(()=>saveComposition(user,project,draft(),()=>{},missing),/campaña/);assert.equal(missing.docs.size,0);});
test('saved source ID must exist even when its revision matches',async()=>{const storage=store(),d=draft();storage.docs.set('proposal',{payload:emptyProposal(),revision:'r1'});d.creative.reference={kind:'proposal',projectId:project,id:'removed-offer',revision:'r1'};await assert.rejects(()=>saveComposition(user,project,d,()=>{},storage),/fuente ya no/);assert.equal(storage.docs.has('content-creator'),false);});
test('traversal in private asset path is rejected before any storage write',async()=>{const storage=store(),d={...draft(),imagePath:`${user}/${project}/../secret`};await assert.rejects(()=>saveComposition(user,project,d,()=>{},storage),/ruta/);assert.equal(storage.docs.has('content-creator'),false);});
test('a design saves its photo and voice together and rejects a voice from another account',async()=>{
 const storage=store();
 const voice={path:`${user}/${project}/idea.wav`,name:'Mi idea'};
 const photo=`${user}/${project}/brownie.jpg`;
 const design={...draft(),imagePath:photo,voice};
 await saveComposition(user,project,design,()=>{},storage);
 await assert.rejects(()=>saveComposition(user,project,{...design,voice:{...voice,path:`otro/${project}/idea.wav`}},()=>{},storage),/otro proyecto/);
 const [saved]=storage.docs.get('content-creator').payload.drafts;
 assert.equal(saved.imagePath,photo);
 assert.deepEqual(saved.voice,voice);
});
test('layout exposes overflow instead of silently dropping long text',()=>{const d={...draft(),subtitle:'Mucho contenido '.repeat(2000)};assert.equal(artworkLayout(d,false,(t,s)=>t.length*s*.5).overflow,true);});
test('creating for a main profile space preserves its exact position and retries without duplicates',async()=>{const storage=store(),d=draft();await saveComposition(user,project,d,()=>{},storage,2);let p=storage.docs.get('social-profile').payload;assert.deepEqual(p.mainSlots,[null,null,d.id]);assert.deepEqual(p.main,[d.id]);await saveComposition(user,project,d,()=>{},storage,2);p=storage.docs.get('social-profile').payload;assert.equal(p.pieces.length,1);assert.deepEqual(p.mainSlots,[null,null,d.id]);});
test('a concurrently occupied profile space is not replaced by a newly created design',async()=>{const storage=store(),a=draft();await saveComposition(user,project,a,()=>{},storage,0);const b=draft();await assert.rejects(()=>saveComposition(user,project,b,()=>{},storage,0),/ya tiene una pieza/);assert.equal(storage.docs.get('content-creator').payload.drafts.length,1);assert.deepEqual(storage.docs.get('social-profile').payload.mainSlots,[a.id,null,null]);});

test('sales moments adapt the invitation without inventing business facts or changing the source',()=>{const before=JSON.stringify(source);const posts=['awareness','conversation','offer'].map(intent=>compositionOptions(source,intent,'portrait',project,user,'QA')[0]);assert.equal(new Set(posts.map(post=>post.cta)).size,3);assert.ok(posts[1].caption.startsWith('¿Qué te gustaría saber'));for(const post of posts){assert.equal(post.subtitle,source.body);assert.equal(post.title,source.title);assert.deepEqual(post.creative.reference??null,source.reference);}assert.equal(posts[2].cta,source.cta);assert.equal(JSON.stringify(source),before);});

test('photo-free compositions keep readable copy together and leave space for the invitation in every export ratio',()=>{
 const measure=(text,size)=>text.length*size*.5;
 for(const format of ['post','portrait','story'])for(const layout of ['editorial','poster','split']){
  const input={...draft(),format,layout,title:'Tu idea merece encontrar su lugar',subtitle:'Cuenta lo que haces, con tus propias palabras. No necesitas una foto para empezar.',cta:'Conversemos'};
  const before=JSON.stringify(input),g=artworkLayout(input,false,measure);
  assert.equal(g.overflow,false,format+' '+layout);assert.equal(g.image,null);
  assert.ok(g.title.y+g.title.h+40<=g.body.y);assert.ok(g.body.y+g.body.lines.length*g.body.size*1.2<g.cta.y);
  assert.ok(g.title.size>=100);assert.ok(g.body.size>=40);
  for(const box of [g.brand,g.title,g.body,g.cta]){assert.ok(box.x>=0&&box.y>=0);assert.ok(box.x+box.w<=g.width);assert.ok(box.y+box.h<=g.height);}
  assert.ok(g.decorations.length>0);assert.equal(JSON.stringify(input),before);
 }
});

test('canvas saves update the same piece text while retaining its script, order and prior files',async()=>{
 const storage=store(),d=draft();await saveComposition(user,project,d,()=>{},storage);
 const old=storage.docs.get('social-profile');old.payload.pieces[0].script='Guion que debe conservarse';old.payload.gridOrder=[d.id];
 const edited={...d,title:'Título editado',subtitle:'Texto editado',caption:'Título editado\n\nTexto editado'};
 const file={path:`${user}/${project}/nota.webm`,name:'Mi nota de voz'};
 await saveComposition(user,project,edited,()=>{},storage,undefined,[file]);
 await saveComposition(user,project,edited,()=>{},storage,undefined,[file]);
 const profile=storage.docs.get('social-profile').payload;
 assert.equal(profile.pieces.length,1);assert.equal(profile.pieces[0].id,d.id);assert.equal(profile.pieces[0].title,'Título editado');assert.equal(profile.pieces[0].text,edited.caption);assert.equal(profile.pieces[0].script,'Guion que debe conservarse');assert.equal(profile.pieces[0].files.filter(row=>row.path===file.path).length,1);assert.deepEqual(profile.gridOrder,[d.id]);
});

test('creating video seeds an empty script from the saved post but never replaces a written script',async()=>{
 const storage=store(),d=draft();await saveComposition(user,project,d,()=>{},storage,undefined,[],true);
 const profile=storage.docs.get('social-profile').payload;assert.equal(profile.pieces[0].script,d.caption);profile.pieces[0].script='Mi guion personal';
 await saveComposition(user,project,{...d,caption:'Una versión nueva del post'},()=>{},storage,undefined,[],true);
 assert.equal(storage.docs.get('social-profile').payload.pieces[0].script,'Mi guion personal');
});
