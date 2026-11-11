import test from 'node:test';
import assert from 'node:assert/strict';
import { readProposalSource } from '../src/proposal/sourceRepository.ts';
import { readLandingPublication, writeLandingPublication } from '../src/services/landingPublicationRepository.ts';
import { emptyProposal, blankOffer } from '../src/proposal/model.ts';

function database(rows) {
  let failure=null;
  return {rows, fail(error) {failure=error;}, from(table) {
    let operation='read', values, filters={}, lists={};
    const query={select(){return query;},eq(k,v){filters[k]=v;return query;},in(k,v){lists[k]=v;return query;},
      insert(v){operation='insert';values=v;return query;},update(v){operation='update';values=v;return query;},
      maybeSingle(){return execute(true);},single(){return execute(true);},then(resolve,reject){return execute(false).then(resolve,reject);} };
    async function execute(single) {
      if(failure) return {data:null,error:failure};
      const matches=rows.filter(row=>row.table===table && Object.entries(filters).every(([k,v])=>k==='content' ? JSON.stringify(row[k])===v : row[k]===v) && Object.entries(lists).every(([k,v])=>v.includes(row[k])));
      if(operation==='insert') {
        if(rows.some(row=>row.table===table && ((row.user_id===values.user_id && row.project_id===values.project_id) || row.slug===values.slug))) return {data:null,error:{code:'23505'}};
        rows.push({...structuredClone(values),table});return {data:structuredClone(rows.at(-1)),error:null};
      }
      if(operation==='update' && matches[0]) Object.assign(matches[0],structuredClone(values));
      return {data:single ? structuredClone(matches[0] ?? null) : structuredClone(matches),error:null};
    }
    return query;
  }};
}
const landing=()=>({name:'QA',slug:'qa-proposal-cas',headline:'Mensaje QA',description:'',cta:'Consultar',whatsapp:'',calendly:'',template:'services',color:'#123456',fields:[],blocks:[]});
test('source reads use account and project boundaries, fail closed, and retain references on retry',async()=>{
  const proposal={...emptyProposal(),offers:[{...blankOffer(),name:'Servicio QA'}]};
  const db=database([{table:'toolkit_documents',user_id:'a',project_id:'p1',kind:'module-proposal',payload:proposal,updated_at:'r1'}, {table:'toolkit_documents',user_id:'b',project_id:'p2',kind:'module-proposal',payload:{...proposal,offers:[{...proposal.offers[0],name:'Other account'}]},updated_at:'r2'}]);
  assert.equal((await readProposalSource(db,'a','p1','restaurant')).offers[0].name,'Servicio QA');
  await assert.rejects(readProposalSource(db,'a','p2','restaurant'),/Guarda tu propuesta/);
  db.fail({message:'offline'});
  await assert.rejects(readProposalSource(db,'a','p1','restaurant'),/comprobar/);
  db.fail(null);
  assert.equal((await readProposalSource(db,'a','p1','restaurant')).source.proposalRevision,'r1');
});
test('publication conflicts and stale retries cannot replace the previous public version',async()=>{
  const db=database([]), page=landing();
  const first=await writeLandingPublication(db,'a','p1',page,null);
  const other={...page,headline:'Other tab'};
  await writeLandingPublication(db,'a','p1',other,first);
  const local={...page,headline:'My unsaved edit'};
  for(let i=0;i<2;i++) await assert.rejects(writeLandingPublication(db,'a','p1',local,first),/otra pestaña/);
  assert.equal((await readLandingPublication(db,'a','p1')).content.headline,'Other tab');
  assert.equal(local.headline,'My unsaved edit');
  assert.equal(await readLandingPublication(db,'b','p1'),null);
  await assert.rejects(writeLandingPublication(db,'a','p1',page,null),/otra pestaña/);
});
test('editing a proposal does not write a public site; failed publication can be inspected before retry',async()=>{
  const db=database([]), page=landing();
  const first=await writeLandingPublication(db,'a','p1',page,null);
  const proposal={...emptyProposal(),message:'Edited private message'};
  assert.equal((await readLandingPublication(db,'a','p1')).content.headline,'Mensaje QA');
  db.fail({message:'network failure'});
  await assert.rejects(writeLandingPublication(db,'a','p1',{...page,headline:proposal.message},first),/confirmar/);
  db.fail(null);
  const verified=await readLandingPublication(db,'a','p1');
  assert.equal(verified.content.headline,page.headline);
  await writeLandingPublication(db,'a','p1',{...page,headline:proposal.message},verified);
  assert.equal((await readLandingPublication(db,'a','p1')).content.headline,proposal.message);
});
