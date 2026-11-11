import { useEffect,useRef } from 'react';
import {navigationState} from './pendingNavigation';
/** For actions that mutate local workspace state before navigating. */
export function confirmWorkspaceNavigation() {
 return navigationState.confirm(()=>window.confirm('Hay cambios sin guardar. ¿Quieres salir y descartarlos?'),clear=>queueMicrotask(clear));
}
export function useUnsavedNavigation(dirty: boolean) {
 const owner=useRef(Symbol('pending-workspace'));
 useEffect(()=>{
  if(!dirty)return;
  const unregister=navigationState.register(owner.current);
  const unload=(event:BeforeUnloadEvent)=>{if(navigationState.pending()){event.preventDefault();event.returnValue='';}};
  window.addEventListener('beforeunload',unload);
  return()=>{unregister();window.removeEventListener('beforeunload',unload);};
 },[dirty]);
}
