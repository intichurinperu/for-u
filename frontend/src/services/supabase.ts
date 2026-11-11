// Share the existing authenticated client; modules must never create a second session.
export { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
