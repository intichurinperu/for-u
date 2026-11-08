import type { BusinessRoute } from '../workspace/contracts';

type StageValue = 'Vengo a explorar' | 'Estoy empezando' | 'Ya tengo un negocio';
type StagePresentation = {
  label: string;
  choices: { value: StageValue; label: string; hint: string }[];
};

/** Sector-specific wording; values remain the existing diagnostic contract. */
export const projectStagePresentation: Record<BusinessRoute, StagePresentation> = {
  restaurant: {
    label: 'Cafetería o restaurante',
    choices: [
      { value: 'Vengo a explorar', label: 'Estoy explorando una idea', hint: 'Quiero darle forma a mi cafetería o restaurante.' },
      { value: 'Estoy empezando', label: 'Estoy preparando la apertura', hint: 'Estoy organizando lo necesario para empezar a atender.' },
      { value: 'Ya tengo un negocio', label: 'Mi cafetería o restaurante ya funciona', hint: 'Ya atiendo clientes y quiero ordenar o mejorar mi negocio.' },
    ],
  },
  ecommerce: {
    label: 'Tienda',
    choices: [
      { value: 'Vengo a explorar', label: 'Estoy imaginando mi tienda', hint: 'Quiero explorar qué productos ofrecer y a quién.' },
      { value: 'Estoy empezando', label: 'Estoy preparando mi tienda', hint: 'Estoy organizando mis productos para empezar a vender.' },
      { value: 'Ya tengo un negocio', label: 'Mi tienda ya está vendiendo', hint: 'Ya tengo clientes y quiero organizar mejor mi tienda.' },
    ],
  },
  hospitality: {
    label: 'Hospedaje',
    choices: [
      { value: 'Vengo a explorar', label: 'Estoy explorando un hospedaje', hint: 'Quiero darle forma al lugar y a la estadía que ofreceré.' },
      { value: 'Estoy empezando', label: 'Estoy preparando mi hospedaje', hint: 'Estoy organizando habitaciones y servicios antes de recibir huéspedes.' },
      { value: 'Ya tengo un negocio', label: 'Mi hospedaje ya recibe huéspedes', hint: 'Quiero mejorar la presentación y la organización de mis estadías.' },
    ],
  },
  tourism: {
    label: 'Turismo',
    choices: [
      { value: 'Vengo a explorar', label: 'Estoy explorando una experiencia', hint: 'Quiero imaginar el recorrido y lo que vivirán los viajeros.' },
      { value: 'Estoy empezando', label: 'Estoy preparando mis experiencias', hint: 'Estoy organizando recorridos y salidas antes de ofrecerlos.' },
      { value: 'Ya tengo un negocio', label: 'Ya ofrezco experiencias', hint: 'Quiero presentar y organizar mejor mis experiencias y salidas.' },
    ],
  },
  courses: {
    label: 'Cursos y talleres',
    choices: [
      { value: 'Vengo a explorar', label: 'Estoy explorando qué enseñar', hint: 'Quiero darle forma a un curso o taller desde lo que sé.' },
      { value: 'Estoy empezando', label: 'Estoy preparando un curso o taller', hint: 'Estoy organizando contenidos y materiales para empezar.' },
      { value: 'Ya tengo un negocio', label: 'Ya imparto cursos o talleres', hint: 'Quiero presentar y organizar mejor lo que enseño.' },
    ],
  },
  services: {
    label: 'Servicios y ofertas mixtas',
    choices: [
      { value: 'Vengo a explorar', label: 'Estoy explorando qué ofrecer', hint: 'Quiero definir mis servicios y las ofertas que puedo combinar.' },
      { value: 'Estoy empezando', label: 'Estoy preparando mi oferta', hint: 'Estoy organizando qué incluye mi servicio y cómo solicitarlo.' },
      { value: 'Ya tengo un negocio', label: 'Ya atiendo clientes', hint: 'Quiero organizar mis servicios y otras ofertas sin empezar de nuevo.' },
    ],
  },
};
