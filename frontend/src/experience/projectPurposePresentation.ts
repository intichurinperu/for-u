import type { BusinessRoute } from '../workspace/contracts';

type PurposePresentation = {
  label: string;
  intro: string;
  placeholder: string;
};

/** Optional examples guide the person without becoming stored project answers. */
export const projectPurposePresentation: Record<BusinessRoute, PurposePresentation> = {
  restaurant: {
    label: 'Cafetería o restaurante',
    intro: 'Piensa en lo que te gustaría compartir a través de tu cocina o tu espacio.',
    placeholder: 'Por ejemplo: Me gustaría crear un lugar donde las personas puedan conversar y hacer una pausa…',
  },
  ecommerce: {
    label: 'Tienda',
    intro: 'Conozcamos qué te gustaría aportar con los productos de tu tienda.',
    placeholder: 'Por ejemplo: Quiero ofrecer productos que hagan más sencillo un momento de la vida cotidiana…',
  },
  hospitality: {
    label: 'Hospedaje',
    intro: 'Piensa en la experiencia que te gustaría ofrecer a quienes se hospeden contigo.',
    placeholder: 'Por ejemplo: Me gustaría ofrecer un lugar tranquilo donde las personas puedan descansar y sentirse a gusto…',
  },
  tourism: {
    label: 'Turismo',
    intro: 'Conozcamos qué te gustaría compartir a través de tus experiencias y recorridos.',
    placeholder: 'Por ejemplo: Quiero que los viajeros conozcan las historias y los lugares de mi comunidad…',
  },
  courses: {
    label: 'Cursos y talleres',
    intro: 'Piensa en lo que te gustaría hacer posible para quienes aprendan contigo.',
    placeholder: 'Por ejemplo: Me gustaría ayudar a otras personas a practicar algo que les interesa aprender…',
  },
  services: {
    label: 'Servicios y ofertas mixtas',
    intro: 'Conozcamos qué te gustaría aportar con tus servicios y otras ofertas.',
    placeholder: 'Por ejemplo: Quiero acompañar a las personas a resolver un problema usando mi experiencia…',
  },
};
