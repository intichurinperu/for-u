import {emptyMaterials,parseMaterials,type Material} from '../workspace/contracts';
import {changePiece,getPiece,parseSocial} from './model';
export type MediaReceipt={material:Material;uploaded:boolean};
export const pieceMediaStorage={load:async(...args:Parameters<typeof import('../services/moduleDocuments').loadModuleDocument>)=>(await import('../services/moduleDocuments')).loadModuleDocument(...args),save:async(...args:Parameters<typeof import('../services/moduleDocuments').saveModuleDocument>)=>(await import('../services/moduleDocuments')).saveModuleDocument(...args),upload:async(path:string,file:File)=>{
 const {supabase}=await import('../services/supabase');
 if(!supabase)throw new Error('Conecta tu cuenta para guardar el archivo.');
 const result=await supabase.storage.from('user-uploads').upload(path,file,{contentType:file.type.split(';')[0].trim(),upsert:false});
 if(result.error&&(!('statusCode' in result.error)||String(result.error.statusCode)!=='409')&&!/already exists|duplicate/i.test(result.error.message))throw new Error('No se pudo guardar el archivo privado. Revisa la conexión y los formatos permitidos en tu biblioteca. Conservamos el original para descargarlo o reintentar.');
}};
export function mediaReceipt(user:string,project:string,file:File,kind:'video'|'image',id:string=crypto.randomUUID()):MediaReceipt{
 const mime=file.type.split(';')[0].trim().toLowerCase();
 const extension=({ 'video/mp4':'mp4','video/webm':'webm','image/png':'png','image/jpeg':'jpg','image/webp':'webp'} as Record<string,string>)[mime];
 if(!extension||!mime.startsWith(kind+'/')||!file.size||file.size>20*1024*1024)throw new Error('Guarda un MP4/WebM o una imagen PNG/JPG/WebP de hasta 20 MB. Puedes descargar el original si supera ese tamaño.');
 const material={id,path:`${user}/${project}/${id}.${extension}`,name:file.name.slice(0,200),mime,kind};
 parseMaterials({version:1,projectId:project,materials:[material]},project,user);return {material,uploaded:false};
}
/** File, manifest, then reference. Keep the same receipt on retry; never duplicate the piece. */
export async function savePieceMedia(user:string,project:string,pieceId:string,file:File,receipt:MediaReceipt,storage=pieceMediaStorage){
 const material=receipt.material;
 parseMaterials({version:1,projectId:project,materials:[material]},project,user);
 if(material.kind!=='video'&&material.kind!=='image')throw new Error('Elige un video o una portada para esta pieza.');
 if(JSON.stringify(mediaReceipt(user,project,file,material.kind,material.id).material)!==JSON.stringify(material))throw new Error('El archivo cambió. Empieza un nuevo guardado sin reemplazar el anterior.');
 const current=await storage.load(user,project,'social-profile');
 getPiece(current?.payload,project,pieceId,user); // Validate the destination before any upload.
 const saved=await storage.load(user,project,'materials');
 const manifest=saved?parseMaterials(saved.payload,project,user):emptyMaterials(project);
 const existing=manifest.materials.find(row=>row.id===material.id);
 if(existing&&JSON.stringify(existing)!==JSON.stringify(material))throw new Error('El archivo guardado cambió. Conservamos la versión anterior.');
 if(!receipt.uploaded){await storage.upload(material.path,file);receipt.uploaded=true;}
 try{if(!existing)await storage.save(user,project,'materials',parseMaterials({...manifest,materials:[...manifest.materials,material]},project,user),saved?.revision??null);}catch(error){throw new Error('El archivo se subió; falta registrarlo en tu biblioteca. Reintenta sin subir otra copia. '+(error as Error).message);}
 try{
  // Re-read after the upload so another edit to title or script is preserved.
  const latest=await storage.load(user,project,'social-profile');
  const {document,piece}=getPiece(latest?.payload,project,pieceId,user);
  const patch={materialIds:[...new Set([...(piece.materialIds||[]),material.id])],files:piece.files.some(row=>row.path===material.path)?piece.files:[...piece.files,{path:material.path,name:material.name}],...(material.kind==='video'?{videoId:material.id}:{coverId:material.id})};
  const next=parseSocial(changePiece(document,pieceId,patch),project,user);
  if(JSON.stringify(next)!==JSON.stringify(document))await storage.save(user,project,'social-profile',next,latest?.revision??null);
 }catch(error){throw new Error('El archivo está guardado; falta vincularlo a tu pieza. Reintenta sin subir otra copia. '+(error as Error).message);}
 return material;
}
