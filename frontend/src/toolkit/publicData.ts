import {locationDetails,locationText} from './locationSection';
import {sectionKinds,type SectionKind} from './sectionComposition';
import {presentationVersion} from '../presentation/model';
import { parseWidgets } from '../widgets/model';
import type { LandingDraft } from "./types";
import { safeHttps } from "./engine";
import { publicOffer, type Offer } from '../proposal/model';
import { externalImageUrl } from '../components/shared/mediaReference';

export function parseSiteData(value: unknown): LandingDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (
    typeof data.name !== "string" ||
    typeof data.headline !== "string" ||
    !Array.isArray(data.blocks)
  )
    return null;
  const text = (key: string, limit: number, fallback = "") =>
    typeof data[key] === "string"
      ? (data[key] as string).slice(0, limit)
      : fallback;
  let offers: Offer[] | undefined;
  if (data.offers !== undefined) {
    try {
      if (!Array.isArray(data.offers) || data.offers.length > 30) return null;
      offers = data.offers.map(value => {
        const offer = publicOffer(value as Offer);
        return { ...offer, image: externalImageUrl(offer.image) ?? '' };
      });
      if (new Set(offers.map(offer => offer.id)).size !== offers.length) return null;
    } catch { return null; }
  }
  if(data.blocks.some(block=>block&&typeof block==='object'&&'kind' in block&&!sectionKinds.includes(block.kind as SectionKind)))return null;
  let design;try{design=presentationVersion(data.presentationVersion);}catch{return null;}
  try{for(const block of data.blocks){if(block&&typeof block==='object')locationDetails((block as Record<string,unknown>).contact);}}catch{return null;}
  let widgets; try {widgets=parseWidgets(data.widgets);}catch{return null;}
  return {
    ...(data.presentationVersion!==undefined?{presentationVersion:design}:{}),
    widgets: widgets.length ? widgets : undefined,
    bookingEnabled: typeof data.bookingEnabled === 'boolean' ? data.bookingEnabled : undefined,
    offers,
    menuItems: Array.isArray(data.menuItems) ? data.menuItems.slice(0, 30).filter((item): item is { id: string; name: string; price: number } => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 && item.price <= 1000000)).map(item => ({ id: item.id.slice(0, 80), name: item.name.slice(0, 120), price: item.price })) : [],
    gallery: Array.isArray(data.gallery) ? data.gallery.slice(0, 3).filter((item): item is { role: string; url: string; alt: string } => Boolean(item && typeof item === 'object' && typeof item.role === 'string' && typeof item.url === 'string' && typeof item.alt === 'string')).map(item => ({ role: item.role.slice(0, 30), url: safeHttps(item.url) || '', alt: item.alt.slice(0, 160) })).filter(item => item.url) : [],
    heroImage: safeHttps(text("heroImage", 2000)),
    heroImageAlt: text("heroImageAlt", 160),
    name: text("name", 100),
    slug: text("slug", 60),
    headline: text("headline", 180),
    description: text("description", 1000),
    cta: text("cta", 50, "Consultar"),
    ctaDesign: parseCtaDesign(data.ctaDesign),
    template: text("template", 40, "services"),
    color: design>=2 && /^#[0-9a-f]{6}$/i.test(text("color",7))?text("color",7):"#0A0A0A",
    whatsapp: /^\d{8,15}$/.test(text("whatsapp", 15))
      ? text("whatsapp", 15)
      : "",
    calendly: safeHttps(text("calendly", 400), "calendly.com"),
    blocks: data.blocks
      .slice(0, 8)
      .filter((block): block is { contact?:import('./locationSection').LocationDetails; kind?:SectionKind; id: string; title: string; body: string } =>
        Boolean(
          block &&
          typeof block === "object" &&
          typeof block.id === "string" &&
          typeof block.title === "string" &&
          typeof block.body === "string",
        ),
      )
      .map((block) => ({
        ...(block.kind?{kind:block.kind}:{}),
        ...(block.contact?{contact:locationDetails(block.contact)}:{}),
        id: block.id.slice(0, 80),
        title: block.title.slice(0, 150),
        body: block.contact?locationText(locationDetails(block.contact)!):block.body.slice(0, 2000),
      })),
    fields: Array.isArray(data.fields)
      ? [
          ...new Set(
            data.fields
              .filter(
                (field): field is string =>
                  typeof field === "string" && field.trim().length > 0,
              )
              .map((field) => field.slice(0, 60)),
          ),
        ].slice(0, 8)
      : [],
    published: true,
  };
}

export function parseCtaDesign(value: unknown): LandingDraft['ctaDesign'] {
 if(!value||typeof value!=='object'||Array.isArray(value))return undefined;
 const data=value as Record<string,unknown>;
 if(data.version!==undefined&&data.version!==1)return undefined;
 return {version:1,url:typeof data.url==='string'?safeHttps(data.url.slice(0,1000)):'',align:['start','center','end'].includes(String(data.align))?data.align as 'start'|'center'|'end':'start',tone:['violet','mint','gold'].includes(String(data.tone))?data.tone as 'violet'|'mint'|'gold':'violet'};
}
