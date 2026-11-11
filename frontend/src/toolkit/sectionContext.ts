import type { LandingDraft } from './types';
/** Only resolve sections actually belonging to the loaded project. */
export function sectionContext(value: unknown, requested: string | null) {
  if (!requested || !value || typeof value !== 'object') return null;
  const draft = value as Partial<LandingDraft>;
  if (requested === 'hero' && typeof draft.headline === 'string') return { id: 'hero', title: draft.headline, body: typeof draft.description === 'string' ? draft.description : '' };
  const block = Array.isArray(draft.blocks) ? draft.blocks.find(item => item?.id === requested) : undefined;
  return block && typeof block.title === 'string' && typeof block.body === 'string' ? block : null;
}
