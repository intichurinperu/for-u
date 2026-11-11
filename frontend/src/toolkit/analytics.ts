import { supabase } from "../lib/supabaseClient";
let transientVisitor: string | null = null;
export function visitorId() {
  const key = "foru:anonymous-visitor";
  try {
    const stored = localStorage.getItem(key);
    if (stored && /^[0-9a-f-]{36}$/i.test(stored)) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch {
    return (transientVisitor ??= crypto.randomUUID());
  }
}
export function publicReferrer(referrer: string) {
  try {
    const url = new URL(referrer);
    return ["https:", "http:"].includes(url.protocol) ? url.origin : "direct";
  } catch {
    return "direct";
  }
}
export async function recordSiteEvent(
  slug: string,
  kind: "page_view" | "cta_click",
) {
  if (!supabase) return;
  const event_id = crypto.randomUUID();
  const event = {
    site_slug: slug,
    event_id,
    visitor: visitorId(),
    kind,
    path: "/s/" + slug,
    source: publicReferrer(document.referrer),
  };
  const result = await supabase.rpc("record_site_analytics", event);
  // One idempotent retry covers short connection interruptions without counting a visit twice.
  if (result.error) await supabase.rpc("record_site_analytics", event);
}
