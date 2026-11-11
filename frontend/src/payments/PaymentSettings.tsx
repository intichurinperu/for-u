import {useEffect,useState} from 'react';
import {ButtonPrimary,ButtonSecondary} from '../components/ui/DesignSystem';
import {orderRpc} from '../modules/restaurant/orders';
import {paymentAction,type PaymentMode} from './service';
import {useUnsavedNavigation} from '../lib/useUnsavedNavigation';
import './payments.css';
type Configuration={mode:PaymentMode;environment:'test'|'production';revision:string|null;connections:{id:string;environment:'test'|'production';accountLabel:string;state:string;active:boolean;checkedAt:string;error:string|null}[]};
export default function PaymentSettings({project}:{project:string}){return <Settings key={project} project={project}/>;}
function Settings({project}:{project:string}){
 const [saved,setSaved]=useState<Configuration|null>(null),[mode,setMode]=useState<PaymentMode>('coordinated'),[environment,setEnvironment]=useState<'test'|'production'>('test'),[configured,setConfigured]=useState(false),[production,setProduction]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[conflict,setConflict]=useState(false);
 async function load(){setLoading(true);try{const c=await orderRpc<Configuration>('payment_config',{project});setSaved(c);setMode(c.mode);setEnvironment(c.environment);setConflict(false);setError('');try{const setup=await paymentAction<{configured:boolean;productionEnabled:boolean}>({action:'configure',project});setConfigured(setup.configured);setProduction(setup.productionEnabled);}catch(e){setConfigured(false);setError((e as Error).message);}}catch(e){setError((e as Error).message);}finally{setLoading(false);}}
 useEffect(()=>{void load();},[project]);
 const dirty=!!saved&&(mode!==saved.mode||environment!==saved.environment);
 useUnsavedNavigation(dirty);
 async function action(name:string,connection?:string){if(busy)return;setBusy(true);setError('');setNotice('');try{const r=await paymentAction<{authorizationUrl?:string}>({action:name,project,environment,connection});if(r.authorizationUrl){const u=new URL(r.authorizationUrl);if(u.origin!=='https://auth.mercadopago.com')throw new Error('Dirección de autorización inválida.');window.location.assign(u.href);}else{await load();setNotice(name==='verify'?'Cuenta verificada en Mercado Pago.':'Desconectada para nuevos cobros; se conserva el historial.');}}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function save(){if(busy||conflict)return;setBusy(true);setError('');setNotice('');try{const c=await orderRpc<Configuration>('payment_config',{project,value:{mode,environment},expected:saved?.revision||null});setSaved(c);setNotice('Configuración guardada. Se aplicará a los nuevos pedidos.');}catch(e){const message=(e as Error).message;setError(message);if(message.includes('cambió'))setConflict(true);}finally{setBusy(false);}}
 const active=saved?.connections.find(c=>c.active&&c.environment===environment);
 return <section className="foru-payment"><h2>Cobros · Mercado Pago</h2><p>Cada proyecto cobra en su cuenta autorizada. No compartas claves en el chat.</p>{loading?<p role="status">Consultando configuración…</p>:<>
 {!configured&&<p role="status">Configuración pendiente en servidor. Primero crea la aplicación FOR U y configura sus secretos; todavía no se pueden iniciar pagos.</p>}
 <label>Entorno<select value={environment} disabled={busy} onChange={e=>setEnvironment(e.target.value as typeof environment)}><option value="test">Prueba · dinero ficticio</option><option value="production" disabled={!production}>Producción {!production?'· pendiente de autorización':''}</option></select></label>
 <p>{!saved?'No se pudo consultar la cuenta de cobro.':active?`${active.accountLabel} · ${active.state==='authorized'?'Autorizada':active.state==='expired'?'Autorización vencida':'Verificación con error'}`:'Sin cuenta conectada en este entorno.'}</p>
 {active?.checkedAt&&<small>Última comprobación: {new Date(active.checkedAt).toLocaleString()}</small>}{active?.error&&<p role="alert">{active.error}</p>}
 <ButtonSecondary disabled={busy||!configured||dirty} onClick={()=>void action('authorize')}>Autorizar esta cuenta para este proyecto</ButtonSecondary>
 {active&&<><ButtonSecondary disabled={busy||dirty} onClick={()=>void action('verify',active.id)}>Comprobar / renovar autorización</ButtonSecondary><details><summary>Desconectar cobros</summary><p>Bloquea nuevos intentos. Un checkout que ya se creó podría recibir un pago; consultarás su estado y gestionarás devoluciones en Mercado Pago.</p><ButtonSecondary disabled={busy||dirty} onClick={()=>void action('disconnect',active.id)}>Confirmar desconexión</ButtonSecondary></details></>}
 <label>Cómo paga el cliente<select value={mode} disabled={busy||!saved} onChange={e=>setMode(e.target.value as PaymentMode)}><option value="coordinated">Coordinar con el negocio</option><option value="optional">Mercado Pago opcional</option><option value="required">Pago online obligatorio</option></select></label>
 {dirty&&<p role="status">Cambios pendientes. Guarda antes de autorizar o verificar otra cuenta.</p>}
 <ButtonPrimary disabled={busy||!saved||!dirty||conflict} onClick={()=>void save()}>{busy?'Guardando…':'Guardar modalidad de cobro'}</ButtonPrimary>
 {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <details><summary>{dirty?'Recuperar configuración y descartar cambios pendientes':'Reintentar consulta'}</summary>{dirty&&<p>Esto recuperará la versión del servidor. Copia tus cambios antes si quieres conservarlos.</p>}<ButtonSecondary disabled={busy} onClick={()=>void load()}>Recuperar versión guardada</ButtonSecondary></details>
 <p className="foru-payment-note">Sin una compra QA verificada, la integración no está comprobada de principio a fin. Devoluciones desde Mercado Pago; cancelar pedidos no devuelve dinero.</p>
 </>}</section>;
}
