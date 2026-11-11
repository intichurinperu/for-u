import {blankOffer,emptyProposal,parseProposal,validateOffer,type Offer,type Proposal} from '../proposal/model';
/** Update only the proposal-owned offer. Native references and all other data stay in their source. */
export function prepareProposalOfferSave(payload:unknown,offer:Offer,creating:boolean):Proposal{
 const current=payload===undefined?emptyProposal():parseProposal(payload);validateOffer(offer,true);
 const exists=current.offers.some(row=>row.id===offer.id);
 if(!creating&&!exists)throw new Error('Esta oferta ya no está en tu propuesta. Conserva tus cambios y revisa la versión guardada.');
 if(current.nativeIds.includes(offer.id))throw new Error('Esta oferta pertenece al catálogo original.');
 const next={...current,offers:exists?current.offers.map(row=>row.id===offer.id?{...row,...offer}:row):[...current.offers,offer]};
 if(next.nativeIds.length+next.offers.length>30)throw new Error('Tu página admite hasta 30 ofertas entre catálogo y propuesta. Conserva las existentes y revisa cuáles quieres incluir.');
 return parseProposal(next);
}
export {blankOffer};
