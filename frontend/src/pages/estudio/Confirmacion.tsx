import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Confirmacion() {
  const navigate = useNavigate();
  const location = useLocation();
  // const { registroId, horarioId } = location.state || {};

  // Datos mock para visualizar
  const telefonoNicole = '34600000000'; // Rellenar con teléfono real (formato internacional sin +)
  const mensajePreLlenado = encodeURIComponent("¡Hola Nicole! Acabo de reservar mi asesoría gratuita de FOR U. Aquí estoy listo/a para crear mi ruta digital ✨");

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Efectos de celebración sutiles */}
      <div className="absolute top-10 left-10 text-4xl animate-float" style={{ animationDelay: '0.2s' }}>✨</div>
      <div className="absolute top-20 right-10 text-3xl animate-float" style={{ animationDelay: '1s' }}>🎉</div>
      <div className="absolute bottom-20 left-20 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>🚀</div>

      <div className="max-w-md w-full relative z-10 flex flex-col items-center" style={{ animation: 'foru-focus-step-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm border-4 border-white">
          ✓
        </div>

        <h1 className="text-3xl font-black mb-4 leading-tight" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>
          ¡Listo! Tu asesoría está confirmada
        </h1>
        
        <div className="magic-card bg-[rgba(250,250,250,0.8)] border border-[rgba(212,212,212,0.4)] p-6 mb-8 w-full flex flex-col gap-3 text-left">
          <div className="flex items-center gap-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha y Hora</p>
              <p className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>Miércoles 14 · 09:00 AM</p>
            </div>
          </div>
          <div className="w-full h-px bg-gray-200 my-1"></div>
          <div className="flex items-center gap-3">
            <span className="text-xl">⏱️</span>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duración</p>
              <p className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>30 minutos (puntual)</p>
            </div>
          </div>
          <div className="w-full h-px bg-gray-200 my-1"></div>
          <div className="flex items-center gap-3">
            <span className="text-xl">📝</span>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">No olvides</p>
              <p className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>Tus 3 fotos y acceso a Instagram</p>
            </div>
          </div>
        </div>

        <p className="text-sm font-medium mb-6" style={{ color: 'var(--color-texto-suave)' }}>
          Para enviarte el enlace de Google Meet y un recordatorio 24h antes, escríbeme por WhatsApp ahora mismo:
        </p>

        <a 
          href={`https://wa.me/${telefonoNicole}?text=${mensajePreLlenado}`}
          target="_blank" 
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-white font-bold text-lg shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:-translate-y-1 transition-all"
          style={{ backgroundColor: '#25D366' }}
        >
          <span className="text-2xl">💬</span>
          Agregar a WhatsApp de Nicole
        </a>

        <button 
          onClick={() => navigate('/')}
          className="mt-8 magic-button magic-button-ghost text-sm font-bold px-6 py-2"
          style={{ color: 'var(--color-texto-suave)' }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
