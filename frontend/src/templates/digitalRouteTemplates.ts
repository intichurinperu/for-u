import { getBusinessTemplate } from '../data/templates';
import type { ForUIndustryKey } from './industryTemplates';
import type { ForUBranchKey, ForUNodePriority } from '../stores/useActiveProjectsStore';

export type ForUDigitalRouteStepStatus = 'pending' | 'in_progress' | 'ready';

export type ForUDigitalRouteTaskTemplate = {
  title: string;
  description: string;
  branchKey: ForUBranchKey;
  priority: ForUNodePriority;
  time?: string;
  tools?: string[];
  tip?: string;
  example?: string;
};

export type ForUDigitalRouteResourceTemplate = {
  icon: string;
  text: string;
  description: string;
  filename?: string;
  content?: string;
};

export type ForUDigitalRouteStepTemplate = {
  id: string;
  title: string;
  shortTitle: string;
  badge: string;
  outcome: string;
  why: string;
  primaryAction: string;
  outputKey: string;
  artifactLabel: string;
  priority: ForUNodePriority;
  guidePhase: string;
  resources: ForUDigitalRouteResourceTemplate[];
  tasks: ForUDigitalRouteTaskTemplate[];
  defaultOutputs: Record<string, string>;
};

export type ForUDigitalRouteTemplate = {
  industryKey: ForUIndustryKey | 'generic';
  title: string;
  description: string;
  steps: ForUDigitalRouteStepTemplate[];
};

const tourismDefaults = {
  destination: '[destino]',
  traveler: '[viajero ideal]',
  offer: '[experiencia principal]',
  channel: 'WhatsApp',
};

const stepGuidance: Record<string, Pick<ForUDigitalRouteStepTemplate, 'priority' | 'guidePhase' | 'resources'>> = {
  'strategy-base': {
    priority: 'high',
    guidePhase: 'Entender',
    resources: [
      { icon: '◇', text: 'Brief de claridad', description: 'Plantilla simple para decir qué vendes, a quién y por qué importa.' },
      { icon: '✦', text: 'Mapa de cliente ideal', description: 'Guía corta para convertir intuición en perfil accionable.' },
    ],
  },
  'signature-offer': {
    priority: 'high',
    guidePhase: 'Convertir',
    resources: [
      { icon: '◆', text: 'Ficha de oferta estrella', description: 'Estructura para nombre, precio, beneficios, objeciones y promesa.' },
      { icon: '◌', text: 'Calculadora simple', description: 'Referencia para pensar precio base, margen y esfuerzo.' },
    ],
  },
  landing: {
    priority: 'high',
    guidePhase: 'Publicar',
    resources: [
      { icon: '▣', text: 'Editor de landing', description: 'Abre la página editable conectada a esta estación.' },
      { icon: '◈', text: 'Checklist visual', description: 'Portada, beneficios, prueba social, FAQ y llamado a la acción.' },
    ],
  },
  'whatsapp-conversion': {
    priority: 'high',
    guidePhase: 'Responder',
    resources: [
      { icon: '◑', text: 'Guion de bienvenida', description: 'Mensaje base para responder sin improvisar cada vez.' },
      { icon: '✧', text: 'Seguimiento amable', description: 'Plantilla para retomar conversaciones sin presión.' },
    ],
  },
  'content-system': {
    priority: 'medium',
    guidePhase: 'Atraer',
    resources: [
      { icon: '✶', text: 'Banco de ideas', description: 'Ideas de posts, reels e historias según objetivo de venta.' },
      { icon: '▥', text: 'Calendario mínimo', description: 'Plan semanal pequeño para no convertir contenido en caos.' },
    ],
  },
  'google-presence': {
    priority: 'medium',
    guidePhase: 'Aparecer',
    resources: [
      { icon: '◎', text: 'Checklist Google', description: 'Categoría, descripción, fotos, horarios, ubicación y reseñas.' },
      { icon: '✦', text: 'FAQ local', description: 'Preguntas frecuentes para reducir dudas antes del contacto.' },
    ],
  },
  'trust-assets': {
    priority: 'medium',
    guidePhase: 'Confiar',
    resources: [
      { icon: '◍', text: 'Historia del negocio', description: 'Guía para contar quién está detrás sin sonar genérico.' },
      { icon: '✺', text: 'Kit de prueba social', description: 'Fotos, testimonios, resultados, reseñas y garantías.' },
    ],
  },
  'metrics-improvement': {
    priority: 'low',
    guidePhase: 'Mejorar',
    resources: [
      { icon: '⌁', text: 'Tablero semanal', description: 'Métricas simples: visitas, clics, mensajes, reservas y dudas.' },
      { icon: '◇', text: 'Lista de mejoras', description: 'Convierte señales reales en ajustes de landing, contenido y WhatsApp.' },
    ],
  },
};

const taskExamples: Record<string, Array<Pick<ForUDigitalRouteTaskTemplate, 'time' | 'tools' | 'tip' | 'example'>>> = {
  'strategy-base': [
    {
      time: '15 min',
      tools: ['Brief', 'Notas'],
      tip: 'Escribe una frase imperfecta. For U la puede pulir después.',
      example: 'Vendemos caminatas suaves para parejas que quieren desconectar sin organizar todo solas.',
    },
    {
      time: '12 min',
      tools: ['Cliente ideal', 'Mapa de dudas'],
      tip: 'Piensa en una persona real, no en “todo el mundo”.',
      example: 'Parejas de Lima que quieren una escapada confiable de fin de semana.',
    },
  ],
  'signature-offer': [
    {
      time: '20 min',
      tools: ['Oferta', 'Precio'],
      tip: 'Primero define una versión simple; luego agregamos extras.',
      example: 'Tour privado de medio día + guía local + fotos + reserva por WhatsApp.',
    },
    {
      time: '10 min',
      tools: ['Beneficios', 'Copy'],
      tip: 'Un beneficio responde: “¿qué cambia para mi cliente?”.',
      example: 'No tienes que planificar: llegas, disfrutas y vuelves con fotos lindas.',
    },
  ],
  landing: [
    {
      time: '18 min',
      tools: ['Editor', 'Copy'],
      tip: 'La portada solo necesita promesa clara, contexto y botón.',
      example: 'Escápate a una experiencia local lista para reservar por WhatsApp.',
    },
    {
      time: '10 min',
      tools: ['Fotos', 'Galería'],
      tip: 'Mejor fotos reales imperfectas que imágenes bonitas sin confianza.',
      example: 'Lugar, anfitrión, experiencia, detalle y una persona disfrutando.',
    },
  ],
  'whatsapp-conversion': [
    {
      time: '12 min',
      tools: ['WhatsApp', 'Guion'],
      tip: 'La respuesta debe pedir pocos datos y dar seguridad rápido.',
      example: 'Hola, gracias por escribir. Te cuento disponibilidad y te pido fecha + número de personas.',
    },
    {
      time: '8 min',
      tools: ['Reserva', 'Formulario corto'],
      tip: 'Solo pide lo mínimo para avanzar a una reserva real.',
      example: 'Fecha, cantidad, nombre, teléfono y preferencia de horario.',
    },
  ],
  'content-system': [
    {
      time: '15 min',
      tools: ['Instagram', 'Calendario'],
      tip: 'Crea contenido para resolver dudas, no para llenar espacio.',
      example: 'Reel: 3 razones para reservar esta experiencia antes del fin de semana.',
    },
    {
      time: '12 min',
      tools: ['Historias', 'Detrás de escena'],
      tip: 'Lo cotidiano también vende confianza.',
      example: 'Preparando ruta, revisando clima, mostrando el punto de encuentro.',
    },
  ],
  'google-presence': [
    {
      time: '15 min',
      tools: ['Google Business', 'Descripción'],
      tip: 'Escribe para una persona que está comparando opciones.',
      example: 'Experiencias locales guiadas en [zona], con reserva por WhatsApp y grupos pequeños.',
    },
    {
      time: '12 min',
      tools: ['Fotos', 'Perfil local'],
      tip: 'Google necesita pruebas visuales de que existes y eres confiable.',
      example: 'Fachada, equipo, producto/experiencia, clientes, ubicación y detalles.',
    },
  ],
  'trust-assets': [
    {
      time: '14 min',
      tools: ['Historia', 'Confianza'],
      tip: 'Cuenta por qué haces esto, no solo qué vendes.',
      example: 'Nacimos para mostrar este lugar con calma, seguridad y mirada local.',
    },
    {
      time: '10 min',
      tools: ['Testimonios', 'Fotos'],
      tip: 'Una prueba pequeña vale más que una promesa gigante.',
      example: 'Captura de reseña, foto real, resultado, mención o pregunta respondida.',
    },
  ],
  'metrics-improvement': [
    {
      time: '10 min',
      tools: ['Métricas', 'Semana'],
      tip: 'Mide solo lo que ayuda a decidir el siguiente ajuste.',
      example: 'Clics a WhatsApp, mensajes recibidos, reservas, dudas repetidas.',
    },
    {
      time: '10 min',
      tools: ['FAQ', 'Mejora'],
      tip: 'Cada duda repetida es una mejora lista para landing o contenido.',
      example: 'Si preguntan mucho por precio, crea una sección “qué incluye”.',
    },
  ],
};

type DigitalRouteStepDraft = Omit<ForUDigitalRouteStepTemplate, 'priority' | 'guidePhase' | 'resources'> &
  Partial<Pick<ForUDigitalRouteStepTemplate, 'priority' | 'guidePhase' | 'resources'>>;

function withRouteGuidance(steps: DigitalRouteStepDraft[]): ForUDigitalRouteStepTemplate[] {
  return steps.map((step) => ({
    ...stepGuidance[step.id],
    ...step,
    tasks: step.tasks.map((task, index) => ({
      ...taskExamples[step.id]?.[index],
      ...task,
    })),
  }));
}

export const tourismDigitalRouteTemplate: ForUDigitalRouteTemplate = {
  industryKey: 'tourism',
  title: 'Ruta Digital Turismo',
  description: 'De experiencia suelta a sistema completo: oferta, landing, reservas, contenido, Google, confianza y mejora.',
  steps: withRouteGuidance([
    {
      id: 'strategy-base',
      title: 'Base Estratégica',
      shortTitle: 'Base',
      badge: 'Claridad',
      outcome: 'Brief claro del negocio y de la experiencia que se quiere vender.',
      why: 'Si la base está clara, la landing, el contenido y WhatsApp dejan de sentirse como piezas sueltas.',
      primaryAction: 'Completar brief base',
      outputKey: 'strategyBrief',
      artifactLabel: 'Brief estratégico',
      defaultOutputs: {
        offer: `Una ${tourismDefaults.offer} en ${tourismDefaults.destination}.`,
        audience: `Pensada para ${tourismDefaults.traveler}.`,
        promise: 'Una experiencia fácil de entender, confiar y reservar.',
      },
      tasks: [
        {
          title: 'Escribir qué experiencia se vende en una frase',
          description: 'Define qué vive la persona, dónde ocurre y por qué debería importarle.',
          branchKey: 'ideas',
          priority: 'high',
        },
        {
          title: 'Definir viajero ideal y principal deseo',
          description: 'Describe quién compra, qué busca sentir y qué duda necesita resolver.',
          branchKey: 'marketing',
          priority: 'high',
        },
      ],
    },
    {
      id: 'signature-offer',
      title: 'Oferta / Producto Estrella',
      shortTitle: 'Oferta',
      badge: 'Venta',
      outcome: 'Oferta principal lista para comunicar con beneficios, precio base y objeciones.',
      why: 'For U necesita una oferta estrella para que todo lo demás apunte al mismo destino.',
      primaryAction: 'Diseñar oferta estrella',
      outputKey: 'signatureOffer',
      artifactLabel: 'Oferta vendible',
      defaultOutputs: {
        name: 'Experiencia principal',
        includes: 'Incluye guía/anfitrión, momentos clave, detalles logísticos y siguiente paso de reserva.',
        objections: 'Precio, seguridad, disponibilidad, duración y qué pasa si cambia la fecha.',
      },
      tasks: [
        {
          title: 'Definir nombre, duración y precio base de la experiencia',
          description: 'Crea una oferta concreta que se pueda explicar en menos de 30 segundos.',
          branchKey: 'finances',
          priority: 'high',
        },
        {
          title: 'Escribir 3 beneficios concretos para el viajero',
          description: 'Transforma características en razones para reservar.',
          branchKey: 'marketing',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'landing',
      title: 'Landing / Página de Venta',
      shortTitle: 'Landing',
      badge: 'Editor',
      outcome: 'Página editable y publicable con promesa, beneficios, confianza, FAQ y CTA.',
      why: 'La landing es el lugar donde el viajero entiende, confía y decide escribir.',
      primaryAction: 'Abrir editor de landing',
      outputKey: 'landingDraft',
      artifactLabel: 'Landing editable',
      defaultOutputs: {
        hero: `Vive una ${tourismDefaults.offer} en ${tourismDefaults.destination}.`,
        cta: `Reservar por ${tourismDefaults.channel}`,
        sections: 'Portada, beneficios, itinerario, confianza, galería, preguntas y reserva.',
      },
      tasks: [
        {
          title: 'Escribir portada de la landing',
          description: 'Título, subtítulo y botón principal para explicar la experiencia.',
          branchKey: 'marketing',
          priority: 'high',
        },
        {
          title: 'Elegir 5 fotos reales para la landing',
          description: 'Selecciona fotos de lugar, personas, detalle, confianza y experiencia.',
          branchKey: 'resources',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'whatsapp-conversion',
      title: 'WhatsApp / Conversión',
      shortTitle: 'WhatsApp',
      badge: 'Reservas',
      outcome: 'Guion simple para responder consultas y convertir interesados en reservas.',
      why: 'La venta real suele pasar en conversación, no solo en la página.',
      primaryAction: 'Crear guion de WhatsApp',
      outputKey: 'whatsappFlow',
      artifactLabel: 'Guion de conversión',
      defaultOutputs: {
        welcome: 'Gracias por escribir. Te cuento cómo funciona la experiencia y qué necesito para confirmar disponibilidad.',
        data: 'Fecha, cantidad de personas, idioma/ritmo, restricciones y contacto.',
        followup: 'Mensaje amable para retomar si la persona no responde.',
      },
      tasks: [
        {
          title: 'Redactar mensaje de bienvenida para consultas',
          description: 'Mensaje breve con experiencia recomendada, disponibilidad y siguiente paso.',
          branchKey: 'actions',
          priority: 'high',
        },
        {
          title: 'Definir datos mínimos para confirmar reserva',
          description: 'Evita conversaciones eternas pidiendo solo lo necesario.',
          branchKey: 'finances',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'content-system',
      title: 'Contenido',
      shortTitle: 'Contenido',
      badge: 'Atracción',
      outcome: 'Ideas de posts, reels e historias para atraer, educar, generar confianza y vender.',
      why: 'El contenido debe alimentar la ruta, no convertirse en una lista infinita.',
      primaryAction: 'Crear plan de contenido',
      outputKey: 'contentPlan',
      artifactLabel: 'Plan de contenido',
      defaultOutputs: {
        pillars: 'Deseo de viaje, confianza, detrás de escena, prueba social y reserva.',
        weekly: '1 reel, 2 historias, 1 post de confianza y 1 CTA directo.',
      },
      tasks: [
        {
          title: 'Crear 5 ideas de contenido para vender la experiencia',
          description: 'Incluye deseo, confianza, detrás de escena y llamado a reservar.',
          branchKey: 'marketing',
          priority: 'medium',
        },
        {
          title: 'Escribir 3 historias con detrás de escena',
          description: 'Muestra preparación, anfitrión y detalles reales.',
          branchKey: 'marketing',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'google-presence',
      title: 'Google / Presencia Local',
      shortTitle: 'Google',
      badge: 'Visibilidad',
      outcome: 'Checklist para aparecer mejor y generar confianza desde Google.',
      why: 'Muchas personas buscan antes de escribir. Google debe confirmar que el negocio existe y es confiable.',
      primaryAction: 'Completar checklist de Google',
      outputKey: 'googleChecklist',
      artifactLabel: 'Perfil local',
      defaultOutputs: {
        category: 'Experiencia turística / guía local / agencia, según el caso.',
        essentials: 'Descripción, ubicación, horarios, fotos, servicios, reseñas y preguntas frecuentes.',
      },
      tasks: [
        {
          title: 'Escribir descripción corta para Google Business',
          description: 'Texto claro con ubicación, experiencia, público y forma de reserva.',
          branchKey: 'marketing',
          priority: 'medium',
        },
        {
          title: 'Preparar 8 fotos para Google',
          description: 'Mezcla lugar, equipo/anfitrión, experiencia, señalización y detalles.',
          branchKey: 'resources',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'trust-assets',
      title: 'Confianza / Prueba Social',
      shortTitle: 'Confianza',
      badge: 'Seguridad',
      outcome: 'Activos que reducen dudas: historia, testimonios, fotos reales y garantías.',
      why: 'La confianza convierte curiosidad en reserva.',
      primaryAction: 'Crear activos de confianza',
      outputKey: 'trustAssets',
      artifactLabel: 'Pruebas de confianza',
      defaultOutputs: {
        story: 'Historia breve del anfitrión y por qué existe la experiencia.',
        proof: 'Testimonios, fotos reales, datos logísticos y respuestas a dudas.',
      },
      tasks: [
        {
          title: 'Escribir historia breve del anfitrión',
          description: 'Cuenta por qué esta experiencia existe y por qué se puede confiar.',
          branchKey: 'marketing',
          priority: 'medium',
        },
        {
          title: 'Recolectar 3 pruebas de confianza',
          description: 'Testimonios, fotos, menciones, reseñas o datos logísticos claros.',
          branchKey: 'resources',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'metrics-improvement',
      title: 'Métricas y Mejora',
      shortTitle: 'Mejora',
      badge: 'Ciclo',
      outcome: 'Sistema simple para medir mensajes, reservas, dudas y próxima mejora.',
      why: 'La ruta no termina al publicar. Se mejora con señales reales.',
      primaryAction: 'Definir tablero de mejora',
      outputKey: 'metricsLoop',
      artifactLabel: 'Ciclo de mejora',
      defaultOutputs: {
        metrics: 'Visitas, clics a WhatsApp, mensajes, reservas, dudas repetidas y contenido que más conecta.',
        next: 'Una mejora semanal basada en conversaciones reales.',
      },
      tasks: [
        {
          title: 'Definir 4 métricas simples para revisar cada semana',
          description: 'Elige números que ayuden a mejorar sin abrumarte.',
          branchKey: 'finances',
          priority: 'low',
        },
        {
          title: 'Crear lista de dudas repetidas para mejorar landing y contenido',
          description: 'Cada duda real se convierte en FAQ, post o ajuste de oferta.',
          branchKey: 'actions',
          priority: 'low',
        },
      ],
    },
  ]),
};

export const gastronomyDigitalRouteTemplate: ForUDigitalRouteTemplate = {
  ...tourismDigitalRouteTemplate,
  industryKey: 'gastronomy',
  title: 'Ruta Digital Gastronomía',
  description: 'Oferta estrella, menú/landing, pedidos, contenido, Google, confianza y recompra.',
  steps: tourismDigitalRouteTemplate.steps.map((step) => {
    const replacements: Record<string, Partial<ForUDigitalRouteStepTemplate>> = {
      'signature-offer': {
        title: 'Producto Estrella',
        shortTitle: 'Producto',
        outcome: 'Producto o combo principal listo para vender con precio, margen y forma de pedido.',
        primaryAction: 'Diseñar producto estrella',
        artifactLabel: 'Producto vendible',
        defaultOutputs: {
          name: 'Producto o combo estrella',
          includes: 'Incluye presentación, precio, margen, forma de pedido y entrega.',
          objections: 'Precio, porciones, horarios, delivery, pago y confianza.',
        },
        tasks: [
          {
            title: 'Definir producto o combo estrella',
            description: 'Elige qué plato, combo, box o experiencia será la entrada principal de ventas.',
            branchKey: 'ideas',
            priority: 'high',
            time: '15 min',
            tools: ['Menú', 'Oferta'],
            tip: 'No ordenes todo el menú todavía. Primero un producto que abra ventas.',
            example: 'Combo brunch para dos + bebida + delivery por WhatsApp.',
          },
          {
            title: 'Calcular precio base y margen',
            description: 'Define costo aproximado, precio de venta y margen mínimo saludable.',
            branchKey: 'finances',
            priority: 'high',
            time: '20 min',
            tools: ['Precio', 'Margen'],
            tip: 'La ruta debe vender, pero también cuidar rentabilidad.',
            example: 'Costo S/18, precio S/39, margen para delivery y promo.',
          },
        ],
      },
      landing: {
        title: 'Menú / Página de Venta',
        shortTitle: 'Menú',
        outcome: 'Página simple con producto estrella, combos, fotos, horarios, zona de entrega y pedido por WhatsApp.',
        artifactLabel: 'Menú digital',
        defaultOutputs: {
          hero: 'Pide tu producto estrella sin fricción.',
          cta: 'Pedir por WhatsApp',
          sections: 'Producto estrella, combos, fotos, horarios, delivery, reseñas y pedido.',
        },
        tasks: [
          {
            title: 'Armar menú digital mínimo',
            description: 'Producto estrella, 2 combos, precios, horarios, zona de entrega y botón a WhatsApp.',
            branchKey: 'marketing',
            priority: 'high',
            time: '25 min',
            tools: ['Editor', 'Menú'],
            tip: 'Un menú pequeño vende mejor que una carta enorme sin foco.',
            example: 'Combo estrella, combo familiar y opción evento.',
          },
          {
            title: 'Elegir 6 fotos de antojo',
            description: 'Selecciona fotos reales de producto, preparación, detalle, empaque, local y cliente.',
            branchKey: 'resources',
            priority: 'medium',
            time: '12 min',
            tools: ['Fotos', 'Galería'],
            tip: 'La foto debe dar hambre y confianza al mismo tiempo.',
            example: 'Plato servido, close-up, empaque y mesa lista.',
          },
        ],
      },
      'whatsapp-conversion': {
        title: 'WhatsApp / Pedidos',
        shortTitle: 'Pedidos',
        outcome: 'Flujo simple para recibir pedidos, confirmar pago y coordinar entrega o reserva.',
        artifactLabel: 'Flujo de pedidos',
        defaultOutputs: {
          welcome: 'Hola, gracias por escribir. Te ayudo a elegir y confirmar tu pedido.',
          data: 'Producto, cantidad, dirección/mesa, horario, comprobante y contacto.',
          followup: 'Mensaje post-compra para recompra o reseña.',
        },
        tasks: [
          {
            title: 'Crear mensaje para tomar pedidos',
            description: 'Guion para responder rápido: opciones, precio, horario, pago y confirmación.',
            branchKey: 'actions',
            priority: 'high',
            time: '15 min',
            tools: ['WhatsApp', 'Pedidos'],
            tip: 'La persona debe poder pedir sin hacer cinco preguntas.',
            example: 'Tenemos combo A y B. Para confirmar dime cantidad, dirección y horario.',
          },
          {
            title: 'Definir estados del pedido',
            description: 'Ordena pedido recibido, pago confirmado, en preparación, enviado/listo y seguimiento.',
            branchKey: 'actions',
            priority: 'medium',
            time: '12 min',
            tools: ['Operación', 'WhatsApp'],
            tip: 'Estados claros reducen ansiedad para ti y para el cliente.',
            example: 'Recibido → confirmado → preparando → enviado.',
          },
        ],
      },
      'content-system': {
        tasks: [
          {
            title: 'Crear 5 contenidos de antojo',
            description: 'Ideas para mostrar producto, preparación, prueba social, promo y llamado a pedir.',
            branchKey: 'marketing',
            priority: 'medium',
            time: '15 min',
            tools: ['Instagram', 'Contenido'],
            tip: 'El contenido gastronómico debe abrir apetito y facilitar pedido.',
            example: 'Reel: del empaque a la mesa en 10 segundos.',
          },
          {
            title: 'Escribir 3 historias para vender hoy',
            description: 'Historias con disponibilidad, prueba social y botón directo a WhatsApp.',
            branchKey: 'marketing',
            priority: 'medium',
            time: '10 min',
            tools: ['Historias', 'Venta'],
            tip: 'Historias simples, no perfectas. El objetivo es abrir conversación.',
            example: 'Hoy salen 12 boxes. Reserva hasta las 4 p.m.',
          },
        ],
      },
      'metrics-improvement': {
        title: 'Métricas y Recompra',
        shortTitle: 'Recompra',
        outcome: 'Sistema simple para medir pedidos, clientes frecuentes, ticket promedio y promociones.',
        artifactLabel: 'Sistema de recompra',
      },
    };

    return {
      ...step,
      ...(replacements[step.id] ?? {}),
    };
  }),
};

export const genericDigitalRouteTemplate: ForUDigitalRouteTemplate = {
  ...tourismDigitalRouteTemplate,
  industryKey: 'generic',
  title: 'Ruta Digital Base',
  description: 'Oferta, página, contacto, contenido, Google, confianza y mejora para cualquier negocio.',
};

export function getDigitalRouteTemplate(industryKey?: ForUIndustryKey): ForUDigitalRouteTemplate {
  if (industryKey === 'tourism') return tourismDigitalRouteTemplate;
  const template = getBusinessTemplate(industryKey);
  if (template && industryKey) return {
    industryKey, title: 'Ruta de ' + template.name, description: template.entry,
    steps: template.steps.map(step => ({
      id: step.id, title: step.title, shortTitle: step.title, badge: template.name, outcome: step.tasks[2], why: step.tip,
      primaryAction: 'Preparar ' + step.title.toLowerCase(), outputKey: step.id, artifactLabel: 'Hoja de ' + step.title.toLowerCase(), priority: 'high', guidePhase: step.title,
      resources: [{icon:'↓',text:'Descargar hoja de trabajo',description:step.tip,filename:step.resource.name,content:step.resource.content}],
      tasks: step.tasks.map(title=>({title,description:title,branchKey:'actions',priority:'high',time:'15 min',tools:step.tools,tip:step.tip,example:step.example})),defaultOutputs:{evidence:'',decision:''},
    })),
  };
  return genericDigitalRouteTemplate;
}

export function getStepCompletionStatus(completedTaskCount: number, totalTaskCount: number): ForUDigitalRouteStepStatus {
  if (totalTaskCount > 0 && completedTaskCount >= totalTaskCount) return 'ready';
  if (completedTaskCount > 0) return 'in_progress';
  return 'pending';
}
