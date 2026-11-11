import StudioMaterials from './StudioMaterials';
import {lazy,Suspense} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {useToolkit} from '../toolkit/ToolkitContext';
import {usePrivateDocument} from '../experience/usePrivateDocument';
import {ButtonSecondary} from '../components/ui/DesignSystem';
import DesignThumbnail from '../experience/DesignThumbnail';
import {contentDocument} from './saveComposition';
const ImageLibrary=lazy(()=>import('../toolkit/ImageLibrary'));
export default function StudioLibrary(){
 const {userId,projectId}=useToolkit();const [params,setParams]=useSearchParams();const view=['files','materials'].includes(params.get('library')||'')?params.get('library')!:'designs';
 function changeView(value:string){const next=new URLSearchParams(params);next.set('library',value);setParams(next,{replace:true});}
 const doc=usePrivateDocument(userId,projectId,'content-creator',()=>contentDocument(null,projectId),v=>contentDocument(v,projectId));
 if(!doc.loaded)return <p role="status">Abriendo tu biblioteca…</p>;
 if(doc.error)return <section role="alert"><p>{doc.error}</p><ButtonSecondary onClick={()=>void doc.reload()}>Reintentar</ButtonSecondary></section>;
 const visible=doc.data.drafts.filter(d=>!params.get('campaign')||d.creative?.campaignId===params.get('campaign'));
 return <section className="studio-library"><header><h2>{params.get('campaign')?'Las piezas de esta campaña.':'Todo lo que ya creaste.'}</h2>{params.get('campaign')&&<Link className="pe-action-link" to={`/creator-studio?project=${projectId}&tab=library`}>Ver toda mi biblioteca</Link>}<label className="studio-small-select">Ver<select aria-label="Archivos de la biblioteca" value={view} onChange={e=>changeView(e.target.value)}><option value="designs">Diseños</option><option value="files">Fotos del proyecto</option><option value="materials">Videos y portadas</option></select></label></header>{view==='materials'?<StudioMaterials/>:view==='files'?<Suspense fallback={<p role="status">Abriendo tus archivos…</p>}><ImageLibrary/></Suspense>:visible.length?<div className="studio-library-grid">{[...visible].reverse().map(draft=><Link key={draft.id} to={`/content-creator?project=${projectId}&design=${draft.id}&return=library&library=designs${params.get('campaign')?'&campaign='+encodeURIComponent(params.get('campaign')!):''}`} ><DesignThumbnail draft={draft} user={userId} project={projectId}/><strong>{draft.title||'Mi diseño'}</strong><small>{draft.usage==='reel-cover'?'Portada de reel':draft.format==='story'?'Historia':draft.format==='portrait'?'Publicación vertical':'Publicación cuadrada'} · Editar →</small></Link>)}</div>:<div className="studio-empty-state"><span aria-hidden="true">✦</span><h3>Tu primera creación tendrá un lugar aquí.</h3><p>No necesitas fotos ni una campaña para empezar.</p><Link className="pe-action-link" to={`/creator-studio?project=${projectId}&tab=create`}>Crear mi primer contenido →</Link></div>}</section>;
}
