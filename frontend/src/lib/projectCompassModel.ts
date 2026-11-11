export const compassEmotions = [
  { id: 'freedom', label: 'Libertad', icon: '🕊️' },
  { id: 'peace', label: 'Paz', icon: '💚' },
  { id: 'pride', label: 'Orgullo', icon: '🏛️' },
  { id: 'creativity', label: 'Creatividad', icon: '🎨' },
  { id: 'abundance', label: 'Abundancia', icon: '💰' },
  { id: 'connection', label: 'Conexión', icon: '🤝' },
  { id: 'confidence', label: 'Confianza', icon: '🧭' },
  { id: 'joy', label: 'Alegría', icon: '✨' },
] as const;
export type ProjectCompass = { version: 1; goal: string; emotion: string; completedAt: string };
export function parseProjectCompass(config: unknown): ProjectCompass | null {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null;
  const value = (config as Record<string, unknown>).emotionalCompass as ProjectCompass | undefined;
  return value?.version === 1 && typeof value.goal === 'string' && value.goal.trim() && compassEmotions.some(e => e.id === value.emotion) && typeof value.completedAt === 'string' ? value : null;
}
export function withProjectCompass(config: unknown, goal: string, emotion: string) {
  if (config !== null && (typeof config !== 'object' || Array.isArray(config))) throw new Error('No pudimos interpretar el perfil actual. No se modificó ningún dato.');
  if (!goal.trim() || goal.trim().length > 500 || !compassEmotions.some(e => e.id === emotion)) throw new Error('Escribe tu propósito y elige una emoción.');
  return { ...(config as Record<string, unknown> | null), emotionalCompass: { version: 1, goal: goal.trim(), emotion, completedAt: new Date().toISOString() } };
}
