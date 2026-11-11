import type { BusinessRoute } from '../workspace/contracts';

type OriginPresentation = {
  label: string;
  intro: string;
  placeholder: string;
};

/** Examples guide the optional story field; they are never used as project answers. */
export const projectOriginPresentation: Record<BusinessRoute, OriginPresentation> = {
  restaurant: {
    label: 'Cafetería o restaurante',
    intro: 'Tu cafetería o restaurante puede tener más de un punto de partida.',
    placeholder: 'Por ejemplo: La idea empezó preparando recetas en familia…',
  },
  ecommerce: {
    label: 'Tienda',
    intro: 'Conozcamos qué te llevó a imaginar tu tienda.',
    placeholder: 'Por ejemplo: Empecé a crear productos que no encontraba en otras tiendas…',
  },
  hospitality: {
    label: 'Hospedaje',
    intro: 'Cada hospedaje tiene una historia. Puedes empezar por la tuya.',
    placeholder: 'Por ejemplo: Imaginé un lugar donde las personas pudieran descansar…',
  },
  tourism: {
    label: 'Turismo',
    intro: 'Cuéntanos de dónde viene tu idea de compartir experiencias.',
    placeholder: 'Por ejemplo: Quise compartir los lugares y las historias de mi comunidad…',
  },
  courses: {
    label: 'Cursos y talleres',
    intro: 'Conozcamos qué despertó tus ganas de enseñar.',
    placeholder: 'Por ejemplo: Varias personas me preguntaban cómo hacer algo que yo sabía…',
  },
  services: {
    label: 'Servicios y ofertas mixtas',
    intro: 'Tu experiencia o una necesidad pueden ser parte del origen de tu oferta.',
    placeholder: 'Por ejemplo: Vi una necesidad que podía atender con mi experiencia…',
  },
};
