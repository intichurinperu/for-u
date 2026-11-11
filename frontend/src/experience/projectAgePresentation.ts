import type { BusinessRoute } from '../workspace/contracts';

type AgePresentation = {
  label: string;
  intro: string;
  choices: { value: string; label: string; hint: string }[];
};

/** Sector-specific copy; the age values remain compatible with saved diagnostics. */
export const projectAgePresentation: Record<BusinessRoute, AgePresentation> = {
  restaurant: {
    label: 'Cafetería o restaurante',
    intro: 'Aprovechemos el camino que ya lleva tu cafetería o restaurante.',
    choices: [
      { value: 'Todavía es una idea', label: 'Todavía es una idea', hint: 'Daremos forma al lugar y a lo que quieres ofrecer.' },
      { value: 'Menos de un año', label: 'Menos de un año', hint: 'Partiremos de lo que ya preparaste para tu cafetería o restaurante.' },
      { value: 'Entre uno y tres años', label: 'Entre uno y tres años', hint: 'Tu menú y tu experiencia atendiendo ya son parte del recorrido.' },
      { value: 'Más de tres años', label: 'Más de tres años', hint: 'Aprovecharemos lo que has aprendido con tu cocina y tus clientes.' },
    ],
  },
  ecommerce: {
    label: 'Tienda',
    intro: 'Tu tienda tiene su propio recorrido. Empecemos desde ahí.',
    choices: [
      { value: 'Todavía es una idea', label: 'Todavía es una idea', hint: 'Podemos empezar por los productos que imaginas ofrecer.' },
      { value: 'Menos de un año', label: 'Menos de un año', hint: 'Partiremos de lo que ya has preparado para tu tienda.' },
      { value: 'Entre uno y tres años', label: 'Entre uno y tres años', hint: 'Aprovecharemos lo que ya sabes de tus productos y clientes.' },
      { value: 'Más de tres años', label: 'Más de tres años', hint: 'Tu experiencia con la tienda será nuestro punto de partida.' },
    ],
  },
  hospitality: {
    label: 'Hospedaje',
    intro: 'Tendremos en cuenta lo que ya has construido para tu hospedaje.',
    choices: [
      { value: 'Todavía es una idea', label: 'Todavía es una idea', hint: 'Empezaremos por el lugar y la estadía que te gustaría ofrecer.' },
      { value: 'Menos de un año', label: 'Menos de un año', hint: 'Partiremos de lo que ya organizaste para recibir huéspedes.' },
      { value: 'Entre uno y tres años', label: 'Entre uno y tres años', hint: 'Lo aprendido con tus habitaciones y estadías también cuenta.' },
      { value: 'Más de tres años', label: 'Más de tres años', hint: 'Aprovecharemos la experiencia que ya tiene tu hospedaje.' },
    ],
  },
  tourism: {
    label: 'Turismo',
    intro: 'Conozcamos el recorrido de tu proyecto turístico.',
    choices: [
      { value: 'Todavía es una idea', label: 'Todavía es una idea', hint: 'Podemos comenzar por la experiencia que imaginas para los viajeros.' },
      { value: 'Menos de un año', label: 'Menos de un año', hint: 'Partiremos de los recorridos y experiencias que ya has preparado.' },
      { value: 'Entre uno y tres años', label: 'Entre uno y tres años', hint: 'Aprovecharemos lo que has aprendido con tus experiencias y salidas.' },
      { value: 'Más de tres años', label: 'Más de tres años', hint: 'Tu trayectoria con los viajeros será parte de esta ruta.' },
    ],
  },
  courses: {
    label: 'Cursos y talleres',
    intro: 'Lo que ya has preparado o enseñado también es parte del camino.',
    choices: [
      { value: 'Todavía es una idea', label: 'Todavía es una idea', hint: 'Empezaremos por lo que sabes y te gustaría enseñar.' },
      { value: 'Menos de un año', label: 'Menos de un año', hint: 'Partiremos de los contenidos y materiales que ya has preparado.' },
      { value: 'Entre uno y tres años', label: 'Entre uno y tres años', hint: 'Aprovecharemos lo que has aprendido preparando cursos o talleres.' },
      { value: 'Más de tres años', label: 'Más de tres años', hint: 'Tu experiencia enseñando tendrá un lugar en tu proyecto.' },
    ],
  },
  services: {
    label: 'Servicios y ofertas mixtas',
    intro: 'Partiremos del recorrido que ya tiene tu proyecto de servicios.',
    choices: [
      { value: 'Todavía es una idea', label: 'Todavía es una idea', hint: 'Podemos comenzar por el servicio o la combinación de ofertas que imaginas.' },
      { value: 'Menos de un año', label: 'Menos de un año', hint: 'Partiremos de los servicios y paquetes que ya has preparado.' },
      { value: 'Entre uno y tres años', label: 'Entre uno y tres años', hint: 'Aprovecharemos lo que ya has aprendido ofreciendo tus servicios.' },
      { value: 'Más de tres años', label: 'Más de tres años', hint: 'Tu trayectoria y tus ofertas actuales serán el punto de partida.' },
    ],
  },
};
