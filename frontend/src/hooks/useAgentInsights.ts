import { useState, useEffect } from 'react';

export interface ContenidoSugerido {
  tipo: 'Post' | 'Historia' | 'Reel' | 'Carrusel' | 'Email' | 'Guion';
  titulo: string;
  descripcion: string;
  agente: string;
  rubro: string;
  momentoVenta: 'Descubrimiento' | 'Consideración' | 'Decisión' | 'Fidelización';
}

const PLANTILLAS_POR_RUBRO: Record<string, ContenidoSugerido[]> = {
  restaurante: [
    { tipo: 'Reel', titulo: 'El proceso detrás de tu plato estrella', descripcion: 'Muestra cómo preparas tu plato más pedido. La gente ama ver el detrás de escena.', agente: 'Munay', rubro: 'restaurante', momentoVenta: 'Descubrimiento' },
    { tipo: 'Carrusel', titulo: '3 razones para elegirnos', descripcion: 'Usa lo que tus clientes dicen de ti (testimonios que ya compartiste con Munay).', agente: 'Munay', rubro: 'restaurante', momentoVenta: 'Consideración' },
    { tipo: 'Post', titulo: 'Presentación del chef/equipo', descripcion: 'La historia de cómo nació el restaurante conecta emocionalmente.', agente: 'Munay', rubro: 'restaurante', momentoVenta: 'Descubrimiento' },
    { tipo: 'Historia', titulo: 'Menú del día con precio', descripcion: 'Publica tu oferta diaria con el precio que ya calculaste con Shippo.', agente: 'Shippo', rubro: 'restaurante', momentoVenta: 'Decisión' },
    { tipo: 'Post', titulo: 'Horarios y cómo llegar', descripcion: 'Información práctica que Oliver ya tiene organizada.', agente: 'Oliver', rubro: 'restaurante', momentoVenta: 'Decisión' },
    { tipo: 'Email', titulo: 'Receta exclusiva para suscriptores', descripcion: 'Fideliza compartiendo una receta. Emma puede ayudarte a automatizar el envío.', agente: 'Emma', rubro: 'restaurante', momentoVenta: 'Fidelización' },
  ],
  tienda: [
    { tipo: 'Reel', titulo: 'Unboxing de tu producto', descripcion: 'Muestra cómo empacas un pedido. Genera confianza y deseo.', agente: 'Munay', rubro: 'tienda', momentoVenta: 'Descubrimiento' },
    { tipo: 'Carrusel', titulo: 'Top 5 productos más vendidos', descripcion: 'Usa los datos de ventas que Shippo tiene.', agente: 'Shippo', rubro: 'tienda', momentoVenta: 'Consideración' },
    { tipo: 'Historia', titulo: 'Nuevo ingreso con precio', descripcion: 'Anuncia novedades con el precio ya calculado.', agente: 'Shippo', rubro: 'tienda', momentoVenta: 'Decisión' },
    { tipo: 'Post', titulo: 'Testimonio de cliente real', descripcion: 'Usa las frases que tus clientes te dijeron (Munay las tiene).', agente: 'Munay', rubro: 'tienda', momentoVenta: 'Consideración' },
    { tipo: 'Reel', titulo: 'Cómo usamos X producto', descripcion: 'Tutorial rápido. Oliver te ayuda a planificar la frecuencia.', agente: 'Oliver', rubro: 'tienda', momentoVenta: 'Descubrimiento' },
    { tipo: 'Email', titulo: 'Oferta exclusiva para clientes frecuentes', descripcion: 'Emma te ayuda a segmentar y enviar.', agente: 'Emma', rubro: 'tienda', momentoVenta: 'Fidelización' },
  ],
  hospitality: [
    { tipo: 'Reel', titulo: 'Tour virtual por el espacio', descripcion: 'Muestra las habitaciones y áreas comunes. Munay te ayuda con el guion.', agente: 'Munay', rubro: 'hospedaje', momentoVenta: 'Descubrimiento' },
    { tipo: 'Carrusel', titulo: 'Experiencias cerca del hospedaje', descripcion: 'Oliver tiene la logística de tours cercanos.', agente: 'Oliver', rubro: 'hospedaje', momentoVenta: 'Consideración' },
    { tipo: 'Post', titulo: 'Reseña de huésped con foto', descripcion: 'Prueba social poderosa. Munay tiene los testimonios.', agente: 'Munay', rubro: 'hospedaje', momentoVenta: 'Decisión' },
    { tipo: 'Historia', titulo: 'Precio por noche + qué incluye', descripcion: 'Transparencia que convierte. Shippo tiene los números.', agente: 'Shippo', rubro: 'hospedaje', momentoVenta: 'Decisión' },
    { tipo: 'Email', titulo: 'Guía de llegada para huéspedes confirmados', descripcion: 'Emma automatiza el envío post-reserva.', agente: 'Emma', rubro: 'hospedaje', momentoVenta: 'Fidelización' },
  ],
  tourism: [
    { tipo: 'Reel', titulo: 'Momento mágico del tour', descripcion: 'El instante que hace llorar a los participantes. Munay lo identificó en tu conversación.', agente: 'Munay', rubro: 'turismo', momentoVenta: 'Descubrimiento' },
    { tipo: 'Carrusel', titulo: 'Qué incluye el tour (visual)', descripcion: 'Desglose claro. Oliver tiene la logística detallada.', agente: 'Oliver', rubro: 'turismo', momentoVenta: 'Consideración' },
    { tipo: 'Post', titulo: 'Testimonio de viajero', descripcion: 'Historias reales de quienes vivieron la experiencia.', agente: 'Munay', rubro: 'turismo', momentoVenta: 'Decisión' },
    { tipo: 'Historia', titulo: 'Cupos disponibles esta semana', descripcion: 'Urgencia + disponibilidad. Oliver maneja el calendario.', agente: 'Oliver', rubro: 'turismo', momentoVenta: 'Decisión' },
    { tipo: 'Email', titulo: 'Álbum de fotos post-tour', descripcion: 'Fidelización emocional. Emma lo envía automáticamente.', agente: 'Emma', rubro: 'turismo', momentoVenta: 'Fidelización' },
  ],
  courses: [
    { tipo: 'Reel', titulo: 'Snippet de una lección', descripcion: 'Muestra el valor antes de vender. Munay te ayuda con el guion.', agente: 'Munay', rubro: 'cursos', momentoVenta: 'Descubrimiento' },
    { tipo: 'Carrusel', titulo: 'Lo que aprenderás (módulos)', descripcion: 'Estructura clara del curso.', agente: 'Munay', rubro: 'cursos', momentoVenta: 'Consideración' },
    { tipo: 'Post', titulo: 'Transformación de un alumno', descripcion: 'Antes/después real. Munay tiene las historias.', agente: 'Munay', rubro: 'cursos', momentoVenta: 'Decisión' },
    { tipo: 'Historia', titulo: 'Precio + formas de pago', descripcion: 'Shippo tiene el pricing estratégico.', agente: 'Shippo', rubro: 'cursos', momentoVenta: 'Decisión' },
    { tipo: 'Email', titulo: 'Lección gratuita de muestra', descripcion: 'Emma automatiza la entrega del lead magnet.', agente: 'Emma', rubro: 'cursos', momentoVenta: 'Fidelización' },
  ],
};

export function useAgentInsights(projectId: string | null, rubro: string) {
  const [sugerencias, setSugerencias] = useState<ContenidoSugerido[]>([]);

  useEffect(() => {
    if (!rubro) return;
    
    // Obtener plantillas base del rubro
    let plantillasBase = [...(PLANTILLAS_POR_RUBRO[rubro.toLowerCase()] || PLANTILLAS_POR_RUBRO.restaurante)];
    
    // Conectar con los datos reales de la Pizarra
    // Asumimos que los datos pueden venir del AuthContext (user.id) para aislar por usuario en un caso real,
    // pero para la simulación leeremos las respuestas guardadas en localStorage o simuladas.
    try {
      const storedMunay = localStorage.getItem('pizarra_marketing_data');
      if (storedMunay) {
        const data = JSON.parse(storedMunay);
        if (data.clienteIdeal) {
           plantillasBase.unshift({
             tipo: 'Post',
             titulo: 'El regalo perfecto',
             descripcion: `💛 Munay sugiere: Crea un post sobre 'El regalo perfecto' basado en tu cliente ideal: ${data.clienteIdeal}`,
             agente: 'Munay',
             rubro: rubro,
             momentoVenta: 'Consideración'
           });
        }
      }

      const storedShippo = localStorage.getItem('pizarra_finanzas_data');
      if (storedShippo) {
         const data = JSON.parse(storedShippo);
         if (data.precioCalculado) {
            plantillasBase.unshift({
             tipo: 'Historia',
             titulo: 'Nuevo precio revelado',
             descripcion: `🦊 Shippo sugiere: Anuncia tu oferta estrella con el precio real que calculamos de ${data.precioCalculado}€.`,
             agente: 'Shippo',
             rubro: rubro,
             momentoVenta: 'Decisión'
           });
         }
      }
    } catch (e) {
      console.warn("No se pudieron leer las pizarras locales para insights.", e);
    }
    
    setSugerencias(plantillasBase);
  }, [projectId, rubro]);

  return sugerencias;
}
