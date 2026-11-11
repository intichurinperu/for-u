import ExperienceDetail from './ExperienceDetail';
import {HeroCopy,HeroMark} from './PageIdentity';
import SectionComposition from './PageSectionBody';
import {sectionKind,sectionConfigured} from './sectionComposition';
import './pagePresentation.css';
import {presentationClass} from '../presentation/model';
import ProjectWidgets from '../widgets/ProjectWidgets';
import { ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import type { LandingDraft } from "./types";
import { offerPrice } from '../proposal/model';
export function LandingPreview({
  draft,
  onCTA,
  hostSlug,
  children,
}: {
  draft: LandingDraft;
  onCTA?: () => void;
  hostSlug?: string;
  children?: React.ReactNode;
}) {
  return (
    <article
      className={`tk-landing-preview tk-template-${draft.template} ${presentationClass(draft.presentationVersion)}`}
      style={
        {
          "--site-color": /^#[0-9a-f]{6}$/i.test(draft.color)
            ? draft.color
            : "#6B6B6B",
        } as React.CSSProperties
      }
    >
      <header>
        <strong>{draft.name}</strong>
        <span>Hecho con dedicación</span>
      </header>
      <section className={`tk-site-hero ${draft.heroImage?'pe-with-cover':'pe-without-cover'}`}>
        {draft.heroImage && (
          <img
            src={draft.heroImage}
            alt={draft.heroImageAlt ?? ""}
            className="tk-site-image"
          />
        )}
        {draft.presentationVersion===4&&!draft.heroImage&&<HeroMark name={draft.name}/>}
        <HeroCopy modern={draft.presentationVersion===4}>
        <span className="tk-eyebrow">
          BIENVENIDA A {draft.name.toUpperCase()}
        </span>
        <h1>{draft.headline}</h1>
        <p>{draft.description}</p>
        {draft.ctaDesign?<div className={`pe-site-cta pe-cta-${draft.ctaDesign.tone||'violet'}`} style={{textAlign:draft.ctaDesign.align}}>{draft.ctaDesign?.url ? <a href={draft.ctaDesign.url} onClick={onCTA}>{draft.cta}</a> : <DSButtonSecondary onClick={onCTA}>{draft.cta}</DSButtonSecondary>}</div>:<DSButtonSecondary onClick={onCTA}>{draft.cta}</DSButtonSecondary>}
        </HeroCopy>
      </section>
      {draft.blocks.filter(block=>![3,4].includes(draft.presentationVersion||1)||sectionConfigured(block,draft)).map((block) => (
        <section id={`section-${block.id}`} key={block.id} className={`tk-site-block page-section-${sectionKind(block)||'details'}`}>
          <h2>{block.title}</h2>
          {[3,4].includes(draft.presentationVersion||1)?<SectionComposition block={block} draft={draft}/>:<p>{block.body}</p>}
        </section>
      ))}
      <LandingExtras draft={draft} hideCatalog={[3,4].includes(draft.presentationVersion||1)&&draft.blocks.some(b=>sectionKind(b)==='catalog')}/>
      {hostSlug&&<ProjectWidgets widgets={draft.widgets??[]} hostSlug={hostSlug}/>}
      {children}
      <footer>{draft.name} · Creado con FOR U</footer>
    </article>
  );
}

export function LandingExtras({ draft, onEditOffer, onEditGallery, hideCatalog=false }: { hideCatalog?:boolean; draft: LandingDraft; onEditOffer?: (id:string)=>void; onEditGallery?: (role:string)=>void }) { return <>
      {!!draft.gallery?.length && <section className="tk-site-gallery">{draft.gallery.map(photo => <figure key={photo.role}>{onEditGallery?<button className="pe-image-target" type="button" aria-label={`Cambiar foto ${photo.role}`} onClick={()=>onEditGallery(photo.role)}><img src={photo.url} alt={photo.alt} loading="lazy"/><span className="pe-image-caption">Cambiar foto</span></button>:<img src={photo.url} alt={photo.alt} loading="lazy"/>}<figcaption>{photo.role}</figcaption></figure>)}</section>}
      {!hideCatalog && !!draft.offers?.length && <section className="tk-site-block"><h2>{({restaurant:'Nuestro menú',ecommerce:'Nuestra selección',hospitality:'Habitaciones y estadías',tourism:'Experiencias para descubrir',courses:'Cursos y talleres',services:'Cómo podemos ayudarte'} as Record<string,string>)[draft.template]||'Nuestras ofertas'}</h2><div className="tk-public-offers">{draft.offers.map(offer => <article key={offer.id} data-offer-id={offer.id}>{onEditOffer&&<button type="button" className="pe-action-link" onClick={()=>onEditOffer(offer.id)}>Editar {offer.name}</button>}{offer.image && <img src={offer.image} alt={offer.name} loading="lazy" />}<h3>{offer.name}</h3><p>{offer.description}</p>{offer.experience&&<ExperienceDetail value={offer.experience}/>}<strong>{offerPrice(offer)}</strong>{offer.conditions && <p>{offer.conditions}</p>}{!!offer.variants?.length && <div><h4>Presentaciones</h4><ul>{offer.variants.map(option => <li key={option.id}>{option.name} · {new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN' }).format(option.price)}</li>)}</ul></div>}{!!offer.extras?.length && <div><h4>Extras por unidad</h4><ul>{offer.extras.map(option => <li key={option.id}>{option.name} · +{new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN' }).format(option.price)}</li>)}</ul></div>}</article>)}</div></section>}
      {draft.offers === undefined && !!draft.menuItems?.length && <section className="tk-site-block"><h2>Nuestros productos</h2><ul className="tk-site-products">{draft.menuItems.map(item => <li key={item.id}><strong>{item.name}</strong><span>{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(item.price)}</span></li>)}</ul></section>}

</>; }
