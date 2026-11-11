import type {LandingBlock} from './types';
export type LocationDetails={version:1;address:string;hours:string;mapUrl:string;note:string};
const limits={address:400,hours:600,mapUrl:1000,note:2000};
export function locationDetails(value:unknown):LocationDetails|undefined{
 if(value===undefined)return undefined;
 if(!value||typeof value!=='object'||Array.isArray(value)||(value as {version?:unknown}).version!==1)throw new Error('Revisa los datos de contacto de esta sección.');
 const data=value as Record<string,unknown>;const result:LocationDetails={version:1,address:'',hours:'',mapUrl:'',note:''};
 for(const key of ['address','hours','mapUrl','note'] as const){if(typeof data[key]!=='string'||data[key].length>limits[key])throw new Error('Acorta los datos de contacto para guardarlos.');result[key]=(data[key] as string).trim();}
 if(result.mapUrl){let url:URL;try{url=new URL(result.mapUrl);}catch{throw new Error('Usa el enlace HTTPS completo de tu ubicación.');}if(url.protocol!=='https:'||url.username||url.password)throw new Error('Usa un enlace HTTPS sin claves de acceso.');result.mapUrl=url.href;}
 if(locationText(result).length>2000)throw new Error('Acorta esta sección: admite hasta 2000 caracteres.');
 return result;
}
export function locationText(value:LocationDetails):string{return [value.note,value.address,value.hours].filter(Boolean).join('\n\n');}
export function initialLocationDetails(block:LandingBlock):LocationDetails{return locationDetails(block.contact)||{version:1,address:'',hours:'',mapUrl:'',note:block.body};}
export function updateLocationDetails(block:LandingBlock,key:Exclude<keyof LocationDetails,'version'>,value:string):LandingBlock{
 const contact=locationDetails({...initialLocationDetails(block),[key]:value})!;
 return {...block,kind:'location',useModuleDetails:false,contact,body:locationText(contact)};
}
