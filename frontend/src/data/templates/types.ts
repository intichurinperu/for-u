import type { ModuleType } from '../../modules/moduleProjects';
export const templateCategories = {
  reconocimiento: 'Presentar el negocio', interaccion: 'Conversar con tu comunidad', venta: 'Promociones y ofertas',
  conversion: 'Testimonios y confianza', retargeting: 'Retomar el contacto', fidelizacion: 'Premiar a tus clientes',
} as const;
export type TemplateCategory = keyof typeof templateCategories;
export type ContentTemplate = { id: string; type: ModuleType; name: string; category: TemplateCategory; preview: string; title: string; subtitle: string; caption: string; background: string; foreground: string };
