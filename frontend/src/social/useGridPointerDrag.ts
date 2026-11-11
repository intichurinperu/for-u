import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type RefObject} from 'react';
export default function useGridPointerDrag(container:RefObject<HTMLDivElement|null>,disabled:boolean,onMove:(id:string,before:string)=>void){
 const action=useRef<{pointer:number;id:string;x:number;y:number;dragged:boolean;target:string|null}|null>(null),skipClick=useRef(false);
 const [dragged,setDragged]=useState<string|null>(null),[target,setTarget]=useState<string|null>(null);
 const reset=()=>{action.current=null;setDragged(null);setTarget(null);};
 useEffect(()=>{if(disabled)reset();return()=>{action.current=null;};},[disabled]);
 function down(event:ReactPointerEvent<HTMLButtonElement>,id:string){if(disabled||event.button!==0)return;event.preventDefault();event.currentTarget.focus({preventScroll:true});skipClick.current=false;action.current={pointer:event.pointerId,id,x:event.clientX,y:event.clientY,dragged:false,target:null};event.currentTarget.setPointerCapture(event.pointerId);}
 function move(event:ReactPointerEvent<HTMLButtonElement>){const value=action.current;if(!value||value.pointer!==event.pointerId||disabled)return;if(!value.dragged&&Math.hypot(event.clientX-value.x,event.clientY-value.y)<8)return;value.dragged=true;setDragged(value.id);const hit=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('[data-grid-piece]');value.target=hit&&container.current?.contains(hit)&&hit.dataset.gridPiece!==value.id?hit.dataset.gridPiece||null:null;setTarget(value.target);if(event.clientY<70)window.scrollBy({top:-24,behavior:'auto'});else if(event.clientY>window.innerHeight-70)window.scrollBy({top:24,behavior:'auto'});}
 function up(event:ReactPointerEvent<HTMLButtonElement>){const value=action.current;if(!value||value.pointer!==event.pointerId)return;skipClick.current=value.dragged;if(value.dragged&&value.target&&!disabled)onMove(value.id,value.target);reset();if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}
 function cancel(){skipClick.current=true;reset();}
 function click(open:()=>void){if(skipClick.current){skipClick.current=false;return;}if(!disabled)open();}
 return {dragged,target,down,move,up,cancel,click};
}
