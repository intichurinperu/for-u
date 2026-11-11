import { createClient } from "npm:@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no admitido." }, 405);
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const publicClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  let reservationId: string | undefined;
  try {
    const raw = await req.text();
    if (raw.length > 5000)
      return json({ error: "Solicitud demasiado grande." }, 413);
    const body = JSON.parse(raw);
    if (body.action === "retry-email") {
      const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
      if (!token) return json({ error: "Inicia sesión." }, 401);
      const {
        data: { user },
      } = await admin.auth.getUser(token);
      if (!user) return json({ error: "Sesión inválida." }, 401);
      const { data } = await admin
        .from("reservations")
        .select("id")
        .eq("id", body.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!data) return json({ error: "Reserva no disponible." }, 404);
      reservationId = data.id;
    } else if (body.action === "create") {
      if (body.website) return json({ error: "Solicitud inválida." }, 400);
      const { data, error } = await publicClient.rpc("book_reservation", {
        site_slug: body.slug,
        slot: body.slotId,
        customer: body.name,
        email: body.email,
        phone: body.phone,
        request: body.requestId,
      });
      if (error || !data?.id)
        return json({ error: error?.message ?? "No se pudo reservar." }, 409);
      reservationId = data.id;
    } else return json({ error: "Solicitud inválida." }, 400);
    const { data: currentReservation, error: currentError } = await admin
      .from("reservations")
      .select("status")
      .eq("id", reservationId)
      .single();
    if (currentError) return json({ id: reservationId, emailStatus: 'pending' });
    if (currentReservation?.status !== "confirmed")
      return json(
        { error: "Esta reserva ya no está pendiente de atención." },
        409,
      );
    const { data: notification, error: notificationError } = await admin
      .from("reservation_notifications")
      .select("*")
      .eq("reservation_id", reservationId)
      .single();
    if (notificationError || !notification) return json({ id: reservationId, emailStatus: 'pending' });
    if (notification?.status === "sent")
      return json({ id: reservationId, emailStatus: "sent" });
    if (
      notification?.last_attempt_at &&
      Date.now() - Date.parse(notification.last_attempt_at) < 60_000
    )
      return json({ id: reservationId, emailStatus: "pending" });
    const key = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("RESERVATIONS_FROM_EMAIL");
    if (!key || !from)
      return json({ id: reservationId, emailStatus: "pending" });
    const { data: reservation } = await admin
      .from("reservations")
      .select("*")
      .eq("id", reservationId)
      .single();
    if (!reservation) return json({ error: "Reserva no encontrada." }, 404);
    const [{ data: slot }, { data: site }] = await Promise.all([
      admin
        .from("reservation_slots")
        .select("starts_at,ends_at")
        .eq("id", reservation.slot_id)
        .eq("user_id", reservation.user_id)
        .single(),
      admin
        .from("toolkit_sites")
        .select("content")
        .eq("id", reservation.site_id)
        .eq("user_id", reservation.user_id)
        .single(),
    ]);
    if (!slot || !site) return json({ id: reservationId, emailStatus: 'pending' });
    // Conditional lease: simultaneous create/retry requests cannot both send.
    let lease = admin
      .from("reservation_notifications")
      .update({
        last_attempt_at: new Date().toISOString(),
        attempts: (notification?.attempts ?? 0) + 1,
      })
      .eq("reservation_id", reservationId);
    lease = notification.last_attempt_at ? lease.eq('last_attempt_at', notification.last_attempt_at) : lease.is('last_attempt_at', null);
    const claimed = await lease.select('reservation_id').maybeSingle();
    if (claimed.error || !claimed.data) return json({ id: reservationId, emailStatus: 'pending' });
    const date = new Date(slot.starts_at).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      dateStyle: "full",
      timeStyle: "short",
    });
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        "Idempotency-Key": "foru-reservation-" + reservationId,
      },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        from,
        to: [reservation.customer_email],
        subject: "Tu reserva en " + site?.content?.name,
        text:
          "Hola " +
          reservation.customer_name +
          ".\n\nTu reserva está confirmada para " +
          date +
          " (hora de Lima).\nNegocio: " +
          site?.content?.name +
          "\nReferencia: " +
          reservationId +
          "\n\nSi necesitas un cambio, comunícate con el negocio.",
      }),
    });
    const output = await result.json();
    const sent = result.ok && typeof output.id === "string";
    const savedNotification = await admin
      .from("reservation_notifications")
      .update({
        status: sent ? "sent" : "failed",
        ...(sent
          ? { sent_at: new Date().toISOString(), provider_id: output.id }
          : {}),
      })
      .eq("reservation_id", reservationId);
    return json({ id: reservationId, emailStatus: sent && !savedNotification.error ? 'sent' : sent ? 'pending' : 'failed' });
  } catch {
    // A notification/network failure must not turn a saved reservation into a
    // false booking failure. The same request UUID can still be retried safely.
    if (reservationId) return json({ id: reservationId, emailStatus: 'pending' });
    return json(
      {
        error:
          "No se pudo completar la solicitud. Puedes reintentar sin duplicar tu reserva.",
      },
      500,
    );
  }
});
