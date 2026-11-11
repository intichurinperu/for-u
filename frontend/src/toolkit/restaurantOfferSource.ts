import {saveDish,type Dish,type RestaurantData} from '../modules/restaurant/model';
import {parseProposal,proposalOffers,type Proposal} from '../proposal/model';
/** Link by ID only: a mixed offer page keeps services and resolves product prices from its catalog. */
export function prepareRestaurantOfferSave(data:RestaurantData,dish:Dish,proposalPayload:unknown,link:boolean):{menu:RestaurantData;proposal?:Proposal}{
 const menu=saveDish(data,dish);if(!link)return {menu};
 const current=parseProposal(proposalPayload),proposal={...current,nativeIds:[...new Set([...current.nativeIds,'restaurant:'+dish.id])]};
 proposalOffers(proposal,'restaurant',menu);
 return {menu,proposal};
}
