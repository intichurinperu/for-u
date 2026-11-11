import type {Segment} from './engine';
export type ClipMotion={enter:'none'|'fade'|'zoom';exit:'none'|'fade'|'zoom'};
export type VideoLayer={id:string;url:string;name:string;start:number;end:number;x:number;y:number;width:number;ratio:number;animation?:'none'|'fade'|'pop'|'rise';originalUrl?:string;placement?:'end'|'overlay'};
export function clipAppearance(time:number,clip:Segment,motion?:ClipMotion){const duration=Math.min(.45,(clip.end-clip.start)/2),a=Math.max(0,Math.min(1,(time-clip.start)/duration)),b=Math.max(0,Math.min(1,(clip.end-time)/duration));return {opacity:(motion?.enter==='fade'?a:1)*(motion?.exit==='fade'?b:1),scale:1+(motion?.enter==='zoom'?.12*(1-a):0)+(motion?.exit==='zoom'?.12*(1-b):0)};}
export function layerAppearance(layer:VideoLayer,time:number){
 const visible=time>=layer.start&&time<layer.end;if(!visible)return {opacity:0,scale:1,rise:0};
 const duration=Math.max(.01,Math.min(.65,(layer.end-layer.start)/3)),progress=Math.max(0,Math.min(1,(time-layer.start)/duration)),eased=1-(1-progress)**3;
 const ending=Math.max(0,Math.min(1,(layer.end-time)/Math.min(.25,duration)));
 if(!layer.animation||layer.animation==='none')return {opacity:1,scale:1,rise:0};
 const pop=1+2.70158*(progress-1)**3+1.70158*(progress-1)**2;
 return {opacity:Math.min(1,progress*3)*ending,scale:layer.animation==='pop'?.72+.28*pop:1,rise:layer.animation==='rise'?.1*(1-eased):0};
}
export function endingLogoLayout(rows:VideoLayer[],duration:number){const endRows=rows.filter(row=>row.placement==='end'),columns=Math.min(3,endRows.length);return rows.map(row=>{if(row.placement!=='end')return row;const index=endRows.indexOf(row),line=Math.floor(index/3),inLine=Math.min(3,endRows.length-line*3);return {...row,start:Math.max(0,duration-3),end:duration,x:(index%3+1)/(inLine+1),y:endRows.length<=3?.78:.55+line*.17,width:columns===1?.32:.23};});}
export function paintLayers(ctx:CanvasRenderingContext2D,layers:VideoLayer[],images:Map<string,HTMLImageElement>,time:number,width:number,height:number){for(const layer of layers){const appearance=layerAppearance(layer,time);if(!appearance.opacity)continue;const img=images.get(layer.id);if(!img)continue;const w=width*layer.width*appearance.scale,h=w/layer.ratio;ctx.save();ctx.globalAlpha=appearance.opacity;ctx.drawImage(img,layer.x*width-w/2,(layer.y+appearance.rise)*height-h/2,w,h);ctx.restore();}}
