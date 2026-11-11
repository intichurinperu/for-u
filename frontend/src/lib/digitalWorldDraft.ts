import { isSupabaseConfigured, supabase } from './supabase';

export type DigitalDiagnosis = {
  clarityScore: number;
  priority: string;
  strategicRead: string;
  strengths: string[];
  risks: string[];
  recommendedTools: string[];
  missingContent: string[];
  launchPlan: string[];
};

export type DigitalWorldDraft = {
  businessName: string;
  businessType: string;
  businessTitle: string;
  businessShortName: string;
  tone: string;
  mainGoal: string;
  generatedPitch: string;
  primaryCta: string;
  world: string[];
  nextSteps: string[];
  questions: string[];
  diagnosis: DigitalDiagnosis;
  createdAt: string;
};

export type ConstructorState = {
  approvedBlocks: string[];
  completedTasks: string[];
  editedPitch: string;
  selectedBlockId: string;
  privatePreviewReady: boolean;
  updatedAt: string;
};

export type DigitalWorldPage = {
  themeId: LandingThemeId;
  publicSlug: string;
  publishStatus: 'draft' | 'ready' | 'published';
  fontStyle: 'serif' | 'modern' | 'rounded';
  blockStyle: 'soft' | 'cards' | 'bold';
  heroVisual: 'illustration' | 'image' | 'none';
  heroImageUrl: string;
  offerLayout: 'cards' | 'steps' | 'spotlight';
  heroTitle: string;
  heroSubtitle: string;
  ctaLabel: string;
  storyTitle: string;
  storyText: string;
  featuredTitle: string;
  featuredItems: Array<{
    title: string;
    description: string;
    detail: string;
  }>;
  trustItems: string[];
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
  contactLine: string;
  contactWhatsapp: string;
  locationText: string;
  businessHours: string;
  publishedAt?: string;
  updatedAt: string;
};

export type LandingThemeId = 'minimal' | 'editorial' | 'warm' | 'fresh' | 'bold';

export type LandingTheme = {
  id: LandingThemeId;
  name: string;
  description: string;
  bestFor: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  border: string;
  button: string;
  buttonText: string;
};

export const draftStorageKey = 'foru:digital-world-draft';
export const constructorStorageKey = 'foru:digital-world-constructor';
export const pageStorageKey = 'foru:digital-world-page';
const sessionStorageKey = 'foru:digital-world-session';

export const landingThemes: LandingTheme[] = [
  {
    id: 'minimal',
    name: 'Minimal premium',
    description: 'Limpio, sobrio y facil de leer.',
    bestFor: 'servicios, salud, consultorias',
    background: '#FAFAFA',
    surface: '#FAFAFA',
    text: '#0A0A0A',
    muted: '#6B6B6B',
    accent: '#0A0A0A',
    accentSoft: '#EAEAEA',
    border: '#EAEAEA',
    button: '#0A0A0A',
    buttonText: '#FAFAFA',
  },
  {
    id: 'editorial',
    name: 'Editorial elegante',
    description: 'Mas sofisticado, con aire de marca boutique.',
    bestFor: 'belleza, creativo, eventos',
    background: '#FAFAFA',
    surface: '#FAFAFA',
    text: '#0A0A0A',
    muted: '#6B6B6B',
    accent: '#6B6B6B',
    accentSoft: '#EAEAEA',
    border: '#EAEAEA',
    button: '#0A0A0A',
    buttonText: '#FAFAFA',
  },
  {
    id: 'warm',
    name: 'Calido cercano',
    description: 'Humano, acogedor y con energia amable.',
    bestFor: 'restaurantes, hospedajes, educacion',
    background: '#FAFAFA',
    surface: '#FAFAFA',
    text: '#0A0A0A',
    muted: '#6B6B6B',
    accent: '#6B6B6B',
    accentSoft: '#EAEAEA',
    border: '#EAEAEA',
    button: '#0A0A0A',
    buttonText: '#FAFAFA',
  },
  {
    id: 'fresh',
    name: 'Fresco natural',
    description: 'Ligero, saludable y ordenado.',
    bestFor: 'bienestar, experiencias, inmobiliaria',
    background: '#FAFAFA',
    surface: '#FAFAFA',
    text: '#0A0A0A',
    muted: '#6B6B6B',
    accent: '#6B6B6B',
    accentSoft: '#EAEAEA',
    border: '#EAEAEA',
    button: '#0A0A0A',
    buttonText: '#FAFAFA',
  },
  {
    id: 'bold',
    name: 'Moderno fuerte',
    description: 'Directo, comercial y con mas presencia.',
    bestFor: 'tiendas, eventos, productos',
    background: '#FAFAFA',
    surface: '#FAFAFA',
    text: '#0A0A0A',
    muted: '#6B6B6B',
    accent: '#0A0A0A',
    accentSoft: '#EAEAEA',
    border: '#EAEAEA',
    button: '#0A0A0A',
    buttonText: '#FAFAFA',
  },
];

export function getLandingTheme(themeId?: string) {
  return landingThemes.find((theme) => theme.id === themeId) ?? landingThemes[0];
}

export const fallbackDraft: DigitalWorldDraft = {
  businessName: 'tu negocio',
  businessType: 'general',
  businessTitle: 'Negocio digital',
  businessShortName: 'Negocio',
  tone: 'calido',
  mainGoal: 'conseguir mas clientes sin depender solo de redes sociales',
  generatedPitch: 'Tu negocio necesita una presencia digital clara, accionable y facil de publicar. La primera version debe explicar la oferta principal, mostrar confianza y llevar a una conversacion real.',
  primaryCta: 'Quiero mas informacion',
  world: ['Propuesta de valor', 'Secciones de confianza', 'Boton de contacto', 'Landing publica'],
  nextSteps: ['Aprobar la propuesta de valor', 'Subir fotos reales', 'Elegir el boton principal de venta'],
  questions: ['Que oferta quieres vender primero?', 'Que prueba social puedes mostrar?', 'Como quieres recibir contactos?'],
  diagnosis: {
    clarityScore: 62,
    priority: 'Aterrizar una primera oferta clara y publicable.',
    strategicRead: 'Hay una buena base, pero todavia falta convertir la idea del negocio en una ruta simple para que una visita entienda, confie y tome accion.',
    strengths: ['Tiene una intencion comercial clara', 'Puede lanzarse con una primera version simple'],
    risks: ['Demasiadas opciones pueden frenar la publicacion', 'Faltan pruebas visuales o testimonios'],
    recommendedTools: ['Landing publica', 'Boton de contacto', 'Formulario simple'],
    missingContent: ['Fotos reales', 'Descripcion corta', 'Preguntas frecuentes'],
    launchPlan: ['Definir oferta principal', 'Crear estructura de landing', 'Publicar version privada'],
  },
  createdAt: new Date().toISOString(),
};

const toolMap: Record<string, string[]> = {
  restaurante: ['Menu digital', 'Reservas', 'WhatsApp de pedidos', 'Mapa y horarios'],
  hospedaje: ['Catalogo de habitaciones', 'Consulta de disponibilidad', 'Galeria por ambientes', 'Mapa'],
  experiencias: ['Fichas de experiencia', 'Calendario de cupos', 'FAQ logistico', 'WhatsApp de reserva'],
  belleza: ['Agenda por servicio', 'Galeria antes/despues', 'Paquetes', 'Recordatorios'],
  bienestar: ['Calendario de clases', 'Planes', 'Formulario inicial', 'Membresias'],
  servicios: ['Formulario de diagnostico', 'Agenda de llamadas', 'Casos de exito', 'Propuesta de valor'],
  educacion: ['Pagina de inscripcion', 'Programa por modulos', 'Recursos', 'Comunidad'],
  tienda: ['Catalogo', 'Colecciones', 'Pedido por WhatsApp', 'Ficha de producto'],
  eventos: ['Cotizador', 'Paquetes', 'Galeria por ocasion', 'Calendario'],
  salud: ['Agenda de citas', 'Servicios por especialidad', 'Indicaciones previas', 'Perfil profesional'],
  inmobiliaria: ['Catalogo de propiedades', 'Filtros', 'Agenda de visitas', 'Mapa'],
  creativo: ['Portafolio', 'Paquetes', 'Formulario de brief', 'Agenda creativa'],
};

export function generateDigitalDiagnosis(input: {
  businessName: string;
  businessType: string;
  businessShortName: string;
  tone: string;
  mainGoal: string;
  primaryCta: string;
  world: string[];
  nextSteps: string[];
}): DigitalDiagnosis {
  const recommendedTools = toolMap[input.businessType] ?? ['Landing publica', 'Boton de contacto', 'Formulario simple'];
  const clarityScore = Math.min(92, 58 + input.world.length * 5 + input.nextSteps.length * 4);

  return {
    clarityScore,
    priority: input.nextSteps[0] ?? 'Definir una primera oferta publicable.',
    strategicRead: `${input.businessName} ya tiene una direccion: crear una experiencia ${input.tone} para ${input.mainGoal}. Lo mas importante es que la primera version no intente hacerlo todo; debe mostrar confianza, explicar la oferta y llevar al CTA "${input.primaryCta}".`,
    strengths: [
      `El rubro ${input.businessShortName.toLowerCase()} permite una ruta digital muy concreta.`,
      `El CTA "${input.primaryCta}" reduce la friccion para el cliente.`,
      'La estructura puede publicarse por etapas sin esperar a tener todo perfecto.',
    ],
    risks: [
      'Querer lanzar con demasiadas secciones puede retrasar la publicacion.',
      'Si faltan fotos reales, la confianza visual baja.',
      'Si la oferta principal no queda clara, la visita no sabra que accion tomar.',
    ],
    recommendedTools,
    missingContent: [
      '3 a 6 fotos reales del negocio o resultado',
      'Descripcion corta de la oferta principal',
      'Horario, ubicacion o disponibilidad',
      'Pruebas de confianza: reseñas, casos, antes/despues o credenciales',
    ],
    launchPlan: [
      input.nextSteps[0] ?? 'Ordenar la oferta principal',
      input.world[0] ?? 'Crear la primera seccion de la landing',
      `Activar el CTA "${input.primaryCta}"`,
      'Publicar una version privada para revisar',
    ],
  };
}

function getSessionId() {
  const existingSession = localStorage.getItem(sessionStorageKey);

  if (existingSession) return existingSession;

  const nextSession = crypto.randomUUID();
  localStorage.setItem(sessionStorageKey, nextSession);

  return nextSession;
}

export function loadLocalDraft(): DigitalWorldDraft {
  const rawDraft = localStorage.getItem(draftStorageKey);

  if (!rawDraft) return fallbackDraft;

  try {
    const parsedDraft = JSON.parse(rawDraft);

    return {
      ...fallbackDraft,
      ...parsedDraft,
      diagnosis: parsedDraft.diagnosis ?? fallbackDraft.diagnosis,
    };
  } catch {
    return fallbackDraft;
  }
}

export function saveLocalDraft(draft: DigitalWorldDraft) {
  localStorage.setItem(draftStorageKey, JSON.stringify(draft));
}

export function loadConstructorState(draft: DigitalWorldDraft): ConstructorState {
  const rawState = localStorage.getItem(constructorStorageKey);
  const fallbackState: ConstructorState = {
    approvedBlocks: ['diagnosis'],
    completedTasks: [],
    editedPitch: draft.generatedPitch,
    selectedBlockId: 'pitch',
    privatePreviewReady: false,
    updatedAt: new Date().toISOString(),
  };

  if (!rawState) return fallbackState;

  try {
    return { ...fallbackState, ...JSON.parse(rawState) };
  } catch {
    return fallbackState;
  }
}

export function saveConstructorState(state: ConstructorState) {
  localStorage.setItem(constructorStorageKey, JSON.stringify({
    ...state,
    updatedAt: new Date().toISOString(),
  }));
}

export function createDefaultPage(draft: DigitalWorldDraft, constructorState?: ConstructorState): DigitalWorldPage {
  const pitch = constructorState?.editedPitch || draft.generatedPitch;
  const publicSlug = draft.businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42) || 'mi-negocio';

  return {
    themeId: draft.businessType === 'restaurante' || draft.businessType === 'hospedaje' || draft.businessType === 'educacion'
      ? 'warm'
      : draft.businessType === 'bienestar' || draft.businessType === 'experiencias' || draft.businessType === 'inmobiliaria'
        ? 'fresh'
        : draft.businessType === 'belleza' || draft.businessType === 'creativo' || draft.businessType === 'eventos'
          ? 'editorial'
          : draft.businessType === 'tienda'
            ? 'bold'
            : 'minimal',
    publicSlug,
    publishStatus: 'draft',
    fontStyle: draft.tone === 'moderno' ? 'modern' : draft.tone === 'calido' ? 'rounded' : 'serif',
    blockStyle: draft.businessType === 'tienda' || draft.businessType === 'eventos' ? 'bold' : 'soft',
    heroVisual: 'illustration',
    heroImageUrl: '',
    offerLayout: draft.businessType === 'servicios' || draft.businessType === 'salud' ? 'steps' : 'cards',
    heroTitle: draft.businessName,
    heroSubtitle: pitch,
    ctaLabel: draft.primaryCta,
    storyTitle: `La esencia de ${draft.businessName}`,
    storyText: draft.diagnosis.strategicRead,
    featuredTitle: draft.world[0] ?? 'Lo mas importante',
    featuredItems: draft.world.slice(0, 4).map((block, index) => ({
      title: block,
      description: draft.diagnosis.launchPlan[index] ?? 'Seccion recomendada por IA para lanzar una primera version clara.',
      detail: index === 0 ? 'Prioridad alta' : 'Construccion guiada',
    })),
    trustItems: draft.diagnosis.strengths,
    faqItems: draft.questions.slice(0, 3).map((question, index) => ({
      question,
      answer: draft.diagnosis.missingContent[index] ?? 'La IA recomienda responder esto antes de publicar.',
    })),
    contactLine: `Camino principal recomendado: ${draft.primaryCta}`,
    contactWhatsapp: '',
    locationText: 'Ubicacion por definir',
    businessHours: 'Horarios por configurar',
    updatedAt: new Date().toISOString(),
  };
}

export function loadDigitalWorldPage(draft: DigitalWorldDraft, constructorState?: ConstructorState): DigitalWorldPage {
  const rawPage = localStorage.getItem(pageStorageKey);
  const fallbackPage = createDefaultPage(draft, constructorState);

  if (!rawPage) return fallbackPage;

  try {
    return { ...fallbackPage, ...JSON.parse(rawPage) };
  } catch {
    return fallbackPage;
  }
}

export function saveDigitalWorldPage(page: DigitalWorldPage) {
  localStorage.setItem(pageStorageKey, JSON.stringify({
    ...page,
    updatedAt: new Date().toISOString(),
  }));
}

export async function saveDigitalWorldDraft(draft: DigitalWorldDraft) {
  saveLocalDraft(draft);

  if (!isSupabaseConfigured || !supabase) {
    return { savedRemote: false, reason: 'supabase_not_configured' };
  }

  const { error } = await supabase.from('digital_world_drafts').insert({
    session_id: getSessionId(),
    business_name: draft.businessName,
    business_type: draft.businessType,
    business_title: draft.businessTitle,
    tone: draft.tone,
    main_goal: draft.mainGoal,
    generated_pitch: draft.generatedPitch,
    primary_cta: draft.primaryCta,
    world_blocks: draft.world,
    next_steps: draft.nextSteps,
    ai_questions: draft.questions,
    diagnosis: draft.diagnosis,
    clarity_score: draft.diagnosis.clarityScore,
    priority: draft.diagnosis.priority,
    payload: draft,
  });

  if (error) {
    console.warn('No se pudo guardar el borrador en Supabase:', error.message);
    return { savedRemote: false, reason: error.message };
  }

  return { savedRemote: true };
}
