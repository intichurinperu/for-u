import { Card as DSCard } from '../components/ui/DesignSystem';
import { Input as DSInput, ButtonSecondary as DSButtonSecondary, ButtonPrimary as DSButtonPrimary } from '../components/ui/DesignSystem';
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useToolkit } from "./ToolkitContext";
import { localDate } from "./engine";
type Slot = {
  id: string;
  starts_at: string;
  ends_at: string;
  remaining: number;
  capacity?: number;
  enabled?: boolean;
};
type Reservation = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  created_at: string;
  slot_id: string;
  reservation_notifications?: { status: string } | { status: string }[];
};
const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const timeLabel = (value: string) =>
  new Date(value).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function ReservationForm({ slug }: { slug: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState(localDate(new Date()));
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState("");
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const request = useRef(crypto.randomUUID());
  useEffect(() => {
    let active = true;
    setSlots([]); setSelected(""); setReceipt(""); setNotice(""); setLoadError(""); setLoading(true);
    request.current = crypto.randomUUID();
    const refresh = async () => {
      if (!supabase) {
        if (active) {
          setLoading(false);
          setLoadError("No se pudo conectar con la agenda.");
        }
        return;
      }
      const { data, error } = await supabase.rpc("public_reservation_slots", {
        site_slug: slug,
      });
      if (!active) return;
      setLoading(false);
      if (error) {
        setSlots([]);
        setLoadError("No se pudo cargar la disponibilidad. Puedes reintentar o contactar al negocio.");
        setSelected("");
      } else {
        setSlots(data ?? []);
        setLoadError("");
      }
    };
    void refresh();
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 15_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [slug, attempt]);
  const todaySlots = slots.filter(
    (slot) =>
      localDate(new Date(slot.starts_at)) === date && slot.remaining > 0,
  );
  return (
    <section className="tk-stack" aria-label="Agenda de reservas">
      <h2>Elige tu horario</h2>
      <p>
        Horarios en {zone()}. La disponibilidad se actualiza automáticamente.
      </p>
      {receipt ? (
        <p role="status" className="tk-notice">
          {receipt}
        </p>
      ) : (
        <form
          className="tk-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!supabase || busy || loading || loadError || !todaySlots.some(slot => slot.id === selected)) return;
            setBusy(true);
            setNotice("");
            const form = new FormData(e.currentTarget);
            try {
              const { data, error } = await supabase.functions.invoke(
                "reservations",
                {
                  body: {
                    action: "create",
                    slug,
                    slotId: selected,
                    name: form.get("name"),
                    email: form.get("email"),
                    phone: form.get("phone"),
                    website: form.get("website"),
                    requestId: request.current,
                  },
                },
              );
              if (error || !data?.id)
                throw new Error(
                  data?.error ??
                    "No pudimos confirmar la reserva. El horario puede haberse ocupado. Inténtalo de nuevo.",
                );
              setReceipt(
                data.emailStatus === "sent"
                  ? "Reserva confirmada. Enviamos los detalles a tu correo. Referencia: " +
                      data.id
                  : data.emailStatus === 'failed' ? 'Reserva guardada. No se pudo enviar el correo. Conserva esta referencia: ' + data.id
                  : "Reserva guardada. El envío del correo está pendiente de confirmar. Conserva esta referencia: " +
                      data.id,
              );
            } catch (error) {
              setNotice((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Fecha
            <DSInput
              type="date"
              required
              min={localDate(new Date())}
              value={date}
              onInput={e=>{setDate(e.currentTarget.value);setSelected('');request.current=crypto.randomUUID();}}
              onChange={(e) => {
                setDate(e.target.value);
                setSelected("");
                request.current = crypto.randomUUID();
              }}
            />
          </label>
          {loading ? (
            <p role="status">Consultando horarios…</p>
          ) : loadError ? <div role="alert"><p>{loadError}</p><DSButtonSecondary type="button" onClick={() => { setLoading(true); setAttempt(value => value + 1); }}>Reintentar disponibilidad</DSButtonSecondary></div> : todaySlots.length ? (
            <fieldset className="tk-slot-list">
              <legend>Horarios disponibles</legend>
              {todaySlots.map((slot) => (
                <label className="tk-check" key={slot.id}>
                  <DSInput
                    type="radio"
                    name="slot"
                    required
                    value={slot.id}
                    checked={selected === slot.id}
                    onChange={() => {
                      setSelected(slot.id);
                      request.current = crypto.randomUUID();
                    }}
                  />
                  {timeLabel(slot.starts_at)} – {timeLabel(slot.ends_at)} ·{" "}
                  {slot.remaining} cupos
                </label>
              ))}
            </fieldset>
          ) : (
            <p>No hay horarios disponibles este día.</p>
          )}
          {!loading && !loadError && slots.some(slot => slot.remaining > 0) && !todaySlots.length && (
            <DSButtonSecondary
              type="button"
              onClick={() => {
                const next = slots.find((slot) => slot.remaining > 0);
                if (next) { setDate(localDate(new Date(next.starts_at))); setSelected(""); request.current = crypto.randomUUID(); }
              }}
            >
              Ver el próximo día disponible
            </DSButtonSecondary>
          )}
          <label>
            Nombre
            <DSInput
              name="name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <DSInput
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
            />
          </label>
          <label>
            Teléfono
            <DSInput
              name="phone"
              type="tel"
              required
              minLength={7}
              maxLength={30}
              autoComplete="tel"
            />
          </label>
          <label style={{ display: "none" }} aria-hidden="true">
            Sitio web
            <DSInput name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <label className="tk-check">
            <DSInput required type="checkbox" /> Acepto que el negocio use estos
            datos para gestionar mi reserva y enviarme su confirmación.
          </label>
          <DSButtonPrimary
            type="submit"
            className="tk-primary"
            disabled={busy || loading || Boolean(loadError) || !todaySlots.some((slot) => slot.id === selected)}
          >
            {busy ? "Confirmando…" : "Confirmar reserva"}
          </DSButtonPrimary>
        </form>
      )}
      {notice && (
        <p role="alert" className="tk-notice">
          {notice}
        </p>
      )}
    </section>
  );
}

export function AvailabilityManager() {
  const { userId, projectId, demo } = useToolkit();
  const [siteId, setSiteId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [capacity, setCapacity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(!demo);
  const [loaded, setLoaded] = useState(demo);
  const [attempt, setAttempt] = useState(0);
  const operations = useRef(0);
  useEffect(() => {
    setSiteId(""); setSlots([]); setReservations([]); setNotice(""); setLoadError(""); setLoaded(demo);
    if (demo) { setLoading(false); return; }
    if (!supabase) { setLoading(false); setLoadError("Supabase no está configurado. No se pudo consultar la agenda."); return; }
    setLoading(true);
    let active = true;
    const client = supabase;
    const refresh = async () => {
      const revision = operations.current;
      if (revision % 2) return;
      try {
        const site = await client
          .from("toolkit_sites")
          .select("id")
          .eq("user_id", userId)
          .eq("project_id", projectId)
          .maybeSingle();
        if (!active || revision !== operations.current) return;
        if (site.error) {
          setLoadError("No se pudo consultar la agenda. Reintenta antes de hacer cambios.");
          return;
        }
        if (!site.data) {
          setSiteId(""); setSlots([]); setReservations([]); setLoaded(true); setLoadError("");
          setNotice("Guarda tu página para preparar horarios; estarán disponibles al publicarla.");
          return;
        }
        setSiteId(site.data.id);
        const [available, booked] = await Promise.all([
          client
            .from("reservation_slots")
            .select("*")
            .eq("user_id", userId)
            .eq("site_id", site.data.id)
            .gt("starts_at", new Date().toISOString())
            .order("starts_at")
            .limit(200),
          client
            .from("reservations")
            .select("*,reservation_notifications(status)")
            .eq("user_id", userId)
            .eq("site_id", site.data.id)
            .order("created_at", { ascending: false })
            .limit(100),
        ]);
        if (!active || revision !== operations.current) return;
        if (available.error || booked.error)
          setLoadError("No se pudo actualizar la agenda. Los datos anteriores pueden estar desactualizados.");
        else {
          setSlots(available.data ?? []);
          setReservations(booked.data ?? []);
          setLoadError(""); setLoaded(true);
        }
      } catch {
        if (active && revision === operations.current) setLoadError("No se pudo conectar con la agenda. Revisa tu conexión y reintenta.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void refresh();
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 15_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [demo, projectId, userId, attempt]);
  return (
    <DSCard as="section" className="tk-card tk-stack">
      <h2>Tu disponibilidad real</h2>
      <p>Crea los horarios que quieres ofrecer. Zona horaria: {zone()}.</p>
      <DSButtonSecondary disabled={busy || loading || demo} onClick={()=>setAttempt(value=>value+1)}>Actualizar agenda</DSButtonSecondary>
      {loading && <p role="status">Consultando tu agenda…</p>}
      {loadError && <div role="alert"><p>{loadError}</p><DSButtonSecondary type="button" onClick={() => setAttempt(value => value + 1)}>Reintentar agenda</DSButtonSecondary></div>}
      <form
        className="tk-toolbar"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy || loading || loadError || (!demo && !siteId) || !start) return;
          const from = new Date(start);
          if (!Number.isFinite(from.getTime()) || from.getTime() <= Date.now()) {
            setNotice("Elige un horario futuro.");
            return;
          }
          if (!Number.isInteger(minutes) || minutes < 15 || minutes > 480 || minutes % 15 !== 0 || !Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
            setNotice("Revisa la duración (15–480 minutos) y los cupos (1–100)."); return;
          }
          setBusy(true);
          operations.current++;
          try {
            const slot = {
              id: crypto.randomUUID(),
              user_id: userId,
              site_id: siteId,
              starts_at: from.toISOString(),
              ends_at: new Date(
                from.getTime() + minutes * 60_000,
              ).toISOString(),
              capacity,
              enabled: true,
            };
            if (!demo) {
              if (!supabase || !siteId)
                throw new Error("Publica tu página primero.");
              const { error } = await supabase
                .from("reservation_slots")
                .insert(slot);
              if (error)
                throw new Error(
                  error.code === "23505"
                    ? "Este horario ya existe."
                    : "No se pudo guardar el horario.",
                );
            }
            setSlots((current) => [
              ...current,
              { ...slot, remaining: capacity },
            ]);
            setNotice(
              demo
                ? "Horario de prueba añadido a esta sesión."
                : "Horario guardado. Será público cuando la página esté publicada y su agenda activada.",
            );
          } catch (error) {
            setNotice((error as Error).message);
          } finally {
            operations.current++;
            setBusy(false);
          }
        }}
      >
        <label>
          Inicio
          <DSInput
            type="datetime-local"
            required
            value={start}
            onInput={e=>setStart(e.currentTarget.value)}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          Duración (minutos)
          <DSInput
            type="number"
            min={15}
            max={480}
            step={15}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </label>
        <label>
          Cupos
          <DSInput
            type="number"
            min={1}
            max={100}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </label>
        <DSButtonSecondary disabled={busy || loading || Boolean(loadError) || (!demo && !siteId)}>Abrir horario</DSButtonSecondary>
      </form>
      <div className="tk-stack">
        {slots.map((slot) => (
          <article className="tk-booking" key={slot.id}>
            <div>
              <strong>
                {new Date(slot.starts_at).toLocaleString("es-PE")}
              </strong>
              <p>
                Capacidad: {slot.capacity} · {slot.enabled ? "Abierto" : "Cerrado"}
              </p>
            </div>
            <DSButtonSecondary
              disabled={busy || loading || Boolean(loadError)}
              onClick={async () => {
                setBusy(true);
                operations.current++;
                const enabled = !slot.enabled;
                try {
                if (!demo && supabase) {
                  const { error, data } = await supabase
                    .from("reservation_slots")
                    .update({ enabled })
                    .eq("id", slot.id)
                    .eq("user_id", userId)
                    .eq("site_id", siteId).select('id').maybeSingle();
                  if (error || !data) {
                    setLoadError("No se pudo confirmar el cambio de horario. Actualiza la agenda antes de editar.");
                    return;
                  }
                }
                setSlots(
                  slots.map((s) => (s.id === slot.id ? { ...s, enabled } : s)),
                );
                } catch {setLoadError('No se pudo confirmar el cambio. Reintenta la agenda.');}
                finally {operations.current++;setBusy(false);}
              }}
            >
              {slot.enabled ? "Cerrar nuevas reservas" : "Abrir reservas"}
            </DSButtonSecondary>
          </article>
        ))}
      </div>
      <h3>Registro de reservas</h3>
      {loaded && !loading && !loadError && !reservations.length && <p>No hay reservas todavía.</p>}
      {reservations.map((reservation) => {
        const mail = Array.isArray(reservation.reservation_notifications)
          ? reservation.reservation_notifications[0]
          : reservation.reservation_notifications;
        return (
          <article className="tk-booking" key={reservation.id}>
            <div>
              <strong>{reservation.customer_name}</strong>
              <p>
                {reservation.customer_email} · {reservation.customer_phone}
              </p>
              <small>
                Correo: {mail?.status === "sent" ? "enviado" : mail?.status === 'failed' ? 'envío fallido' : mail?.status === 'pending' ? 'pendiente' : 'estado no disponible'}
              </small>
            </div>
            <div className="tk-stack">
              <label>
                Estado
                <select
                  value={reservation.status}
                  disabled={busy || loading || Boolean(loadError)}
                  onChange={async (e) => {
                    if (!supabase || busy) return;
                    const status = e.target.value;
                    setBusy(true);
                    operations.current++;
                    try {
                    const { error, data } = await supabase
                      .from("reservations")
                      .update({ status })
                      .eq("id", reservation.id)
                      .eq("user_id", userId).eq('site_id',siteId).eq('status',reservation.status).select('id').maybeSingle();
                    if (error || !data) setLoadError("No se pudo confirmar el cambio. La reserva puede haber cambiado; reintenta la carga antes de editar.");
                    else
                      setReservations((current) =>
                        current.map((r) =>
                          r.id === reservation.id ? { ...r, status } : r,
                        ),
                      );
                    } catch { setLoadError('No se pudo confirmar el estado. Reintenta la agenda.'); }
                    finally {operations.current++;setBusy(false);}
                  }}
                >
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </label>
              {mail?.status !== "sent" && reservation.status === 'confirmed' && (
                <DSButtonSecondary
                  disabled={busy || loading || Boolean(loadError)}
                  onClick={async () => {
                    if (!supabase) return;
                    setBusy(true);
                    operations.current++;
                    try {
                    const { data, error } = await supabase.functions.invoke(
                      "reservations",
                      { body: { action: "retry-email", id: reservation.id } },
                    );
                    setNotice(
                      !error && data?.emailStatus === "sent"
                        ? "Confirmación enviada."
                        : "El envío sigue pendiente. Revisa la configuración de correo.",
                    );
                    if(!error && data?.emailStatus) setReservations(current=>current.map(r=>r.id===reservation.id?{...r,reservation_notifications:{status:data.emailStatus==='sent'?'sent':data.emailStatus==='failed'?'failed':'pending'}}:r));
                    } catch { setNotice('El envío no se pudo confirmar. La reserva permanece guardada.'); }
                    finally {operations.current++;setBusy(false);}
                  }}
                >
                  Reintentar confirmación
                </DSButtonSecondary>
              )}
            </div>
          </article>
        );
      })}
      {notice && (
        <p role="status" className="tk-notice">
          {notice}
        </p>
      )}
    </DSCard>
  );
}
