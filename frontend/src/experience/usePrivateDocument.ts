import {loadAccountIdeas,saveAccountIdeas} from '../services/accountIdeas';
import {useEffect,useSyncExternalStore} from 'react';
import {loadModuleDocument,saveModuleDocument,type ModuleDocumentKind} from '../services/moduleDocuments';
import {PrivateDocumentController} from '../services/privateDocumentController';
const controllers=new Map<string,PrivateDocumentController<unknown>>();
// Every async operation captures its own account/project/kind. Navigation cannot
// change the destination of an in-flight save; unsaved drafts survive tool changes.
export function usePrivateDocument<T>(user:string,project:string,kind:ModuleDocumentKind,initial:()=>T,parse:(v:unknown)=>T){
 const key=JSON.stringify([user,project,kind]);
 if(!controllers.has(key))controllers.set(key,new PrivateDocumentController<unknown>({
  load:()=>kind==='personal-ideas'?loadAccountIdeas(user):loadModuleDocument(user,project,kind),
  save:(data,revision)=>kind==='personal-ideas'?saveAccountIdeas(user,parse(data),revision):saveModuleDocument(user,project,kind,parse(data),revision),
 },initial,parse));
 const controller=controllers.get(key)! as PrivateDocumentController<T>;
 const entry=useSyncExternalStore(controller.subscribe,controller.snapshot);
 useEffect(()=>{void controller.load();const refresh=()=>{if(!document.hidden)void controller.load();};window.addEventListener('focus',refresh);window.addEventListener('foru:documents-updated',refresh);const timer=setInterval(refresh,15000);return()=>{window.removeEventListener('focus',refresh);window.removeEventListener('foru:documents-updated',refresh);clearInterval(timer);};},[controller]);
 useEffect(()=>{if(!entry.dirty)return;const guard=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[entry.dirty]);
 return {...entry,change:controller.change,save:()=>controller.save(),reload:()=>controller.load(),recover:()=>controller.load(true)};
}
