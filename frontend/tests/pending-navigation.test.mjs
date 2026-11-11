import test from 'node:test';
import assert from 'node:assert/strict';
import {pendingNavigation} from '../src/lib/pendingNavigation.ts';
const a={pathname:'/content-creator',search:'?project=a&design=1'},b={pathname:'/creator-studio',search:'?project=a'},other={pathname:'/content-creator',search:'?project=b&design=2'};
test('pending work blocks browser and router transitions, including project changes, until all owners are clean',()=>{
 const state=pendingNavigation(),endDesign=state.register(Symbol()),endScript=state.register(Symbol());
 assert.equal(state.blocks(a,b),true);assert.equal(state.blocks(a,other),true);
 assert.equal(state.blocks(a,{...a}),false);
 endDesign();assert.equal(state.blocks(a,b),true);endScript();assert.equal(state.blocks(a,b),false);
});
test('a cancelled manual transition keeps protection; one approved navigation avoids a second prompt',()=>{
 const state=pendingNavigation();state.register(Symbol());let clear;
 assert.equal(state.confirm(()=>false,fn=>{clear=fn}),false);assert.equal(state.blocks(a,b),true);
 assert.equal(state.confirm(()=>true,fn=>{clear=fn}),true);assert.equal(state.blocks(a,b),false);assert.equal(state.blocks(a,b),true);
 state.confirm(()=>true,fn=>{clear=fn});clear();assert.equal(state.blocks(a,b),true);
});

const profile=(search='')=>({pathname:'/creator-studio',search:'?project=qa&tab=profile'+search});
test('internal profile views retain pending owners and still protect leaving the profile',()=>{
 const state=pendingNavigation(),end=state.register(Symbol());
 for(const view of ['profile','grid','list','calendar']){
  assert.equal(state.blocks(profile(),profile('&view='+view)),false);
  assert.equal(state.blocks(profile('&view=grid'),profile('&view='+view)),false);
  assert.equal(state.pending(),true);
 }
 assert.equal(state.blocks(profile('&view=grid'),{pathname:'/dashboard',search:'?project=qa&view=map'}),true);
 end();assert.equal(state.pending(),false);
});
test('only the view may change; project, piece, tab and other query transitions remain protected',()=>{
 const state=pendingNavigation();state.register(Symbol());
 const start=profile('&view=grid&library=designs');
 for(const search of [
  '?project=other&tab=profile&view=list&library=designs',
  '?project=qa&tab=library&view=list&library=designs',
  '?project=qa&tab=profile&piece=one&view=list&library=designs',
  '?project=qa&tab=profile&view=list&library=materials',
  '?project=qa&tab=profile&view=unknown&library=designs',
  '?project=qa&tab=profile&view=list&view=grid&library=designs',
  '?project=qa&tab=profile&view=list&library=designs&campaign=new',
 ])assert.equal(state.blocks(start,{pathname:start.pathname,search}),true,search);
 assert.equal(state.blocks(profile('&piece=one&view=grid'),profile('&piece=one&view=list')),true);
 assert.equal(state.blocks(start,{pathname:start.pathname,search:'?library=designs&view=list&tab=profile&project=qa'}),false);
 assert.equal(state.blocks(profile('&library=designs&library=materials'),profile('&view=list&library=designs')),true);
});
