import { supabase } from './supabase';
import { readWorkspaceFocus } from './workspaceFocusRepository';

// One private document per account, anchored to an owned project. No schema changes.
// Never merge duplicate/unknown formats or replace them with defaults.
export async function loadWorkspaceFocus(userId: string) {
  if (!supabase) throw new Error('Supabase no está configurado. Tu enfoque no se ha guardado.');
  return readWorkspaceFocus(supabase, userId);
}
