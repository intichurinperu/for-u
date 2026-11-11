import {artworkLayout} from '../../studio/artworkLayout';
import { contentSizes, type ContentDraft } from './contentModel';
export async function exportContentImage(draft: ContentDraft, imageUrl: string,logoUrl=''): Promise<Blob> {
  const { width, height } = contentSizes[draft.format];
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('El navegador no pudo crear la imagen.');
  ctx.fillStyle = draft.background; ctx.fillRect(0, 0, width, height);
  if(draft.layout){
    await document.fonts?.ready;
    const geometry=artworkLayout(draft,Boolean(imageUrl),(text,size,weight)=>{ctx.font=`${weight} ${size}px Inter, sans-serif`;return ctx.measureText(text).width;});
    if(geometry.overflow)throw new Error('El texto no cabe completo. Acórtalo antes de exportar.');
    async function load(url:string){const image=new Image();image.crossOrigin='anonymous';await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('No pudimos leer la imagen para exportar. Revisa su archivo.'));image.src=url;});return image;}
    for(const shape of geometry.decorations){ctx.save();ctx.globalAlpha=shape.opacity;ctx.fillStyle=shape.tone==='ink'?draft.foreground:'#fff';ctx.beginPath();if(shape.shape==='circle')ctx.ellipse(shape.x+shape.w/2,shape.y+shape.h/2,shape.w/2,shape.h/2,0,0,Math.PI*2);else ctx.roundRect(shape.x,shape.y,shape.w,shape.h,shape.radius||0);ctx.fill();ctx.restore();}
    if(geometry.image){const box=geometry.image,image=await load(imageUrl),scale=Math.max(box.w/image.width,box.h/image.height);ctx.save();ctx.beginPath();if(draft.layout==='poster')ctx.roundRect(box.x,box.y,box.w,box.h,32);else ctx.rect(box.x,box.y,box.w,box.h);ctx.clip();ctx.drawImage(image,box.x+(box.w-image.width*scale)/2,box.y+(box.h-image.height*scale)/2,image.width*scale,image.height*scale);ctx.restore();}
    ctx.fillStyle=draft.foreground;ctx.textBaseline='top';
    for(const box of [geometry.brand,geometry.title,geometry.body,geometry.cta]){ctx.font=`${box.weight} ${box.size}px Inter, sans-serif`;box.lines.forEach((line,index)=>ctx.fillText(line,box.x,box.y+index*box.size*1.2));}
    if(logoUrl){const image=await load(logoUrl),scale=Math.min(160/image.width,64/image.height);ctx.drawImage(image,width-72-image.width*scale,height-80,image.width*scale,image.height*scale);}
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo exportar la imagen.')),'image/png'));
  }
  if (imageUrl) {
    const image = new Image(); image.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('No se pudo exportar la imagen seleccionada. Abre la biblioteca y selecciónala otra vez.')); image.src = imageUrl; });
    const imageHeight = height * 0.52;
    const scale = Math.max(width / image.width, imageHeight / image.height);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, width, imageHeight); ctx.clip();
    ctx.drawImage(image, (width - image.width * scale) / 2, (imageHeight - image.height * scale) / 2, image.width * scale, image.height * scale); ctx.restore();
  }
  function lines(text: string, fontSize: number) {
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    const result: string[] = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > width - 144) { result.push(line); line = word; }
        else line = candidate;
      }
      result.push(line);
    }
    return result;
  }
  let fontSize = 72;
  let title = lines(draft.title, fontSize);
  const space = imageUrl ? height * 0.48 - 160 : height - 240;
  while (fontSize > 24 && title.length * fontSize * 1.2 > space * 0.65) { fontSize -= 4; title = lines(draft.title, fontSize); }
  ctx.fillStyle = draft.foreground; ctx.textBaseline = 'top';
  let y = imageUrl ? height * 0.52 + 56 : height * 0.28;
  ctx.font = `600 ${fontSize}px Arial, sans-serif`;
  title.forEach(line => { ctx.fillText(line, 72, y, width - 144); y += fontSize * 1.2; });
  y += 28; const subtitle = lines(draft.subtitle, 32); ctx.font = '400 32px Arial, sans-serif';
  subtitle.forEach(line => { ctx.fillText(line, 72, y, width - 144); y += 42; });
  if(draft.cta){y+=24;ctx.font='600 30px Arial, sans-serif';lines(draft.cta,30).forEach(line=>{ctx.fillText(line,72,y,width-144);y+=38;});}
  if(draft.brandName){ctx.font='500 24px Arial, sans-serif';ctx.fillText(draft.brandName,72,height-48,logoUrl?width-360:width-144);}
  if(logoUrl){const logo=new Image();logo.crossOrigin='anonymous';await new Promise<void>((resolve,reject)=>{logo.onload=()=>resolve();logo.onerror=()=>reject(new Error('No se pudo exportar el logo. Revisa su archivo.'));logo.src=logoUrl;});const scale=Math.min(160/logo.width,64/logo.height);ctx.drawImage(logo,width-72-logo.width*scale,height-80,logo.width*scale,logo.height*scale);}
  if (y > height - 100) throw new Error('El texto no cabe completo. Acórtalo o cambia al formato Historia antes de exportar.');
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo exportar la imagen.')), 'image/png'));
}
