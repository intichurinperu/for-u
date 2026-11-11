import {useEffect,useState} from 'react';
import {Link,useLocation,useParams} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {ButtonPrimary,ButtonSecondary} from '../components/ui/DesignSystem';
import {commerceLabels,commerceTrack,type CommerceOrder} from './commerce';
import PaymentPanel from './PaymentPanel';
export default function CommerceTracking(){const {user}=useAuth();const {id=''}=useParams();const {hash}=useLocation();const token=/^#[a-f0-9]{64}$/.test(hash)?hash.slice(1):null;return <Tracking key={`${user?.id||'guest'}:${id}:${token}`} id={id} token={token}/>;}
function Tracking({id,token}:{id:string;token:string|null}){
 const [order,setOrder]=useState<CommerceOrder|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0),[accept,setAccept]=useState(false);
 useEffect(()=>{let live=true;let sequence=0;async function load(){const s=++sequence;try{const o=await commerceTrack(id,token);if(live&&s===sequence){setOrder(o);setError('');}}catch(e){if(live&&s===sequence)setError((e as Error).message);}finally{if(live&&s===sequence)setLoading(false);}}void load();const t=setInterval(()=>{if(!document.hidden&&!busy)void load();},15000);return()=>{live=false;clearInterval(t);};},[id,token,retry,busy]);
 async function acceptQuote(){if(!order?.quoteRevision||busy||!accept)return;setBusy(true);setError('');try{setOrder(await commerceTrack(id,token,order.quoteRevision));setAccept(false);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <main className="restaurant-module restaurant-public"><section className="foru-commerce"><h1>Mi compra</h1>{loading?<p role="status">Consultando pedido…</p>:order&&<><h2>{order.business}</h2><strong>{commerceLabels[order.status]||order.status}</strong><ul>{order.items.map((l,i)=><li key={i}>{l.quantity} × {l.name} {l.variantName} {l.extraNames.join(', ')} · {l.totalCents===null?'Por cotizar':`S/ ${(l.totalCents/100).toFixed(2)}`}<p>{l.conditions}</p>{l.note&&<p>Tu nota: {l.note}</p>}</li>)}</ul><strong>{order.totalCents===null?'Total pendiente de cotización':`Total S/ ${(order.totalCents/100).toFixed(2)}`}</strong>{order.conditions&&<p>{order.conditions}</p>}
 {order.quoteExpiresAt&&<p>Cotización válida hasta {new Date(order.quoteExpiresAt).toLocaleString()}</p>}
 {order.status==='awaiting_acceptance'&&<><label><input type="checkbox" checked={accept} onChange={e=>setAccept(e.target.checked)}/>Acepto el importe y las condiciones de esta versión.</label><ButtonPrimary disabled={busy||!accept||!!order.quoteExpiresAt&&Date.parse(order.quoteExpiresAt)<=Date.now()} onClick={()=>void acceptQuote()}>Aceptar cotización</ButtonPrimary></>}
 <p>El pago no confirma automáticamente fechas, cupos, entrega ni acceso a cursos. Revisa las condiciones acordadas con el negocio.</p>
 {!['awaiting_quote','awaiting_acceptance'].includes(order.status)&&order.totalCents!==null&&order.totalCents>0&&<PaymentPanel kind="commerce" order={id} token={token} closed={['completed','cancelled'].includes(order.status)}/>}
 {order.totalCents===0&&order.status==='received'&&<p>Oferta gratuita: no se solicitará un cobro.</p>}
 <ol>{order.history.map((h,i)=><li key={i}>{commerceLabels[h.status]||h.status} · {h.at&&new Date(h.at).toLocaleString()}</li>)}</ol>
 <Link to={order.sourceKind==='toolkit'?'/s/'+order.slug:'/negocio/'+order.slug}>Volver al negocio</Link><ButtonSecondary onClick={()=>void navigator.clipboard.writeText(window.location.href).catch(()=>setError('Copia la dirección del navegador.'))}>Copiar enlace privado</ButtonSecondary><p>Guarda este enlace. Permite consultar y aceptar tu cotización; compártelo solo con quien corresponda.</p>
 </>}{error&&<p role="alert">{error}{order?' Conservamos el último estado consultado.':''}</p>}<ButtonSecondary disabled={busy} onClick={()=>setRetry(x=>x+1)}>Actualizar / Reintentar</ButtonSecondary></section></main>;
}
