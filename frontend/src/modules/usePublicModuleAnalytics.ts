import { useEffect, useRef, type MouseEvent } from 'react';
import { supabase } from '../services/supabase';
import { publicReferrer, visitorId } from '../toolkit/analytics';
export function usePublicModuleAnalytics(slug: string, ready: boolean) {
  const recorded = useRef<string | null>(null);
  async function record(kind: 'page_view' | 'cta_click') {
    if (!supabase) return;
    const payload = { site_slug: slug, event_id: crypto.randomUUID(), visitor: visitorId(), kind, path: window.location.pathname, source: publicReferrer(document.referrer) };
    const { error } = await supabase.rpc('record_module_analytics', payload);
    if (error) await supabase.rpc('record_module_analytics', payload);
  }
  useEffect(() => { if (ready && recorded.current !== slug) { recorded.current = slug; void record('page_view'); } }, [ready, slug]);
  return (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    if (ready && link && /^(https:\/\/(wa.me|api.whatsapp.com)\/|tel:|mailto:)/i.test(link.href)) void record('cta_click');
  };
}
