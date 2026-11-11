import type { ContentTemplate } from './types';
export const restaurantTemplates: ContentTemplate[] = [
  {
    "id": "restaurant-nuestra-historia",
    "type": "restaurant",
    "name": "Nuestra historia",
    "category": "reconocimiento",
    "preview": "El sabor de nuestra historia",
    "title": "El sabor de nuestra historia",
    "subtitle": "Conoce {negocio}",
    "caption": "En {negocio}, cada plato tiene una historia. [Cuenta cómo comenzó tu cocina y qué la hace especial.] Ven a conocernos.",
    "background": "#fff1e6",
    "foreground": "#7c2d12"
  },
  {
    "id": "restaurant-elige-tu-plato",
    "type": "restaurant",
    "name": "Elige tu plato",
    "category": "interaccion",
    "preview": "¿Qué se te antoja hoy?",
    "title": "¿Qué se te antoja hoy?",
    "subtitle": "Tu opinión está en el menú",
    "caption": "¿[Plato A] o [Plato B]? Cuéntanos cuál elegirías en {negocio} y por qué.",
    "background": "#fff1e6",
    "foreground": "#7c2d12"
  },
  {
    "id": "restaurant-promo-2x1",
    "type": "restaurant",
    "name": "Promoción 2x1",
    "category": "venta",
    "preview": "Una promoción para compartir",
    "title": "Una promoción para compartir",
    "subtitle": "[Producto] · [Fecha y condiciones]",
    "caption": "En {negocio}: [describe la promoción real, precio, vigencia y condiciones]. Escríbenos para pedir.",
    "background": "#fff1e6",
    "foreground": "#7c2d12"
  },
  {
    "id": "restaurant-plato-del-dia",
    "type": "restaurant",
    "name": "Plato del día",
    "category": "venta",
    "preview": "Hoy cocinamos para ti",
    "title": "Hoy cocinamos para ti",
    "subtitle": "[Nombre del plato] · S/ [precio]",
    "caption": "El plato del día en {negocio} es [plato]. [Describe ingredientes y disponibilidad.] Haz tu pedido por WhatsApp.",
    "background": "#fff1e6",
    "foreground": "#7c2d12"
  },
  {
    "id": "restaurant-clientes-felices",
    "type": "restaurant",
    "name": "Lo que cuentan nuestros clientes",
    "category": "conversion",
    "preview": "Gracias por elegirnos",
    "title": "Gracias por elegirnos",
    "subtitle": "[Testimonio autorizado]",
    "caption": "[Comparte un testimonio real con autorización.] Gracias por ser parte de {negocio}.",
    "background": "#fff1e6",
    "foreground": "#7c2d12"
  },
  {
    "id": "restaurant-vuelve-a-la-mesa",
    "type": "restaurant",
    "name": "Vuelve a nuestra mesa",
    "category": "retargeting",
    "preview": "Te esperamos de nuevo",
    "title": "Te esperamos de nuevo",
    "subtitle": "Tu próxima visita a {negocio}",
    "caption": "¿Te quedaste con ganas de probar [plato]? En {negocio} te ayudamos a elegir. Escríbenos para conocer el menú.",
    "background": "#fff1e6",
    "foreground": "#7c2d12"
  },
  {
    "id": "restaurant-clientes-frecuentes",
    "type": "restaurant",
    "name": "Para quienes vuelven",
    "category": "fidelizacion",
    "preview": "Volver tiene su premio",
    "title": "Volver tiene su premio",
    "subtitle": "[Beneficio real y condiciones]",
    "caption": "Gracias por volver a {negocio}. [Explica el beneficio para clientes frecuentes y cómo obtenerlo.]",
    "background": "#fff1e6",
    "foreground": "#7c2d12"
  }
];
