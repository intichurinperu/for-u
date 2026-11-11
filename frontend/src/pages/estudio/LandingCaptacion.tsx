import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingCaptacion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
      
      {/* Fondo con gradiente sutil */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ background: 'var(--gradient-iridiscente)' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '2s', background: 'var(--gradient-iridiscente)' }}></div>

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center" style={{ animation: 'foru-focus-step-in 0.5s ease-out' }}>
        
        <div className="magic-badge px-4 py-1.5 mb-6 shadow-sm">
          ✨ El Estudio de Nicole
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>
          Crea tu ruta digital en 30 minutos
        </h1>
        
        <p className="text-lg md:text-xl font-medium mb-8" style={{ color: 'var(--color-texto-suave)' }}>
          Completamente gratis · Cupos limitados esta semana
        </p>

        <button 
          onClick={() => navigate('/registro')}
          className="magic-button magic-button-primary w-full text-xl py-5 rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform font-bold mb-10"
        >
          ✨ Crear mi ruta digital
        </button>

        <div className="w-full text-left bg-[rgba(250,250,250,0.7)] backdrop-blur-md rounded-2xl p-6 border border-[rgba(212,212,212,0.5)] mb-8 shadow-sm">
          <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--color-texto)' }}>¿Qué incluye la asesoría?</h3>
          <ul className="flex flex-col gap-3">
            {[
              'Diagnóstico de tu presencia digital actual',
              'Plan de acción paso a paso personalizado',
              'Creación de tu cuenta en FOR U en vivo',
              'Estrategia de ventas para tu rubro'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">✓</span>
                <span style={{ color: 'var(--color-texto-suave)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="magic-badge mb-8 px-4 py-2 bg-[rgba(250,250,250,0.8)] border border-[rgba(212,212,212,0.5)]" style={{ background: 'transparent', color: 'var(--color-texto-suave)' }}>
          🔥 Solo quedan <strong style={{ color: 'var(--color-texto)' }}>3 cupos</strong> esta semana
        </div>

        <div className="w-full flex flex-col gap-4 mb-12">
          {[
            { n: 'Café del Parque', t: '"En 30 minutos entendí lo que no pude en meses. FOR U es magia pura."' },
            { n: 'Boutique Luna', t: '"Nicole fue súper clara, y salí con mi tienda armada y lista para vender."' },
            { n: 'Pizzería Napoli', t: '"Recomendadísimo, el sistema de pedidos es un antes y un después."' }
          ].map((testimonio, idx) => (
            <div key={idx} className="magic-card p-4 text-left border border-[rgba(212,212,212,0.3)] hover:-translate-y-1 transition-transform">
              <p className="italic text-sm mb-2" style={{ color: 'var(--color-texto-suave)' }}>{testimonio.t}</p>
              <p className="font-bold text-xs" style={{ color: 'var(--color-texto)' }}>— {testimonio.n}</p>
            </div>
          ))}
        </div>

        <footer className="text-sm font-medium" style={{ color: 'var(--color-texto-suave)' }}>
          Una iniciativa de <a href="https://instagram.com/nicole" target="_blank" rel="noreferrer" className="underline font-bold text-black hover:text-gray-700 transition-colors">@Nicole</a> · Creado con FOR U
        </footer>
      </div>
    </div>
  );
}
