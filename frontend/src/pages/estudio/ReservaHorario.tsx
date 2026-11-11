import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HORARIOS_MOCK = [
  { id: 'h1', dia: 'Lun 12', hora: '10:00 AM', cuposRestantes: 2, agotado: false },
  { id: 'h2', dia: 'Lun 12', hora: '15:30 PM', cuposRestantes: 0, agotado: true },
  { id: 'h3', dia: 'Mar 13', hora: '11:00 AM', cuposRestantes: 1, agotado: false },
  { id: 'h4', dia: 'Mié 14', hora: '09:00 AM', cuposRestantes: 5, agotado: false },
  { id: 'h5', dia: 'Jue 15', hora: '16:00 PM', cuposRestantes: 0, agotado: true },
];

export default function ReservaHorario() {
  const navigate = useNavigate();
  const location = useLocation();
  const registroId = location.state?.registroId || 'uuid-1234';
  
  const [selectedHorario, setSelectedHorario] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const horarioSeleccionadoData = HORARIOS_MOCK.find(h => h.id === selectedHorario);

  const handleConfirmar = () => {
    setLoading(true);
    // Simular guardado en Supabase -> estudio_reservas
    setTimeout(() => {
      setLoading(false);
      navigate('/exito', { state: { registroId, horarioId: selectedHorario } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex flex-col items-center p-6 relative">
      <div className="max-w-md w-full" style={{ animation: 'foru-focus-step-in 0.4s ease-out' }}>
        
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[rgba(250,250,250,0.8)] rounded-full flex items-center justify-center shadow-sm border border-[rgba(212,212,212,0.4)]">
            <span className="text-xl font-bold">←</span>
          </button>
          <div className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100" style={{ color: 'var(--color-texto)' }}>
            Paso 3 de 3
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-black mb-2 leading-tight" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>
          Elige tu horario de asesoría gratuita
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-texto-suave)' }}>
          Solo atendemos a 5 personas por semana para dar calidad total. Agenda antes de que se agoten.
        </p>

        <div className="flex flex-col gap-4 mb-24">
          {HORARIOS_MOCK.map((h, idx) => (
            <button
              key={h.id}
              disabled={h.agotado}
              onClick={() => { setSelectedHorario(h.id); setShowModal(true); }}
              className={`magic-card p-5 text-left transition-all ${
                h.agotado 
                  ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' 
                  : 'hover:-translate-y-1 hover:shadow-lg border-[rgba(212,212,212,0.3)] bg-white cursor-pointer'
              } ${selectedHorario === h.id ? 'border-purple-500 bg-purple-50' : ''}`}
              style={{ 
                animation: `foru-focus-step-in 0.4s ease-out ${idx * 0.1}s`,
                ...(selectedHorario === h.id ? { borderImage: 'var(--gradient-iridiscente) 1', borderWidth: '2px', borderStyle: 'solid' } : {})
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-lg" style={{ color: 'var(--color-texto)' }}>{h.dia} · {h.hora}</span>
                {h.agotado && <span className="text-xs font-bold bg-gray-200 text-gray-500 px-2 py-1 rounded">Cerrado</span>}
              </div>
              {!h.agotado && (
                <span className="text-xs font-bold" style={{ color: h.cuposRestantes <= 2 ? '#ef4444' : 'var(--color-texto-suave)' }}>
                  🔥 {h.cuposRestantes} cupos disponibles
                </span>
              )}
            </button>
          ))}
        </div>

      </div>

      {/* Modal de confirmación */}
      {showModal && horarioSeleccionadoData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="magic-card bg-white p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl scale-100 transition-transform">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mb-4">🗓️</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-texto)' }}>Confirmar reserva</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-texto-suave)' }}>
              Estás a punto de reservar para el <strong>{horarioSeleccionadoData.dia} a las {horarioSeleccionadoData.hora}</strong>.
            </p>
            <div className="w-full flex flex-col gap-3">
              <button 
                disabled={loading}
                onClick={handleConfirmar}
                className="magic-button magic-button-primary w-full py-4 font-bold rounded-xl"
              >
                {loading ? 'Confirmando...' : 'Sí, confirmar horario'}
              </button>
              <button 
                disabled={loading}
                onClick={() => setShowModal(false)}
                className="w-full py-3 font-bold text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
