import {useEffect,useRef,useState} from 'react';
import {ButtonPrimary,ButtonSecondary,Input} from '../../components/ui/DesignSystem';
import {modeLabels,type Fulfillment,type OrderConfig,type OrderQuote} from './orders';
import {checkoutSteps,checkoutStepError,type CheckoutStep} from './checkoutSteps';
import './checkoutSteps.css';
type Props={config:OrderConfig;fulfillment:Fulfillment;name:string;phone:string;quote:OrderQuote|null;busy:boolean;onFulfillment:(value:Fulfillment)=>void;onName:(value:string)=>void;onPhone:(value:string)=>void;onReview:()=>Promise<boolean>;onSubmit:()=>void};
const questions:Record<CheckoutStep,string>={mode:'¿Cómo quieres disfrutar tu pedido?',table:'¿En qué mesa estás?',zone:'¿A qué zona te lo llevamos?',address:'¿Dónde te lo entregamos?',name:'¿A nombre de quién lo preparamos?',phone:'¿A qué número podemos llamarte?',note:'¿Quieres dejarnos alguna indicación?',review:'Así queda tu pedido.'};
const hints={table:'Para comer aquí',pickup:'Paso a recogerlo',delivery:'Lo recibo en mi dirección'};
export default function RestaurantCheckoutSteps({config,fulfillment,name,phone,quote,busy,onFulfillment,onName,onPhone,onReview,onSubmit}:Props){
 const [step,setStep]=useState<CheckoutStep>('mode'),[error,setError]=useState('');const heading=useRef<HTMLHeadingElement>(null);const sequence=checkoutSteps(fulfillment.mode);const index=sequence.indexOf(step);
 useEffect(()=>{heading.current?.focus({preventScroll:true});setError('');},[step]);
 // A changed cart invalidates the server quote. Return to review rather than confirming an old total.
 useEffect(()=>{if(step==='review'&&!quote)setStep('note');},[quote,step]);
 async function next(){const problem=checkoutStepError(step,config,fulfillment,name,phone);if(problem){setError(problem);return;}setError('');if(step==='note'){if(await onReview())setStep('review');}else setStep(sequence[index+1]);}
 const choices=(items:{id:string;label:string;hint?:string}[],selected:string|undefined,choose:(id:string)=>void)=><div className="checkout-step-choices">{items.map(item=><button type="button" key={item.id} aria-pressed={selected===item.id} onClick={()=>{choose(item.id);setError('');}}><span><strong>{item.label}</strong>{item.hint&&<small>{item.hint}</small>}</span><span aria-hidden="true">{selected===item.id?'✓':'＋'}</span></button>)}</div>;
 return <div className="checkout-step-play"><small className="checkout-step-count">TU PEDIDO · {index+1}/{sequence.length}</small><h3 ref={heading} tabIndex={-1}>{questions[step]}</h3><fieldset disabled={busy}>
 {step==='mode'&&choices(config.modes.map(mode=>({id:mode,label:modeLabels[mode],hint:hints[mode]})),fulfillment.mode,mode=>onFulfillment({mode:mode as Fulfillment['mode'],note:fulfillment.note}))}
 {step==='table'&&choices(config.tables.map(table=>({id:table,label:table})),fulfillment.table,table=>onFulfillment({...fulfillment,table}))}
 {step==='zone'&&choices(config.zones.map(zone=>({id:zone.id,label:zone.name,hint:`Entrega S/ ${(zone.feeCents/100).toFixed(2)}`})),fulfillment.zoneId,zoneId=>onFulfillment({...fulfillment,zoneId}))}
 {step==='address'&&<Input label="Dirección de entrega" autoComplete="street-address" maxLength={500} value={fulfillment.address||''} onChange={event=>onFulfillment({...fulfillment,address:event.target.value})}/>}
 {step==='name'&&<Input label="Tu nombre" autoComplete="name" maxLength={100} value={name} onChange={event=>onName(event.target.value)}/>}
 {step==='phone'&&<><p>Solo para coordinar este pedido.</p><Input label="Teléfono" type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={event=>onPhone(event.target.value)}/></>}
 {step==='note'&&<><p>Es opcional. Puedes continuar sin escribir nada.</p><label>Nota para el negocio<textarea maxLength={500} value={fulfillment.note||''} onChange={event=>onFulfillment({...fulfillment,note:event.target.value})}/></label></>}
 {step==='review'&&quote&&<><div className="checkout-step-summary"><strong>{modeLabels[fulfillment.mode]}</strong>{fulfillment.mode==='table'&&<p>{fulfillment.table}</p>}{fulfillment.mode==='delivery'&&<p>{config.zones.find(zone=>zone.id===fulfillment.zoneId)?.name} · {fulfillment.address}</p>}<p>{name} · {phone}</p>{fulfillment.note&&<p>{fulfillment.note}</p>}<ul>{quote.items.map((item,index)=><li key={index}>{item.quantity} × {item.name} · S/ {(item.totalCents/100).toFixed(2)}</li>)}</ul><p>Productos S/ {(quote.subtotalCents/100).toFixed(2)} · Entrega S/ {(quote.deliveryCents/100).toFixed(2)}</p><strong>Total revisado: S/ {(quote.totalCents/100).toFixed(2)}</strong></div><p>Confirmar registra tu pedido como invitado. El pago se coordina con el negocio; aquí no se realiza ningún cobro.</p></>}
 <div className="checkout-step-actions">{step==='review'?<ButtonPrimary onClick={onSubmit}>{busy?'Confirmando…':'Confirmar pedido'}</ButtonPrimary>:<ButtonPrimary onClick={()=>void next()}>{busy?'Revisando…':step==='note'?'Revisar mi pedido →':'Continuar →'}</ButtonPrimary>}{index>0&&<ButtonSecondary onClick={()=>{setStep(sequence[index-1]);setError('');}}>← Atrás</ButtonSecondary>}</div>
 </fieldset>{error&&<p role="alert">{error}</p>}</div>;
}
