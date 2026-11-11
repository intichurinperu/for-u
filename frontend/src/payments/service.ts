import {supabase} from '../services/supabase';
export type PaymentKind='restaurant'|'commerce';
export type PaymentMode='coordinated'|'optional'|'required';
export type PaymentAttempt={id:string;state:string;environment:'test'|'production';totalCents:number;currency:'PEN';checkoutUrl:string|null;lastCheckedAt?:string;error:string|null};
export type PaymentReply={attempt:PaymentAttempt|null;policy?:PaymentMode;error?:string};
export class PaymentError extends Error {result?:PaymentReply;constructor(message:string,result?:PaymentReply){super(message);this.result=result;}}
export async function paymentAction<T>(body:Record<string,unknown>):Promise<T>{
 if(!supabase)throw new PaymentError('Supabase no está configurado.');
 const {data,error}=await supabase.functions.invoke('mercado-pago',{body});
 if(error){const response=(error as {context?:Response}).context;let result;try{result=await response?.json();}catch{/* Unknown response remains uncertain. */}throw new PaymentError(result?.error||'Cobros no está disponible. Reintenta; falta comprobar la configuración del servidor.',result);}
 if(data?.error)throw new PaymentError(data.error,data);
 return data as T;
}
export const paymentLabels:Record<string,string>={creating:'Confirmando intento',unknown:'Resultado por confirmar',pending:'Pago pendiente',approved:'Pago aprobado',rejected:'Pago rechazado',cancelled:'Pago cancelado',expired:'Intento vencido',refunded:'Dinero devuelto',partially_refunded:'Devolución parcial',charged_back:'Contracargo'};
export {safeCheckoutUrl,rememberPayment,readPaymentReturn} from './session';
export type {PaymentReturn} from './session';
