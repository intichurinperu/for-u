import {useEffect,useRef,useState} from 'react';
import {ButtonPrimary,ButtonSecondary,Input} from '../components/ui/DesignSystem';
import {paymentAction,PaymentError,paymentLabels,rememberPayment,safeCheckoutUrl,type PaymentAttempt,type PaymentKind,type PaymentMode,type PaymentReply} from './service';
import './payments.css';
export default function PaymentPanel({kind,order,token,closed=false}:{kind:PaymentKind;order:string;token:string|null;closed?:boolean}){return <Panel key={`${kind}:${order}:${token}`} kind={kind} order={order} token={token} closed={closed}/>;}
export function PaymentDisclosure({kind,order,closed}:{kind:PaymentKind;order:string;closed:boolean}){const [open,setOpen]=useState(false);return <details onToggle={e=>setOpen(e.currentTarget.open)}><summary>Consultar pago</summary>{open&&<PaymentPanel kind={kind} order={order} token={null} closed={closed}/>}</details>;}
function Panel({kind,order,token,closed}:{kind:PaymentKind;order:string;token:string|null;closed:boolean}){
 const key=`foru-payment-email:${kind}:${order}`;
 const [attempt,setAttempt]=useState<PaymentAttempt|null>(null),[policy,setPolicy]=useState<PaymentMode|null>(null),[email,setEmail]=useState(()=>{try{return sessionStorage.getItem(key)||'';}catch{return '';}}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');const lock=useRef(false);
 const apply=(r:PaymentReply)=>{setAttempt(r.attempt);if(r.policy)setPolicy(r.policy);if(r.attempt)rememberPayment(sessionStorage,r.attempt,{kind,order,token});if(r.error)throw new PaymentError(r.error,r);};
 async function status(){if(lock.current)return;lock.current=true;setBusy(true);try{const result=await paymentAction<PaymentReply>({action:'status',kind,order,token});apply(result);setError('');}catch(e){if(e instanceof PaymentError&&e.result?.attempt)setAttempt(e.result.attempt);setError((e as Error).message);}finally{lock.current=false;setBusy(false);setLoading(false);}}
 useEffect(()=>{let live=true;void paymentAction<PaymentReply>({action:'status',kind,order,token}).then(r=>{if(live){setAttempt(r.attempt);setPolicy(r.policy||null);setError('');}}).catch(e=>{if(live){if(e instanceof PaymentError&&e.result?.attempt)setAttempt(e.result.attempt);setError(e.message);}}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[kind,order,token]);
 async function start(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{
  // Storage must succeed before requesting a charge. A retry uses the stored server attempt.
  sessionStorage.setItem(key,email);
  const result=await paymentAction<PaymentReply>({action:'start',kind,order,token,email});apply(result);
  if(result.attempt){rememberPayment(sessionStorage,result.attempt,{kind,order,token});}
 }catch(e){if(e instanceof PaymentError&&e.result?.attempt)setAttempt(e.result.attempt);setError((e as Error).message);}finally{lock.current=false;setBusy(false);}}
 const terminal=attempt&&['approved','refunded','partially_refunded','charged_back'].includes(attempt.state);
 const url=!closed&&!error&&attempt?.state==='pending'?safeCheckoutUrl(attempt.checkoutUrl):null;
 return <section className="foru-payment" aria-label="Pago del pedido"><h2>Pago</h2>{loading?<p role="status">Consultando el pago…</p>:<>
 {attempt?<><strong>{paymentLabels[attempt.state]||'Estado por confirmar'}</strong><p>S/ {(attempt.totalCents/100).toFixed(2)} · {attempt.environment==='test'?'PRUEBA: dinero ficticio':'Mercado Pago'}</p>{attempt.lastCheckedAt&&<small>Última consulta: {new Date(attempt.lastCheckedAt).toLocaleString()}</small>}</>:policy==='coordinated'?<p>Por coordinar con el negocio. No hay un cobro online confirmado.</p>:policy&&<p>{policy==='required'?'Este pedido requiere pago online antes de comenzar.':'Puedes pagar online o coordinar directamente con el negocio.'}</p>}
 {error&&<p role="alert">{error}{attempt?' El estado visible es el último confirmado.':''}</p>}
 {policy&&policy!=='coordinated'&&!terminal&&!closed&&<><label>Email para el pago<Input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254}/></label><ButtonPrimary disabled={busy||!email.includes('@')} onClick={()=>void start()}>{busy?'Confirmando…':attempt?.state==='creating'||attempt?.state==='unknown'?'Recuperar el mismo intento':'Preparar pago seguro'}</ButtonPrimary></>}
 {url&&<a className="magic-button-primary" href={url} referrerPolicy="no-referrer">Continuar en Mercado Pago →</a>}
 <ButtonSecondary disabled={busy} onClick={()=>void status()}>Consultar / Reintentar</ButtonSecondary>
 <p className="foru-payment-note">El pago solo se confirma al consultarlo en Mercado Pago. Cancelar el pedido no devuelve dinero; las devoluciones las gestiona el negocio en Mercado Pago.</p>
 </>}</section>;
}
