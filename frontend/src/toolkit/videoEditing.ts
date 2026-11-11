import type {Segment} from './engine';
export function readSrt(text:string):Segment[]{
 if(text.length>300000)throw new Error('Usa un archivo SRT de hasta 300 KB.');
 const clock=(value:string)=>{const parts=value.replace(',','.').split(':').map(Number);return parts[0]*3600+parts[1]*60+parts[2];};
 const rows=text.replace(/^\uFEFF/,'').replace(/\r/g,'').trim().split(/\n\s*\n/).filter(Boolean).map(block=>{const lines=block.split('\n'),timing=lines.findIndex(line=>line.includes('-->'));if(timing<0)throw new Error('El archivo no tiene tiempos SRT válidos.');const match=lines[timing].match(/^(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);if(!match)throw new Error('Revisa los tiempos del archivo SRT.');if([match[1],match[2]].some(time=>Number(time.slice(3,5))>59||Number(time.slice(6,8))>59))throw new Error('Revisa los minutos y segundos del archivo SRT.');const start=clock(match[1]),end=clock(match[2]),text=lines.slice(timing+1).join('\n').replace(/<[^>]*>/g,'').trim();if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||!text)throw new Error('Un subtítulo tiene tiempos o texto incompletos.');return {start,end,text};});
 if(!rows.length||rows.length>1000)throw new Error('Importa entre 1 y 1000 subtítulos.');return rows;
}
export function validCaptionTimes(rows:Segment[],duration:number){return rows.every(row=>Number.isFinite(row.start)&&Number.isFinite(row.end)&&row.start>=0&&row.end>row.start&&row.end<=duration+.05&&row.text.trim().length>0);}
