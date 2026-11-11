import test from 'node:test';import assert from 'node:assert/strict';
import {emptySocial,changePiece,parseSocial} from '../src/social/model.ts';
import {addGridIdea,moveGridPiece} from '../src/social/organization.ts';
import {blankContent,saveContentDraft} from '../src/components/shared/contentModel.ts';
const project='c902defd-93f6-4542-bd79-24545e231315',id='510b157f-22ee-4fd7-b51c-ce07ee2ff529';
test('title becomes one recoverable piece and the same design can be a reel cover',()=>{const doc=addGridIdea(emptySocial(project),' Mi primera idea ',id);assert.equal(doc.pieces[0].title,'Mi primera idea');assert.equal(doc.pieces[0].date,'');assert.equal(doc.pieces[0].status,'idea');assert.deepEqual(doc.gridOrder,[id]);const design={...blankContent(project),id,title:doc.pieces[0].title,usage:'reel-cover',format:'story'};const saved=saveContentDraft({version:1,drafts:[]},design,project);assert.equal(saved.drafts[0].id,doc.pieces[0].id);const scripted=changePiece(doc,id,{script:'Mi guion',date:'2026-10-23'});const restored=parseSocial(JSON.parse(JSON.stringify(scripted)),project);assert.equal(restored.pieces.length,1);assert.equal(restored.pieces[0].script,'Mi guion');assert.equal(restored.gridOrder[0],saved.drafts[0].id);});
test('adding ideas preserves existing pins, dates and identity and rejects duplicates',()=>{const a=addGridIdea(emptySocial(project),'Primera',id),other='57aefb2a-dd04-40bb-8c78-a82c98a90547';a.pieces[0].date='2026-10-23';const b=addGridIdea(a,'Segunda',other);const moved=moveGridPiece(b,other,id);assert.deepEqual(moved.gridOrder,[other,id]);assert.equal(moved.pieces.find(p=>p.id===id).date,'2026-10-23');assert.equal(a.pieces.length,1);assert.throws(()=>addGridIdea(b,'Duplicada',id));assert.throws(()=>addGridIdea(b,'',other));assert.throws(()=>saveContentDraft({version:1,drafts:[]},{...blankContent(project),title:'QA',usage:'unsupported'},project));});


test('new ideas append after all visible pieces even when an older grid order omitted newer designs',()=>{
 const a=addGridIdea(emptySocial(project),'Primera',id),second='57aefb2a-dd04-40bb-8c78-a82c98a90547',third='33333333-3333-4333-8333-333333333333';
 const legacy={...a,pieces:[...a.pieces,{...a.pieces[0],id:second,title:'Diseño añadido fuera del perfil'}]};
 assert.deepEqual(legacy.gridOrder,[id]);const next=addGridIdea(legacy,'Nueva idea',third);
 assert.deepEqual(next.gridOrder,[id,second,third]);assert.deepEqual(legacy.gridOrder,[id]);assert.equal(next.pieces.length,3);
});
