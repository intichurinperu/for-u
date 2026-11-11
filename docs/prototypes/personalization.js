/* Extends the previous independent mockup. Runs inside its local closure. */
const reviewModel = ForUReviewModel;
const list = reviewModel.arr;
const meaningful = reviewModel.meaningful;
const groupNames = { person: 'Tú al mando', project: 'Tu barco', marketing: 'Tu forma de crear', page: 'Tu página', other: 'A tu ritmo' };
const questionIcons = ['smile', 'compass', 'sailboat', 'sparkles', 'users', 'heart', 'pen-line', 'image', 'sunrise'];
function buildQuestions() {
  const a = state.answers, r = reviewModel.routeOptions[state.route];
  const group = list(a.otherAreas);
  const all = [
    { key: 'owner', group: 'person', title: 'Antes de tu proyecto, estás tú.', why: '¿Cómo te gusta que te llamen? Puedes omitirlo y explorar primero.', text: 'Tu nombre o como prefieras', icon: 'smile' },
    { key: 'addressing', group: 'person', title: '¿Cómo prefieres que te hablemos?', why: 'Es tu elección. No lo deducimos por tu nombre ni por tu voz.', options: ['En femenino', 'En masculino', 'En lenguaje neutral', 'Con arroba', 'Prefiero no decir'], icon: 'message-circle' },
    { key: 'stage', group: 'person', title: '¿Desde dónde empiezas?', why: 'Tu camino se adapta a tu momento. Todas las herramientas siguen disponibles.', options: ['Vengo a explorar', 'Estoy empezando', 'Ya tengo un negocio'], icon: 'compass' },
    { key: 'projectName', group: 'project', title: 'Vamos a darle nombre a tu barco.', why: '¿Cómo se llama tu proyecto? Si todavía no tiene nombre, lo definimos después.', text: 'El nombre de tu idea', icon: 'sailboat' },
    { key: 'route', group: 'project', title: '¿Qué estás construyendo?', why: 'Elegimos una ruta para tu actividad. Puedes combinar productos y servicios.', options: Object.values(routes).map(x => x.label), icon: 'shapes' },
    { key: 'age', group: 'project', title: '¿Hace cuánto comenzó este viaje?', why: 'Queremos aprovechar lo que ya has vivido, sin hacerte empezar de nuevo.', options: ['Todavía es una idea', 'Menos de un año', 'Entre uno y tres años', 'Más de tres años'], icon: 'anchor' },
    { key: 'team', group: 'project', title: '¿Cómo lo están llevando?', why: 'No necesitas un gran equipo. Vamos a cuidar que el siguiente paso sea manejable.', options: ['Por mi cuenta', 'Somos un equipo', 'Todavía lo estoy definiendo'], icon: 'users' },
    { key: 'teamSize', group: 'project', title: '¿Cuántas personas son?', why: 'Solo orienta la organización. Esto no crea usuarios ni comparte información.', options: ['Dos personas', 'Entre tres y cinco', 'Más de cinco', 'Lo definiré después'], when: a.team === 'Somos un equipo', icon: 'handshake' },
    { key: 'origin', group: 'project', title: '¿Dónde nació tu idea?', why: 'Tu origen puede ser una buena forma de conectar. Después le das tus propias palabras.', options: ['Proyecto familiar', 'Iniciativa personal', 'Con socios', 'Por una necesidad', 'Por una oportunidad', 'Otra historia'], custom: 'Si quieres, cuenta un poco más', icon: 'sparkles' },
    { key: 'purpose', group: 'project', title: '¿Qué te gustaría aportar?', why: 'Esta es tu brújula. No hace falta escribir una misión perfecta.', options: [...r.purpose, 'Lo definiré después'], custom: 'O dilo con tus palabras', icon: 'compass' },
    { key: 'vision', group: 'project', title: '¿Qué horizonte te emociona?', why: 'Elegimos una dirección, no una obligación. Puedes cambiarla más adelante.', options: ['Vivir de mi proyecto', 'Llegar a más personas', 'Trabajar con más calma', 'Hacer crecer mi equipo', 'Lo definiré después'], custom: 'Otro horizonte', icon: 'sunrise' },
    { key: 'audience', group: 'project', title: '¿A quién te gustaría llegar?', why: 'Esto ayuda a que tu página y tus contenidos hablen con claridad.', options: r.people, custom: 'Otro público, con tus palabras', icon: 'users' },
    { key: 'offering', group: 'project', title: '¿Qué quieres ofrecer primero?', why: 'Solo elegimos un punto de partida. Fotos, precios y detalles pueden venir después.', options: r.offer, custom: 'Escribe tu oferta si ya la tienes clara', customKey: 'offerCustom', icon: routes[state.route].icon },
    { key: 'need', group: 'project', title: '¿Qué les gustaría resolver contigo?', why: 'Una oferta se entiende mejor cuando se reconoce la necesidad que atiende.', options: ['Encontrar algo de calidad', 'Vivir una experiencia', 'Aprender o mejorar algo', 'Ahorrar tiempo o esfuerzo', 'Lo definiré después'], custom: 'Otra necesidad', icon: 'heart-handshake' },
    { key: 'goal', group: 'project', title: '¿Qué te ayudaría más ahora?', why: 'No tienes que hacerlo todo hoy. Tu primer resultado partirá de esta elección.', options: ['Presentar mi negocio', 'Vender una oferta', 'Crear contenido', 'Ordenar mi operación', 'Explorar sin presión'], icon: 'flag' },
    { key: 'web', group: 'project', title: '¿Ya tienes un espacio digital?', why: 'Lo que ya existe cuenta. Declararlo aquí no conecta ni importa tus cuentas.', options: ['Todavía no', 'Tengo redes sociales', 'Tengo página o catálogo'], icon: 'panels-top-left' },
    { key: 'sales', group: 'project', title: '¿Cómo van tus ventas?', why: 'Solo orienta tu ruta. No decide tu nivel, tu valor ni el acceso a herramientas.', options: ['Todavía no vendo', 'Vendo de vez en cuando', 'Vendo habitualmente', 'Prefiero omitirlo'], when: a.stage === 'Ya tengo un negocio', icon: 'chart-no-axes-combined' },
    { key: 'salesPeriod', group: 'project', title: '¿En qué periodo estás pensando?', why: 'No necesitamos tu facturación para ayudarte. Puedes omitir esta referencia.', options: ['Esta semana', 'Este mes', 'Un mes habitual', 'Prefiero omitirlo'], when: a.stage === 'Ya tengo un negocio' && meaningful(a.sales) && a.sales !== 'Todavía no vendo', icon: 'calendar-days' },
    { key: 'marketingStart', group: 'marketing', title: 'Ahora, tu manera de comunicar.', why: 'Unas pocas elecciones nos ayudan a crear contigo. También puedes dejar esta parte para después.', options: ['Quiero prepararla ahora', 'Más adelante'], icon: 'megaphone' },
    { key: 'intent', group: 'marketing', title: '¿Qué quieres conseguir con tu contenido?', why: 'Primero elegimos la intención. El formato viene después.', options: phases, when: a.marketingStart !== 'Más adelante', icon: 'megaphone' },
    { key: 'comfort', group: 'marketing', title: '¿Cómo te sientes a gusto creando?', why: 'Puedes elegir varias formas. No necesitas aparecer frente a una cámara.', options: ['Hablando a cámara', 'Usando mi voz', 'Escribiendo', 'Mostrando productos', 'Mostrando el proceso', 'Todavía no lo sé'], multi: true, when: a.marketingStart !== 'Más adelante', icon: 'wand-sparkles' },
    { key: 'avoid', group: 'marketing', title: '¿Qué prefieres evitar por ahora?', why: 'Vamos a empezar por una forma que se sienta posible para ti.', options: ['Mostrar mi cara', 'Grabar mi voz', 'Editar videos', 'Escribir mucho', 'Publicar seguido', 'Nada en particular'], multi: true, when: a.marketingStart !== 'Más adelante', icon: 'heart' },
    { key: 'resources', group: 'marketing', title: '¿Con qué material cuentas?', why: 'No hace falta subir nada ahora. Podemos crear algo cuidado incluso sin fotos.', options: ['Ninguno todavía', 'Fotos', 'Videos', 'Textos', 'Testimonios autorizados', 'Publicaciones anteriores'], multi: true, when: a.marketingStart !== 'Más adelante', icon: 'images' },
    { key: 'tools', group: 'marketing', title: '¿Qué herramientas ya conoces?', why: 'Para acompañarte mejor, sin pedirte que aprendas otra aplicación antes de empezar.', options: ['Canva', 'CapCut', 'Instagram', 'TikTok', 'Otras herramientas', 'Ninguna todavía'], multi: true, when: a.marketingStart !== 'Más adelante', icon: 'shapes' },
    { key: 'time', group: 'marketing', title: '¿Qué ritmo te viene bien?', why: 'Tu plan debe caber en tu vida. Las fechas las eliges tú.', options: ['Sesiones breves', 'Un bloque semanal', 'Varios momentos por semana', 'Todavía no lo sé'], when: a.marketingStart !== 'Más adelante', icon: 'timer' },
    { key: 'friction', group: 'marketing', title: '¿Dónde te gustaría una mano?', why: 'No hay una forma correcta de crear. Elegimos una ayuda concreta para tu siguiente paso.', options: ['No sé qué decir', 'Me cuesta empezar', 'Me da vergüenza', 'Me pierdo editando', 'No tengo material', 'Me cuesta organizarme'], when: a.marketingStart !== 'Más adelante', icon: 'hand-heart' },
    { key: 'channel', group: 'marketing', title: '¿Dónde quieres comenzar?', why: 'Prepararemos formatos pertinentes. Esto no conecta tus redes ni publica nada.', options: ['Instagram', 'TikTok', 'WhatsApp', 'Mi página', 'Todavía no lo sé'], when: a.marketingStart !== 'Más adelante', icon: 'send' },
    { key: 'diffusion', group: 'marketing', title: '¿Cómo te gustaría darlo a conocer?', why: 'Podemos empezar sin anuncios. Ninguna opción activa cobros ni publicidad.', options: ['Solo contenido orgánico', 'Explorar anuncios con presupuesto', 'Ya hago anuncios', 'Todavía no lo sé'], when: a.marketingStart !== 'Más adelante', icon: 'sprout' },
    { key: 'budget', group: 'marketing', title: '¿Quieres dejar una referencia de presupuesto?', why: 'S/10 diarios durante siete días es solo un ejemplo editable. No garantiza resultados ni es un mínimo.', options: ['S/10 diarios por siete días · ejemplo', 'Definir otra referencia', 'Lo definiré después'], custom: 'Monto y duración que quieres considerar, opcional', when: a.marketingStart !== 'Más adelante' && ['Explorar anuncios con presupuesto', 'Ya hago anuncios'].includes(a.diffusion), icon: 'wallet' },
    { key: 'reminders', group: 'marketing', title: '¿Quieres recordatorios para crear?', why: 'Tú eliges. En esta maqueta solo guardamos la preferencia, no enviamos notificaciones.', options: ['Sin recordatorios', 'Una vez por semana', 'Dos veces por semana', 'Lo decidiré después'], when: a.marketingStart !== 'Más adelante', icon: 'bell' },
    { key: 'sections', group: 'page', title: '¿Qué te gustaría contar en tu página?', why: 'Elige las secciones que te sirven ahora. Puedes sumar otras mientras editas.', options: r.sections, multi: true, sectionCards: true, icon: 'panels-top-left' },
    { key: 'otherAreas', group: 'other', title: '¿Preparamos también otra parte de tu negocio?', why: 'Marketing ya tiene un punto de partida. Puedes ampliar tu ruta o seguir con lo elegido.', options: ['Finanzas', 'Logística', 'Operaciones', 'Por ahora, seguir con lo elegido'], multi: true, icon: 'waypoints' },
    { key: 'prices', group: 'other', title: '¿Ya tienes precios definidos?', why: 'Si falta un precio, no lo inventaremos. Tu catálogo puede completarse después.', options: ['Sí', 'Algunos', 'Todavía no'], when: group.includes('Finanzas'), icon: 'tag' },
    { key: 'cost', group: 'other', title: '¿Sabes cuánto cuesta entregar tu oferta?', why: 'Un costo incompleto merece claridad. Nunca lo convertimos en cero.', options: ['Sí', 'Parcialmente', 'No'], when: group.includes('Finanzas'), icon: 'calculator' },
    { key: 'moneyTracking', group: 'other', title: '¿Cómo registras ingresos y gastos?', why: 'Aprovechamos tu forma actual de llevar las cuentas.', options: ['En un cuaderno', 'En una hoja de cálculo', 'En una herramienta', 'Todavía no registro'], when: group.includes('Finanzas'), icon: 'notebook-pen' },
    { key: 'delivery', group: 'other', title: '¿Cómo recibe el cliente tu oferta?', why: 'Esta elección orienta la configuración. No activa pedidos ni reservas automáticamente.', options: r.delivery, multi: true, when: group.includes('Logística'), icon: 'package' },
    { key: 'control', group: 'other', title: '¿Qué necesitas tener más a mano?', why: 'Destacaremos herramientas útiles sin ocultar las demás.', options: ['Materiales', 'Compras', 'Inventario', 'Horarios', 'Disponibilidad'], multi: true, when: group.includes('Logística'), icon: 'boxes' },
    { key: 'logisticsFriction', group: 'other', title: '¿Qué te complica más la coordinación?', why: 'Un punto de partida es suficiente; puedes dejarlo para después.', options: ['Faltantes', 'Entregas', 'Coordinación', 'Proveedores', 'Todavía no lo sé'], when: group.includes('Logística'), icon: 'compass' },
    { key: 'requests', group: 'other', title: '¿Por dónde llegan las solicitudes?', why: 'No conectamos estas cuentas por elegirlas; solo entendemos tu recorrido.', options: ['WhatsApp', 'Redes sociales', 'Mi página', 'En persona', 'Varios canales'], multi: true, when: group.includes('Operaciones'), icon: 'messages-square' },
    { key: 'tracking', group: 'other', title: '¿Cómo recuerdas lo que está pendiente?', why: 'Podemos ayudar a sacarlo de tu cabeza sin borrar tu forma de trabajar.', options: ['Lo recuerdo', 'Reviso mensajes', 'Uso una lista', 'Uso un calendario', 'Tengo un sistema'], when: group.includes('Operaciones'), icon: 'list-checks' },
    { key: 'responsible', group: 'other', title: '¿Quién atiende o realiza el trabajo?', why: 'Esto propone organización; no comparte datos ni añade personas a tu cuenta.', options: ['Yo', 'Mi equipo', 'Personas externas'], when: group.includes('Operaciones'), icon: 'users' },
    { key: 'operationGoal', group: 'other', title: '¿Qué quieres ordenar primero?', why: 'Tu ruta abrirá el proceso de tu actividad, no una herramienta de otro rubro.', options: state.route === 'restaurant' ? ['Pedidos', 'Preparación', 'Compras y costos'] : state.route === 'courses' ? ['Contenido educativo', 'Materiales', 'Seguimiento'] : state.route === 'services' ? ['Solicitudes', 'Cotizaciones', 'Seguimiento'] : ['Solicitudes', 'Reservas o entregas', 'Seguimiento'], when: group.includes('Operaciones'), icon: 'flag' }
  ];
  return all.filter(q => q.when !== false);
}
function questionNow() { const qs = buildQuestions(); return qs.find(q => q.key === state.questionKey) || qs[0]; }
function saveGuide() {
  if (state.answers.owner) state.account.owner = state.answers.owner;
  if (state.answers.addressing) state.account.addressing = state.answers.addressing;
  p().answers = structuredClone(state.answers);
  p().cursor = state.questionKey;
  persist();
}
function adoptAnswerRoute() {
  const match = Object.entries(routes).find(([, r]) => r.label === state.answers.route);
  if (match && match[0] !== state.route) {
    const draft = structuredClone(state.answers);
    state.route = match[0];
    p();
    state.answers = draft;
  }
}
function explanationFor(key) {
  const plan = reviewModel.derive(state.route, state.answers);
  if (['comfort', 'avoid'].includes(key)) return plan.contentPath + '. ' + (plan.showFace ? 'Con tu guion cerca.' : 'Aparecer a cámara sigue siendo opcional.');
  if (key === 'resources') return plan.reasons[0];
  if (key === 'time') return plan.reasons[2];
  if (key === 'tools') return plan.reasons[3];
  if (key === 'diffusion') return state.answers.diffusion === 'Solo contenido orgánico' ? 'Priorizaremos reutilizar tu contenido. No se activan recordatorios ni gastos.' : 'Prepararemos una ruta editable. No se contratarán anuncios.';
  if (key === 'otherAreas') return 'Solo se añadirán recomendaciones de las áreas que elijas. Puedes empezar sin completarlas.';
  return 'Tu elección se guardará al continuar. Puedes cambiarla en el resumen.';
}
function humanValue(value, omitted = 'Por definir') { return Array.isArray(value) ? value.join(' · ') || omitted : value || omitted; }
onboarding = function () {
  const q = questionNow(), qs = buildQuestions(), index = qs.findIndex(x => x.key === q.key), value = state.answers[q.key];
  const selected = list(value);
  const options = q.options ? `<div class="option-grid" aria-label="${h(q.title)}">${q.options.map((v, i) => button(`<span class="option-symbol">${icon(selected.includes(v) ? 'check' : q.key === 'route' ? Object.values(routes)[i].icon : questionIcons[i % questionIcons.length])}</span>${q.sectionCards ? '<span class="section-mini" aria-hidden="true"></span>' : ''}<strong>${h(v)}</strong>`, 'select-answer', 'option-card ' + (selected.includes(v) ? 'active' : ''), v).replace('<button ', `<button aria-pressed="${selected.includes(v)}" `)).join('')}</div>` : `<label class="field"><span class="sr-label">${q.title}</span><input data-newanswer="${q.key}" aria-label="${q.title}" value="${h(value || '')}" placeholder="${q.text}" maxlength="160"></label>`;
  const custom = q.custom ? `<details class="section-gap"><summary>${q.custom}</summary><label class="field section-gap"><span class="sr-label">${q.custom}</span><textarea data-newanswer="${q.customKey || q.key + 'Custom'}" aria-label="${q.custom}" maxlength="1200">${h(state.answers[q.customKey || q.key + 'Custom'] || '')}</textarea></label>${button(icon('mic') + ' Prefiero un audio', 'voice', 'ghost')}</details>` : !q.options ? button(icon('mic') + ' Prefiero un audio', 'voice', 'ghost') : '';
  return `${reviewLabel()}<div class="chrome">${brand()}<span class="grow"></span>${button('Crear manualmente ' + icon('arrow-up-right'), 'manual', 'ghost')}</div><main class="content"><section class="question-wrap personalized"><div class="journey-top" aria-label="Momentos de tu ruta">${Object.entries(groupNames).map(([id, name]) => `<span class="${q.group === id ? 'current' : ''}">${name}</span>`).join('')}</div><div class="question-art">${icon(q.icon)}</div><span class="eyebrow">${groupNames[q.group]}${q.multi ? ' · puedes elegir varias' : ''}</span><h1>${q.title}</h1><p class="explain">${q.why}</p>${options}${selected.length && q.options ? `<div class="answer-note">${icon('sparkles')}<span>${h(explanationFor(q.key))}</span></div>` : ''}${custom}${voiceOpen ? `<div class="notice section-gap">Audio de demostración: no activa el micrófono ni interpreta tu voz. En la app podrás guardar una grabación privada y decidir cuándo organizarla.${button('Ver ejemplo de respuesta por audio', 'voice-example', 'soft section-gap')}</div>` : ''}<div class="guide-actions">${index > 0 ? button(icon('arrow-left') + ' Atrás', 'question-back', 'ghost') : ''}${button(state.returnToSummary && q.key !== 'otherAreas' ? 'Guardar y volver al resumen' : index === qs.length - 1 ? 'Revisar mi ruta ' + icon('arrow-right') : 'Continuar ' + icon('arrow-right'), 'question-next', 'primary')}${button('Omitir', 'skip-question', 'ghost')}</div><div class="guide-exit">${button('Continuar después', 'pause-guide', 'ghost')}${button('Ir a mi resumen', 'show-summary', 'ghost')}</div><p class="question-counter">Tus respuestas permanecen en esta maqueta. No necesitas responder todo.</p></section></main>`;
};
welcome = function () {
  const saved = Boolean(p().cursor);
  return `${reviewLabel()}<section class="welcome"><div class="row between">${brand()}<small class="muted">Un espacio para ti y lo que estás creando</small></div><div class="welcome-inner"><div class="welcome-copy"><span class="eyebrow">PRIMERO TÚ. DESPUÉS, TU RUTA.</span><h1>Tu manera de crear<br>tiene un lugar.</h1><p>Cuéntanos un poco de ti. Elegimos contigo un camino para tu negocio, sin pedirte tenerlo todo listo.</p><div class="row">${button('Preparar mi ruta ' + icon('arrow-right'), 'start', 'primary')}${button('Explorar primero', 'explore', 'ghost')}</div><div class="row">${button('Crear manualmente', 'manual', 'soft')}${saved ? button('Retomar donde quedé', 'resume', 'ghost') : ''}</div><details class="review-examples"><summary>Recorrer ejemplos de la maqueta</summary><p>Datos ficticios para comparar caminos. Estos ejemplos sustituyen solo el escenario de esta maqueta, nunca tu aplicación.</p><div class="row section-gap">${button('Persona sin materiales', 'example', 'soft', 'explore')}${button('Proyecto que empieza', 'example', 'soft', 'starter')}${button('Negocio que ya vende', 'example', 'soft', 'existing')}</div></details></div><div class="horizon" aria-label="Un barco de papel rumbo a su horizonte"><div class="sun"></div><div class="sea-line"></div><div class="boat"><span class="sail"></span></div><div class="islet"></div><div class="islet"></div></div></div></section>`;
};
function manualChooser(explore = false) {
  if(state.manualChoosingRoute!==false)return `${reviewLabel()}<div class="chrome">${brand()}<span class="grow"></span>${button('Volver al inicio','nav','ghost','welcome')}</div><main class="content"><section class="manual-choices"><span class="eyebrow">A TU MANERA</span><h1>¿Qué actividad quieres explorar?</h1><p class="muted section-gap">Solo orienta las herramientas. Puedes combinar ofertas después.</p><div class="option-grid section-gap">${Object.entries(routes).map(([id,r])=>button(`<span class="option-symbol">${icon(r.icon)}</span><strong>${r.label}</strong>`,'manual-route-pick','option-card',id)).join('')}</div>${button('Usar la actividad actual y continuar','manual-route-pick','ghost section-gap',state.route)}</section></main>`;
  return `${reviewLabel()}<div class="chrome">${brand()}<span class="grow"></span>${button('Volver al inicio', 'nav', 'ghost', 'welcome')}</div><main class="content"><section class="manual-choices"><span class="eyebrow">${explore ? 'CONOCE TU ESPACIO' : 'A TU MANERA'}</span><h1>${explore ? 'Puedes mirar antes de decidir.' : '¿Qué quieres abrir?'}</h1><p class="muted section-gap">Sin cuestionario obligatorio. Mantendrás acceso a tu mapa y a todas las herramientas.</p><div class="row section-gap"><span class="pill">${h(routes[state.route].label)}</span>${button('Cambiar actividad','manual-route-change','ghost')}</div><div class="option-grid">${(explore ? [['map', 'waypoints', 'Ver mi mapa', 'Ubica cada parte de tu proyecto.'], ['page', 'panels-top-left', 'Explorar mi página', 'Una estructura del rubro, incluso sin fotos.'], ['studio', 'sparkles', 'Conocer Creator Studio', 'Intención, propuestas y herramientas juntas.']] : [['page', 'panels-top-left', 'Editar mi página', 'Abre directamente una página de tu actividad.'], ['studio', 'sparkles', 'Crear contenido', 'Empieza por lo que quieres comunicar.'], ['operation', 'package-check', 'Mi operación', 'Pedidos, solicitudes o contenido, según tu rubro.']]).map(([id, ic, title, sub]) => button(`<span class="option-symbol">${icon(ic)}</span><strong>${title}</strong><small>${sub}</small>`, 'manual-open', 'option-card', id)).join('')}</div><div class="row section-gap">${button('Prefiero preparar mi ruta', 'start', 'ghost')}</div></section></main>`;
}
function summary() {
  const a = state.answers, plan = reviewModel.derive(state.route, a);
  const item = (title, value, key) => `<div class="review-item"><div><strong>${title}</strong><p>${h(value)}</p></div>${button('Cambiar', 'edit-answer', 'ghost', key)}</div>`;
  return `${reviewLabel()}<div class="chrome">${brand()}<span class="grow"></span>${button('Crear manualmente', 'manual', 'ghost')}</div><main class="content"><section class="route-intro"><span class="eyebrow">TU RUTA EMPIEZA EN LO QUE ELEGISTE</span><h1>Esto entendimos de ti.</h1><p class="muted" style="line-height:1.6;margin-bottom:24px">${h(state.account.owner ? state.account.owner + ', ' : '')}puedes corregir cualquier parte. Lo que todavía no sabes puede esperar.</p><div class="review-grid"><div>${item('Cómo quieres que te hablemos',humanValue(a.addressing,'En lenguaje neutral'),'addressing')}${item('Tu proyecto', `${plan.name} · ${a.route?routes[state.route].label:'Actividad por definir · estructura de muestra'} · ${humanValue(a.stage)}`, 'projectName')}${item('Tu primer objetivo', humanValue(a.goal), 'goal')}${item('Tu forma de crear', humanValue(a.comfort, 'Podemos empezar con texto y opciones'), 'comfort')}${item('Lo que prefieres evitar', humanValue(a.avoid, 'Todavía no lo elegiste'), 'avoid')}${item('Material y tiempo', `${humanValue(a.resources, 'No hace falta traer material')} · ${humanValue(a.time, 'A tu ritmo')}`, 'resources')}${item('Tu intención y difusión', `${humanValue(a.intent)} · ${humanValue(a.diffusion)} · avisos: ${humanValue(a.reminders, 'sin activar')}`, 'intent')}${item('Tu página', plan.sections.length ? plan.sections.join(' · ') : 'Una estructura pequeña de tu rubro, editable', 'sections')}${item('Otras áreas', humanValue(a.otherAreas, 'Puedes ampliarlas después'), 'otherAreas')}<details class="section-gap"><summary>Ver historia, propósito y situación</summary>${item('Tu origen y brújula', `${humanValue(a.origin)} · ${humanValue(a.purpose)}`, 'origin')}${item('Tu horizonte y tus personas', `${humanValue(a.vision)} · ${humanValue(a.audience)}`, 'vision')}${item('Equipo y lo que existe', `${humanValue(a.team)} · ${humanValue(a.web)} · ventas: ${humanValue(a.sales, 'no solicitadas')}`, 'team')}</details></div><aside class="preview-route"><span class="eyebrow">ASÍ TOMARÁ FORMA</span><div class="preview-page"><small>${h(plan.name)}</small><h3>${h(plan.topic || 'Tu idea, con tu propia voz.')}</h3><p>${h(meaningful(a.purpose) ? a.purpose : 'Un borrador para revisar, sin precios ni historias inventadas.')}</p><div class="preview-bars">${(plan.sections.length ? plan.sections.slice(0, 4) : reviewModel.routeOptions[state.route].sections.slice(0, 2)).map(x => `<span>${h(x)}</span>`).join('')}</div></div><strong>${h(plan.contentPath)}</strong><ul class="route-reasons section-gap">${plan.reasons.slice(0, 3).map(x => `<li>${icon('check')}<span>${h(x)}</span></li>`).join('')}</ul><small class="muted">Página y contenidos serán borradores. No se publica, no se cobra y no se llama a IA.</small></aside></div><div class="route-banner section-gap"><div><strong>¿Lo preparamos contigo?</strong><p>${p().prepared ? 'Conservaremos textos y piezas que ya editaste. Añadiremos solo propuestas que falten.' : 'Tu página, tus primeras propuestas y un mapa con pasos que tienen una razón.'}</p></div>${button('Preparar mi espacio ' + icon('sparkles'), 'prepare-space', 'primary')}</div>${button('Continuar después', 'pause-guide', 'ghost')}</section></main>`;
}
function preparePersonalSpace() {
  adoptAnswerRoute();
  const project = p(), a = state.answers, plan = reviewModel.derive(state.route, a), alreadyPrepared=Boolean(project.prepared);
  project.name = meaningful(a.projectName) ? a.projectName.trim() : project.name;
  project.answers = structuredClone(a); project.plan = plan; project.prepared = true;
  project.audience = meaningful(a.audienceCustom) ? a.audienceCustom : meaningful(a.audience) ? a.audience : '';
  project.purpose = a.purposeCustom || (meaningful(a.purpose) ? a.purpose : '');
  project.vision = a.visionCustom || (meaningful(a.vision) ? a.vision : '');
  project.goal = a.goal || ''; project.team = a.team || '';
  if (!project.pageTouched) {
    project.hero = plan.topic ? `${plan.topic}, a tu manera.` : routes[state.route].hero;
    project.description = project.purpose || 'Un espacio para presentar tu propuesta. Puedes editar estas palabras antes de compartirlas.';
    project.story = a.originCustom || '';
    project.sections = plan.sections.length ? [...plan.sections] : reviewModel.routeOptions[state.route].sections.slice(0, 2);
  }
  project.tasks = reviewModel.mergeTasks(project.tasks, plan.tasks);
  if (!project.promotions.length) project.promotions.push({ id: 'route-special', title: plan.topic ? `${state.route==='restaurant'?'Un encuentro con':'Tu propuesta de'} ${plan.topic.toLowerCase()}` : 'Tu oferta especial', benefit: 'Por definir', productId: project.products[0]?.id || '', price: '', conditions: '', cta: 'Quiero saber más', draft: true, suggested: true });
  const roles = ['Conóceme', 'Conversemos', 'Esto puedes elegir'];
  for (let i = 0; i < roles.length; i++) {
    const id = 'route-piece-' + i;
    if (project.pieces.some(x => x.id === id)) continue;
    const titles = [project.name, plan.topic ? `¿Qué te gustaría de ${plan.topic.toLowerCase()}?` : '¿Qué te gustaría encontrar aquí?', plan.topic || 'Conoce mi propuesta'];
    const subtitles = [project.purpose || 'Tu presentación, con tus palabras.', 'Una pregunta para abrir una conversación.', 'Oferta y condiciones por confirmar antes de compartir.'];
    project.pieces.push({ id, title: titles[i], subtitle: subtitles[i], caption: titles[i] + '\n\n' + subtitles[i], brand: project.name, cta: ['Conóceme', 'Cuéntame', 'Consulta los detalles'][i], art: 'none', template: i, format: plan.format, campaignId: '', phase: [0, 1, 3][i], role: roles[i], script: '', shots: '', date: '', status: 'draft', sourceRevision: project.rev, proposed: true, reason: plan.reasons[i] });
  }
  if(!alreadyPrepared)project.highlights = state.route === 'restaurant' ? ['Empieza aquí', 'Menú', 'Cómo pedir'] : state.route === 'courses' ? ['Empieza aquí', 'Temario', 'Preguntas'] : ['Empieza aquí', routes[state.route].offer.replace(/^Tu[s]? /, ''), 'Preguntas'];
  state.phase = plan.phase; state.format = plan.format; state.scenario = a.stage === 'Ya tengo un negocio' ? 'existing' : 'new';
  state.screen = 'ready'; state.panel = null; state.returnToSummary = false; state.questionKey = null; state.dirty = false;
  persist(); render();
}
function ready() {
  const project = p(), plan = project.plan;
  const targetName = { page: 'Revisar mi página', studio: 'Dar forma a mi contenido', offers: 'Preparar mi oferta', operation: 'Ordenar mi operación' }[plan.next];
  return `${breadcrumb('Tu ruta preparada')}<section class="route-intro"><span class="eyebrow">PREPARADO DESDE TUS ELECCIONES · SIN IA</span><h1>Tu proyecto ya tiene un punto de partida.</h1><p class="muted section-gap">Este espacio nació de lo que elegiste. Puedes cambiarlo sin perder lo que vayas creando.</p><div class="route-ready">${[['page', 'panels-top-left', 'Tu página', `${project.sections.length} secciones elegidas, en un borrador editable.`], ['studio', 'sparkles', 'Tu contenido', `${plan.style}. Tres propuestas para empezar.`], ['map', 'waypoints', 'Tu mapa', `${project.tasks.length} pasos sugeridos, cada uno con su motivo.`]].map(([screen, ic, title, sub]) => button(`${icon(ic)}<strong>${title}</strong><small>${h(sub)}</small>`, 'open-next', 'ready-result', screen)).join('')}</div><div class="preview-route"><strong>¿Por qué esta ruta va contigo?</strong><ul class="route-reasons section-gap">${plan.reasons.map(x => `<li>${icon('check')}<span>${h(x)}</span></li>`).join('')}</ul></div><div class="row section-gap">${button(targetName + ' ' + icon('arrow-right'), 'open-next', 'primary', plan.next)}${button('Ver mi mapa completo', 'nav', 'soft', 'map')}${button('Revisar mis elecciones', 'show-summary', 'ghost')}</div><p class="muted tiny section-gap">No se han terminado tareas, asignado fechas, publicado páginas ni activado servicios.</p></section>`;
}

function populateExample(kind) {
  state.route = 'restaurant'; state.projects.restaurant = projectFor('restaurant', kind === 'existing');
  const common = { owner: 'Alex · ejemplo', addressing: 'En lenguaje neutral', route: 'Restaurante', age: 'Todavía es una idea', team: 'Por mi cuenta', origin: 'Iniciativa personal', purpose: 'Crear un lugar de encuentro', audience: 'Personas del barrio', offering: 'Café y bebidas', marketingStart: 'Quiero prepararla ahora', sections: ['Menú', 'Nuestra historia', 'Contacto'], tools: ['Ninguna todavía'], reminders: 'Sin recordatorios' };
  const variants = {
    explore: { projectName: 'Una idea por descubrir', stage: 'Vengo a explorar', goal: 'Presentar mi negocio', comfort: ['Escribiendo'], avoid: ['Mostrar mi cara'], resources: ['Ninguno todavía'], time: 'Sesiones breves', diffusion: 'Solo contenido orgánico', intent: phases[0] },
    starter: { projectName: 'Mi primer café', stage: 'Estoy empezando', goal: 'Crear contenido', comfort: ['Usando mi voz'], avoid: ['Editar videos'], resources: ['Ninguno todavía'], time: 'Un bloque semanal', diffusion: 'Solo contenido orgánico', intent: phases[1], otherAreas: ['Finanzas'], prices: 'Algunos', cost: 'No' },
    existing: { projectName: 'Café Encuentro · muestra', stage: 'Ya tengo un negocio', age: 'Más de tres años', team: 'Somos un equipo', goal: 'Ordenar mi operación', comfort: ['Mostrando productos'], resources: ['Fotos', 'Videos'], tools: ['Canva', 'Instagram'], time: 'Varios momentos por semana', friction: 'Me cuesta organizarme', intent: phases[3], diffusion: 'Ya hago anuncios', budget: 'Lo definiré después', web: 'Tengo página o catálogo', sales: 'Vendo habitualmente', salesPeriod: 'Un mes habitual', otherAreas: ['Finanzas', 'Logística', 'Operaciones'], cost: 'Parcialmente', delivery: ['En el local', 'Recojo'], tracking: 'Reviso mensajes', operationGoal: 'Pedidos' }
  };
  state.answers = { ...common, ...variants[kind] }; state.account.owner = state.answers.owner;
  p().answers = structuredClone(state.answers); state.questionKey = 'owner'; state.screen = 'summary'; state.panel = null; state.returnToSummary = false;
  persist(); render();
}

const oldPage = page, oldMap = map, oldStudio = studio, oldProfile = profile, oldPanel = renderBottomPanel;
page = function () {
  let output=oldPage();
  if(p().plan?.noPhoto||!p().products.some(x=>x.image||x.art))output=output.replace('class="website ', 'class="website no-resources ');
  return `<div class="offer-selector">${button('Página principal', 'nav', 'soft', 'page')}${button('Mis ofertas y sus páginas', 'nav', 'ghost', 'offers')}</div>${output}`;
};
map = function () {
  if (!p().prepared) return `${head('Todavía no hay una ruta impuesta.','Puedes explorar cada espacio o preparar tu mapa desde lo que necesitas.')}<div class="route-banner"><div><strong>Primero, lo que va contigo.</strong><p>El mapa se llenará con tus decisiones, no con tareas que no elegiste.</p></div>${button('Preparar mi ruta','start','primary')}</div><div class="grid2 section-gap">${areas.map(a => `<section class="surface"><div class="row">${icon(a.icon)}<h3>${a.name}</h3></div><p class="muted tiny section-gap">Aquí verás información, pasos y resultados de esta área.</p>${button('Explorar herramientas','manual','ghost section-gap')}</section>`).join('')}</div>`;
  const project = p(), plan = project.plan;
  const mapped = oldMap().replace(button('Editar mi página '+icon('arrow-right'),'nav','primary','page'),button('Continuar con mi siguiente paso '+icon('arrow-right'),'open-next','primary',plan.next)).replaceAll('0/0 pasos guardados','Puedes prepararla después');
  return `<div class="route-banner"><div><strong>Tu mapa nació de tus elecciones.</strong><p>${h(plan.contentPath)} · ${h(plan.diffusion)}. Las fechas las eliges tú.</p></div>${button('Revisar mi ruta','show-summary','soft')}</div>${mapped}<div class="row section-gap">${button('Ver mis resultados preparados','nav','ghost','ready')}</div>`;
};
previewPiece = function (template) {
  const project = p(), plan = project.plan || reviewModel.derive(state.route, state.answers), promo = project.promotions.find(x => x.id === state.sourcePromotion), item = project.products.find(x => x.id === state.sourceProduct) || project.products[0];
  const topic = promo?.title || item?.name || plan.topic || project.name;
  const titles = ['Conoce ' + project.name, '¿Qué te gustaría de ' + topic.toLowerCase() + '?', 'Así damos forma a lo que hacemos', topic, 'Sigamos con esa idea', 'Gracias por acompañarnos'];
  const subtitle = promo ? [promo.benefit==='Por definir'?'':promo.benefit,promo.price?money(promo.price)+' · muestra':''].filter(Boolean).join(' · ') || 'Oferta por completar' : item?.description || project.purpose || 'Tu mensaje, con tus palabras.';
  const title = state.sourceSection === 'Nuestra historia' ? 'Nuestra historia' : state.sourceSection || titles[state.phase || 0];
  const noArt = plan.noPhoto || (!item?.image && !item?.art);
  return { title: template === 2 && state.phase === 0 ? 'Tu idea tiene un lugar.' : title, subtitle, caption: [title,subtitle,promo?.description,promo?.conditions,promo?.period].filter(Boolean).join('\n\n'), brand: project.name, cta: promo?.cta || project.cta || routes[state.route].cta, template, art: noArt ? 'none' : item.art, image: noArt ? '' : item.image || '', format: state.format || plan.format, promotionId: promo?.id || '', sourceId: promo?.id || item?.id || state.sourceSection || 'page' };
};
const oldPoster = poster;
poster = function (piece, large = false) { return oldPoster(piece, large).replace('class="poster ', `class="poster ${piece.art === 'none' ? 'typography-only ' : ''}`); };
studio = function () {
  if (state.studio !== 'create') return oldStudio();
  const project = p(), plan = project.plan || reviewModel.derive(state.route, state.answers);
  return `${breadcrumb('Creator Studio')}${studioNav('create')}${head('¿Qué quieres comunicar?','Tu intención y tu oferta, antes que el formato.')}<div class="chips" aria-label="Momento de venta">${phases.map((phase, i) => button(phase, 'phase', state.phase === i ? 'active' : '', String(i))).join('')}</div><div class="source-filters"><label class="field">Qué quiero presentar<select data-studio-source aria-label="Qué quiero presentar"><option value="page">Mi negocio</option>${project.products.map(x => `<option value="product:${x.id}"${x.id === state.sourceProduct ? ' selected' : ''}>${h(x.name)}</option>`).join('')}${project.promotions.map(x => `<option value="promotion:${x.id}"${x.id === state.sourcePromotion ? ' selected' : ''}>Oferta · ${h(x.title)}</option>`).join('')}</select></label><label class="field">Campaña<select data-studio-campaign aria-label="Campaña"><option value="">Sin campaña</option>${project.campaigns.map(c => `<option value="${c.id}"${c.id === state.campaignId ? ' selected' : ''}>${h(c.name)}</option>`).join('')}</select></label></div><div class="row section-gap between"><span class="pill">${h(plan.style)} · ${h(plan.contentPath)}</span>${button('Cambiar formato o preferencias','studio-preferences','ghost')}</div><div class="row section-gap between"><div><h3>Tres formas de empezar.</h3><p class="tiny muted">Propuestas de plantillas con tus datos. Sin llamada a IA.</p></div>${button('Desde una sección de mi página','source-section','soft')}</div><div class="grid3 section-gap">${[0, 1, 2].map(i => `<button class="template-choice" data-action="choose-template" data-value="${i}">${poster(previewPiece(i))}<span class="template-label"><strong>${['Editorial', 'Protagonista', 'Conversación'][i]}</strong><span>Usar esta composición ${icon('arrow-right')}</span></span></button>`).join('')}</div>${button('Preparar una campaña','new-campaign','soft section-gap')}`;
};
profile = function () {
  return `<div class="notice" style="margin-bottom:18px">Empecemos con tres: <strong>Conóceme · Conversemos · Esto puedes elegir.</strong> Puedes cambiarlas o dejarlas para después.</div>${oldProfile().replace(/Principal \$\{i\+1\}/g, 'Principal')}`;
};
function offers() {
  return `${breadcrumb('Mi página / Ofertas')}${head('Una oferta también puede tener su propio espacio.','La página principal, el catálogo y cada landing permanecen separados.',button('Preparar una oferta','promotion-edit','primary','new'))}<div class="notice">Borradores de demostración. No activan promociones ni duplican productos del catálogo.</div>${p().promotions.length ? p().promotions.map(x => `<article class="promotion-row"><div class="grow"><span class="pill">${x.suggested ? 'Idea opcional de oferta' : 'Borrador de oferta'}</span><h3 class="section-gap">${h(x.title)}</h3><p>${h(x.benefit)} · ${x.price ? money(x.price) + ' · muestra' : 'Precio y condiciones por confirmar'}</p></div><div class="row">${button('Ver su landing','offer-open','primary',x.id)}${button('Ajustar oferta','promotion-edit','soft',x.id)}</div></article>`).join('') : `<div class="empty">${icon('gift')}<h3>Tu primera oferta puede empezar con una idea.</h3><p>Podrás vincularla a un producto o servicio cuando lo tengas definido.</p></div>`}${button('Volver a mi página principal','nav','ghost section-gap','page')}`;
}
function offerPage() {
  const promo = p().promotions.find(x => x.id === state.offerId); if (!promo) return offers();
  const product = p().products.find(x => x.id === promo.productId);
  return `${breadcrumb('Mi página / Landing de oferta')}<div class="editor-toolbar"><div><strong>Landing propia · ${h(promo.title)}</strong><br><small class="muted">Borrador separado de la página principal</small></div><div class="row">${button('Mis ofertas','nav','ghost','offers')}${button('Ajustar esta oferta','promotion-edit','soft',promo.id)}${button('Crear contenido','offer-content','primary',promo.id)}</div></div><article class="website offer-page" aria-label="Landing de oferta ${h(promo.title)}"><div class="web-nav"><strong>${h(p().name)}</strong><span class="pill">Oferta específica · maqueta</span></div><section class="web-hero"><div><span class="benefit-badge">${h(promo.benefit === 'Por definir' ? 'Una propuesta especial, por completar' : promo.benefit)}</span><h1 role="textbox" contenteditable="true" aria-label="Editar título de la oferta" data-promotion-title="${promo.id}">${h(promo.title)}</h1><p>${h(promo.description || 'Revisa los detalles para que esta propuesta sea clara y vaya contigo.')}</p>${button(h(promo.cta),'promotion-edit','web-cta',promo.id)}<p class="offer-condition section-gap">${h(promo.conditions || 'Precio y condiciones pendientes. Esta propuesta todavía no está lista para publicar.')}</p></div>${product ? `<div class="cup-scene" aria-label="Producto de muestra vinculado">${art(product.art,product.image)}</div>` : ''}</section><section class="web-extra"><h2>Lo que incluye</h2><p class="section-gap">${h(product ? product.name + ' · referencia al catálogo de este proyecto' : 'Elige el producto, servicio o paquete al ajustar la oferta.')}</p><p class="muted tiny section-gap">${promo.price ? money(promo.price) + ' · precio de demostración confirmado en la maqueta' : 'Sin precio confirmado'}${promo.period ? ' · ' + h(promo.period) : ''}</p></section><section class="web-extra"><h2>Antes de elegir</h2><p class="section-gap">${h(promo.conditions || 'Añade condiciones reales, modalidad y vigencia cuando las tengas claras.')}</p></section></article><div class="row section-gap">${button('Guardar borrador de oferta','save-offer','primary',promo.id)}${button('Revisar campaña de esta oferta','offer-campaign','soft',promo.id)}${button('Ver página principal','nav','ghost','page')}</div><p class="tiny muted section-gap">No se publica en tu dominio. Una promoción requiere confirmación y publicación explícitas en la aplicación real.</p>`;
}

renderBottomPanel = function () {
  const panel = state.panel; if (!panel) return '';
  let title = '', body = '';
  if (panel.type === 'area'&&!p().tasks.some(x=>x.area===panel.id&&!x.removed)) {
    title=areas.find(x=>x.id===panel.id).name;
    body=`<p class="muted">Todavía no elegiste pasos de esta área. Puedes prepararla cuando quieras, o explorar las herramientas manualmente.</p><div class="row section-gap">${button('Revisar otras áreas','edit-answer','primary','otherAreas')}${button('Explorar herramientas','manual','soft')}</div>`;
  } else if (panel.type === 'task') {
    const task = p().tasks.find(x => x.id === panel.id); if (!task) return '';
    title = task.title;
    body = `<div class="answer-note">${icon('compass')}<span>Te lo proponemos porque ${h(task.reason || 'puede ayudarte a organizar tu próximo paso.')}</span></div>${task.acceptance === 'suggested' ? `<div class="row section-gap">${button('Aceptar este paso','task-accept','primary',task.id)}${button('Posponer','task-postpone','soft',task.id)}${button('Quitar de mi ruta','task-remove','ghost',task.id)}</div>` : `<span class="pill">${task.acceptance === 'postponed' ? 'Pospuesto · puedes retomarlo' : 'Elegido por ti'}</span>`}<form data-form="task" class="section-gap"><label class="field">Estado<select name="status"><option value="todo"${task.status === 'todo' ? ' selected' : ''}>Por hacer</option><option value="doing"${task.status === 'doing' ? ' selected' : ''}>En curso</option><option value="done"${task.status === 'done' ? ' selected' : ''}>Hecho</option></select></label>${field('Fecha opcional','date',task.date,'date')}<div class="row"><button type="submit" class="soft">Guardar paso</button>${button('Abrir mi trabajo','task-tool','primary',task.id)}${button(p().today.includes(task.id)?'Quitar de Hoy':'Elegir para Hoy','today-task','ghost',task.id)}</div></form>`;
  } else if (panel.type === 'promotion-edit') {
    const promo = p().promotions.find(x => x.id === panel.id) || {};
    title = 'Tu oferta, con detalles claros';
    body = `<form data-form="promotion"><label class="field">Producto o servicio del catálogo<select name="product"><option value="">Lo vincularé después</option>${p().products.map(x => `<option value="${x.id}"${x.id === promo.productId ? ' selected' : ''}>${h(x.name)}</option>`).join('')}</select></label>${field('Nombre de la oferta','title',promo.title || '')}<label class="field">Beneficio<select name="benefit">${['Por definir','2×1','Paquete especial','Descuento','Otra propuesta'].map(x=>`<option${promo.benefit === x?' selected':''}>${x}</option>`).join('')}</select></label>${textField('Qué incluye, con tus palabras','description',promo.description || '')}${field('Precio confirmado · solo datos de muestra','price',promo.price || '','number')}${textField('Condiciones y modalidad','conditions',promo.conditions || '')}${field('Vigencia opcional','period',promo.period || '')}${field('Botón de la oferta','cta',promo.cta || 'Quiero saber más')}<button class="primary" type="submit">Guardar propuesta de oferta</button></form><p class="tiny muted section-gap">La oferta conserva referencias al catálogo. Guardar no activa ni publica una promoción.</p>`;
  } else if (panel.type === 'studio-preferences') {
    title = 'Una forma de crear que vaya contigo';
    body = `<p class="muted">Puedes cambiar tus elecciones sin borrar diseños ya editados.</p><div class="chips section-gap">${[['post','Cuadrado · 1:1'],['portrait','Vertical · 4:5'],['story','Historia · 9:16']].map(([id,label])=>button(label,'studio-format',state.format===id?'active':'',id)).join('')}</div>${button('Revisar cómo me gusta crear','edit-answer','soft section-gap','comfort')}`;
  } else if (panel.type === 'new-campaign') {
    title = 'Tu campaña';
    body = `<form data-form="review-campaign">${field('Nombre','name',phases[state.phase]+' · '+p().name)}<label class="field">Intención<select name="goal">${phases.map(x=>`<option${x === phases[state.phase]?' selected':''}>${x}</option>`).join('')}</select></label><label class="field">Oferta relacionada<select name="offer"><option value="">Mi negocio</option>${p().products.map(x=>`<option value="product:${x.id}">${h(x.name)}</option>`).join('')}${p().promotions.map(x=>`<option value="promotion:${x.id}"${x.id === state.sourcePromotion?' selected':''}>Oferta · ${h(x.title)}</option>`).join('')}</select></label>${field('Inicio opcional','date','','date')}<button class="primary" type="submit">Crear y preparar contenido</button></form>`;
  } else return oldPanel();
  return `<section class="bottom-panel" aria-label="${h(title)}"><div class="row between"><h3>${title}</h3>${button(icon('x')+' Cerrar','close','ghost')}</div>${body}</section>`;
};

/* One decision at a time in every local creation/editing form.
 * Keep original controls and submit contracts; detach the other decisions rather
 * than discarding values. This is local prototype UI, never an application API. */
const questionTitles = {
 name:'¿Cómo quieres llamarlo?', title:'¿Qué título quieres usar?', goal:'¿Qué quieres conseguir?',
 offer:'¿Qué oferta acompaña esta campaña?', product:'¿Qué producto o servicio vas a usar?',
 date:'¿Quieres elegir una fecha?', description:'¿Cómo lo contarías con tus palabras?',
 benefit:'¿Qué hace especial esta oferta?', price:'¿Qué precio has confirmado?',
 conditions:'¿Qué necesita saber la persona antes de elegir?', period:'¿Hasta cuándo estará disponible?',
 cta:'¿Qué dirá el botón?', bio:'¿Cómo quieres presentarte?', link:'¿A dónde quieres llevar a las personas?',
 status:'¿En qué momento está este paso?', mode:'¿Cómo atenderás a tus clientes?',
 day:'¿Qué días atenderás?', address:'¿Dónde pueden encontrarte?', start:'¿A qué hora abres?',
 end:'¿A qué hora cierras?', zone:'¿En qué zona entregas?', fee:'¿Qué tarifa has confirmado?',
 art:'¿Cómo quieres presentar la imagen?', script:'¿Qué quieres decir?', shots:'¿Qué quieres mostrar?'
};
function guideEveryForm() {
  root.querySelectorAll('form[data-form]:not([data-guided])').forEach(form => {
    form.dataset.guided='true';
    form.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.tagName!=='TEXTAREA'&&event.target.tagName!=='BUTTON'){event.preventDefault();event.stopPropagation();nav.querySelector('.primary')?.click();}});
    const controls=[...form.querySelectorAll('input:not([type=hidden]),select,textarea')];
    if(!controls.length)return;
    const groups=[];
    controls.forEach((control,index)=>{
      const name=control.name||control.dataset.upload||'material-'+index;
      const same=['checkbox','radio'].includes(control.type)&&groups.find(g=>g.name===name);
      const label=control.closest('label');
      const node=label||control;
      if(label&&!['checkbox','radio'].includes(control.type)){
        [...label.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).forEach(n=>{const caption=document.createElement('span');caption.className='sr-label';caption.textContent=n.textContent;n.replaceWith(caption);});
      }
      if(same){if(!same.nodes.includes(node))same.nodes.push(node);same.controls.push(control);}
      else groups.push({name,nodes:[node],controls:[control],label:label?.childNodes[0]?.textContent?.trim()||control.getAttribute('aria-label')||name});
    });
    const submit=form.querySelector('[type=submit]');
    const submitText=submit?.textContent||'Guardar';
    const extra=[...form.querySelectorAll('button[data-action]')].filter(b=>!b.closest('label'));
    const parked=document.createDocumentFragment();
    groups.forEach(g=>g.nodes.forEach(n=>parked.append(n)));
    form.replaceChildren();
    const view=document.createElement('div');view.className='single-question-flow';
    const stage=document.createElement('div');stage.className='single-question-stage';
    const nav=document.createElement('div');nav.className='guide-actions';
    const footer=document.createElement('div');footer.className='row section-gap';extra.forEach(b=>footer.append(b));
    view.append(stage,nav,footer);form.append(view);
    let index=0,review=false;
    // Campaigns begin with intention, then the offer; naming is secondary.
    if(form.dataset.form==='review-campaign')groups.sort((a,b)=>['goal','offer','name','date'].indexOf(a.name)-['goal','offer','name','date'].indexOf(b.name));
    function smallButton(text,handler,cls='ghost'){
      const b=document.createElement('button');b.type='button';b.className=cls+' cursor-interaction';b.textContent=text;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();handler();});return b;
    }
    function show() {
      groups.forEach(g=>g.nodes.forEach(n=>parked.append(n)));stage.replaceChildren();nav.replaceChildren();
      if(review){
        const heading=document.createElement('h2');heading.textContent='Así queda. Tú decides.';stage.append(heading);
        const hint=document.createElement('p');hint.className='muted';hint.textContent='Puedes cambiar un detalle o guardar cuando quieras.';stage.append(hint);
        groups.forEach((g,i)=>{const row=document.createElement('div');row.className='review-item';const text=document.createElement('div');const title=document.createElement('strong');title.textContent=g.label;const value=document.createElement('p');value.textContent=g.controls.map(c=>['checkbox','radio'].includes(c.type)?(c.checked?c.value:''):c.tagName==='SELECT'?c.selectedOptions[0]?.textContent:c.type==='file'?(c.files?.[0]?.name||'Sin archivo'):c.value).filter(Boolean).join(' · ')||'Por definir';text.append(title,value);row.append(text,smallButton('Cambiar',()=>{index=i;review=false;show();}));stage.append(row);});
        nav.append(smallButton('Atrás',()=>{review=false;index=groups.length-1;show();}));
        const finish=document.createElement('button');finish.type='submit';finish.className='primary cursor-interaction';finish.textContent=submitText;
        // Reattach the exact controls synchronously before the existing handlers
        // inspect FormData. Their values and checked groups remain intact.
        finish.addEventListener('click',()=>{groups.forEach(g=>g.nodes.forEach(n=>{n.hidden=true;form.append(n);}));form.dataset.guidedReady='true';});nav.append(finish);return;
      }
      const g=groups[index],c=g.controls[0];
      const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent=`UN DETALLE A LA VEZ · ${index+1} DE ${groups.length}`;
      const heading=document.createElement('h2');heading.textContent=questionTitles[g.name]||(c.type==='file'?'¿Quieres añadir una imagen?':g.label);
      const why=document.createElement('p');why.className='muted';why.textContent=c.type==='date'?'Es opcional. No pondremos una fecha por ti.':c.type==='number'?'Usa un dato confirmado o déjalo pendiente.':c.type==='file'?'También puedes seguir sin foto y añadirla después.':'Puedes cambiarlo después. No tienes que resolver todo ahora.';
      stage.append(eyebrow,heading,why);
      if(c.tagName==='SELECT'){
        const choices=document.createElement('div');choices.className='option-grid';
        [...c.options].forEach(option=>{const b=smallButton(option.textContent,()=>{c.value=option.value;choices.querySelectorAll('button').forEach(x=>{const on=x.dataset.choice===option.value;x.setAttribute('aria-pressed',String(on));x.classList.toggle('active',on);});},'option-card'+(c.value===option.value?' active':''));b.dataset.choice=option.value;b.setAttribute('aria-pressed',String(c.value===option.value));choices.append(b);});stage.append(choices);
      }else g.nodes.forEach(n=>{n.hidden=false;stage.append(n);});
      if(index>0)nav.append(smallButton('Atrás',()=>{index--;show();}));
      nav.append(smallButton(index===groups.length-1?'Ver cómo queda':'Continuar',()=>{if(index===groups.length-1)review=true;else index++;show();},'primary'));
      nav.append(smallButton('Dejar para después',()=>{if(index===groups.length-1)review=true;else index++;show();}));
      nav.append(smallButton('Revisar y guardar',()=>{review=true;show();}));
    }
    form.addEventListener('submit',event=>{if(form.dataset.guidedReady!=='true'){event.preventDefault();event.stopImmediatePropagation();review=true;show();}},true);
    show();
  });
}

function focusActiveQuestion() {
  const panel=root.querySelector('.edit-panel:has(form[data-guided]),.bottom-panel:has(form[data-guided])');
  if(!panel)return;
  const content=panel.closest('.content');if(!content)return;
  content.classList.add('focused-edit');
  let active=panel;
  while(active.parentElement&&active.parentElement!==content){
    [...active.parentElement.children].forEach(sibling=>{if(sibling!==active)sibling.hidden=true;});
    active=active.parentElement;
  }
  [...content.children].forEach(sibling=>{if(sibling!==active&&!sibling.classList.contains('breadcrumb'))sibling.hidden=true;});
}
function simplifyStudioChoices() {
  const source=root.querySelector('[data-studio-source]'),campaign=root.querySelector('[data-studio-campaign]');
  [source,campaign].filter(Boolean).forEach(control=>{
    const label=control.closest('label');if(!label)return;
    const detail=document.createElement('details');detail.className='context-choice';detail.name='studio-context';
    const summary=document.createElement('summary');summary.textContent=(control===source?'Contenido: ':'Campaña: ')+(control.selectedOptions[0]?.textContent||'Por definir');
    const heading=document.createElement('h3');heading.textContent=control===source?'¿Qué quieres presentar?':'¿En qué campaña quieres trabajar?';
    label.replaceWith(detail);detail.append(summary,heading,label);
    detail.addEventListener('toggle',()=>{if(detail.open)root.querySelectorAll('details.context-choice').forEach(other=>{if(other!==detail)other.open=false;});});
  });
}
const baseRender = render;
render = function () {
  const custom = { summary, manual: () => manualChooser(false), explore: () => manualChooser(true), ready, offers, 'offer-page': offerPage };
  if (!custom[state.screen]) { baseRender(); guideEveryForm(); simplifyStudioChoices(); focusActiveQuestion(); return; }
  shell.innerHTML = ['summary','manual','explore'].includes(state.screen) ? custom[state.screen]() : layout(custom[state.screen]());
  root.querySelectorAll('[data-fu-logo]').forEach(el => el.src = LOGO);
  if (window.lucide) lucide.createIcons({ attrs: { width:18,height:18 } });
  guideEveryForm(); simplifyStudioChoices(); focusActiveQuestion();
};

function handleReviewAction(action,value) {
  if (action === 'start' || action === 'resume') { state.answers = Object.keys(p().answers).length ? structuredClone(p().answers) : state.answers; state.questionKey = action === 'resume' ? p().cursor || state.questionKey || 'owner' : state.questionKey || 'owner'; state.screen='onboarding';state.panel=null;state.returnToSummary=false;render();return true; }
  if (action === 'manual' || action === 'explore') { if(state.screen==='onboarding')saveGuide();state.manualChoosingRoute=Boolean(state.answers.route)?false:true;go(action);return true; }
  if(action==='manual-route-change'){state.manualChoosingRoute=true;render();return true;}
  if(action==='manual-route-pick'){state.route=value;p();state.answers=structuredClone(p().answers);state.manualChoosingRoute=false;render();return true;}
  if (action === 'manual-open') { if(value==='studio')state.studio='create';go(value);return true; }
  if (action === 'open-next') { if(value==='studio')state.studio='create';go(value);return true; }
  if (action === 'campaign-create') { const campaign=p().campaigns.find(x=>x.id===value);if(campaign){state.campaignId=value;state.phase=Math.max(0,phases.indexOf(campaign.goal));const [kind,id]=String(campaign.offer||'').split(':');state.sourceProduct=kind==='product'?id:'';state.sourcePromotion=kind==='promotion'?id:'';state.sourceSection='';state.studio='create';go('studio');}return true; }
  if (action === 'from-product') { state.sourceProduct=value;state.sourcePromotion='';state.sourceSection='';state.studio='create';go('studio');return true; }
  if (action === 'from-section'||action==='select-source') { state.sourceProduct='';state.sourcePromotion='';state.sourceSection=value;state.studio='create';go('studio');return true; }
  if (action === 'select-answer') {
    const q=questionNow();
    if(q.multi){const vals=list(state.answers[q.key]);const on=vals.includes(value);let next=on?vals.filter(x=>x!==value):[...vals,value];const exclusive=['Ninguno todavía','Ninguna todavía','Nada en particular','Todavía no lo sé','Por ahora, seguir con lo elegido'];if(!on&&exclusive.includes(value))next=[value];else if(!on)next=next.filter(x=>!exclusive.includes(x));state.answers[q.key]=next;}
    else state.answers[q.key]=value;
    if(q.key==='route')adoptAnswerRoute();voiceOpen=false;render();return true;
  }
  if(action==='question-next'||action==='skip-question'){
    const q=questionNow(),key=q.key;
    if(action==='skip-question'){delete state.answers[key];delete state.answers[q.customKey||key+'Custom'];if(key==='marketingStart')state.answers.marketingStart='Más adelante';}
    adoptAnswerRoute();saveGuide();voiceOpen=false;
    if(state.returnToSummary&&key!=='otherAreas'){state.returnToSummary=false;go('summary');return true;}state.returnToSummary=false;
    const qs=buildQuestions(),index=qs.findIndex(x=>x.key===key);if(index===qs.length-1)go('summary');else{state.questionKey=qs[index+1].key;saveGuide();render();}return true;
  }
  if(action==='question-back'){const qs=buildQuestions(),i=qs.findIndex(x=>x.key===questionNow().key);state.questionKey=qs[Math.max(0,i-1)].key;saveGuide();voiceOpen=false;render();return true;}
  if(action==='pause-guide'){saveGuide();state.notice='Tu avance de la maqueta está guardado; puedes retomarlo.';go('welcome');return true;}
  if(action==='show-summary'){saveGuide();go('summary');return true;}
  if(action==='edit-answer'){if(['intent','comfort','resources'].includes(value)&&state.answers.marketingStart==='Más adelante')state.answers.marketingStart='Quiero prepararla ahora';state.questionKey=value;state.returnToSummary=true;state.screen='onboarding';state.panel=null;render();return true;}
  if(action==='prepare-space'){preparePersonalSpace();return true;}
  if(action==='example'){populateExample(value);return true;}
  if(action==='voice-example'){const q=questionNow();state.answers[q.customKey||q.key+'Custom']='Respuesta de audio de muestra: quiero crear algo cercano y compartirlo a mi ritmo.';voiceOpen=false;saveGuide();render();return true;}
  if(action==='promotion-edit'||action==='studio-preferences'){showPanel(action,value);return true;}
  if(action==='offer-open'){state.offerId=value;go('offer-page');return true;}
  if(action==='save-offer'){state.dirty=false;persist();toast('Borrador de oferta guardado solo en la maqueta. La página principal se conserva.');return true;}
  if(action==='offer-content'||action==='offer-campaign'){state.sourcePromotion=value;state.sourceProduct='';state.sourceSection='';state.studio='create';state.phase=3;if(action==='offer-campaign'){state.screen='studio';showPanel('new-campaign',value);}else go('studio');return true;}
  if(action==='studio-format'){state.format=value;state.panel=null;render();return true;}
  if(action==='task-accept'||action==='task-postpone'||action==='task-remove'){const task=p().tasks.find(x=>x.id===value);if(task){task.acceptance=action==='task-accept'?'accepted':action==='task-postpone'?'postponed':'removed';if(action==='task-remove'){task.removed=true;state.panel=null;}persist();render();}return true;}
  if(action==='task-tool'){const task=p().tasks.find(x=>x.id===value);if(task){if(task.id==='route-cost')state.opTab=2;if(task.tool==='studio')state.studio='create';go(task.tool);}return true;}
  if(action==='scenario-new'){state.projects[state.route]=projectFor(state.route,false);state.answers={route:routes[state.route].label};state.questionKey=null;state.scenario='new';go('map');return true;}
  if(action==='scenario-existing'||action==='existing'){populateExample('existing');return true;}
  if(action==='nav'&&value==='ready'&&!p().plan){go('summary');return true;}
  return false;
}
root.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');if(!target||target.disabled)return;
  if(handleReviewAction(target.dataset.action,target.dataset.value)){event.preventDefault();event.stopImmediatePropagation();}
},true);
root.addEventListener('input',event=>{
  const el=event.target;
  if(el.dataset.newanswer){state.answers[el.dataset.newanswer]=el.value;return;}
  if(el.dataset.promotionTitle){const promo=p().promotions.find(x=>x.id===el.dataset.promotionTitle);if(promo)promo.title=el.innerText;state.dirty=true;return;}
  if(['hero','description','story'].includes(el.dataset.edit))p().pageTouched=true;
},true);
root.addEventListener('change',event=>{
  const el=event.target;
  if(el.matches('[data-manual-route]')){state.route=el.value;p();state.answers=structuredClone(p().answers);render();event.stopImmediatePropagation();}
  if(el.matches('[data-studio-source]')){state.sourceProduct='';state.sourcePromotion='';state.sourceSection='';const [kind,id]=el.value.split(':');if(kind==='product')state.sourceProduct=id;if(kind==='promotion')state.sourcePromotion=id;render();event.stopImmediatePropagation();}
  if(el.matches('[data-studio-campaign]')){state.campaignId=el.value;render();event.stopImmediatePropagation();}
  if(el.matches('[data-route]')){const route=el.value;state.route=route;p();state.answers=structuredClone(p().answers);state.questionKey=p().cursor||null;state.screen='map';state.panel=null;state.pieceId=null;state.sourceProduct='';state.sourcePromotion='';state.sourceSection='';state.campaignId='';state.opTab=0;persist();render();event.stopImmediatePropagation();}
},true);
root.addEventListener('submit',event=>{
  const form=event.target;if(form.dataset.guided==='true'&&form.dataset.guidedReady!=='true'){event.preventDefault();event.stopImmediatePropagation();return;}if(!['promotion','review-campaign'].includes(form.dataset.form))return;
  event.preventDefault();event.stopImmediatePropagation();const data=new FormData(form),get=k=>String(data.get(k)||'').trim();
  if(form.dataset.form==='promotion'){
    if(!get('title')){state.notice='Ponle un nombre a esta oferta de muestra.';render();return;}
    const previous=p().promotions.find(x=>x.id===state.panel.id),id=previous?.id||uid();const value={id,title:get('title'),productId:get('product'),benefit:get('benefit'),description:get('description'),price:get('price'),conditions:get('conditions'),period:get('period'),cta:get('cta')||'Quiero saber más',draft:true,suggested:false};if(previous)Object.assign(previous,value);else p().promotions.push(value);state.offerId=id;state.screen='offer-page';
  }else{
    if(!get('name')){state.notice='Añade un nombre para reconocer tu campaña.';render();return;}
    const id=uid();p().campaigns.push({id,name:get('name'),goal:get('goal'),offer:get('offer'),date:get('date')});state.campaignId=id;state.phase=Math.max(0,phases.indexOf(get('goal')));const [kind,source]=get('offer').split(':');state.sourceProduct=kind==='product'?source:'';state.sourcePromotion=kind==='promotion'?source:'';state.studio='create';state.screen='studio';
  }
  state.panel=null;state.dirty=false;persist();render();
},true);

/* Reconstruct only the small review additions; never read application storage. */
state.account=state.account||{owner:'',addressing:'En lenguaje neutral'};
for(const [route,project] of Object.entries(state.projects)){project.answers=project.answers||{};project.promotions=project.promotions||[];if(project.prepared)project.plan=reviewModel.derive(route,project.answers);}
if(!Object.keys(state.answers).length)state.answers=structuredClone(p().answers);
