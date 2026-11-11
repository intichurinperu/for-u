export interface ConversationStep {
  id: string;
  question: string;
  hint: string;
  placeholder: string;
  contextualActions: string[];
}

export const MARKETING_FLOW: ConversationStep[] = [
  {
    id: 'idealClient',
    question: 'Imagina a tu cliente ideal. No pensemos en edad ni dónde vive. ¿En qué situación se encuentra cuando te necesita?',
    hint: 'Puedes agregar varias ideas sueltas. No hay respuesta incorrecta.',
    placeholder: 'Ej: Alguien que quiere regalar algo especial pero no sabe qué...',
    contextualActions: ['🎬 Grabar video para este cliente', '📝 Crear post sobre esta situación']
  },
  {
    id: 'story',
    question: '¿Cómo nació tu emprendimiento? ¿Qué te inspiró a empezar? Cuéntamelo como a un amigo.',
    hint: 'Esta historia será el alma de tu landing.',
    placeholder: 'Ej: Todo empezó cuando mi abuela me enseñó a hacer alfajores...',
    contextualActions: ['📖 Escribir historia para la web', '🎙️ Grabar audio contando esto']
  },
  {
    id: 'testimonials',
    question: '¿Qué te dicen normalmente tus clientes o amigos sobre lo que haces? ¿Qué palabras usan?',
    hint: 'Pueden ser frases reales o lo que sientes que dicen de ti.',
    placeholder: 'Ej: "Tus alfajores me recuerdan a mi infancia"...',
    contextualActions: ['✨ Crear carrusel de testimonios']
  },
  {
    id: 'uniqueValue',
    question: '¿Qué te hace única? ¿Qué tienes que nadie más tiene?',
    hint: 'Puede ser un ingrediente especial, tu historia, tu ubicación, tu forma de hacer las cosas...',
    placeholder: 'Ej: Uso ingredientes 100% del Valle Sagrado y recetas de mi abuela...',
    contextualActions: [' Crear headline principal']
  },
  {
    id: 'products',
    question: '¿Qué ofreces exactamente? Nombra tus productos o servicios con precios si los tienes.',
    hint: 'Lista todo lo que vendes, aunque sea borrador.',
    placeholder: 'Ej: Alfajor clásico S/5, Alfajor de chocolate S/6...',
    contextualActions: ['🍽️ Armar menú visual']
  },
  {
    id: 'style',
    question: '¿Cómo quieres que se sienta tu marca? ¿Minimalista, cálida, divertida, lujosa?',
    hint: 'Puedes describirlo o mencionar referencias.',
    placeholder: 'Ej: Quiero que se sienta cálida, artesanal, con tonos tierra...',
    contextualActions: ['🎨 Ver paletas sugeridas']
  },
  {
    id: 'cta',
    question: '¿Qué quieres que haga la persona al entrar a tu landing? ¿Escribirte, reservar, comprar?',
    hint: 'Este será el botón principal.',
    placeholder: 'Ej: Que me escriban por WhatsApp para hacer pedidos...',
    contextualActions: ['🚀 Generar landing completa']
  }
];

export const FINANZAS_FLOW: ConversationStep[] = [
  {
    id: 'oferta',
    question: '¿Cuáles son tus productos o servicios principales? Nómbralos uno por uno.',
    hint: 'Lista todo lo que vendes, aunque sea borrador.',
    placeholder: 'Ej: Alfajor clásico, caja de 6 unidades, evento personalizado...',
    contextualActions: ['📊 Crear tabla de costos']
  },
  {
    id: 'costos',
    question: '¿Cuánto te cuesta producir cada uno? Incluye materiales, empaque y tu tiempo.',
    hint: 'Sé honesta, tu tiempo vale. Si no sabes el exacto, pon un estimado.',
    placeholder: 'Ej: Alfajor clásico: S/2.50 en ingredientes + 15 min de mi tiempo...',
    contextualActions: ['⏱️ Calcular valor de mi hora']
  },
  {
    id: 'precios',
    question: '¿A cuánto los vendes actualmente?',
    hint: 'Si aún no tienes precios, pon cuánto te gustaría cobrar.',
    placeholder: 'Ej: Alfajor clásico a S/5...',
    contextualActions: ['💰 Calcular margen real']
  },
  {
    id: 'tiempo',
    question: '¿Cuánto tiempo te toma cada producto o servicio? Sé honesta.',
    hint: 'Incluye preparación, empaque, entrega y atención al cliente.',
    placeholder: 'Ej: 20 min por alfajor + 10 min de empaque...',
    contextualActions: ['📅 Optimizar mi tiempo']
  },
  {
    id: 'gastosFijos',
    question: '¿Cuáles son tus gastos fijos mensuales? Alquiler, luz, internet, suscripciones...',
    hint: 'Todo lo que pagas sí o sí cada mes.',
    placeholder: 'Ej: Alquiler S/300, luz S/80, internet S/60...',
    contextualActions: ['📈 Calcular punto de equilibrio']
  },
  {
    id: 'meta',
    question: '¿Cuánto quieres ganar al mes? Tu meta real, no la tímida.',
    hint: 'Piensa en grande. Luego lo ajustamos.',
    placeholder: 'Ej: S/3,000 al mes...',
    contextualActions: ['🎯 Plan de ventas mensual']
  },
  {
    id: 'precioIdeal',
    question: '¿Qué precio te haría sentir orgullosa? El que refleja tu valor real.',
    hint: 'Si cobras menos, ¿qué tendrías que sacrificar?',
    placeholder: 'Ej: S/7 por alfajor, que es lo que realmente vale...',
    contextualActions: ['✨ Ajustar precios con estrategia']
  }
];

export const LOGISTICA_FLOW: ConversationStep[] = [
  {
    id: 'semanaIdeal',
    question: '¿Cómo es tu semana ideal? ¿Qué días trabajas, qué días descansas?',
    hint: 'Sé realista. No puedes trabajar 7 días.',
    placeholder: 'Ej: Lunes a viernes de 9am a 6pm, sábados medio día...',
    contextualActions: ['📅 Crear calendario semanal']
  },
  {
    id: 'tiempoTareas',
    question: '¿Cuánto tiempo te toma cada tarea clave? Preparar, entregar, responder mensajes...',
    hint: 'Incluye todo lo que haces en un día típico.',
    placeholder: 'Ej: Preparar pedidos 2h, responder WhatsApp 1h...',
    contextualActions: ['⏱️ Optimizar rutina diaria']
  },
  {
    id: 'stock',
    question: '¿Qué necesitas tener siempre en stock? Ingredientes, materiales, insumos...',
    hint: 'Lo que no puede faltarte nunca.',
    placeholder: 'Ej: Harina, dulce de leche, cajas, etiquetas...',
    contextualActions: ['📦 Crear lista de inventario mínimo']
  },
  {
    id: 'canales',
    question: '¿Cómo recibes los pedidos hoy? WhatsApp, Instagram, llamada, web...',
    hint: 'Todos los canales por los que te contactan.',
    placeholder: 'Ej: 80% WhatsApp, 20% Instagram...',
    contextualActions: ['🔗 Unificar canales']
  },
  {
    id: 'entrega',
    question: '¿Cómo entregas tu producto o servicio? Delivery, recogida, presencial, online...',
    hint: 'Describe el proceso completo.',
    placeholder: 'Ej: Delivery en Lima, recogida en mi local...',
    contextualActions: ['🚚 Optimizar logística de entrega']
  },
  {
    id: 'horarios',
    question: '¿Qué días y horarios atiendes?',
    hint: 'Tus horarios reales de atención al cliente.',
    placeholder: 'Ej: Lun-Vie 9am-7pm, Sáb 10am-2pm...',
    contextualActions: [' Configurar horarios automáticos']
  },
  {
    id: 'planB',
    question: '¿Qué pasa si algo sale mal? ¿Tienes plan B?',
    hint: 'Enfermedad, falta de insumos, pedido urgente...',
    placeholder: 'Ej: Si me enfermo, mi hermana me reemplaza...',
    contextualActions: ['️ Crear protocolo de contingencia']
  }
];

export const OPERACIONES_FLOW: ConversationStep[] = [
  {
    id: 'whatsapp',
    question: '¿Cuál es tu WhatsApp de negocio? El que verán tus clientes.',
    hint: 'Incluye código de país. Ej: +51 999 888 777',
    placeholder: 'Ej: +51 987 654 321...',
    contextualActions: ['📱 Configurar WhatsApp Business']
  },
  {
    id: 'canalesContacto',
    question: '¿Cómo quieres que te contacten? Solo WhatsApp, también Instagram, email, formulario...',
    hint: 'Todos los canales que quieres ofrecer.',
    placeholder: 'Ej: WhatsApp y formulario web...',
    contextualActions: ['🔗 Integrar todos los canales']
  },
  {
    id: 'datosCliente',
    question: '¿Qué información necesitas de cada cliente antes de atenderlo?',
    hint: 'Nombre, fecha, detalles del pedido, dirección...',
    placeholder: 'Ej: Nombre, dirección, tipo de alfajor, cantidad...',
    contextualActions: ['📝 Crear formulario de pedido']
  },
  {
    id: 'tiempoRespuesta',
    question: '¿Cuánto tiempo tardas en responder normalmente?',
    hint: 'Sé honesta. Esto define las expectativas del cliente.',
    placeholder: 'Ej: 2 horas en horario de trabajo...',
    contextualActions: ['⚡ Configurar respuestas automáticas']
  },
  {
    id: 'respuestasTipicas',
    question: '¿Tienes respuestas típicas que repites mucho? Copia y pégalas aquí.',
    hint: 'Precios, horarios, ubicación, ingredientes...',
    placeholder: 'Ej: "Sí, hacemos delivery en Lima. El costo es S/5..."',
    contextualActions: [' Crear bot de respuestas']
  },
  {
    id: 'flujoAtencion',
    question: '¿Qué pasa después de que alguien te contacta? Describe el flujo paso a paso.',
    hint: 'Desde el primer mensaje hasta la entrega.',
    placeholder: 'Ej: 1) Me escriben, 2) Confirmo pedido, 3) Cobro 50%...',
    contextualActions: ['🔄 Automatizar flujo completo']
  },
  {
    id: 'automatizar',
    question: '¿Qué te gustaría automatizar? Lo que te quita tiempo y podrías delegar.',
    hint: 'Respuestas, recordatorios, seguimiento, facturación...',
    placeholder: 'Ej: Respuestas automáticas fuera de horario...',
    contextualActions: ['🤖 Configurar automatizaciones']
  }
];