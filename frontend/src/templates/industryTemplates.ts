import type { ForUBranchKey, ForUFeelingType, ForUNodePriority } from '../stores/useActiveProjectsStore';

import { businessTemplates, type TemplateKey } from '../data/templates';
export type ForUIndustryKey = 'tourism' | TemplateKey;

export type ForUIndustryTemplateNode = {
  idSuffix: string;
  title: string;
  description: string;
  branchKey: ForUBranchKey;
  icon: string;
  priority: ForUNodePriority;
  feelingType?: ForUFeelingType;
  x: number;
  y: number;
};

export type ForUIndustryTemplateRouteStep = {
  idSuffix: string;
  title: string;
  linkedNodeSuffix: string;
};

export type ForUIndustryTemplate = {
  key: ForUIndustryKey;
  name: string;
  source: string;
  description: string;
  defaultProjectName: string;
  tangibleGoal: string;
  targetFeelings: ForUFeelingType[];
  strategyProfile: Record<string, unknown>;
  nodes: ForUIndustryTemplateNode[];
  route: ForUIndustryTemplateRouteStep[];
};

export const tourismTemplate: ForUIndustryTemplate = {
  key: 'tourism',
  name: 'Turismo / experiencias',
  source: 'inti-churin-demo',
  description: 'Sistema estratégico inspirado en INTI CHURIN: experiencias, anfitrión, confianza, disponibilidad, WhatsApp y landings.',
  defaultProjectName: 'Sistema turismo experiencial',
  tangibleGoal: 'Convertir una oferta turística en experiencias claras, vendibles y fáciles de reservar.',
  targetFeelings: ['connection', 'abundance', 'confidence'],
  strategyProfile: {
    reference: 'INTI CHURIN',
    model: 'Turismo emocional y experiencial',
    primaryChannel: 'WhatsApp',
    strategicAssets: [
      'Experiencia estrella',
      'Historia del anfitrión',
      'Galería de confianza',
      'Calendario de disponibilidad',
      'Solicitud de reserva',
      'Landing por experiencia',
    ],
  },
  nodes: [
    {
      idSuffix: 'offer-star',
      title: 'Definir experiencia estrella',
      description: 'Elige una experiencia turística principal: nombre, promesa, duración, lugar, precio inicial y qué transformación vive el viajero.',
      branchKey: 'ideas',
      icon: '🏔️',
      priority: 'high',
      feelingType: 'confidence',
      x: 260,
      y: 120,
    },
    {
      idSuffix: 'traveler-profile',
      title: 'Clarificar viajero ideal',
      description: 'Describe quién compra esta experiencia, qué busca sentir, qué le preocupa y qué necesita leer para confiar.',
      branchKey: 'marketing',
      icon: '🧭',
      priority: 'high',
      feelingType: 'connection',
      x: 860,
      y: 520,
    },
    {
      idSuffix: 'whatsapp-script',
      title: 'Crear guion de venta por WhatsApp',
      description: 'Redacta un mensaje corto para responder consultas: saludo, experiencia recomendada, disponibilidad, precio y siguiente paso.',
      branchKey: 'actions',
      icon: '💬',
      priority: 'high',
      feelingType: 'abundance',
      x: 980,
      y: 180,
    },
    {
      idSuffix: 'trust-story',
      title: 'Contar historia del anfitrión',
      description: 'Escribe una historia breve del guía/anfitrión y por qué esa experiencia existe. Esto reemplaza venta fría por confianza.',
      branchKey: 'marketing',
      icon: '🌞',
      priority: 'medium',
      feelingType: 'connection',
      x: 920,
      y: 650,
    },
    {
      idSuffix: 'availability-system',
      title: 'Ordenar disponibilidad y reservas',
      description: 'Define días disponibles, cupos, datos que debe dejar el viajero y cuándo se confirma la reserva.',
      branchKey: 'finances',
      icon: '📅',
      priority: 'medium',
      feelingType: 'abundance',
      x: 1040,
      y: 400,
    },
    {
      idSuffix: 'landing-assets',
      title: 'Preparar landing de experiencia',
      description: 'Reúne título, subtítulo, 3 beneficios, itinerario simple, fotos y botón a WhatsApp para una página vendible.',
      branchKey: 'resources',
      icon: '🖼️',
      priority: 'medium',
      feelingType: 'creativity',
      x: 140,
      y: 650,
    },
  ],
  route: [
    { idSuffix: 'define-offer', title: 'Definir experiencia estrella', linkedNodeSuffix: 'offer-star' },
    { idSuffix: 'choose-traveler', title: 'Clarificar viajero ideal', linkedNodeSuffix: 'traveler-profile' },
    { idSuffix: 'sell-whatsapp', title: 'Crear mensaje de WhatsApp', linkedNodeSuffix: 'whatsapp-script' },
    { idSuffix: 'build-trust', title: 'Construir confianza', linkedNodeSuffix: 'trust-story' },
    { idSuffix: 'prepare-landing', title: 'Preparar landing inicial', linkedNodeSuffix: 'landing-assets' },
  ],
};

export const gastronomyTemplate: ForUIndustryTemplate = {
  key: 'gastronomy',
  name: 'Gastronomía',
  source: 'gastronomy-mvp',
  description: 'Sistema estratégico para restaurantes, cafeterías, dark kitchens, catering y marcas de comida: oferta estrella, pedidos, contenido, reservas y fidelización.',
  defaultProjectName: 'Sistema gastronómico',
  tangibleGoal: 'Convertir una propuesta gastronómica en una oferta clara, vendible y repetible.',
  targetFeelings: ['abundance', 'confidence', 'joy'],
  strategyProfile: {
    reference: 'Sistema gastronómico For U',
    model: 'Oferta estrella, canal de pedidos, contenido y recompra',
    primaryChannel: 'WhatsApp',
    strategicAssets: [
      'Producto estrella',
      'Menú simple',
      'Sistema de pedidos',
      'Contenido de antojo',
      'Promociones semanales',
      'Fidelización',
    ],
  },
  nodes: [
    {
      idSuffix: 'signature-offer',
      title: 'Definir producto estrella',
      description: 'Elige el plato, combo, box, menú o experiencia gastronómica que será la entrada principal de ventas.',
      branchKey: 'ideas',
      icon: '🍽️',
      priority: 'high',
      feelingType: 'confidence',
      x: 260,
      y: 120,
    },
    {
      idSuffix: 'customer-craving',
      title: 'Clarificar cliente y antojo',
      description: 'Define quién compra, qué momento resuelve, qué antojo activa y qué objeciones necesita superar.',
      branchKey: 'marketing',
      icon: '😋',
      priority: 'high',
      feelingType: 'connection',
      x: 860,
      y: 520,
    },
    {
      idSuffix: 'order-flow',
      title: 'Crear flujo de pedido',
      description: 'Define cómo pide el cliente: WhatsApp, delivery, reserva, pago, confirmación y seguimiento.',
      branchKey: 'actions',
      icon: '🧾',
      priority: 'high',
      feelingType: 'abundance',
      x: 980,
      y: 180,
    },
    {
      idSuffix: 'menu-profit',
      title: 'Ordenar precios y margen',
      description: 'Calcula precio base, costo, margen, combos y promociones sin perder rentabilidad.',
      branchKey: 'finances',
      icon: '💰',
      priority: 'high',
      feelingType: 'abundance',
      x: 1040,
      y: 400,
    },
    {
      idSuffix: 'content-craving',
      title: 'Crear contenido de antojo',
      description: 'Prepara fotos, reels, historias y mensajes que hagan fácil desear, pedir y repetir.',
      branchKey: 'marketing',
      icon: '📸',
      priority: 'medium',
      feelingType: 'creativity',
      x: 920,
      y: 650,
    },
    {
      idSuffix: 'loyalty-assets',
      title: 'Preparar fidelización',
      description: 'Define mensaje post-compra, beneficios para volver, lista de clientes y calendario semanal.',
      branchKey: 'resources',
      icon: '💌',
      priority: 'medium',
      feelingType: 'joy',
      x: 140,
      y: 650,
    },
  ],
  route: [
    { idSuffix: 'define-product', title: 'Definir producto estrella', linkedNodeSuffix: 'signature-offer' },
    { idSuffix: 'choose-customer', title: 'Clarificar cliente y antojo', linkedNodeSuffix: 'customer-craving' },
    { idSuffix: 'price-profit', title: 'Ordenar precios y margen', linkedNodeSuffix: 'menu-profit' },
    { idSuffix: 'sell-orders', title: 'Crear flujo de pedido', linkedNodeSuffix: 'order-flow' },
    { idSuffix: 'repeat-customers', title: 'Activar recompra', linkedNodeSuffix: 'loyalty-assets' },
  ],
};

const thinkingTemplates = Object.fromEntries(businessTemplates.map<[TemplateKey,ForUIndustryTemplate]>(template => [template.key, {
  key: template.key, name: template.name, source: 'foru-design-thinking-v1', description: template.entry,
  defaultProjectName: 'Mi negocio de ' + template.name.toLowerCase(), tangibleGoal: template.entry,
  targetFeelings: ['connection','confidence'], strategyProfile: {primaryChannel:'Web',offerType:template.offer,idealTraveler:template.audience,strategicAssets:template.steps.map(step=>step.title),salesEntry:template.entry},
  nodes: template.steps.map((step,index)=>({idSuffix:step.id,title:step.title,description:step.tasks.join('\n'),branchKey:'actions',icon:String(index+1),priority:'high',x:index%2?700:260,y:120+index*140})),
  route: template.steps.map(step=>({idSuffix:step.id,title:step.title,linkedNodeSuffix:step.id})),
}])) as Record<TemplateKey,ForUIndustryTemplate>;
export const industryTemplates: Record<ForUIndustryKey, ForUIndustryTemplate> = {tourism:tourismTemplate,...thinkingTemplates};
