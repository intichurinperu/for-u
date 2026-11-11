import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea } from '../components/ui/DesignSystem';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  ChevronLeft,
  MessageCircle,
  Rocket,
  Settings,
  Sparkles,
  Store,
} from '../lib/icons';
import { buildWhatsappConfirmationUrl, saveConsultationRequest, type ConsultationRequestInput } from '../lib/consultationRequests';

const services = [
  ['Presencia', 'Webs & Apps a Medida', 'Landing pages, sitios completos o web apps. Diseñadas desde cero, alineadas a tu esencia y optimizadas para convertir.', Store],
  ['Automatización', 'Chatbots & Respuestas IA', 'Atención automática en WhatsApp, Instagram y tu web. Califica leads, responde dudas y agenda citas 24/7.', Bot],
  ['Operación', 'Reservas & Pedidos', 'Sistemas de agenda, pedidos o catálogos interactivos. Tu cliente reserva, pide o compra directamente.', CalendarDays],
  ['Ingresos digitales', 'Productos & Servicios Digitales', 'Cursos, membresías, descargas, asesorías. Pasarelas de pago y entregas automáticas.', Rocket],
  ['Crecimiento', 'Campañas & Embudos', 'Meta Ads, Google Ads, tracking avanzado, landing pages optimizadas. Atraemos tráfico y lo convertimos.', Sparkles],
  ['Integración', 'Configuración Completa', 'Conectamos web, WhatsApp, calendario, base de datos y redes. Todo hablando el mismo idioma.', Settings],
] as const;

const plans = [
  {
    name: 'Esencial',
    type: 'Sistema Base',
    old: 'S/ 649',
    price: 'S/ 389',
    description: 'Landing page estratégica + chatbot básico. Perfecto para empezar a convertir visitas en mensajes reales.',
    items: ['Landing page de una sola página', 'Chatbot de WhatsApp automatizado', 'Redacción de textos persuasivos', 'Botón directo a WhatsApp', 'Hosting incluido 1er año'],
  },
  {
    name: 'Profesional',
    type: 'Sistema Completo',
    old: 'S/ 1,149',
    price: 'S/ 689',
    description: 'Sitio web completo + automatizaciones + reservas. El sistema que necesitas para escalar sin perder tiempo.',
    items: ['Sitio web de varias páginas', 'Chatbot avanzado con IA', 'Sistema de reservas automático', 'Formulario de contacto inteligente', 'Google Maps + SEO básico', 'Landing de marca incluida'],
    featured: true,
  },
  {
    name: 'Premium',
    type: 'Sistema a Medida',
    old: 'S/ 1,650',
    price: 'S/ 990',
    description: 'Web app completa + IA + productos digitales + campañas. El ecosistema que hace que tu negocio escale solo.',
    items: ['Web app con pedidos o reservas', 'Integración con IA personalizada', 'Productos digitales con entrega automática', 'Configuración de campañas', 'Soporte VIP por 15 días'],
  },
];

const bookingSlots = ['09:00', '10:30', '12:00', '15:00', '16:30', '18:00'];
const bookingStepLabels = ['Horario', 'Contacto', 'Negocio', 'Objetivo'];

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatSlot(slot: string) {
  const [hour, minute] = slot.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' });
}

export default function MundoDigital() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(0);
  const [form, setForm] = useState<ConsultationRequestInput>({
    fullName: '',
    businessName: '',
    instagramHandle: '',
    email: '',
    phoneWhatsapp: '',
    businessType: '',
    goal: '',
    appointmentDate: getTodayDateValue(),
    appointmentTime: bookingSlots[0],
    planInterest: 'Por definir',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'local' | 'error'>('idle');
  const [error, setError] = useState('');
  const [confirmationUrl, setConfirmationUrl] = useState('');

  function updateField(field: keyof ConsultationRequestInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openBooking(planInterest?: string) {
    if (planInterest) updateField('planInterest', planInterest);
    setBookingOpen(true);
    setBookingStep(0);
    setStatus('idle');
    setError('');
    setConfirmationUrl('');
  }

  function closeBooking() {
    setBookingOpen(false);
    setError('');
  }

  function validateStep(step: number) {
    if (step === 0 && (!form.appointmentDate || !form.appointmentTime)) {
      return 'Elige una fecha y un horario para continuar.';
    }

    if (step === 1 && (!form.fullName.trim() || !form.phoneWhatsapp.trim())) {
      return 'Dejame tu nombre y WhatsApp para poder confirmar la cita.';
    }

    if (step === 2 && !form.businessType.trim()) {
      return 'Elige el tipo de negocio para entender mejor tu caso.';
    }

    if (step === 3 && !form.goal.trim()) {
      return 'Cuentame que quieres lograr primero para reservar con contexto.';
    }

    return '';
  }

  function nextStep() {
    const stepError = validateStep(bookingStep);

    if (stepError) {
      setError(stepError);
      return;
    }

    setError('');
    setBookingStep((current) => Math.min(current + 1, bookingStepLabels.length - 1));
  }

  function previousStep() {
    setError('');
    setBookingStep((current) => Math.max(current - 1, 0));
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError('');

    if (!form.fullName.trim() || !form.phoneWhatsapp.trim() || !form.goal.trim() || !form.appointmentDate || !form.appointmentTime) {
      setStatus('idle');
      setError('Elige fecha, horario, nombre, WhatsApp y objetivo para reservar.');
      return;
    }

    try {
      const nextConfirmationUrl = buildWhatsappConfirmationUrl(form);
      const result = await saveConsultationRequest(form);
      setConfirmationUrl(nextConfirmationUrl);
      setStatus(result.savedRemote ? 'sent' : 'local');
      setForm((current) => ({
        ...current,
        fullName: '',
        businessName: '',
        instagramHandle: '',
        email: '',
        phoneWhatsapp: '',
        businessType: '',
        goal: '',
        appointmentDate: getTodayDateValue(),
        appointmentTime: bookingSlots[0],
      }));
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="foru-lp">
      <nav className="foru-lp-nav">
        <Link to="/" className="foru-logo">FOR <span>U</span></Link>
        <div className="foru-lp-links">
          <a href="#servicios" className="foru-lp-link">Servicios</a>
          <a href="#caso" className="foru-lp-link">Caso real</a>
          <a href="#oferta" className="foru-lp-link">Oferta</a>
          <Link to="/" className="top-nav-back">← Hub</Link>
        </div>
      </nav>

      <section className="foru-lp-hero">
        <div className="foru-reference-blur foru-reference-blur--gold" />
        <div className="foru-reference-blur foru-reference-blur--green" />
        <div className="foru-reference-blur foru-reference-blur--pink" />
        <div className="foru-lp-inner">
          <span className="foru-lp-badge">Oferta limitada · Diagnostico gratis</span>
          <h1 className="foru-lp-title">
            <span>Tienes el producto.</span>
            <span>Tienes los clientes.</span>
            <span className="foru-reference-gradient-text italic">Te falta el sistema.</span>
          </h1>
          <p className="foru-lp-sub">
            Un sistema digital <strong>no es solo una web</strong>. Es el motor que hace que tu negocio funcione por ti:
            automatizaciones, chatbots, reservas, productos digitales, campañas y más. <strong>Todo integrado a tu realidad.</strong>
          </p>
          <div className="foru-lp-buttons">
            <DSButtonSecondary type="button" className="foru-btn" onClick={() => openBooking()}>Agendar cita <CalendarDays size={18} /></DSButtonSecondary>
            <a href="#oferta" className="foru-btn foru-btn--outline">Ver planes con 40% OFF <ArrowRight size={18} /></a>
          </div>
          <p className="text-sm font-medium text-gray-400">Diagnóstico gratuito de 15 minutos · Sin compromiso</p>
        </div>
      </section>

      <section className="foru-lp-section">
        <div className="foru-lp-diag">
          <span className="foru-lp-icon"><Sparkles size={28} /></span>
          <h2 className="font-serif text-3xl font-bold">¿No sabes exactamente qué necesita tu negocio?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-8 text-gray-500">
            Es normal. Muchas emprendedoras tienen una idea clara, pero no saben si les conviene una web, un chatbot,
            reservas automáticas, productos digitales o una campaña que convierta.
          </p>
          <p className="mt-3 font-semibold">No tienes que saberlo todo. Solo necesitas traducir tu visión en tecnología real.</p>
        </div>
      </section>

      <section id="servicios" className="foru-lp-section">
        <div className="foru-lp-inner">
          <div className="foru-lp-section-header">
            <h2 className="foru-lp-section-title">Un sistema digital es <span className="foru-reference-gradient-text">mucho más</span> que una web</h2>
            <p className="foru-lp-section-sub">Dependiendo de tu negocio, instalamos una o varias piezas. Todo conectado, todo trabajando por ti.</p>
          </div>
          <div className="foru-lp-grid">
            {services.map(([label, title, text, Icon]) => (
              <article key={title} className="foru-lp-service">
                <span className="foru-lp-service-icon"><Icon size={23} /></span>
                <p className="foru-lp-label">{label}</p>
                <h3 className="foru-lp-card-title">{title}</h3>
                <p className="foru-lp-card-text">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="caso" className="foru-lp-section">
        <div className="foru-lp-inner">
          <div className="foru-lp-section-header">
            <h2 className="foru-lp-section-title">Caso real: <span className="foru-reference-gradient-text">Somos Cíclicas</span></h2>
            <p className="foru-lp-section-sub">Así convertimos una marca de suplementos en un sistema digital completo.</p>
          </div>
          <div className="foru-lp-case">
            <div>
              <h3>De vender suplementos a crear una experiencia completa</h3>
              <p>Somos Cíclicas empezó como una marca de suplementos para mujeres. Pero los suplementos solos no eran suficientes.</p>
              <p>Construimos una app con IA, calendario personalizado, biblioteca de rutinas, comunidad y automatizaciones.</p>
            </div>
            <div className="foru-lp-case-visual">
              <h3 className="mb-3 font-serif text-lg font-bold">Lo que incluye el sistema</h3>
              {['Asistente IA personalizado', 'Calendario editable', 'Biblioteca de rutinas y recetas', 'Comunidad', 'Integración con Telegram y WhatsApp'].map((item) => (
                <div key={item} className="foru-lp-feature">
                  <span className="foru-lp-feature-icon">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="oferta" className="foru-lp-section">
        <div className="foru-lp-inner">
          <div className="foru-lp-section-header">
            <span className="foru-lp-badge">Oferta por tiempo limitado</span>
            <h2 className="foru-lp-section-title mt-5">Tu sistema digital a medida<br /><span className="foru-reference-gradient-text">con 40% de descuento</span></h2>
            <p className="foru-lp-section-sub">Para emprendedoras que ya tienen su contenido, producto o idea clara.</p>
          </div>
          <div className="foru-lp-grid">
            {plans.map((plan) => (
              <article key={plan.name} className={`foru-lp-plan ${plan.featured ? 'foru-lp-plan-featured' : ''}`}>
                {plan.featured && <span className="foru-lp-plan-badge">★ Más popular</span>}
                <p className="foru-lp-label">{plan.type}</p>
                <h3 className="mt-2 font-serif text-3xl font-bold">{plan.name}</h3>
                <p className="foru-lp-price-old">Antes {plan.old}</p>
                <p className="foru-lp-price">{plan.price}</p>
                <p className="foru-lp-card-text">{plan.description}</p>
                <ul className="foru-lp-list">
                  {plan.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <DSButtonSecondary
                  type="button"
                  className="foru-btn w-full px-4 py-3 text-sm"
                  onClick={() => openBooking(plan.name)}
                >
                  Quiero este plan <MessageCircle size={17} />
                </DSButtonSecondary>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="foru-lp-section">
        <div className="foru-lp-inner">
          <div className="foru-lp-section-header">
            <h2 className="foru-lp-section-title">Cómo <span className="foru-reference-gradient-text">trabajamos</span></h2>
            <p className="foru-lp-section-sub">Un proceso claro, sin sorpresas y sin presión.</p>
          </div>
          <div className="foru-lp-process">
            {['Diagnóstico gratuito', 'Diseño del sistema', 'Construcción', 'Lanzamiento'].map((step, index) => (
              <article key={step} className="foru-lp-process-step">
                <span className="foru-lp-process-num">{index + 1}</span>
                <h3 className="font-bold">{step}</h3>
                <p className="mx-auto mt-2 max-w-[210px] text-sm leading-6 text-gray-500">Avanzamos con una ruta concreta y revisiones claras.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="agenda" className="foru-lp-section">
        <div className="foru-lp-inner">
          <div className="foru-lp-agenda">
            <div className="foru-lp-agenda-copy">
              <span className="foru-lp-badge"><CalendarDays size={16} /> Diagnostico gratis</span>
              <h2>Tu marca, <span className="foru-reference-gradient-text">en su mejor version.</span></h2>
              <p>
                Reserva un espacio real de 15 minutos. Elige fecha, horario y deja tus datos para llegar directo
                a la llamada con contexto de tu negocio.
              </p>
              <div className="foru-lp-agenda-points">
                <span>Slot reservado</span>
                <span>Confirmacion por WhatsApp</span>
                <span>Ruta clara para empezar</span>
              </div>
            </div>

            <div className="foru-booking-preview">
              <CalendarDays size={32} />
              <h3>Agenda tu cita de diagnostico</h3>
              <p>Selecciona un dia y uno de los horarios disponibles. Si el horario ya fue tomado, la base evita la doble reserva.</p>
              <DSButtonSecondary type="button" className="foru-btn w-full" onClick={() => openBooking()}>
                Agendar cita <MessageCircle size={18} />
              </DSButtonSecondary>
            </div>
          </div>
        </div>
      </section>

      {bookingOpen && (
        <div className="foru-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
          <div className="foru-booking-modal">
            <DSButtonSecondary type="button" className="foru-modal-close" onClick={closeBooking} aria-label="Cerrar">x</DSButtonSecondary>
            <span className="foru-lp-badge"><CalendarDays size={16} /> Reserva tu cita</span>
            <h2 id="booking-modal-title">{bookingStepLabels[bookingStep]}</h2>
            <p>{bookingStep + 1} de {bookingStepLabels.length} · Diagnostico gratuito de 15 minutos para aterrizar tu primer sistema digital.</p>

            <div className="foru-booking-progress" aria-hidden="true">
              {bookingStepLabels.map((label, index) => (
                <span key={label} className={index <= bookingStep ? 'foru-booking-dot foru-booking-dot--active' : 'foru-booking-dot'} />
              ))}
            </div>

            <form className="foru-lp-form foru-booking-form" onSubmit={submitRequest}>
              {bookingStep === 0 && (
                <div className="foru-booking-step">
                  <h3>Que dia y hora te quedan mejor?</h3>
                  <p>Reserva un espacio concreto. Luego te confirmo el enlace por WhatsApp.</p>
                  <div className="foru-booking-calendar">
                    <label>
                      Fecha
                      <DSInput
                        type="date"
                        min={getTodayDateValue()}
                        value={form.appointmentDate}
                        onChange={(event) => updateField('appointmentDate', event.target.value)}
                        required
                      />
                    </label>

                    <div>
                      <span className="foru-booking-label">Horario disponible</span>
                      <div className="foru-booking-slots">
                        {bookingSlots.map((slot) => (
                          <DSButtonSecondary
                            key={slot}
                            type="button"
                            className={form.appointmentTime === slot ? 'foru-slot foru-slot--active' : 'foru-slot'}
                            onClick={() => updateField('appointmentTime', slot)}
                          >
                            {formatSlot(slot)}
                          </DSButtonSecondary>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bookingStep === 1 && (
                <div className="foru-booking-step">
                  <h3>Como te contacto?</h3>
                  <p>Asi puedo confirmarte el enlace sin sacarte de la pagina.</p>
                  <label>
                    Nombre
                    <DSInput value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} required autoFocus />
                  </label>
                  <label>
                    WhatsApp
                    <DSInput value={form.phoneWhatsapp} onChange={(event) => updateField('phoneWhatsapp', event.target.value)} required placeholder="+51 999 999 999" />
                  </label>
                  <label>
                    Instagram opcional
                    <DSInput value={form.instagramHandle} onChange={(event) => updateField('instagramHandle', event.target.value)} placeholder="@tunegocio" />
                  </label>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="foru-booking-step">
                  <h3>Sobre tu negocio</h3>
                  <p>Con esto puedo llegar a la cita con una idea clara de que sistema puede ayudarte.</p>
                  <label>
                    Nombre del negocio
                    <DSInput value={form.businessName} onChange={(event) => updateField('businessName', event.target.value)} placeholder="Ej. Studio Nicole" />
                  </label>
                  <label>
                    Tipo de negocio
                    <select value={form.businessType} onChange={(event) => updateField('businessType', event.target.value)} required>
                      <option value="">Seleccionar</option>
                      <option value="servicios">Servicios</option>
                      <option value="belleza">Belleza</option>
                      <option value="bienestar">Bienestar</option>
                      <option value="tienda">Tienda</option>
                      <option value="educacion">Educacion</option>
                      <option value="restaurante">Restaurante</option>
                      <option value="otro">Otro</option>
                    </select>
                  </label>
                </div>
              )}

              {bookingStep === 3 && (
                <div className="foru-booking-step">
                  <h3>Que quieres lograr primero?</h3>
                  <p>Una frase basta. Esto define si conviene web, reservas, WhatsApp, chatbot, campana o todo conectado.</p>
                  <label>
                    Plan que te interesa
                    <select value={form.planInterest} onChange={(event) => updateField('planInterest', event.target.value)}>
                      <option>Por definir</option>
                      {plans.map((plan) => <option key={plan.name}>{plan.name}</option>)}
                    </select>
                  </label>
                  <label>
                    Objetivo principal
                    <DSTextarea
                      value={form.goal}
                      onChange={(event) => updateField('goal', event.target.value)}
                      required
                      rows={4}
                      placeholder="Ej. quiero que mis clientas agenden solas, vender por WhatsApp o tener una landing para anuncios."
                    />
                  </label>
                </div>
              )}

              {error && <p className="foru-form-error">{error}</p>}
              {status === 'sent' && (
                <div className="foru-form-success">
                  <strong>Cita reservada.</strong>
                  <span> Te escribire por WhatsApp para confirmar el enlace.</span>
                  {confirmationUrl && <a href={confirmationUrl} target="_blank" rel="noreferrer">Enviar mensaje ahora</a>}
                </div>
              )}
              {status === 'local' && <p className="foru-form-success">Cita guardada en este dispositivo. Falta conectar Supabase para centralizarla.</p>}
              {status === 'error' && <p className="foru-form-error">No se pudo reservar. Prueba otro horario o intenta otra vez.</p>}

              <div className="foru-booking-actions">
                {bookingStep > 0 && (
                  <DSButtonSecondary type="button" className="foru-btn foru-btn--outline" onClick={previousStep}>
                    <ChevronLeft size={18} /> Atrás
                  </DSButtonSecondary>
                )}
                {bookingStep < bookingStepLabels.length - 1 ? (
                  <DSButtonSecondary type="button" className="foru-btn" onClick={nextStep}>
                    Siguiente <ArrowRight size={18} />
                  </DSButtonSecondary>
                ) : (
                  <DSButtonSecondary type="submit" className="foru-btn" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Reservando...' : 'Reservar cita'} <MessageCircle size={18} />
                  </DSButtonSecondary>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
