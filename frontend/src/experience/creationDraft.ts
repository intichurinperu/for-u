import type { AccountPreferences } from '../pages/dashboard/workspaceFocusModel';
import { businessRoutes, type BusinessRoute } from '../workspace/contracts';

export type CreationDraft = {
  version: 2;
  entry: 'guided' | 'explore' | 'manual' | null;
  step: number;
  name: string;
  route: BusinessRoute | null;
  preferredName: string;
  addressing: AccountPreferences['addressing'];
  projectId: string | null;
  savePreferences?: boolean;
};

const entries = ['guided', 'explore', 'manual', null];
const addressingOptions = ['neutral', 'feminine', 'masculine', 'at'];

/** Read account-scoped drafts without changing their project identity or destination. */
export function creationDraft(raw: unknown, prefs: AccountPreferences, startWithName = false): CreationDraft {
  const saved = raw as Partial<CreationDraft> | null;
  if (saved && typeof saved === 'object' && !Array.isArray(saved)
    && saved.version === 2 && [-1, 0, 1, 2, 3].includes(saved.step as number)
    && entries.includes(saved.entry ?? null) && saved.entry !== undefined
    && typeof saved.name === 'string' && saved.name.length <= 120
    && (saved.route === null || businessRoutes.includes(saved.route as BusinessRoute))
    && typeof saved.preferredName === 'string' && saved.preferredName.length <= 120
    && addressingOptions.includes(saved.addressing as string)
    && (saved.projectId === null || (typeof saved.projectId === 'string' && saved.projectId.length > 0))
    && (saved.savePreferences === undefined || typeof saved.savePreferences === 'boolean')) {
    return {
      version: 2,
      entry: startWithName && saved.entry === null ? 'guided' : saved.entry,
      step: startWithName && saved.step! < 2 ? 2 : saved.step!,
      name: saved.name,
      route: saved.route!,
      preferredName: saved.preferredName,
      addressing: saved.addressing!,
      projectId: saved.projectId,
      savePreferences: saved.savePreferences ?? (startWithName ? saved.entry === 'guided' : true),
    } as CreationDraft;
  }
  return {
    version: 2,
    entry: startWithName ? 'guided' : null,
    step: startWithName ? 2 : -1,
    name: '',
    route: null,
    preferredName: prefs.preferredName,
    addressing: prefs.addressing,
    projectId: null,
    savePreferences: !startWithName,
  };
}
