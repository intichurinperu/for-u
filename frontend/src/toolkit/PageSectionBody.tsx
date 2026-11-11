import ExperienceDetail from './ExperienceDetail';
import type {LandingBlock,LandingDraft} from './types';
import {offerPrice} from '../proposal/model';
import {faqRows,sectionKind,sectionLayout,compositionRows} from './sectionComposition';
export function CatalogCards({draft,onEditOffer}:{draft:LandingDraft;onEditOffer?:(id:string)=>void}){
 return <div className="tk-public-offers">{draft.offers?.map(offer=><article key={offer.id} data-offer-id={offer.id}>
  {offer.image?<img src={offer.image} alt={offer.name} loading="lazy"/>:<span className="page-offer-symbol" aria-hidden="true">{({restaurant:'◒',ecommerce:'◇',hospitality:'⌂',tourism:'↗',courses:'▤'} as Record<string,string>)[draft.template]||'✦'}</span>}
  <h3>{offer.name}</h3>{offer.description&&<p>{offer.description}</p>}
  {offer.experience&&<ExperienceDetail value={offer.experience}/>}
  {offer.conditions&&<p className="page-offer-conditions">{offer.conditions}</p>}
  {!!offer.variants?.length&&<details><summary>Presentaciones</summary><ul>{offer.variants.map(v=><li key={v.id}>{v.name} · S/ {v.price.toFixed(2)}</li>)}</ul></details>}
  {!!offer.extras?.length&&<details><summary>Extras</summary><ul>{offer.extras.map(v=><li key={v.id}>{v.name} · +S/ {v.price.toFixed(2)}</li>)}</ul></details>}
  <div className="page-offer-footer"><strong>{offerPrice(offer)}</strong>{onEditOffer&&<button type="button" className="pe-action-link" aria-label={`Editar ${offer.name}`} onClick={e=>{e.stopPropagation();onEditOffer(offer.id);}}>Editar <span aria-hidden="true">↗</span></button>}</div>
 </article>)}</div>;
}
export default function SectionComposition({block,draft,onEditOffer}:{block:LandingBlock;draft:LandingDraft;onEditOffer?:(id:string)=>void}){
 const kind=sectionKind(block);
 if(kind==='catalog')return <CatalogCards draft={draft} onEditOffer={onEditOffer}/>;
 if(kind==='faq'&&faqRows(block.body).length)return <div className="page-faq">{faqRows(block.body).map((row,i)=><details key={i}><summary>{row.question}</summary><p>{row.answer}</p></details>)}</div>;
 if(kind==='location'&&block.contact)return <div className="page-location-widget">{block.contact.note&&<p className="page-location-note">{block.contact.note}</p>}<div className="page-location-facts">{block.contact.address&&<div><span aria-hidden="true">⌖</span><div><small>ENCUÉNTRANOS</small><p>{block.contact.address}</p></div></div>}{block.contact.hours&&<div><span aria-hidden="true">◷</span><div><small>TE ESPERAMOS</small><p>{block.contact.hours}</p></div></div>}</div><div className="page-location-actions">{block.contact.mapUrl&&<a href={block.contact.mapUrl} target="_blank" rel="noopener noreferrer">Ver ubicación ↗</a>}{/^\d{8,15}$/.test(draft.whatsapp)&&<a href={`https://wa.me/${draft.whatsapp}`} target="_blank" rel="noopener noreferrer">Escríbenos ↗</a>}</div></div>;
 if(kind==='location')return <div className="page-contact"><span aria-hidden="true">⌖</span><p>{block.body}</p>{draft.whatsapp&&<a href={`https://wa.me/${draft.whatsapp}`} target="_blank" rel="noreferrer">Consultar por WhatsApp ↗</a>}</div>;
 if(draft.presentationVersion===4){const layout=sectionLayout(block),rows=compositionRows(block.body);
  if(layout==='steps')return <ol className="page-process">{rows.map((row,index)=><li key={index}><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span><p>{row}</p></li>)}</ol>;
  if(layout==='features')return <ul className="page-features">{rows.map((row,index)=><li key={index}><span aria-hidden="true">✓</span><p>{row}</p></li>)}</ul>;
  if(layout==='quotes')return <div className="page-quotes">{rows.map((row,index)=><blockquote key={index}><span aria-hidden="true">“</span><p>{row}</p></blockquote>)}</div>;
 }
 return <p className={kind==='story'?'page-story':''}>{block.body}</p>;
}
