import { ButtonSecondary as DSButtonSecondary, Textarea as DSTextarea } from '../components/ui/DesignSystem';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Lightbulb,
  PlayCircle,
  Sailboat,
  Sparkles,
} from '../lib/icons';
import { learningMaterials, phaseLabels, type LearningPhase, type MaterialFormat } from '../lib/learningMaterials';
import { playUiTone } from '../lib/sound';

const phaseOrder = Object.keys(phaseLabels) as LearningPhase[];

const formatIcon: Record<MaterialFormat, typeof BookOpen> = {
  Curso: GraduationCap,
  Ebook: BookOpen,
  Workbook: FileText,
  Tutorial: PlayCircle,
  Checklist: CheckCircle2,
};

type RadarAnswer = {
  score: number;
  note: string;
};

type RadarStep = {
  id: string;
  level: string;
  short: string;
  title: string;
  symbol: string;
  explanation: string;
  question: string;
  examples: string[];
  exercise: string;
  options: { score: number; label: string }[];
};

const radarSteps: RadarStep[] = [
  {
    id: 'mar',
    level: 'Tu identidad',
    short: 'Mar',
    title: 'El mar',
    symbol: '01',
    explanation: 'Es el mercado y el entorno donde navega tu negocio.',
    question: '¿Tienes claro en qué mercado estás y con quién compites?',
    examples: ['Mamás emprendedoras', 'Yoga y bienestar', 'Fotografía de bodas'],
    exercise: 'Anota cinco personas que ya comprarían lo que ofreces y descubre qué tienen en común.',
    options: [{ score: 2, label: 'Lo tengo claro' }, { score: 1, label: 'Tengo dudas' }, { score: 0, label: 'Estoy perdid@' }],
  },
  {
    id: 'barco',
    level: 'Tu identidad',
    short: 'Barco',
    title: 'El barco',
    symbol: '02',
    explanation: 'Es el producto o servicio principal con el que generas resultados.',
    question: '¿Tienes algo definido que podrías ofrecer hoy mismo?',
    examples: ['Consultoría de imagen', 'Pasteles veganos', 'Clases de inglés online'],
    exercise: 'Completa: “Ofrezco [servicio] para que [persona] logre [resultado]”.',
    options: [{ score: 2, label: 'Está listo' }, { score: 1, label: 'A medias' }, { score: 0, label: 'Aún no existe' }],
  },
  {
    id: 'ancla',
    level: 'Tu identidad',
    short: 'Ancla',
    title: 'El ancla',
    symbol: '03',
    explanation: 'Son tus valores y tu esencia: lo que no negocias cuando tomas decisiones.',
    question: '¿Tienes claros tus valores y por qué haces lo que haces?',
    examples: ['Honestidad', 'Creatividad', 'Acompañamiento humano'],
    exercise: 'Escribe tres valores que nunca negociarías y revisa si se ven en tu comunicación.',
    options: [{ score: 2, label: 'Está firme' }, { score: 1, label: 'Algo floja' }, { score: 0, label: 'No tengo ancla' }],
  },
  {
    id: 'norte',
    level: 'Tu identidad',
    short: 'Norte',
    title: 'Tu norte',
    symbol: '04',
    explanation: 'Es la misión que guía tus decisiones y evita que persigas cada idea nueva.',
    question: '¿Sabes qué cambio quieres provocar con tu negocio?',
    examples: ['Ayudar a artistas a vivir de su arte', 'Simplificar lo digital', 'Crear espacios seguros'],
    exercise: 'Completa: “Mi misión es ayudar a [quién] a [qué] a través de [cómo]”.',
    options: [{ score: 2, label: 'Sí, totalmente' }, { score: 1, label: 'Más o menos' }, { score: 0, label: 'Todavía no' }],
  },
  {
    id: 'pasajeros',
    level: 'Tu propuesta',
    short: 'Personas',
    title: 'Tus pasajeros',
    symbol: '05',
    explanation: 'Son las personas concretas a las que quieres ayudar.',
    question: '¿Puedes describir a la persona que más necesita tu ayuda?',
    examples: ['Emprendedoras primerizas', 'Artistas que no logran vender', 'Mamás que quieren empezar'],
    exercise: 'Describe qué le preocupa, qué desea y dónde busca respuestas hoy.',
    options: [{ score: 2, label: 'Muy definid@s' }, { score: 1, label: 'Algo vag@s' }, { score: 0, label: 'Le hablo a todos' }],
  },
  {
    id: 'punto-a',
    level: 'Tu propuesta',
    short: 'Punto A',
    title: 'El punto A',
    symbol: '06',
    explanation: 'Es el problema real que vive tu cliente antes de encontrarte.',
    question: '¿Conoces el problema con las mismas palabras que usa tu cliente?',
    examples: ['No consigo clientes', 'Pierdo tiempo sin resultados', 'No sé cómo cobrar'],
    exercise: 'Recuerda a tu último cliente y escribe la frase exacta con la que pidió ayuda.',
    options: [{ score: 2, label: 'Sí, lo conozco' }, { score: 1, label: 'Un poco' }, { score: 0, label: 'No lo sé' }],
  },
  {
    id: 'punto-b',
    level: 'Tu propuesta',
    short: 'Punto B',
    title: 'El punto B',
    symbol: '07',
    explanation: 'Es la transformación que la persona consigue gracias a tu oferta.',
    question: '¿Tu cliente entiende claramente a qué resultado lo llevas?',
    examples: ['Más ventas', 'Claridad y dirección', 'Paz mental y tiempo'],
    exercise: 'Completa: “Después de trabajar conmigo tendrá [resultado] y se sentirá [emoción]”.',
    options: [{ score: 2, label: 'Clarísimo' }, { score: 1, label: 'Tengo una idea' }, { score: 0, label: 'No lo sé' }],
  },
  {
    id: 'cofre',
    level: 'Tu propuesta',
    short: 'Recursos',
    title: 'Tu cofre',
    symbol: '08',
    explanation: 'Es la inversión real de tiempo, dinero y energía que puedes sostener.',
    question: '¿Sabes cuánto puedes invertir para poner en marcha tu mundo digital?',
    examples: ['Cinco horas semanales', 'Un presupuesto mensual', 'Apoyo de una persona'],
    exercise: 'Define cuántas horas y qué presupuesto puedes dedicar durante los próximos 30 días.',
    options: [{ score: 2, label: 'Sí, está definido' }, { score: 1, label: 'Lo estoy evaluando' }, { score: 0, label: 'Aún no' }],
  },
];

const radarStorageKey = 'foru-radar-course-v1';

export default function Methodology() {
  const [activePhase, setActivePhase] = useState<LearningPhase>('base');
  const [courseOpen, setCourseOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, RadarAnswer>>(() => {
    try {
      return JSON.parse(localStorage.getItem(radarStorageKey) || '{}') as Record<string, RadarAnswer>;
    } catch {
      return {};
    }
  });
  const [selectedScore, setSelectedScore] = useState<number | null>(() => answers[radarSteps[0].id]?.score ?? null);
  const [note, setNote] = useState(() => answers[radarSteps[0].id]?.note ?? '');
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const activeMaterials = useMemo(
    () => learningMaterials.filter((material) => material.phase === activePhase),
    [activePhase],
  );
  const completedCount = Object.keys(answers).length;
  const progress = Math.round((completedCount / radarSteps.length) * 100);
  const currentRadarStep = radarSteps[activeStep];

  function openRadarStep(index: number) {
    const nextStep = radarSteps[index];
    setActiveStep(index);
    setSelectedScore(answers[nextStep.id]?.score ?? null);
    setNote(answers[nextStep.id]?.note ?? '');
    setShowDiagnosis(false);
    playUiTone('tap');
  }

  function focusCourse() {
    window.requestAnimationFrame(() => {
      document.getElementById('radar-course')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function saveRadarStep() {
    if (selectedScore === null) return;

    const nextAnswers = {
      ...answers,
      [currentRadarStep.id]: { score: selectedScore, note: note.trim() },
    };
    setAnswers(nextAnswers);
    localStorage.setItem(radarStorageKey, JSON.stringify(nextAnswers));
    playUiTone('next');

    if (activeStep < radarSteps.length - 1) {
      const nextIndex = activeStep + 1;
      setActiveStep(nextIndex);
      setSelectedScore(nextAnswers[radarSteps[nextIndex].id]?.score ?? null);
      setNote(nextAnswers[radarSteps[nextIndex].id]?.note ?? '');
    } else {
      setShowDiagnosis(true);
    }
  }

  return (
    <div className="foru-app-bg min-h-screen text-[#0A0A0A]">
      <nav className="foru-nav foru-container">
        <Link to="/" onClick={() => playUiTone('tap')} className="foru-logo">FOR <span>U</span></Link>
        <div className="foru-nav-links">
          <Link to="/ia" onClick={() => playUiTone('next')} className="foru-btn foru-btn--outline px-5 py-2 text-sm">
            IA For U
          </Link>
        </div>
      </nav>

      <main className="foru-container pb-12 pt-4">
        <section className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl">
          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
            <div className="foru-dark-gradient flex flex-col justify-between p-6 text-white md:p-8">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black text-[#EAEAEA]">
                  <GraduationCap size={15} /> Curso esencial · empieza aquí
                </span>
                <h1 className="mt-5 font-serif text-4xl font-bold leading-tight md:text-5xl">
                  Radar <span className="text-gradient-animated">For U</span>
                </h1>
                <p className="mt-4 max-w-md text-base font-semibold leading-7 text-white/80">
                  Descubre qué tienes claro, qué falta y cuál es el siguiente paso para construir tu mundo digital.
                </p>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between text-xs font-black text-white/70">
                  <span>{completedCount} de {radarSteps.length} pasos</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full foru-gradient-button transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <DSButtonSecondary
                  type="button"
                  onClick={() => {
                    setCourseOpen(true);
                    setShowDiagnosis(completedCount === radarSteps.length);
                    playUiTone('next');
                    focusCourse();
                  }}
                  className="tap-boost mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-black text-gray-950"
                >
                  {completedCount ? 'Continuar mi radar' : 'Comenzar el curso'} <ArrowRight size={17} />
                </DSButtonSecondary>
              </div>
            </div>

            <div className="p-5 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-[#6B6B6B]">Tu ruta visual</p>
                  <h2 className="mt-1 font-serif text-3xl font-bold">Dos niveles, ocho respuestas</h2>
                </div>
                <Compass className="shrink-0 text-[#6B6B6B]" size={30} />
              </div>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-gray-600">
                No necesitas saberlo todo. Responde honestamente y el radar convierte tus ideas en una ruta concreta.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {['Tu identidad', 'Tu propuesta'].map((level, levelIndex) => (
                  <div key={level}>
                    <p className="mb-3 text-xs font-black uppercase text-gray-500">Nivel {levelIndex + 1} · {level}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {radarSteps.filter((step) => step.level === level).map((step) => {
                        const index = radarSteps.findIndex((item) => item.id === step.id);
                        const isComplete = Boolean(answers[step.id]);
                        return (
                          <DSButtonSecondary
                            key={step.id}
                            type="button"
                            onClick={() => {
                              setCourseOpen(true);
                              openRadarStep(index);
                              focusCourse();
                            }}
                            title={step.title}
                            className={`tap-boost flex aspect-square min-w-0 flex-col items-center justify-center rounded-xl border p-1 ${
                              isComplete ? 'border-[#9A9A9A] bg-[#FAFAFA] text-[#6B6B6B]' : 'border-black/8 bg-gray-50 text-gray-700'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 size={20} /> : <span className="text-xs font-black">{step.symbol}</span>}
                            <span className="mt-1 max-w-full truncate text-[10px] font-black">{step.short}</span>
                          </DSButtonSecondary>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {courseOpen && (
          <section id="radar-course" className="scroll-mt-4 mt-6 rounded-3xl border border-black/10 bg-white p-5 shadow-xl md:p-7">
            {showDiagnosis && completedCount === radarSteps.length ? (
              <RadarDiagnosis answers={answers} onReview={() => openRadarStep(0)} />
            ) : (
              <div className="grid gap-7 lg:grid-cols-[0.42fr_0.58fr]">
                <aside>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#FAFAFA] px-3 py-2 text-xs font-black text-[#6B6B6B]">
                      Paso {activeStep + 1} de {radarSteps.length}
                    </span>
                    <DSButtonSecondary type="button" onClick={() => setCourseOpen(false)} className="text-xs font-black text-gray-500">
                      Ocultar curso
                    </DSButtonSecondary>
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl foru-gradient-button">
                      <Sailboat size={26} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-gray-500">{currentRadarStep.level}</p>
                      <h2 className="font-serif text-3xl font-bold">{currentRadarStep.title}</h2>
                    </div>
                  </div>
                  <p className="mt-5 text-sm font-semibold leading-7 text-gray-600">{currentRadarStep.explanation}</p>
                  <div className="mt-5 border-l-4 border-[#EAEAEA] bg-[#FAFAFA] p-4">
                    <p className="flex items-center gap-2 text-xs font-black uppercase text-[#6B6B6B]">
                      <Lightbulb size={15} /> Ejemplos
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-gray-700">{currentRadarStep.examples.join(' · ')}</p>
                  </div>
                </aside>

                <div>
                  <h3 className="font-serif text-2xl font-bold leading-tight">{currentRadarStep.question}</h3>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {currentRadarStep.options.map((option) => (
                      <DSButtonSecondary
                        key={option.label}
                        type="button"
                        onClick={() => {
                          setSelectedScore(option.score);
                          playUiTone('tap');
                        }}
                        className={`tap-boost min-h-20 rounded-xl border px-3 py-4 text-sm font-black ${
                          selectedScore === option.score
                            ? 'border-[#6B6B6B] bg-[#FAFAFA] text-[#0A0A0A] shadow-md'
                            : 'border-black/10 bg-white text-gray-700'
                        }`}
                      >
                        {option.label}
                      </DSButtonSecondary>
                    ))}
                  </div>

                  <label className="mt-5 block text-sm font-black text-gray-800" htmlFor="radar-note">
                    Escríbelo a tu manera <span className="font-semibold text-gray-400">(opcional)</span>
                  </label>
                  <DSTextarea
                    id="radar-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="foru-input mt-2 min-h-24 w-full resize-none rounded-xl p-4 text-sm font-semibold outline-none"
                    placeholder="Una frase corta es suficiente..."
                  />

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <DSButtonSecondary
                      type="button"
                      disabled={activeStep === 0}
                      onClick={() => openRadarStep(activeStep - 1)}
                      className="tap-boost flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/10 disabled:opacity-30"
                      title="Paso anterior"
                    >
                      <ChevronLeft size={20} />
                    </DSButtonSecondary>
                    <DSButtonSecondary
                      type="button"
                      disabled={selectedScore === null}
                      onClick={saveRadarStep}
                      className="tap-boost flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl foru-dark-gradient px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {activeStep === radarSteps.length - 1 ? 'Ver mi diagnóstico' : 'Guardar y seguir'}
                      {activeStep === radarSteps.length - 1 ? <Sparkles size={17} /> : <ChevronRight size={17} />}
                    </DSButtonSecondary>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-8 md:flex-row md:items-end md:justify-between">
          <div className="p-2 md:p-5">
            <span className="foru-badge">Biblioteca For U</span>
            <h2 className="mt-4 font-serif text-4xl font-bold">Contenido para tu siguiente paso.</h2>
          </div>

          <Link to="/ia" onClick={() => playUiTone('next')} className="tap-boost inline-flex items-center justify-center gap-2 rounded-xl foru-dark-gradient px-5 py-4 text-sm font-black text-white">
            No sé cuál elegir <Bot size={17} />
          </Link>
        </section>

        <section className="mt-5">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {phaseOrder.map((phase) => (
              <DSButtonSecondary
                key={phase}
                type="button"
                onClick={() => {
                  playUiTone('tap');
                  setActivePhase(phase);
                }}
                className={`tap-boost shrink-0 rounded-xl px-4 py-3 text-sm font-black ${
                  activePhase === phase ? 'foru-gradient-button' : 'foru-soft-panel text-gray-700'
                }`}
              >
                {phaseLabels[phase]}
              </DSButtonSecondary>
            ))}
          </div>
        </section>

        <section className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeMaterials.map((material) => {
              const Icon = formatIcon[material.format];

              return (
                <article key={material.id} className="tap-boost flex min-h-64 flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAFAFA] text-[#6B6B6B]"><Icon size={19} /></span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-gray-500"><Clock size={13} /> {material.minutes} min</span>
                  </div>
                  <p className="mt-5 text-xs font-black uppercase text-[#6B6B6B]">{material.format} · {material.level}</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold leading-tight">{material.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-gray-600">{material.summary}</p>
                  <Link to="/ia" onClick={() => playUiTone('next')} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-black text-[#6B6B6B]">
                    Usar con IA <ArrowRight size={15} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function RadarDiagnosis({ answers, onReview }: { answers: Record<string, RadarAnswer>; onReview: () => void }) {
  const totalScore = radarSteps.reduce((total, step) => total + (answers[step.id]?.score ?? 0), 0);
  const strongSteps = radarSteps.filter((step) => answers[step.id]?.score === 2);
  const nextSteps = radarSteps.filter((step) => (answers[step.id]?.score ?? 0) < 2);
  const percent = Math.round((totalScore / (radarSteps.length * 2)) * 100);
  const status = totalScore >= 13
    ? { label: 'List@ para construir', title: 'Tu base ya tiene dirección.' }
    : totalScore >= 8
      ? { label: 'En construcción', title: 'Ya tienes piezas; ahora toca ordenarlas.' }
      : { label: 'Buscando rumbo', title: 'Empecemos por una base sencilla.' };

  return (
    <div className="grid gap-7 lg:grid-cols-[0.42fr_0.58fr]">
      <div className="foru-dark-gradient rounded-2xl p-6 text-white">
        <span className="inline-flex rounded-full bg-white/10 px-3 py-2 text-xs font-black text-[#9A9A9A]">{status.label}</span>
        <h2 className="mt-4 font-serif text-3xl font-bold">{status.title}</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
          Tu radar está {percent}% claro. No necesitas resolver todo hoy: trabaja primero en el punto que aparece a la derecha.
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full foru-gradient-button" style={{ width: `${percent}%` }} />
        </div>
        <Link to="/ia" onClick={() => playUiTone('next')} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-gray-950">
          Llevar mi radar a la IA <Bot size={17} />
        </Link>
      </div>

      <div>
        <p className="text-xs font-black uppercase text-[#6B6B6B]">Tu siguiente paso exacto</p>
        {nextSteps.length > 0 ? (
          <div className="mt-3 border-l-4 border-[#EAEAEA] bg-[#FAFAFA] p-5">
            <h3 className="font-serif text-2xl font-bold">{nextSteps[0].title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-gray-700">{nextSteps[0].exercise}</p>
          </div>
        ) : (
          <div className="mt-3 border-l-4 border-[#9A9A9A] bg-[#FAFAFA] p-5">
            <h3 className="font-serif text-2xl font-bold">Tu base está lista</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-gray-700">Continúa con Oferta y ventas en la biblioteca de abajo.</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {strongSteps.map((step) => (
            <span key={step.id} className="inline-flex items-center gap-1 rounded-full bg-[#FAFAFA] px-3 py-2 text-xs font-black text-[#6B6B6B]">
              <CheckCircle2 size={14} /> {step.short}
            </span>
          ))}
        </div>
        <DSButtonSecondary type="button" onClick={onReview} className="mt-6 text-sm font-black text-[#6B6B6B]">
          Revisar mis respuestas
        </DSButtonSecondary>
      </div>
    </div>
  );
}
