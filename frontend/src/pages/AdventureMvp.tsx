import { Card as DSCard } from '../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea } from '../components/ui/DesignSystem';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Map,
  PartyPopper,
  Sailboat,
  Sparkles,
} from '../lib/icons';
import { playUiTone } from '../lib/sound';

type Step = 'welcome' | 'goal' | 'offer' | 'ship' | 'route' | 'mission' | 'map';
type WorldKey = 'sabores' | 'estrategia' | 'creatividad';
type ShipKey = 'balsa' | 'galera' | 'veloz' | 'estratega';

type AdventureState = {
  step: Step;
  incomeGoal: number;
  offer: string;
  unknownOffer: boolean;
  ship: ShipKey;
  route: string;
  missionAnswer: string;
  coins: number;
  world: WorldKey;
  anchoredBay: string;
  soundOn: boolean;
  completedMission: boolean;
};

const storageKey = 'foru-adventure-mvp';

const steps: Step[] = ['welcome', 'goal', 'offer', 'ship', 'route', 'mission', 'map'];

const defaultState: AdventureState = {
  step: 'welcome',
  incomeGoal: 2500,
  offer: '',
  unknownOffer: false,
  ship: 'balsa',
  route: '',
  missionAnswer: '',
  coins: 0,
  world: 'sabores',
  anchoredBay: '',
  soundOn: true,
  completedMission: false,
};

const shipData: Record<ShipKey, { name: string; emoji: string; note: string }> = {
  balsa: {
    name: 'Balsa con perlas',
    emoji: '🛶',
    note: 'Perfecta para descubrir con calma qué quieres vender.',
  },
  galera: {
    name: 'Barco Galera',
    emoji: '🚢',
    note: 'Espacioso, ideal para pedidos, eventos y experiencias deliciosas.',
  },
  veloz: {
    name: 'Barco Veloz',
    emoji: '🛥️',
    note: 'Ágil para probar ideas creativas, campañas y portafolios.',
  },
  estratega: {
    name: 'Barco Estratega',
    emoji: '⛵',
    note: 'Elegante para servicios, consultoría, tecnología y dirección.',
  },
};

const worlds: Record<WorldKey, {
  title: string;
  description: string;
  className: string;
  bays: { key: string; name: string; emoji: string; x: number; y: number }[];
}> = {
  sabores: {
    title: 'Archipiélago Sabores',
    description: 'Para ideas de comida, repostería, catering y productos caseros.',
    className: 'foru-world--sabores',
    bays: [
      { key: 'postres', name: 'Bahía de los Postres', emoji: '🍰', x: 24, y: 34 },
      { key: 'catering', name: 'Bahía del Catering', emoji: '🍽️', x: 62, y: 38 },
      { key: 'saludable', name: 'Bahía Saludable', emoji: '🥗', x: 42, y: 58 },
      { key: 'casera', name: 'Bahía Casera', emoji: '🍳', x: 76, y: 62 },
    ],
  },
  estrategia: {
    title: 'Archipiélago Estrategia',
    description: 'Para consultoría, coaching, tecnología, educación y servicios expertos.',
    className: 'foru-world--estrategia',
    bays: [
      { key: 'tech', name: 'Bahía Tech', emoji: '💻', x: 22, y: 38 },
      { key: 'coaching', name: 'Bahía Coaching', emoji: '🧭', x: 58, y: 34 },
      { key: 'consultoria', name: 'Bahía Consultoría', emoji: '📊', x: 72, y: 56 },
      { key: 'sostenible', name: 'Bahía Sostenible', emoji: '🌱', x: 40, y: 66 },
    ],
  },
  creatividad: {
    title: 'Archipiélago Creatividad',
    description: 'Para diseño, marketing, foto, video, escritura y marcas personales.',
    className: 'foru-world--creatividad',
    bays: [
      { key: 'diseno', name: 'Bahía de Diseño', emoji: '🎨', x: 26, y: 42 },
      { key: 'marketing', name: 'Bahía de Marketing', emoji: '📱', x: 58, y: 34 },
      { key: 'foto', name: 'Bahía Foto/Video', emoji: '📷', x: 46, y: 62 },
      { key: 'escritura', name: 'Bahía Escritura', emoji: '✍️', x: 78, y: 54 },
    ],
  },
};

const tagOptions = ['Postres', 'Servicios', 'Productos', 'Consultoría', 'Creativo', 'Marketing'];

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...defaultState, ...JSON.parse(saved) } as AdventureState : defaultState;
  } catch {
    return defaultState;
  }
}

function getStepIndex(step: Step) {
  return steps.indexOf(step);
}

function inferShip(offer: string, unknownOffer: boolean): ShipKey {
  const text = offer.toLowerCase();

  if (unknownOffer || !text.trim()) return 'balsa';
  if (/(postre|comida|catering|chef|pan|cake|torta|cocina|saludable)/.test(text)) return 'galera';
  if (/(marketing|diseño|diseno|foto|video|creativ|marca|redes|contenido)/.test(text)) return 'veloz';
  if (/(consult|tech|coach|asesor|software|educa|estrateg)/.test(text)) return 'estratega';

  return 'estratega';
}

function getRoutes(offer: string, unknownOffer: boolean) {
  const text = offer.toLowerCase();

  if (unknownOffer) return ['Redes Sociales', 'Boca a Boca', 'Explorar Nicho'];
  if (/(postre|comida|catering|chef|pan|cake|torta|cocina|saludable)/.test(text)) {
    return ['Degustaciones', 'Eventos locales', 'Instagram de comida'];
  }
  if (/(marketing|diseño|diseno|foto|video|creativ|marca|redes|contenido)/.test(text)) {
    return ['Portafolio', 'LinkedIn', 'Referidos'];
  }
  return ['Redes Sociales', 'Boca a Boca', 'Página Web'];
}

function getMissionCopy(offer: string, unknownOffer: boolean) {
  const text = offer.toLowerCase();

  if (unknownOffer) {
    return {
      emoji: '🔭',
      text: 'Escribe 3 cosas que te gusta hacer, resolver o enseñar. No tienen que sonar perfectas.',
    };
  }

  if (/(postre|comida|catering|chef|pan|cake|torta|cocina|saludable)/.test(text)) {
    return {
      emoji: '🍰',
      text: 'Escribe el nombre de 3 personas a las que les podrías ofrecer una prueba o muestra esta semana.',
    };
  }

  if (/(marketing|diseño|diseno|foto|video|creativ|marca|redes|contenido)/.test(text)) {
    return {
      emoji: '🎨',
      text: 'Escribe 3 negocios o personas a quienes podrías mostrarles un ejemplo simple de tu trabajo.',
    };
  }

  return {
    emoji: '🧭',
    text: 'Escribe 3 personas que podrían necesitar tu ayuda o recomendarte con alguien.',
  };
}

export default function AdventureMvp() {
  const [state, setState] = useState<AdventureState>(() => loadState());
  const [toast, setToast] = useState('Tu aventura está lista.');
  const [confetti, setConfetti] = useState<number[]>([]);

  const stepIndex = getStepIndex(state.step);
  const selectedShip = shipData[state.ship];
  const routes = useMemo(() => getRoutes(state.offer, state.unknownOffer), [state.offer, state.unknownOffer]);
  const mission = useMemo(() => getMissionCopy(state.offer, state.unknownOffer), [state.offer, state.unknownOffer]);
  const currentWorld = worlds[state.world];

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  function tone(kind: 'tap' | 'next' | 'success' = 'tap') {
    if (state.soundOn) playUiTone(kind);
  }

  function patch(next: Partial<AdventureState>) {
    setState((current) => ({ ...current, ...next }));
  }

  function goTo(step: Step) {
    patch({ step });
    tone(step === 'map' ? 'success' : 'next');
  }

  function nextStep() {
    const next = steps[Math.min(stepIndex + 1, steps.length - 1)];
    goTo(next);
  }

  function previousStep() {
    const previous = steps[Math.max(stepIndex - 1, 0)];
    goTo(previous);
  }

  function assignShip() {
    const ship = inferShip(state.offer, state.unknownOffer);
    patch({ ship, step: 'ship' });
    setToast(`${shipData[ship].name} desbloqueado.`);
    tone('success');
    burstConfetti();
  }

  function completeMission() {
    if (state.missionAnswer.trim().length < 5) {
      setToast('Una mini respuesta de 5 caracteres basta para zarpar.');
      tone('tap');
      return;
    }

    patch({ completedMission: true, coins: state.completedMission ? state.coins : state.coins + 50, step: 'map' });
    setToast('Misión completada. Ganaste 50 Monedas For U.');
    tone('success');
    burstConfetti();
  }

  function anchorBay(bayName: string) {
    const alreadyAnchored = state.anchoredBay === bayName;
    patch({ anchoredBay: bayName, coins: alreadyAnchored ? state.coins : state.coins + 10 });
    setToast(alreadyAnchored ? `Sigues anclada en ${bayName}.` : `Anclaste en ${bayName}. +10 monedas.`);
    tone('success');
    burstConfetti();
  }

  function burstConfetti() {
    setConfetti(Array.from({ length: 42 }, (_, index) => Date.now() + index));
    window.setTimeout(() => setConfetti([]), 2200);
  }

  return (
    <main className="foru-adventure">
      <header className="foru-adventure-header">
        <Link to="/" className="foru-adventure-logo" onClick={() => tone('tap')}>FOR <span>U</span></Link>
        <div className="foru-adventure-status" aria-label="Estado de la aventura">
          <span><Sparkles size={16} /> {state.coins} monedas</span>
          <span><Sailboat size={16} /> {selectedShip.name}</span>
          <DSButtonSecondary type="button" onClick={() => patch({ soundOn: !state.soundOn })}>
            {state.soundOn ? 'Sonido on' : 'Sonido off'}
          </DSButtonSecondary>
        </div>
      </header>

      <section className="foru-progress" aria-label="Progreso">
        {steps.map((step, index) => (
          <span key={step} className={index <= stepIndex ? 'is-active' : ''} />
        ))}
      </section>

      <section className="foru-adventure-shell">
        <div className="foru-ocean-scene" aria-hidden="true">
          <div className="foru-sun" />
          <div className="foru-pearl foru-pearl--one" />
          <div className="foru-pearl foru-pearl--two" />
          <div className="foru-island foru-island--left" />
          <div className="foru-island foru-island--right" />
          <div className="foru-boat-hero">{selectedShip.emoji}</div>
        </div>

        <DSCard as="div" className="foru-adventure-card">
          {state.step !== 'welcome' && (
            <DSButtonSecondary type="button" className="foru-back-button" onClick={previousStep}>
              <ArrowLeft size={18} /> Atrás
            </DSButtonSecondary>
          )}

          {state.step === 'welcome' && (
            <div className="foru-step">
              <span className="foru-step-kicker">MVP navegable</span>
              <h1>El Mar de los Emprendedores</h1>
              <p>
                Una primera aventura TDAH-friendly para elegir meta, descubrir tu barco,
                escoger una ruta y completar una misión pequeña sin abrumarte.
              </p>
              <DSButtonSecondary type="button" className="foru-primary-action" onClick={nextStep}>
                Comenzar mi aventura <ArrowRight size={18} />
              </DSButtonSecondary>
            </div>
          )}

          {state.step === 'goal' && (
            <div className="foru-step">
              <span className="foru-step-kicker">Nivel 1 · El Astillero</span>
              <h1>¿Cuál es tu meta de ingresos?</h1>
              <p>Elige una referencia mensual. Se puede cambiar después.</p>
              <div className="foru-goal-value">S/ {state.incomeGoal.toLocaleString('es-PE')}</div>
              <DSInput
                className="foru-range"
                type="range"
                min="0"
                max="10000"
                step="500"
                value={state.incomeGoal}
                onChange={(event) => patch({ incomeGoal: Number(event.target.value) })}
              />
              <p className="foru-soft-copy">
                {state.incomeGoal < 2000 ? 'Buen inicio: pequeño, concreto y manejable.' : state.incomeGoal <= 5000 ? 'Meta alcanzable: ya tenemos norte.' : 'Ambicioso y posible: lo dividiremos en rutas pequeñas.'}
              </p>
              <DSButtonSecondary type="button" className="foru-primary-action" onClick={nextStep}>
                Siguiente <ArrowRight size={18} />
              </DSButtonSecondary>
            </div>
          )}

          {state.step === 'offer' && (
            <div className="foru-step">
              <span className="foru-step-kicker">Tu oferta</span>
              <h1>¿Qué vendes o quieres vender?</h1>
              <DSInput
                className="foru-text-input"
                value={state.offer}
                placeholder="Ej: postres caseros, diseño gráfico..."
                onChange={(event) => patch({ offer: event.target.value, unknownOffer: false })}
              />
              <div className="foru-tags">
                {tagOptions.map((tag) => (
                  <DSButtonSecondary
                    key={tag}
                    type="button"
                    onClick={() => {
                      patch({ offer: tag, unknownOffer: false });
                      tone('tap');
                    }}
                  >
                    {tag}
                  </DSButtonSecondary>
                ))}
              </div>
              <DSButtonSecondary
                type="button"
                className="foru-lifebuoy"
                onClick={() => {
                  patch({ offer: '', unknownOffer: true });
                  setToast('Tranqui. Lo descubrimos navegando.');
                  tone('tap');
                }}
              >
                Aún no lo sé, lo descubro navegando
              </DSButtonSecondary>
              <DSButtonSecondary type="button" className="foru-primary-action" onClick={assignShip}>
                Asignar mi barco <Sailboat size={18} />
              </DSButtonSecondary>
            </div>
          )}

          {state.step === 'ship' && (
            <div className="foru-step foru-step-centered">
              <span className="foru-step-kicker">Barco desbloqueado</span>
              <div className="foru-ship-reveal">{selectedShip.emoji}</div>
              <h1>{selectedShip.name}</h1>
              <p>{selectedShip.note}</p>
              <DSButtonSecondary type="button" className="foru-primary-action" onClick={nextStep}>
                Elegir ruta <Compass size={18} />
              </DSButtonSecondary>
            </div>
          )}

          {state.step === 'route' && (
            <div className="foru-step">
              <span className="foru-step-kicker">Nivel 2 · La Brújula</span>
              <h1>Elige tu primera ruta</h1>
              <div className="foru-route-grid">
                {routes.map((route) => (
                  <DSButtonSecondary
                    key={route}
                    type="button"
                    className={state.route === route ? 'is-selected' : ''}
                    onClick={() => {
                      patch({ route });
                      setToast(`Ruta elegida: ${route}.`);
                      tone('next');
                    }}
                  >
                    <Compass size={20} />
                    <span>{route}</span>
                  </DSButtonSecondary>
                ))}
              </div>
              <DSButtonSecondary type="button" className="foru-primary-action" disabled={!state.route} onClick={nextStep}>
                Zarpar a mi misión <ArrowRight size={18} />
              </DSButtonSecondary>
            </div>
          )}

          {state.step === 'mission' && (
            <div className="foru-step">
              <span className="foru-step-kicker">Nivel 3 · Primera Travesía</span>
              <h1>Tu primera misión</h1>
              <DSCard as="div" className="foru-mission-card">
                <span>{mission.emoji}</span>
                <p>{mission.text}</p>
                <small>Toma 2 minutos</small>
              </DSCard>
              <DSTextarea
                className="foru-textarea"
                value={state.missionAnswer}
                placeholder="Escribe tu respuesta aquí..."
                onChange={(event) => patch({ missionAnswer: event.target.value })}
              />
              <DSButtonSecondary type="button" className="foru-primary-action" onClick={completeMission}>
                Hecho <CheckCircle2 size={18} />
              </DSButtonSecondary>
            </div>
          )}

          {state.step === 'map' && (
            <div className="foru-map-layout">
              <div className="foru-map-copy">
                <span className="foru-step-kicker">Mapa de Archipiélagos</span>
                <h1>{currentWorld.title}</h1>
                <p>{currentWorld.description}</p>
                <p className="foru-soft-copy">
                  {state.anchoredBay ? `Anclado en ${state.anchoredBay}.` : 'Toca una bahía para anclar tu barco.'}
                </p>
                <div className="foru-world-tabs">
                  {(Object.keys(worlds) as WorldKey[]).map((worldKey) => (
                    <DSButtonSecondary
                      key={worldKey}
                      type="button"
                      className={state.world === worldKey ? 'is-active' : ''}
                      onClick={() => {
                        patch({ world: worldKey });
                        tone('next');
                      }}
                    >
                      {worlds[worldKey].title.replace('Archipiélago ', '')}
                    </DSButtonSecondary>
                  ))}
                </div>
              </div>

              <div className={`foru-world-map ${currentWorld.className}`}>
                <div className="foru-map-boat">{selectedShip.emoji}</div>
                {currentWorld.bays.map((bay) => (
                  <DSButtonSecondary
                    key={bay.key}
                    type="button"
                    className="foru-bay-hotspot"
                    style={{ left: `${bay.x}%`, top: `${bay.y}%` }}
                    onClick={() => anchorBay(bay.name)}
                    aria-label={`Anclar en ${bay.name}`}
                  >
                    <span>{bay.emoji}</span>
                    <small>{bay.name.replace('Bahía ', '')}</small>
                  </DSButtonSecondary>
                ))}
              </div>
            </div>
          )}
        </DSCard>
      </section>

      <aside className="foru-toast" aria-live="polite">
        <Map size={16} /> {toast}
      </aside>

      <div className="foru-guide" aria-hidden="true">U</div>

      {confetti.map((item, index) => (
        <span
          key={item}
          className="foru-confetti"
          style={{
            left: `${(index * 23) % 100}%`,
            animationDelay: `${(index % 8) * 0.04}s`,
          }}
        />
      ))}
    </main>
  );
}
