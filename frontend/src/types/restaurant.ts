export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  platos: Plato[];
  activa: boolean;
  horarioInicio?: string;
  horarioFin?: string;
  metricas: {
    clics: number;
    pedidos: number;
  };
}

export interface Plato {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  foto: string;
  categoriaId: string;
  disponible: boolean;
  badge?: 'Top 1' | 'Recomendación' | 'Entrante' | 'Postre' | 'Brasas' | 'Masa Madre';
  tiempoPreparacion?: string;
  variantes: Variante[];
  extras: Extra[];
  maridaje?: Maridaje;
  metricas: {
    clics: number;
    pedidos: number;
  };
}

export interface Variante {
  id: string;
  nombre: string;
  descripcion: string;
  precioExtra: number;
  obligatoria: boolean;
}

export interface Extra {
  id: string;
  nombre: string;
  descripcion: string;
  precioExtra: number;
}

export interface Maridaje {
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface EstiloRestaurante {
  paleta: 'bistro' | 'trattoria' | 'minimal' | 'street';
  tipografia: 'jakarta' | 'playfair' | 'inter';
  formaBoton: 'pill' | 'rounded' | 'square';
  textoBoton: string;
  colorAcento: string;
}

export interface PedidoItem {
  platoId: string;
  cantidad: number;
  varianteId?: string;
  extrasIds?: string[];
  maridaje?: boolean;
  notas?: string;
}
