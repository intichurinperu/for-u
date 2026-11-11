export const textFonts={modern:{label:'Moderna',family:'Arial, sans-serif'},editorial:{label:'Editorial',family:'Georgia, serif'},mono:{label:'Técnica',family:'monospace'},hand:{label:'Manuscrita',family:'cursive'}} as const;
export type TextFont=keyof typeof textFonts;
export const textPresets=[
 {id:'minimal',name:'Minimalista',group:'Limpios'},{id:'outline',name:'Contorno',group:'Limpios'},{id:'shadow',name:'Sombra suave',group:'Limpios'},{id:'glass',name:'Fondo translúcido',group:'Limpios'},
 {id:'editorial',name:'Editorial',group:'Con personalidad'},{id:'hand',name:'Manuscrito',group:'Con personalidad'},{id:'typewriter',name:'Máquina de escribir',group:'Con personalidad'},{id:'retro',name:'Retro',group:'Con personalidad'},
 {id:'marker',name:'Marcador',group:'Para destacar'},{id:'underline',name:'Subrayado',group:'Para destacar'},{id:'tag',name:'Etiqueta',group:'Para destacar'},{id:'giant',name:'Texto gigante',group:'Para destacar'},
 {id:'fade',name:'Aparición suave',group:'Con movimiento'},{id:'bounce',name:'Rebote sutil',group:'Con movimiento'},{id:'slide',name:'Deslizamiento',group:'Con movimiento'},{id:'reveal',name:'Revelado',group:'Con movimiento'},
 {id:'title',name:'Título y apoyo',group:'Comerciales'},{id:'price',name:'Precio destacado',group:'Comerciales'},{id:'question',name:'Pregunta',group:'Comerciales'},{id:'cta',name:'Llamada a la acción',group:'Comerciales'},
] as const;
export type TextPreset=typeof textPresets[number]['id'];
export type TextLook={preset:TextPreset;useBrand:boolean;primary:string;accent:string;ink:string;font:TextFont;size:number;position:'top'|'middle'|'bottom'};
export type VisualBrand={version:1;projectId:string;look:TextLook;favorites:TextPreset[]};
export const defaultTextLook:TextLook={preset:'glass',useBrand:false,primary:'#E5E5EA',accent:'#E9DDE8',ink:'#29292F',font:'modern',size:1,position:'bottom'};
export function validTextLook(value:unknown):value is TextLook{
 const v=value as TextLook;return !!v&&textPresets.some(p=>p.id===v.preset)&&typeof v.useBrand==='boolean'&&[v.primary,v.accent,v.ink].every(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c))&&Object.hasOwn(textFonts,v.font)&&Number.isFinite(v.size)&&v.size>=.7&&v.size<=1.5&&['top','middle','bottom'].includes(v.position);
}
export function readVisualBrand(value:unknown,projectId:string):VisualBrand{
 if(value===undefined)return {version:1,projectId,look:{...defaultTextLook},favorites:[]};
 const v=value as VisualBrand;if(!v||v.version!==1||v.projectId!==projectId||!validTextLook(v.look)||!Array.isArray(v.favorites)||v.favorites.length>20||new Set(v.favorites).size!==v.favorites.length||!v.favorites.every(id=>textPresets.some(p=>p.id===id)))throw new Error('El estilo guardado necesita revisión. No se reemplazará automáticamente.');
 return {version:1,projectId,look:{...v.look},favorites:[...v.favorites]};
}
export function readableInk(hex:string){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>.35?'#15251D':'#FFFFFF';}
export function captionTypography(width:number,look:TextLook){
 const p=look.preset,family=p==='editorial'||p==='retro'?'Georgia, serif':p==='hand'?'cursive':p==='typewriter'?'monospace':textFonts[look.font].family;
 const size=Math.max(12,width/27*look.size*(p==='giant'?1.5:p==='title'?1.14:1));
 return {size,family,weight:p==='hand'?500:p==='editorial'?600:700};
}
export function captionLines(ctx:CanvasRenderingContext2D,text:string,width:number){
 const result:string[]=[];let line='';
 for(const paragraph of text.split('\n')){for(const word of paragraph.split(/\s+/).filter(Boolean)){if(ctx.measureText(line?`${line} ${word}`:word).width>width){if(line){result.push(line);line='';}if(ctx.measureText(word).width>width){let part='';for(const char of word){if(ctx.measureText(part+char).width>width&&part){result.push(part);part='';}part+=char;}line=part;}else line=word;}else line=line?`${line} ${word}`:word;}if(line){result.push(line);line='';}}
 return result;
}
/** Shared paint path for on-video preview, swatches and exported frames. No speech timing is inferred. */
export function paintStyledCaption(ctx:CanvasRenderingContext2D,text:string,width:number,height:number,look:TextLook,elapsed=.6){
 if(!text.trim())return;const {size,family,weight}=captionTypography(width,look),p=look.preset;
 ctx.save();ctx.font=`${weight} ${size}px ${family}`;ctx.textAlign='center';ctx.textBaseline='alphabetic';
 const lines=captionLines(ctx,text,width*.82),lineHeight=size*1.3,total=lines.length*lineHeight;
 const start=look.position==='top'?height*.18:look.position==='middle'?(height-total)/2:height*.84-total;
 const primary=look.useBrand?look.primary:'#F6D46C',accent=look.useBrand?look.accent:'#BEE3D2',ink=look.useBrand?look.ink:'#FFFFFF';
 const intro=Math.max(0,Math.min(1,elapsed/.35));if(p==='fade')ctx.globalAlpha=intro;
 if(p==='bounce'){const scale=1+.08*Math.sin(intro*Math.PI)*(1-intro);ctx.translate(width/2,start+total/2);ctx.scale(scale,scale);ctx.translate(-width/2,-start-total/2);}
 if(p==='slide')ctx.translate((1-intro)*width*.12,0);
 if(p==='reveal'){ctx.beginPath();ctx.rect(0,start-size,width,(total+size)*intro);ctx.clip();}
 const shown=p==='typewriter'?text.slice(0,Math.max(0,Math.floor(elapsed*38))):text;
 const rendered=p==='typewriter'?captionLines(ctx,shown,width*.82):lines;
 const boxed=['glass','marker','tag','retro','title','price','question','cta'].includes(p);
 rendered.forEach((line,index)=>{
  const y=start+size+index*lineHeight,w=ctx.measureText(line).width,x=width/2-w/2;
  if(boxed){ctx.shadowBlur=0;ctx.fillStyle=p==='glass'?(look.useBrand?primary+'E6':'rgba(12,20,16,.72)'):p==='retro'?'#F8E9CF':primary;ctx.fillRect(x-size*.3,y-size*1.02,w+size*.6,lineHeight);if(p==='tag'){ctx.beginPath();ctx.moveTo(x-size*.3,y-size*1.02);ctx.lineTo(x-size*.65,y-size*.35);ctx.lineTo(x-size*.3,y+size*.28);ctx.closePath();ctx.fill();}if(p==='cta'){ctx.strokeStyle=accent;ctx.lineWidth=size*.09;ctx.strokeRect(x-size*.3,y-size*1.02,w+size*.6,lineHeight);}if(p==='tag'||p==='cta'){ctx.fillStyle=accent;ctx.fillRect(x-size*.3,y+size*.23,w+size*.6,size*.13);}if(p==='question'){ctx.strokeStyle=accent;ctx.lineWidth=size*.1;ctx.strokeRect(x-size*.3,y-size*1.02,w+size*.6,lineHeight);}}
  if(p==='underline'){ctx.fillStyle=primary;ctx.fillRect(x,y+size*.12,w,size*.13);}
  let color=boxed?(p==='glass'?(look.useBrand?readableInk(primary):'#FFFFFF'):p==='retro'?'#493B29':readableInk(primary)):ink;
  if(p==='title'&&index===0)color=readableInk(primary);
  if(p==='price'&&/\d/.test(line)){ctx.fillStyle=accent;ctx.fillRect(x-size*.15,y-size,w+size*.3,lineHeight);color=readableInk(accent);}
  if(p==='shadow'){ctx.shadowColor='#000000';ctx.shadowBlur=size*.25;ctx.shadowOffsetY=size*.08;}
  else if(!boxed){ctx.strokeStyle=readableInk(color)==='#FFFFFF'?'#FFFFFF':'#162018';ctx.lineWidth=p==='outline'?size*.15:size*.07;ctx.lineJoin='round';ctx.strokeText(line,width/2,y);}
  if(p==='outline'){ctx.fillStyle=primary;ctx.fillText(line,width/2,y);}else{ctx.fillStyle=color;ctx.fillText(line,width/2,y);}
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 });ctx.restore();
}
