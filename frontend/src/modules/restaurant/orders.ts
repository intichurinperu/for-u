import { supabase } from '../../services/supabase';
import type { CartSelection } from './cart';
export type Fulfillment = { mode: 'table'|'pickup'|'delivery'; table?: string; zoneId?: string; zoneName?: string; address?: string; note?: string };
export type OrderConfig = { enabled: boolean; modes: Fulfillment['mode'][]; tables: string[]; zones: {id:string;name:string;feeCents:number}[] };
export type OrderItem = { dishId:string; name:string; variantName?:string; extraNames:string[]; quantity:number; note:string; unitCents:number; totalCents:number };
export type OrderQuote = {items:OrderItem[];subtotalCents:number;deliveryCents:number;totalCents:number;currency:'PEN';fulfillment:Fulfillment;business:string};
export type RestaurantOrder = Omit<OrderQuote,'fulfillment'> & {id:string;status:string;mode:Fulfillment['mode'];revision:string;createdAt:string;updatedAt:string;slug:string;history:{status:string;at?:string}[];customerName?:string;phone?:string;fulfillment?:Fulfillment;payment:string};
export type OrderRequest = {site_slug:string;selections:CartSelection[];fulfillment:Fulfillment;customer_name:string;phone:string;request_id:string;tracking_token:string;expected_total:number};
export const orderStatuses:Record<string,string>={received:'Recibido',accepted:'Aceptado',preparing:'En preparación',ready:'Listo',out_for_delivery:'En camino',completed:'Completado',cancelled:'Cancelado'};
export const modeLabels:Record<Fulfillment['mode'],string>={table:'Mesa',pickup:'Recojo',delivery:'Delivery'};
export function nextOrderStates(order:Pick<RestaurantOrder,'status'|'mode'>) {
 switch(order.status){case 'received':return ['accepted','cancelled'];case 'accepted':return ['preparing','cancelled'];case 'preparing':return ['ready','cancelled'];case 'ready':return [order.mode==='delivery'?'out_for_delivery':'completed','cancelled'];case 'out_for_delivery':return ['completed','cancelled'];default:return [];}
}
export function trackingToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');}
export function trackingPath(id:string,token?:string){return `/pedidos/${encodeURIComponent(id)}${token ? `#${token}`:''}`;}
export async function orderRpc<T>(name:string,args:Record<string,unknown>):Promise<T>{
 if(!supabase)throw new Error('Supabase no está configurado.');
 const {data,error}=await supabase.rpc(name,args);
 if(error)throw new Error(error.code==='PT409'? error.message : ['42501','P0001'].includes(error.code)? error.message : 'No se pudo confirmar la operación. Conservamos tu información; consulta o reintenta.');
 return data as T;
}
export const publicOrderConfig=(slug:string)=>orderRpc<OrderConfig|null>('restaurant_order_public_config',{site_slug:slug});
export const orderQuote=(slug:string,selections:CartSelection[],fulfillment:Fulfillment)=>orderRpc<OrderQuote>('restaurant_order_quote',{site_slug:slug,selections,fulfillment});
export const createOrder=(request:OrderRequest)=>orderRpc<RestaurantOrder>('restaurant_order_create',request);
export const trackOrder=(id:string,token:string|null)=>orderRpc<RestaurantOrder>('restaurant_order_track',{order_id:id,tracking_token:token});
