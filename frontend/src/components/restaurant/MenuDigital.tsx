import React, { useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';

export default function MenuDigital() {
  const { categorias, platos, estilo, pedido } = useRestaurant();

  // Filtrar solo platos disponibles y de categorías activas
  const platosDisponibles = useMemo(() => {
    return platos.filter(p => p.disponible && categorias.find(c => c.id === p.categoriaId)?.activa);
  }, [platos, categorias]);

  const categoriasConPlatos = useMemo(() => {
    return categorias.filter(c => c.activa && platosDisponibles.some(p => p.categoriaId === c.id));
  }, [categorias, platosDisponibles]);

  const totalCarrito = pedido.reduce((acc, curr) => {
    const plato = platos.find(p => p.id === curr.platoId);
    return acc + ((plato?.precio || 0) * curr.cantidad);
  }, 0);

  const totalItems = pedido.reduce((acc, curr) => acc + curr.cantidad, 0);

  // Funciones de estilo dinámico basadas en context
  const fontFamily = estilo.tipografia === 'playfair' ? 'serif' : 'sans-serif';
  const radiusClass = estilo.formaBoton === 'pill' ? 'rounded-full' : estilo.formaBoton === 'rounded' ? 'rounded-xl' : 'rounded-none';
  const bgStyle = estilo.colorAcento !== '#010102' ? { backgroundColor: estilo.colorAcento, color: '#fff' } : {};
  const bgClass = estilo.colorAcento === '#010102' ? 'bg-black text-white' : '';

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 relative w-full max-w-md mx-auto shadow-2xl" style={{ fontFamily }}>
      
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--color-texto-suave)' }}>
            {(() => {
              try {
                const storedOliver = localStorage.getItem('pizarra_logistica_data');
                if (storedOliver) {
                  const data = JSON.parse(storedOliver);
                  return data.mesaDefault || 'Mesa 04 · Terraza';
                }
              } catch(e) {}
              return 'Mesa 04 · Terraza';
            })()}
          </p>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-texto)' }}>
            {(() => {
              try {
                const storedMunay = localStorage.getItem('pizarra_marketing_data');
                if (storedMunay) {
                  const data = JSON.parse(storedMunay);
                  return data.nombreNegocio || 'Fuego & Grana Bistró';
                }
              } catch(e) {}
              return 'Fuego & Grana Bistró';
            })()}
          </h1>
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shadow-inner relative">
          <span className="text-xl">🛎️</span>
        </div>
      </header>

      {/* Navegación de Categorías Horizontal */}
      <nav className="flex overflow-x-auto gap-3 p-4 scrollbar-hide snap-x">
        {categoriasConPlatos.map((cat, idx) => (
          <button 
            key={cat.id} 
            className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2 ${radiusClass} border whitespace-nowrap transition-all shadow-sm ${idx === 0 ? bgClass : 'bg-white border-gray-200'}`}
            style={idx === 0 && estilo.colorAcento !== '#010102' ? bgStyle : {}}
          >
            {cat.icono && <span>{cat.icono}</span>}
            <span className={`text-sm font-bold ${idx === 0 ? 'text-inherit' : 'text-[var(--color-texto)]'}`}>{cat.nombre}</span>
          </button>
        ))}
      </nav>

      {/* Banner Plato Destacado (Chef) */}
      {platosDisponibles.length > 0 && (
        <div className="px-4 mb-6">
          <div className="magic-card relative h-40 w-full overflow-hidden" style={{ animation: 'foru-focus-step-in 0.4s ease-out' }}>
            <img src={platosDisponibles[0].foto} alt="Recomendación" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
              <span className="magic-badge self-start mb-2 px-2 py-0.5 text-xs">✨ Sugerencia del Chef</span>
              <h3 className="text-white font-bold text-lg leading-tight">{platosDisponibles[0].nombre}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Platos */}
      <main className="px-4 flex flex-col gap-6">
        {categoriasConPlatos.map(cat => (
          <section key={cat.id}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-texto)' }}>{cat.nombre}</h2>
            <div className="flex flex-col gap-4">
              {platosDisponibles.filter(p => p.categoriaId === cat.id).map(plato => (
                <div key={plato.id} className="magic-card flex p-3 gap-4" style={{ animation: 'animate-fade-in 0.3s ease-out both' }}>
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img src={plato.foto} alt={plato.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm leading-tight mb-1" style={{ color: 'var(--color-texto)' }}>{plato.nombre}</h3>
                      <p className="text-xs line-clamp-2" style={{ color: 'var(--color-texto-suave)' }}>{plato.descripcion}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-base">{plato.precio.toFixed(2)} €</span>
                      <button 
                        className={`w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md ${bgClass} ${radiusClass}`}
                        style={bgStyle}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Carrito Flotante Inferior */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-50 pointer-events-none max-w-md mx-auto">
          <div className={`pointer-events-auto p-1 pr-1 pl-4 flex justify-between items-center shadow-2xl ${bgClass} ${radiusClass}`} style={bgStyle}>
            <div className="flex flex-col">
              <span className="text-xs opacity-80">{totalItems} items en comanda</span>
              <span className="font-bold text-lg">{totalCarrito.toFixed(2)} €</span>
            </div>
            <button className={`bg-white text-black px-6 py-3 font-bold text-sm h-full ${radiusClass}`}>
              Ver Comanda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
