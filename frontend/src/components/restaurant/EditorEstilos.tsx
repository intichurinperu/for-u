import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';

export default function EditorEstilos() {
  const { estilo, actualizarEstilo } = useRestaurant();

  const handleEstiloChange = (key: keyof typeof estilo, value: string) => {
    actualizarEstilo({ ...estilo, [key]: value });
  };

  // Funciones visuales para preview
  const getPrimaryBg = () => {
    if (estilo.colorAcento !== '#010102') return `bg-[${estilo.colorAcento}] text-white`;
    switch (estilo.paleta) {
      case 'bistro': return 'bg-black text-white';
      case 'trattoria': return 'bg-orange-800 text-white';
      case 'minimal': return 'bg-gray-900 text-white';
      case 'street': return 'bg-red-600 text-white';
      default: return 'bg-black text-white';
    }
  };

  const getRadius = () => {
    switch (estilo.formaBoton) {
      case 'pill': return 'rounded-full';
      case 'rounded': return 'rounded-xl';
      case 'square': return 'rounded-none';
      default: return 'rounded-full';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto p-4">
      
      {/* PANEL IZQUIERDO - CONTROLES */}
      <div className="flex-1 flex flex-col gap-6">
        <header className="mb-2">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>Identidad Visual</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-texto-suave)' }}>Adapta los colores, botones y textos de tu menú digital.</p>
        </header>

        {/* Paletas */}
        <div className="magic-card p-5 flex flex-col gap-4">
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-texto)' }}>Paletas Gastronómicas</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'bistro', name: 'Bistró & Brasas', desc: 'Tonos carbón y ámbar' },
              { id: 'trattoria', name: 'Trattoria & Sol', desc: 'Verde oliva y terracota' },
              { id: 'minimal', name: 'Alta Cocina', desc: 'Minimalismo y champagne' },
              { id: 'street', name: 'Street Food', desc: 'Pomodoro y mostaza vibrante' }
            ].map(p => (
              <button 
                key={p.id}
                onClick={() => handleEstiloChange('paleta', p.id)}
                className={`p-3 text-left rounded-xl transition-all border ${estilo.paleta === p.id ? 'bg-[rgba(240,240,240,0.8)] border-black' : 'bg-transparent border-[rgba(212,212,212,0.5)] hover:bg-[rgba(250,250,250,0.5)]'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>{p.name}</span>
                  {estilo.paleta === p.id && <span className="text-black">✓</span>}
                </div>
                <p className="text-xs" style={{ color: 'var(--color-texto-suave)' }}>{p.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-2 border-t border-[rgba(212,212,212,0.3)] pt-4">
            <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--color-texto)' }}>Color de Acento Custom (HEX)</h4>
            <div className="flex gap-2 items-center">
              <input type="color" value={estilo.colorAcento} onChange={(e) => handleEstiloChange('colorAcento', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <input type="text" value={estilo.colorAcento} onChange={(e) => handleEstiloChange('colorAcento', e.target.value)} className="magic-card px-3 py-2 text-sm uppercase" style={{ width: '100px' }} />
            </div>
          </div>
        </div>

        {/* Forma y texto de botón */}
        <div className="magic-card p-5 flex flex-col gap-4">
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-texto)' }}>Botones de Comanda</h3>
          
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button onClick={() => handleEstiloChange('formaBoton', 'pill')} className={`p-2 rounded-xl text-xs font-bold border ${estilo.formaBoton === 'pill' ? 'bg-gray-100 border-black' : 'border-gray-200'}`}>Píldora</button>
            <button onClick={() => handleEstiloChange('formaBoton', 'rounded')} className={`p-2 rounded-xl text-xs font-bold border ${estilo.formaBoton === 'rounded' ? 'bg-gray-100 border-black' : 'border-gray-200'}`}>Suaves</button>
            <button onClick={() => handleEstiloChange('formaBoton', 'square')} className={`p-2 rounded-xl text-xs font-bold border ${estilo.formaBoton === 'square' ? 'bg-gray-100 border-black' : 'border-gray-200'}`}>Rectos</button>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--color-texto)' }}>Texto de llamada a la acción</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Añadir a la Comanda', 'Pedir a Cocina', 'Ordenar a Mesa', 'Añadir'].map(t => (
                <button key={t} onClick={() => handleEstiloChange('textoBoton', t)} className="magic-badge !text-xs !px-2 !py-1 cursor-pointer">
                  {t}
                </button>
              ))}
            </div>
            <input 
              type="text" 
              value={estilo.textoBoton} 
              onChange={(e) => handleEstiloChange('textoBoton', e.target.value)}
              className="w-full magic-card px-3 py-2 text-sm border border-gray-200"
            />
          </div>
        </div>

        {/* Tipografía */}
        <div className="magic-card p-5 flex flex-col gap-4">
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-texto)' }}>Tipografía Principal</h3>
          <div className="flex flex-col gap-2">
            {[
              { id: 'jakarta', name: 'Plus Jakarta Sans', desc: 'Moderna y legible' },
              { id: 'playfair', name: 'Playfair Display', desc: 'Editorial y elegante' },
              { id: 'inter', name: 'Inter', desc: 'Neutra y condensada' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => handleEstiloChange('tipografia', f.id)}
                className={`p-3 text-left rounded-xl transition-all border flex justify-between items-center ${estilo.tipografia === f.id ? 'bg-[rgba(240,240,240,0.8)] border-black' : 'bg-transparent border-[rgba(212,212,212,0.5)]'}`}
              >
                <div>
                  <span className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>{f.name}</span>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-texto-suave)' }}>{f.desc}</p>
                </div>
                {estilo.tipografia === f.id && <span className="text-black font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <button className="magic-button magic-button-primary w-full py-4 text-lg mt-4 shadow-xl">
          Guardar y Aplicar a Todos los QR
        </button>
      </div>

      {/* PANEL DERECHO - PREVIEW */}
      <div className="w-full lg:w-[400px] flex-shrink-0 sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-bold text-[var(--color-texto-suave)]">Previsualización en Vivo</span>
        </div>
        
        <div className="magic-card p-6 overflow-hidden relative shadow-2xl border-t-8 border-t-black min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold" style={{ 
              fontFamily: estilo.tipografia === 'playfair' ? 'serif' : 'sans-serif',
              fontSize: '1.2rem'
            }}>Menú Fuego & Grana</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Mesa 04</span>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 mb-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-300 rounded-xl overflow-hidden shadow-sm">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBubFkjt9DZEKhXxe2jHN-JmNpoWzwzmkcM4COF6c-QejkSQ8nbT7v2jO9QIJupLEC2o9n8-r9z3r7CRX5P3PpNOVDzVSDJpSgJynQH5ueAiLopHsSreJJTpkMELyCGFPmCa2aHViQ6sUcYhWn3oWGdCjoQ0EwBj4YjZ80OUgD4JqPPL6nULs9chEpqHAOMvw0lbTzA0wK19dae-h9R9QCTwLOjZwIlSGa2NParkUk" alt="Food" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1" style={{ fontFamily: estilo.tipografia === 'playfair' ? 'serif' : 'sans-serif' }}>Tagliatelle al Tartufo</h4>
                <p className="text-lg font-bold">24,00 €</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">Pasta fresca con tartufo negro</p>
              </div>
            </div>
            
            <button 
              className={`w-full mt-4 py-3 px-4 flex justify-between items-center font-bold text-sm shadow-md transition-all ${getPrimaryBg()} ${getRadius()}`}
            >
              <span>{estilo.textoBoton}</span>
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
