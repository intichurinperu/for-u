import {compositionOptions} from '../studio/model';
import type {ContentDraft} from './types';
import type {LandingOrigin} from '../studio/navigation';
/** The title becomes the cover; the complete owner-reviewed text stays in the same piece. */
export function designFromContentText(value:ContentDraft,project:string,user:string,brand:string,sourceKey:string,origin?:LandingOrigin){
 if(value.text.length>10000)throw new Error('Tu texto está guardado. Para llevarlo al diseño, reduce la publicación a 10 000 caracteres; no recortamos tu contenido.');
 if(!value.topic.trim()||!value.text.trim()||value.topic.length>2000||value.text.length>12000)throw new Error('Revisa el título y el texto antes de crear tu diseño.');
 const design=compositionOptions({key:'content:'+sourceKey,title:value.topic,body:'',image:'',cta:'Conversemos',reference:null,group:'idea'},'conversation','portrait',project,user,brand).find(option=>option.layout==='poster')!;
 return {...design,caption:value.text,cta:'Conversemos',creative:{...design.creative!,...(origin?{origin}:{})}};
}
