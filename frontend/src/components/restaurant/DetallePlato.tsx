import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import type { Plato } from '../../types/restaurant';

export default function DetallePlato() {
  const { platos, estilo, agregarAlPedido } = useRestaurant();
  // Simulamos que el usuario tocó el primer plato para el detalle interactivo
  const plato = platos[0];

  const [cantidad, setCantidad] = useState(1);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(plato?.variantes[0]?.id);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<Set<string>>(new Set());
  const [quiereMaridaje, setQuiereMaridaje] = useState(false);
  const [notas, setNotas] = useState('');
  const [mostrarToast, setMostrarToast] = useState(false);

  if (!plato) return <p>Cargando plato...</p>;

  const toggleExtra = (id: string) => {
    const nuevos = new Set(extrasSeleccionados);
    if (nuevos.has(id)) nuevos.delete(id);
    else nuevos.add(id);
    setExtrasSeleccionados(nuevos);
  };

  const calcularTotal = () => {
    let total = plato.precio;
    if (varianteSeleccionada) {
      const v = plato.variantes.find(va => va.id === varianteSeleccionada);
      if (v) total += v.precioExtra;
    }
    extrasSeleccionados.forEach(eId => {
      const e = plato.extras.find(ex => ex.id === eId);
      if (e) total += e.precioExtra;
    });
    if (quiereMaridaje && plato.maridaje) {
      total += plato.maridaje.precio;
    }
    return total * cantidad;
  };

  const handleAñadir = () => {
    agregarAlPedido({
      platoId: plato.id,
      cantidad,
      varianteId: varianteSeleccionada,
      extrasIds: Array.from(extrasSeleccionados),
      maridaje: quiereMaridaje,
      notas
    });
    setMostrarToast(true);
    setTimeout(() => setMostrarToast(false), 3000);
  };

  const fontFamily = estilo.tipografia === 'playfair' ? 'serif' : 'sans-serif';
  const radiusClass = estilo.formaBoton === 'pill' ? 'rounded-full' : estilo.formaBoton === 'rounded' ? 'rounded-xl' : 'rounded-none';
  const bgStyle = estilo.colorAcento !== '#010102' ? { backgroundColor: estilo.colorAcento, color: '#fff' } : {};
  const bgClass = estilo.colorAcento === '#010102' ? 'bg-black text-white' : '';

  return (
    <div className="bg-white min-h-screen pb-32 relative w-full max-w-md mx-auto shadow-2xl" style={{ fontFamily }}>
      
      {/* Toast de confirmación */}
      {mostrarToast && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-float">
          <div className="magic-card bg-green-500 text-white p-3 rounded-xl flex items-center gap-3 shadow-xl">
            <span className="text-xl">✅</span>
            <span className="font-bold text-sm">Añadido a la comanda correctamente</span>
          </div>
        </div>
      )}

      {/* Hero Image */}
      <div className="relative h-72 w-full bg-gray-200">
        <img src={plato.foto} alt={plato.nombre} className="w-full h-full object-cover" />
        <button className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md">
          <span className="text-xl font-bold">←</span>
        </button>
        {plato.badge && (
          <span className="magic-badge absolute bottom-4 left-4 px-3 py-1 shadow-md text-xs font-bold bg-white text-black">
            🔥 {plato.badge}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold leading-tight flex-1 pr-4" style={{ color: 'var(--color-texto)' }}>{plato.nombre}</h1>
          <span className="text-xl font-bold whitespace-nowrap">{plato.precio.toFixed(2)} €</span>
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-texto-suave)' }}>{plato.descripcion}</p>

        {/* Badges Dietéticos */}
        <div className="flex gap-2 mb-6">
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">🌱 Vegetariano</span>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">🌾 Contiene Gluten</span>
        </div>

        <div className="w-full h-px bg-gray-100 my-6"></div>

        {/* Variantes (Radio) */}
        {plato.variantes.length > 0 && (
          <section className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base">Elige tu pasta</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-bold">Obligatorio</span>
            </div>
            <div className="flex flex-col gap-3">
              {plato.variantes.map(v => (
                <label key={v.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="variante" checked={varianteSeleccionada === v.id} onChange={() => setVarianteSeleccionada(v.id)} className="w-5 h-5 accent-black" />
                    <div>
                      <p className="font-bold text-sm">{v.nombre}</p>
                      <p className="text-xs text-gray-500">{v.descripcion}</p>
                    </div>
                  </div>
                  {v.precioExtra > 0 && <span className="text-sm font-bold text-gray-600">+{v.precioExtra} €</span>}
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Extras (Checkboxes) */}
        {plato.extras.length > 0 && (
          <section className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base">Mejora tu plato</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-bold">Opcional</span>
            </div>
            <div className="flex flex-col gap-3">
              {plato.extras.map(e => (
                <label key={e.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={extrasSeleccionados.has(e.id)} onChange={() => toggleExtra(e.id)} className="w-5 h-5 rounded border-gray-300 accent-black" />
                    <div>
                      <p className="font-bold text-sm">{e.nombre}</p>
                      <p className="text-xs text-gray-500">{e.descripcion}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-600">+{e.precioExtra} €</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Maridaje Recomendado */}
        {plato.maridaje && (
          <section className="mb-6">
            <h3 className="font-bold text-base mb-3">Maridaje recomendado</h3>
            <label className="flex items-center justify-between p-4 bg-purple-50 border border-purple-100 rounded-xl cursor-pointer">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🍷</span>
                <div>
                  <p className="font-bold text-sm text-purple-900">{plato.maridaje.nombre}</p>
                  <p className="text-xs text-purple-700">{plato.maridaje.descripcion}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-purple-900">+{plato.maridaje.precio} €</span>
                <input type="checkbox" checked={quiereMaridaje} onChange={(e) => setQuiereMaridaje(e.target.checked)} className="w-6 h-6 rounded border-purple-300 accent-purple-600" />
              </div>
            </label>
          </section>
        )}

        {/* Notas para cocina */}
        <section className="mb-8">
          <h3 className="font-bold text-base mb-3">Notas para cocina</h3>
          <textarea 
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-gray-400 bg-gray-50" 
            rows={2} 
            placeholder="¿Alguna alergia o preferencia especial?"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          ></textarea>
        </section>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-40 max-w-md mx-auto pb-safe">
        <div className="flex gap-4">
          <div className="flex items-center justify-between bg-gray-100 rounded-full px-2 py-1 w-1/3 border border-gray-200">
            <button className="w-8 h-8 flex items-center justify-center font-bold text-lg text-gray-600" onClick={() => setCantidad(Math.max(1, cantidad - 1))}>−</button>
            <span className="font-bold text-base">{cantidad}</span>
            <button className="w-8 h-8 flex items-center justify-center font-bold text-lg text-gray-600" onClick={() => setCantidad(cantidad + 1)}>+</button>
          </div>
          
          <button 
            onClick={handleAñadir}
            className={`flex-1 flex justify-between items-center px-6 py-3 shadow-xl active:scale-95 transition-transform ${bgClass} ${radiusClass}`}
            style={bgStyle}
          >
            <span className="font-bold text-sm">{estilo.textoBoton}</span>
            <span className="font-bold text-base">{calcularTotal().toFixed(2)} €</span>
          </button>
        </div>
      </div>
    </div>
  );
}
