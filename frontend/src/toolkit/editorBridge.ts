import type {LandingDraft} from './types';
/** Closed operations: preview messages can never address arbitrary document paths. */
export function applyPreviewText(current:LandingDraft,message:unknown):LandingDraft{
 if(!message||typeof message!=='object'||Array.isArray(message))return current;
 const {field,value,blockId}=message as Record<string,unknown>;
 if(typeof value!=='string'||typeof field!=='string')return current;
 const limits:Record<string,number>={headline:180,description:1000,cta:50};
 if(Object.hasOwn(limits,field)){const text=value.slice(0,limits[field]);return current[field as 'headline']===text?current:{...current,[field]:text};}
 if(!['title','body'].includes(field)||typeof blockId!=='string'||!current.blocks.some(block=>block.id===blockId))return current;
 const text=value.slice(0,field==='title'?150:2000);
 if(current.blocks.find(block=>block.id===blockId)![field as 'title'|'body']===text)return current;
 return {...current,blocks:current.blocks.map(block=>block.id===blockId?{...block,...(field==='body'?{useModuleDetails:false,contact:undefined}:{}),[field]:text}:block)};
}
