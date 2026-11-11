import type {Proposal} from '../proposal/model';
import RestaurantOfferEditor from './RestaurantOfferEditor';
import type {RestaurantData} from '../modules/restaurant/model';
/** Existing products are selected directly on the page; this entry creates a new one. */
export default function RestaurantCatalogEditor({onSaved,onPending,linkToProposal=false}:{linkToProposal?:boolean;onSaved:(data:RestaurantData,proposal?:Proposal,savedId?:string)=>void;onPending:(pending:boolean)=>void}){
 return <RestaurantOfferEditor linkToProposal={linkToProposal} onSaved={onSaved} onPending={onPending}/>;
}
