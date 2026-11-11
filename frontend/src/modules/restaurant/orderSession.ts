import type {CartSelection} from './cart';
import type {OrderRequest,RestaurantOrder} from './orders';
type SessionStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export function readSavedCart(raw:string|null):CartSelection[]{
 if(!raw)return [];const data:unknown=JSON.parse(raw);
 if(!Array.isArray(data)||data.length>100||data.some(l=>!l||typeof l.id!=='string'||typeof l.dishId!=='string'||!Number.isInteger(l.quantity)||l.quantity<1||l.quantity>99||typeof l.note!=='string'||l.note.length>300||!Array.isArray(l.extraIds)||l.extraIds.length>20||l.extraIds.some((id:unknown)=>typeof id!=='string')||(l.variantId!==undefined&&typeof l.variantId!=='string')))throw new Error('El carrito guardado necesita revisión.');
 return data.map(({id,dishId,quantity,variantId,extraIds,note})=>({id,dishId,quantity,variantId,extraIds,note}));
}
export async function submitSavedOrder(storage:SessionStorage,request:OrderRequest,send:(r:OrderRequest)=>Promise<RestaurantOrder>){
 const key=`foru-order-attempt:${request.site_slug}`;
 // Durable before network: no new key on retry, even if the previous response was lost.
 storage.setItem(key,JSON.stringify(request));
 const order=await send(request);
 const receipt={id:order.id,token:request.tracking_token};
 storage.setItem(`foru-order-receipt:${request.site_slug}`,JSON.stringify(receipt));
 storage.removeItem(key);
 return receipt;
}
