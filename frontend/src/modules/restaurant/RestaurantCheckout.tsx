import RestaurantCheckoutSteps from './RestaurantCheckoutSteps';
import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {ButtonPrimary,ButtonSecondary} from '../../components/ui/DesignSystem';
import {createOrder,orderQuote,publicOrderConfig,orderRpc,trackingPath,trackingToken,type Fulfillment,type OrderConfig,type OrderQuote,type OrderRequest} from './orders';
import type {CartSelection} from './cart';
import {submitSavedOrder} from './orderSession';

export default function RestaurantCheckout({slug,selections,onPlaced}:{slug:string;selections:CartSelection[];onPlaced:()=>void}){
 const key=`foru-order-attempt:${slug}`;
 const [config,setConfig]=useState<OrderConfig|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const [fulfillment,setFulfillment]=useState<Fulfillment>({mode:'pickup'}),[name,setName]=useState(''),[phone,setPhone]=useState('');
 const [quote,setQuote]=useState<OrderQuote|null>(null),[busy,setBusy]=useState(false),[request,setRequest]=useState<OrderRequest|null>(()=>{try{const r=JSON.parse(sessionStorage.getItem(key)||'null');return r?.site_slug===slug&&typeof r?.tracking_token==='string'?r:null;}catch{return null;}});
 const [receipt,setReceipt]=useState<{id:string;token:string}|null>(()=>{try{return JSON.parse(sessionStorage.getItem(`foru-order-receipt:${slug}`)||'null');}catch{return null;}});
 const submitting=useRef(false);const quoteVersion=useRef(0);
 useEffect(()=>{let live=true;setLoading(true);publicOrderConfig(slug).then(c=>{if(live){setConfig(c);setError('');if(c?.modes.length)setFulfillment(f=>({...f,mode:c.modes.includes(f.mode)?f.mode:c.modes[0]}));}}).catch(e=>{if(live)setError(e.message);}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[slug,retry]);
 useEffect(()=>{quoteVersion.current++;setQuote(null);},[selections,fulfillment]);
 async function review(){if(submitting.current)return false;submitting.current=true;setBusy(true);setError('');setQuote(null);const version=quoteVersion.current;try{const next=await orderQuote(slug,selections,fulfillment);if(version!==quoteVersion.current){setError('Tu selección cambió mientras revisábamos el total. Revísala otra vez.');return false;}setQuote(next);return true;}catch(e){setError((e as Error).message);return false;}finally{submitting.current=false;setBusy(false);}}
 async function submit(){if(submitting.current||(!request&&!quote))return;submitting.current=true;setBusy(true);setError('');
  const attempt=request??{site_slug:slug,selections,fulfillment,customer_name:name,phone,request_id:crypto.randomUUID(),tracking_token:trackingToken(),expected_total:quote!.totalCents};
  // Persist before network I/O, retaining the exact request and token for uncertain results.
  try{setRequest(attempt);const saved=await submitSavedOrder(sessionStorage,attempt,createOrder);setReceipt(saved);setRequest(null);setQuote(null);onPlaced();}
  catch(e){setError(`${(e as Error).message} Reintentar enviará exactamente la misma solicitud, sin crear otra.`);}
  finally{submitting.current=false;setBusy(false);}
 }
 async function recover(){if(!request||submitting.current)return;submitting.current=true;setBusy(true);setError('');try{
  // Re-submit frozen request; server resolves receipt first, even if publication changed.
  const saved=await submitSavedOrder(sessionStorage,request,createOrder);setReceipt(saved);setRequest(null);onPlaced();
 }catch(e){setError((e as Error).message);}finally{submitting.current=false;setBusy(false);}}
 async function discardRejected(){if(!request||busy)return;setBusy(true);setError('');try{
  const found=await orderRpc<{id:string}|null>('restaurant_order_attempt',{request:request.request_id,tracking_token:request.tracking_token});
  if(found){const saved={id:found.id,token:request.tracking_token};sessionStorage.setItem(`foru-order-receipt:${slug}`,JSON.stringify(saved));setReceipt(saved);onPlaced();}
  sessionStorage.removeItem(key);setRequest(null);setQuote(null);
  if(!found)setError('El servidor confirma que no se registró este pedido. Corrige los datos y revisa el total.');
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 // Receipt remains visible when cart has been emptied or reloaded.
 return <section className="restaurant-checkout component-card" aria-label="Confirmar pedido interno">
  <h3>Pedido en FOR U</h3>{receipt&&<p><Link to={trackingPath(receipt.id,receipt.token)}>Ver seguimiento privado de mi último pedido</Link></p>}
  {request&&<><p role="status">Hay una confirmación pendiente en esta pestaña. Recuperaremos la misma solicitud antes de hacer otra.</p><ButtonPrimary disabled={busy} onClick={recover}>{busy?'Comprobando…':'Recuperar / reintentar mi pedido'}</ButtonPrimary><ButtonSecondary disabled={busy} onClick={discardRejected}>Comprobar resultado antes de corregir</ButtonSecondary></>}
  {loading?<p role="status">Consultando modalidades…</p>:error&&!config?<><p role="alert">{error}</p><ButtonSecondary onClick={()=>setRetry(v=>v+1)}>Reintentar modalidades</ButtonSecondary></>:!config?.enabled?<p>El negocio aún no recibe pedidos internos. Puedes consultar por WhatsApp.</p>:<>
   {!request&&selections.length>0&&<>
    <RestaurantCheckoutSteps config={config} fulfillment={fulfillment} name={name} phone={phone} quote={quote} busy={busy} onFulfillment={setFulfillment} onName={setName} onPhone={setPhone} onReview={review} onSubmit={()=>void submit()}/>

   </>}{error&&<p role="alert">{error}</p>}
  </>}
 </section>;
}
