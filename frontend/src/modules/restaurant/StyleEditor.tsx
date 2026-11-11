import { useState } from 'react';

export default function StyleEditor() {
  const [theme, setTheme] = useState('bistro');
  const [customHex, setCustomHex] = useState('1C1C1E');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [buttonShape, setButtonShape] = useState('pill');
  const [buttonText, setButtonText] = useState('Añadir a la Comanda');
  const [buttonAccent, setButtonAccent] = useState('obsidian');
  const [font, setFont] = useState('plus-jakarta');

  // Funciones auxiliares para derivar colores basados en el tema o acento
  const getPrimaryBg = () => {
    if (customHex !== '1C1C1E') return `#${customHex}`;
    switch (theme) {
      case 'bistro': return 'bg-primary text-on-primary';
      case 'trattoria': return 'bg-secondary text-on-secondary';
      case 'minimal': return 'bg-primary-container text-on-primary-fixed';
      case 'street': return 'bg-error text-on-error';
      default: return 'bg-primary text-on-primary';
    }
  };

  const getAccentBg = () => {
    switch (buttonAccent) {
      case 'obsidian': return getPrimaryBg();
      case 'amber': return 'bg-secondary-container text-on-secondary-container';
      case 'terracotta': return 'bg-secondary text-on-secondary';
      case 'crimson': return 'bg-error text-on-error';
      case 'champagne': return 'bg-tertiary-fixed text-on-tertiary-fixed';
      default: return getPrimaryBg();
    }
  };

  const getBadgeBg = () => {
    switch (theme) {
      case 'bistro': return 'bg-secondary-container text-on-secondary-container';
      case 'trattoria': return 'bg-secondary-fixed text-on-secondary-fixed';
      case 'minimal': return 'bg-secondary-fixed-dim text-on-secondary-fixed-variant';
      case 'street': return 'bg-secondary-container text-on-secondary-container';
      default: return 'bg-secondary-container text-on-secondary-container';
    }
  };

  const getButtonRadius = () => {
    switch (buttonShape) {
      case 'pill': return 'rounded-full';
      case 'rounded': return 'rounded-xl';
      case 'square': return 'rounded-none';
      default: return 'rounded-full';
    }
  };

  return (
    <main className="flex flex-col relative w-full px-margin bg-surface flex-1 magic-card" style={{ padding: '2rem', animation: 'foru-focus-step-in 0.4s ease-out', marginTop: '2rem' }}>
      <header className="flex flex-col gap-space-xs mb-8">
        <div className="inline-flex items-center gap-1.5 self-start px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">Identidad Visual 1-Tap</span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Personaliza la imagen de tu carta digital</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Adapta colores, tipografía, estilo de botones y modo visual a la atmósfera de tu local.</p>
      </header>

      <div className="flex flex-col w-full gap-space-lg pb-12">
        {/* BLOQUE 1: Lienzo en vivo */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-on-surface">visibility</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Previsualización en tiempo real</h3>
            </div>
            <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Lienzo en vivo
            </span>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-md p-space-md flex flex-col gap-space-md transition-all duration-300 border border-[rgba(212,212,212,0.4)]" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-on-surface">table_restaurant</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Mesa 04 · Terraza</span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Fuego & Grana Bistró</span>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-low">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">wifi</span>
                <span className="font-caption text-caption text-on-surface-variant">QR Activo</span>
              </div>
            </div>

            <div className="flex gap-space-md p-space-sm rounded-2xl bg-surface-container-low transition-colors duration-300" style={{ padding: '1rem' }}>
              <img className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-sm" style={{ width: '5rem', height: '5rem', marginRight: '1rem' }} alt="Plato gourmet" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADITw8TqkAR1vFDCn5DlqW1lBBt20vN3VicIO1FDZvvED7_TCTiizBWXPMmpIExqQSu6gLld0GJ5wyUIs79_cckxd6DT6udIF3GTartBPkOPXvv-SRyEdbl8m4h20WVBEE0h28nYCXhvbScM3KXttJF0jW3DD4jGRyGVeE4BC-IeWRd9fv8Xyq0FiAyg_DkM8mReWelisuRcAeoCwKjgy1toym56PsKWUAVmjAgQM"/>
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm transition-all ${getBadgeBg()}`}>Sugerencia</span>
                    <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant transition-all">🔥 Brasa</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mt-1 truncate" style={{ fontFamily: font === 'playfair' ? 'serif' : 'sans-serif' }}>Solomillo Angus al Carbón</h4>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">22,50 €</span>
                  <span className="font-caption text-caption text-on-surface-variant">Con patatas rústicas</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs pt-1" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className={`w-full h-12 px-space-md flex items-center justify-between shadow-sm active:scale-98 transition-all ${getAccentBg()} ${getButtonRadius()}`} style={{ padding: '0 1rem', height: '3rem' }} type="button">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  <span className="font-label-lg text-label-lg">{buttonText}</span>
                </span>
                <span className="font-label-lg text-label-lg font-bold">+1</span>
              </button>
              <button className={`w-full h-10 px-space-md bg-surface-container text-on-surface flex items-center justify-center gap-1.5 active:scale-98 transition-all ${getButtonRadius()}`} style={{ height: '2.5rem' }} type="button">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                <span className="font-label-md text-label-md">Pedir directo a cocina</span>
              </button>
            </div>
          </div>
        </section>

        {/* BLOQUE 2: Paletas de Color */}
        <section className="flex flex-col gap-space-sm mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-on-surface">palette</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Paletas de Color Gastronómicas</h3>
            </div>
            <span className="font-caption text-caption text-on-surface-variant">1-Toque rápido</span>
          </div>

          <div className="grid gap-4">
            {/* Bistró */}
            <div className={`p-space-md rounded-2xl shadow-sm flex flex-col gap-space-xs cursor-pointer transition-all ${theme === 'bistro' ? 'bg-surface-container-lowest border border-gray-300' : 'bg-surface-container-low hover:bg-surface-container-lowest border border-transparent'}`} style={{ padding: '1rem', borderRadius: '1rem' }} onClick={() => setTheme('bistro')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center" style={{ width: '0.875rem', height: '0.875rem' }}><span className="w-1.5 h-1.5 rounded-full bg-on-primary" style={{ width: '0.375rem', height: '0.375rem' }}></span></span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Bistró & Brasas</span>
                  {theme === 'bistro' && <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm text-xs ml-2">Activa</span>}
                </div>
                <span className={`material-symbols-outlined text-[20px] ${theme === 'bistro' ? 'text-primary' : 'text-outline-variant'}`}>{theme === 'bistro' ? 'check_circle' : 'radio_button_unchecked'}</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-sm mt-1">Carbón vegetal, ámbar tostado y crema artesanal para asadores y bistrós modernos.</p>
            </div>

            {/* Trattoria */}
            <div className={`p-space-md rounded-2xl shadow-sm flex flex-col gap-space-xs cursor-pointer transition-all ${theme === 'trattoria' ? 'bg-surface-container-lowest border border-gray-300' : 'bg-surface-container-low hover:bg-surface-container-lowest border border-transparent'}`} style={{ padding: '1rem', borderRadius: '1rem' }} onClick={() => setTheme('trattoria')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-outline-variant" style={{ width: '0.875rem', height: '0.875rem' }}></span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Trattoria & Sol</span>
                </div>
                <span className={`material-symbols-outlined text-[20px] ${theme === 'trattoria' ? 'text-primary' : 'text-outline-variant'}`}>{theme === 'trattoria' ? 'check_circle' : 'radio_button_unchecked'}</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-sm mt-1">Verde oliva toscano, terracota suave y masa fresca para cocinas mediterráneas.</p>
            </div>
            
            {/* Custom Picker */}
            <div className="p-space-md rounded-2xl bg-surface-container-low flex flex-col gap-space-sm transition-all" style={{ padding: '1rem', borderRadius: '1rem' }}>
              <button className="flex items-center justify-between w-full text-left" onClick={() => setIsPickerOpen(!isPickerOpen)} type="button">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center" style={{ width: '1.75rem', height: '1.75rem', marginRight: '0.5rem' }}>
                    <span className="material-symbols-outlined text-[16px] text-on-surface">colorize</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">Selector Personalizado</span>
                    <span className="font-caption text-caption text-on-surface-variant text-xs">Introduce tu código de marca corporativo</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant transition-transform" style={{ transform: isPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
              </button>
              
              {isPickerOpen && (
                <div className="flex flex-col gap-space-sm pt-4 mt-2 border-t border-[rgba(212,212,212,0.4)]">
                  <div className="flex items-center gap-4">
                    <div className="relative rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden" style={{ width: '3rem', height: '3rem', backgroundColor: `#${customHex}` }}>
                      <input className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" type="color" value={`#${customHex}`} onChange={e => setCustomHex(e.target.value.replace('#', '').toUpperCase())} />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="font-label-sm text-label-sm text-on-surface-variant text-xs mb-1">Código HEX Principal</label>
                      <div className="flex items-center gap-2 px-space-md h-11 rounded-xl bg-surface-container-lowest shadow-sm border border-gray-200" style={{ height: '2.75rem', padding: '0 0.5rem' }}>
                        <span className="font-label-md text-label-md text-on-surface-variant">#</span>
                        <input className="w-full bg-transparent font-label-lg text-label-lg text-on-surface focus:outline-none uppercase" maxLength={6} type="text" value={customHex} onChange={e => setCustomHex(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BLOQUE 3: Estilo de Botones */}
        <section className="flex flex-col gap-space-md mt-8">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-[20px] text-on-surface">smart_button</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Estilo de Botones y Llamada de Mesa</h3>
          </div>

          <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-[rgba(212,212,212,0.4)]" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <span className="font-label-lg text-label-lg text-on-surface font-bold mb-2 block">Forma geométrica del botón</span>
            <div className="grid grid-cols-3 gap-2">
              <button className={`flex flex-col items-center justify-center p-space-sm rounded-2xl font-label-md text-label-md gap-1 active:scale-95 transition-all ${buttonShape === 'pill' ? 'bg-surface-container text-on-surface' : 'bg-surface-container-low text-on-surface-variant'}`} style={{ padding: '0.75rem' }} onClick={() => setButtonShape('pill')} type="button">
                <div className="w-12 h-5 rounded-full bg-primary flex items-center justify-center" style={{ width: '3rem', height: '1.25rem', backgroundColor: '#333' }}></div>
                <span className="font-label-sm text-label-sm mt-2 text-center font-bold text-xs">Píldora</span>
              </button>
              <button className={`flex flex-col items-center justify-center p-space-sm rounded-2xl font-label-md text-label-md gap-1 active:scale-95 transition-all ${buttonShape === 'rounded' ? 'bg-surface-container text-on-surface' : 'bg-surface-container-low text-on-surface-variant'}`} style={{ padding: '0.75rem' }} onClick={() => setButtonShape('rounded')} type="button">
                <div className="w-12 h-5 rounded-lg flex items-center justify-center" style={{ width: '3rem', height: '1.25rem', backgroundColor: '#888', borderRadius: '0.5rem' }}></div>
                <span className="font-label-sm text-label-sm mt-2 text-center text-xs">Bordes suaves</span>
              </button>
              <button className={`flex flex-col items-center justify-center p-space-sm rounded-2xl font-label-md text-label-md gap-1 active:scale-95 transition-all ${buttonShape === 'square' ? 'bg-surface-container text-on-surface' : 'bg-surface-container-low text-on-surface-variant'}`} style={{ padding: '0.75rem' }} onClick={() => setButtonShape('square')} type="button">
                <div className="w-12 h-5 rounded-none flex items-center justify-center" style={{ width: '3rem', height: '1.25rem', backgroundColor: '#888' }}></div>
                <span className="font-label-sm text-label-sm mt-2 text-center text-xs">Rectos</span>
              </button>
            </div>
          </div>

          <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-[rgba(212,212,212,0.4)]" style={{ padding: '1rem' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">Texto del botón principal</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Añadir a la Comanda', 'Pedir a Cocina', 'Pedir por WhatsApp'].map(txt => (
                <button key={txt} className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all text-xs ${buttonText === txt ? 'bg-primary text-on-primary border border-primary' : 'bg-surface-container text-on-surface border border-gray-300'}`} onClick={() => setButtonText(txt)} type="button">
                  {txt}
                </button>
              ))}
            </div>
            <div className="flex items-center px-space-md h-11 rounded-xl bg-surface-container-low border border-gray-200" style={{ height: '2.75rem', padding: '0 0.5rem' }}>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">edit_note</span>
              <input className="w-full bg-transparent font-body-sm text-body-sm text-on-surface focus:outline-none text-sm" placeholder="O escribe tu propio texto..." type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} />
            </div>
          </div>
        </section>

        {/* BLOQUE 4: Tipografía */}
        <section className="flex flex-col gap-space-sm mt-8">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="material-symbols-outlined text-[20px] text-on-surface">text_fields</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Tipografía de la Carta</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className={`p-space-md rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all ${font === 'plus-jakarta' ? 'bg-surface-container-lowest border border-gray-300' : 'bg-surface-container-low border border-transparent'}`} style={{ padding: '1rem' }} onClick={() => setFont('plus-jakarta')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-bold text-xl" style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#f0f0f0' }}>Aa</div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold text-sm">Plus Jakarta Sans</span>
                  <span className="font-caption text-caption text-on-surface-variant text-xs">Moderna y de lectura rápida</span>
                </div>
              </div>
              <span className={`material-symbols-outlined text-[22px] ${font === 'plus-jakarta' ? 'text-primary' : 'text-outline-variant'}`}>{font === 'plus-jakarta' ? 'check_circle' : 'radio_button_unchecked'}</span>
            </div>

            <div className={`p-space-md rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition-all ${font === 'playfair' ? 'bg-surface-container-lowest border border-gray-300' : 'bg-surface-container-low border border-transparent'}`} style={{ padding: '1rem' }} onClick={() => setFont('playfair')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-serif italic text-xl" style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#f0f0f0' }}>Ag</div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold text-sm">Playfair Display</span>
                  <span className="font-caption text-caption text-on-surface-variant text-xs">Editorial y clásica</span>
                </div>
              </div>
              <span className={`material-symbols-outlined text-[22px] ${font === 'playfair' ? 'text-primary' : 'text-outline-variant'}`}>{font === 'playfair' ? 'check_circle' : 'radio_button_unchecked'}</span>
            </div>
          </div>
        </section>

        {/* BOTÓN FLOTANTE */}
        <div className="mt-8 pt-4 border-t border-[rgba(212,212,212,0.2)]">
          <button className="w-full h-14 rounded-full flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all magic-button magic-button-primary" style={{ height: '3.5rem' }} type="button">
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span className="font-label-lg text-label-lg font-bold">Guardar y Aplicar a Todos los QR</span>
          </button>
        </div>
      </div>
    </main>
  );
}
