import {keptSegments,type Segment} from './engine';
export type TimelineEdge='start'|'end'|'move';
export function adjustTimeline(rows:Segment[],index:number,edge:TimelineEdge,delta:number,duration:number):Segment[]{
 const row=rows[index];if(!row||!Number.isFinite(delta)||!Number.isFinite(duration))return rows;
 const min=.05,left=index?rows[index-1].end:0,right=index+1<rows.length?rows[index+1].start:duration;
 const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));let next:Segment;
 if(edge==='start')next={...row,start:clamp(row.start+delta,left,row.end-min)};
 else if(edge==='end')next={...row,end:clamp(row.end+delta,row.start+min,right)};
 else {const offset=clamp(delta,left-row.start,right-row.end);next={...row,start:row.start+offset,end:row.end+offset};}
 return rows.map((value,i)=>i===index?next:value);
}
export function splitTimeline(rows:Segment[],time:number):Segment[]{
 const i=rows.findIndex(row=>time>row.start+.1&&time<row.end-.1);if(i<0)return rows;
 return [...rows.slice(0,i),{...rows[i],end:time},{...rows[i],start:time},...rows.slice(i+1)];
}
export function timelineClock(time:number){const safe=Math.round(Math.max(0,Number.isFinite(time)?time:0)*10)/10;return `${Math.floor(safe/60)}:${(safe%60).toFixed(1).padStart(4,'0')}`;}

/** Remove silence only from clips still present; manually removed material stays removed. */
export function removeTimelineSilences(rows:Segment[],silences:Segment[],duration:number):Segment[]{
 const kept=keptSegments(duration,silences);return rows.flatMap(row=>kept.map(keep=>({start:Math.max(row.start,keep.start),end:Math.min(row.end,keep.end)})).filter(part=>part.end-part.start>=.05));
}

/** Source intervals stay unchanged; only the playback order changes. */
export function reorderTimeline(rows:Segment[],from:number,to:number){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=rows.length||to>=rows.length||from===to)return rows;
 const next=[...rows];const [row]=next.splice(from,1);next.splice(to,0,row);return next;
}
export function montageTimeline(rows:Segment[]){let offset=0;return rows.map((row,index)=>{const start=offset;offset+=row.end-row.start;return {...row,index,sourceStart:row.start,sourceEnd:row.end,start,end:offset};});}
export function montageCaptions(clips:Segment[],captions:Segment[]){return montageTimeline(clips).flatMap(clip=>captions.flatMap((caption,index)=>{const a=Math.max(clip.sourceStart,caption.start),b=Math.min(clip.sourceEnd,caption.end);return b>a?[{...caption,index,sourceStart:a,start:clip.start+a-clip.sourceStart,end:clip.start+b-clip.sourceStart}]:[];}));}
export function sourceAtMontage(clips:Segment[],time:number){const rows=montageTimeline(clips),row=rows.find(row=>time>=row.start&&time<row.end)??rows.at(-1);return row?row.sourceStart+Math.max(0,Math.min(row.end-row.start,time-row.start)):0;}
export function montageAtSource(clips:Segment[],time:number,index?:number){const rows=montageTimeline(clips),row=(index===undefined?undefined:rows[index])??rows.find(row=>time>=row.sourceStart&&time<=row.sourceEnd);return row?row.start+Math.max(0,Math.min(row.end-row.start,time-row.sourceStart)):0;}
