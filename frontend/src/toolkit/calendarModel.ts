import {validGuidance} from '../ai/model';
import type { CalendarEntry } from './types';

export function calendarDateTime(date: string, time: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Revisa la fecha y hora.');
  const [y,m,d] = date.split('-').map(Number), [h,min] = time.split(':').map(Number);
  const value = new Date(y,m-1,d,h,min);
  if (value.getFullYear() !== y || value.getMonth() !== m-1 || value.getDate() !== d || value.getHours() !== h || value.getMinutes() !== min) throw new Error('Revisa la fecha y hora.');
  return value;
}
export function readCalendar(value: unknown): CalendarEntry[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error('La agenda guardada tiene un formato desconocido. No se reemplazará.');
  const ids = new Set<string>();
  for (const entry of value) {
    if (!entry || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id) || typeof entry.title !== 'string' || !entry.title.trim() || typeof entry.format !== 'string' || typeof entry.done !== 'boolean'||(entry.guidance!==undefined&&!validGuidance(entry.guidance))) throw new Error('La agenda guardada necesita recuperación. No se reemplazará.');
    calendarDateTime(entry.date,entry.time); ids.add(entry.id);
  }
  return value as CalendarEntry[];
}
export function calendarICS(entries: CalendarEntry[], now = new Date(),tasks:{id:string;title:string;date:string;done:boolean}[]=[],pieces:{id:string;title:string;date:string}[]=[]): string {
  readCalendar(entries);
  const escape = (s: string) => s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const utc = (d: Date) => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  // RFC 5545: fold at 75 UTF-8 octets, without splitting a codepoint.
  const fold = (line: string) => { let out='',part='',size=0; for(const char of line){const bytes=new TextEncoder().encode(char).length;if(size+bytes>75){out+=part+'\r\n';part=' ';size=1;}part+=char;size+=bytes;}return out+part; };
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FOR U//Agenda//ES',...entries.flatMap(e=>{
    const start=calendarDateTime(e.date,e.time);
    return ['BEGIN:VEVENT',`UID:${escape(e.id)}@foru`,`DTSTAMP:${utc(now)}`,`DTSTART:${utc(start)}`,`DTEND:${utc(new Date(start.getTime()+30*60_000))}`,`SUMMARY:${escape(e.title)}`,'STATUS:CONFIRMED',`X-FORU-DONE:${e.done?'TRUE':'FALSE'}`,...(e.done?[]:['BEGIN:VALARM','TRIGGER:-PT10M','ACTION:DISPLAY',`DESCRIPTION:${escape(e.title)}`,'END:VALARM']),'END:VEVENT'];
  }),...tasks.flatMap(t=>{calendarDateTime(t.date,'00:00');return ['BEGIN:VEVENT',`UID:task-${escape(t.id)}@foru`,`DTSTAMP:${utc(now)}`,`DTSTART;VALUE=DATE:${t.date.replaceAll('-','')}`,`SUMMARY:${escape(t.title)}`,`X-FORU-DONE:${t.done?'TRUE':'FALSE'}`,'END:VEVENT'];}),...pieces.flatMap(p=>{calendarDateTime(p.date,'00:00');return ['BEGIN:VEVENT',`UID:piece-${escape(p.id)}@foru`,`DTSTAMP:${utc(now)}`,`DTSTART;VALUE=DATE:${p.date.replaceAll('-','')}`,`SUMMARY:${escape(p.title)}`,'END:VEVENT'];}),'END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
}

/** Retrying a failed activity write reuses its ID and preserves completion metadata. */
export function upsertCalendarActivity(entries:CalendarEntry[],id:string,value:{title:string;date:string;time:string}):CalendarEntry[]{
 readCalendar(entries);calendarDateTime(value.date,value.time);if(!id||!value.title.trim()||value.title.trim().length>200)throw new Error('Revisa el nombre de la actividad.');
 const existing=entries.find(entry=>entry.id===id),changed:CalendarEntry={...(existing||{id,format:'contenido',done:false}),...value,title:value.title.trim()};
 return existing?entries.map(entry=>entry.id===id?changed:entry):[...entries,changed];
}

export type CalendarView='agenda'|'week'|'month';
export function calendarWindow(anchor:Date,view:CalendarView):Date[]{
 if(!Number.isFinite(anchor.getTime()))throw new Error('Revisa la fecha del calendario.');
 const start=new Date(anchor.getFullYear(),anchor.getMonth(),view==='month'?1:anchor.getDate());
 if(view!=='agenda')start.setDate(start.getDate()-((start.getDay()+6)%7));
 return Array.from({length:view==='month'?42:7},(_,index)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+index));
}
