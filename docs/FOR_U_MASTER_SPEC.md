# FOR U — Especificación maestra vigente

Fecha de consolidación: 21 de octubre de 2026. Alcance ejecutado: **objetivo 3, datos compartidos y navegación, tras aprobación expresa de la base**. Su cierre técnico está en FOR_U_OBJECTIVE_03_AUDIT.md. No autoriza comenzar objetivos posteriores ni modificar SQL, secretos, despliegues o publicaciones.

## 1. Autoridad y documentos de trabajo

Este documento reúne «Una sola experiencia, desde tu primera idea hasta la operación del negocio», sus ampliaciones de personalización y los 16 objetivos acordados. Las decisiones más recientes prevalecen; los requisitos anteriores compatibles permanecen. No es una declaración de implementación ni de aprobación visual.

- [Requisitos y aceptación por ID](FOR_U_REQUIREMENTS.csv): requisito → objetivo → pantalla → datos → prueba → base existente.
- [Ejecución de los 16 objetivos](FOR_U_EXECUTION.md): orden, dependencias, estado y próximos pasos.
- [Inspección de la base actual](FOR_U_BASELINE.md): reutilizable, incompleto, ausencia en contratos inspeccionados, pruebas históricas y discrepancias.
- [Cobertura de accesos existentes](FOR_U_SCREEN_COVERAGE.csv): rutas actuales y herramientas que no deben perderse.
- [Trazabilidad de fuentes](FOR_U_SOURCE_TRACEABILITY.md): apartados del adjunto y plan integral, decisiones sustituidas y requisitos conservados.
- [Texto de personalización recibido, íntegro](sources/FOR_U_PERSONALIZATION_SOURCE.md): copia del adjunto, sin reinterpretación.
- [Registro histórico](FOR_U_PROGRESS.md), [plan histórico](FOR_U_PLAN.md) y documentos especializados conservan evidencias y decisiones antiguas. Sus encabezados «vigente» anteriores no desplazan esta especificación.

Si aparece una contradicción nueva, registrarla y resolverla explícitamente; no eliminar requisitos silenciosamente. Cada cambio de alcance debe conservar su motivo y sus IDs afectados. No usar un botón, un test unitario, un build o una captura aislada como evidencia de un recorrido completo.

## 2. Resultado y experiencia

FOR U debe conocerte antes de proponerte trabajo. Debe sentirse futurista, elegante, cálida y jugable, con orientación familiar y baja carga de decisión. El diagnóstico da origen a una ruta reconocible; el mapa representa decisiones de la persona, no una lista genérica impuesta.

- Identidad original: logo y animación recibidos; Inter; perlado `#F4F0EA`, lavanda `#EDE7F7`, violeta `#7751B8`, mint `#A9E8D7`, dorado `#D9B46B`, carbón `#24232A`. Rosa/cyan anteriores se conservan donde tengan identidad histórica justificada, sin sustituir la paleta confirmada.
- Brillos iridiscentes puntuales, formas suaves, iconos coherentes, transiciones breves; sin burbujas aleatorias, esperas artificiales ni nuevos premios comerciales.
- **Una sola pregunta o decisión de edición visible a la vez en toda FOR U**, no solo en la bienvenida. Incluye campañas, ofertas, perfil, calendario, operación y configuración. Opciones de una misma pregunta pueden mostrarse juntas. Una página terminada o un resumen puede mostrar varios datos, pero corregirlos abre un único detalle. Recoger el trabajo de fondo mientras se responde; no apilar el panel debajo de contenidos. Atrás conserva lo escrito; omitir o revisar no obliga a completar campos. Una acción principal por momento; revelar controles cuando corresponden; resultado visible. No convertir formularios largos en lienzos vacíos ni menús incomprensibles.
- Pantalla de trabajo amplia, navegación compacta y controles secundarios recogidos; botones con icono/texto centrados, dimensiones consistentes y foco visible. Acciones no deben parecer enlaces subrayados sin contexto.
- Conservar todas las funciones; niveles guían recomendaciones y controles destacados, **no bloquean herramientas ni cambian suscripción**.
- La aceptación técnica y la aprobación de experiencia visual son independientes.

## 3. Bienvenida y entradas

Animación original una vez por apertura, saltable, mientras la app carga en paralelo; no repetirla al navegar. Sonido opcional, inicialmente no obligatorio. Movimiento reducido, fallo o video no disponible: logo estático y entrada inmediata.

Tres entradas siempre comprensibles:

1. **Preparar mi ruta**: diagnóstico guiado.
2. **Explorar primero**: conocer la app sin completar diagnóstico ni aportar materiales.
3. **Crear manualmente**: elegir página, contenido u operación; abrir el editor especializado correcto, no otro tablero.

En la guía: una pregunta por pantalla, icono, mini tutorial sobre su utilidad, tarjetas seleccionables y ejemplos breves; selección múltiple cuando corresponde. Texto y audio son alternativas. Atrás, Omitir/Lo definiré después y Continuar después disponibles. Continuar guarda antes de avanzar; error conserva respuesta y posición; reintento no duplica proyecto. Recuperar último paso guardado tras recarga. No pedir fotos, documentos ni misión profesionalmente redactada para explorar.

## 4. Conocer a la persona y al proyecto

| Dato/pregunta | Opciones o interacción | Propiedad y efecto |
| --- | --- | --- |
| Nombre preferido | Texto u omitir | Cuenta; trato personal |
| Cómo hablarle | Femenino, masculino, neutral, prefiero no decir; arroba si la elige | Cuenta; jamás inferir de nombre, voz o imagen; omisión usa redacción neutral |
| Nombre del proyecto | Texto o todavía lo estoy pensando | Proyecto; nombre provisional identificado, editable |
| Actividad | Restaurante, tienda, turismo, hospedaje, cursos, servicios/ofertas mixtas | Proyecto; elegir una vez, combinar ofertas sin repetir rubro |
| Momento | Explorando, empezando, ya vendo, ordenar/mejorar | Proyecto; punto inicial y recomendaciones |
| Equipo | Por mi cuenta, equipo, todavía definiendo; cantidad opcional cuando aporte | Proyecto; responsables y carga sugerida |
| Antigüedad | Idea, menos de un año, uno a tres, más de tres | Proyecto; recorrido |
| Origen | Familiar, iniciativa personal, socios, necesidad, oportunidad, otra historia | Proyecto; texto revisable, no biografía inventada |
| Propósito/brújula | Opciones pertinentes, palabras propias o audio; omitir | Proyecto; qué quiere aportar, sin diagnóstico emocional inferido |
| Horizonte/visión | Opciones y objetivo propio; omitir | Proyecto; dirección revisable |
| Público/necesidad | Opciones del rubro y alternativa libre | Propuesta canónica; reutilizable en página y contenido |
| Primer objetivo | Presentarme, vender oferta, crear contenido, ordenar negocio, explorar | Proyecto; siguiente resultado destacado |
| Situación existente | Ofertas/productos, web/redes, ventas y operación actuales | Proyecto y referencias a propuesta/catálogo; no importar ni asumir conexiones por declararlas |

Nombre personal no es nombre comercial. Historia, diagnóstico, propósito y visión pertenecen al proyecto. Datos comerciales se editan en la propuesta/catálogo canónicos, sin segunda copia editable en la guía. Ventas es opcional, con periodo explícito; ingresos no fijan nivel ni acceso. Studio4U, Marketing4U, Ironic, Finca Intiquilla y Puy mantienen identidades propias. Café/coworking y Valle Sagrado no son textos predeterminados universales.

## 5. Marketing adaptativo, primera área

| Pregunta | Opciones que deben existir | Efecto verificable |
| --- | --- | --- |
| Qué lograr | Conocerme, conversar, confianza, oferta, recuperar interesados, fidelizar | Momento de venta y plantillas |
| Cómo crear cómodamente | Cámara, voz, escribir, producto, proceso, no sé | Formatos y ayudas prioritarias |
| Qué evitar ahora | Cara, voz, editar video, escribir mucho, publicar seguido, nada | Reducir exigencia sin quitar acceso |
| Qué material existe | Ninguno, fotos, videos, textos, testimonios autorizados, publicaciones previas | Composición tipográfica o recursos confirmados; adjuntar después |
| Herramientas conocidas | Canva, CapCut, Instagram, TikTok, otras, ninguna | Nivel de explicación, no nuevas integraciones obligatorias |
| Tiempo disponible | Sesiones breves, bloque semanal, varios momentos, no sé | Carga sugerida editable |
| Fricción principal | Qué decir, empezar, vergüenza, edición, falta material, organización | Ayuda contextual, no etiqueta psicológica |
| Canal inicial | Instagram, TikTok, WhatsApp, mi página, no sé | Formatos/destinos pertinentes, no conexión supuesta |
| Difusión | Orgánico, explorar anuncios, ya anuncio, no sé | Ruta comercial, sin gasto automático |

Ejemplos obligatorios de reglas: sin fotos/sin cara → tipografía y voz opcional; cómoda hablando/sin editar → guion y teleprompter; muchas fotos/desorden → biblioteca y tres composiciones; ninguna herramienta → ayuda integrada; poco tiempo → una pieza y un siguiente paso, no diez obligaciones. Solo mostrar preguntas pertinentes; guardar también lo omitido para no insistir sin motivo.

Publicidad: presupuesto y duración opcionales; S/10 diarios por siete días es un ejemplo editable solicitado por la propietaria, no mínimo ni garantía. Orgánico prioriza sostenibilidad/reutilización; anuncios prepara oferta, página, pieza y medición; anuncios existentes pregunta qué mejorar. Recordatorios requieren elección explícita de frecuencia y desactivación. Elegir orgánico no activa más avisos. No crear campañas pagadas, cobrar ni autorizar proveedor desde el diagnóstico.

## 6. Finanzas, logística y operaciones adaptativas

Se ofrecen después de marketing o se posponen. Opciones por rubro, textos breves y selección antes que escritura. Ningún importe privado es obligatorio.

| Área | Pregunta | Opciones mínimas | Resultado |
| --- | --- | --- | --- |
| Finanzas | Precios definidos | Sí/algunos/no | Catálogo o revisión |
| Finanzas | Costo de entregar oferta | Sí/parcial/no | Costo directo o receta |
| Finanzas | Registro de dinero | Cuaderno/hoja/herramienta/no registro | Organización inicial |
| Logística | Entrega/recepción | Local/recojo/delivery/digital/reserva/otra | Modalidades pertinentes |
| Logística | Qué controlar | Materiales/compras/inventario/horarios/disponibilidad | Herramientas destacadas |
| Logística | Dificultad | Faltantes/entregas/coordinación/proveedores/no sé | Prioridad |
| Operaciones | Llegada de solicitudes | WhatsApp/redes/página/presencial/varios | Flujo de atención |
| Operaciones | Control de pendientes | Memoria/mensajes/lista/calendario/sistema | Organización |
| Operaciones | Responsables | Yo/equipo/externos | Recomendación de responsables |
| Operaciones | Ordenar primero | Pedidos/reservas/seguimiento/educación/cotizaciones | Acceso al proceso |

## 7. Síntesis y preparación personalizada

Mostrar «Esto entendimos de ti» con corrección antes de **Preparar mi espacio**. Reglas versionadas y transparentes preparan sugerencias, no hechos ficticios:

- Ruta y etapa: Explorar → Dar forma → Preparar → Operar → Mejorar.
- Página inicial según rubro, secciones elegidas y datos confirmados; propuesta existente se conserva.
- Tareas propuestas con «Te la proponemos porque elegiste…», aceptar/posponer/quitar.
- Configuración pertinente de Studio/operación; tres principales y destacados sugeridos.
- Calendario solo con fechas elegidas o propuestas aceptadas, nunca agenda inventada.

Preparación con progreso real, sin retrasos artificiales ni atribuir reglas a IA. Al terminar mostrar el mapa y explicar que nació de las elecciones. El primer resultado puede ser página, contenido u operación según necesidad. Repetir preparación es idempotente. Cambiar preferencias ofrece diferencias y no borra trabajo aceptado ni sobrescribe ediciones. Responder no completa tareas.

No es requisito completar las cuatro áreas para empezar la página, crear contenido o acceder a operación. Posponer áreas conserva un resultado útil y la posibilidad de ampliar después.

«Estrategia en diez minutos» es un objetivo medido para primera estrategia editable, borrador y siguiente paso comprensible; no promete estrategia comercial validada, publicación, anuncios activos ni video grabado. Registrar tiempo y comprensión observados, no una cifra de éxito inventada.

## 8. Navegación y trabajo compartido

Dentro de cada proyecto visibles: **Mapa · Kanban · Calendario · Mi mundo**, sin exigir landing ni diagnóstico. No esconderlos en menú. Tras la preparación inicial el mapa es primera vista; recordar luego la elegida. Explorar/manual conservan acceso inmediato sin tener que completar diagnóstico.

Espacios: **Mi página** (propuesta/catálogo/editor), **Creator Studio** (campañas/plantillas/diseños/perfil/guion/video/biblioteca), **Mi operación**, **Resultados**, **Configuración**. Desde cualquier herramienta: **Volver a mi mapa**, conservando proyecto y trabajo. Hoy admite hasta tres prioridades de tareas existentes; Continuar recuerda destino por proyecto.

Mapa con Marketing, Finanzas, Logística y Operaciones: tareas circulares seleccionables, información definida y resultados diferenciados; foco por rama en móvil con regreso al mapa completo. Detalle de tarea abre herramienta concreta. Kanban: Por hacer/En curso/Hecho. Calendario: agenda interna, tareas fechadas y piezas referenciadas, apertura del origen, sin copias editables. Cambiar vista no cambia el registro ni duplica recompensa.

## 9. Seis rutas especializadas

Cada ruta define preguntas, diagnóstico, tareas propuestas, página, plantillas, herramientas y criterios de preparación. El rubro orienta sin impedir ofertas mixtas o widgets autorizados. Servicios necesita recorrido propio comprensible; no hacerlo pasar por restaurante ni elegir nuevamente el rubro.

| Rubro | Página/oferta | Operación/localización exigida |
| --- | --- | --- |
| Restaurante | Menú, categorías, platos, presentaciones/extras, historia, FAQ, testimonios reales, ubicación y horarios | Mesa/recojo/delivery, pedidos, recetas, compras, inventario, costos |
| Tienda | Productos, variantes, condiciones, entrega y compra | Pedidos, clientes, entregas/seguimiento |
| Turismo | Experiencias, itinerario, duración, condiciones, consulta/reserva | Horarios, salidas, cupos, solicitudes/reservas realmente disponibles |
| Hospedaje | Habitaciones, servicios, ubicación, condiciones | Solicitudes, estadías y coordinación de disponibilidad |
| Cursos | Presentación, temario, módulos, lecciones, videos/materiales | Organización y acceso autorizado realmente implementado, sin afirmar aula completa por sus pantallas |
| Servicios/mixtas | Servicios, paquetes, alcance, proceso, cotización | Solicitudes, cotizaciones versionadas, seguimiento |

Negocio que vende puede empezar por operación; explorar no requiere recursos. No presentar reservas automáticas, aula, sincronización o integración como funcionales antes de verificarlas.

## 10. Página principal y editor

Seleccionar qué necesita comunicar mediante miniaturas: oferta/catálogo del rubro, historia, cómo comprar/consultar/reservar, horarios/ubicación, FAQ, testimonios reales y contacto. Selección inicial apropiada, agregar/quitar/posponer. Precios, condiciones y contactos requieren confirmación.

**Editar mi página** abre directamente la página especializada. Barra compacta: volver, escritorio/móvil, deshacer/rehacer, guardado y Publicar. Texto editable directo conservando párrafos/selección/historial; foto → subir/biblioteca/encuadrar/reemplazar; oferta → catálogo original con IDs, precios, variantes y extras; CTA → texto/destino/alineación/variante de marca. URL es opción secundaria, no primera solicitud de foto.

Entre bloques: **＋ Sección** con miniaturas; insertar por posición, arrastrar con indicador y alternativas accesibles subir/bajar. Paneles contextuales, inferiores en celular; configuración, widgets y avanzados recogidos. Crear contenido/pieza desde sección. Vista móvil de ancho real, diferenciada del escritorio.

Secciones como composiciones completas: sin foto, tipografía deliberada e iconos discretos, no grandes rectángulos grises ni lienzo ininteligible. Restaurante muestra orientaciones «Tu producto», «Añadir precio», icono de foto; no son catálogo ni publicables hasta completarlas. Sin borrador: usar datos confirmados o estructura vacía diseñada, nunca contenido comercial de ejemplo. No inventar historia, testimonios, precios, resultados, dirección ni condiciones.

Arrastre de fotos por destino en escritorio, indicador de ubicación y subida; tocar/elegir suficiente en celular. Comprobar formatos de iPhone y avisar incompatibilidad antes de perder material. No prometer conversión HEIC sin implementarla. Puente iframe: origen, ventana, canal, IDs y operaciones permitidas; nunca aceptar rutas arbitrarias.

## 11. Propuesta, ofertas y páginas específicas

Propuesta visual con tarjetas de oferta, público, mensaje y contacto; historia/equipo/condiciones cuando aportan. Reutilizar guía sin segunda copia comercial. Preparar página existente muestra solo diferencias reales y aplica las elegidas al borrador, conservando ediciones manuales.

Oferta específica referencia productos/servicios del catálogo y define beneficio (2×1/paquete/descuento/otro), precio confirmado, condiciones, vigencia opcional, modalidad, público, mensaje, CTA y disponibilidad/límite solo confirmados. Ejemplo QA: dos cafés para compartir ideas; no confundirlo con oferta real de Studio4U.

Oferta → landing propia → campaña → publicaciones/historias → guion/portada. Diferenciar página principal y múltiples páginas de oferta, sin catálogo duplicado. Una promoción no se activa por responder. Guardar, exportar, publicar o activar siguen siendo acciones distintas. Publicación solo con precio/condiciones válidos y confirmación del propietario; no publicar negocios reales durante QA.

## 12. Creator Studio y campañas

Cuatro vistas internas: **Campañas · Crear · Mi perfil · Biblioteca**. Plantillas, guiones y video son capacidades integradas, no destinos desconectados. No repetir rubro. Conservar accesos antiguos con contexto.

Campaña reúne objetivo, oferta, periodo y referencias a piezas; crear sin campaña permitido. Plantillas por seis momentos: dar a conocer, conversar/conectar, confianza, oferta, retomar contacto, fidelizar. Primero intención; luego oferta (negocio/producto/servicio/paquete/promoción), cómo comunicar, campaña opcional y formato. Escritorio juntos; móvil por pasos/panel compacto; selecciones pertinentes recordadas y editables.

Desde idea, sección, oferta o página: **tres propuestas visuales distintas** con información confirmada y plantillas/reglas sin llamada Gemini. Elegir borrador o publicación y registrar fuente/revisión. Reunir título, texto, imagen, oferta/precio confirmado, identidad, público, CTA. Sin imagen: tipografía o elegir después, no foto inventada. Preparar propuestas no las guarda automáticamente en biblioteca.

Pieza conserva diseño, capas de texto/imagen/logo/CTA, texto del post, oferta, campaña, guion, tomas, archivos, video, portada, fecha y estado mediante referencias. Variantes e historial; deshacer/rehacer; encuadre, longitud/distribución adaptadas; detectar desbordamiento. Formatos 1:1, 4:5, 9:16. Carrusel con identidad de grupo/orden, no copias inconexas. Diseño editable persistente y exportación de imagen real. Cambios de landing señalan revisión sin sobrescribir diseños editados/exportados. No simular IA ni descarga ni espera mágica: el asombro viene de un resultado útil visible.

## 13. Perfil, destacados y biblioteca

Maqueta editable: foto, nombre, bio, enlace, destacados, cuadrícula. Tres principales recomendadas: **Conóceme** (identidad/reconocimiento), **Conversemos** (interacción), **Esto puedes elegir** (oferta/compra). Editar/sustituir/posponer sin bloquear Studio ni exigir diez publicaciones.

Casillas con miniatura real y enlace a la pieza; reel usa portada, encuadre de cuadrícula independiente. Reordenar por arrastre y botones; planificación no reordena Instagram ni cambia fechas. **Ordenar mi contenido**: cuadrícula/lista/calendario, filtros por campaña/momento/estado, sin duplicar registros.

Destacados: sugerencias por rubro (Empieza aquí/Menú/Historia/Cómo pedir/Ubicación/Preguntas), nombres, portadas, materiales/piezas y vista del resultado. Biblioteca por proyecto/pieza: fotos, audios, diseños, videos, portadas; miniaturas, subida y estados reales de carga/guardado/error; no confundir archivos privados con URLs firmadas permanentes.

## 14. Video desde el post

**Post → guion → teleprompter/ensayo → grabación → revisión/repetición → portada → guardar en la misma pieza**. Guion manual o IA explícita. Cámara/micrófono solo al iniciar acción; denegación/cancelación no pierde post/guion. Guardar archivo y formato real; conservar proyecto/campaña/pieza al volver o recargar.

Portada desde diseño vertical o fotograma; encuadre para cuadrícula separado. Reutilizar recorte y subtítulos existentes tras verificar exportación real, compatibilidad y autorización de cualquier IA. No anunciar Instagram compatible/publicado sin prueba. Video generativo, montaje automático y dirección avanzada de transiciones/tomas son evolución futura, no entrega inicial.

## 15. Ayuda, ideas, descanso y mundo

Carita FOR U junto al Pomodoro, compactos y sin cubrir trabajo/teclado/modales. **Tengo una duda**: ayuda preparada por pantalla, búsqueda, enlaces y guardar duda si no encuentra respuesta; no simular conversación inteligente ni consumir Gemini. **Tengo una idea**: guardar texto/adjuntos por proyecto o bandeja personal sin IA. Ordenar hasta diez seleccionadas usa IA explícita, conserva originales, propone Marketing/Finanzas/Logística/Operaciones/Por aclarar; revisión manual antes de aceptar. Convertir idea en tarea es acción distinta e idempotente. No ejecutar herramientas ni publicar por clasificar.

Mi mundo y tablero gratuitos, sin bloqueo por landing, onboarding o logro; tareas/progreso compartidos. Isla por proyecto, barco/cámara, cuatro espacios/mascotas, Avanzar/Descansar, tres pendientes destacados y lista completa, búsqueda de tres objetos, caricias/snack y decoración conservada. Jugar no cambia tareas. Sin nuevas monedas, enemigos, XP, penalización por ausencia ni recompensas repetidas al reabrir/eliminar/repetir búsqueda.

Tareas y decoración con revisiones/estados independientes; reclamos históricos y primera finalización conservados aun ante fallo parcial. Formatos v1 y nodos antiguos legibles, desconocidos rechazados sin reemplazo. Brújula/emoción explícitas editables/omitibles; no sobrescribir JSONB ajeno. Modo Pro es logro por cuatro áreas guardadas, no contratación/suscripción/almacenamiento.

Pomodoro global persistente por cuenta/navegador-dispositivo, reloj por vencimiento, coordinación entre pestañas, celebración única, recuperación explícita del timer antiguo; no prometer sincronización teléfono/Mac sin fuente remota.

3D diferido, límite de islas visibles y DPR/calidad, pausa al ocultar sin degradación permanente por visibilidad. Sin WebGL/pérdida de contexto/carga fallida: alternativa ligera con mismos espacios/tareas/mascotas/juegos y reintento. Medición real 60 s tras carga (reposo/cambio de isla/espacios), dispositivo/navegador/calidad/FPS/pausas, objetivo >=30 FPS medios en móvil de referencia. Prueba antigua de iPhone16/Safari: 59.4 FPS/60 s, no valida renderizados nuevos ni otros móviles.

## 16. Operación, calendario, resultados y conexiones

Restaurante: menú publicado → carrito → pedido → preparación/entrega → seguimiento. Activación explícita de mesa/recojo/delivery; horarios, zonas y tarifas validados. Totales de publicación y servidor, presentaciones/extras conservados, invitado/perfil opcional y seguimiento privado. Pago y ejecución separados. No se descuenta ingrediente por recibir pedido; mantener preparación confirmada existente.

Costos: compra con cantidad/unidad/costo, vínculo plato-receta-ingrediente, rendimiento/porciones y unidades compatibles. Costo directo confirmado si no hay receta. Ingrediente sin costo: **Costo incompleto**, no cero. Precio menos costo registrado no es utilidad neta. Compra aumenta inventario una sola vez; duplicado/reintento no vuelve a sumar. Preservar catálogo y stock históricos.

Reservas: disponibilidad real → solicitud/confirmación según capacidad implementada → gestión. Reserva guardada, aceptación del proveedor de correo y recepción del destinatario son evidencias distintas. Horarios/cupos/solapamientos según rubro; no inventar reserva automática de hospedaje ni aula.

Calendario: agenda interna persistente, tareas y piezas fechadas por referencias; detalle abre origen, fecha local/zona horaria explícitas, exportación y recordatorios según capacidad real. Google Calendar solo se usa como fuente tras conexión/lectura comprobadas; abrir su web no conecta. Recordatorios internos con app abierta no equivalen a push/correo programado.

Resultados: avances de áreas, visitas, contactos, pedidos/métricas comprobadas y detalle; clic no es venta. Diferenciar carga, vacío válido, fallo, configuración pendiente, autorización vencida. Nunca cero por error ni conexión por visitar web.

Conexiones/cobros en configuración única, estado y regreso al trabajo. Automatizaciones distinguen mensaje preparado y conexión real. No crear OAuth nuevo ni sincronizaciones no acordadas solo por rediseñar. Credenciales nunca en frontend/chat/logs.

Mercado Pago existente se conserva: PEN/Perú, autorización explícita por negocio, coordinación/opcional/obligatorio; validación y cifrado en servidor, precios de catálogo publicado/cotización vigente, idempotencia y consulta antes de reintentar incertidumbre, webhook firmado y validación de vendedor/app/referencia/monto/moneda/entorno. Retorno no prueba pago; cancelar no devuelve; devolución desde proveedor; histórico al desconectar; widgets compran en fuente, no carrito entre negocios. Sin cobros productivos, comisiones nuevas ni suscripciones en QA. Cuentas/proveedor/correo/Meta siguen pendientes hasta evidencia externa.

## 17. Persistencia, publicación y seguridad

- Una sesión Supabase; documentos privados por cuenta/proyecto y revisiones. Descartar respuestas de cargas antiguas/cambio de cuenta. Bloqueos de guardado, reintentos idempotentes, estados pendiente/guardando/guardado/error/conflicto por documento; informar guardado parcial conservando pendientes.
- Actualización externa refresca limpio; con cambios locales conservarlos y exigir recuperación explícita con aviso interno. No confirmaciones nativas como recorrido principal; el cierre del navegador puede usar protección propia del navegador.
- Formatos versionados, compatibilidad de lectura y conversión solo al guardar cambio explícito. Rechazar formatos desconocidos sin sustituir. Conservar UUID/URLs/catálogos/tareas/archivos/nodos/recompensas/publicaciones/documentos históricos.
- Propuesta, catálogo, borrador, publicación y piezas sociales separados; costos, clientes, contactos privados, recetas y stock nunca públicos. Catálogo fuente única de precios, instantáneas identificadas y revisión de propietario/publicación coherente.
- Solo Publicar modifica la página pública; comparación antes/después y republicación explícita. Publicaciones antiguas mantienen presentación hasta republicar; no migrar al leer ni cambiar marca/ofertas/fotos/contacto.
- Widgets propios/compartidos autorizados: fuente publicada y permisos comprobados en servidor, sin borradores/datos privados, ciclos o anidamientos; retirada/revocación con indisponibilidad clara; compra dirige a negocio fuente.
- Audios/borradores privados; fotos públicas solo elegidas para publicar. No guardar enlaces firmados como recurso permanente. Revisar políticas heredadas detectadas antes de ampliar consumidores, sin borrarlas indiscriminadamente.
- SQL nuevo únicamente después de diagnóstico remoto y prueba aislada; nunca ejecutar todas las migraciones históricas. Objetivos 1–2 no autorizan SQL. No desactivar verificaciones de seguridad por conveniencia.

## 18. IA explícita y económica

Reutilizar **toolkit-ai** autenticado con propiedad de proyecto/revisión. Adaptador Gemini configurable, modelo/cuota gratuitos verificados al activar; clave exclusivamente en secretos de servidor, nunca leer/copiar por chat o bundle. Ruta antigua Gemini/chat no debe quedar como acceso desprotegido. La última evidencia remota histórica es «Falta configurar Gemini en el servidor»; revalidar, no asumir que sigue igual ni que la clave local configura el servidor.

Operaciones: clasificar ideas, preparar contenido (objetivo/titular/texto/CTA), proponer composición de bloques/plantillas permitidos, guion (apertura/desarrollo/cierre/tomas), página (secciones desde datos confirmados), dividir tarea (referencia/título práctico/descripción/hasta tres pasos/icono permitido/estimación opcional/título lúdico opcional), interpretar material por referencia y revisión con transcripción revisable. Sin XP ni enemigos. Chat/guion/propuesta con esquemas propios, no esquema de misión universal.

JSON mediante configuración compatible y validación servidor: formatos desconocidos, truncados, campos/bloques inválidos o incompletos rechazados sin modificar documentos. Datos adjuntos/tareas no sustituyen instrucciones de sistema; contexto autorizado/acotado, sin agenda completa. JSON válido no asegura verdad. No inventar precios/testimonios/ventas/emociones/acciones realizadas.

Sin llamada al abrir/escribir/navegar/adjuntar/grabar; solo botón explícito. Propuestas editables y aceptación separada antes de incorporar; guardar/publicar siguen siendo decisiones distintas. Composición determinista de piezas no gasta IA. Una variante adicional exige otro clic.

Mantener cuota existente (actual código: 30/h), límites por operación, exclusión de duplicados simultáneos y caché de cinco minutos por cuenta/proyecto/acción/contenido/revisión; invalidar al cambiar fuente. Errores recuperables sin regeneración ilimitada; sesión vencida, cuota, proveedor y JSON inválido diferenciados; manual/orientación local identificados. Logs de uso/tokens sin textos privados, secretos o medios. Sin fallback pagado, facturación nueva, caché explícita de pago ni promesa del 90% de ahorro. Generación/edición de imágenes preparada pero desactivada hasta presupuesto y límites posteriores; no usar directorio público temporal para audios/borradores.

## 19. Validación y límites de ejecución

Orden de trabajo: objetivos 1–2 documentación/maqueta → aprobación visual explícita → 3 datos/navegación → 4 bienvenida → 5 diagnóstico → 6 ruta → 7 páginas → 8 ofertas → 9 Studio → 10 perfil → 11 video → 12 Gemini → 13 operación → 14 cobertura completa → 15 validación transversal → 16 cierre integrado. No empezar el siguiente por registrar su alcance. Bloqueo externo de un proveedor no impide trabajo independiente, pero tampoco permite declarar ese recorrido terminado.

En cada objetivo: revisar requisitos y base, cambios acotados/reutilización, pruebas proporcionales, evidencia, pendientes y commit revisable cuando se modifique implementación. Mantener Vite4, Tailwind3, Node18/20; sin nuevas librerías de animación. Historial no autoriza elegir modelos/agentes/cambiar dependencias sin necesidad.

Accesibilidad en todas las entregas: contraste de texto normal >=4.5:1, foco, teclado, modales accesibles, Escape/retorno, movimiento reducido, targets >=44px, no acción exclusiva de hover/arrastre. Panel inferior móvil, áreas seguras, orientación, teclado/zoom y medios Safari. Verificar anchos CSS efectivos 360/768/1440, no solo tamaño solicitado. Recorrido físico iPhone16/Safari separado de emulación; HTTPS necesario para micrófono/cámara, HTTP LAN no prueba compatibilidad.

QA exclusivamente: dos proyectos, guardado/recarga/continuidad, red real y transporte controlado identificados, reintento/guardado parcial/conflicto entre pestañas, permisos/manipulación de precios, publicación anónima independiente. Aislamiento remoto entre cuentas requiere segunda sesión autorizada; PostgreSQL aislado no la sustituye.

Recorrido final: bienvenida → diagnóstico corregible → espacio personalizado → mapa/tarea → página → oferta y su landing → campaña → tres propuestas → pieza/guardar/recargar/exportar → guion/grabar/portada → perfil/destacados/biblioteca/calendario → operación/resultados. Repetir sin materiales, negocio existente y manual. Verificar borrador posterior sin cambiar publicación/piezas. TypeScript, pruebas pertinentes y build, versión local y dominio comparadas antes de indicar dónde probar.

**Prohibiciones vigentes:** no modificar INTI CHURIN; no publicar negocios reales; no desplegar Hostinger ni activar cobros productivos/facturación durante estas pruebas. Hostinger tendrá comprobación separada después de preparar versión y autorización correspondiente. No pedir secretos en chat. No dejar de registrar correo, Meta, cuotas de almacenamiento, segunda cuenta, aula y otros proveedores pendientes.

**Fuera de esta versión, conservado como futuro:** imágenes generativas con presupuesto, montajes/video generativo, dirección avanzada de transiciones, cuotas comerciales nuevas y publicación Meta. Las conexiones externas que ya tengan código requieren sus pruebas propias antes de anunciarlas funcionales.

## 20. Addendum confirmado: esencia y pilares de contenido

Solicitud de Nicole del 22 de octubre: captar la esencia del negocio y lo que lo diferencia, incorporando pilares de contenido. Se suma a las secciones 1–19 y a los ajustes de prueba, sin reemplazarlos.

Una pregunta por pantalla, ejemplos seleccionables por rubro, respuestas múltiples compatibles, texto propio y omisión: sensaciones que se quiere cuidar, diferencia confirmada, voz de marca y límites de comunicación. La diferencia usa el campo canónico de la propuesta, sin duplicarlo. Las opciones son aspiraciones declaradas; no prueban calidad, emociones del cliente ni testimonios.

Hasta cinco pilares elegidos o escritos por la persona, sin obligarla a tener tres ni a completar la identidad para crear. Diferenciar pilar (tema), intención comercial (para qué) y oferta confirmada (qué se presenta). Creator Studio debe reutilizarlos, permitir crear sin pilar, guardar contexto/revisión con la pieza y organizar el contenido por tema sin duplicar documentos ni alterar fechas. Cambiar identidad futura no sobrescribe piezas existentes.

Interpretar audio o generar textos con IA requiere acción explícita y pruebas reales separadas. Las composiciones iniciales siguen usando reglas y recursos confirmados. No cerrar este addendum por aprobar tests: comprobar selección, guardado/recarga, retorno a Studio, contexto de pieza y filtros, escritorio/móvil/teclado, aislamiento por proyecto y aprobación visual de Nicole. La auditoría documental histórica no acredita este addendum.

## 21. Radar de inspiración — ampliación solicitada

- Referencias opcionales por proyecto: nombre, @usuario o enlace; capturas privadas opcionales. No se exige material para explorar.
- Una pregunta por pantalla: identificar → elegir varios aspectos que gustan → indicar qué adaptar o evitar. Atrás, guardado de cada paso y recuperación tras recarga. Varias referencias independientes, editables posteriormente desde Studio.
- Aspectos: colores/estilo, fotografías, escritura, videos, explicaciones, organización del perfil y presentación de ofertas; notas propias opcionales.
- Mantener separado referencia, esencia, diferencia, pilares y objetivo comercial. Las referencias orientan; no sustituyen la identidad ni son afirmaciones comerciales.
- No visitar perfiles ni invocar IA al adjuntar o guardar. Cualquier interpretación futura será explícita y revisable. No copiar automáticamente textos, fotos ni identidad de terceros.
- Las composiciones conservan una instantánea privada de las notas confirmadas, sin introducir perfiles o notas como texto público ni copiar capturas a diseños. No anunciar análisis de perfiles no realizado.
- Guardado compatible en diagnóstico versionado y por proyecto; conservar documentos anteriores, publicaciones y catálogo. No activar facturación ni publicar negocios reales.

## 22. IA contextual inspirada en NotebookLM

Referencia investigada y adaptación detallada en [FOR_U_NOTEBOOKLM_REFERENCE.md](FOR_U_NOTEBOOKLM_REFERENCE.md). Fuentes elegidas, acciones contextuales, procedencia verificable, resultados separados y aceptación explícita. Integrar identidad/pilares/referencias mediante selección del usuario y resolución autorizada en servidor; no asumir lectura de perfiles ni enviar todo el negocio. Mantener una entrada contextual a IA y las composiciones locales sin consumo. Conservar límites, caché por revisión y trabajo manual, sin ahorro prometido, facturación nueva ni automatismos al navegar. Esta ampliación sigue pendiente de implementación y prueba con proveedor real; no confundir investigar la referencia con disponer de esas capacidades.


## 23. Entrega final añadida el24 de octubre — página de enlaces y hasta tres promociones

Ampliación solicitada después del trabajo en pedidos: se ejecutará al final sin sustituir los requisitos anteriores.

### Página de enlaces personalizable
Una página tipo Linktree dentro de FOR U, sencilla y funcional: foto/logo opcional, nombre, bio breve, botones de enlaces con título y destino, orden editable por arrastre y controles equivalentes, colores/fondo y apariencia de marca, previsualización móvil y enlace público propio. Usar el editor y la biblioteca compartidos; tocar un elemento abre una sola decisión. No es una réplica acreditada de todas las funciones comerciales o planes de Linktree ni una integración con ese servicio. Validar los destinos; nunca aceptar javascript: u otros esquemas arbitrarios. Enlaces a la página principal y promociones del propio proyecto deben elegirse sin volver a copiar información. Mantener borrador, publicación, guardado con revisión y separación por cuenta/proyecto.

### Hasta tres landings para venta directa de promociones/ofertas
Preparar por defecto hasta tres borradores independientes, editables y con enlace/identificador propio, a partir de ofertas confirmadas del proyecto. La cantidad es el alcance de los borradores iniciales, no una nueva cuota comercial o suscripción. Si todavía no hay ofertas confirmadas, ofrecer espacios orientativos para crearlas; no inventar2x1, precios, stock, condiciones, urgencia, testimonios ni promociones publicables.
Cada landing reúne oferta concreta, beneficio confirmado, productos/variantes/precio del catálogo único, condiciones aportadas y CTA adecuado a su capacidad real (comprar, pedir, reservar, cotizar o contactar). Reutiliza las interacciones del editor especializado; no copia precios editables fuera del catálogo. Puede incluir fotos después o composición tipográfica sin foto. Publicar cada promoción es explícito y no reemplaza ni republica la página principal o la página de enlaces. Señalar la revisión necesaria cuando cambie la oferta, sin sobrescribir ediciones manuales. Los canales de compra/reserva deben estar comprobados antes de presentarse como activos.

Aceptación: crear/editar página de enlaces → ordenar botones → guardar/recargar → abrir borrador de promoción1/2/3 → editar contenido → regresar a página de enlaces, conservando proyecto y cambios. Verificar dos proyectos,360/768/1440, ausencia de fotos y ofertas iniciales, enlaces inválidos, errores/conflictos y publicación separada en QA autorizado. La aprobación visual es independiente de los tests. Estado inicial pendiente: este registro no acredita implementación.

## 24. Correcciones de la prueba del 24 de octubre — obligatorias y acumulativas

- FOR U no es una interfaz dominada por morado. Superficies sobrias y legibles, acentos pastel variados y acciones perladas/iridiscentes; conservar logo y animación originales. El violeta es un acento posible, no el color de todos los controles.
- Abrir proyecto debe tener un destino previsible. La ruta muestra pasos numerados y el siguiente paso real; el resumen de respuestas se llama «Ajustar mis respuestas» y no sustituye esa ruta. Conservar acceso manual a mapa, Kanban, calendario y mundo.
- El mapa es también un espacio de pensamiento: capturar una idea, conservarla, pedir a FOR U que proponga su área, revisar/aceptar y verla en la rama correspondiente. Clasificar no crea tareas ni premios; convertir en paso es una decisión explícita sobre los mismos registros de tareas. Audio e ideas derivadas siguen incluidos y pendientes de verificar en ese recorrido.
- Studio separa tema, desarrollo de la idea, intención y diseño. Nunca mostrar miniaturas de diseño al preguntar por temas. Las tres intenciones principales son reconocimiento, conversación y oferta. Las seis categorías históricas de plantillas no son seis pasos obligatorios de venta; permanecen como organización secundaria de plantillas/campañas.
- Pilares: tres espacios grandes iniciales para desarrollar temas propios; conservar pilares adicionales históricos sin borrarlos. Elegir una etiqueta no satisface por sí solo el espacio para desarrollar un pilar.
- Acción contextual FOR U para transformar ideas, contenido y guion hacia una intención de venta: llamada explícita, fuentes y revisión antes de aplicar, conservar original, sin inventar resultados ni datos comerciales. Usar la identidad/animación de FOR U con movimiento reducido. La animación acompaña la respuesta real y no introduce esperas falsas.
- La aprobación visual sigue pendiente hasta probar estos recorridos. Una captura técnica ni una suite verde equivalen a aprobación de la experiencia.
