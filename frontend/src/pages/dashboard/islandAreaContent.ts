import type { BusinessRoute } from '../../workspace/contracts';
import type { ProjectDestination } from '../../workspace/navigation';
import type { AreaId } from './areaModel';

type Action = ProjectDestination & { label: string };
type AreaContent = { title: string; description: string; primary?: Action; links?: Action[] };

const studio = (label: string, tab: 'create' | 'campaigns' | 'library'): Action => ({
  label, path: '/creator-studio', params: { tab },
});
const prices = (label = 'Revisar precios'): Action => ({
  label, path: '/dashboard/tools/proposal', params: { section: 'offers' },
});
const moduleAction = (label: string, module: Exclude<BusinessRoute, 'services'>, view?: string, editor = false): Action => ({
  label, path: `/modules/${module}${editor ? '/editor' : ''}`, params: view ? { view } : {},
});
const calendar = (label: string): Action => ({ label, path: '/dashboard', params: { view: 'calendar' } });
const orders: Action = { label: 'Ver pedidos del local', path: '/modules/restaurant/orders', params: {} };

const marketing = (title: string, description: string): AreaContent => ({
  title, description, primary: { label: 'Crear campaña', path: '/creator-studio', params: { tab: 'campaigns', start: 'campaign' } },
  links: [studio('Abrir Creator Studio', 'create'), studio('Ver mis publicaciones', 'library')],
});

export const islandAreaContent: Record<BusinessRoute, Record<AreaId, AreaContent>> = {
  restaurant: {
    marketing: marketing('Menú y promociones', 'Da a conocer un plato, el menú o una promoción del local.'),
    finance: {
      title: 'Precios del menú', description: 'Revisa el precio de venta de cada plato u oferta.',
      primary: prices(), links: [moduleAction('Ver recetas e insumos', 'restaurant')],
    },
    logistics: {
      title: 'Inventario y preparaciones', description: 'Consulta qué ingredientes faltan y qué necesitas para preparar cada receta.',
      primary: moduleAction('Abrir inventario', 'restaurant'), links: [orders],
    },
    operations: { title: 'Organiza el turno', description: 'Revisa qué queda por hacer en cocina y en el servicio.', links: [orders] },
  },
  hospitality: {
    marketing: marketing('Estadías y paquetes', 'Presenta tus habitaciones, servicios y experiencias.'),
    finance: {
      title: 'Tarifas y movimientos', description: 'Revisa las tarifas por noche y registra ingresos o gastos de tu hospedaje.',
      primary: moduleAction('Revisar tarifas', 'hospitality', 'rooms'),
      links: [moduleAction('Ingresos y gastos', 'hospitality', 'finance'), prices('Revisar precios de ofertas')],
    },
    logistics: {
      title: 'Llegadas y salidas', description: 'Consulta el calendario de reservas y coordina la disponibilidad.',
      primary: moduleAction('Ver reservas', 'hospitality', 'bookings'),
      links: [moduleAction('Ver habitaciones', 'hospitality', 'rooms')],
    },
    operations: {
      title: 'Prepara las habitaciones', description: 'Organiza la limpieza y revisa qué habitaciones están listas.',
      links: [moduleAction('Control de limpieza', 'hospitality', 'housekeeping')],
    },
  },
  tourism: {
    marketing: marketing('Experiencias y recorridos', 'Cuenta qué incluye cada experiencia y qué la hace especial.'),
    finance: {
      title: 'Precios de experiencias', description: 'Revisa lo que cobras por cada experiencia o paquete.',
      primary: prices('Revisar tarifas'), links: [moduleAction('Ver experiencias e itinerarios', 'tourism', undefined, true)],
    },
    logistics: {
      title: 'Salidas, guías y cupos', description: 'Organiza las próximas salidas, asigna un guía y revisa las reservas.',
      primary: moduleAction('Ver salidas y reservas', 'tourism'),
    },
    operations: { title: 'Prepara la próxima salida', description: 'Organiza el punto de encuentro, el equipo y las indicaciones para el grupo.' },
  },
  courses: {
    marketing: marketing('Cursos y materiales', 'Presenta tu curso, taller o material y cuenta a quién puede ayudar.'),
    finance: {
      title: 'Precios y cobros', description: 'Revisa el precio de tus cursos y los pagos que ya registraste.',
      primary: prices(), links: [moduleAction('Ventas y cobros', 'courses', 'sales')],
    },
    logistics: {
      title: 'Materiales y accesos', description: 'Organiza las lecciones del curso y consulta el avance de los alumnos.',
      primary: moduleAction('Gestionar materiales', 'courses', undefined, true),
      links: [moduleAction('Ver alumnos y progreso', 'courses', 'students')],
    },
    operations: {
      title: 'Mi producto digital', description: 'Arma los módulos de tu curso y revisa las lecciones antes de compartirlo.',
      primary: moduleAction('Abrir editor de cursos', 'courses', undefined, true),
    },
  },
  ecommerce: {
    marketing: marketing('Productos y combos', 'Da a conocer una novedad, un producto o una selección de tu tienda.'),
    finance: {
      title: 'Precios y ventas', description: 'Revisa el precio de venta de tus productos y consulta los pedidos registrados.',
      primary: prices(), links: [moduleAction('Ver pedidos y ventas', 'ecommerce')],
    },
    logistics: {
      title: 'Stock y pedidos', description: 'Consulta el stock del catálogo y organiza los pedidos pendientes.',
      primary: moduleAction('Ver pedidos', 'ecommerce'),
      links: [moduleAction('Revisar stock del catálogo', 'ecommerce', undefined, true)],
    },
    operations: {
      title: 'Organiza los pedidos', description: 'Prepara los pedidos del día y registra lo que necesitas reponer.',
      links: [moduleAction('Abrir pedidos', 'ecommerce')],
    },
  },
  services: {
    marketing: marketing('Servicios y paquetes', 'Explica qué incluye tu servicio y cómo empezar a trabajar contigo.'),
    finance: {
      title: 'Tarifas de tus servicios', description: 'Revisa el precio de cada servicio o paquete y qué queda por cotizar.',
      primary: prices('Revisar tarifas'),
    },
    logistics: {
      title: 'Agenda y entregables', description: 'Organiza las fechas de sesiones, entregas y próximos pasos.',
      primary: calendar('Organizar agenda'),
    },
    operations: { title: 'Sesiones y entregas', description: 'Prepara la próxima sesión y organiza tus entregables.', links: [calendar('Ver agenda')] },
  },
};
