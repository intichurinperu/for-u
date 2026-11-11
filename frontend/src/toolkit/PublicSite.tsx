import { Input as DSInput, ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { LandingPreview } from "./LandingPreview";
import { safeHttps } from "./engine";
import type { LandingDraft } from "./types";
import { parseSiteData } from "./publicData";
import { useSiteSeo } from "./useSiteSeo";
import { recordSiteEvent } from "./analytics";
import { ReservationForm } from "./Reservations";
import CommerceCheckout from '../payments/CommerceCheckout';
import "./toolkit.css";
export default function PublicSite() {
  const { slug } = useParams();
  return <PublicSiteView key={slug} slug={slug} />;
}
function PublicSiteView({ slug }: { slug?: string }) {
  const [draft, setDraft] = useState<LandingDraft | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase && slug));
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useRef<HTMLElement>(null);
  const counted = useRef("");
  useSiteSeo(draft, slug, loading);
  useEffect(() => {
    let active = true;
    if (!supabase || !slug) return;
    const refresh = () => {
      void supabase!
        .rpc("toolkit_public_site", { site_slug: slug })
        .then(({ data, error }) => {
          if (!active) return;
          setLoading(false);
          const site = parseSiteData(data?.content);
          if (error || !site) {
            setDraft(null);
            setNotice("Esta página no está disponible.");
            return;
          }
          setDraft(site);
          if (counted.current !== slug) {
            counted.current = slug;
            void recordSiteEvent(slug, "page_view");
          }
        });
    };
    refresh();
    const timer = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, 30_000);
    return () => {
      clearInterval(timer);
      active = false;
    };
  }, [slug]);
  function click() {
    if (slug) void recordSiteEvent(slug, "cta_click");
  }
  if (loading) return <main className="tk-public">Cargando…</main>;
  if (!draft)
    return (
      <main className="tk-public">
        <h1>Página no disponible</h1>
        <p>{notice || "Comprueba el enlace o vuelve más tarde."}</p>
        <a href="/">Ir a FOR U</a>
      </main>
    );
  return (
    <main className="tk-public">
      <LandingPreview
        draft={draft}
        hostSlug={slug}
        onCTA={() => {
          click();
          if (!draft.ctaDesign?.url) form.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? "auto" : "smooth" });
        }}
      >
        {slug&&<CommerceCheckout slug={slug} sourceKind="toolkit"/>}
        <section ref={form} className="tk-site-block">
          {slug && (draft.bookingEnabled === true || (draft.bookingEnabled === undefined && draft.offers === undefined)) && <ReservationForm slug={slug} />}
          <hr />
          <h2>Cuéntanos qué necesitas</h2>
          {sent ? (
            <p role="status">
              Recibimos tu solicitud. El negocio te contactará para confirmar
              disponibilidad.
            </p>
          ) : (
            <form
              className="tk-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!supabase || busy) return;
                const data = new FormData(e.currentTarget);
                if (data.get("website")) return;
                setBusy(true);
                setNotice("");
                try {
                  const { error } = await supabase.rpc(
                    "toolkit_submit_booking",
                    {
                      site_slug: slug,
                      customer: data.get("name"),
                      contact_value: data.get("contact"),
                      answers: Object.fromEntries(
                        draft.fields.map((field, i) => [
                          field,
                          String(data.get(`field-${i}`) ?? ""),
                        ]),
                      ),
                    },
                  );
                  if (error) throw error;
                  setSent(true);
                } catch {
                  setNotice(
                    "No se pudo enviar. Revisa tus datos y espera unos minutos antes de volver a intentar.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                Tu nombre
                <DSInput
                  required
                  name="name"
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                />
              </label>
              <label>
                Correo o WhatsApp
                <DSInput required name="contact" minLength={5} maxLength={200} />
              </label>
              <div style={{ display: "none" }} aria-hidden="true">
                <label>
                  Sitio web
                  <DSInput name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              {draft.fields.slice(0, 8).map((field, i) => (
                <label key={`${field}-${i}`}>
                  {field}
                  <DSInput name={`field-${i}`} required maxLength={300} />
                </label>
              ))}
              <label className="tk-check">
                <DSInput type="checkbox" required /> Acepto que {draft.name} use
                estos datos para responder mi solicitud.
              </label>
              <DSButtonSecondary disabled={busy} type="submit">
                {busy ? "Enviando…" : "Enviar solicitud"}
              </DSButtonSecondary>
            </form>
          )}
          {notice && <p role="status">{notice}</p>}
          <div className="tk-toolbar">
            {/^\d{8,15}$/.test(draft.whatsapp) && (
              <a
                href={`https://wa.me/${draft.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                onClick={click}
              >
                Consultar por WhatsApp ↗
              </a>
            )}
            {safeHttps(draft.calendly, "calendly.com") && (
              <a
                href={safeHttps(draft.calendly, "calendly.com")}
                target="_blank"
                rel="noreferrer"
                onClick={click}
              >
                Elegir horario en Calendly ↗
              </a>
            )}
          </div>
        </section>
      </LandingPreview>
    </main>
  );
}
