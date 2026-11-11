import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clearPrivateStorage,clearSignedOutStorage} from '../src/lib/sessionPrivacy.ts';
test('logout removes private projects, drafts and legacy backups without touching other apps',()=>{
 const entries=new Map([['foru-active-projects','private'],['foru-workspace-backup:alice','private'],['foru:studio-content-assets','private'],['foru:draft','private'],['another-app','kept']]);
 const storage={get length(){return entries.size},key(index){return [...entries.keys()][index]??null},removeItem(key){entries.delete(key)}};
 clearPrivateStorage(storage);assert.deepEqual([...entries],[['another-app','kept']]);
});

test('explicit logout clears the whole local and session storage',()=>{
 let localCleared=false,sessionCleared=false;
 const previousLocal=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),previousSession=Object.getOwnPropertyDescriptor(globalThis,'sessionStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{clear(){localCleared=true}}});Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{clear(){sessionCleared=true}}});
 try{clearSignedOutStorage();assert.ok(localCleared&&sessionCleared);}finally{if(previousLocal)Object.defineProperty(globalThis,'localStorage',previousLocal);else delete globalThis.localStorage;if(previousSession)Object.defineProperty(globalThis,'sessionStorage',previousSession);else delete globalThis.sessionStorage;}
});
