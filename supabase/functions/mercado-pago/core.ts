export type Environment = 'test'|'production';
export type Attempt = {id:string;order_id:string;order_kind:'restaurant'|'commerce';project_id:string;connection_id:string;merchant_id:string;environment:Environment;total_cents:number;currency:string;idempotency_key:string;provider_id:string|null;checkout_url:string|null;state:string;payer_email:string;last_error?:string;created_at:string};
const enc=new TextEncoder();
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export async function sha(value:string){return hex(await crypto.subtle.digest('SHA-256',enc.encode(value)));}
export function randomSecret(){return hex(crypto.getRandomValues(new Uint8Array(32)).buffer);}
export function base64url(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function encryptionKey(value:string){if(!/^[a-f0-9]{64}$/i.test(value))throw new Error('Falta MP_CREDENTIAL_KEY de 32 bytes.');return crypto.subtle.importKey('raw',new Uint8Array(value.match(/../g)!.map(v=>parseInt(v,16))),{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function seal(value:unknown,key:string){const iv=crypto.getRandomValues(new Uint8Array(12));const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},await encryptionKey(key),enc.encode(JSON.stringify(value)));return 'v1.'+base64url(iv)+'.'+base64url(new Uint8Array(cipher));}
export async function unseal(value:string,key:string){const [version,nonce,cipher]=value.split('.');if(version!=='v1'||!nonce||!cipher)throw new Error('Formato de autorización no reconocido.');const decode=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(nonce)},await encryptionKey(key),decode(cipher));return JSON.parse(new TextDecoder().decode(clear));}
export async function verifySignature(signature:string|null,requestId:string|null,dataId:string|null,secret:string){
 if(!secret||!signature||!requestId||!dataId||requestId.length>200||!/^ORD[A-Z0-9]+$/i.test(dataId))return false;
 const parts=signature.split(',').map(p=>p.trim().split('='));const ts=parts.find(p=>p[0]==='ts')?.[1],v=parts.find(p=>p[0]==='v1')?.[1];
 if(!ts||!/^\d{10,13}$/.test(ts)||!v||!/^[a-f0-9]{64}$/.test(v))return false;
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 return crypto.subtle.verify('HMAC',key,new Uint8Array(v.match(/../g)!.map(x=>parseInt(x,16))),enc.encode(`id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`));
}
export function cents(value:unknown){if(typeof value!=='string'||!/^\d{1,12}(\.\d{1,2})?$/.test(value))throw new Error('Importe del proveedor inválido.');const [whole,fraction='']=value.split('.');const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));if(!Number.isSafeInteger(n))throw new Error('Importe fuera de rango.');return n;}
export function checkoutUrl(value:unknown){if(typeof value!=='string')return null;try{const u=new URL(value);return u.protocol==='https:'&&['www.mercadopago.com.pe','mercadopago.com.pe'].includes(u.hostname)&&u.pathname.startsWith('/checkout/')&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export function verifiedOrder(data:Record<string,any>,attempt:Attempt,appId:string){
 if(typeof data.id!=='string'||!/^ORD[A-Z0-9]+$/.test(data.id)||data.external_reference!==attempt.id||String(data.user_id)!==attempt.merchant_id||data.currency!=='PEN'||data.country_code!=='PER'||cents(data.total_amount)!==Number(attempt.total_cents)||String(data.integration_data?.application_id)!==appId||(attempt.provider_id&&data.id!==attempt.provider_id)||(data.id.startsWith('ORDTST')!==(attempt.environment==='test')))throw new Error('El proveedor no confirmó destinatario, referencia, importe o entorno.');
 const date=data.last_updated_date;if(typeof date!=='string'||!Number.isFinite(Date.parse(date)))throw new Error('Falta una revisión válida del pago.');
 let state='unknown';
 if(data.status==='charged_back'||data.status_detail==='charged_back'||data.transactions?.payments?.some((p:any)=>p.status==='charged_back'))state='charged_back';
 else if(data.status==='refunded'||data.status==='processed'&&data.status_detail==='refunded')state='refunded';
 else if(data.status==='partially_refunded'||data.status==='processed'&&data.status_detail==='partially_refunded')state='partially_refunded';
 else if(data.status==='processed'&&data.status_detail==='accredited'&&cents(data.total_paid_amount)===Number(attempt.total_cents))state='approved';
 else if(data.status==='failed')state='rejected';
 else if(data.status==='canceled'||data.status==='cancelled')state='cancelled';
 else if(data.status==='expired')state='expired';
 else if(['created','processing','action_required'].includes(data.status))state='pending';
 return {state,providerTime:date,providerId:data.id,checkout:checkoutUrl(data.checkout_url)};
}
export function providerPayload(a:Attempt,origin:string){
 const u=new URL(origin);if(u.protocol!=='https:'||u.pathname!=='/'||u.search||u.hash)throw new Error('Configura MP_SITE_ORIGIN con el origen HTTPS de FOR U.');
 const returnUrl=u.origin+'/cobros/retorno?attempt='+a.id;
 return {type:'online',processing_mode:'manual',capture_mode:'automatic_async',total_amount:(Number(a.total_cents)/100).toFixed(2),external_reference:a.id,expiration_time:'PT30M',payer:{email:a.payer_email},items:[{title:'Pedido '+a.order_id.slice(0,8),quantity:1,unit_price:(Number(a.total_cents)/100).toFixed(2),unit_measure:'unit'}],config:{online:{success_url:returnUrl,failure_url:returnUrl,pending_url:returnUrl,auto_return:'approved',retries:{allowed:false}}}};
}
export function publicAttempt(a:Attempt&{last_checked_at?:string}){return {id:a.id,state:a.state,environment:a.environment,totalCents:Number(a.total_cents),currency:a.currency,checkoutUrl:checkoutUrl(a.checkout_url),lastCheckedAt:a.last_checked_at,error:a.last_error||null};}
