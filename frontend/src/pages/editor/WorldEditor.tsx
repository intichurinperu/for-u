import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea } from '../../components/ui/DesignSystem';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import defaultBusinessWorld from '../../assets/landing/default-business-world.jpg';
import {
  ArrowLeft,
  BadgeCheck,
  Edit3,
  Eye,
  HelpCircle,
  Image,
  ListChecks,
  MessageCircle,
  Monitor,
  Palette,
  Paintbrush,
  Plus,
  Save,
  Sparkles,
  Smartphone,
  Trash2,
  Type,
} from '../../lib/icons';
import {
  type DigitalWorldPage,
  getLandingTheme,
  landingThemes,
  loadConstructorState,
  loadDigitalWorldPage,
  loadLocalDraft,
  saveDigitalWorldPage,
} from '../../lib/digitalWorldDraft';
import { playUiTone } from '../../lib/sound';

const tabs = [
  { id: 'hero', label: 'Portada', icon: Sparkles },
  { id: 'featured', label: 'Productos', icon: ListChecks },
  { id: 'visual', label: 'Imágenes', icon: Image },
  { id: 'style', label: 'Estilo', icon: Palette },
  { id: 'trust', label: 'Confianza', icon: BadgeCheck },
  { id: 'story', label: 'Historia', icon: Edit3 },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

const tabHelp: Record<string, { title: string; text: string }> = {
  hero: {
    title: 'Lo primero que ve tu cliente',
    text: 'Edita el nombre, la promesa principal y el boton que quieres que la persona toque.',
  },
  featured: {
    title: 'Lo que vendes o quieres mostrar',
    text: 'Convierte la ruta de la IA en secciones simples: servicios, menu, paquetes, habitaciones o productos.',
  },
  trust: {
    title: 'Razones para confiar',
    text: 'Agrega pruebas concretas: resultados, reseñas, experiencia, credenciales o detalles que bajen dudas.',
  },
  visual: {
    title: 'Que se vea vivo sin complicarte',
    text: 'Elige portada, tipografia y forma de bloques. Son controles simples para sentir que la landing es tuya.',
  },
  story: {
    title: 'La explicacion humana',
    text: 'Cuenta por que existe el negocio y que experiencia puede esperar la persona.',
  },
  style: {
    title: 'Personalidad visual de la landing',
    text: 'Elige un look para la pagina publica. For U sigue colorido por dentro; la landing puede ser sobria o boutique.',
  },
  faq: {
    title: 'Dudas antes de escribirte',
    text: 'Responde lo que normalmente te preguntan antes de reservar, comprar o pedir informacion.',
  },
};

export default function WorldEditor() {
  const draft = loadLocalDraft();
  const constructorState = loadConstructorState(draft);
  const initialPage = useMemo(() => loadDigitalWorldPage(draft, constructorState), [draft, constructorState]);
  const [page, setPage] = useState<DigitalWorldPage>(initialPage);
  const [activeTab, setActiveTab] = useState('hero');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saved, setSaved] = useState(false);
  const theme = getLandingTheme(page.themeId);
  const publicPath = `/p/${page.publicSlug || 'preview'}`;
  const fontClass = page.fontStyle === 'modern' ? 'font-sans' : page.fontStyle === 'rounded' ? 'font-sans' : 'font-serif';
  const previewImage = page.heroVisual === 'image' && page.heroImageUrl.trim() ? page.heroImageUrl : defaultBusinessWorld;

  function updatePage(nextPage: Partial<DigitalWorldPage>) {
    setSaved(false);
    setPage((currentPage) => ({ ...currentPage, ...nextPage }));
  }

  function applyTheme(themeId: DigitalWorldPage['themeId']) {
    playUiTone('success');
    setPage((currentPage) => {
      const updatedPage = { ...currentPage, themeId, updatedAt: new Date().toISOString() };
      saveDigitalWorldPage(updatedPage);
      return updatedPage;
    });
    setSaved(true);
  }

  function savePage() {
    playUiTone('success');
    saveDigitalWorldPage(page);
    setSaved(true);
  }

  function updateFeaturedItem(index: number, field: 'title' | 'description' | 'detail', value: string) {
    const nextItems = page.featuredItems.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    updatePage({ featuredItems: nextItems });
  }

  function addFeaturedItem() {
    updatePage({
      featuredItems: [
        ...page.featuredItems,
        { title: 'Nuevo producto o servicio', description: 'Describe qué incluye y para quién es.', detail: 'Editar detalle' },
      ],
    });
  }

  function removeFeaturedItem(index: number) {
    updatePage({ featuredItems: page.featuredItems.filter((_, itemIndex) => itemIndex !== index) });
  }

  function updateFaqItem(index: number, field: 'question' | 'answer', value: string) {
    const nextItems = page.faqItems.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    updatePage({ faqItems: nextItems });
  }

  return (
    <div className="foru-app-bg min-h-screen text-[#0A0A0A]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              onClick={() => playUiTone('tap')}
              className="tap-boost inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 foru-glass text-gray-800 shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-xs font-black text-[#6B6B6B]">EDITOR EN VIVO</p>
              <h1 className="text-lg font-black text-gray-950">{page.heroTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={publicPath}
              onClick={() => playUiTone('next')}
              className="tap-boost hidden items-center gap-2 rounded-xl border border-gray-200 foru-glass px-4 py-3 text-sm font-black text-gray-800 shadow-sm sm:inline-flex"
            >
              Abrir landing <Eye size={17} />
            </Link>
            <DSButtonSecondary
              type="button"
              onClick={savePage}
              className="tap-boost inline-flex items-center gap-2 rounded-xl foru-dark-gradient px-4 py-3 text-sm font-black text-white shadow-lg"
            >
              <Save size={17} /> {saved ? 'Guardado' : 'Guardar'}
            </DSButtonSecondary>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-4 p-3 md:p-4 xl:h-[calc(100vh-73px)] xl:grid-cols-[430px_minmax(0,1fr)]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
          <div className="border-b border-black/8 p-3">
            <p className="mb-2 px-1 text-xs font-black uppercase text-gray-500">¿Qué quieres cambiar?</p>
            <div className="grid grid-cols-4 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <DSButtonSecondary
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      playUiTone('tap');
                      setActiveTab(tab.id);
                    }}
                    className={`tap-boost flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-black ${
                      active ? 'foru-gradient-button text-[#0A0A0A]' : 'foru-soft-panel text-gray-700'
                    }`}
                  >
                    <Icon size={15} /> {tab.label}
                  </DSButtonSecondary>
                );
              })}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mb-4 border-l-4 border-[#6B6B6B] bg-[#FAFAFA] p-3">
              <p className="text-sm font-black text-gray-900">{tabHelp[activeTab].title}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-gray-600">{tabHelp[activeTab].text}</p>
            </div>

            {activeTab === 'hero' && (
              <div className="space-y-4">
                <Field label="Nombre o titulo principal" hint="Ej. Casa Brava, Studio Luna, Dra. Ana Perez" value={page.heroTitle} onChange={(value) => updatePage({ heroTitle: value })} />
                <Area label="Promesa principal" hint="Una frase clara que diga que haces y por que deberian contactarte." value={page.heroSubtitle} onChange={(value) => updatePage({ heroSubtitle: value })} />
                <Field label="Texto del boton" hint="La accion mas importante: reservar, pedir info, agendar cita..." value={page.ctaLabel} onChange={(value) => updatePage({ ctaLabel: value })} />
                <Field label="Linea corta de contacto" hint="Una frase para reforzar el siguiente paso." value={page.contactLine} onChange={(value) => updatePage({ contactLine: value })} />
              </div>
            )}

            {activeTab === 'story' && (
              <div className="space-y-4">
                <Field label="Titulo de la historia" hint="Una entrada breve para presentar el negocio." value={page.storyTitle} onChange={(value) => updatePage({ storyTitle: value })} />
                <Area label="Texto de historia" hint="Cuenta el enfoque, la experiencia o el diferencial de manera humana." value={page.storyText} onChange={(value) => updatePage({ storyText: value })} />
              </div>
            )}

            {activeTab === 'featured' && (
              <div className="space-y-5">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Field label="Título de esta sección" hint="Ej. Servicios, menú, productos o planes." value={page.featuredTitle} onChange={(value) => updatePage({ featuredTitle: value })} />
                  </div>
                  <DSButtonSecondary type="button" onClick={addFeaturedItem} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl foru-dark-gradient text-white" title="Agregar producto">
                    <Plus size={18} />
                  </DSButtonSecondary>
                </div>
                {page.featuredItems.map((item, index) => (
                  <div key={index} className="foru-soft-panel rounded-2xl p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-black uppercase text-gray-500">Producto o servicio {index + 1}</p>
                      {page.featuredItems.length > 1 && (
                        <DSButtonSecondary type="button" onClick={() => removeFeaturedItem(index)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-700" title="Eliminar">
                          <Trash2 size={15} />
                        </DSButtonSecondary>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Field label="Nombre de esta parte" hint="Servicio, producto, paquete o parte de la experiencia." value={item.title} onChange={(value) => updateFeaturedItem(index, 'title', value)} />
                      <Area label="Descripcion corta" hint="Explica lo suficiente para que la persona entienda si le interesa." value={item.description} onChange={(value) => updateFeaturedItem(index, 'description', value)} compact />
                      <Field label="Etiqueta pequeña" hint="Ej. Desde S/..., Popular, Para grupos, 45 min." value={item.detail} onChange={(value) => updateFeaturedItem(index, 'detail', value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trust' && (
              <div className="space-y-4">
                {page.trustItems.map((item, index) => (
                  <Area
                    key={index}
                    label={`Confianza ${index + 1}`}
                    hint="Una razon concreta para creer en el negocio."
                    value={item}
                    onChange={(value) => {
                      const nextItems = page.trustItems.map((trustItem, itemIndex) => itemIndex === index ? value : trustItem);
                      updatePage({ trustItems: nextItems });
                    }}
                    compact
                  />
                ))}
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {landingThemes.map((option) => {
                    const selected = option.id === page.themeId;

                    return (
                      <DSButtonSecondary
                        key={option.id}
                        type="button"
                        onClick={() => applyTheme(option.id)}
                        className={`tap-boost rounded-2xl p-4 text-left transition ${selected ? 'foru-gradient-border ring-2 ring-[#6B6B6B]/20' : 'foru-soft-panel'}`}
                      >
                        <span className="mb-4 flex gap-2">
                          {[option.background, option.surface, option.accent, option.text].map((color) => (
                            <span key={color} className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                          ))}
                        </span>
                        <span className="block text-base font-black text-gray-950">{option.name}</span>
                        <span className="mt-1 block text-sm font-semibold leading-6 text-gray-600">{option.description}</span>
                        <span className="mt-3 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-black text-gray-600">{option.bestFor}</span>
                        {selected && <span className="ml-2 mt-3 inline-flex rounded-full bg-[#6B6B6B] px-3 py-1 text-xs font-black text-white">Activo</span>}
                      </DSButtonSecondary>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'visual' && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: 'illustration', label: 'Ilustracion friendly', icon: Paintbrush },
                    { id: 'image', label: 'Imagen propia', icon: Image },
                    { id: 'none', label: 'Sin portada visual', icon: Type },
                  ].map((option) => {
                    const Icon = option.icon;
                    const active = page.heroVisual === option.id;

                    return (
                      <DSButtonSecondary
                        key={option.id}
                        type="button"
                        onClick={() => updatePage({ heroVisual: option.id as DigitalWorldPage['heroVisual'] })}
                        className={`tap-boost rounded-2xl p-4 text-left ${active ? 'foru-gradient-border' : 'foru-soft-panel'}`}
                      >
                        <Icon size={20} className="mb-3 text-[#6B6B6B]" />
                        <span className="block text-sm font-black text-gray-950">{option.label}</span>
                      </DSButtonSecondary>
                    );
                  })}
                </div>

                {page.heroVisual === 'image' && (
                  <Field
                    label="URL de imagen de portada"
                    hint="Pega una URL de foto o mockup. Si lo dejas vacio, aparece una ilustracion suave."
                    value={page.heroImageUrl}
                    onChange={(value) => updatePage({ heroImageUrl: value })}
                  />
                )}

                <div>
                  <p className="text-sm font-black text-gray-700">Tipografia</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {[
                      ['serif', 'Editorial'],
                      ['modern', 'Moderna'],
                      ['rounded', 'Amable'],
                    ].map(([id, label]) => (
                      <DSButtonSecondary
                        key={id}
                        type="button"
                        onClick={() => updatePage({ fontStyle: id as DigitalWorldPage['fontStyle'] })}
                        className={`tap-boost rounded-xl px-4 py-3 text-sm font-black ${page.fontStyle === id ? 'foru-gradient-button' : 'foru-soft-panel text-gray-700'}`}
                      >
                        {label}
                      </DSButtonSecondary>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-black text-gray-700">Forma de venta</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {[
                      ['cards', 'Tarjetas'],
                      ['steps', 'Pasos'],
                      ['spotlight', 'Destacado'],
                    ].map(([id, label]) => (
                      <DSButtonSecondary
                        key={id}
                        type="button"
                        onClick={() => updatePage({ offerLayout: id as DigitalWorldPage['offerLayout'] })}
                        className={`tap-boost rounded-xl px-4 py-3 text-sm font-black ${page.offerLayout === id ? 'foru-gradient-button' : 'foru-soft-panel text-gray-700'}`}
                      >
                        {label}
                      </DSButtonSecondary>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-black text-gray-700">Bloques</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {[
                      ['soft', 'Suave'],
                      ['cards', 'Ordenado'],
                      ['bold', 'Fuerte'],
                    ].map(([id, label]) => (
                      <DSButtonSecondary
                        key={id}
                        type="button"
                        onClick={() => updatePage({ blockStyle: id as DigitalWorldPage['blockStyle'] })}
                        className={`tap-boost rounded-xl px-4 py-3 text-sm font-black ${page.blockStyle === id ? 'foru-gradient-button' : 'foru-soft-panel text-gray-700'}`}
                      >
                        {label}
                      </DSButtonSecondary>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-5">
                {page.faqItems.map((item, index) => (
                  <div key={index} className="foru-soft-panel rounded-2xl p-4">
                    <p className="mb-3 text-xs font-black uppercase text-gray-500">Pregunta {index + 1}</p>
                    <div className="grid gap-3">
                      <Field label="Pregunta" hint="Una duda comun antes de contactarte." value={item.question} onChange={(value) => updateFaqItem(index, 'question', value)} />
                      <Area label="Respuesta" hint="Responde corto, claro y sin sonar robotico." value={item.answer} onChange={(value) => updateFaqItem(index, 'answer', value)} compact />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="min-h-0 overflow-hidden rounded-2xl border border-black/10 bg-[#EAEAEA] p-3 shadow-lg xl:flex xl:flex-col">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#6B6B6B]">Vista en vivo</p>
              <h2 className="text-base font-black text-gray-950">Así lo verá tu cliente</h2>
            </div>
            <div className="foru-soft-panel flex rounded-2xl p-1">
              {[
                { id: 'desktop', label: 'Compu', icon: Monitor },
                { id: 'mobile', label: 'Celular', icon: Smartphone },
              ].map((mode) => {
                const Icon = mode.icon;

                return (
                  <DSButtonSecondary
                    key={mode.id}
                    type="button"
                    onClick={() => setPreviewMode(mode.id as 'desktop' | 'mobile')}
                    className={`tap-boost inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${previewMode === mode.id ? 'foru-gradient-button' : 'text-gray-600'}`}
                  >
                    <Icon size={15} /> {mode.label}
                  </DSButtonSecondary>
                );
              })}
            </div>
          </div>

          <div className={`mx-auto overflow-y-auto rounded-2xl border shadow-sm transition-all xl:min-h-0 xl:flex-1 ${previewMode === 'mobile' ? 'w-full max-w-[390px]' : 'w-full max-w-full'}`} style={{ backgroundColor: theme.background, borderColor: theme.border }}>
            <div
              className={`relative flex min-h-[460px] items-center overflow-hidden bg-cover bg-center px-7 py-14 ${fontClass}`}
              style={{ backgroundImage: `url("${previewImage}")`, color: theme.text }}
            >
              <div className="absolute inset-0" style={{ backgroundColor: `${theme.background}c4` }} />
              <div className="relative z-10 max-w-2xl">
                <p className="mb-5 text-xs font-black uppercase" style={{ color: theme.accent }}>{draft.businessTitle}</p>
                <h2 className={`${fontClass} text-4xl font-bold leading-tight ${previewMode === 'mobile' ? '' : 'md:text-6xl'}`}>{page.heroTitle}</h2>
                <p className="mt-6 text-base font-semibold leading-8" style={{ color: theme.muted }}>{page.heroSubtitle}</p>
                <DSButtonSecondary type="button" className="mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-4 text-sm font-black" style={{ backgroundColor: theme.button, color: theme.buttonText }}>
                  {page.ctaLabel} <MessageCircle size={17} />
                </DSButtonSecondary>
              </div>
            </div>

            <section className={`p-7 ${fontClass}`} style={{ backgroundColor: theme.background }}>
              <p className="text-xs font-black uppercase" style={{ color: theme.accent }}>Lo que ofrecemos</p>
              <h3 className="mt-3 font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.featuredTitle}</h3>
              <div className="mt-6 border-t" style={{ borderColor: theme.border }}>
                {page.featuredItems.map((item, index) => (
                  <article key={`${item.title}-${index}`} className={`grid gap-3 border-b py-5 ${previewMode === 'mobile' ? '' : 'grid-cols-[48px_1fr_auto]'}`} style={{ borderColor: theme.border }}>
                    <span className="font-serif text-2xl font-bold" style={{ color: theme.accent }}>0{index + 1}</span>
                    <div>
                      <p className="text-base font-black" style={{ color: theme.text }}>{item.title}</p>
                      <p className="mt-2 text-sm font-semibold leading-6" style={{ color: theme.muted }}>{item.description}</p>
                    </div>
                    <span className="self-start rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>{item.detail}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className={`grid gap-7 p-7 ${previewMode === 'mobile' ? '' : 'grid-cols-2'} ${fontClass}`} style={{ backgroundColor: theme.text, color: theme.surface }}>
              <div>
                <p className="text-xs font-black uppercase" style={{ color: theme.accentSoft }}>Por qué elegirnos</p>
                <h3 className="mt-3 font-serif text-3xl font-bold">Confianza antes de comprar.</h3>
              </div>
              <div className="grid gap-4">
                {page.trustItems.map((item) => (
                  <p key={item} className="border-t pt-3 text-sm font-bold leading-6" style={{ borderColor: `${theme.surface}40` }}>{item}</p>
                ))}
              </div>
            </section>

            <section className={`grid items-center gap-7 p-7 ${previewMode === 'mobile' ? '' : 'grid-cols-2'} ${fontClass}`} style={{ backgroundColor: theme.surface }}>
              <img src={previewImage} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
              <div>
                <h3 className="font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.storyTitle}</h3>
                <p className="mt-4 text-sm font-semibold leading-7" style={{ color: theme.muted }}>{page.storyText}</p>
              </div>
            </section>

            <section className="p-7 text-center" style={{ backgroundColor: theme.accentSoft }}>
              <h3 className="font-serif text-3xl font-bold" style={{ color: theme.text }}>{page.contactLine}</h3>
              <DSButtonSecondary type="button" className="mt-5 rounded-lg px-5 py-3 text-sm font-black" style={{ backgroundColor: theme.button, color: theme.buttonText }}>{page.ctaLabel}</DSButtonSecondary>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-gray-700">{label}</span>
      {hint && <span className="mt-1 block text-xs font-semibold leading-5 text-gray-500">{hint}</span>}
      <DSInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="foru-input mt-2 w-full rounded-xl p-4 text-sm font-semibold text-gray-800 outline-none transition"
      />
    </label>
  );
}

function Area({ label, hint, value, onChange, compact = false }: { label: string; hint?: string; value: string; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-gray-700">{label}</span>
      {hint && <span className="mt-1 block text-xs font-semibold leading-5 text-gray-500">{hint}</span>}
      <DSTextarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`foru-input mt-2 w-full rounded-xl p-4 text-sm font-semibold leading-7 text-gray-800 outline-none transition ${compact ? 'min-h-24' : 'min-h-36'}`}
      />
    </label>
  );
}
