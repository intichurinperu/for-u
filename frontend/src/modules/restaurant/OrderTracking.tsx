import {useEffect,useState} from 'react';
import {Link,useParams,useLocation} from 'react-router-dom';
import {ButtonSecondary,Card} from '../../components/ui/DesignSystem';
import {trackOrder,modeLabels,orderStatuses,type RestaurantOrder} from './orders';
import {useAuth} from '../../contexts/AuthContext';
import CustomerRestaurantProfile from './CustomerRestaurantProfile';
import PaymentPanel from '../../payments/PaymentPanel';
import './restaurant.css';
export default function OrderTracking(){const {user}=useAuth();const {id=''}=useParams();const {hash}=useLocation();const token=/^#[a-f0-9]{64}$/.test(hash)?hash.slice(1):null;return <Tracking key={`${user?.id||'guest'}:${id}:${token}`} id={id} token={token}/>;}
function Tracking({id,token}:{id:string;token:string|null}){
 const [order,setOrder]=useState<RestaurantOrder|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let live=true;let sequence=0;async function refresh(){const current=++sequence;try{const o=await trackOrder(id,token);if(live&&current===sequence){setOrder(o);setError('');}}catch(e){if(live&&current===sequence)setError((e as Error).message);}finally{if(live&&current===sequence)setLoading(false);}}void refresh();const timer=setInterval(()=>{if(!document.hidden)void refresh();},15000);return()=>{live=false;clearInterval(timer);};},[id,token,attempt]);
 return <main className="restaurant-module restaurant-public restaurant-tracking"><h1>Mi pedido</h1>{loading?<p role="status">Consultando estado…</p>:<>
 {error&&<><p role="alert">{error}{order?' El estado visible es el último consultado.':''}</p><ButtonSecondary onClick={()=>setAttempt(x=>x+1)}>Reintentar seguimiento</ButtonSecondary>{!token&&!order&&<Link to={`/login?next=${encodeURIComponent(`/pedidos/${id}`)}`}>Iniciar sesión para consultar mi historial</Link>}</>}
 {order&&<><Card as="section"><h2>{order.business} · {orderStatuses[order.status]}</h2><p>Pedido {order.id.slice(0,8)} · {modeLabels[order.mode]}</p><ul>{order.items.map((l,i)=><li key={i}>{l.quantity} × {l.name} {l.variantName} {l.extraNames.join(', ')} · S/ {(l.totalCents/100).toFixed(2)}{l.note&&<p>{l.note}</p>}</li>)}</ul><p>Entrega S/ {(order.deliveryCents/100).toFixed(2)}</p><strong>Total S/ {(order.totalCents/100).toFixed(2)}</strong><PaymentPanel kind="restaurant" order={order.id} token={token} closed={['completed','cancelled'].includes(order.status)}/><ol>{order.history.map((h,i)=><li key={i}>{orderStatuses[h.status]} {h.at&&new Date(h.at).toLocaleString()}</li>)}</ol></Card><p>Este enlace permite consultar el pedido y asociarlo a un perfil. Compártelo solo con quien corresponda; no muestra dirección ni teléfono.</p><ButtonSecondary onClick={()=>{void navigator.clipboard.writeText(window.location.href).catch(()=>setError('No se pudo copiar. Copia la dirección del navegador.'));}}>Copiar enlace privado</ButtonSecondary><Link to={`/${order.slug}`}>Volver al menú</Link><CustomerRestaurantProfile slug={order.slug} claim={token?{id:order.id,token}:undefined}/></>}
 </>}</main>;
}
