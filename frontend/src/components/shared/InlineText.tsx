import {useEffect,useRef,type Ref} from 'react';
/** Content stays in the DOM while typing; mirrored props do not replace the caret or paragraphs. */
export default function InlineText({value,label,onChange,as:Tag='p'}:{value:string;label:string;onChange:(value:string)=>void;as?:'h2'|'p'}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{if(ref.current&&ref.current.innerText!==value)ref.current.innerText=value;},[value]);
 return <Tag ref={ref as Ref<HTMLHeadingElement>} contentEditable suppressContentEditableWarning role="textbox" aria-label={label} tabIndex={0} onInput={event=>onChange(event.currentTarget.innerText)} onPaste={event=>{event.preventDefault();const selection=window.getSelection();if(!selection?.rangeCount)return;const range=selection.getRangeAt(0);range.deleteContents();const text=document.createTextNode(event.clipboardData.getData('text/plain'));range.insertNode(text);range.setStartAfter(text);range.collapse(true);selection.removeAllRanges();selection.addRange(range);onChange(event.currentTarget.innerText);}}/>;
}
