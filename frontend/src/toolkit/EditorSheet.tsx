import './editorSheet.css';
import {useEffect,useRef,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {ButtonSecondary} from '../components/ui/DesignSystem';
import {useDialogFocus} from './useDialogFocus';
let openSheets=0;
let previousOverflow='';
let previousInert=false;
/** Contextual controls share one accessible drawer on desktop and bottom sheet on mobile. */
export default function EditorSheet({open,title,onClose,children,closeLabel='Listo ×',className='',closeDisabled=false}:{open:boolean;title:string;onClose:()=>void;children:ReactNode;closeLabel?:string;className?:string;closeDisabled?:boolean}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{
  if(!open)return;
  const opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  return()=>{queueMicrotask(()=>{if(opener?.isConnected&&!opener.closest('[inert]'))opener.focus();});};
 },[open]);
 useDialogFocus(ref,open,onClose);
 useEffect(()=>{if(open)ref.current?.querySelector('h2')?.focus();},[open,title]);
 useEffect(()=>{
  if(!open)return;
  const root=document.getElementById('root');
  if(openSheets===0){previousOverflow=document.body.style.overflow;previousInert=root?.inert??false;document.body.style.overflow='hidden';if(root)root.inert=true;}
  openSheets++;
  return()=>{openSheets--;if(openSheets===0){document.body.style.overflow=previousOverflow;if(root)root.inert=previousInert;}};
 },[open]);
 if(!open)return null;
 return createPortal(<div className="pe-sheet-backdrop" onClick={event=>{if(event.target===event.currentTarget)onClose();}}><section ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`pe-context-sheet foru-experience ${className}`}><header><h2 tabIndex={-1} style={{outline:'none'}}>{title}</h2><ButtonSecondary aria-label={closeLabel==='Atrás'?closeLabel:'Cerrar panel'} disabled={closeDisabled} onClick={onClose}>{closeLabel}</ButtonSecondary></header><div className="pe-sheet-content">{children}</div></section></div>,document.body);
}
