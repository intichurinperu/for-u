import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ButtonSecondary} from '../components/ui/DesignSystem';
export type EditorChoice={id:string;title:string;hint:string;icon:string;content:ReactNode};
/** A choice opens one editing decision; sibling fields are not rendered behind it. */
export default function EditorDecision({choices,groups,initialChoice}:{choices:EditorChoice[];groups?:{id:string;title:string;hint:string;icon:string;ids:string[]}[];initialChoice?:string}){
 const [selected,setSelected]=useState<string|null>(()=>choices.some(choice=>choice.id===initialChoice)?initialChoice!:null),[group,setGroup]=useState<string|null>(null);
 const title=useRef<HTMLHeadingElement>(null);
 const current=choices.find(choice=>choice.id===selected);
 useEffect(()=>{if(current)title.current?.focus();},[selected]);
 if(groups&&!group)return <div className="pe-decision-choices" aria-label="Qué quiero ajustar">{groups.map(item=><button type="button" key={item.id} onClick={()=>setGroup(item.id)}><span aria-hidden="true">{item.icon}</span><span><strong>{item.title}</strong><small>{item.hint}</small></span><span aria-hidden="true">→</span></button>)}</div>;
 const visible=groups?choices.filter(choice=>groups.find(item=>item.id===group)?.ids.includes(choice.id)):choices;
 if(!current)return <>{groups&&<ButtonSecondary onClick={()=>setGroup(null)}>← Todos los ajustes</ButtonSecondary>}<div className="pe-decision-choices" aria-label="Qué quiero cambiar">{visible.map(choice=><button type="button" key={choice.id} onClick={()=>setSelected(choice.id)}><span aria-hidden="true">{choice.icon}</span><span><strong>{choice.title}</strong><small>{choice.hint}</small></span><span aria-hidden="true">→</span></button>)}</div></>;
 return <section className="pe-one-decision"><ButtonSecondary onClick={()=>setSelected(null)}>← Elegir otro ajuste</ButtonSecondary><h3 ref={title} tabIndex={-1}>{current.title}</h3><p>{current.hint}</p><div className="pe-decision-control">{current.content}</div></section>;
}
