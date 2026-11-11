import {experienceDetails,type ExperienceDetails} from './experienceDetails';
import type { ModuleType } from '../modules/moduleProjects';
import type { DishOption } from '../modules/restaurant/orderOptions';
import { publicOptions } from '../modules/restaurant/orderOptions';
import { catalogSnapshot } from '../toolkit/catalogSnapshot';
import type { LandingDraft } from '../toolkit/types';

export type OfferKind = 'product' | 'service' | 'package' | 'course' | 'stay' | 'experience';
export type Offer = { id: string; name: string; description: string; image: string; kind: OfferKind;
  pricing: 'fixed' | 'quote' | 'free'; price: number | null; conditions: string; variants?: DishOption[]; extras?: DishOption[]; experience?: ExperienceDetails };
export type Proposal = { version: 1; offering: string; audience: string; need: string; value: string; message: string;
  conditions: string; cta: string; whatsapp: string; nativeIds: string[]; offers: Offer[] };
export type ProposalSource = { proposalRevision: string; catalogRevision: string | null };
export const collections: Record<ModuleType, string> = { restaurant: 'dishes', ecommerce: 'products', hospitality: 'rooms', tourism: 'tours', courses: 'courses' };
const kinds: OfferKind[] = ['product', 'service', 'package', 'course', 'stay', 'experience'];
export const emptyProposal = (): Proposal => ({ version: 1, offering: '', audience: '', need: '', value: '', message: '', conditions: '', cta: '', whatsapp: '', nativeIds: [], offers: [] });
export const blankOffer = (): Offer => ({ id: crypto.randomUUID(), name: '', description: '', image: '', kind: 'service', pricing: 'quote', price: null, conditions: '' });
export function validateOffer(offer: Offer, ready = false) {
  if (!offer || typeof offer.id !== 'string' || !offer.id || !kinds.includes(offer.kind)
    || !['fixed', 'free', 'quote'].includes(offer.pricing)
    || !['name', 'description', 'image', 'conditions'].every(key => typeof offer[key as keyof Offer] === 'string' && (offer[key as keyof Offer] as string).length <= 2000)
    || offer.name.length > 120 || (ready && !offer.name.trim())
    || (offer.pricing === 'fixed' && (offer.price === null ? ready : !Number.isFinite(offer.price) || offer.price <= 0 || offer.price > 1000000))
    || (offer.pricing === 'quote' && offer.price !== null) || (offer.pricing === 'free' && offer.price !== 0)) throw new Error('Revisa la oferta y confirma su precio o selecciona Solicitar cotización / Gratis. No se convirtió un campo vacío en cero.');
  publicOptions(offer.variants); publicOptions(offer.extras);
  if(offer.experience!==undefined){if(offer.kind!=='experience')throw new Error('Los detalles de experiencia corresponden a turismo.');experienceDetails(offer.experience);}
}
export function parseProposal(value: unknown): Proposal {
  const doc = value as Proposal;
  if (!doc || doc.version !== 1 || !['offering','audience','need','value','message','conditions','cta','whatsapp'].every(key => typeof doc[key as keyof Proposal] === 'string' && (doc[key as keyof Proposal] as string).length <= 2000)
    || !Array.isArray(doc.nativeIds) || !doc.nativeIds.every(id => typeof id === 'string' && !!id && id.length <= 200) || new Set(doc.nativeIds).size !== doc.nativeIds.length
    || !Array.isArray(doc.offers) || doc.offers.length > 30 || new Set(doc.offers.map(o => o?.id)).size !== doc.offers.length) throw new Error('No pudimos interpretar la propuesta guardada. Se conserva sin reemplazarla.');
  doc.offers.forEach(offer => validateOffer(offer));
  return doc;
}
export function nativeOffers(type: ModuleType, payload: unknown): Offer[] {
  if (payload === undefined || payload === null) return [];
  const simple = catalogSnapshot(type, payload, Infinity);
  const entries = (payload as Record<string, unknown>)[collections[type]] as Record<string, unknown>[];
  const kind: OfferKind = { restaurant:'product', ecommerce:'product', hospitality:'stay', tourism:'experience', courses:'course' }[type] as OfferKind;
  return simple.map(item => {
    const source = entries.find(entry => entry.id === item.id)!;
    return { id: `${type}:${item.id}`, name: item.name, price: item.price, pricing: item.price === 0 ? 'free' : 'fixed', kind,
      description: typeof source.description === 'string' ? source.description : type === 'hospitality' && Array.isArray(source.amenities) ? source.amenities.filter(v => typeof v === 'string').join(' · ') : '',
      image: typeof (source.image ?? source.cover) === 'string' ? String(source.image ?? source.cover) : '', conditions: typeof source.conditions === 'string' ? source.conditions : '',
      ...(type === 'tourism' && source.durationMinutes!==undefined && source.meetingPoint!==undefined && source.itinerary!==undefined ? {experience:experienceDetails({version:1,durationMinutes:source.durationMinutes,meetingPoint:source.meetingPoint,itinerary:source.itinerary})} : {}),
      ...(type === 'restaurant' ? { variants: publicOptions(source.variants as DishOption[] | undefined), extras: publicOptions(source.extras as DishOption[] | undefined) } : {}) };
  });
}
// No price copies in proposal references. Always resolve the stored source.
export function proposalOffers(proposal: Proposal, type: ModuleType | undefined, payload: unknown): Offer[] {
  parseProposal(proposal);
  const native = type?nativeOffers(type, payload):[];
  const missing = proposal.nativeIds.filter(id => !native.some(offer => offer.id === id));
  if (missing.length) throw new Error('Una oferta elegida ya no está disponible en el catálogo. Revisa tu propuesta antes de preparar o publicar.');
  const offers = [...native.filter(offer => proposal.nativeIds.includes(offer.id)), ...proposal.offers];
  if (offers.length > 30 || new Set(offers.map(o => o.id)).size !== offers.length) throw new Error('Selecciona hasta 30 ofertas con identificadores distintos.');
  offers.forEach(offer => validateOffer(offer, true));
  return offers.map(publicOffer);
}
export function publicOffer(offer: Offer): Offer {
  validateOffer(offer, true);
  const { id, name, description, image, kind, pricing, price, conditions } = offer;
  return { id, name: name.trim(), description, image, kind, pricing, price: price === null ? null : Math.round(price * 100) / 100, conditions,
    ...(offer.experience ? {experience:experienceDetails(offer.experience)} : {}),
    ...(offer.variants ? { variants: publicOptions(offer.variants)?.filter(o => o.available) } : {}), ...(offer.extras ? { extras: publicOptions(offer.extras)?.filter(o => o.available) } : {}) };
}
export const offerPrice = (offer: Offer) => offer.pricing === 'quote' ? 'Solicitar cotización' : offer.pricing === 'free' ? 'Gratis' : offer.price === null ? 'Precio pendiente' : new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(offer.price);
export function sameOffers(a: Offer[], b: Offer[] | undefined) {
  return b !== undefined && JSON.stringify(a.map(publicOffer)) === JSON.stringify(b.map(publicOffer));
}
export const preparationFields = ['headline', 'description', 'cta', 'whatsapp', 'conditions', 'offers'] as const;
export type PreparationField = typeof preparationFields[number];
export function prepareLanding(base: LandingDraft, proposal: Proposal, offers: Offer[], source: ProposalSource, fields: PreparationField[]): LandingDraft {
  parseProposal(proposal);
  const next = { ...base };
  next.proposalSource = { proposalRevision: source.proposalRevision, catalogRevision: base.proposalSource?.catalogRevision ?? null };
  if (fields.includes('headline')) next.headline = proposal.message.trim().slice(0, 180);
  if (fields.includes('description')) next.description = [proposal.offering.trim(), proposal.value.trim()].filter(Boolean).join('\n').slice(0, 1000);
  if (fields.includes('cta')) next.cta = proposal.cta.trim().slice(0, 50);
  if (fields.includes('whatsapp')) next.whatsapp = proposal.whatsapp.replace(/[\s+()-]/g, '');
  if (fields.includes('conditions')) {
    const block = { id: 'proposal-conditions', title: 'Condiciones', body: proposal.conditions };
    next.blocks = base.blocks.filter(b => b.id !== block.id);
    if (proposal.conditions.trim()) { if (next.blocks.length >= 8) throw new Error('Tu página ya tiene ocho secciones. Libera una antes de añadir condiciones.'); next.blocks = [...next.blocks, block]; }
  }
  if (fields.includes('offers')) { next.offers = offers.map(publicOffer); next.catalogSource = 'proposal'; next.menuItems = undefined; next.proposalSource = source; }
  return next;
}
/** Only meaningful public differences are offered; a revision change alone is not a text change. */
export function changedPreparationFields(base: LandingDraft, proposal: Proposal, offers: Offer[]): PreparationField[] {
 const prepared=prepareLanding(base,proposal,offers,{proposalRevision:'comparison',catalogRevision:null},[...preparationFields]);
 return preparationFields.filter(field=>field==='offers'?!sameOffers(offers,base.offers):field==='conditions'?(base.blocks.find(b=>b.id==='proposal-conditions')?.body||'')!==(prepared.blocks.find(b=>b.id==='proposal-conditions')?.body||''):base[field]!==prepared[field]);
}
