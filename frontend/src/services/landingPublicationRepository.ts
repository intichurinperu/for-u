import type { SupabaseClient } from '@supabase/supabase-js';
import type { LandingDraft } from '../toolkit/types';

export type LandingPublication = { slug: string; content: unknown; published: boolean };
export async function readLandingPublication(db: SupabaseClient, userId: string, projectId: string): Promise<LandingPublication | null> {
  const { data, error } = await db.from('toolkit_sites').select('slug,content,published').eq('user_id', userId).eq('project_id', projectId).maybeSingle();
  if (error) throw new Error('No pudimos comprobar la publicación. Revisa su estado antes de reintentar.');
  return data;
}
// Compare the complete published state, using columns already used by existing pages.
// No dependency on historical text-ID migrations or a new remote revision column.
export async function writeLandingPublication(db: SupabaseClient, userId: string, projectId: string, content: LandingDraft, previous: LandingPublication | null, published = true) {
  const values = { slug: content.slug, content, published };
  const result = previous
    ? await db.from('toolkit_sites').update(values).eq('user_id', userId).eq('project_id', projectId)
      .eq('slug', previous.slug).eq('published', previous.published).eq('content', JSON.stringify(previous.content)).select('slug,content,published').maybeSingle()
    : await db.from('toolkit_sites').insert({ ...values, user_id: userId, project_id: projectId }).select('slug,content,published').single();
  if (result.error?.code === '23505' || (!result.error && !result.data)) throw new Error('La publicación cambió en otra pestaña o ese enlace ya está ocupado. Revisa el estado antes de publicar; tu borrador se conserva.');
  if(result.error?.code==='P0001')throw new Error(result.error.message);
  if (result.error) throw new Error('No pudimos confirmar la publicación. Revisa su estado antes de reintentar; tu borrador se conserva.');
  return result.data as LandingPublication;
}
