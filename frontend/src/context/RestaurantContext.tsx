import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Categoria, Plato, EstiloRestaurante, PedidoItem } from '../types/restaurant';

interface RestaurantContextType {
  categorias: Categoria[];
  platos: Plato[];
  estilo: EstiloRestaurante;
  pedido: PedidoItem[];
  actualizarCategoria: (id: string, data: Partial<Categoria>) => void;
  actualizarPlato: (id: string, data: Partial<Plato>) => void;
  actualizarEstilo: (estilo: EstiloRestaurante) => void;
  agregarAlPedido: (item: PedidoItem) => void;
  quitarDelPedido: (platoId: string) => void;
  limpiarPedido: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([
    {
      id: '1',
      nombre: 'Brasas & Carnes',
      icono: '🔥',
      platos: [],
      activa: true,
      metricas: { clics: 1420, pedidos: 318 }
    },
    {
      id: '2',
      nombre: 'Pastas Caseras',
      icono: '',
      platos: [],
      activa: true,
      metricas: { clics: 2890, pedidos: 542 }
    },
    {
      id: '3',
      nombre: 'Pizzas Artesanales',
      icono: '🍕',
      platos: [],
      activa: true,
      metricas: { clics: 1110, pedidos: 240 }
    },
    {
      id: '4',
      nombre: 'Entrantes & Antipasti',
      icono: '🥗',
      platos: [],
      activa: true,
      metricas: { clics: 1820, pedidos: 430 }
    },
    {
      id: '5',
      nombre: 'Postres & Dulces',
      icono: '',
      platos: [],
      activa: true,
      metricas: { clics: 940, pedidos: 210 }
    },
    {
      id: '6',
      nombre: 'Cava & Vinos',
      icono: '🍷',
      platos: [],
      activa: true,
      metricas: { clics: 1630, pedidos: 184 }
    },
    {
      id: '7',
      nombre: 'Coctelería de Autor',
      icono: '🍸',
      platos: [],
      activa: false,
      horarioInicio: '22:00',
      horarioFin: '02:30',
      metricas: { clics: 0, pedidos: 0 }
    }
  ]);

  const [platos, setPlatos] = useState<Plato[]>([
    {
      id: 'p1',
      nombre: 'Tagliatelle al Tartufo Nero & Parmigiano',
      descripcion: 'Pasta fresca artesanal, mantecada al momento con mantequilla de pasto y láminas de tartufo negro.',
      precio: 24,
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBubFkjt9DZEKhXxe2jHN-JmNpoWzwzmkcM4COF6c-QejkSQ8nbT7v2jO9QIJupLEC2o9n8-r9z3r7CRX5P3PpNOVDzVSDJpSgJynQH5ueAiLopHsSreJJTpkMELyCGFPmCa2aHViQ6sUcYhWn3oWGdCjoQ0EwBj4YjZ80OUgD4JqPPL6nULs9chEpqHAOMvw0lbTzA0wK19dae-h9R9QCTwLOjZwIlSGa2NParkUk',
      categoriaId: '2',
      disponible: true,
      badge: 'Top 1',
      tiempoPreparacion: '15-20 min',
      variantes: [
        { id: 'v1', nombre: 'Tagliatelle clásico al huevo', descripcion: 'Textura sedosa, receta tradicional', precioExtra: 0, obligatoria: true },
        { id: 'v2', nombre: 'Pappardelle rústico ancho', descripcion: 'Corte rústico con mayor absorción', precioExtra: 2, obligatoria: true },
        { id: 'v3', nombre: 'Opción sin gluten artesanal', descripcion: 'Maíz y arroz biológico', precioExtra: 3, obligatoria: true }
      ],
      extras: [
        { id: 'e1', nombre: 'Láminas extra de Trufa Negra fresca', descripcion: 'Laminada al momento (+4g)', precioExtra: 6 },
        { id: 'e2', nombre: 'Extra Parmigiano Reggiano 24 meses', descripcion: 'D.O.P. rallado fino', precioExtra: 2.5 },
        { id: 'e3', nombre: 'Mantequilla tostada con salvia', descripcion: 'Toque ahumado y avellana', precioExtra: 1.5 }
      ],
      maridaje: { nombre: 'Copa de Barolo DOCG 2019', descripcion: 'Notas térreas que realzan la trufa', precio: 8.5 },
      metricas: { clics: 1420, pedidos: 318 }
    },
    {
      id: 'p2',
      nombre: 'Costillar Vaca Vieja Madurada 45 Días',
      descripcion: 'Sellado a fuego vivo con leña de encina y sarmiento, romero y papas a la ceniza.',
      precio: 32,
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXi4Yp5NSWHLWQJon9Lu9mVGYipYSMGM1dnFohHni3DEnQhkPper43TjtPd3XBXERh7RBy1RIwo9bZUsRq2P7AunAujhvSDPt2uFcLeVWWsPA7s1lCeU01hLtFP6T4W4sjcUeCG2NWbuVTJO62v_RrPehTOHK_3MJbdwtuPUbZYyqIdmv2W63SRnNjHed6eaCy3kDAqf0Kst2O_rQTkJcd-hYCL7Whxk8QMeji4Dw',
      categoriaId: '1',
      disponible: true,
      badge: 'Brasas',
      tiempoPreparacion: '20-25 min',
      variantes: [],
      extras: [],
      metricas: { clics: 890, pedidos: 156 }
    },
    {
      id: 'p3',
      nombre: 'Burrata Ahumada con Higos & Pistacho',
      descripcion: 'Burrata cremosa, higos frescos caramelizados, aceto balsámico di Modena y pistacho de Bronte.',
      precio: 18,
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt6vfayrHqkoA1Vk5tV9ygCZIdFnYQorCCdHmyOAa_CUDV8RCpExwiH-oQFo1R2swPZuMeXjyM5-2-Ya2AJ_UtC52-LRjCf8wLGqv-hUq5zYq5aPcf2qze95qf2Dgkb-VddncAm-Efj8SE1rvwTgpv2WTq5X-NBqPmKQ7GPbtAJ0RyyofxFmCA7yZlpIaqxVDyNKA1kQpL5NfV8ugDA1c8VbwReIodevKHNMQvDHc',
      categoriaId: '4',
      disponible: true,
      badge: 'Entrante',
      tiempoPreparacion: '10 min',
      variantes: [],
      extras: [],
      metricas: { clics: 720, pedidos: 198 }
    },
    {
      id: 'p4',
      nombre: 'Pizza Margherita Artesanal a la Leña',
      descripcion: 'Masa fermentada 48h, tomate San Marzano, mozzarella fior di latte y albahaca fresca.',
      precio: 16,
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaLkgGF7Xa9y0rSFKasbeKWGPVYjDqUBSNmrJFrTJ5AoRweozT6GiZAGZfs6YYacfKagbNTeuaUB82Be4EpHhzS8pmD7iI8SYmotXOyslaY4BSS7kNrUpXHaNwSTupHl2uXoilZYGoPSjcXtFU7qGHeqObw1ZUrMaD_RiRZtLSc75q6oS1mXCxUBQMGMaUjYUgbKutcXh0BSWB-k9gOWA7rK7GTSY8nymVhgLC6Fk',
      categoriaId: '3',
      disponible: true,
      badge: 'Masa Madre',
      tiempoPreparacion: '12-15 min',
      variantes: [],
      extras: [],
      metricas: { clics: 1340, pedidos: 287 }
    },
    {
      id: 'p5',
      nombre: 'Tiramisú al Marsala & Cacao Crujiente',
      descripcion: 'Savoiardi casero remojado en café arábica y licor Marsala, mascarpone cremoso batido al momento.',
      precio: 12,
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvEc7xBHt2dW8VacunyBFNwA_nwmb0HVlMKH80BvaSTt9_iv-36cZLyTgs9urwWEyw6kMBKpLCh0Bez_3zGgI-4DELip-JoFovh79KOE5BstZupkbCpSAORnQNK72YBimGUSXclkWzoT1VhwKgxTDC9IDxHbd-TbeRGYemslLMCz_LeVwA46rmKr3Xu5LWf_rSDmgU3N-HeJ9ZTOoLzGnKI36n_vl4RTh01lRWaM8',
      categoriaId: '5',
      disponible: true,
      badge: 'Postre',
      tiempoPreparacion: '5 min',
      variantes: [],
      extras: [],
      metricas: { clics: 680, pedidos: 145 }
    }
  ]);

  const [estilo, setEstilo] = useState<EstiloRestaurante>({
    paleta: 'bistro',
    tipografia: 'jakarta',
    formaBoton: 'pill',
    textoBoton: 'Añadir a la Comanda',
    colorAcento: '#010102'
  });

  const [pedido, setPedido] = useState<PedidoItem[]>([]);

  const actualizarCategoria = (id: string, data: Partial<Categoria>) => {
    setCategorias(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const actualizarPlato = (id: string, data: Partial<Plato>) => {
    setPlatos(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const actualizarEstilo = (nuevoEstilo: EstiloRestaurante) => {
    setEstilo(nuevoEstilo);
  };

  const agregarAlPedido = (item: PedidoItem) => {
    setPedido(prev => {
      const existe = prev.find(p => p.platoId === item.platoId && p.varianteId === item.varianteId);
      if (existe) {
        return prev.map(p => 
          (p.platoId === item.platoId && p.varianteId === item.varianteId) 
            ? { ...p, cantidad: p.cantidad + item.cantidad } 
            : p
        );
      }
      return [...prev, item];
    });
  };

  const quitarDelPedido = (platoId: string) => {
    setPedido(prev => prev.filter(p => p.platoId !== platoId));
  };

  const limpiarPedido = () => {
    setPedido([]);
  };

  return (
    <RestaurantContext.Provider value={{
      categorias,
      platos,
      estilo,
      pedido,
      actualizarCategoria,
      actualizarPlato,
      actualizarEstilo,
      agregarAlPedido,
      quitarDelPedido,
      limpiarPedido
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant debe usarse dentro de RestaurantProvider');
  }
  return context;
}
