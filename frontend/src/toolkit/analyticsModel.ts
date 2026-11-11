export type AnalyticsSummary = {
  unique_visitors:number;page_views:number;cta_clicks:number;
  pages:{path:string;views:number}[];sources:{source:string;views:number}[];
  daily?:{day:string;views:number;clicks:number}[];updated_at:string;
};
export function readAnalyticsSummary(value:unknown):AnalyticsSummary {
  if(!value||typeof value!=='object')throw new Error('El servidor no devolvió un resumen válido. Reintenta; no se mostrarán ceros inventados.');
  const row=value as AnalyticsSummary, count=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
  if(!count(row.unique_visitors)||!count(row.page_views)||!count(row.cta_clicks)||!Array.isArray(row.pages)||!Array.isArray(row.sources)||!Number.isFinite(Date.parse(row.updated_at)))throw new Error('El resumen de métricas tiene un formato no válido.');
  if(row.pages.some(v=>typeof v.path!=='string'||!count(v.views))||row.sources.some(v=>typeof v.source!=='string'||!count(v.views))||row.daily!==undefined&&(!Array.isArray(row.daily)||row.daily.some(v=>!/^\d{4}-\d{2}-\d{2}$/.test(v.day)||!count(v.views)||!count(v.clicks))))throw new Error('El detalle de métricas tiene un formato no válido.');
  return row;
}
