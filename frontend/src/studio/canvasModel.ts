import type {ContentDraft} from '../components/shared/contentModel';
export function adaptCanvas(draft:ContentDraft,format:ContentDraft['format']):ContentDraft{return {...draft,format};}
export function ideaWords(text:string){const value=text.trim();if(!value)throw new Error('Cuéntame tu idea para convertirla en post.');const first=value.split('\n')[0];return {title:first.slice(0,160),body:value.slice(Math.min(160,first.length)).trim()};}
export function canvasCaption(draft:ContentDraft){return [draft.title,draft.subtitle,draft.cta].filter(Boolean).join('\n\n');}

export function ideaDesignSuggestion(value:Record<string,unknown>){
 const {title,text,cta,templateId}=value;
 const layouts={pearl:'editorial',violet:'poster',mint:'split'} as const;
 if(typeof title!=='string'||!title.trim()||typeof text!=='string'||typeof cta!=='string'||
  (templateId!=='pearl'&&templateId!=='violet'&&templateId!=='mint')){
  throw new Error('FOR U no pudo preparar un diseño editable con esta respuesta.');
 }
 return {title:title.trim(),body:text.trim(),cta:cta.trim(),layout:layouts[templateId]};
}
