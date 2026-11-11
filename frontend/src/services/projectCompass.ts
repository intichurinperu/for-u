import { supabase } from './supabase';
import { withProjectCompass } from '../lib/projectCompassModel';
export { compassEmotions, parseProjectCompass } from '../lib/projectCompassModel';
export async function loadProjectConfig(userId: string, projectId: string) {
  if (!supabase) throw new Error('Conecta tu cuenta para guardar tu propósito.');
  const { data, error } = await supabase.from('projects').select('config').eq('id', projectId).eq('user_id', userId).single();
  if (error || !data) throw new Error('No se pudo cargar el perfil del proyecto. Reintenta.');
  return data.config as unknown;
}
export async function saveProjectCompass(userId: string, projectId: string, config: unknown, goal: string, emotion: string) {
  if (!supabase) throw new Error('Conecta tu cuenta para guardar tu propósito.');
  const next = withProjectCompass(config, goal, emotion);
  let query = supabase.from('projects').update({ config: next, updated_at: new Date().toISOString() }).eq('id', projectId).eq('user_id', userId);
  // Compare the complete config snapshot so another editor's keys are never lost.
  query = config === null ? query.is('config', null) : query.eq('config', JSON.stringify(config));
  const { data, error } = await query.select('id').maybeSingle();
  if (error) throw new Error('No se guardó tu propósito. Conserva esta pantalla y reintenta.');
  if (!data) throw new Error('El perfil cambió en otra ventana. Recarga el perfil antes de guardar; tu texto sigue aquí.');
  return next;
}
