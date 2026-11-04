export type VideoTemplateId = 'story' | 'product' | 'flash' | 'review';

export interface VideoTemplateDef {
  id: VideoTemplateId;
  name: string;
  tagline: string;
  intent: 'atracción' | 'interés' | 'decisión' | 'confianza';
  icon: string;
  recommendedDuration: number; // en segundos
  defaultLook: {
    fontFamily: string;
    bgOpacity: number;
    color: string;
    animation: 'fade' | 'pop' | 'rise';
  };
}

export const VIDEO_TEMPLATES: Record<VideoTemplateId, VideoTemplateDef> = {
  story: {
    id: 'story',
    name: 'Historia & Conexión',
    tagline: 'Cuenta por qué creaste tu negocio y conecta con tu audiencia.',
    intent: 'atracción',
    icon: '📖',
    recommendedDuration: 15,
    defaultLook: {
      fontFamily: 'Inter',
      bgOpacity: 0.85,
      color: '#ffffff',
      animation: 'rise',
    },
  },
  product: {
    id: 'product',
    name: 'Producto Estrella',
    tagline: 'Muestra lo más pedido con precio y detalles irresistibles.',
    intent: 'interés',
    icon: '🛍️',
    recommendedDuration: 12,
    defaultLook: {
      fontFamily: 'Inter',
      bgOpacity: 0.9,
      color: '#f8f0e0',
      animation: 'pop',
    },
  },
  flash: {
    id: 'flash',
    name: 'Oferta Flash',
    tagline: 'Promo de tiempo limitado con llamado directo a WhatsApp.',
    intent: 'decisión',
    icon: '⚡',
    recommendedDuration: 10,
    defaultLook: {
      fontFamily: 'Inter',
      bgOpacity: 0.95,
      color: '#fff5f5',
      animation: 'pop',
    },
  },
  review: {
    id: 'review',
    name: 'Testimonio & Confianza',
    tagline: 'Reseña real con 5 estrellas para dar credibilidad total.',
    intent: 'confianza',
    icon: '⭐',
    recommendedDuration: 12,
    defaultLook: {
      fontFamily: 'Inter',
      bgOpacity: 0.85,
      color: '#f3f0ff',
      animation: 'fade',
    },
  },
};
