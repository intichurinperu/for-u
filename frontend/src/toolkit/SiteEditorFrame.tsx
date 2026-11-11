import EmptyPageSection from './EmptyPageSection';
import {HeroCopy,HeroMark} from './PageIdentity';
import {GripVertical,ArrowUp,ArrowDown,Pencil} from 'lucide-react';
import SectionComposition from './PageSectionBody';
import {sectionKind,sectionLayout,sectionHint,sectionConfigured} from './sectionComposition';
import {presentationClass} from '../presentation/model';
import ProjectWidgets from '../widgets/ProjectWidgets';
import { LandingExtras, LandingPreview } from "./LandingPreview";
import { ButtonGhost, Card } from "../components/ui/DesignSystem";
import "./professionalEditor.css";
import { useEffect, useRef, useState } from "react";
import type { LandingDraft } from "./types";
import { parseSiteData } from "./publicData";
import "./toolkit.css";
import "./pagePresentation.css";
import "./landingEditorWorkspace.css";
function Editable({
  value,
  field,
  blockId,
  onEdit,
  tag = "div",
}: {
  value: string;
  field: string;
  blockId?: string;
  onEdit: (field: string, value: string, blockId?: string) => void;
  tag?: "div" | "h1" | "h2" | "p";
}) {
  const element = useRef<HTMLElement>(null);
  useEffect(() => {
    if (element.current && element.current.innerText !== value)
      element.current.innerText = value;
  }, [value]);
  const Tag = tag;
  return (
    <Tag
      ref={element as React.Ref<HTMLHeadingElement>}
      contentEditable
      suppressContentEditableWarning
      data-empty-hint={field==='body'?'Toca aquí para contar esta parte a tu manera':field==='description'?'Unas palabras sobre lo que ofreces':'Toca para escribir'}
      role="textbox"
      aria-label={
        field === "body"
          ? "Texto de sección"
          : field === "title"
            ? "Título de sección"
            : field === "headline"
              ? "Título principal"
              : field === "description"
                ? "Descripción"
                : "Texto del botón"
      }
      onInput={(e) => onEdit(field, e.currentTarget.innerText ?? "", blockId)}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        onEdit(field, e.currentTarget.innerText ?? "", blockId);
      }}
    />
  );
}
export default function SiteEditorFrame() {
  const drag = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [imageDrop, setImageDrop] = useState(false);
  const [selected, setSelected] = useState("hero");
  const [previewOnly, setPreviewOnly] = useState(false);
  const [resume,setResume]=useState<string|null>(null);
  const [focusOffer,setFocusOffer]=useState<string|null>(null);

  const [hostProject,setHostProject]=useState<string>();
  const [draft, setDraft] = useState<LandingDraft | null>(null);

  useEffect(()=>{if(!draft||!resume)return;const target=resume==='hero'?document.querySelector('.tk-site-hero'):Array.from(document.querySelectorAll<HTMLElement>('[data-block-id]')).find(el=>el.dataset.blockId===resume);if(target){window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-24),left:0,behavior:'auto'});setResume(null);}},[draft,resume]);
 useEffect(()=>{if(!draft||!focusOffer)return;const card=Array.from(document.querySelectorAll<HTMLElement>('[data-offer-id]')).find(node=>node.dataset.offerId===focusOffer);if(card){const box=card.getBoundingClientRect();window.scrollTo({top:Math.max(0,window.scrollY+box.top-Math.max(24,(window.innerHeight-box.height)/2)),left:0,behavior:'auto'});card.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});}setFocusOffer(null);},[draft,focusOffer]);
  const channel = new URLSearchParams(window.location.search).get("channel");
  const send = (type: string, payload: object = {}) => {
    if (window.parent !== window)
      window.parent.postMessage(
        { type, channel, ...payload },
        window.location.origin,
      );
  };
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.channel !== channel ||
        event.data.type !== "foru:render"
      )
        return;
      const next = parseSiteData(event.data.draft);
      if (next) {
        setPreviewOnly(event.data.previewOnly === true);
        setDraft(next);if(typeof event.data.focusOfferId==='string'&&next.offers?.some(offer=>offer.id===event.data.focusOfferId))setFocusOffer(event.data.focusOfferId);
        setHostProject(typeof event.data.projectId==='string'&&/^[0-9a-f-]{36}$/i.test(event.data.projectId)?event.data.projectId:undefined);
        const id = event.data.selectedId;
        if (id === 'hero' || next.blocks.some(block => block.id === id)){setSelected(id);if(event.data.resumeSelection===true)setResume(id);}
      }
    };
    window.addEventListener("message", receive);
    if (window.parent !== window)
      window.parent.postMessage(
        { type: "foru:ready", channel },
        window.location.origin,
      );
    return () => window.removeEventListener("message", receive);
  }, [channel]);
  if (!draft) return <p>Preparando vista previa…</p>;
  if (previewOnly) return (
    <div onClick={event=>{if ((event.target as HTMLElement).closest('a[href]')) event.preventDefault();}}
      onSubmit={event=>event.preventDefault()}>
      <LandingPreview draft={draft}/>
    </div>
  );
  const sectionAction = (id: string, label: string) => selected === id && (
    <button type="button" className="landing-frame-edit"
      onClick={event=>{event.stopPropagation();send('foru:edit-section',{id});}}>
      <Pencil size={14} aria-hidden="true"/>{label}
    </button>
  );
  const edit = (field: string, value: string, blockId?: string) =>
    send("foru:edit", { field, value, blockId });
  return (
    <article className={"pe-editable-page tk-landing-preview tk-template-" + draft.template+' '+presentationClass(draft.presentationVersion)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const preset = event.dataTransfer.getData('application/foru-section'); if (preset) send('foru:add', { preset }); }}>
      <header>
        <strong>{draft.name}</strong>
        <span>Edición de página</span>
      </header>
      <Card as="section" className={`tk-site-hero pe-editable-section ${selected === 'hero' ? 'pe-selected' : ''} ${!draft.heroImage?'pe-without-cover':'pe-with-cover'}`} onClick={() => { setSelected('hero'); send('foru:select', { id: 'hero' }); }} onFocus={() => { setSelected('hero'); send('foru:select', { id: 'hero' }); }}>
        {sectionAction('hero','Editar portada')}
        <button type="button" className={`pe-image-target ${imageDrop?'pe-drop-target':''}`} onClick={event=>{event.stopPropagation();send('foru:context',{target:'image'});}} onDragOver={event=>{event.preventDefault();event.stopPropagation();setImageDrop(true);}} onDragLeave={()=>setImageDrop(false)} onDrop={event=>{event.preventDefault();event.stopPropagation();setImageDrop(false);const file=event.dataTransfer.files[0];if(file)send('foru:image-drop',{target:'hero',file});}} aria-label="Cambiar foto de portada">
          {draft.heroImage?<img src={draft.heroImage} alt={draft.heroImageAlt||''} className="tk-site-image"/>:<span>{[3,4].includes(draft.presentationVersion||1)?'＋ Añadir una foto · opcional':<>＋ Tu foto aquí<br/><small>Toca para elegir · arrastra para reemplazar</small></>}</span>}
          {draft.heroImage&&<span className="pe-image-caption">Cambiar foto</span>}
        </button>
        {draft.presentationVersion===4&&!draft.heroImage&&<HeroMark name={draft.name}/>}
        <HeroCopy modern={draft.presentationVersion===4}>
        <Editable
          value={draft.headline}
          field="headline"
          tag="h1"
          onEdit={edit}
        />
        <Editable
          value={draft.description}
          field="description"
          tag="p"
          onEdit={edit}
        />
        <div className={`pe-site-cta pe-cta-${draft.ctaDesign?.tone||'violet'}`} style={{textAlign:draft.ctaDesign?.align}}><button type="button" onClick={event=>{event.stopPropagation();send('foru:context',{target:'cta'});}}>{draft.cta||'＋ Tu llamada a la acción'}</button></div></HeroCopy>
      </Card>
      {draft.blocks.map((block, index) => (<div key={block.id} className="pe-section-slot">
        <button type="button" className="pe-insert-section" onClick={()=>send('foru:sections',{beforeId:block.id})}>＋ Sección</button>
        <Card as="section" key={block.id} data-block-id={block.id} className={`tk-site-block page-section-${sectionKind(block)||'details'} pe-editable-section ${selected === block.id ? 'pe-selected' : ''} ${dropTarget === block.id ? 'pe-drop-target' : ''}`} onClick={() => { setSelected(block.id); send('foru:select', { id: block.id }); }} onFocus={event => { setSelected(block.id); const offerId=(event.target as HTMLElement).closest<HTMLElement>('[data-offer-id]')?.dataset.offerId; send('foru:select', { id: block.id, ...(offerId?{offerId}:{}) }); }} onDragOver={event => { event.preventDefault(); setDropTarget(block.id); }} onDragLeave={() => setDropTarget(null)} onDrop={event => { setDropTarget(null); if (!drag.current) return; event.preventDefault(); event.stopPropagation(); send('foru:move', { from: drag.current, to: block.id }); drag.current = null; }}>
          {sectionAction(block.id,'Editar sección')}
          <div className="pe-block-controls" contentEditable={false}>
            <ButtonGhost type="button" draggable aria-label={`Arrastrar ${block.title}`} tooltip="Arrastra para mover esta sección. También puedes usar los botones Subir y Bajar." onDragStart={event => { drag.current = block.id; event.dataTransfer.setData('text/plain', block.id); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => { drag.current = null; setDropTarget(null); }}><GripVertical size={18} aria-hidden="true"/></ButtonGhost>
            <ButtonGhost type="button" aria-label={`Subir ${block.title}`} disabled={index === 0} onClick={() => send('foru:move', { from: block.id, to: draft.blocks[index - 1].id })}><ArrowUp size={18} aria-hidden="true"/></ButtonGhost>
            <ButtonGhost type="button" aria-label={`Bajar ${block.title}`} disabled={index === draft.blocks.length - 1} onClick={() => send('foru:move', { from: block.id, to: draft.blocks[index + 1].id })}><ArrowDown size={18} aria-hidden="true"/></ButtonGhost>
          </div>
          <Editable
            value={block.title}
            field="title"
            blockId={block.id}
            tag="h2"
            onEdit={edit}
          />
          {[3,4].includes(draft.presentationVersion||1)&&!sectionConfigured(block,draft)?<EmptyPageSection title={block.title} kind={sectionKind(block)} layout={sectionLayout(block)} route={draft.template} onConfigure={()=>send('foru:configure',{id:block.id,kind:sectionKind(block)==='catalog'?'catalog':'text'})}/>: [3,4].includes(draft.presentationVersion||1)&&sectionKind(block)==='catalog'?<>
            <SectionComposition block={block} draft={draft} onEditOffer={id=>send('foru:context',{target:'offer',id,sectionId:block.id})}/>
            {(['module','proposal'].includes(draft.catalogSource||'')||draft.offers?.some(offer=>!offer.id.includes(':')))&&<button type="button" className="pe-action-link" onClick={event=>{event.stopPropagation();send('foru:configure',{id:block.id,kind:'catalog'});}}>{draft.template==='restaurant'?'＋ Añadir producto':'＋ Añadir oferta'}</button>}
            {!draft.offers?.length&&<div className="page-section-setup"><span aria-hidden="true">＋</span><p>{sectionHint('catalog',draft.template)}</p><button type="button" onClick={event=>{event.stopPropagation();send('foru:configure',{id:block.id,kind:'catalog'});}}>Preparar mi catálogo →</button></div>}
          </>:<>
            {([3,4].includes(draft.presentationVersion||1)&&(sectionKind(block)==='faq'||sectionKind(block)==='location'&&Boolean(block.contact))||draft.presentationVersion===4&&sectionLayout(block)!=='prose')&&(block.body.trim()||block.contact?.mapUrl)?<><div onClick={event=>{event.stopPropagation();if(sectionKind(block)==='location')event.preventDefault();send('foru:configure',{id:block.id,kind:'text'});}}><SectionComposition block={block} draft={draft}/></div><button className="pe-action-link" type="button" onClick={event=>{event.stopPropagation();send('foru:configure',{id:block.id,kind:'text'});}}>{sectionKind(block)==='location'?'Editar ubicación y horario':sectionKind(block)==='faq'?'Editar preguntas y respuestas':sectionLayout(block)==='steps'?'Editar pasos':sectionLayout(block)==='quotes'?'Editar testimonios':'Editar elementos'}</button></>:<Editable value={block.body} field="body" blockId={block.id} tag="p" onEdit={edit}/>}
            {[3,4].includes(draft.presentationVersion||1)&&!block.body.trim()&&<p className="page-section-hint">{sectionHint(sectionKind(block),draft.template)}</p>}
          </>}
        </Card></div>
      ))}
      <button type="button" className="pe-insert-section" onClick={()=>send('foru:sections',{beforeId:null})}>＋ Sección</button>
      <LandingExtras draft={draft} hideCatalog={[3,4].includes(draft.presentationVersion||1)&&draft.blocks.some(b=>sectionKind(b)==='catalog')} onEditGallery={role=>send('foru:context',{target:'gallery',role})} onEditOffer={id=>send('foru:context',{target:'offer',id})} />
      {hostProject&&<ProjectWidgets widgets={draft.widgets??[]} hostProject={hostProject}/>}
      <footer>{draft.name} · Creado con FOR U</footer>
    </article>
  );
}
