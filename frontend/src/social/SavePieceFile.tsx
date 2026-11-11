import {linkedPieceQuery} from '../studio/navigation';
import './savedPieceFile.css';
import {useEffect,useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {ButtonPrimary} from '../components/ui/DesignSystem';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import {mediaReceipt,savePieceMedia,type MediaReceipt} from './savePieceMedia';
export default function SavePieceFile({file,user,project,piece,kind,disabled=false,onSaved,label}:{file:File;user:string;project:string;piece:string;kind:'video'|'image';disabled?:boolean;onSaved?:()=>void;label?:string}){
 const [params]=useSearchParams();
 const receipt=useRef<MediaReceipt|null>(null),lock=useRef(false),live=useRef(true);
 const [busy,setBusy]=useState(false),[saved,setSaved]=useState(false),[error,setError]=useState('');
 useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
 useUnsavedNavigation(busy);
 async function store(){if(lock.current||disabled)return;lock.current=true;setBusy(true);setError('');try{receipt.current??=mediaReceipt(user,project,file,kind);await savePieceMedia(user,project,piece,file,receipt.current);if(live.current){setSaved(true);onSaved?.();}}catch(e){if(live.current)setError((e as Error).message);}finally{lock.current=false;if(live.current)setBusy(false);}}
 return <div className="piece-file-save">{saved?<><p role="status">{kind==='video'?'Video':'Portada'} guardad{kind==='video'?'o':'a'} en esta misma pieza.</p><Link className="pe-action-link" to={'/creator-studio'+linkedPieceQuery(project,piece,params)+'&tab=profile'}>Volver a mi pieza →</Link></>:<ButtonPrimary disabled={disabled||busy} onClick={()=>void store()}>{busy?'Guardando en tu pieza…':label||(kind==='video'?'Guardar video en esta pieza':'Guardar portada en esta pieza')}</ButtonPrimary>}{error&&<p role="alert">{error}</p>}</div>;
}
