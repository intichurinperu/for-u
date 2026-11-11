import type { RestaurantData } from './model';

/** Explicit opt-in: never overwrite an existing menu or invent a phone number. */
export function loadAlfajoresDemo(data: RestaurantData, origin: string): RestaurantData {
  if (data.dishes.length) throw new Error('La demo solo se carga en un menú vacío para proteger tus productos.');
  const image = (name: string) => new URL(`/demo/alfajor-${name}.svg`, origin).href;
  return {
    ...data,
    dishes: [
      { id: 'demo-clasico', name: 'Alfajor clásico', description: 'Masa suave, manjar blanco y azúcar en polvo.', category: 'Alfajores', price: 5, image: image('clasico'), available: true },
      { id: 'demo-chocolate', name: 'Alfajor de chocolate', description: 'Relleno de manjar blanco y cobertura de chocolate.', category: 'Alfajores', price: 7, image: image('chocolate'), available: true },
      { id: 'demo-coco', name: 'Alfajor de coco', description: 'Manjar blanco con un delicado borde de coco.', category: 'Alfajores', price: 6, image: image('coco'), available: true },
    ],
    sections: data.sections.map(section => ({ ...section, visible: ['hero', 'menu', 'about'].includes(section.id) })),
    settings: { ...data.settings, title: data.settings.title.trim() || 'Alfajores del Valle', tagline: 'Un momento dulce, hecho a mano.', coverImage: image('clasico'), about: 'Alfajores artesanales para regalar, compartir o darte un gusto. Consulta entregas y disponibilidad por WhatsApp.' },
  };
}
