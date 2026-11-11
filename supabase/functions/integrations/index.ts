import { createClient } from "npm:@supabase/supabase-js@2";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });
const endpoints: Record<string, string> = {
  google_calendar:
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1",
  calendly: "https://api.calendly.com/users/me",
  manychat: "https://api.manychat.com/fb/page/getInfo",
  meta_ads:
    "https://graph.facebook.com/" +
    (Deno.env.get("META_GRAPH_VERSION") || "v25.0") +
    "/me/adaccounts?fields=id,name&limit=1",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST")
    return reply({ error: "Método no admitido." }, 405);
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (!token) return reply({ error: "Inicia sesión." }, 401);
  const {
    data: { user },
  } = await admin.auth.getUser(token);
  if (!user) return reply({ error: "Sesión inválida." }, 401);
  try {
    const raw = await req.text();
    if (raw.length > 6000)
      return reply({ error: "Solicitud demasiado grande." }, 413);
    const { provider, action, accessToken } = JSON.parse(raw);
    if (
      !Object.hasOwn(endpoints, provider) ||
      !["connect", "verify", "disconnect"].includes(action)
    )
      return reply({ error: "Solicitud inválida." }, 400);
    if (action === "disconnect") {
      const removedCredential = await admin.from('integration_credentials').delete().eq('user_id',user.id).eq('provider',provider);
      if (removedCredential.error) return reply({error:'No se pudo retirar la autorización. Reintenta.'},500);
      const { error } = await admin
        .from("integration_connections")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", provider);
      return error
        ? reply({ error: "No se pudo desconectar." }, 500)
        : reply({ connected: false });
    }
    const { data: previous, error: previousError } = await admin
      .from("integration_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .maybeSingle();
    if (previousError) return reply({ error: 'No se pudo consultar la conexión guardada.' }, 500);
    if (
      action === "verify" &&
      previous?.checked_at &&
      Date.now() - Date.parse(previous.checked_at) < 30_000
    )
      return reply(previous);
    let credential = accessToken;
    if (action === "verify") {
      const { data, error: credentialError } = await admin
        .from("integration_credentials")
        .select("access_token")
        .eq("user_id", user.id)
        .eq("provider", provider)
        .maybeSingle();
      if (credentialError) return reply({ error: 'No se pudo consultar la autorización guardada.' }, 500);
      credential = data?.access_token;
    }
    if (
      typeof credential !== "string" ||
      credential.length < 10 ||
      credential.length > 5000 ||
      /[\r\n]/.test(credential)
    )
      return reply(
        {
          connected: false,
          error: "Agrega una autorización válida del servicio.",
        },
        400,
      );
    const result = await fetch(endpoints[provider], {
      headers: {
        Authorization: "Bearer " + credential,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });
    const data = await result.json().catch(() => ({}));
    const connected =
      result.ok &&
      (provider === "manychat"
        ? data.status === "success" && Boolean(data.data?.id)
        : provider === "calendly"
          ? Boolean(data.resource?.uri)
          : provider === "meta_ads"
            ? Array.isArray(data.data) && data.data.length > 0
            : data.kind === "calendar#calendarList");
    const label =
      provider === "calendly"
        ? data.resource?.name
        : provider === "manychat"
          ? data.data?.name
          : provider === "meta_ads"
            ? data.data?.[0]?.name
            : data.items?.[0]?.summary;
    const row = {
      user_id: user.id,
      provider,
      connected,
      checked_at: new Date().toISOString(),
      account_label:
        connected && typeof label === "string" ? label.slice(0, 150) : null,
      verification_state: connected ? 'verified' : result.status === 401 || provider === 'meta_ads' && data.error?.code === 190 ? 'expired' : 'error',
      last_error: connected ? null : result.status === 401 || provider === 'meta_ads' && data.error?.code === 190
        ? 'Renueva la autorización y comprueba los permisos de acceso.'
        : result.status === 403 ? 'La autorización no permite consultar este servicio. Revisa los permisos.'
        : 'El servicio no confirmó acceso. Vuelve a verificar en unos minutos.',
    };
    const { error } = await admin.from("integration_connections").upsert(row);
    if (error)
      return reply({ error: "No se pudo guardar la verificación." }, 500);
    if (connected && action === "connect") {
      const saved = await admin
        .from("integration_credentials")
        .upsert({ user_id: user.id, provider, access_token: credential });
      if (saved.error) {
        await admin
          .from("integration_connections")
          .update({ connected: false, verification_state: 'error', last_error: 'La verificación no pudo conservar su autorización. Vuelve a conectar.' })
          .eq("user_id", user.id)
          .eq("provider", provider);
        return reply({ error: "No se pudo guardar la autorización." }, 500);
      }
    }
    return reply({
      ...row,
      ...(!connected
        ? {
            error:
              "No se pudo verificar acceso a la cuenta. Revisa permisos o renueva la autorización.",
          }
        : {}),
    });
  } catch {
    return reply(
      { error: "No se pudo contactar al servicio. Reintenta." },
      502,
    );
  }
});
