import { useState } from 'react';
import { Globe2, Images, Compass, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import PearlButton from '../components/ui/PearlButton';
import './publicLanding.css';

const previews = [
  { label: 'Tu página', icon: Globe2, title: 'Una página que se sienta tuya.', text: 'Edita textos, fotos y lo que ofreces en el mismo lugar.', action: 'Crear mi página' },
  { label: 'Tu contenido', icon: Images, title: 'De una idea a tu publicación.', text: 'Combina tu idea y tus imágenes para preparar una imagen, un carrusel o un video.', action: 'Empezar a crear' },
  { label: 'Tu negocio', icon: Compass, title: 'Elige una isla y empieza.', text: 'Marketing, Finanzas, Operaciones y Logística, cada área en su lugar.', action: 'Organizar mi negocio' },
];
const slides = ['Un espacio para tus ideas', 'Algo nuevo está tomando forma', 'Conoce nuestra propuesta'];

export default function LandingPage() {
  const [selected, setSelected] = useState(0);
  const [slide, setSlide] = useState(0);
  const preview = previews[selected];
  return (
    <div className="public-welcome">
      <a className="public-welcome-skip" href="#bienvenida">Ir al contenido</a>
      <header className="public-welcome-header">
        <Link to="/" aria-label="FOR U, inicio"><Logo /></Link>
        <PearlButton to="/login" compact>Iniciar sesión</PearlButton>
      </header>
      <main id="bienvenida">
        <section className="public-welcome-hero" aria-labelledby="welcome-title">
          <div className="public-welcome-copy">
            <p className="public-welcome-eyebrow">Tu idea tiene un lugar.</p>
            <h1 id="welcome-title">Dale vida a tu negocio, paso a paso.</h1>
            <p className="public-welcome-description">Crea tu página, prepara tu contenido y organiza tu negocio en un mismo espacio.</p>
            <div className="public-welcome-actions">
              <PearlButton to="/register">Crear mi cuenta</PearlButton>
              <PearlButton href="#como-funciona" subtle>Ver cómo funciona</PearlButton>
            </div>
            <p className="public-welcome-helper">Empieza con tu idea. Vamos paso a paso.</p>
          </div>
          <div className="public-welcome-art" aria-hidden="true">
            <img src="/brand/foru-landing-islands.png" alt="" width="1448" height="1086" fetchPriority="high" />
          </div>
        </section>
        <section id="como-funciona" className="public-welcome-explore" aria-labelledby="explore-title" tabIndex={-1}>
          <h2 id="explore-title">¿Qué te gustaría crear?</h2>
          <p className="public-welcome-explore-hint">Toca una opción y explora.</p>
          <div className="public-welcome-choices" role="group" aria-label="Explorar FOR U">
            {previews.map(({ label, icon: Icon }, index) => <button key={label} type="button" className={`foru-pearl-button public-welcome-choice${selected === index ? ' is-selected' : ''}`} aria-pressed={selected === index} aria-controls="welcome-preview" onClick={() => setSelected(index)}><Icon size={20} aria-hidden="true"/><span>{label}</span></button>)}
          </div>
          <div id="welcome-preview" className="public-welcome-preview" key={selected}>
            <div className="public-welcome-preview-copy">
              <div aria-live="polite" aria-atomic="true"><h3>{preview.title}</h3><p>{preview.text}</p></div>
              <PearlButton to="/register">{preview.action}</PearlButton>
              <small>Primero creas tu cuenta. Después trabajamos en tu proyecto.</small>
            </div>
            <div className="public-welcome-demo">
              <span className="public-welcome-demo-label">Vista de ejemplo</span>
              {selected === 0 && <div className="public-welcome-page-demo"><div className="public-welcome-demo-browser"><span/><span/><span/></div><small>Tu proyecto</small><h4>Un lugar para compartir lo que haces.</h4><div className="public-welcome-demo-photo"/><div className="public-welcome-demo-lines"><span/><span/></div><p>Tu historia · Tu oferta · Tu contacto</p></div>}
              {selected === 1 && <div className="public-welcome-content-demo"><div className="public-welcome-post" aria-live="polite"><small>Tu próxima publicación</small><h4>{slides[slide]}</h4><span className="public-welcome-post-orbit" aria-hidden="true"/><p>Tu proyecto, a tu manera.</p></div><div className="public-welcome-slide-controls"><button type="button" aria-label="Ver diseño anterior" onClick={() => setSlide((slide + slides.length - 1) % slides.length)}><ArrowLeft size={18}/></button><span>{slide + 1} / {slides.length}</span><button type="button" aria-label="Ver siguiente diseño" onClick={() => setSlide((slide + 1) % slides.length)}><ArrowRight size={18}/></button></div></div>}
              {selected === 2 && <div className="public-welcome-business-demo"><img src="/brand/foru-landing-islands.png" alt="Islas conectadas que representan las áreas de un negocio" width="1448" height="1086" loading="lazy"/><div className="public-welcome-area-labels"><span>Marketing</span><span>Finanzas</span><span>Operaciones</span><span>Logística</span></div></div>}
            </div>
          </div>
        </section>
      </main>
      <footer className="public-welcome-footer">
        <span>FOR U · Tu idea tiene un lugar.</span>
        <nav aria-label="Información"><Link to="/pricing">Precios</Link><a href="mailto:hola@marketingforu.site">Contacto</a></nav>
      </footer>
    </div>
  );
}
