import { Card as DSCard } from '../../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea } from '../../components/ui/DesignSystem';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UnifiedDashboard from './UnifiedDashboard';
import ForUWorkspace from '../ForUWorkspace';
import {
  ArrowRight,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  Clipboard,
  Edit3,
  Eye,
  Home,
  Lightbulb,
  Menu,
  Mic2,
  PlayCircle,
  Plus,
  Rocket,
  Save,
  Send,
  Sparkles,
  Trash2,
  Video,
} from '../../lib/icons';
import { loadConstructorState, loadDigitalWorldPage, loadLocalDraft } from '../../lib/digitalWorldDraft';
import { draftStorageKey } from '../../lib/digitalWorldDraft';
import { playUiTone } from '../../lib/sound';
import { downloadAsset, loadStudioContentAssets, saveStudioContentAsset, type StudioContentAsset } from '../../lib/studioContentAssets';

type StudioView = 'today' | 'content' | 'calendar' | 'web' | 'publish';
type ContentStatus = 'idea' | 'script' | 'record' | 'edit' | 'publish';

type ContentItem = {
  id: string;
  title: string;
  format: string;
  day: number;
  status: ContentStatus;
};

type AiMessage = {
  role: 'bot' | 'user';
  text: string;
};

type CampaignTab = 'today' | 'organic' | 'ads' | 'manychat' | 'closing';

type CampaignCopyBlock = {
  id: string;
  label: string;
  text: string;
};

type CampaignTask = {
  id: string;
  tag: string;
  tagTone: 'urgent' | 'content' | 'ads' | 'many' | 'close';
  title: string;
  description?: string;
  copies?: CampaignCopyBlock[];
};

type TeleprompterScript = {
  title: string;
  label: string;
  text: string;
};

const contentStorageKey = 'foru:content-studio-v1';

const statusOptions: Array<{ id: ContentStatus; label: string; icon: typeof Lightbulb; color: string }> = [
  { id: 'idea', label: 'Idea', icon: Lightbulb, color: '#EAEAEA' },
  { id: 'script', label: 'Guion', icon: Mic2, color: '#9A9A9A' },
  { id: 'record', label: 'Grabar', icon: Video, color: '#9A9A9A' },
  { id: 'edit', label: 'Editar', icon: Clapperboard, color: '#9A9A9A' },
  { id: 'publish', label: 'Publicar', icon: Send, color: '#9A9A9A' },
];

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const campaignStorageKey = 'foru:campaign-studio-v1';
const campaignDoneStorageKey = 'foru:campaign-studio-done-v1';
const customCampaignStorageKey = 'foru:campaign-custom-tasks-v1';

function safeFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'contenido-for-u';
}

const campaignSchedule = [
  ['AHORA', 'Subir Video Día 1 + Carrusel 1', 'Orgánico'],
  ['+10 min', 'Subir Video Día 2 + Carrusel 2', 'Orgánico'],
  ['+10 min', 'Subir Video Día 3 + Carrusel 3', 'Orgánico'],
  ['+10 min', 'Subir Video Día 4 + Carrusel 4', 'Orgánico'],
  ['+10 min', 'Subir Video Día 5 + Carrusel 5 + Carrusel 6', 'Orgánico'],
  ['TARDE', 'Configurar 3 workflows de ManyChat', 'ManyChat'],
  ['NOCHE', 'Terminar campaña en Meta Ads para mañana 5 AM', 'Ads'],
];

const campaignTasks: Record<CampaignTab, CampaignTask[]> = {
  today: [
    { id: 't1', tag: 'Urgente', tagTone: 'urgent', title: 'Subir los 5 videos + 6 carruseles', description: 'Todo de una para crear efecto serie.' },
    { id: 't2', tag: 'ManyChat', tagTone: 'many', title: 'Configurar workflow "IA"', description: 'Para el Video Día 1.' },
    { id: 't3', tag: 'ManyChat', tagTone: 'many', title: 'Configurar workflow "SISTEMA"', description: 'Para todos los videos.' },
    { id: 't4', tag: 'ManyChat', tagTone: 'many', title: 'Configurar workflow "MAS INFO"', description: 'Para el caso real.' },
    { id: 't5', tag: 'Ads', tagTone: 'ads', title: 'Configurar campaña Meta Ads', description: 'Interacción -> IG Direct · S/10/día · 5 días.' },
    { id: 't6', tag: 'Ads', tagTone: 'ads', title: 'Programar anuncio para mañana 5 AM', description: 'Con el video del caso real.' },
  ],
  organic: [
    {
      id: 'v1',
      tag: 'Video Día 1',
      tagTone: 'content',
      title: 'Las IAs que uso',
      description: 'CTA: Comenta "IA"',
      copies: [{ id: 'v1-caption', label: 'Caption', text: 'Las IAs que uso todos los días para crear sistemas digitales.\n\nNo son las más famosas, pero son las que realmente me funcionan.\n\nEn este video te muestro cuáles son y cómo las integro en mi flujo de trabajo.\n\nComenta "IA" y te mando los links directos.' }],
    },
    {
      id: 'v2',
      tag: 'Video Día 2',
      tagTone: 'content',
      title: 'Arquitectura del sistema',
      description: 'CTA: Comenta "SISTEMA"',
      copies: [{ id: 'v2-caption', label: 'Caption', text: 'Día 2 del reto: 1 sistema digital cada 7 días.\n\nHoy te muestro cómo diseño la arquitectura de un sistema antes de escribir una línea de código.\n\nPorque un sistema no es solo una web bonita. Es un motor que trabaja por ti.\n\nComenta "SISTEMA" si quieres que te ayude a construir el tuyo.' }],
    },
    {
      id: 'v3',
      tag: 'Video Día 3',
      tagTone: 'content',
      title: 'Automatizaciones',
      description: 'CTA: Comenta "SISTEMA"',
      copies: [{ id: 'v3-caption', label: 'Caption', text: 'Día 3: Las automatizaciones que hacen que un sistema digital trabaje solo.\n\nChatbots, respuestas automáticas, flujos de WhatsApp... todo conectado.\n\nAsí es como tu negocio puede vender mientras duermes.\n\nComenta "SISTEMA" si quieres uno así para tu negocio.' }],
    },
    {
      id: 'v4',
      tag: 'Video Día 4',
      tagTone: 'content',
      title: 'Chatbot con IA',
      description: 'CTA: Comenta "SISTEMA"',
      copies: [{ id: 'v4-caption', label: 'Caption', text: 'Día 4: Así entreno un chatbot con IA para que responda como tú.\n\nNo es un bot genérico. Es un asistente que entiende tu negocio, tu tono y tus clientes.\n\nResponde dudas, califica leads y agenda citas 24/7.\n\nComenta "SISTEMA" si quieres uno así.' }],
    },
    {
      id: 'v5',
      tag: 'Video Día 5',
      tagTone: 'content',
      title: 'Integraciones',
      description: 'CTA: Comenta "SISTEMA"',
      copies: [{ id: 'v5-caption', label: 'Caption', text: 'Día 5: Conectando todas las piezas.\n\nWeb + WhatsApp + Instagram + calendario + base de datos.\n\nTodo hablando el mismo idioma. Eso es un sistema digital real.\n\nComenta "SISTEMA" si quieres que te lo construya.' }],
    },
    {
      id: 'v6',
      tag: 'Video Día 6 · Anuncio',
      tagTone: 'urgent',
      title: 'Caso real: Somos Cíclicas',
      description: 'CTA: Comenta "MAS INFO"',
      copies: [{ id: 'v6-caption', label: 'Caption', text: 'La obsesión es un arma de doble filo. Te hace avanzar cuando otros duermen... pero hoy me pasó la cuenta.\n\nPero seguimos con el reto: 1 sistema digital cada 7 días. Hoy cerramos detalles de Somos Cíclicas.\n\nVoy a tomar pocos casos para crear un sistema digital a medida para tu negocio, con un 40% de descuento real.\n\nEs para las que ya tienen su contenido listo y solo necesitan la tecnología que lo convierta en una experiencia que trabaje por ellas.\n\nComenta "MAS INFO" y te cuento cómo postular.' }],
    },
    {
      id: 'ca1',
      tag: 'Carrusel 1',
      tagTone: 'content',
      title: '3 errores al pasar tu negocio a digital',
      copies: [{ id: 'ca1-caption', label: 'Caption', text: '3 errores que cometes al pasar tu negocio físico a digital y cómo solucionarlos hoy.\n\nDesliza para verlos.\n\nComenta "SISTEMA" si quieres que te ayude a implementarlo.' }],
    },
    {
      id: 'ca2',
      tag: 'Carrusel 2',
      tagTone: 'content',
      title: 'Por qué tu web no convierte',
      copies: [{ id: 'ca2-caption', label: 'Caption', text: 'Tienes web, tienes tráfico, pero no vendes.\n\nEl problema no es tu producto. Es que tu web no está diseñada para convertir.\n\nDesliza para ver los errores más comunes.\n\nComenta "SISTEMA" si quieres que revise la tuya.' }],
    },
    {
      id: 'ca3',
      tag: 'Carrusel 3',
      tagTone: 'content',
      title: 'Qué es un sistema digital',
      copies: [{ id: 'ca3-caption', label: 'Caption', text: 'Un sistema digital no es solo una web.\n\nEs el motor que hace que tu negocio funcione por ti:\n- Automatizaciones\n- Chatbots\n- Reservas automáticas\n- Productos digitales\n- Campañas\n\nTodo integrado. Todo trabajando por ti.\n\nComenta "SISTEMA" si quieres el tuyo.' }],
    },
  ],
  ads: [
    {
      id: 'a1',
      tag: 'Campaña',
      tagTone: 'ads',
      title: 'Configuración de campaña',
      copies: [
        { id: 'a1-name', label: 'Nombre de campaña', text: 'ForU - Sistema Digital - Interacción - S/50' },
        { id: 'a1-objective', label: 'Objetivo', text: 'Interacción' },
        { id: 'a1-config', label: 'Configuración', text: 'Manual. No Advantage+.\nDesactivar presupuesto Advantage+ Campaign Budget.\nDesactivar compartir presupuesto con otros conjuntos.' },
      ],
    },
    {
      id: 'a2',
      tag: 'Conjunto',
      tagTone: 'ads',
      title: 'Conjunto de anuncios',
      copies: [
        { id: 'a2-name', label: 'Nombre', text: 'ForU - IG Direct - Mujeres 26-45 - Perú' },
        { id: 'a2-budget', label: 'Presupuesto', text: 'S/10 diarios\nInicio: Mañana 5:00 AM\nFin: 5 días después' },
        { id: 'a2-audience', label: 'Audiencia', text: 'Ubicación: Perú\nEdad: 26-45\nGénero: Mujeres\nIdioma: Español\n\nIntereses:\n- Emprendimiento\n- Pequeñas y medianas empresas\n- Marketing digital\n- Comercio electrónico' },
      ],
    },
    {
      id: 'a3',
      tag: 'Anuncio',
      tagTone: 'ads',
      title: 'Anuncio: caso real',
      copies: [
        { id: 'a3-text', label: 'Texto principal', text: 'La obsesión es un arma de doble filo. Te hace avanzar cuando otros duermen... pero hoy me pasó la cuenta.\n\nSeguimos con el reto: 1 sistema digital cada 7 días. Hoy cerramos detalles de Somos Cíclicas.\n\nVoy a tomar pocos casos para crear un sistema digital a medida para tu negocio, con un 40% de descuento real.\n\nEscríbeme "SISTEMA" y te cuento cómo postular.' },
        { id: 'a3-title', label: 'Título', text: 'Sistema digital a medida · 40% OFF' },
        { id: 'a3-description', label: 'Descripción', text: 'Pocos casos este mes' },
      ],
    },
  ],
  manychat: [
    {
      id: 'm1',
      tag: 'Keyword IA',
      tagTone: 'many',
      title: 'Workflow 1: Keyword "IA"',
      description: 'Trigger: Video Día 1.',
      copies: [{ id: 'm1-message', label: 'Mensaje automático', text: '¡Hola! Gracias por tu interés en las IAs que usé en el video.\n\nAquí te dejo los links:\n\nChatGPT: https://chat.openai.com\nClaude: https://claude.ai\nPerplexity: https://perplexity.ai\n\n¿Te gustaría saber cómo integrar estas herramientas en un sistema digital para tu negocio?\n\nEscríbeme "SISTEMA" y te cuento sobre el 40% OFF disponible.' }],
    },
    {
      id: 'm2',
      tag: 'Keyword SISTEMA',
      tagTone: 'many',
      title: 'Workflow 2: Keyword "SISTEMA"',
      description: 'Trigger: todos los videos.',
      copies: [{ id: 'm2-message', label: 'Mensaje automático', text: '¡Hola! Gracias por escribirme por el sistema digital.\n\nCuéntame rápido:\n1. ¿Qué tipo de negocio tienes?\n2. ¿Hace cuánto que estás vendiendo?\n\nAsí te digo si el descuento del 40% aplica para ti.' }],
    },
    {
      id: 'm3',
      tag: 'Keyword MAS INFO',
      tagTone: 'many',
      title: 'Workflow 3: Keyword "MAS INFO"',
      description: 'Trigger: caso real.',
      copies: [{ id: 'm3-message', label: 'Mensaje automático', text: '¡Hola! Vi que te interesó el 40% OFF en sistemas digitales.\n\nTe cuento rápido:\n\n- Web completa + automatizaciones + chatbot con IA\n- Listo en 7-15 días\n- Desde S/600\n- Solo tomo 5 casos este mes\n\n¿Te gustaría agendar una llamada de 15 minutos para ver si encajamos?\n\nResponde "SI" y te mando el link para agendar.' }],
    },
  ],
  closing: [
    {
      id: 'cl1',
      tag: 'Paso 1',
      tagTone: 'close',
      title: 'Calificar el negocio',
      copies: [{ id: 'cl1-message', label: 'Tu mensaje', text: 'Perfecto. Y ahora mismo, ¿cuánto estás facturando al mes aprox? Es para saber si tiene sentido que trabajemos juntas con el descuento del 40%.' }],
    },
    {
      id: 'cl2',
      tag: 'Paso 2',
      tagTone: 'close',
      title: 'Ofrecer el sistema',
      copies: [{ id: 'cl2-message', label: 'Tu mensaje', text: 'Te cuento: estoy tomando 5 casos este mes para crear sistemas digitales a medida con 40% de descuento.\n\nDependiendo de lo que necesites, puede ser desde S/600 hasta S/1000.\n\nEl sistema incluye: web completa, automatizaciones, chatbot con IA y todo lo que necesites para que tu negocio trabaje solo.\n\n¿Te gustaría que agendemos una llamada de 15 minutos para ver exactamente qué necesitas? Es sin compromiso.' }],
    },
    {
      id: 'cl3',
      tag: 'Paso 3',
      tagTone: 'close',
      title: 'Si piden más detalles',
      copies: [{ id: 'cl3-message', label: 'Tu mensaje', text: 'Te cuento qué incluye exactamente:\n\n1. Web completa diseñada para convertir\n2. Chatbot con IA que responde y califica clientes 24/7\n3. Sistema de reservas o pedidos automáticos\n4. Integración con WhatsApp e Instagram\n5. Hosting + dominio el primer año\n6. Soporte VIP por 15 días\n\nEl proceso es: anticipo del 50% para empezar, trabajo 10-15 días y entregas el otro 50% cuando está listo.\n\n¿Te sirve así o prefieres que agendemos una llamada para verlo juntas?' }],
    },
  ],
};

function loadContentItems(): ContentItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(contentStorageKey) || '[]') as ContentItem[];
    if (saved.length) return saved;
  } catch {
    // Use the starter plan below.
  }

  return [
    { id: 'starter-1', title: 'Explica tu oferta en 30 segundos', format: 'Reel', day: 1, status: 'script' },
    { id: 'starter-2', title: 'Responde una duda frecuente', format: 'Historia', day: 3, status: 'record' },
    { id: 'starter-3', title: 'Muestra un resultado real', format: 'Carrusel', day: 5, status: 'idea' },
  ];
}

function loadCustomCampaignTasks(): CampaignTask[] {
  try {
    return JSON.parse(localStorage.getItem(customCampaignStorageKey) || '[]') as CampaignTask[];
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const [params] = useSearchParams();
  if (params.get('view') === 'studio') return <LegacyDashboard />;
  if (params.get('view') === 'legacy-today') return <ForUWorkspace />;
  return <UnifiedDashboard />;
}

export function LegacyDashboard() {
  const hasProfile = typeof window !== 'undefined' && Boolean(localStorage.getItem(draftStorageKey));
  const draft = loadLocalDraft();
  const constructorState = loadConstructorState(draft);
  const page = loadDigitalWorldPage(draft, constructorState);
  const publicPath = `/p/${page.publicSlug || 'preview'}`;
  const [activeView, setActiveView] = useState<StudioView>('today');
  const [mobileNav, setMobileNav] = useState(false);
  const [items, setItems] = useState<ContentItem[]>(loadContentItems);
  const [newTitle, setNewTitle] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [profilePrompt, setProfilePrompt] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(draftStorageKey) && localStorage.getItem('foru:profile-prompt-dismissed') !== 'yes';
  });
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    {
      role: 'bot',
      text: 'Estoy aquí para bajarte el ruido. Puedes pedirme una idea, un guion corto, o qué hacer hoy.',
    },
  ]);

  const nextItem = items.find((item) => item.status !== 'publish') ?? items[0];
  const publishedCount = items.filter((item) => item.status === 'publish').length;
  const weekProgress = items.length ? Math.round((publishedCount / items.length) * 100) : 0;

  const navigation = [
    { id: 'today' as const, label: 'Hoy', icon: Home },
    { id: 'content' as const, label: 'Contenido', icon: Clapperboard },
    { id: 'calendar' as const, label: 'Calendario', icon: CalendarDays },
    { id: 'web' as const, label: 'Mi web', icon: Edit3 },
    { id: 'publish' as const, label: 'Publicar', icon: Rocket },
  ];

  function selectView(view: StudioView) {
    playUiTone('tap');
    setActiveView(view);
    setMobileNav(false);
  }

  function saveItems(nextItems: ContentItem[]) {
    setItems(nextItems);
    localStorage.setItem(contentStorageKey, JSON.stringify(nextItems));
  }

  function addContent() {
    if (!newTitle.trim()) return;
    saveItems([
      ...items,
      {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        format: 'Reel',
        day: Math.min(items.length + 1, 6),
        status: 'idea',
      },
    ]);
    setNewTitle('');
    playUiTone('success');
  }

  function addCalendarItem(item: Omit<ContentItem, 'id'>) {
    saveItems([...items, { ...item, id: crypto.randomUUID() }]);
    playUiTone('success');
  }

  function updateItemTitle(id: string, title: string) {
    saveItems(items.map((item) => item.id === id ? { ...item, title } : item));
  }

  function deleteCalendarItem(id: string) {
    saveItems(items.filter((item) => item.id !== id));
    playUiTone('tap');
  }

  function updateDay(id: string, day: number) {
    saveItems(items.map((item) => item.id === id ? { ...item, day } : item));
  }

  function askStudioAi(prompt?: string) {
    const question = (prompt ?? aiInput).trim();
    if (!question) return;

    const lowerQuestion = question.toLowerCase();
    const answer = lowerQuestion.includes('guion') || lowerQuestion.includes('grabar')
      ? 'Hazlo así: gancho de 3 segundos, una idea central, ejemplo concreto y cierre con “escríbeme si quieres que te ayude”. Graba una sola toma de 40 segundos.'
      : lowerQuestion.includes('calendario') || lowerQuestion.includes('semana')
        ? 'Esta semana: lunes explica tu oferta, miércoles responde una pregunta frecuente, viernes muestra prueba o resultado. Tres piezas bastan.'
        : lowerQuestion.includes('web') || lowerQuestion.includes('landing')
          ? 'Primero mejora la portada: promesa clara, una imagen/ilustración amable y un botón único. Luego agrega confianza y preguntas frecuentes.'
          : 'Empieza por una cosa: elige una duda frecuente de tu cliente y conviértela en una pieza corta. Después la pasamos por Idea → Guion → Grabar → Editar → Publicar.';

    setAiMessages((current) => [...current, { role: 'user', text: question }, { role: 'bot', text: answer }]);
    setAiInput('');
    setAiOpen(true);
    playUiTone('tap');
  }

  return (
    <div className="foru-studio-surface flex min-h-screen text-[#0A0A0A]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-black/8 bg-white p-4 transition-transform md:sticky md:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link to="/" className="foru-logo block px-3 py-4">FOR <span>U</span></Link>
        <DSCard as="div" className="foru-studio-sidebar-card mt-3 p-4">
          <p className="text-xs font-black uppercase text-[#6B6B6B]">Estudio digital</p>
          <p className="mt-2 font-serif text-xl font-bold text-gray-950">{draft.businessName}</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full foru-gradient-button" style={{ width: `${Math.max(18, weekProgress)}%` }} />
          </div>
        </DSCard>

        <nav className="mt-5 grid gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <DSButtonSecondary
                key={item.id}
                type="button"
                onClick={() => selectView(item.id)}
                className={`tap-boost flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-black ${
                  activeView === item.id ? 'foru-gradient-button' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={19} /> {item.label}
              </DSButtonSecondary>
            );
          })}
        </nav>

        <DSButtonSecondary type="button" onClick={() => setAiOpen(true)} className="mt-auto flex items-center gap-3 rounded-xl bg-[#FAFAFA] p-4 text-left text-sm font-black text-[#0A0A0A] transition hover:-translate-y-0.5">
          <Bot size={20} /> Preguntar a IA
        </DSButtonSecondary>
      </aside>

      {mobileNav && <DSButtonSecondary type="button" aria-label="Cerrar menú" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-black/20 md:hidden" />}

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/8 bg-white/95 px-4 backdrop-blur md:px-7">
          <DSButtonSecondary type="button" onClick={() => setMobileNav(true)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 md:hidden">
            <Menu size={20} />
          </DSButtonSecondary>
          <div>
            <p className="text-xs font-black uppercase text-[#6B6B6B]">Estudio For U</p>
            <h1 className="text-lg font-black">{navigation.find((item) => item.id === activeView)?.label}</h1>
          </div>
          <Link to={hasProfile ? publicPath : '/register'} className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-black">
            <Eye size={16} /> <span className="hidden sm:inline">{hasProfile ? 'Ver landing' : 'Configurar'}</span>
          </Link>
        </header>

        <div className="mx-auto max-w-7xl p-4 md:p-7">
          {activeView === 'today' && (
            <TodayView
              draftName={draft.businessName}
              nextItem={nextItem}
              itemCount={items.length}
              publishedCount={publishedCount}
              onOpenContent={() => selectView('content')}
              onOpenCalendar={() => selectView('calendar')}
              onAskAi={askStudioAi}
            />
          )}
          {activeView === 'content' && (
            <ContentView />
          )}
          {activeView === 'calendar' && (
            <CalendarView
              items={items}
              onDay={updateDay}
              onAddItem={addCalendarItem}
              onDeleteItem={deleteCalendarItem}
              onTitle={updateItemTitle}
            />
          )}
          {activeView === 'web' && <WebView pageTitle={page.heroTitle} publicPath={publicPath} hasProfile={hasProfile} />}
          {activeView === 'publish' && <PublishView items={items} publicPath={publicPath} />}
        </div>
      </main>

      <StudioAiDock
        open={aiOpen}
        messages={aiMessages}
        input={aiInput}
        onInput={setAiInput}
        onClose={() => setAiOpen(false)}
        onAsk={askStudioAi}
      />
      {profilePrompt && (
        <ProfilePrompt
          onClose={() => {
            localStorage.setItem('foru:profile-prompt-dismissed', 'yes');
            setProfilePrompt(false);
          }}
        />
      )}
    </div>
  );
}

function TodayView({
  draftName,
  nextItem,
  itemCount,
  publishedCount,
  onOpenContent,
  onOpenCalendar,
  onAskAi,
}: {
  draftName: string;
  nextItem?: ContentItem;
  itemCount: number;
  publishedCount: number;
  onOpenContent: () => void;
  onOpenCalendar: () => void;
  onAskAi: (prompt?: string) => void;
}) {
  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden rounded-2xl foru-dark-gradient p-6 text-white shadow-xl md:p-8">
        <div className="absolute right-6 top-6 grid grid-cols-2 gap-2 opacity-80">
          {[Lightbulb, Mic2, Video, Send].map((Icon, index) => (
            <span key={index} className="float-in flex h-11 w-11 items-center justify-center rounded-xl bg-white/10" style={{ animationDelay: `${index * 90}ms` }}>
              <Icon size={19} />
            </span>
          ))}
        </div>
        <div className="relative max-w-2xl">
          <p className="text-sm font-black text-[#9A9A9A]">Hola, {draftName}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl">Hoy toca crear, no organizarlo todo.</h2>
          <div className="mt-6 flex flex-wrap gap-3">
          <DSButtonSecondary type="button" onClick={onOpenContent} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-black text-gray-950">
            Abrir mi tarea <ArrowRight size={17} />
          </DSButtonSecondary>
          <DSButtonSecondary type="button" onClick={() => onAskAi('No sé por dónde empezar hoy')} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-4 text-sm font-black text-white ring-1 ring-white/15">
            Preguntar IA <Bot size={17} />
          </DSButtonSecondary>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
        <DSButtonSecondary type="button" onClick={onOpenContent} className="tap-boost flex min-h-56 flex-col justify-between rounded-2xl border border-black/8 bg-white p-6 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAFAFA]"><Video size={22} /></span>
            <span className="rounded-full bg-[#FAFAFA] px-3 py-1 text-xs font-black text-[#6B6B6B]">SIGUIENTE</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">{nextItem?.format || 'Contenido'}</p>
            <h3 className="mt-2 font-serif text-3xl font-bold">{nextItem?.title || 'Crea tu primera idea'}</h3>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black text-[#6B6B6B]">Continuar <ArrowRight size={16} /></span>
        </DSButtonSecondary>

        <div className="grid grid-cols-2 gap-3">
          <Metric icon={Clapperboard} value={itemCount} label="Piezas" color="#9A9A9A" />
          <Metric icon={Send} value={publishedCount} label="Publicadas" color="#9A9A9A" />
          <DSButtonSecondary type="button" onClick={onOpenCalendar} className="tap-boost col-span-2 flex items-center justify-between rounded-2xl border border-black/8 bg-white p-5 text-left shadow-sm">
            <span>
              <span className="text-xs font-black uppercase text-gray-500">Esta semana</span>
              <span className="mt-1 block text-lg font-black">Ver calendario</span>
            </span>
            <CalendarDays className="text-[#6B6B6B]" size={28} />
          </DSButtonSecondary>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <DSButtonSecondary type="button" onClick={() => onAskAi('Dame una idea de contenido para mi negocio')} className="tap-boost flex items-center gap-3 rounded-2xl border border-black/8 bg-white p-4 text-left text-sm font-black shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9A9A9A]"><Bot size={19} /></span>
          Pedir una idea
        </DSButtonSecondary>
        <DSButtonSecondary type="button" onClick={onOpenContent} className="tap-boost flex items-center gap-3 rounded-2xl border border-[#9A9A9A]/40 bg-white p-4 text-left text-sm font-black shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9A9A9A]"><Video size={19} /></span>
          Grabar con teleprompter
        </DSButtonSecondary>
        <QuickAction to="/metodologia" icon={BookOpen} title="Aprender algo" color="#EAEAEA" />
      </section>
    </div>
  );
}

function ContentView() {
  const [customTasks, setCustomTasks] = useState<CampaignTask[]>(loadCustomCampaignTasks);
  const [ideaModal, setIdeaModal] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaText, setIdeaText] = useState('');
  const [ideaTab, setIdeaTab] = useState<CampaignTab>('organic');
  const [teleprompterScript, setTeleprompterScript] = useState<TeleprompterScript | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [assets, setAssets] = useState<StudioContentAsset[]>([]);
  const [assetSource, setAssetSource] = useState<'local' | 'remote'>('local');
  const allTasks = [...Object.values(campaignTasks).flat(), ...customTasks];
  const defaultTextMap = allTasks.reduce<Record<string, string>>((accumulator, task) => {
    task.copies?.forEach((copy) => {
      accumulator[copy.id] = copy.text;
    });
    return accumulator;
  }, {});
  const [activeTab, setActiveTab] = useState<CampaignTab>('organic');
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(campaignDoneStorageKey) || '{}') as Record<string, boolean>;
    } catch {
      return {};
    }
  });
  const [copyTextMap, setCopyTextMap] = useState<Record<string, string>>(() => {
    try {
      return { ...defaultTextMap, ...(JSON.parse(localStorage.getItem(campaignStorageKey) || '{}') as Record<string, string>) };
    } catch {
      return defaultTextMap;
    }
  });
  const [copiedId, setCopiedId] = useState('');
  const currentTasks = [...campaignTasks[activeTab], ...customTasks.filter((task) => task.tag === activeTab)];
  const completedCount = allTasks.filter((task) => doneMap[task.id]).length;
  const progress = Math.round((completedCount / allTasks.length) * 100);

  async function refreshAssets() {
    const result = await loadStudioContentAssets();
    setAssets(result.assets);
    setAssetSource(result.source);
  }

  useEffect(() => {
    refreshAssets();
  }, []);

  function saveCustomTasks(nextTasks: CampaignTask[]) {
    setCustomTasks(nextTasks);
    localStorage.setItem(customCampaignStorageKey, JSON.stringify(nextTasks));
  }

  function addIdea() {
    if (!ideaTitle.trim()) return;
    const copyId = `custom-copy-${crypto.randomUUID()}`;
    const newTask: CampaignTask = {
      id: `custom-${crypto.randomUUID()}`,
      tag: ideaTab,
      tagTone: ideaTab === 'ads' ? 'ads' : ideaTab === 'manychat' ? 'many' : ideaTab === 'closing' ? 'close' : 'content',
      title: ideaTitle.trim(),
      description: 'Agregado por ti',
      copies: [{ id: copyId, label: 'Texto', text: ideaText.trim() || 'Escribe aquí el texto para copiar.' }],
    };
    saveCustomTasks([...customTasks, newTask]);
    setCopyTextMap((current) => {
      const nextMap = { ...current, [copyId]: newTask.copies?.[0].text ?? '' };
      localStorage.setItem(campaignStorageKey, JSON.stringify(nextMap));
      return nextMap;
    });
    setIdeaTitle('');
    setIdeaText('');
    setIdeaModal(false);
    setActiveTab(ideaTab);
    playUiTone('success');
  }

  function deleteTask(id: string) {
    saveCustomTasks(customTasks.filter((task) => task.id !== id));
    playUiTone('tap');
  }

  function updateCopyText(id: string, value: string) {
    const nextMap = { ...copyTextMap, [id]: value };
    setCopyTextMap(nextMap);
    localStorage.setItem(campaignStorageKey, JSON.stringify(nextMap));
  }

  function toggleDone(id: string) {
    const nextMap = { ...doneMap, [id]: !doneMap[id] };
    setDoneMap(nextMap);
    localStorage.setItem(campaignDoneStorageKey, JSON.stringify(nextMap));
    playUiTone(nextMap[id] ? 'success' : 'tap');
  }

  async function copyBlock(id: string) {
    await navigator.clipboard.writeText(copyTextMap[id] ?? '');
    setCopiedId(id);
    playUiTone('success');
    window.setTimeout(() => setCopiedId(''), 1600);
  }

  async function saveScript(task: CampaignTask, copy: CampaignCopyBlock) {
    const text = copyTextMap[copy.id] ?? copy.text;
    const fileName = `${safeFileName(task.title)}-${safeFileName(copy.label)}.txt`;
    const result = await saveStudioContentAsset({
      title: task.title,
      label: copy.label,
      kind: 'script',
      text: `${task.title}\n${copy.label}\n\n${text}`,
      fileName,
      fileType: 'text/plain;charset=utf-8',
      sourceTaskId: task.id,
      sourceCopyId: copy.id,
    });
    setSaveMessage(result.savedRemote ? `Guardado en biblioteca: ${fileName}` : `Guardado local: ${fileName}`);
    await refreshAssets();
    playUiTone('success');
  }

  function openTeleprompter(task: CampaignTask, copy: CampaignCopyBlock) {
    setTeleprompterScript({
      title: task.title,
      label: copy.label,
      text: copyTextMap[copy.id] ?? copy.text,
    });
    playUiTone('next');
  }

  function openDemoTeleprompter() {
    const firstTaskWithCopy = [...campaignTasks.organic, ...customTasks].find((task) => task.copies?.length);
    const firstCopy = firstTaskWithCopy?.copies?.[0];

    setTeleprompterScript({
      title: firstTaskWithCopy?.title ?? 'Prueba de teleprompter',
      label: firstCopy?.label ?? 'Guion',
      text: firstCopy ? (copyTextMap[firstCopy.id] ?? firstCopy.text) : 'Hola, soy FOR U.\nHoy voy a grabar una idea corta.\nPrimero digo el problema.\nLuego muestro una solucion simple.\nY cierro con una invitacion clara.',
    });
    playUiTone('next');
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-gray-400">Campaña activa</p>
          <h2 className="mt-2 font-serif text-2xl font-bold">Lanzamiento 40% OFF</h2>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-[#0A0A0A]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-gray-500">{completedCount} de {allTasks.length} tareas</p>

          <div className="mt-5 grid gap-2">
            {[
              ['today', 'Hoy', Home],
              ['organic', 'Contenido orgánico', Clapperboard],
              ['ads', 'Meta Ads', Rocket],
              ['manychat', 'ManyChat', Bot],
              ['closing', 'Cierre de ventas', CheckCircle2],
            ].map(([id, label, Icon]) => (
              <DSButtonSecondary
                key={id as string}
                type="button"
                onClick={() => setActiveTab(id as CampaignTab)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
                  activeTab === id ? 'foru-gradient-button' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} /> {label as string}
              </DSButtonSecondary>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-gray-400">Estudio de campaña</p>
              <h2 className="mt-2 font-serif text-4xl font-bold">
                {activeTab === 'today' && 'Plan de hoy'}
                {activeTab === 'organic' && 'Textos para copiar y pegar'}
                {activeTab === 'ads' && 'Configuración de Meta Ads'}
                {activeTab === 'manychat' && 'Workflows automáticos'}
                {activeTab === 'closing' && 'Script de cierre'}
              </h2>
            </div>
            <DSButtonSecondary type="button" onClick={() => setIdeaModal(true)} className="inline-flex items-center justify-center gap-2 rounded-xl foru-dark-gradient px-5 py-3 text-sm font-black text-white">
              <Plus size={17} /> Nueva idea
            </DSButtonSecondary>
          </div>
          <section className="mt-4 grid gap-3 rounded-2xl border border-[#9A9A9A]/40 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase text-[#6B6B6B]">Grabar contenido</p>
              <h3 className="font-serif text-2xl font-bold">Teleprompter conectado a tus guiones</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-gray-500">Abre un guion, graba con cámara y guarda el video en la biblioteca de FOR U.</p>
            </div>
            <DSButtonSecondary type="button" onClick={openDemoTeleprompter} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-5 py-4 text-sm font-black text-white">
              <Video size={18} /> Probar teleprompter
            </DSButtonSecondary>
          </section>
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-black/6 bg-white p-3 text-sm font-bold text-gray-600 shadow-sm">
            <span className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-xs font-black text-gray-800">
              <Save size={16} /> Biblioteca FOR U
            </span>
            <span>{assets.length} archivos guardados · Fuente: {assetSource === 'remote' ? 'Supabase' : 'local'}</span>
            {saveMessage && <span className="rounded-full bg-[#FAFAFA] px-3 py-1 text-xs font-black text-[#6B6B6B]">{saveMessage}</span>}
          </div>

          {activeTab === 'today' && (
            <section className="mt-6 rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
              <h3 className="font-serif text-2xl font-bold">Cronograma de hoy</h3>
              <div className="mt-4 divide-y divide-gray-100">
                {campaignSchedule.map(([time, content, badge]) => (
                  <div key={`${time}-${content}`} className="grid gap-2 py-3 sm:grid-cols-[90px_1fr_auto] sm:items-center">
                    <p className="text-xs font-black uppercase text-gray-400">{time}</p>
                    <DSInput
                      defaultValue={content}
                      className="rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm font-semibold outline-none focus:border-[#9A9A9A] focus:bg-white"
                    />
                    <span className="w-fit rounded-full foru-gradient-button px-3 py-1 text-xs font-black">{badge}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab !== 'today' && (
            <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-gray-50 p-4 text-sm font-semibold text-gray-600">
              Todos los textos son editables. Ajusta lo que quieras y copia con el botón de cada bloque.
            </div>
          )}

          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            {currentTasks.map((task) => (
              <CampaignTaskCard
                key={task.id}
                task={task}
                done={Boolean(doneMap[task.id])}
                copiedId={copiedId}
                copyTextMap={copyTextMap}
                onToggleDone={toggleDone}
                onUpdateCopy={updateCopyText}
                onCopy={copyBlock}
                onSaveScript={saveScript}
                onTeleprompter={openTeleprompter}
                onDelete={task.id.startsWith('custom-') ? deleteTask : undefined}
              />
            ))}
          </section>
          <section className="mt-6 rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-400">Carpeta dentro de FOR U</p>
                <h3 className="font-serif text-2xl font-bold">Biblioteca descargable</h3>
              </div>
              <DSButtonSecondary type="button" onClick={refreshAssets} className="rounded-xl border border-black/10 px-4 py-3 text-xs font-black text-gray-700">Actualizar</DSButtonSecondary>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {assets.length === 0 && <p className="rounded-xl bg-gray-50 p-4 text-sm font-bold text-gray-500">Aun no hay guiones o videos guardados.</p>}
              {assets.map((asset) => (
                <DSButtonSecondary key={asset.id} type="button" onClick={() => downloadAsset(asset)} className="flex items-center justify-between gap-3 rounded-xl border border-black/6 bg-gray-50 p-4 text-left transition hover:border-[#9A9A9A] hover:bg-white">
                  <span>
                    <span className="block text-xs font-black uppercase text-gray-400">{asset.kind === 'video' ? 'Video' : 'Guion'}</span>
                    <span className="mt-1 block text-sm font-black text-gray-900">{asset.title}</span>
                    <span className="mt-1 block text-xs font-bold text-gray-500">{asset.file_name}</span>
                  </span>
                  <Save size={18} className="shrink-0 text-[#6B6B6B]" />
                </DSButtonSecondary>
              ))}
            </div>
          </section>
        </div>
      </section>
      {ideaModal && (
        <IdeaModal
          title={ideaTitle}
          text={ideaText}
          tab={ideaTab}
          onTitle={setIdeaTitle}
          onText={setIdeaText}
          onTab={setIdeaTab}
          onClose={() => setIdeaModal(false)}
          onSave={addIdea}
        />
      )}
      {teleprompterScript && (
        <TeleprompterModal
          script={teleprompterScript}
          onClose={() => setTeleprompterScript(null)}
          onSaved={async (message) => {
            setSaveMessage(message);
            await refreshAssets();
          }}
        />
      )}
    </div>
  );
}

function CampaignTaskCard({
  task,
  done,
  copiedId,
  copyTextMap,
  onToggleDone,
  onUpdateCopy,
  onCopy,
  onSaveScript,
  onTeleprompter,
  onDelete,
}: {
  task: CampaignTask;
  done: boolean;
  copiedId: string;
  copyTextMap: Record<string, string>;
  onToggleDone: (id: string) => void;
  onUpdateCopy: (id: string, value: string) => void;
  onCopy: (id: string) => void;
  onSaveScript: (task: CampaignTask, copy: CampaignCopyBlock) => void;
  onTeleprompter: (task: CampaignTask, copy: CampaignCopyBlock) => void;
  onDelete?: (id: string) => void;
}) {
  const tagClasses = {
    urgent: 'bg-[#FAFAFA] text-[#0A0A0A]',
    content: 'bg-[#EAEAEA] text-[#0A0A0A]',
    ads: 'bg-[#EAEAEA] text-[#0A0A0A]',
    many: 'bg-[#FAFAFA] text-[#0A0A0A]',
    close: 'bg-[#EAEAEA] text-[#0A0A0A]',
  };

  return (
    <article className={`rounded-2xl border border-black/6 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${done ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        <DSButtonSecondary
          type="button"
          onClick={() => onToggleDone(task.id)}
          aria-label={done ? 'Marcar pendiente' : 'Marcar listo'}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
            done ? 'border-[#9A9A9A] bg-[#9A9A9A] text-white' : 'border-gray-300 bg-white'
          }`}
        >
          {done && '✓'}
        </DSButtonSecondary>
        <div className="min-w-0 flex-1">
          <span className={`inline-flex rounded px-2 py-1 text-[10px] font-black uppercase ${tagClasses[task.tagTone]}`}>{task.tag}</span>
          <h3 className={`mt-2 font-serif text-xl font-bold leading-tight ${done ? 'line-through' : ''}`}>{task.title}</h3>
          {task.description && <p className="mt-1 text-sm font-semibold leading-6 text-gray-500">{task.description}</p>}
        </div>
        {onDelete && (
          <DSButtonSecondary type="button" onClick={() => onDelete(task.id)} className="rounded-lg border border-black/8 px-3 py-2 text-xs font-black text-gray-500 hover:border-gray-200 hover:text-gray-700">
            Borrar
          </DSButtonSecondary>
        )}
      </div>

      {task.copies?.map((copy) => (
        <div key={copy.id} className="relative mt-4 rounded-xl border border-black/6 bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase text-gray-400">{copy.label}</p>
            <div className="flex flex-wrap justify-end gap-2">
              <DSButtonSecondary
                type="button"
                onClick={() => onTeleprompter(task, copy)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#9A9A9A]/50 bg-white px-3 py-2 text-xs font-black text-gray-700 transition hover:border-[#9A9A9A]"
              >
                <Video size={14} /> Teleprompter
              </DSButtonSecondary>
              <DSButtonSecondary
                type="button"
                onClick={() => onSaveScript(task, copy)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 transition hover:border-[#9A9A9A]"
              >
                <Save size={14} /> Guardar
              </DSButtonSecondary>
              <DSButtonSecondary
                type="button"
                onClick={() => onCopy(copy.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black transition ${
                  copiedId === copy.id ? 'border-[#9A9A9A] bg-[#9A9A9A] text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-[#9A9A9A]'
                }`}
              >
                <Clipboard size={14} /> {copiedId === copy.id ? 'Copiado' : 'Copiar'}
              </DSButtonSecondary>
            </div>
          </div>
          <DSTextarea
            value={copyTextMap[copy.id] ?? copy.text}
            onChange={(event) => onUpdateCopy(copy.id, event.target.value)}
            className="min-h-36 w-full resize-y rounded-lg border border-transparent bg-transparent text-sm font-semibold leading-7 text-gray-700 outline-none focus:border-[#9A9A9A] focus:bg-white focus:p-3"
          />
        </div>
      ))}
    </article>
  );
}

function IdeaModal({
  title,
  text,
  tab,
  onTitle,
  onText,
  onTab,
  onClose,
  onSave,
}: {
  title: string;
  text: string;
  tab: CampaignTab;
  onTitle: (value: string) => void;
  onText: (value: string) => void;
  onTab: (value: CampaignTab) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-[#6B6B6B]">Nueva idea</p>
            <h2 className="mt-1 font-serif text-3xl font-bold">Agrega una pieza a tu campaña</h2>
          </div>
          <DSButtonSecondary type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg font-black">×</DSButtonSecondary>
        </div>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="text-sm font-black text-gray-700">Título</span>
            <DSInput value={title} onChange={(event) => onTitle(event.target.value)} className="foru-input mt-2 w-full rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="Ej. Reel: por qué tu web no vende" />
          </label>
          <label>
            <span className="text-sm font-black text-gray-700">Dónde va</span>
            <select value={tab} onChange={(event) => onTab(event.target.value as CampaignTab)} className="foru-input mt-2 w-full rounded-xl px-4 py-3 text-sm font-bold outline-none">
              <option value="organic">Contenido orgánico</option>
              <option value="ads">Meta Ads</option>
              <option value="manychat">ManyChat</option>
              <option value="closing">Cierre de ventas</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-black text-gray-700">Texto editable para copiar</span>
            <DSTextarea value={text} onChange={(event) => onText(event.target.value)} className="foru-input mt-2 min-h-40 w-full rounded-xl px-4 py-3 text-sm font-semibold leading-7 outline-none" placeholder="Escribe caption, mensaje, anuncio o script..." />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <DSButtonSecondary type="button" onClick={onClose} className="rounded-xl border border-black/10 px-4 py-3 text-sm font-black">Cancelar</DSButtonSecondary>
          <DSButtonSecondary type="button" onClick={onSave} className="rounded-xl foru-dark-gradient px-5 py-3 text-sm font-black text-white">Agregar</DSButtonSecondary>
        </div>
      </section>
    </div>
  );
}

function TeleprompterModal({
  script,
  onClose,
  onSaved,
}: {
  script: TeleprompterScript;
  onClose: () => void;
  onSaved: (message: string) => void | Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const [speed, setSpeed] = useState(2400);
  const [fontSize, setFontSize] = useState(32);
  const [mirrored, setMirrored] = useState(true);
  const lines = useMemo(() => script.text.split(/\n+/).map((line) => line.trim()).filter(Boolean), [script.text]);
  const currentLines = lines.length ? lines : ['Escribe tu guion para verlo aqui.'];

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      } catch {
        setCameraError('No pude abrir la cámara. Puedes usar el teleprompter igual y guardar el guion.');
      }
    }

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recorderRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveLine((current) => Math.min(current + 1, currentLines.length - 1));
    }, speed);

    return () => window.clearInterval(timer);
  }, [currentLines.length, isPlaying, speed]);

  async function saveCurrentScript() {
    const fileName = `${safeFileName(script.title)}-${safeFileName(script.label)}.txt`;
    const result = await saveStudioContentAsset({
      title: script.title,
      label: script.label,
      kind: 'script',
      text: `${script.title}\n${script.label}\n\n${script.text}`,
      fileName,
      fileType: 'text/plain;charset=utf-8',
    });
    await onSaved(result.savedRemote ? `Guion guardado en biblioteca: ${fileName}` : `Guion guardado local: ${fileName}`);
    playUiTone('success');
  }

  function startRecording() {
    if (!streamRef.current) {
      setCameraError('Activa la cámara para grabar video.');
      return;
    }

    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const fileName = `${safeFileName(script.title)}-${Date.now()}.webm`;
      const result = await saveStudioContentAsset({
        title: script.title,
        label: script.label,
        kind: 'video',
        blob,
        fileName,
        fileType: 'video/webm',
      });
      await onSaved(result.savedRemote ? `Video guardado en biblioteca: ${fileName}` : `Video guardado local: ${fileName}`);
      playUiTone('success');
    };
    recorder.start();
    setIsRecording(true);
    setIsPlaying(true);
    playUiTone('next');
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
    setIsPlaying(false);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black text-white">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover ${mirrored ? '-scale-x-100' : ''}`}
      />
      <div className="absolute inset-0 bg-black/35" />

      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
        <DSButtonSecondary type="button" onClick={onClose} className="rounded-xl bg-white/95 px-4 py-3 text-sm font-black text-gray-950">Salir</DSButtonSecondary>
        <DSButtonSecondary type="button" onClick={saveCurrentScript} className="rounded-xl bg-white/95 px-4 py-3 text-sm font-black text-gray-950">Guardar guion</DSButtonSecondary>
        <DSButtonSecondary type="button" onClick={() => setMirrored((value) => !value)} className="rounded-xl bg-white/95 px-4 py-3 text-sm font-black text-gray-950">
          {mirrored ? 'Sin espejo' : 'Espejo'}
        </DSButtonSecondary>
      </div>

      <div className="absolute right-4 top-4 z-10 rounded-xl bg-black/55 px-4 py-3 text-sm font-black text-white backdrop-blur">
        {isRecording ? 'REC grabando' : cameraReady ? 'Camara lista' : 'Preparando camara'}
      </div>

      <section className="absolute left-1/2 top-[12%] z-10 w-[88%] max-w-4xl -translate-x-1/2">
        <div className="relative overflow-hidden rounded-2xl bg-black/45 p-6 text-center shadow-2xl backdrop-blur-md" style={{ fontSize }}>
          <span className="pointer-events-none absolute left-[10%] right-[10%] top-1/2 h-px bg-white/25" />
          {currentLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className={`my-3 leading-snug transition ${index === activeLine ? 'font-black text-white opacity-100' : 'font-semibold text-white/35'}`}
            >
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="absolute bottom-5 left-1/2 z-10 grid w-[min(92%,980px)] -translate-x-1/2 gap-3 rounded-3xl bg-black/65 p-4 backdrop-blur-md md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-black uppercase text-white/70">
            Velocidad
            <DSInput type="range" min="900" max="4500" step="100" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="mt-2 w-full" />
          </label>
          <label className="text-xs font-black uppercase text-white/70">
            Tamaño
            <DSInput type="range" min="22" max="52" step="1" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="mt-2 w-full" />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <DSButtonSecondary type="button" onClick={() => setActiveLine(0)} className="rounded-xl bg-white/10 px-4 py-3 text-sm font-black text-white ring-1 ring-white/15">Inicio</DSButtonSecondary>
          <DSButtonSecondary type="button" onClick={() => setIsPlaying((value) => !value)} className="rounded-xl bg-white px-4 py-3 text-sm font-black text-gray-950">
            <PlayCircle size={16} className="inline" /> {isPlaying ? 'Pausar' : 'Leer'}
          </DSButtonSecondary>
          {isRecording ? (
            <DSButtonSecondary type="button" onClick={stopRecording} className="rounded-xl bg-gray-50 px-4 py-3 text-sm font-black text-white">Detener</DSButtonSecondary>
          ) : (
            <DSButtonSecondary type="button" onClick={startRecording} className="rounded-xl bg-[#9A9A9A] px-4 py-3 text-sm font-black text-gray-950">Grabar</DSButtonSecondary>
          )}
        </div>
      </section>

      {cameraError && <div className="absolute bottom-32 left-1/2 z-10 w-[min(92%,560px)] -translate-x-1/2 rounded-xl bg-white px-4 py-3 text-center text-sm font-black text-gray-950">{cameraError}</div>}
    </div>
  );
}

function CalendarView({
  items,
  onDay,
  onAddItem,
  onDeleteItem,
  onTitle,
}: {
  items: ContentItem[];
  onDay: (id: string, day: number) => void;
  onAddItem: (item: Omit<ContentItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onTitle: (id: string, title: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('Reel');
  const [day, setDay] = useState(1);

  function saveNewItem() {
    if (!title.trim()) return;
    onAddItem({ title: title.trim(), format, day, status: 'idea' });
    setTitle('');
    setFormat('Reel');
    setDay(1);
    setModalOpen(false);
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="foru-badge">Calendario de contenido</span>
          <h2 className="mt-4 font-serif text-4xl font-bold">Tu semana de grabación.</h2>
        </div>
        <DSButtonSecondary type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl foru-dark-gradient px-4 py-3 text-sm font-black text-white">
          <Plus size={17} /> Nueva idea
        </DSButtonSecondary>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {weekDays.map((day, dayIndex) => {
          const dayItems = items.filter((item) => item.day === dayIndex);
          return (
            <section key={day} className="min-h-48 rounded-2xl border border-black/8 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black">{day}</p>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-black">{dayIndex + 1}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {dayItems.map((item) => {
                  const status = statusOptions.find((option) => option.id === item.status) ?? statusOptions[0];
                  return (
                    <article key={item.id} className="rounded-xl p-3" style={{ backgroundColor: `${status.color}77` }}>
                      <div className="flex items-start justify-between gap-2">
                        <DSButtonSecondary type="button" onClick={() => onDay(item.id, (dayIndex + 1) % 7)} className="text-left text-[10px] font-black uppercase">
                          {item.format}
                        </DSButtonSecondary>
                        <DSButtonSecondary type="button" onClick={() => onDeleteItem(item.id)} aria-label="Borrar" className="text-gray-500 hover:text-gray-700">
                          <Trash2 size={14} />
                        </DSButtonSecondary>
                      </div>
                      <DSTextarea
                        value={item.title}
                        onChange={(event) => onTitle(item.id, event.target.value)}
                        className="mt-1 min-h-14 w-full resize-none bg-transparent text-xs font-black leading-4 outline-none"
                      />
                    </article>
                  );
                })}
                {!dayItems.length && <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-black/10 text-xs font-bold text-gray-350">Libre</div>}
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-bold text-gray-500">Toca una pieza para moverla al día siguiente.</p>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-[#6B6B6B]">Calendario</p>
                <h2 className="mt-1 font-serif text-3xl font-bold">Nueva pieza</h2>
              </div>
              <DSButtonSecondary type="button" onClick={() => setModalOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg font-black">×</DSButtonSecondary>
            </div>
            <div className="mt-5 grid gap-4">
              <DSInput value={title} onChange={(event) => setTitle(event.target.value)} className="foru-input rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="Título de la pieza" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={format} onChange={(event) => setFormat(event.target.value)} className="foru-input rounded-xl px-4 py-3 text-sm font-bold outline-none">
                  <option>Reel</option>
                  <option>Historia</option>
                  <option>Carrusel</option>
                  <option>Email</option>
                  <option>Anuncio</option>
                </select>
                <select value={day} onChange={(event) => setDay(Number(event.target.value))} className="foru-input rounded-xl px-4 py-3 text-sm font-bold outline-none">
                  {weekDays.map((label, index) => <option key={label} value={index}>{label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <DSButtonSecondary type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-black/10 px-4 py-3 text-sm font-black">Cancelar</DSButtonSecondary>
              <DSButtonSecondary type="button" onClick={saveNewItem} className="rounded-xl foru-dark-gradient px-5 py-3 text-sm font-black text-white">Agregar</DSButtonSecondary>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function WebView({ pageTitle, publicPath, hasProfile }: { pageTitle: string; publicPath: string; hasProfile: boolean }) {
  return (
    <div>
      <span className="foru-badge">Tu web</span>
      <h2 className="mt-4 font-serif text-4xl font-bold">Una página que trabaja contigo.</h2>
      {!hasProfile && (
        <section className="mt-7 rounded-2xl border border-dashed border-[#6B6B6B]/30 bg-[#FAFAFA] p-6">
          <p className="text-xs font-black uppercase text-[#6B6B6B]">Configuración básica</p>
          <h3 className="mt-2 font-serif text-3xl font-bold">Primero define tu negocio</h3>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-gray-600">
            Aquí van las preguntas importantes: nombre, rubro, objetivo y personalidad. Después se abre el editor de la landing.
          </p>
          <Link to="/register" className="mt-5 inline-flex items-center gap-2 rounded-xl foru-dark-gradient px-5 py-3 text-sm font-black text-white">
            Configurar y abrir editor <ArrowRight size={17} />
          </Link>
        </section>
      )}
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <Link to={hasProfile ? '/editor' : '/register'} className="tap-boost flex min-h-64 flex-col justify-between rounded-2xl foru-dark-gradient p-6 text-white shadow-xl">
          <Edit3 size={30} className="text-[#9A9A9A]" />
          <div>
            <p className="text-sm font-bold text-white/60">Editor en vivo</p>
            <h3 className="mt-2 font-serif text-3xl font-bold">{hasProfile ? pageTitle : 'Configura tu landing'}</h3>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black">{hasProfile ? 'Editar web' : 'Empezar configuración'} <ArrowRight size={16} /></span>
        </Link>
        <Link to={hasProfile ? publicPath : '/register'} className="tap-boost flex min-h-64 flex-col justify-between rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
          <Eye size={30} className="text-[#6B6B6B]" />
          <div>
            <p className="text-sm font-bold text-gray-500">Vista pública</p>
            <h3 className="mt-2 font-serif text-3xl font-bold">{hasProfile ? 'Mírala como cliente.' : 'Disponible al configurar.'}</h3>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black text-[#6B6B6B]">{hasProfile ? 'Abrir landing' : 'Configurar'} <ArrowRight size={16} /></span>
        </Link>
      </div>
    </div>
  );
}

function PublishView({ items, publicPath }: { items: ContentItem[]; publicPath: string }) {
  const readyItems = useMemo(() => items.filter((item) => item.status === 'publish'), [items]);
  return (
    <div>
      <span className="foru-badge">Centro de publicación</span>
      <h2 className="mt-4 font-serif text-4xl font-bold">Lo que ya está listo.</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-[1fr_0.7fr]">
        <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Contenido</h3>
            <Send className="text-[#6B6B6B]" size={21} />
          </div>
          <div className="mt-4 grid gap-3">
            {readyItems.length ? readyItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#FAFAFA] p-4">
                <CheckCircle2 className="text-[#6B6B6B]" size={19} />
                <span className="text-sm font-black">{item.title}</span>
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-black/10 p-8 text-center">
                <Clapperboard className="mx-auto text-gray-300" />
                <p className="mt-3 text-sm font-bold text-gray-500">Todavía no hay piezas publicadas.</p>
              </div>
            )}
          </div>
        </section>
        <Link to={publicPath} className="tap-boost flex flex-col justify-between rounded-2xl foru-gradient-button p-6 shadow-xl">
          <Rocket size={30} />
          <div>
            <p className="text-sm font-bold">Landing</p>
            <h3 className="mt-2 font-serif text-3xl font-bold">Lista para compartir.</h3>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black">Abrir link <ArrowRight size={16} /></span>
        </Link>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, value, label, color }: { icon: typeof Video; value: number; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: color }}><Icon size={18} /></span>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="text-xs font-black uppercase text-gray-500">{label}</p>
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, color }: { to: string; icon: typeof Bot; title: string; color: string }) {
  return (
    <Link to={to} className="tap-boost flex items-center gap-3 rounded-2xl border border-black/8 bg-white p-4 text-sm font-black shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: color }}><Icon size={19} /></span>
      {title}
    </Link>
  );
}

function ProfilePrompt({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-[#6B6B6B]">Antes de editar tu web</p>
            <h2 className="mt-1 font-serif text-3xl font-bold">Configura tu perfil</h2>
          </div>
          <DSButtonSecondary type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg font-black">×</DSButtonSecondary>
        </div>
        <p className="mt-4 text-sm font-semibold leading-7 text-gray-600">
          Puedes explorar el Studio desde ya. Cuando quieras crear o editar tu landing, completa nombre, rubro y objetivo en `Mi web`.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/register" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl foru-dark-gradient px-5 py-3 text-sm font-black text-white">
            Configurar ahora <ArrowRight size={17} />
          </Link>
          <DSButtonSecondary type="button" onClick={onClose} className="rounded-xl border border-black/10 px-5 py-3 text-sm font-black">
            Después
          </DSButtonSecondary>
        </div>
      </section>
    </div>
  );
}

function StudioAiDock({
  open,
  messages,
  input,
  onInput,
  onClose,
  onAsk,
}: {
  open: boolean;
  messages: AiMessage[];
  input: string;
  onInput: (value: string) => void;
  onClose: () => void;
  onAsk: (prompt?: string) => void;
}) {
  return (
    <section className={`foru-ai-dock ${open ? 'open' : ''}`}>
      <div className="flex h-full flex-col rounded-t-[20px] border border-black/10 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-black/8 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase text-[#6B6B6B]">IA For U</p>
            <h2 className="font-serif text-xl font-bold">Tu guía de estudio</h2>
          </div>
          <DSButtonSecondary type="button" onClick={onClose} aria-label="Cerrar IA" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg font-black">×</DSButtonSecondary>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            {['¿Qué hago hoy?', 'Dame un guion', 'Arma mi semana'].map((prompt) => (
              <DSButtonSecondary key={prompt} type="button" onClick={() => onAsk(prompt)} className="rounded-full bg-gray-100 px-3 py-2 text-xs font-black text-gray-700">
                {prompt}
              </DSButtonSecondary>
            ))}
          </div>
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-semibold leading-6 ${
                message.role === 'user'
                  ? 'ml-auto rounded-br bg-[#0A0A0A] text-white'
                  : 'rounded-bl bg-gray-100 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="flex gap-3 border-t border-black/8 p-4">
          <DSInput
            value={input}
            onChange={(event) => onInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && onAsk()}
            placeholder="Pregúntame algo..."
            className="foru-input min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-bold outline-none"
          />
          <DSButtonSecondary type="button" onClick={() => onAsk()} aria-label="Enviar" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0A0A0A] text-white">
            <Send size={18} />
          </DSButtonSecondary>
        </div>
      </div>
    </section>
  );
}
