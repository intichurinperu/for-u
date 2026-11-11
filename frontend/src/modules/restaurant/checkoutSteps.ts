import type {Fulfillment,OrderConfig} from './orders';
export type CheckoutStep='mode'|'table'|'zone'|'address'|'name'|'phone'|'note'|'review';
export function checkoutSteps(mode:Fulfillment['mode']):CheckoutStep[]{
 return ['mode',...(mode==='table'?['table' as const]:mode==='delivery'?['zone' as const,'address' as const]:[]),'name','phone','note','review'];
}
export function checkoutStepError(step:CheckoutStep,config:OrderConfig,fulfillment:Fulfillment,name:string,phone:string):string{
 if(step==='mode'&&!config.modes.includes(fulfillment.mode))return 'Elige una modalidad disponible.';
 if(step==='table'&&!config.tables.includes(fulfillment.table||''))return 'Elige una mesa disponible.';
 if(step==='zone'&&!config.zones.some(zone=>zone.id===fulfillment.zoneId))return 'Elige una zona disponible.';
 if(step==='address'&&((fulfillment.address||'').trim().length<5||(fulfillment.address||'').trim().length>500))return 'Indica dónde debemos entregar tu pedido.';
 if(step==='name'&&(!name.trim()||name.trim().length>100))return 'Escribe el nombre de quien recibe el pedido.';
 if(step==='phone'&&!/^[0-9+ ()-]{7,30}$/.test(phone))return 'Usa un teléfono de 7 a 30 caracteres, con números y, si lo necesitas, +, espacios o guiones.';
 if(step==='note'&&(fulfillment.note||'').length>500)return 'La nota puede tener hasta 500 caracteres.';
 return '';
}
