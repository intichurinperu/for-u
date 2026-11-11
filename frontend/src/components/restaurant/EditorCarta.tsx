import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import type { Plato } from '../../types/restaurant';

export default function EditorCarta() {
  const { platos, actualizarPlato } = useRestaurant();
  const [vistaCliente, setVistaCliente] = useState(false);

  const toggleDisponibilidad = (id: string, actual: boolean) => {
    actualizarPlato(id, { disponible: !actual });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>Platos y Menú</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-texto-suave)' }}>Gestiona tu oferta gastronómica</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-[var(--color-superficie)] p-1 rounded-full shadow-sm border border-[rgba(212,212,212,0.5)]">
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${!vistaCliente ? 'bg-[var(--color-texto)] text-white' : 'text-[var(--color-texto-suave)]'}`}
              onClick={() => setVistaCliente(false)}
            >
              Vista Dueño
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${vistaCliente ? 'bg-[var(--color-texto)] text-white' : 'text-[var(--color-texto-suave)]'}`}
              onClick={() => setVistaCliente(true)}
            >
              Previsualizar como cliente
            </button>
          </div>
          <button className="magic-button magic-button-primary text-sm px-6 py-2">Añadir Nuevo Plato</button>
        </div>
      </div>

      <div className="magic-card p-4 bg-[rgba(250,250,250,0.86)] border-l-4 border-l-green-400 mb-2 flex gap-4 items-start">
        <span className="text-2xl">🌱</span>
        <div>
          <h4 className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>Consejo de Shippo</h4>
          <p className="text-sm mt-1" style={{ color: 'var(--color-texto-suave)' }}>
            Detecté que producir el <strong>Tagliatelle</strong> te cuesta 18€ y lo vendes a 24€. Tu margen actual es bajo (25%). Deberías considerar ajustarlo a 26€ para llegar al 30% ideal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platos.map((plato, idx) => (
          <div key={plato.id} className="magic-card flex flex-col overflow-hidden" style={{ animation: `foru-focus-step-in 0.4s ease-out ${idx * 0.1}s` }}>
            <div className="relative h-48 w-full">
              <img src={plato.foto} alt={plato.nombre} className="w-full h-full object-cover" />
              {plato.badge && (
                <span className="magic-badge absolute top-3 left-3 px-3 py-1 bg-[var(--color-superficie)] rounded-full shadow-md text-xs font-bold" style={{ color: 'var(--color-texto)' }}>
                  {plato.badge === 'Top 1' ? '🏆 Top 1' : `🔥 ${plato.badge}`}
                </span>
              )}
              {!vistaCliente && (
                <button className="absolute bottom-3 right-3 magic-button magic-button-soft text-xs px-3 py-1 flex items-center gap-1">
                  📷 Cambiar foto
                </button>
              )}
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--color-texto)' }}>{plato.nombre}</h3>
                <span className="font-bold text-lg" style={{ color: 'var(--color-texto)' }}>{plato.precio.toFixed(2)}€</span>
              </div>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-texto-suave)' }}>{plato.descripcion}</p>
              
              {!vistaCliente && (
                <div className="mt-auto pt-4 border-t border-[rgba(212,212,212,0.3)] flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold" style={{ color: 'var(--color-texto-suave)' }}>
                      Disponible en cocina
                    </span>
                    <button 
                      onClick={() => toggleDisponibilidad(plato.id, plato.disponible)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${plato.disponible ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${plato.disponible ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="magic-button magic-button-soft flex-1 text-xs py-1.5">
                      {plato.variantes.length + plato.extras.length} Variantes
                    </button>
                    <button className="magic-button magic-button-soft flex-1 text-xs py-1.5">
                      🍷 Maridaje {plato.maridaje ? '✓' : ''}
                    </button>
                  </div>
                </div>
              )}

              {vistaCliente && (
                <div className="mt-auto pt-4">
                  <button className="magic-button magic-button-primary w-full py-2 flex justify-between px-4">
                    <span>Añadir a la comanda</span>
                    <span className="font-bold">+</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
