import '../proposal/proposal.css';
import {useEffect,useRef,useState} from 'react';
import {useToolkit} from './ToolkitContext';
import {parseProposal,type Offer,type Proposal} from '../proposal/model';
import OfferComposer from '../proposal/OfferComposer';
import {blankOffer,prepareProposalOfferSave} from './proposalOfferSource';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
export default function ProposalOfferEditor({offerId,onSaved,onPending,onCancel}:{offerId?:string;onSaved:(proposal:Proposal,savedId:string)=>void;onPending:(pending:boolean)=>void;onCancel:()=>void}){
 const {docs}=useToolkit();const [empty]=useState(blankOffer);let original:Offer|undefined;
 try{original=offerId?parseProposal(docs['module-proposal']).offers.find(row=>row.id===offerId):empty;}catch(error){return <p role="alert">{(error as Error).message}</p>;}
 return original?<Session key={offerId||'new'} original={original} creating={!offerId} onSaved={onSaved} onPending={onPending} onCancel={onCancel}/>:<p role="alert">Esta oferta ya no está en tu propuesta. Conservamos la página; vuelve a elegir una oferta guardada.</p>;
}
function Session({original,creating,onSaved,onPending,onCancel}:{original:Offer;creating:boolean;onSaved:(proposal:Proposal,savedId:string)=>void;onPending:(pending:boolean)=>void;onCancel:()=>void}){
 const {docs,save,documentRevision}=useToolkit();const [offer,setOffer]=useState(original),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');const revision=useRef(documentRevision('module-proposal')),lock=useRef(false);
 useUnsavedNavigation(dirty||busy);useEffect(()=>{onPending(dirty||busy);return()=>onPending(false);},[dirty,busy,onPending]);
 async function store(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{
 if(documentRevision('module-proposal')!==revision.current)throw new Error('Tu propuesta cambió mientras editabas. Conserva tus cambios y revisa la versión guardada antes de reintentar.');
 const next=prepareProposalOfferSave(docs['module-proposal'],offer,creating);await save('module-proposal',next);revision.current=documentRevision('module-proposal');setDirty(false);onSaved(next,offer.id);
 }catch(error){setError((error as Error).message);}finally{lock.current=false;setBusy(false);}}
 return <div className="pe-proposal-offer"><OfferComposer offer={offer} busy={busy} onChange={value=>{if(lock.current)return;setOffer(value);setDirty(true);setError('');}} onApply={()=>void store()} onCancel={onCancel}/>{error&&<p role="alert">{error}</p>}</div>;
}
