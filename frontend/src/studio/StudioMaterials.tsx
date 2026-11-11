import {useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {linkedPieceQuery} from './navigation';
import {usePrivateDocument} from '../experience/usePrivateDocument';
import {useToolkit} from '../toolkit/ToolkitContext';
import {emptyMaterials,parseMaterials} from '../workspace/contracts';
import {emptySocial,parseSocial} from '../social/model';
import {resolveMediaPath} from '../components/shared/mediaStorage';
import {ButtonSecondary} from '../components/ui/DesignSystem';
import ProjectImage from '../components/shared/ProjectImage';
import {mediaReference} from '../components/shared/mediaReference';
export default function StudioMaterials(){
 const {userId,projectId}=useToolkit();const [params]=useSearchParams();const returnParams=new URLSearchParams(params);returnParams.set('return','library');returnParams.set('library','materials');const [limit,setLimit]=useState(12),[error,setError]=useState(''),[opening,setOpening]=useState('');
 const files=usePrivateDocument(userId,projectId,'materials',()=>emptyMaterials(projectId),v=>parseMaterials(v,projectId,userId));
 const profile=usePrivateDocument(userId,projectId,'social-profile',()=>emptySocial(projectId),v=>parseSocial(v,projectId,userId));
 if(!files.loaded||!profile.loaded)return <p role="status">Abriendo los archivos de tus piezas…</p>;
 if(files.error||profile.error)return <div role="alert"><p>No pudimos leer los archivos guardados.</p><ButtonSecondary onClick={()=>{void files.reload();void profile.reload();}}>Reintentar biblioteca</ButtonSecondary></div>;
 async function open(path:string){setOpening(path);setError('');try{const url=await resolveMediaPath(path);window.open(url,'_blank','noopener,noreferrer');}catch(e){setError((e as Error).message);}finally{setOpening('');}}
 if(!files.data.materials.length)return <div className="studio-empty-state"><h3>Tus videos y portadas tendrán un lugar aquí.</h3><p>Al guardar una grabación o una portada en tu pieza, aparecerá en esta biblioteca.</p><Link className="pe-action-link" to={`/creator-studio?project=${projectId}&tab=profile`}>Abrir mis piezas →</Link></div>;
 return <><div className="studio-library-grid">{[...files.data.materials].reverse().slice(0,limit).map(file=>{const piece=profile.data.pieces.find(row=>row.videoId===file.id||row.coverId===file.id||row.materialIds?.includes(file.id));return <article className="studio-material-card" key={file.id}>{file.kind==='image'?<ProjectImage value={mediaReference(file.path)} alt={file.name}/>:<span aria-hidden="true" className="studio-material-symbol">{file.kind==='video'?'▶':file.kind==='audio'?'♫':'▤'}</span>}<small>{file.kind==='image'?'Portada o imagen':file.kind==='video'?'Video':file.kind==='audio'?'Audio':'Documento'}</small><strong>{file.name}</strong>{piece&&<Link className="pe-action-link" to={'/creator-studio'+linkedPieceQuery(projectId,piece.id,returnParams)+'&tab=profile'}>Abrir su pieza →</Link>}<ButtonSecondary disabled={!!opening} onClick={()=>void open(file.path)}>{opening===file.path?'Abriendo…':'Abrir archivo'}</ButtonSecondary></article>;})}</div>{files.data.materials.length>limit&&<ButtonSecondary onClick={()=>setLimit(v=>v+12)}>Ver más archivos</ButtonSecondary>}{error&&<p role="alert">{error}</p>}</>;
}
