import type { BusinessRoute } from '../workspace/contracts';

type VisionPresentation = {
  label: string;
  intro: string;
  placeholder: string;
};

export const projectVisionPresentation: Record<BusinessRoute, VisionPresentation> = {
  restaurant: {
    label: 'Cafetería o restaurante',
    intro: 'Imagina cómo te gustaría que evolucionara tu cocina o tu local.',
    placeholder: 'Por ejemplo: Me gustaría que más personas del barrio conozcan nuestra cocina…',
  },
  ecommerce: {
    label: 'Tienda',
    intro: 'Piensa en lo que te gustaría lograr con tu tienda y tus productos.',
    placeholder: 'Por ejemplo: Me gustaría que mi tienda llegue a clientes de otras ciudades…',
  },
  hospitality: {
    label: 'Hospedaje',
    intro: 'Imagina cómo te gustaría llevar tu hospedaje en el futuro.',
    placeholder: 'Por ejemplo: Me gustaría organizar las reservas con más calma y dedicar tiempo a recibir a cada huésped…',
  },
  tourism: {
    label: 'Turismo',
    intro: 'Piensa en cómo te gustaría desarrollar tus recorridos y experiencias.',
    placeholder: 'Por ejemplo: Me gustaría vivir de organizar recorridos por mi comunidad…',
  },
  courses: {
    label: 'Cursos y talleres',
    intro: 'Imagina cómo te gustaría que crecieran tus cursos o talleres.',
    placeholder: 'Por ejemplo: Me gustaría que mis talleres lleguen a personas que recién empiezan…',
  },
  services: {
    label: 'Servicios y ofertas mixtas',
    intro: 'Piensa en cómo te gustaría trabajar y qué quieres lograr con tus servicios.',
    placeholder: 'Por ejemplo: Me gustaría sumar a alguien a mi equipo para acompañar a más clientes…',
  },
};
