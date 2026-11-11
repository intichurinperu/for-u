import type {ContentDraft} from '../components/shared/contentModel';
import {contentSizes} from '../components/shared/contentModel';
export type Box={x:number;y:number;w:number;h:number};
export type Decoration=Box&{shape:'rect'|'circle';tone:'ink'|'paper';opacity:number;radius?:number};
export type TextBox=Box&{text:string;size:number;weight:number;lines:string[]};
export function artworkLayout(draft:ContentDraft,hasImage:boolean,measure:(text:string,size:number,weight:number)=>number){
 const {width:w,height:h}=contentSizes[draft.format],pad=72;
 const layout=draft.layout||'editorial';
 const image:Box|null=!hasImage?null:layout==='poster'?{x:pad,y:h*.57,w:w-pad*2,h:h*.28}:layout==='split'?{x:w*.54,y:pad,w:w*.39,h:h-pad*2}:{x:0,y:0,w,h:h*.43};
 const textArea:Box=layout==='split'&&hasImage?{x:pad,y:h*.17,w:w*.41,h:h*.65}:layout==='poster'?{x:pad,y:h*.14,w:w-pad*2,h:hasImage?h*.38:h*.66}:{x:pad,y:hasImage?h*.48:h*.25,w:w-pad*2,h:hasImage?h*.36:h*.58};
 function wrap(text:string,size:number,weight:number,width:number){const lines:string[]=[];for(const p of text.split('\n')){let line='';for(const word of p.split(/\s+/)){const candidate=line?line+' '+word:word;if(measure(candidate,size,weight)<=width){line=candidate;continue;}if(line){lines.push(line);line='';}let chunk='';for(const character of word){if(chunk&&measure(chunk+character,size,weight)>width){lines.push(chunk);chunk='';}chunk+=character;}line=chunk;}lines.push(line);}return lines;}
 function fit(text:string,box:Box,initial:number,weight:number):TextBox{let size=initial,lines=wrap(text,size,weight,box.w);while(size>22&&lines.length*size*1.2>box.h){size-=2;lines=wrap(text,size,weight,box.w);}return {...box,text,size,weight,lines};}
 if(!hasImage){
  const inset=layout==='split'?108:pad;
  const start=h*(layout==='poster'?.17:layout==='split'?.21:.19);
  const titleMax=layout==='poster'?h*.40:h*.35;
  const initial=layout==='poster'?(draft.format==='post'?132:156):layout==='split'?(draft.format==='post'?112:132):(draft.format==='post'?116:140);
  const title=fit(draft.title,{x:inset,y:start,w:w-inset*2,h:titleMax},initial,layout==='poster'?800:700);
  const titleHeight=title.lines.length*title.size*1.2;
  const titleOverflow=titleHeight>title.h;
  if(!titleOverflow)title.h=titleHeight;
  const cta=fit(draft.cta||'',{x:inset,y:h-154,w:w-inset*2-160,h:80},36,600);
  const bodyY=title.y+title.h+48;
  const body=fit(draft.subtitle,{x:inset,y:bodyY,w:w-inset*2,h:Math.max(0,cta.y-bodyY-68)},44,400);
  const brand=fit(draft.brandName||'',{x:inset,y:pad,w:w-inset*2,h:58},32,600);
  const decorations:Decoration[]=layout==='poster'?[{shape:'circle',x:w*.60,y:h*.65,w:w*.58,h:w*.58,tone:'ink',opacity:.055},{shape:'rect',x:pad,y:pad+84,w:100,h:8,tone:'ink',opacity:.5,radius:4}]:layout==='split'?[{shape:'rect',x:36,y:36,w:w-72,h:h-72,tone:'paper',opacity:.4,radius:36},{shape:'rect',x:72,y:start,w:6,h:Math.min(h*.48,title.h+48+body.lines.length*body.size*1.2),tone:'ink',opacity:.25,radius:3}]:[{shape:'rect',x:pad,y:pad+92,w:w-pad*2,h:2,tone:'ink',opacity:.25},{shape:'rect',x:inset,y:h-194,w:96,h:3,tone:'ink',opacity:.4}];
  return {width:w,height:h,image:null,title,body,brand,cta,decorations,overflow:titleOverflow||[body,brand,cta].some(b=>b.lines.length*b.size*1.2>b.h)};
 }
 const title=fit(draft.title,{...textArea,h:textArea.h*.54},layout==='poster'?96:layout==='split'?76:84,700);
 const body=fit(draft.subtitle,{...textArea,y:textArea.y+textArea.h*.59,h:textArea.h*.41},32,400);
 const brand=fit(draft.brandName||'',{x:pad,y:hasImage&&layout==='editorial'?h*.445:pad,w:w-pad*2,h:38},24,600);
 const cta=fit(draft.cta||'',{x:pad,y:h-128,w:w-pad*2-180,h:66},30,600);
 const decorations:Decoration[]=layout==='split'?[{shape:'rect',x:0,y:0,w:w*.5,h,tone:'paper',opacity:.25}]:[];
 return {width:w,height:h,image,title,body,brand,cta,decorations,overflow:[title,body,brand,cta].some(b=>b.lines.length*b.size*1.2>b.h)};
}
