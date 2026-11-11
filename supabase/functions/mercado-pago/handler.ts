import {base64url,checkoutUrl,providerPayload,publicAttempt,randomSecret,seal,sha,unseal,verifiedOrder,verifySignature,type Attempt,type Environment} from './core.ts';
type Dependencies={db:any;env:(key:string)=>string|undefined;fetch:typeof fetch};
class Failure extends Error {constructor(message:string,public status=502){super(message);}}
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
export function paymentHandler({db,env,fetch:remote}:Dependencies){
 const need=(name:string)=>{const v=env(name);if(!v)throw new Failure('Falta configuración de cobros: '+name,503);return v;};
 const rpc=async(name:string,args:Record<string,unknown>)=>{const {data,error}=await db.rpc(name,args);if(error)throw new Failure(['42501','P0001','PT409'].includes(error.code)?error.message:'No se pudo confirmar la operación. Conserva tu intento y reintenta.',error.code==='42501'?403:error.code==='PT409'?409:502);return data;};
 const query=async(q:any)=>{const {data,error}=await q;if(error)throw new Failure('No se pudo consultar o guardar la operación. Reintenta.');return data;};
 const api=async(path:string,token:string,options:RequestInit={})=>{
  const result=await remote('https://api.mercadopago.com'+path,{...options,headers:{...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(15000)});
  const data=await result.json().catch(()=>({}));if(!result.ok)throw new Failure(result.status===401?'La autorización venció o fue revocada. El negocio debe reconectar.':result.status===423||result.status===409?'El pago está siendo procesado. Consulta el estado antes de reintentar.':'Mercado Pago no confirmó la operación. Conservamos el intento; consulta o reintenta.',result.status===401?401:502);return data;
 };
 const requireOwner=async(project:string,user:string)=>{if(!uuid(project))throw new Failure('Proyecto inválido.',400);const p=await query(db.from('projects').select('id').eq('id',project).eq('user_id',user).maybeSingle());if(!p)throw new Failure('Proyecto no disponible.',403);};
 async function identity(req:Request){
  const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(!token||token===env('SUPABASE_ANON_KEY'))return null;
  // The frontend's public key can differ from the runtime's current anon key.
  // Classifying a public header ONLY removes identity; it never grants an actor.
  if(token===req.headers.get('apikey')){
   if(token.startsWith('sb_publishable_'))return null;
   try{const payload=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(payload.role==='anon')return null;}catch{/* A malformed user session is not accepted as identity. */}
  }
  const {data,error}=await db.auth.getUser(token);if(error||!data.user)throw new Failure('Sesión inválida. Inicia sesión nuevamente.',401);return data.user.id as string;
 }
 async function access(connection:any,refresh=false){
  let credentials=await unseal(connection.credential_cipher,need('MP_CREDENTIAL_KEY'));
  if(refresh||Date.parse(connection.expires_at)<Date.now()+120000){
   try{const tokens=await api('/oauth/token','',{method:'POST',body:JSON.stringify({grant_type:'refresh_token',client_id:need('MP_APP_ID'),client_secret:need('MP_CLIENT_SECRET'),refresh_token:credentials.refresh_token})});if(!tokens.access_token||!tokens.refresh_token||String(tokens.user_id)!==connection.merchant_id||!Number.isFinite(tokens.expires_in))throw new Failure('No se pudo renovar la autorización.');
    const cipher=await seal(tokens,need('MP_CREDENTIAL_KEY'));const rows=await query(db.from('payment_connections').update({credential_cipher:cipher,expires_at:new Date(Date.now()+tokens.expires_in*1000).toISOString(),verification_state:'authorized',last_error:null,checked_at:new Date().toISOString()}).eq('id',connection.id).eq('credential_cipher',connection.credential_cipher).select('id'));if(!rows.length){const updated=await query(db.from('payment_connections').select('*').eq('id',connection.id).single());return (await unseal(updated.credential_cipher,need('MP_CREDENTIAL_KEY'))).access_token;}credentials=tokens;
   }catch(e){if(e instanceof Failure&&e.status===401)await query(db.from('payment_connections').update({verification_state:'expired',last_error:'Renueva la autorización de Mercado Pago.'}).eq('id',connection.id).eq('credential_cipher',connection.credential_cipher));throw e;}
  }
  return credentials.access_token as string;
 }
 async function reconcile(a:Attempt){const c=await query(db.from('payment_connections').select('*').eq('id',a.connection_id).single());const token=await access(c);const data=await api('/v1/orders/'+encodeURIComponent(a.provider_id!),token);const v=verifiedOrder(data,a,need('MP_APP_ID'));return rpc('payment_apply',{attempt:a.id,provider:v.providerId,checkout:v.checkout,next_state:v.state,provider_time:v.providerTime,error_message:null});}
 async function recoverProvider(a:Attempt){
  const c=await query(db.from('payment_connections').select('*').eq('id',a.connection_id).single());const token=await access(c);
  const params=new URLSearchParams({external_reference:a.id,begin_date:new Date(Date.parse(a.created_at)-60000).toISOString(),end_date:new Date().toISOString(),limit:'10'});
  const data=await api('/v1/orders?'+params,token);
  if(!Array.isArray(data.data)||data.data.length>1)throw new Failure('No se pudo resolver un único intento de pago. No se iniciará otro.');
  if(!data.data.length)return a;
  const v=verifiedOrder(data.data[0],a,need('MP_APP_ID'));return rpc('payment_apply',{attempt:a.id,provider:v.providerId,checkout:v.checkout,next_state:v.state,provider_time:v.providerTime,error_message:null});
 }
 async function recordError(a:Attempt,error:unknown){await rpc('payment_apply',{attempt:a.id,provider:a.provider_id,checkout:null,next_state:'unknown',provider_time:null,error_message:error instanceof Failure?error.message:'No se pudo confirmar el pago. Consulta nuevamente antes de intentar otro.'});}
 return async(req:Request)=>{
  const origin=env('MP_SITE_ORIGIN');const allowed=[origin,'http://127.0.0.1:4173','http://localhost:4173'];const requestOrigin=req.headers.get('Origin');const cors={'Access-Control-Allow-Origin':allowed.includes(requestOrigin||'')?requestOrigin!:origin||'null','Vary':'Origin','Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
  const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
  try{
   const url=new URL(req.url);
   if(req.method==='OPTIONS')return new Response(null,{headers:cors});
   if(req.method==='GET'&&url.searchParams.has('code')||req.method==='GET'&&url.searchParams.has('error')){
    const state=url.searchParams.get('state');if(!state||!/^[a-f0-9]{64}$/.test(state))throw new Failure('Autorización inválida.',400);
    const s=await rpc('payment_oauth_claim',{state_hash:await sha(state)});
    let result='error';try{
     if(url.searchParams.has('error'))throw new Failure('Autorización cancelada.',400);
     const verifier=await unseal(s.verifier_cipher,need('MP_CREDENTIAL_KEY'));
     const data=await api('/oauth/token','',{method:'POST',body:JSON.stringify({grant_type:'authorization_code',client_id:need('MP_APP_ID'),client_secret:need('MP_CLIENT_SECRET'),code:url.searchParams.get('code'),redirect_uri:need('SUPABASE_URL')+'/functions/v1/mercado-pago',code_verifier:verifier})});
     const me=await api('/users/me',data.access_token);
     const isTest=Array.isArray(me.tags)&&me.tags.includes('test_user');
     if(String(me.id)!==String(data.user_id)||me.site_id!=='MPE'||(s.environment==='test')!==isTest||!data.refresh_token||!Number.isFinite(data.expires_in))throw new Failure('Autoriza una cuenta peruana del entorno seleccionado.',400);
     if(s.environment==='production'&&env('MP_ENABLE_PRODUCTION')!=='true')throw new Failure('Producción todavía no está habilitada.',403);
     await rpc('payment_oauth_finish',{project:s.project_id,owner:s.user_id,environment:s.environment,merchant:String(me.id),label:me.nickname||'Cuenta verificada',cipher:await seal(data,need('MP_CREDENTIAL_KEY')),expiry:new Date(Date.now()+data.expires_in*1000).toISOString()});result='returned';
    }catch{/* No credentials, codes or provider messages are returned to the browser. */}
    return new Response(null,{status:303,headers:{Location:need('MP_SITE_ORIGIN')+'/dashboard/settings?project='+s.project_id+'&mp='+result,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
   }
   if(req.method!=='POST')return reply({error:'Método no admitido.'},405);
   const raw=await req.text();if(raw.length>12000)return reply({error:'Solicitud demasiado grande.'},413);const body=JSON.parse(raw);
   if(url.searchParams.get('webhook')==='1'){
    const id=url.searchParams.get('data.id');if(!['order','orders_v2'].includes(body.type)||body.data?.id!==id||!await verifySignature(req.headers.get('x-signature'),req.headers.get('x-request-id'),id,need('MP_WEBHOOK_SECRET')))return reply({error:'Notificación no válida.'},401);
    let a=await query(db.from('payment_attempts').select('*').eq('provider_id',id).maybeSingle());
    // Recover a provider response lost before its ID was saved. The signed ID is fetched
    // with a candidate seller credential, then all authoritative fields are verified.
    if(!a){const connections=await query(db.from('payment_connections').select('*').eq('merchant_id',String(body.user_id)));for(const c of connections){try{const data=await api('/v1/orders/'+encodeURIComponent(id!),await access(c));if(!uuid(data.external_reference))continue;const candidate=await query(db.from('payment_attempts').select('*').eq('id',data.external_reference).eq('connection_id',c.id).maybeSingle());if(candidate){const v=verifiedOrder(data,candidate,need('MP_APP_ID'));a=await rpc('payment_apply',{attempt:candidate.id,provider:v.providerId,checkout:v.checkout,next_state:v.state,provider_time:v.providerTime,error_message:null});break;}}catch{/* Another binding may have an independent authorization. */}}}
    if(!a)return reply({error:'Aún no se pudo resolver la notificación. Reintenta.'},503);
    const key=await sha(id+':'+req.headers.get('x-request-id')+':'+req.headers.get('x-signature'));
    const previous=await query(db.from('payment_notifications').select('processed_at').eq('event_key',key).maybeSingle());if(previous?.processed_at)return reply({received:true});
    await query(db.from('payment_notifications').upsert({event_key:key,attempt_id:a.id},{onConflict:'event_key',ignoreDuplicates:true}));
    try{await reconcile(a);await query(db.from('payment_notifications').update({processed_at:new Date().toISOString()}).eq('event_key',key));return reply({received:true});}catch(e){await recordError(a,e);throw e;}
   }
   const user=await identity(req);
   if(['configure','authorize','verify','disconnect'].includes(body.action)){
    if(!user)throw new Failure('Inicia sesión.',401);await requireOwner(body.project,user);
    if(body.action==='configure')return reply({configured:Boolean(env('MP_APP_ID')&&env('MP_CLIENT_SECRET')&&env('MP_CREDENTIAL_KEY')&&env('MP_WEBHOOK_SECRET')&&env('MP_SITE_ORIGIN')),productionEnabled:env('MP_ENABLE_PRODUCTION')==='true'});
    if(body.action==='authorize'){
     need('MP_APP_ID');need('MP_CLIENT_SECRET');need('MP_WEBHOOK_SECRET');need('MP_SITE_ORIGIN');
     const environment:Environment=body.environment==='production'?'production':'test';if(environment==='production'&&env('MP_ENABLE_PRODUCTION')!=='true')throw new Failure('Primero completa las pruebas QA y la activación de producción.',403);
     const state=randomSecret(),verifier=randomSecret();const challenge=base64url(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
     await query(db.from('payment_oauth_sessions').insert({state_hash:await sha(state),project_id:body.project,user_id:user,environment,verifier_cipher:await seal(verifier,need('MP_CREDENTIAL_KEY')),expires_at:new Date(Date.now()+10*60000).toISOString()}));
     const auth=new URL('https://auth.mercadopago.com/authorization');for(const [k,v] of Object.entries({client_id:need('MP_APP_ID'),response_type:'code',platform_id:'mp',state,redirect_uri:need('SUPABASE_URL')+'/functions/v1/mercado-pago',code_challenge:challenge,code_challenge_method:'S256'}))auth.searchParams.set(k,v);return reply({authorizationUrl:auth.href});
    }
    if(!uuid(body.connection))throw new Failure('Cuenta inválida.',400);
    const c=await query(db.from('payment_connections').select('*').eq('id',body.connection).eq('project_id',body.project).eq('user_id',user).single());
    if(body.action==='disconnect'){await query(db.from('payment_connections').update({active:false,verification_state:'disconnected'}).eq('id',c.id).eq('user_id',user));return reply({disconnected:true});}
    if(!c.active)throw new Failure('Esta cuenta está desconectada. Vuelve a autorizar.',409);
    try{const me=await api('/users/me',await access(c));if(String(me.id)!==c.merchant_id||me.site_id!=='MPE')throw new Failure('La cuenta no coincide. Reconecta.',403);await query(db.from('payment_connections').update({verification_state:'authorized',checked_at:new Date().toISOString(),last_error:null}).eq('id',c.id));return reply({verified:true});}catch(e){await query(db.from('payment_connections').update({verification_state:e instanceof Failure&&e.status===401?'expired':'error',last_error:'No se pudo verificar. Reintenta o renueva la autorización.',checked_at:new Date().toISOString()}).eq('id',c.id));throw e;}
   }
   if(!['start','status'].includes(body.action)||!uuid(body.order)||!['restaurant','commerce'].includes(body.kind)||body.token!=null&&!/^[a-f0-9]{64}$/.test(body.token))throw new Failure('Solicitud inválida.',400);
   const context=await rpc('payment_context',{kind:body.kind,order_id:body.order,actor:user,tracking_token:body.token||null});
   let a=await query(db.from('payment_attempts').select('*').eq('order_kind',body.kind).eq('order_id',body.order).order('created_at',{ascending:false}).limit(1).maybeSingle());
   if(body.action==='status'){
    if(!a)return reply({attempt:null,policy:context.policy});
    try{a=a.provider_id?await reconcile(a):await recoverProvider(a);}catch(e){await recordError(a,e);a=await query(db.from('payment_attempts').select('*').eq('id',a.id).single());return reply({attempt:publicAttempt(a),policy:context.policy,error:a.last_error},502);}
    return reply({attempt:publicAttempt(a),policy:context.policy});
   }
   // Configure before beginning: no incomplete attempt is created for missing secrets.
   if(['cancelled','completed'].includes(context.status))throw new Failure('Este pedido está cerrado. Consulta su pago; cancelar no equivale a devolver dinero.',409);
   need('MP_APP_ID');need('MP_CREDENTIAL_KEY');need('MP_WEBHOOK_SECRET');providerPayload({id:'',order_id:body.order,total_cents:1,payer_email:''} as Attempt,need('MP_SITE_ORIGIN'));
   a=await rpc('payment_begin',{kind:body.kind,order_id:body.order,actor:user,tracking_token:body.token||null,payer_email:body.email});
   if(a.environment==='production'&&env('MP_ENABLE_PRODUCTION')!=='true')throw new Failure('Producción está desactivada.',403);
   if(!a.provider_id&&a.state!=='creating'){try{a=await recoverProvider(a);}catch(e){await recordError(a,e);throw e;}}
   if(a.provider_id){try{a=await reconcile(a);}catch(e){await recordError(a,e);throw e;}return reply({attempt:publicAttempt(a)});}
   try{
    const c=await query(db.from('payment_connections').select('*').eq('id',a.connection_id).single());if(!c.active)throw new Failure('El negocio desconectó su cuenta de cobro.',409);
    const payload=await rpc('payment_payload',{attempt:a.id,value:providerPayload(a,need('MP_SITE_ORIGIN'))});
    const data=await api('/v1/orders',await access(c),{method:'POST',headers:{'X-Idempotency-Key':a.idempotency_key},body:JSON.stringify(payload)});
    const v=verifiedOrder(data,a,need('MP_APP_ID'));if(!checkoutUrl(data.checkout_url))throw new Failure('Mercado Pago no devolvió un enlace de cobro válido.');
    a=await rpc('payment_apply',{attempt:a.id,provider:v.providerId,checkout:v.checkout,next_state:v.state,provider_time:v.providerTime,error_message:null});return reply({attempt:publicAttempt(a)});
   }catch(e){await recordError(a,e);throw e;}
  }catch(e){return reply({error:e instanceof Failure?e.message:'No se pudo confirmar la operación. Conservamos el intento; consulta o reintenta.'},e instanceof Failure?e.status:502);}
 };
}
