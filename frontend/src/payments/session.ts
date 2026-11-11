import type {PaymentAttempt} from './service';
import type {Selection,CommerceRequest,CommerceOrder} from './commerce';
type PaymentKind='restaurant'|'commerce';
export function safeCheckoutUrl(value:string|null){try{const u=new URL(value||'');return u.protocol==='https:'&&['www.mercadopago.com.pe','mercadopago.com.pe'].includes(u.hostname)&&u.pathname.startsWith('/checkout/')&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export type PaymentReturn={kind:PaymentKind;order:string;token:string|null};
export function rememberPayment(storage:Storage,attempt:PaymentAttempt,context:PaymentReturn){storage.setItem('foru-payment-return:'+attempt.id,JSON.stringify(context));}
export function readPaymentReturn(storage:Storage,attempt:string):PaymentReturn|null{try{const c=JSON.parse(storage.getItem('foru-payment-return:'+attempt)||'null');return c&&['restaurant','commerce'].includes(c.kind)&&/^[a-f0-9-]{36}$/i.test(c.order)&&(c.token===null||/^[a-f0-9]{64}$/.test(c.token))?c:null;}catch{return null;}}

export function readCommerceCart(storage:Storage,key:string):Selection[]{try{const v=JSON.parse(storage.getItem(key)||'[]');if(!Array.isArray(v)||v.length>30)return [];return v.filter(x=>x&&typeof x.id==='string'&&typeof x.offerId==='string'&&Number.isInteger(x.quantity)&&x.quantity>0&&x.quantity<=99&&Array.isArray(x.extraIds)&&x.extraIds.every((e:unknown)=>typeof e==='string')&&typeof x.note==='string'&&x.note.length<=300&&(x.variantId==null||typeof x.variantId==='string')).map(x=>({id:x.id,offerId:x.offerId,quantity:x.quantity,variantId:x.variantId||null,extraIds:x.extraIds,note:x.note}));}catch{return [];}}
export async function submitCommerce(storage:Storage,key:string,request:CommerceRequest,create:(request:CommerceRequest)=>Promise<CommerceOrder>){storage.setItem(key,JSON.stringify(request));const receipt=await create(request);storage.setItem(key+':receipt',JSON.stringify({id:receipt.id,token:request.tracking_token}));storage.removeItem(key);return receipt;}
