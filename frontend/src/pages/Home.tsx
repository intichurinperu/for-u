import { ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, LayoutDashboard, Sailboat, Sparkles, Store } from '../lib/icons';
import { draftStorageKey, loadLocalDraft } from '../lib/digitalWorldDraft';
import { playUiTone } from '../lib/sound';

export default function Home() {
  const [studioModalOpen, setStudioModalOpen] = useState(false);
  const hasBusiness = typeof window !== 'undefined' && Boolean(localStorage.getItem(draftStorageKey));
  const draft = loadLocalDraft();

  return (
    <main className="foru-reference-hub text-[#0A0A0A]">
      <div className="foru-reference-blur foru-reference-blur--gold" />
      <div className="foru-reference-blur foru-reference-blur--green" />
      <div className="foru-reference-blur foru-reference-blur--pink" />

      <Link to="/" className="foru-reference-logo" onClick={() => playUiTone('tap')}>
        FOR <span>U</span>
      </Link>
      <p className="foru-reference-subtitle">
        {hasBusiness ? `Hola, ${draft.businessName}. Elige cómo quieres continuar.` : 'Tu sistema digital completo. Elige cómo quieres empezar.'}
      </p>

      <section className="foru-reference-buttons">
        <Link to="/mundo-digital" onClick={() => playUiTone('next')} className="foru-reference-card foru-reference-card--primary">
          <span className="foru-reference-card-icon"><Store size={31} /></span>
          <h2>Webs y sistemas <span className="foru-reference-gradient-text">a medida</span></h2>
          <p>El servicio principal: landing, reservas, automatizaciones y presencia lista para convertir visitas en clientas.</p>
          <span className="foru-reference-tag">Ver servicio →</span>
        </Link>

        <DSButtonSecondary
          type="button"
          onClick={() => {
            playUiTone('tap');
            setStudioModalOpen(true);
          }}
          className="foru-reference-card foru-reference-card--soon"
        >
          <span className="foru-soon-ribbon">Muy pronto</span>
          <span className="foru-reference-card-icon"><LayoutDashboard size={31} /></span>
          <h2>Studio Digital <span className="foru-reference-gradient-text">FOR U</span></h2>
          <p>Tu futuro centro para contenido, calendario, web y campanas. Todavia privado, pero ya se siente cerca.</p>
          <span className="foru-reference-tag">Preview privado</span>
        </DSButtonSecondary>

        <Link to="/aventura" onClick={() => playUiTone('next')} className="foru-reference-card foru-reference-card--premium">
          <span className="foru-reference-card-icon"><Sailboat size={31} /></span>
          <h2>Aventura <span className="foru-reference-gradient-text">FOR U</span></h2>
          <p>El MVP jugable: meta, barco, ruta, misión y mapa de archipiélagos para validar la experiencia.</p>
          <span className="foru-reference-tag">Jugar MVP →</span>
        </Link>

        <Link to="/workspace" onClick={() => playUiTone('next')} className="foru-reference-card foru-reference-card--premium">
          <span className="foru-reference-card-icon"><Compass size={31} /></span>
          <h2>Workspace <span className="foru-reference-gradient-text">TDAH</span></h2>
          <p>La base nueva: pestañas de proyectos, estado global, microacciones y nodos independientes.</p>
          <span className="foru-reference-tag">Ver arquitectura →</span>
        </Link>
      </section>

      <p className="foru-reference-note">Empieza por tu web/sistema. El Studio queda como siguiente capa.</p>

      {studioModalOpen && (
        <div className="foru-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="studio-modal-title">
          <div className="foru-coming-modal">
            <DSButtonSecondary type="button" className="foru-modal-close" onClick={() => setStudioModalOpen(false)} aria-label="Cerrar">x</DSButtonSecondary>
            <span className="foru-lp-badge"><Sparkles size={16} /> Muy pronto</span>
            <h2 id="studio-modal-title">Studio Digital FOR U</h2>
            <p>
              Aqui podras organizar contenido, campanas, calendario, ideas, publicaciones y la evolucion de tu mundo digital.
              Por ahora esta cerrado para terminarlo con calma y abrirlo bien.
            </p>
            <div className="foru-coming-actions">
              <Link to="/mundo-digital" className="foru-btn" onClick={() => playUiTone('next')}>Quiero mi mundo digital</Link>
              <Link to="/studio" className="foru-btn foru-btn--outline" onClick={() => playUiTone('tap')}>Ingresar con contraseña</Link>
              <Link to="/reservas" className="foru-btn foru-btn--outline" onClick={() => playUiTone('tap')}>Ver reservas</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
