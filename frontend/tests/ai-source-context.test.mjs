import test from 'node:test';import assert from 'node:assert/strict';
import {responseProvenance,validProvenance} from '../src/ai/sourceContext.ts';
import {parseSocial,emptySocial,newPiece} from '../src/social/model.ts';
import {parseSiteData} from '../src/toolkit/publicData.ts';
import {prepareRoutePage} from '../src/experience/routePreparation.ts';
import {emptyProposal} from '../src/proposal/model.ts';
const project='c902defd-93f6-4542-bd79-24545e231315',id='510b157f-22ee-4fd7-b51c-ce07ee2ff529';
const context={diagnosticRevision:'d1',proposalRevision:'p1',identity:true,pillars:['Proceso'],references:[id]};
const body={action:'studio',creativeKind:'script',sourceKind:'piece',sourceId:id,sourceRevision:'r1',sourceContext:context};
const sources=[{projectId:project,kind:'module-social-profile',id,revision:'r1'},{projectId:project,kind:'module-project-diagnostic',id:null,revision:'d1'},{projectId:project,kind:'module-proposal',id:null,revision:'p1'}];
test('client refuses silently ignored additional sources and mismatched server provenance',()=>{
 assert.throws(()=>responseProvenance({},project,body),/no confirmó/);
 const result=responseProvenance({sources,sourceContext:context},project,body);assert.equal(result.action,'script');
 for(const patch of [{sourceContext:null},{sources:sources.map(s=>({...s,projectId:'foreign'}))},{sources:sources.filter(s=>s.kind!=='module-project-diagnostic')}])assert.throws(()=>responseProvenance({sources,sourceContext:context,...patch},project,body));
 assert.equal(responseProvenance({},project,{...body,sourceContext:undefined}),undefined);
});
test('accepted provenance survives private piece reload and is excluded from public page parsing',()=>{
 const provenance={version:1,action:'script',sources,context};assert.equal(validProvenance(provenance,project),true);
 const doc={...emptySocial(project),pieces:[{...newPiece(),id,aiProvenance:provenance}]};assert.deepEqual(parseSocial(JSON.parse(JSON.stringify(doc)),project).pieces[0].aiProvenance,provenance);
 assert.throws(()=>parseSocial({...doc,pieces:[{...doc.pieces[0],aiProvenance:{...provenance,sources:sources.map(s=>({...s,projectId:'foreign'}))}}]},project));
 const page={...prepareRoutePage('QA','services',{},emptyProposal()),aiProvenance:provenance};assert.equal('aiProvenance' in parseSiteData(page),false);
});
