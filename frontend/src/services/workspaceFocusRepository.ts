import type { SupabaseClient } from '@supabase/supabase-js';
import { parseWorkspaceFocus } from '../pages/dashboard/workspaceFocusModel';

export async function readWorkspaceFocus(db: SupabaseClient, userId: string) {
  const { data, error } = await db.from('toolkit_documents').select('project_id,payload,updated_at')
    .eq('user_id', userId).eq('kind', 'module-workspace-focus');
  if (error) throw new Error(`No se pudo cargar Hoy: ${error.message}`);
  if ((data?.length ?? 0) > 1) throw new Error('Hay varios documentos de enfoque. Se conservan sin sobrescribir; requiere recuperación.');
  const row = data?.[0];
  return row ? { projectId: row.project_id as string, revision: row.updated_at as string, payload: parseWorkspaceFocus(row.payload) } : null;
}
