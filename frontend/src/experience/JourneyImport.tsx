import {useState} from 'react';
import {useToolkit} from '../toolkit/ToolkitContext';
import {ButtonPrimary} from '../components/ui/DesignSystem';
import {parseJourney} from './journeyModel';
import type {Proposal} from '../proposal/model';
export default function JourneyImport({proposal,onApply}:{proposal:Proposal;onApply:(patch:Partial<Proposal>)=>void}){
 const {docs}=useToolkit();const [selected,setSelected]=useState<string[]>([]);let answers:Record<string,string>={};try{if(docs['module-project-journey'])answers=parseJourney(docs['module-project-journey']).answers;}catch{return <p role="alert">No pudimos leer las respuestas iniciales. La propuesta no cambió.</p>;}
 const mapping=[['offer','offering','Qué ofrezco'],['audience','audience','Para quién'],['need','need','Necesidad'],['conditions','conditions','Condiciones']] as const;
 const available=mapping.filter(([key])=>answers[key]?.trim() && answers[key].trim()!==proposal[mapping.find(item=>item[0]===key)![1]].trim());if(!available.length)return null;
 return <details className="journey-import"><summary>Usar lo que ya definí al comenzar</summary><p>Elige qué incorporar. Puedes revisar y guardar después; no modifica catálogos ni publicaciones.</p>{available.map(([key,field,label])=><label key={key}><input type="checkbox" checked={selected.includes(key)} onChange={e=>setSelected(e.target.checked?[...selected,key]:selected.filter(k=>k!==key))}/><strong>{label}</strong><span>Actual: {proposal[field]||'Sin definir'}</span><span>Tu respuesta: {answers[key]}</span></label>)}<ButtonPrimary disabled={!selected.length} onClick={()=>{onApply(Object.fromEntries(available.filter(([key])=>selected.includes(key)).map(([key,field])=>[field,answers[key].slice(0,2000)])));setSelected([]);}}>Incorporar selección al borrador</ButtonPrimary></details>;
}
