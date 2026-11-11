import { Card as DSCard } from '../components/ui/DesignSystem';
import { Input as DSInput, ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { supabase } from "../lib/supabaseClient";
import { useToolkit } from "./ToolkitContext";
import { connectionState, connectionLabels, type Connection } from './connectionModel';
const providers = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    url: "https://calendar.google.com/",
    help: "Esta versión requiere un token OAuth con permiso de lectura de calendarios. Abrir Google Calendar no autoriza FOR U. El inicio de sesión con Google aún no está integrado.",
  },
  {
    id: "calendly",
    name: "Calendly",
    url: "https://calendly.com/integrations/api_webhooks",
    help: "En Calendly, crea un token personal con permiso para leer tu usuario.",
  },
  {
    id: "manychat",
    name: "ManyChat",
    url: "https://app.manychat.com/",
    help: "Copia la clave de API de Configuración → API en tu cuenta ManyChat.",
  },
  {
    id: "meta_ads",
    name: "Meta Ads",
    url: "https://business.facebook.com/",
    help: "Usa una autorización con ads_read y acceso a una cuenta publicitaria.",
  },
];
export default function ConnectionStatus({ calendarOnly = false, readOnly = false }: { calendarOnly?: boolean; readOnly?: boolean }) {
  const { userId, projectId, demo } = useToolkit();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const [attempt, setAttempt] = useState(0);
  const [queryError, setQueryError] = useState(false);
  const [loading, setLoading] = useState(!demo);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    setConnections([]); setActionErrors({}); setQueryError(false); setNotice(''); setLoading(!demo);
    if (demo) return;
    if (!supabase) { setQueryError(true); setLoading(false); setNotice('Supabase no está configurado. No se pudo consultar conexiones.'); return; }
    let active = true;
    const client = supabase;
    const load = async () => {
      try { const { data, error } = await client
        .from("integration_connections")
        .select("provider,connected,checked_at,account_label,verification_state,last_error")
        .eq("user_id", userId);
      if (!active) return;
      setLoading(false);
      if (error) { setQueryError(true); setNotice("No se pudo consultar el estado de tus conexiones. El calendario interno sigue disponible."); }
      else {
        setQueryError(false);
        setNotice("");
        setConnections(data ?? []);
        setClock(Date.now());
      }
      } catch { if(active){setLoading(false);setQueryError(true);setNotice('No se pudo consultar conexiones. Reintenta.');} }
    };
    void load();
    const timer = window.setInterval(() => {
      setClock(Date.now());
      if (!document.hidden) void load();
    }, 30_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [userId, demo, attempt]);
  async function update(
    provider: string,
    action: string,
    accessToken?: string,
  ) {
    if (!supabase || demo) return;
    setBusy(provider);
    setNotice("");
    try {
      const { data, error } = await supabase.functions.invoke("integrations", {
        body: { provider, action, accessToken },
      });
      if (error)
        throw new Error(
          "No se pudo verificar la conexión. Revisa tu sesión y vuelve a intentar.",
        );
      if (!data || typeof data.connected !== 'boolean' || (action !== 'disconnect' && (!data.checked_at || !['verified','expired','error'].includes(data.verification_state)))) throw new Error('El servicio no confirmó un estado válido. Reintenta.');
      setActionErrors(current => { const next = { ...current }; delete next[provider]; return next; });
      if (action === 'disconnect') {
        setConnections(current=>current.filter(c=>c.provider!==provider));
      } else {
      // This function runs only from explicit form/click handlers.
      // eslint-disable-next-line react-hooks/purity
      setClock(Date.now());
      setConnections((current) => [
        ...current.filter((c) => c.provider !== provider),
        {
          provider,
          connected: Boolean(data?.connected),
          checked_at: data.checked_at,
          account_label: data?.account_label,
          verification_state: data?.verification_state,
          last_error: data?.last_error,
        },
      ]);
      }
      setNotice(
        data?.error ??
          (action === "disconnect"
            ? "Cuenta desconectada."
            : "Estado verificado con el servicio."),
      );
    } catch (error) {
      setActionErrors(current => ({ ...current, [provider]: (error as Error).message }));
      setNotice((error as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <DSCard as="section" className="tk-card tk-stack">
      <h3>Tus conexiones</h3>
      <p>
        El estado conectado requiere una verificación válida durante los últimos
        15 minutos.
      </p>
      <div className="tk-connection-grid">
        {providers.filter(provider => !calendarOnly || ['google_calendar', 'calendly'].includes(provider.id)).map((provider) => {
          const row = connections.find((c) => c.provider === provider.id);
          const state = connectionState(row,clock,loading,queryError,Boolean(actionErrors[provider.id]));
          const fresh = state === 'verified';
          return (
            <article className="tk-stack" key={provider.id}>
              <strong>{provider.name}</strong>
              <span className="tk-connection-status">
                <i className={fresh ? "is-connected" : ""} aria-hidden="true" />
                {connectionLabels[state]}
              </span>
              {row?.last_error && <small>{row.last_error}</small>}
              {row?.account_label && <small>{row.account_label}</small>}
              {row?.checked_at && (
                <small>
                  Última verificación:{" "}
                  {new Date(row.checked_at).toLocaleString("es-PE")}
                </small>
              )}
              {!readOnly && <details>
                <summary>Gestionar conexión</summary>
                <p>{provider.help}</p>
                <a href={provider.url} target="_blank" rel="noreferrer">
                  Consultar {provider.name} ↗
                </a>
                <form
                  className="tk-stack"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const token = String(new FormData(form).get("token") ?? "");
                    void update(provider.id, "connect", token);
                    form.reset();
                  }}
                >
                  <label>
                    Token de autorización del servicio
                    <DSInput
                      name="token"
                      type="password"
                      autoComplete="off"
                      required
                      maxLength={5000}
                      disabled={demo || loading || queryError || Boolean(busy)}
                    />
                  </label>
                  <small>
                    Se guarda en el servidor y nunca en el almacenamiento del
                    navegador. Verifica acceso; no activa envíos ni
                    sincronización automática.
                  </small>
                  <DSButtonSecondary disabled={demo || loading || queryError || Boolean(busy)}>
                    Conectar y verificar
                  </DSButtonSecondary>
                </form>
                {row && (
                  <div className="tk-toolbar">
                    <DSButtonSecondary
                      disabled={loading || queryError || Boolean(busy)}
                      onClick={() => void update(provider.id, "verify")}
                    >
                      Verificar estado
                    </DSButtonSecondary>
                    <DSButtonSecondary
                      disabled={loading || queryError || Boolean(busy)}
                      onClick={() => void update(provider.id, "disconnect")}
                    >
                      Desconectar
                    </DSButtonSecondary>
                  </div>
                )}
              </details>}
            </article>
          );
        })}
      </div>
      {demo && <p>Las conexiones están desactivadas en la prueba.</p>}
      {notice && <p role="status">{notice}</p>}
      {queryError && <DSButtonSecondary onClick={() => setAttempt(value => value + 1)}>Reintentar consulta</DSButtonSecondary>}
      {readOnly && <Link to={`/dashboard/settings?project=${encodeURIComponent(projectId)}`}>Gestionar en Configuración →</Link>}
    </DSCard>
  );
}
