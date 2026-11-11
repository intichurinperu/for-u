export const moduleLabels = {
  restaurant: 'Restaurante', ecommerce: 'Tienda', hospitality: 'Hospedaje', tourism: 'Turismo', courses: 'Cursos',
} as const;
export type ModuleType = keyof typeof moduleLabels;
export type ModuleProject = { id: string; name: string; type: ModuleType };

export function projectModuleType(project: { industryKey?: string; strategyProfile?: Record<string, unknown> }): ModuleType | null {
  const explicit = project.strategyProfile?.moduleType;
  if (typeof explicit === 'string' && Object.hasOwn(moduleLabels, explicit)) return explicit as ModuleType;
  const industries: Record<string, ModuleType> = { gastronomy: 'restaurant', restaurant: 'restaurant', ecommerce: 'ecommerce', hospitality: 'hospitality', tourism: 'tourism', courses: 'courses', education: 'courses' };
  return industries[project.industryKey ?? ''] ?? null;
}
