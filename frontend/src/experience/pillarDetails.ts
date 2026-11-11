export type PillarDetail={id:string;name:string;notes:string};
export function parsePillarDetails(value:unknown):PillarDetail[]{
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>30)throw new Error('Conservamos tus pilares; revisa sus detalles guardados.');
 const rows=value.map(row=>{if(!row||typeof row!=='object'||typeof row.id!=='string'||!/^[-a-zA-Z0-9]{1,100}$/.test(row.id)||typeof row.name!=='string'||!row.name.trim()||row.name.length>200||typeof row.notes!=='string'||row.notes.length>2000)throw new Error('Revisa el nombre y las notas de cada pilar.');return {id:row.id,name:row.name,notes:row.notes};});
 if(new Set(rows.map(row=>row.id)).size!==rows.length||new Set(rows.map(row=>row.name.trim())).size!==rows.length)throw new Error('Cada pilar necesita un nombre y una referencia diferentes.');return rows;
}
export function updatePillarDetails(names:string[],details:PillarDetail[],previousName:string|undefined,next:PillarDetail){
 const clean=parsePillarDetails([next])[0];clean.name=clean.name.trim();
 if(names.some(name=>name===clean.name&&name!==previousName))throw new Error('Ese tema ya tiene su espacio. Elige un nombre diferente.');
 const updatedNames=previousName?names.map(name=>name===previousName?clean.name:name):[...names,clean.name];
 if(updatedNames.length>5)throw new Error('Ya tienes cinco pilares. Puedes desarrollar uno de los existentes.');
 const existing=details.find(row=>row.id===clean.id||row.name===previousName||row.name===clean.name);
 const updatedDetails=existing?details.map(row=>row===existing?{...clean,id:existing.id}:row):[...details,clean];
 return {names:updatedNames,details:parsePillarDetails(updatedDetails)};
}
