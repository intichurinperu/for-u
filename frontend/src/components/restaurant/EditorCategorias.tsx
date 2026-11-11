import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';

export default function EditorCategorias() {
  const { categorias, actualizarCategoria } = useRestaurant();

  const toggleCategoria = (id: string, activa: boolean) => {
    actualizarCategoria(id, { activa: !activa });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>Tus Categorías</h2>
        <div className="flex gap-2">
          <button className="magic-button magic-button-soft text-sm px-4 py-2">Ordenar por ventas</button>
          <button className="magic-button magic-button-primary text-sm px-4 py-2">Nueva Categoría</button>
        </div>
      </div>

      <div className="magic-card p-4 bg-[rgba(250,250,250,0.86)] border-l-4 border-l-blue-400 mb-4 flex gap-4 items-start">
        <span className="text-2xl">📦</span>
        <div>
          <h4 className="font-bold text-sm" style={{ color: 'var(--color-texto)' }}>Consejo de Oliver</h4>
          <p className="text-sm mt-1" style={{ color: 'var(--color-texto-suave)' }}>
            Colocar <strong>Pastas Caseras</strong> en la 1ª posición aumenta el ticket promedio un 18%.
            Actualmente está en la 2ª posición.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {categorias.map((cat, idx) => (
          <div key={cat.id} className="magic-card p-4 flex items-center justify-between" style={{ animation: `foru-focus-step-in 0.3s ease-out ${idx * 0.05}s` }}>
            <div className="flex items-center gap-4">
              <span className="text-2xl w-10 h-10 flex items-center justify-center bg-[var(--color-superficie)] rounded-full shadow-sm">{cat.icono || '🍽️'}</span>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--color-texto)' }}>{cat.nombre}</h3>
                <p className="text-xs" style={{ color: 'var(--color-texto-suave)' }}>
                  {cat.metricas.pedidos} pedidos · {cat.metricas.clics} vistas
                  {cat.horarioInicio && ` · 🕒 Solo de ${cat.horarioInicio} a ${cat.horarioFin}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold" style={{ color: 'var(--color-texto-suave)' }}>
                {cat.platos.length} platos activos
              </span>
              <button 
                onClick={() => toggleCategoria(cat.id, cat.activa)}
                className={`w-12 h-6 rounded-full relative transition-colors ${cat.activa ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${cat.activa ? 'translate-x-6' : 'translate-x-0'}`}></span>
              </button>
              <button className="text-[var(--color-texto-suave)] hover:text-[var(--color-texto)]">
                <span className="text-xl">⋮</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
