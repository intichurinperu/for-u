type Magic={id:number;label:string;finishing:boolean}|null;
let value:Magic=null,sequence=0,timer:ReturnType<typeof setTimeout>|undefined;
const listeners=new Set<()=>void>();
export const magicSnapshot=()=>value;
export function subscribeMagic(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
const notify=()=>listeners.forEach(listener=>listener());
export function beginMagic(label='Haciendo magia…'){clearTimeout(timer);const id=++sequence;value={id,label,finishing:false};notify();return id;}
export function finishMagic(id?:number){if(!value||(id!==undefined&&value.id!==id))return;const current=value.id;value={...value,finishing:true};notify();clearTimeout(timer);timer=setTimeout(()=>{if(value?.id===current){value=null;notify();}},360);}
