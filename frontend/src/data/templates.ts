export type TemplateKey =
  | "gastronomy"
  | "services"
  | "beauty"
  | "wellness"
  | "education"
  | "handmade"
  | "events"
  | "pastry"
  | "fitness"
  | "clothing";
export type TemplateStep = {
  id: string;
  title: string;
  tasks: string[];
  tools: string[];
  tip: string;
  example: string;
  resource: { name: string; content: string };
};
export type BusinessTemplate = {
  key: TemplateKey;
  name: string;
  entry: string;
  audience: string;
  offer: string;
  steps: TemplateStep[];
};
type Seed = {
  key: TemplateKey;
  name: string;
  entry: string;
  audience: string;
  offer: string;
  tasks: [string[], string[], string[], string[], string[]];
  tips: [string, string, string, string, string];
  examples: [string, string, string, string, string];
};
const seeds: Seed[] = [
  {
    key: "gastronomy",
    name: "Restaurante",
    entry: "Menú breve + pedidos y reservas",
    audience: "Personas que almuerzan cerca del local",
    offer: "Menú de almuerzo con opción vegetariana",
    tasks: [
      [
        "Pregunta a cinco comensales cuánto tiempo tienen para almorzar",
        "Anota restricciones alimentarias que mencionan",
        "Observa qué platos dejan sin terminar",
      ],
      [
        "Elige un plato estrella con costo por porción",
        "Define radio de entrega y tiempo real de preparación",
        "Escribe ingredientes, alérgenos y precio final",
      ],
      [
        "Compara menú individual, combo y suscripción semanal",
        "Diseña tres fotos con luz de ventana",
        "Redacta respuestas sobre delivery y disponibilidad",
      ],
      [
        "Publica un menú de cinco platos con precios",
        "Abre cupos de reserva según mesas y turnos",
        "Prueba un pedido desde un teléfono ajeno",
      ],
      [
        "Registra pedidos recibidos y entregados a tiempo",
        "Pregunta qué dificultó elegir un plato",
        "Ajusta el menú según margen y desperdicio",
      ],
    ],
    tips: [
      "Pregunta por la última comida comprada, no por intenciones.",
      "Incluye envase y reparto en el costo.",
      "Evita descuentos que eliminen el margen.",
      "Muestra el costo de delivery antes de confirmar.",
      "Compara días similares antes de cambiar precios.",
    ],
    examples: [
      "Una oficinista tiene 35 minutos y busca un almuerzo que llegue caliente.",
      "Arroz con pollo + bebida; recojo de 12 a 2, entrega dentro de 2 km.",
      "Foto del plato completo, detalle de ingredientes y empaque.",
      "Menú del día → elegir plato → confirmar dirección → acordar pago.",
      "Tres personas preguntaron por porciones: agrega foto junto a cubiertos.",
    ],
  },
  {
    key: "services",
    name: "Servicios profesionales",
    entry: "Landing de servicio + solicitud de diagnóstico",
    audience: "Pequeños negocios que necesitan apoyo especializado",
    offer: "Asesoría inicial con entregable definido",
    tasks: [
      [
        "Entrevista a tres clientes sobre su último problema",
        "Anota qué intentaron antes de buscar ayuda",
        "Identifica quién decide y quién usa el servicio",
      ],
      [
        "Define un problema y un entregable concreto",
        "Escribe alcance, plazos y exclusiones",
        "Calcula horas disponibles y precio mínimo",
      ],
      [
        "Diseña una asesoría breve y un paquete completo",
        "Prepara un caso de trabajo con permiso",
        "Redacta preguntas de diagnóstico",
      ],
      [
        "Publica alcance, proceso y llamada de contacto",
        "Abre horarios para el diagnóstico",
        "Prepara una propuesta con hitos y condiciones",
      ],
      [
        "Mide consultas que llegan a diagnóstico",
        "Pregunta qué parte del alcance fue confusa",
        "Ajusta propuesta según las objeciones repetidas",
      ],
    ],
    tips: [
      "Busca hechos recientes, no opiniones generales.",
      "Promete entregables que puedas controlar.",
      "Anonimiza los casos sin permiso de publicación.",
      "Aclara si el diagnóstico tiene costo.",
      "Distingue consultas, propuestas y contratos firmados.",
    ],
    examples: [
      "Una tienda pierde tiempo conciliando ventas de WhatsApp.",
      "Sesión de 60 minutos + una hoja de proceso en 48 horas.",
      "Paquete inicial: diagnóstico; paquete mensual: revisión y seguimiento.",
      "Reservar diagnóstico con nombre, correo y problema principal.",
      "Varias consultas piden implementación: separa ese servicio de la asesoría.",
    ],
  },
  {
    key: "beauty",
    name: "Belleza / Estética",
    entry: "Galería de trabajos + booking",
    audience: "Personas que buscan un servicio de belleza con horario fijo",
    offer: "Sesión de diseño de cejas o manicure",
    tasks: [
      [
        "Pregunta a cinco clientas cómo eligen un salón",
        "Anota dudas sobre duración, higiene y resultados",
        "Revisa por qué se cancelaron las últimas citas",
      ],
      [
        "Elige un servicio de entrada y su duración",
        "Define precio, cuidados y política de cancelación",
        "Reserva tiempo de limpieza entre citas",
      ],
      [
        "Selecciona trabajos reales con autorización",
        "Diseña paquetes sin ocultar servicios adicionales",
        "Escribe respuestas sobre mantenimiento del resultado",
      ],
      [
        "Publica galería sin filtros que alteren el resultado",
        "Abre horarios con tiempo de preparación",
        "Prueba reserva y confirmación desde otro móvil",
      ],
      [
        "Mide citas completadas frente a reservadas",
        "Pregunta si el resultado coincidió con las fotos",
        "Ajusta horarios según demoras y cancelaciones",
      ],
    ],
    tips: [
      "No supongas que todas buscan el precio más bajo.",
      "Incluye limpieza y preparación en el horario.",
      "Solicita permiso para publicar rostros o manos.",
      "Indica qué incluye el precio mostrado.",
      "Evalúa satisfacción y puntualidad por separado.",
    ],
    examples: [
      "Una clienta prioriza terminar antes de recoger a su hija.",
      "Manicure de 45 minutos + 15 minutos para preparar el puesto.",
      "Galería de tres estilos: natural, color liso y diseño.",
      "Elegir estilo → elegir turno → recibir referencia de reserva.",
      "Si se repiten demoras de 10 minutos, amplía el espacio entre citas.",
    ],
  },
  {
    key: "wellness",
    name: "Salud / Bienestar",
    entry: "Landing informativa + blog + reservas",
    audience: "Personas que buscan atención o acompañamiento de bienestar",
    offer: "Primera sesión informativa con profesional identificado",
    tasks: [
      [
        "Pregunta qué información necesitan antes de reservar",
        "Anota barreras de horario, accesibilidad y ubicación",
        "Recoge dudas generales sin historias clínicas",
      ],
      [
        "Define el servicio y las credenciales que lo respaldan",
        "Aclara duración, modalidad y límites de atención",
        "Separa el contacto administrativo de datos de salud",
      ],
      [
        "Propón tres artículos educativos relacionados con el servicio",
        "Diseña una presentación clara del profesional",
        "Prepara respuestas sobre la primera visita",
      ],
      [
        "Publica credenciales, ubicación y condiciones de atención",
        "Publica un artículo educativo revisado por el responsable",
        "Abre reservas solicitando solo datos de contacto",
      ],
      [
        "Mide reservas completadas y dudas administrativas",
        "Pregunta si la información previa fue suficiente",
        "Revisa contenido y formularios con el profesional",
      ],
    ],
    tips: [
      "No solicites diagnósticos por un formulario público.",
      "Evita prometer curas o resultados garantizados.",
      "Distingue información educativa de consejo personalizado.",
      "Los datos clínicos necesitan un canal específico y autorizado.",
      "No publiques testimonios sensibles sin consentimiento.",
    ],
    examples: [
      "La persona quiere saber si la atención es virtual y cuánto dura.",
      "Primera consulta de 45 minutos; profesional y credenciales visibles.",
      "Artículo: qué esperar de tu primera sesión, sin recomendaciones clínicas.",
      "Página informativa → elegir turno → contacto administrativo.",
      "Varias personas preguntan por accesibilidad: añade esa información al sitio.",
    ],
  },
  {
    key: "education",
    name: "Educación / Cursos",
    entry: "Página del curso + plataforma + membresía",
    audience: "Personas que quieren aprender una habilidad con acompañamiento",
    offer: "Curso práctico con una primera lección de muestra",
    tasks: [
      [
        "Entrevista a cinco posibles estudiantes sobre su nivel",
        "Pregunta qué les hizo abandonar otros cursos",
        "Identifica horarios y dispositivos disponibles",
      ],
      [
        "Escribe un resultado de aprendizaje observable",
        "Define requisitos, módulos y duración",
        "Aclara evaluación, acceso y condiciones de la membresía",
      ],
      [
        "Diseña una lección de muestra con ejercicio",
        "Compara curso único y membresía mensual",
        "Planifica una sesión de preguntas",
      ],
      [
        "Publica temario y muestra del curso",
        "Configura acceso del alumnado en la plataforma elegida",
        "Prueba inscripción, bienvenida y baja de membresía",
      ],
      [
        "Mide inscripción, primera lección y ejercicio entregado",
        "Pregunta dónde se atascaron los estudiantes",
        "Revisa el módulo con más abandono",
      ],
    ],
    tips: [
      "La falta de tiempo puede ser más importante que el precio.",
      "Describe una habilidad, no solo horas de video.",
      "Usa una muestra representativa del curso completo.",
      "Explica renovación y cancelación antes del pago.",
      "Mide aprendizaje además de inscripciones.",
    ],
    examples: [
      "Una emprendedora estudia desde el móvil durante 20 minutos por noche.",
      "Al finalizar, prepara un presupuesto de su propio negocio.",
      "Lección gratuita: registrar tres costos en una hoja.",
      "Temario → muestra → inscripción → acceso a plataforma autorizada.",
      "Si el ejercicio se abandona, agrega un ejemplo resuelto y una revisión.",
    ],
  },
  {
    key: "handmade",
    name: "Artesanal / Hecho a mano",
    entry: "Catálogo + historia del proceso",
    audience: "Personas que compran piezas únicas o regalos personalizados",
    offer: "Colección pequeña hecha a mano",
    tasks: [
      [
        "Pregunta para qué ocasión compran piezas artesanales",
        "Anota dudas sobre materiales, medidas y cuidados",
        "Identifica cuánto esperan por una personalización",
      ],
      [
        "Selecciona cinco piezas que puedas reproducir",
        "Calcula material, trabajo, empaque y envío",
        "Define variaciones y plazo de fabricación",
      ],
      [
        "Cuenta el origen de una pieza sin inventar tradiciones",
        "Diseña fotos de escala y detalle",
        "Propón una edición pequeña y una opción personalizada",
      ],
      [
        "Publica catálogo con medidas y materiales",
        "Muestra el proceso de fabricación",
        "Prueba solicitud, confirmación del diseño y envío",
      ],
      [
        "Registra piezas consultadas y vendidas",
        "Pregunta si tamaño y textura coincidieron con las fotos",
        "Ajusta plazos según el tiempo real de producción",
      ],
    ],
    tips: [
      "Pregunta por compras pasadas y presupuesto real.",
      "Tu tiempo de trabajo forma parte del precio.",
      "La historia debe explicar decisiones reales del proceso.",
      "No ofrezcas stock inmediato de piezas por fabricar.",
      "Separa interés por una foto de un pedido confirmado.",
    ],
    examples: [
      "Una compradora busca un regalo pequeño que pueda enviar a otra ciudad.",
      "Taza de cerámica de 250 ml; fabricación de 10 días.",
      "Video de modelado + foto en mano para mostrar tamaño.",
      "Elegir pieza → acordar personalización → confirmar plazo y pago.",
      "Si preguntan por lavavajillas, agrega instrucciones de cuidado visibles.",
    ],
  },
  {
    key: "events",
    name: "Eventos / Fotografía",
    entry: "Portfolio + cotizador",
    audience: "Personas que organizan eventos y comparan coberturas",
    offer: "Cobertura fotográfica con horas y entrega definidas",
    tasks: [
      [
        "Pregunta qué momentos desean conservar del evento",
        "Anota cómo compararon fotógrafos y presupuestos",
        "Identifica fecha, sede y número de asistentes",
      ],
      [
        "Define horas de cobertura y entregables",
        "Aclara traslados, edición y plazo de entrega",
        "Establece reserva de fecha y política de cambios",
      ],
      [
        "Selecciona una serie completa de un evento autorizado",
        "Diseña tres paquetes comparables",
        "Prepara preguntas para cotizar sin llamadas innecesarias",
      ],
      [
        "Publica portfolio por tipo de evento",
        "Crea cotizador con fecha, sede, horas y servicios",
        "Prueba propuesta y bloqueo de fecha disponible",
      ],
      [
        "Mide solicitudes que se convierten en propuestas",
        "Pregunta qué datos faltaban para decidir",
        "Ajusta paquetes según solicitudes recurrentes",
      ],
    ],
    tips: [
      "No asumas que todas las personas quieren el mismo estilo.",
      "Evita paquetes con entregables ambiguos.",
      "Muestra consistencia de una cobertura completa.",
      "Una cotización no confirma la fecha hasta acordar condiciones.",
      "No publiques imágenes de invitados sin los permisos necesarios.",
    ],
    examples: [
      "Una pareja busca fotos naturales y entrega antes de su viaje.",
      "Cobertura de cuatro horas, galería editada y entrega en 20 días.",
      "Portfolio con preparación, ceremonia y celebración del mismo evento.",
      "Fecha → lugar → horas → solicitud de propuesta personalizada.",
      "Muchas consultas piden una hora extra: añade su precio a la propuesta.",
    ],
  },
  {
    key: "pastry",
    name: "Repostería / Food",
    entry: "Catálogo + pedidos anticipados",
    audience: "Personas que encargan postres para celebraciones",
    offer: "Torta personalizada por tamaño y fecha",
    tasks: [
      [
        "Pregunta para cuántas personas compran el postre",
        "Anota restricciones e ingredientes que consultan",
        "Identifica con cuánta anticipación suelen encargar",
      ],
      [
        "Define tamaños, sabores y decoración incluidos",
        "Calcula capacidad de producción por fecha",
        "Aclara anticipo, recogida y conservación",
      ],
      [
        "Diseña tres combinaciones fáciles de elegir",
        "Fotografía porciones y tamaños reales",
        "Redacta una guía de personalización",
      ],
      [
        "Publica catálogo con porciones y precios base",
        "Abre pedidos según capacidad y anticipación mínima",
        "Prueba confirmación de diseño, fecha y anticipo",
      ],
      [
        "Registra pedidos entregados sin retraso",
        "Pregunta si las porciones fueron suficientes",
        "Ajusta catálogo según tiempo de decoración y merma",
      ],
    ],
    tips: [
      "No garantices ausencia de alérgenos si no puedes evitar contaminación cruzada.",
      "Limita pedidos según tu capacidad real de horneado.",
      "Muestra lo incluido y lo que se cobra aparte.",
      "Confirma por escrito el texto y la decoración.",
      "Analiza rentabilidad incluyendo pruebas y desperdicio.",
    ],
    examples: [
      "Una familia necesita 15 porciones para el sábado y recoger el viernes.",
      "Torta de 15 porciones; pedido con 72 horas de anticipación.",
      "Chocolate, vainilla y frutas con tres opciones de acabado.",
      "Elegir tamaño → fecha → personalización → confirmar disponibilidad.",
      "Si sobran porciones con frecuencia, mejora la guía de tamaños.",
    ],
  },
  {
    key: "fitness",
    name: "Fitness / Entrenamiento",
    entry: "Planes + seguimiento",
    audience: "Personas que quieren entrenar de forma constante",
    offer: "Plan inicial con acompañamiento y revisión",
    tasks: [
      [
        "Pregunta por horarios, equipo y experiencia entrenando",
        "Identifica qué interrumpe la constancia",
        "Anota necesidades de accesibilidad sin diagnosticar",
      ],
      [
        "Define a quién puede atender el entrenador",
        "Describe sesiones, seguimiento y límites del plan",
        "Establece una evaluación inicial por canal adecuado",
      ],
      [
        "Diseña una semana de muestra con opciones de nivel",
        "Compara sesiones individuales y grupos pequeños",
        "Prepara un registro simple de asistencia",
      ],
      [
        "Publica credenciales y alcance del acompañamiento",
        "Abre reservas de evaluación inicial",
        "Configura seguimiento privado de sesiones y comentarios",
      ],
      [
        "Mide asistencia y continuidad del plan",
        "Pregunta si horarios y dificultad fueron adecuados",
        "Adapta acompañamiento dentro de la competencia profesional",
      ],
    ],
    tips: [
      "Escucha barreras prácticas sin culpar a la persona.",
      "No prometas cambios corporales garantizados.",
      "Las adaptaciones deben estar a cargo de personal competente.",
      "Los datos de salud no van en una página pública.",
      "Celebra constancia sin publicar información personal.",
    ],
    examples: [
      "Una persona dispone de dos tardes por semana y entrena en casa.",
      "Dos sesiones semanales con revisión de progreso cada mes.",
      "Semana de muestra con explicación del equipo necesario.",
      "Conocer plan → reservar evaluación → acordar seguimiento privado.",
      "Si hay ausencias por horario, ofrece un turno que sí puedan mantener.",
    ],
  },
  {
    key: "clothing",
    name: "Tienda de ropa",
    entry: "Ecommerce + carrito",
    audience: "Personas que compran ropa y necesitan acertar con la talla",
    offer: "Colección con stock y medidas por prenda",
    tasks: [
      [
        "Pregunta cómo eligieron talla en su última compra",
        "Anota motivos de devolución y dudas de materiales",
        "Identifica zonas y tiempos de entrega esperados",
      ],
      [
        "Selecciona prendas con stock confirmado por variante",
        "Prepara tabla de medidas de cada modelo",
        "Define cambios, envío y precio final",
      ],
      [
        "Diseña fotos de frente, espalda y detalle",
        "Compara conjuntos y prendas individuales",
        "Escribe fichas que expliquen tela y ajuste",
      ],
      [
        "Publica catálogo en tu plataforma de ecommerce",
        "Configura tallas, inventario, carrito y pago autorizado",
        "Prueba compra completa y confirmación con un pedido de prueba",
      ],
      [
        "Mide carritos, compras y devoluciones",
        "Pregunta si talla y color coincidieron con la ficha",
        "Corrige las fichas con más dudas o cambios",
      ],
    ],
    tips: [
      "Las tallas nominales cambian entre marcas; usa medidas.",
      "No vendas variantes sin inventario disponible.",
      "Evita retoques que cambien el color de la prenda.",
      "Prueba costos de envío y cambios antes de abrir la tienda.",
      "Separa abandono del carrito de fallos en el pago.",
    ],
    examples: [
      "Una compradora compara ancho de busto con una prenda que ya tiene.",
      "Camisa S: busto 92 cm; M: 98 cm; stock por color.",
      "Foto de la tela junto con guía de ajuste y altura de la modelo autorizada.",
      "Elegir talla → carrito → envío → pago en plataforma conectada.",
      "Si una prenda genera cambios, revisa medidas y descripción del corte.",
    ],
  },
];
const phases = ["Empatizar", "Definir", "Idear", "Prototipar", "Probar"];
const tools = [
  ["Asistente FOR U", "Entrevistas"],
  ["Contenido con IA", "Hoja de costos"],
  ["Tus imágenes", "Teleprompter"],
  ["Tu página", "Reservas y pedidos"],
  ["Tus resultados", "Calendario"],
];
export const businessTemplates: BusinessTemplate[] = seeds.map((seed) => ({
  key: seed.key,
  name: seed.name,
  entry: seed.entry,
  audience: seed.audience,
  offer: seed.offer,
  steps: seed.tasks.map((tasks, index) => ({
    id: "dt-" + index,
    title: phases[index],
    tasks,
    tools:
      index === 3 && seed.key === "clothing"
        ? ["Tu página", "Plataforma de ecommerce con carrito"]
        : index === 3 && seed.key === "education"
          ? ["Tu página", "Plataforma de cursos y membresía"]
          : tools[index],
    tip: seed.tips[index],
    example: seed.examples[index],
    resource: {
      name: seed.key + "-" + phases[index].toLowerCase() + ".md",
      content: [
        "# " + seed.name + " · " + phases[index],
        "Entrada de venta: " + seed.entry,
        "",
        "## Hoja de trabajo",
        ...tasks.map(
          (task, i) =>
            "### " +
            (i + 1) +
            ". " +
            task +
            "\nRespuesta / evidencia: \nResponsable: \nFecha: \n",
        ),
        "## Consejo",
        seed.tips[index],
        "## Ejemplo ilustrativo",
        seed.examples[index],
        "## Decisión al terminar",
        "Qué aprendí:",
        "Qué cambiaré:",
        "Cómo comprobaré el resultado:",
      ].join("\n"),
    },
  })),
}));
export function getBusinessTemplate(key?: string) {
  return businessTemplates.find((template) => template.key === key);
}
