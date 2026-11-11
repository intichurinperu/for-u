import './aiContextSources.css';
import {useToolkit} from '../toolkit/ToolkitContext';
import {contentPillars} from './brandProfile';
import type {Diagnostic} from '../workspace/contracts';
import type {AIContextSelection,AIProvenance} from '../ai/sourceContext';
import {sourceLabels} from '../ai/sourceContext';
export type ContextChoices={identity:boolean;pillars:string[];references:string[]};
export const emptyContextChoices=():ContextChoices=>({identity:false,pillars:[],references:[]});
export function useAIContext(choices:ContextChoices):AIContextSelection|undefined{
 const {documentRevision}=useToolkit();const revision=documentRevision('module-project-diagnostic');
 return revision&&(choices.identity||choices.pillars.length||choices.references.length)?{diagnosticRevision:revision,proposalRevision:choices.identity?documentRevision('module-proposal'):null,...choices}:undefined;
}
export default function AIContextSources({value,onChange,disabled}:{value:ContextChoices;onChange:(v:ContextChoices)=>void;disabled:boolean}){
 const {docs,projectId,documentRevision}=useToolkit();const doc=docs['module-project-diagnostic'] as Diagnostic|undefined;
 if(doc?.version!==2||doc.projectId!==projectId||!documentRevision('module-project-diagnostic'))return <p className="guide-save-note">Usaremos solo la fuente principal. Tu identidad puede definirse después.</p>;
 let pillars:string[]=[];try{pillars=contentPillars(doc.answers);}catch{/* Invalid choices are kept for explicit recovery, not sent. */}
 const refs=doc.inspiration||[],toggle=(list:string[],item:string)=>list.includes(item)?list.filter(v=>v!==item):[...list,item];
 return <details className="ai-source-options"><summary>Personalizar con mis elecciones · opcional</summary><p>¿Qué quieres que tengamos en cuenta? Puedes elegir varias fuentes guardadas.</p><fieldset disabled={disabled}><legend>Contexto adicional para esta acción</legend><label><input type="checkbox" checked={value.identity} onChange={e=>onChange({...value,identity:e.target.checked})}/>Mi voz, mi diferencia y lo que quiero transmitir o evitar</label>{!!pillars.length&&<div><strong>Mis pilares</strong>{pillars.map(p=><label key={p}><input type="checkbox" checked={value.pillars.includes(p)} onChange={()=>onChange({...value,pillars:toggle(value.pillars,p)})}/>{p}</label>)}</div>}{!!refs.length&&<div><strong>Mis referencias · hasta tres</strong>{refs.map(r=><label key={r.id}><input type="checkbox" checked={value.references.includes(r.id)} disabled={disabled||value.references.length>=3&&!value.references.includes(r.id)} onChange={()=>onChange({...value,references:toggle(value.references,r.id)})}/>{r.label||'Referencia sin nombre'}</label>)}<p>Solo tus notas sobre lo que te gusta y adaptarías. No visitamos perfiles ni enviamos sus capturas en esta acción.</p></div>}</fieldset></details>;
}
export function AIProvenanceView({value}:{value:AIProvenance|undefined}){if(!value)return <p className="guide-save-note">Sugerencia de IA. Esta versión del servidor no adjunta un registro verificable de fuentes.</p>;return <details><summary>Ver de dónde parte esta sugerencia</summary><p>Fuentes guardadas verificadas por el servidor; no son citas de cada afirmación.</p><ul>{value.sources.map((s,i)=><li key={i}>{sourceLabels[s.kind]} · revisión {s.revision}</li>)}</ul>{value.context&&<p>{value.context.identity?'Identidad elegida. ':''}{value.context.pillars.length?'Pilares: '+value.context.pillars.join(' · ')+'. ':''}{value.context.references.length?value.context.references.length+' referencias elegidas.':''}</p>}</details>;}
