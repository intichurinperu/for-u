import {useEffect,useRef} from 'react';
import type {Segment} from './engine';
import {paintStyledCaption,type TextLook} from './textStyles';
export default function CaptionArtwork({rows,time,width,height,look,playing=false,clock,demo=false}:{rows:Segment[];time:number;width:number;height:number;look:TextLook;playing?:boolean;clock?:()=>number;demo?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;let frame=0;const started=performance.now(),motion=matchMedia('(prefers-reduced-motion: reduce)');const draw=()=>{ctx.clearRect(0,0,width,height);const now=demo&&!motion.matches?(performance.now()-started)/1000%3:playing&&clock?clock():time;const active=rows.filter(row=>now>=row.start&&now<row.end);if(active.length)paintStyledCaption(ctx,active.map(row=>row.text).join(' '),width,height,look,motion.matches?1e6:now-Math.min(...active.map(row=>row.start)));if(playing||demo&&!motion.matches)frame=requestAnimationFrame(draw);};draw();return()=>cancelAnimationFrame(frame);},[rows,time,width,height,look,playing,clock,demo]);
 return <canvas ref={ref} width={width} height={height} className="caption-artwork" aria-label={rows.filter(row=>time>=row.start&&time<row.end).map(row=>row.text).join(' ')||'Vista del estilo de texto'} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>;
}
