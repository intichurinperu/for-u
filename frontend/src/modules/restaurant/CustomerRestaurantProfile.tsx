import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import {supabase} from '../../services/supabase';
import {ButtonPrimary,ButtonSecondary,Input} from '../../components/ui/DesignSystem';
import {orderRpc,orderStatuses,trackingPath,type RestaurantOrder} from './orders';
import type {Dish} from './model';
type Profile={favorites:string[];orders:RestaurantOrder[]};
type ProfileProps={slug:string;dishes?:Dish[];claim?:{id:string;token:string}};
export default function CustomerRestaurantProfile(props:ProfileProps){const {user}=useAuth();return <CustomerSession key={`${user?.id||'guest'}:${props.slug}`} {...props}/>;}
function CustomerSession({slug,dishes=[],claim}:ProfileProps){
 const {user}=useAuth();const [open,setOpen]=useState(false),[profile,setProfile]=useState<Profile|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[attempt,setAttempt]=useState(0);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[register,setRegister]=useState(false);
 useEffect(()=>{if(!user||!open){setProfile(null);return;}let live=true;setProfile(null);setError('');orderRpc<Profile>('restaurant_order_customer',{site_slug:slug}).then(p=>{if(live)setProfile(p);}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[user?.id,slug,open,attempt]);
 async function auth(){if(!supabase||busy)return;setBusy(true);setError('');try{const result=register?await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}/${slug}`,data:{account_role:'customer'}}}):await supabase.auth.signInWithPassword({email:email.trim(),password});if(result.error)throw result.error;setPassword('');setNotice(register&&!result.data.session?'Revisa tu correo para confirmar la cuenta. Puedes seguir comprando como invitado.':'Sesión iniciada. Tu perfil es opcional.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function change(args:Record<string,unknown>){setBusy(true);setError('');try{setProfile(await orderRpc('restaurant_order_customer',{site_slug:slug,...args}));setNotice('Perfil guardado.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <section id="perfil" className="restaurant-customer component-card"><ButtonSecondary onClick={()=>setOpen(v=>!v)} aria-expanded={open}>Mi perfil opcional · favoritos e historial</ButtonSecondary>
 {open&&<><p>Planificar o comprar no requiere cuenta. Favoritos e historial solo son visibles en tu sesión.</p>{error&&<><p role="alert">{error}</p>{user&&<ButtonSecondary onClick={()=>setAttempt(x=>x+1)}>Reintentar perfil</ButtonSecondary>}</>}{notice&&<p role="status">{notice}</p>}
 {!user?<form onSubmit={e=>{e.preventDefault();void auth();}}><label>Email<Input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Contraseña<Input type="password" autoComplete={register?'new-password':'current-password'} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><ButtonPrimary disabled={busy}>{register?'Crear perfil de cliente':'Entrar a mi perfil'}</ButtonPrimary><ButtonSecondary type="button" onClick={()=>setRegister(v=>!v)}>{register?'Ya tengo cuenta':'Crear cuenta opcional'}</ButtonSecondary></form>:!profile?<p role="status">{error?'Perfil no disponible.':'Cargando perfil…'}</p>:<>
 {claim&&!profile.orders.some(o=>o.id===claim.id)&&<ButtonSecondary disabled={busy} onClick={()=>change({claim_order:claim.id,tracking_token:claim.token})}>Guardar este pedido en mi historial</ButtonSecondary>}
 <h3>Favoritos de este negocio</h3>{!dishes.length&&profile.favorites.length>0&&<Link to={`/${slug}#perfil`}>Ver mis favoritos en el menú</Link>}{dishes.filter(d=>d.available).map(d=><ButtonSecondary disabled={busy} key={d.id} aria-pressed={profile.favorites.includes(d.id)} onClick={()=>change({favorite_dish:d.id,favorite:!profile.favorites.includes(d.id)})}>{profile.favorites.includes(d.id)?'♥':'♡'} {d.name}</ButtonSecondary>)}{!profile.favorites.length&&<p>Aún no tienes favoritos.</p>}
 <h3>Mi historial</h3>{profile.orders.map(o=><p key={o.id}><Link to={trackingPath(o.id)}>{orderStatuses[o.status]} · {o.id.slice(0,8)} · S/ {(o.totalCents/100).toFixed(2)}</Link></p>)}{!profile.orders.length&&<p>No hay pedidos asociados a tu cuenta en este negocio.</p>}
 </>}</>}
 </section>;
}
