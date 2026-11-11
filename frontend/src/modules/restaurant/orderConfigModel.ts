import type {OrderConfig} from './orders';
/** Same constraints as the existing RPC. Validate before sending pending settings. */
export function confirmedOrderConfig(value:OrderConfig):OrderConfig{
 if(!value||typeof value!=='object')throw new Error('No pudimos interpretar la recepción de pedidos guardada. Conservamos la información.');
 if(typeof value.enabled!=='boolean'||!Array.isArray(value.modes)||value.modes.length>3||value.modes.some(mode=>!['table','pickup','delivery'].includes(mode))||new Set(value.modes).size!==value.modes.length)throw new Error('Revisa cómo quieres recibir pedidos.');
 if(!Array.isArray(value.tables)||value.tables.length>100||value.tables.some(table=>typeof table!=='string'||!table.trim()||table.trim().length>60))throw new Error('Dale un nombre a cada mesa antes de guardar.');
 const tables=value.tables.map(table=>table.trim());if(new Set(tables).size!==tables.length)throw new Error('Hay dos mesas con el mismo nombre.');
 if(!Array.isArray(value.zones)||value.zones.length>30||value.zones.some(zone=>!zone||typeof zone.id!=='string'||!zone.id||zone.id.length>60||typeof zone.name!=='string'||!zone.name.trim()||zone.name.trim().length>100||!Number.isSafeInteger(zone.feeCents)||zone.feeCents<0||zone.feeCents>100000000)||new Set(value.zones.map(zone=>zone.id)).size!==value.zones.length)throw new Error('Confirma el nombre y la tarifa de cada zona. Una tarifa vacía no significa gratis.');
 if(value.enabled&&(!value.modes.length||value.modes.includes('table')&&!tables.length||value.modes.includes('delivery')&&!value.zones.length))throw new Error('Para recibir pedidos, elige una modalidad y completa sus mesas o zonas.');
 return {...value,modes:[...value.modes],tables,zones:value.zones.map(zone=>({...zone,name:zone.name.trim()}))};
}
