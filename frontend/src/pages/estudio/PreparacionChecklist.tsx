import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PreparacionChecklist() {
  const navigate = useNavigate();
  const location = useLocation();
  const registroId = location.state?.registroId || 'uuid-1234';

  const [fotosSubidas, setFotosSubidas] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [contrasenas, setContrasenas] = useState(false);

  const completados = (fotosSubidas > 0 ? 1 : 0) + (descripcion.trim() ? 1 : 0) + (precio.trim() ? 1 : 0) + (contrasenas ? 1 : 0);
  const todoCompletado = completados === 4;

  const handleCompletar = () => {
    // Simular update en Supabase tabla estudio_checklist
    navigate('/reserva', { state: { registroId } });
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex flex-col items-center p-6 pb-32">
      <div className="max-w-md w-full" style={{ animation: 'foru-focus-step-in 0.4s ease-out' }}>
        
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[rgba(250,250,250,0.8)] rounded-full flex items-center justify-center shadow-sm border border-[rgba(212,212,212,0.4)]">
            <span className="text-xl font-bold">←</span>
          </button>
          <div className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100" style={{ color: 'var(--color-texto)' }}>
            Paso 2 de 3
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-black mb-2 leading-tight" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>
          Antes de tu asesoría, prepara esto (15 min)
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-texto-suave)' }}>
          Para aprovechar los 30 minutos al máximo, necesitamos esta información básica.
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold" style={{ color: 'var(--color-texto)' }}>{completados} de 4 completados</span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-texto-suave)' }}>{Math.round((completados/4)*100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(completados/4)*100}%`, background: 'var(--gradient-iridiscente)' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          
          {/* ITEM 1 */}
          <div className={`magic-card p-5 border-2 transition-colors ${fotosSubidas > 0 ? 'border-green-400 bg-green-50/30' : 'border-[rgba(212,212,212,0.2)] bg-[rgba(250,250,250,0.8)]'}`}>
            <div className="flex gap-4">
              <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 mt-0.5 transition-colors ${fotosSubidas > 0 ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                {fotosSubidas > 0 && <span className="text-sm font-bold">✓</span>}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>Sube al menos 3 fotos de tu negocio/producto</h3>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setFotosSubidas(3)} className="magic-button magic-button-soft text-xs px-4 py-2 border border-gray-300">
                    📷 Seleccionar fotos
                  </button>
                  {fotosSubidas > 0 && <span className="text-xs text-green-600 font-bold">{fotosSubidas} subidas</span>}
                </div>
              </div>
            </div>
          </div>

          {/* ITEM 2 */}
          <div className={`magic-card p-5 border-2 transition-colors ${descripcion.trim() ? 'border-green-400 bg-green-50/30' : 'border-[rgba(212,212,212,0.2)] bg-[rgba(250,250,250,0.8)]'}`}>
            <div className="flex gap-4">
              <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 mt-0.5 transition-colors ${descripcion.trim() ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                {descripcion.trim() && <span className="text-sm font-bold">✓</span>}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>Escribe en 2 líneas qué te hace único</h3>
                <textarea 
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Ej. Somos la única cafetería de especialidad en el barrio con pastelería vegana..."
                  className="w-full mt-1 border border-[rgba(212,212,212,0.3)] rounded-xl p-3 text-sm focus:outline-none focus:border-black bg-white"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* ITEM 3 */}
          <div className={`magic-card p-5 border-2 transition-colors ${precio.trim() ? 'border-green-400 bg-green-50/30' : 'border-[rgba(212,212,212,0.2)] bg-[rgba(250,250,250,0.8)]'}`}>
            <div className="flex gap-4">
              <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 mt-0.5 transition-colors ${precio.trim() ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                {precio.trim() && <span className="text-sm font-bold">✓</span>}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>Define tu precio principal / Ticket medio</h3>
                <input 
                  type="text"
                  value={precio}
                  onChange={e => setPrecio(e.target.value)}
                  placeholder="Ej. $15.00 por persona"
                  className="w-full mt-1 border border-[rgba(212,212,212,0.3)] rounded-xl p-3 text-sm focus:outline-none focus:border-black bg-white"
                />
              </div>
            </div>
          </div>

          {/* ITEM 4 */}
          <label className={`magic-card p-5 border-2 transition-colors cursor-pointer ${contrasenas ? 'border-green-400 bg-green-50/30' : 'border-[rgba(212,212,212,0.2)] bg-[rgba(250,250,250,0.8)]'}`}>
            <div className="flex gap-4 items-center">
              <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${contrasenas ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                {contrasenas && <span className="text-sm font-bold">✓</span>}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>Ten a la mano tus contraseñas de Instagram/WhatsApp</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--color-texto-suave)' }}>Solo para que tú misma inicies sesión durante la llamada.</p>
              </div>
              <input type="checkbox" className="hidden" checked={contrasenas} onChange={e => setContrasenas(e.target.checked)} />
            </div>
          </label>

        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pb-safe flex justify-center z-50">
          <div className="max-w-md w-full">
            <button 
              onClick={handleCompletar}
              disabled={!todoCompletado}
              className={`magic-button magic-button-primary w-full py-4 text-lg font-bold rounded-2xl transition-all ${!todoCompletado ? 'opacity-50 grayscale cursor-not-allowed' : 'shadow-xl hover:-translate-y-1'}`}
            >
              Marcar como listo ✨
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
