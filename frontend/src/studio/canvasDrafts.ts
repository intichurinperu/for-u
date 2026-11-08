import { contentSizes, validateCreativeContext, type ContentDraft } from '../components/shared/contentModel';
import type { Material } from '../experience/MaterialAttachments';

export type CanvasDraft = { draft: ContentDraft; files: Material[]; dirty: boolean };

function prefix(user: string, project: string) {
  return `foru:studio-design:v1:${user}:${project}:`;
}

export function readCanvasDraft(value: string | null, project: string): CanvasDraft | null {
  try {
    const entry = JSON.parse(value || 'null') as CanvasDraft | null;
    if (!entry || entry.draft?.projectId !== project || typeof entry.draft.id !== 'string'
      || typeof entry.draft.title !== 'string' || !Object.hasOwn(contentSizes, entry.draft.format)
      || !Array.isArray(entry.files) || typeof entry.dirty !== 'boolean') return null;
    validateCreativeContext(entry.draft, project);
    return entry;
  } catch {
    return null;
  }
}

export function localCanvasDrafts(user: string, project: string): CanvasDraft[] {
  try {
    const scope = prefix(user, project);
    return Object.keys(localStorage).flatMap(key => {
      if (!key.startsWith(scope)) return [];
      const entry = readCanvasDraft(localStorage.getItem(key), project);
      return entry && key === scope + entry.draft.id ? [entry] : [];
    });
  } catch {
    return [];
  }
}

export function storeCanvasDraft(user: string, project: string, entry: CanvasDraft): boolean {
  try {
    localStorage.setItem(prefix(user, project) + entry.draft.id, JSON.stringify(entry));
    return true;
  } catch {
    return false;
  }
}
