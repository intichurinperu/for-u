/* Independent review model. No application imports, network, billing or publication. */
const ForUReviewModel = (() => {
  const moments = ['Dar a conocer', 'Conversar y conectar', 'Construir confianza', 'Presentar una oferta', 'Retomar el contacto', 'Fidelizar'];
  const routeOptions = {
    restaurant: { offer: ['Café y bebidas', 'Platos y menú', 'Postres', 'Lo definiré después'], people: ['Personas del barrio', 'Familias', 'Visitantes', 'Lo definiré después'], purpose: ['Crear un lugar de encuentro', 'Compartir nuestra cocina', 'Hacer más fácil una pausa'], sections: ['Menú', 'Nuestra historia', 'Cómo pedir', 'Ubicación y horarios', 'Preguntas frecuentes', 'Contacto', 'Testimonios'], delivery: ['En el local', 'Recojo', 'Delivery', 'Lo definiré después'] },
    ecommerce: { offer: ['Productos hechos por mí', 'Productos seleccionados', 'Un paquete de productos', 'Lo definiré después'], people: ['Personas que valoran el diseño', 'Una comunidad específica', 'Clientes que ya me conocen', 'Lo definiré después'], purpose: ['Hacer algo útil', 'Compartir lo que creamos', 'Resolver una necesidad cotidiana'], sections: ['Productos', 'Nuestra historia', 'Cómo comprar', 'Envíos y cambios', 'Preguntas frecuentes', 'Contacto', 'Testimonios'], delivery: ['En tienda', 'Recojo', 'Envío', 'Lo definiré después'] },
    tourism: { offer: ['Una experiencia guiada', 'Una ruta de aventura', 'Una experiencia cultural', 'Lo definiré después'], people: ['Viajeros independientes', 'Familias', 'Grupos pequeños', 'Lo definiré después'], purpose: ['Conectar personas y lugares', 'Compartir la cultura local', 'Crear experiencias cuidadas'], sections: ['Experiencias', 'Itinerario', 'Qué incluye', 'Condiciones y reservas', 'Nuestra historia', 'Contacto', 'Preguntas frecuentes'], delivery: ['Salida programada', 'Experiencia privada', 'Consulta previa', 'Lo definiré después'] },
    hospitality: { offer: ['Habitaciones', 'Una casa completa', 'Estadías con experiencia', 'Lo definiré después'], people: ['Parejas', 'Familias', 'Viajeros que buscan descanso', 'Lo definiré después'], purpose: ['Hacer que se sientan en casa', 'Crear un lugar para descansar', 'Conectar con el entorno'], sections: ['Habitaciones', 'Servicios', 'Cómo llegar', 'Condiciones de estadía', 'Nuestra historia', 'Contacto', 'Preguntas frecuentes'], delivery: ['Consulta de disponibilidad', 'Coordinación por mensaje', 'Lo definiré después'] },
    courses: { offer: ['Un curso', 'Un taller en vivo', 'Materiales y acompañamiento', 'Lo definiré después'], people: ['Personas que empiezan', 'Profesionales', 'Mi comunidad', 'Lo definiré después'], purpose: ['Compartir lo que sé', 'Ayudar a practicar', 'Hacer más accesible aprender'], sections: ['Cursos', 'Temario', 'Quién enseña', 'Materiales', 'Preguntas frecuentes', 'Contacto', 'Testimonios'], delivery: ['Contenido digital', 'Sesión en vivo', 'Acompañamiento', 'Lo definiré después'] },
    services: { offer: ['Un servicio', 'Una asesoría', 'Un paquete de servicios', 'Productos y servicios', 'Lo definiré después'], people: ['Emprendimientos', 'Personas independientes', 'Equipos', 'Lo definiré después'], purpose: ['Acompañar un cambio', 'Resolver un problema concreto', 'Compartir mi experiencia'], sections: ['Servicios y paquetes', 'Cómo trabajamos', 'Nuestra historia', 'Preguntas frecuentes', 'Contacto', 'Testimonios'], delivery: ['En persona', 'A distancia', 'Ambas modalidades', 'Lo definiré después'] }
  };
  const arr = value => Array.isArray(value) ? value : value ? [value] : [];
  const meaningful = value => typeof value === 'string' && value.trim() && !['Lo definiré después', 'Todavía no lo sé', 'Prefiero omitirlo'].includes(value);
  function derive(route, answers = {}) {
    const comfort = arr(answers.comfort), avoid = arr(answers.avoid), resources = arr(answers.resources);
    const noPhoto = !resources.includes('Fotos') && !resources.includes('Videos');
    const showFace = comfort.includes('Hablando a cámara') && !avoid.includes('Mostrar mi cara');
    const voice = comfort.includes('Usando mi voz') && !avoid.includes('Grabar mi voz');
    const short = answers.time === 'Sesiones breves';
    const format = showFace || voice ? 'story' : 'portrait';
    const style = noPhoto ? 'Composición tipográfica' : 'Tus recursos, en primer plano';
    const contentPath = showFace ? 'Guion breve → ensayo → grabación' : voice ? 'Texto claro → voz → portada' : 'Idea → texto y diseño → publicación';
    const reasons = [
      noPhoto ? 'No has elegido fotos: empezamos con tipografía y tu mensaje.' : 'Elegiste material propio: primero lo podrás ordenar en tu biblioteca.',
      avoid.includes('Mostrar mi cara') ? 'Prefieres no mostrar tu cara. No te pediremos hacerlo.' : showFace ? 'Te resulta cómodo hablar a cámara: tu guion estará cerca.' : voice ? 'Tu voz puede acompañar el diseño sin que tengas que aparecer a cámara.' : 'Puedes empezar escribiendo; grabar sigue siendo opcional.',
      short ? 'Elegiste sesiones breves: destacamos un solo paso cada vez.' : 'Tu ritmo es editable. Las fechas las decides tú.',
      arr(answers.tools).includes('Ninguna todavía') ? 'No necesitas otra herramienta: la ayuda aparece donde la necesitas.' : 'Aprovecharemos lo que ya conoces, sin obligarte a salir de FOR U.'
    ];
    const stage = answers.stage === 'Ya tengo un negocio' ? 'Operar' : answers.stage === 'Vengo a explorar' ? 'Explorar' : 'Dar forma';
    const next = answers.goal === 'Ordenar mi operación' ? 'operation' : answers.goal === 'Crear contenido' ? 'studio' : answers.goal === 'Vender una oferta' ? 'offers' : 'page';
    const phase = Math.max(0, moments.indexOf(answers.intent));
    const sections = arr(answers.sections).filter(x => routeOptions[route].sections.includes(x));
    const title = meaningful(answers.projectName) ? answers.projectName.trim() : 'Tu proyecto, a tu manera';
    const topic = meaningful(answers.offerCustom) ? answers.offerCustom.trim() : meaningful(answers.offering) ? answers.offering : '';
    const specs = [];
    const add = (id, area, text, tool, reason) => specs.push({ id, area, title: text, tool, reason, status: 'todo', date: '', acceptance: 'suggested' });
    if (next === 'operation') add('route-operation', 'operations', route === 'courses' ? 'Ordenar mi primer módulo' : route === 'services' ? 'Ordenar mis solicitudes' : 'Ordenar mi atención', 'operation', 'Elegiste ordenar la operación de un negocio que ya tiene recorrido.');
    if (next === 'offers') add('route-offer', 'marketing', 'Dar forma a mi oferta especial', 'offers', 'Elegiste vender una oferta: primero confirmaremos su beneficio y condiciones.');
    add('route-page', 'marketing', 'Revisar mi página preparada', 'page', sections.length ? 'Elegiste estas secciones: ' + sections.slice(0, 3).join(', ') + '.' : 'Tu página puede empezar con una estructura pequeña y ampliarse después.');
    add('route-content', 'marketing', voice || showFace ? 'Preparar mi primer guion' : 'Dar forma a mi primer contenido', 'studio', (short ? 'Tienes poco tiempo. ' : '') + (noPhoto ? 'Podemos empezar sin fotografías.' : 'Elegiste reutilizar tus materiales.') + ' ' + contentPath + '.');
    if (arr(answers.otherAreas).includes('Finanzas')) add('route-cost', 'finance', answers.cost === 'Sí' ? 'Revisar mis costos registrados' : 'Entender el costo de mi oferta', 'operation', 'Elegiste preparar Finanzas' + (answers.cost ? ' y sobre costos respondiste «' + answers.cost + '».' : '.'));
    if (arr(answers.otherAreas).includes('Logística')) add('route-logistics', 'logistics', 'Definir cómo llega mi oferta', 'operation', 'Elegiste preparar Logística' + (arr(answers.delivery).length ? ': ' + arr(answers.delivery).join(', ') + '.' : '.'));
    if (arr(answers.otherAreas).includes('Operaciones') && !specs.some(t => t.area === 'operations')) add('route-process', 'operations', 'Organizar mi siguiente solicitud', 'operation', 'Elegiste preparar Operaciones' + (answers.tracking ? ' y hoy organizas pendientes con «' + answers.tracking + '».' : '.'));
    if (resources.length && !resources.includes('Ninguno todavía') && answers.friction === 'Me cuesta organizarme') add('route-library', 'logistics', 'Ordenar mis materiales', 'library', 'Tienes material y elegiste organización como ayuda principal.');
    if (next === 'studio') specs.sort((a, b) => Number(b.id === 'route-content') - Number(a.id === 'route-content'));
    return { name: title, topic, stage, next, phase, format, style, contentPath, reasons, sections, tasks: specs, noPhoto, short, showFace, voice, diffusion: answers.diffusion || 'Por decidir', channel: answers.channel || 'Por decidir' };
  }
  function mergeTasks(existing, proposed) {
    const old = new Map(existing.map(x => [x.id, x]));
    const output = proposed.filter(x => !old.get(x.id)?.removed).map(x => ({ ...x, ...old.get(x.id), reason: x.reason }));
    // Keep removed IDs as tombstones so preparing again cannot resurrect them.
    for (const task of existing) if (task.removed || !proposed.some(x => x.id === task.id)) output.push(task);
    return output;
  }
  return { moments, routeOptions, arr, meaningful, derive, mergeTasks };
})();
