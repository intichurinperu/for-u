/** Conservative removal of a flat background connected to the image edges.
 * Enclosed artwork and the source pixels are preserved for an explicit preview. */
export function removeFlatBackground(source:Uint8ClampedArray,width:number,height:number,tolerance=38){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||source.length!==width*height*4)throw new Error('No pudimos leer esta imagen.');
 const output=new Uint8ClampedArray(source),corners=[0,width-1,(height-1)*width,width*height-1];
 const opaque=corners.filter(index=>source[index*4+3]>240);
 if(opaque.length<3)throw new Error('Este logo ya tiene transparencia o un fondo irregular. Puedes conservar el original.');
 const distance=(index:number,color:number[])=>Math.sqrt(color.reduce((n,v,i)=>n+(source[index*4+i]-v)**2,0));
 const candidates=opaque.map(index=>[source[index*4],source[index*4+1],source[index*4+2]]);
 const background=candidates.sort((a,b)=>opaque.filter(index=>distance(index,b)<35).length-opaque.filter(index=>distance(index,a)<35).length)[0];
 if(opaque.filter(index=>distance(index,background)<35).length<3)throw new Error('El fondo no es uniforme. Usa un PNG transparente para conservar bien tu logo.');
 const seen=new Uint8Array(width*height),queue=new Uint32Array(width*height);let head=0,tail=0,removed=0;
 const push=(index:number)=>{if(seen[index])return;seen[index]=1;if(distance(index,background)<=tolerance+24&&source[index*4+3]>0)queue[tail++]=index;};
 for(let x=0;x<width;x++){push(x);push((height-1)*width+x);}for(let y=1;y<height-1;y++){push(y*width);push(y*width+width-1);}
 while(head<tail){const index=queue[head++],d=distance(index,background);output[index*4+3]=Math.round(source[index*4+3]*Math.max(0,Math.min(1,(d-tolerance)/24)));if(output[index*4+3]<source[index*4+3])removed++;const x=index%width;if(x>0)push(index-1);if(x<width-1)push(index+1);if(index>=width)push(index-width);if(index<(height-1)*width)push(index+width);}
 if(!removed)throw new Error('No encontramos un fondo liso para quitar. Conservamos tu original.');
 return {pixels:output,removed};
}
export async function prepareTransparentLogo(url:string):Promise<Blob>{
 const image=new Image();image.src=url;await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('No pudimos abrir el logo.'));});
 const scale=Math.min(1,1800/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('No pudimos preparar la transparencia.');ctx.drawImage(image,0,0,canvas.width,canvas.height);
 const data=ctx.getImageData(0,0,canvas.width,canvas.height),result=removeFlatBackground(data.data,canvas.width,canvas.height);data.data.set(result.pixels);ctx.putImageData(data,0,0);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No pudimos guardar el logo transparente.')),'image/png'));
}
