import { supabase } from '../../services/supabase';
export async function resolveMediaPath(path: string) {
  if (!supabase || !path) return '';
  const { data, error } = await supabase.storage.from('user-uploads').createSignedUrl(path, 3600);
  if (error) throw new Error('No se pudo cargar esta imagen. Vuelve a abrir la biblioteca.');
  return data.signedUrl;
}
