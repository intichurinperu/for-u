import type { ProjectWidget } from '../widgets/model';
import type { Offer, ProposalSource } from '../proposal/model';
import type { ForUActiveProject } from "../stores/useActiveProjectsStore";
export type ToolId =
  | "profile"
  | "proposal"
  | "content"
  | "teleprompter"
  | "video"
  | "images"
  | "calendar"
  | "analytics"
  | "assistant"
  | "landing"
  | "bookings"
  | "automation";
export type Business = {
  route?: import('../workspace/contracts').BusinessRoute;
  moduleType?: string;
  name: string;
  industry: string;
  objective: string;
  audience: string;
  offer: string;
  location: string;
};
export function businessFromProject(project: ForUActiveProject): Business {
  const p = project.strategyProfile ?? {};
  return {
    name: project.name,
    route: p.businessRoute as import('../workspace/contracts').BusinessRoute|undefined,
    industry: project.industryKey ?? "servicios",
    moduleType: typeof p.moduleType === "string" ? p.moduleType : undefined,
    objective: String(p.objective ?? project.tangibleGoal ?? "ventas"),
    audience: String(p.idealTraveler ?? "mi comunidad"),
    offer: String(p.offerType ?? "mi servicio"),
    location: String(p.location ?? ""),
  };
}
export type CalendarEntry = {
  guidance?: import('../ai/model').Guidance;
  id: string;
  title: string;
  date: string;
  time: string;
  format: string;
  done: boolean;
  remindedAt?: string;
};
export type LandingBlock = { contact?:import('./locationSection').LocationDetails; useModuleDetails?:boolean; kind?:import('./sectionComposition').SectionKind; id: string; title: string; body: string };
export type LandingDraft = {
  aiProvenance?: import('../ai/sourceContext').AIProvenance;
  presentationVersion?: import('../presentation/model').PresentationVersion;
  widgets?: ProjectWidget[];
  bookingEnabled?: boolean;
  catalogSource?: "module" | "proposal";
  offers?: Offer[];
  proposalSource?: ProposalSource;
  menuItems?: { id: string; name: string; price: number }[];
  gallery?: { role: string; url: string; alt: string }[];
  heroImage?: string;
  heroImageAlt?: string;
  name: string;
  slug: string;
  template: string;
  headline: string;
  description: string;
  cta: string;
  ctaDesign?: { version?: 1; url?: string; align?: 'start'|'center'|'end'; tone?: 'violet'|'mint'|'gold' };
  whatsapp: string;
  calendly: string;
  color: string;
  blocks: LandingBlock[];
  fields: string[];
  published?: boolean;
};
export type UploadedImage = {
  demoUrl?: string;
  id: string;
  path: string;
  name: string;
  tags: string[];
  createdAt: string;
};
export type Booking = {
  id: string;
  customer_name: string;
  contact: string;
  details: Record<string, string>;
  status: string;
  created_at: string;
};
export type ContentDraft = {
  topic: string;
  tone: string;
  format: string;
  text: string;
  source: "ai" | "template";
};

export function defaultLanding(b: Business): LandingDraft {
  return {
    name: b.name,
    slug:
      b.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 45) || "mi-negocio",
    template: b.industry === "gastronomy" ? "restaurant" : "services",
    headline: `${b.offer}, pensado para ti`,
    description: `Descubre lo que hacemos en ${b.name}${b.location ? `, ${b.location}` : ""}.`,
    cta: "Quiero saber más",
    whatsapp: "",
    calendly: "",
    color: "#6B6B6B",
    blocks: [
      { id: "offer", title: "Lo que ofrecemos", body: b.offer },
      {
        id: "about",
        title: "Detrás de nuestro negocio",
        body: "Cuenta quién está detrás de tu negocio y qué te inspira.",
      },
    ],
    fields:
      b.industry === "gastronomy"
        ? ["Producto", "Cantidad", "Fecha", "Entrega o recojo"]
        : ["Servicio", "Fecha", "Personas"],
  };
}
