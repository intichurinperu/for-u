# FOR U — Experiencia completa para diseñar en Stitch

Versión consolidada: 24 de octubre de 2026. Idioma de la interfaz: español.

Este es el contrato de experiencia que debe representar la maqueta. **No es una declaración de que todo esté terminado.** Reúne las decisiones de Nicole y las contrasta con el código local. El inventario CSV adjunto enumera los accesos existentes, las vistas internas y los destinos acordados.

## 1. Qué producto estamos diseñando

FOR U acompaña a una persona desde una idea hasta la comunicación, venta y operación de su negocio. Primero entiende quién es, qué necesita, qué ya tiene y cómo le resulta cómodo trabajar. Después propone una ruta que la persona reconoce como propia.

La experiencia debe permitir pensar, decidir, crear y actuar sin aprender un catálogo de herramientas. Su carácter de juego viene de la exploración, los resultados que toman forma y el avance comprensible; no de puntos arbitrarios, pantallas infantiles o decoración que compita con el trabajo.

La promesa de diseño es: **«Lo que tienes en la cabeza encuentra su lugar y se convierte, a tu ritmo, en algo que puedes usar».**

El destino puede ser una primera venta, una próxima venta o una operación más ordenada. No todos comienzan desde cero. Tener más ventas no define el valor de la persona, su nivel ni su acceso a herramientas.

### Situación actual, sin confundirla con la experiencia final

- El router registra **52 patrones de URL**. La matriz anterior contiene **74 accesos**, incluyendo herramientas y destinos internos. Una URL no equivale a una pantalla única: el mismo editor tiene estados y paneles contextuales.
- Hay módulos de Restaurante, Tienda, Turismo, Hospedaje y Cursos. Servicios y ofertas mixtas es una sexta ruta semántica sobre propuesta y herramientas compartidas; no debe presentarse al usuario como una tienda o restaurante.
- Existen editor de landing, catálogos, propuestas, tareas, Kanban, calendario, mundo, diseños, perfil/cuadrícula, biblioteca, guiones, grabación, video y operaciones. Su integración y acabado son desiguales.
- Se han comprobado recorridos parciales QA de restaurante y servicios: algunas ediciones, guardados, recargas, retornos, diseño y texto IA. Eso **no prueba toda la aplicación**.
- El mapa conserva una composición visual que Nicole ha rechazado. Se añadió captura y clasificación explícita de ideas, pero **el rediseño visual del mapa continúa pendiente**.
- El taller de pilares permite desarrollar notas y guardarlas; está en implementación y validación. La experiencia unificada de «FOR U, enfoca esto para vender» sigue incompleta.
- No dar por operativos el aula pública, todos los circuitos de reservas/pedidos, las conexiones externas o la publicación en redes por el hecho de ver sus pantallas.
- La página tipo Linktree y la preparación de hasta tres landings promocionales siguen como requisitos añadidos pendientes. Existe trabajo previo sobre ofertas y páginas de oferta; no equivale a verificar esas dos capacidades nuevas completas.

## 2. Lenguaje visual y carga de decisión

### Identidad

Conservar logo y animación originales de FOR U. La marca es colorida: superficies sobrias, detalles pastel, perlados e iridiscentes. **No hacer todo morado.** Tampoco usar un degradado grande detrás de cada bloque.

Paleta orientativa para la maqueta, ajustable por aprobación visual: fondo marfil `#FAF9F6`, texto oscuro `#2D3430`, mint `#DEF0E6`, durazno/dorado suave `#F7EAD3`, rosa `#F4E3E9`, azul claro `#E2ECF7`, lavanda `#EAE3F1`. La lavanda es un acento más. No sustituir los colores propios de cada negocio por la paleta de la app.

Inter, jerarquía clara, aire suficiente, tarjetas coherentes, iconos de una misma familia. Texto oscuro en botones pastel. Ningún botón importante debe parecer deshabilitado cuando está disponible. Objetivos táctiles de al menos 44 px, contraste y foco visibles.

### Reglas de interacción

1. Una pregunta o decisión principal visible por vez.
2. Seleccionar respuestas compatibles puede ser multiselección. Continuar confirma el avance; elegir una opción no debe sorprender saltando a otra pregunta.
3. No pedir tema y diseño simultáneamente. No pedir fotos al comenzar.
4. Una acción principal clara. Alternativas como omitir, atrás o modo manual tienen menor peso visual.
5. La ayuda explica por qué sirve la decisión con una frase y un icono; no añade un ensayo.
6. Los paneles de edición aparecen por selección. No poner todos los campos y ajustes a la vista.
7. «Guardado», «pendiente», «error» y «conflicto» significan cosas distintas y deben verse distintos.
8. Una pantalla vacía debe ayudar a empezar. No mostrar números cero cuando falló la consulta ni llenar la app de datos comerciales ficticios.
9. Carita y Pomodoro no cubren controles, teclado, contenido o modales. En pasos enfocados pueden ocupar un espacio reservado tras el contenido.
10. No prometer que un diseño mejora una condición médica. Evaluar la carga de decisión con Nicole y con personas que usen la app.

### Metáfora

La persona está al mando. Su proyecto es el barco; el propósito, la brújula; el objetivo, el horizonte; las áreas, lugares conectados de su mundo. La metáfora orienta y aparece en mini tutoriales; no obliga a descifrar una ilustración para encontrar una herramienta.

## 3. Arquitectura de navegación

```text
Cuenta
└─ Mis proyectos
   └─ Inicio del proyecto / Mi ruta
      ├─ Mapa de ideas y trabajo
      ├─ Kanban
      ├─ Calendario
      ├─ Mi mundo
      └─ Espacios de trabajo
         ├─ Mi página
         │  ├─ Propuesta y catálogo
         │  ├─ Landing principal
         │  ├─ Página de enlaces
         │  └─ Hasta tres páginas promocionales
         ├─ Creator Studio
         │  ├─ Crear / mis temas
         │  ├─ Campañas y plantillas
         │  ├─ Mi perfil y cuadrícula
         │  └─ Biblioteca / pieza / guion / video
         ├─ Mi operación — cambia por rubro
         ├─ Resultados
         └─ Configuración
```

Las cuatro vistas Mapa, Kanban, Calendario y Mi mundo deben poder encontrarse sin una landing ni una guía completa. La navegación móvil puede usar una barra compacta, pero no esconder todas detrás de menús sucesivos.

**Abrir proyecto** debe llevar siempre a su inicio reconocible. **Retomar mi trabajo** es una acción diferente que puede abrir una pieza o herramienta concreta. No cambiar arbitrariamente entre mapa, Kanban y editor al usar el mismo botón.

Cada herramienta muestra el proyecto y un regreso comprensible. Si el trabajo nació en una sección, «Volver a mi página» regresa a esa sección. Si nació en Studio, vuelve a Studio. Atrás del navegador también conserva contexto y no mezcla proyectos.

## 4. Bienvenida y diagnóstico: conocerte antes de proponerte trabajo

### Recorrido

Bienvenida breve → cuenta → forma de comenzar → persona → proyecto/rubro → necesidades → esencia → comodidad para crear → otras áreas opcionales → revisión de lo entendido → preparación real → ruta y página.

Siempre disponibles: Atrás, Continuar, Lo definiré después y Crear manualmente. Entrar solo para explorar debe ser una experiencia válida.

No obligar a completar todas las preguntas en la primera sesión. Las preguntas se adaptan al momento y pueden retomarse. La meta de «tener una estrategia en unos diez minutos» es una intención de diseño que debe probarse, no una duración garantizada ni motivo para simular resultados.

### Banco de preguntas, cada fila es una pantalla independiente

| Bloque | Pregunta/intención | Respuesta y comportamiento |
|---|---|---|
| Tú al mando | ¿Cómo te gusta que te llamen? | Texto breve u omitir; dato de cuenta. |
| Trato | ¿Cómo prefieres que te hablemos? | Femenino, masculino, neutral, arroba, prefiero no decir. No inferirlo de nombre, apariencia o voz. |
| Punto de partida | ¿Vienes a explorar, empiezas o ya tienes negocio? | Una elección; adapta recomendaciones sin cerrar herramientas. |
| Tu barco | ¿Cómo se llama tu proyecto? | Nombre del proyecto. |
| Actividad | ¿Qué estás construyendo? | Restaurante, tienda, turismo, hospedaje, cursos, servicios/ofertas mixtas. Se elige una vez. |
| Trayectoria | ¿Hace cuánto comenzó? | Idea, menos de un año, uno a tres, más de tres, omitir. |
| Equipo | ¿Lo llevas por tu cuenta o con equipo? | Si hay equipo, preguntar tamaño en otra pantalla. No crear usuarios ni permisos por responder. |
| Origen | ¿Cómo empezó? | Familiar, iniciativa personal, socios, necesidad, oportunidad, otra historia. Varias compatibles y texto/audio opcionales. |
| Brújula | ¿Qué quieres aportar? | Opciones del rubro y palabras propias. No exigir una misión profesional. |
| Horizonte | ¿Hacia dónde te gustaría ir? | Crecer, vivir del proyecto, llegar a más personas, trabajar con calma, equipo, otra. |
| Personas | ¿A quién quieres llegar? | Varias opciones del rubro y público propio. |
| Oferta | ¿Qué ofreces? | Productos/servicios/paquetes compatibles. Sin exigir fotos o precios en esta etapa. |
| Necesidad del cliente | ¿Qué resuelves o haces posible? | Selección y explicación propia opcional. |
| Prioridades | ¿Qué te ayudaría más ahora? | Mostrar oferta, crear contenido, ordenar pendientes, gestionar solicitudes, explorar. Conservar todas las elegidas. |
| Primera acción | ¿Por cuál empezamos? | Solo cuando haya varias necesidades. Elegir una no elimina las otras. |
| Presencia actual | ¿Ya tienes web, catálogo o redes? | Declaración; no conectar ni importar cuentas automáticamente. |
| Ventas actuales | ¿Vendes ya? ¿En qué periodo? | Opcional, sin cambiar suscripción/nivel; no cifras sin periodo. |
| Diferencia | ¿Qué hace especial a tu negocio? | Palabras de la persona y opciones útiles; no inventar ventajas. |
| Sensación | ¿Qué quieres transmitir? | Ej.: cercanía, calma, energía, confianza. Multiselección. |
| Voz | ¿Cómo te gusta comunicar? | Selección y palabras propias; qué quiere evitar en otra decisión. |
| Temas propios | ¿De qué podrías hablar una y otra vez? | Tres espacios iniciales para desarrollar pilares. Conservar temas históricos adicionales. |
| Referencias | ¿Qué perfiles o marcas te inspiran? | @perfil, URL o captura opcional. Luego, por separado, qué le gusta y qué adaptaría a su manera. |
| Comodidad | ¿Cómo prefieres crear? | Cámara, voz, escribir, mostrar producto/proceso, todavía no sé. Varias compatibles. |
| Fricción | ¿Qué te cuesta o prefieres evitar? | Mostrar cara/voz, editar, escribir mucho, empezar, organizarse, otros. |
| Material | ¿Qué tienes hoy? | Nada, fotos, videos, textos, testimonios autorizados, publicaciones anteriores. No obligar a adjuntarlo. |
| Herramientas | ¿Qué ya conoces? | Canva, CapCut, Instagram, TikTok, otras, ninguna. |
| Ritmo | ¿Cuánto espacio quieres darle a esto? | Sesiones breves, bloque semanal, varios momentos, omitir. |
| Canal | ¿Dónde quieres compartir? | Instagram, TikTok, WhatsApp, página, otros compatibles. |
| Difusión | ¿Orgánico, anuncios o ambos? | No activar campañas ni cobros. Presupuesto se pregunta después y es opcional. |
| Presupuesto | ¿Quieres guardar una referencia? | Monto y duración editables. S/10 diarios por siete días puede mostrarse como ejemplo, nunca como mínimo o garantía de resultados. |
| Recordatorios | ¿Quieres que te lo recordemos? | Frecuencia o ninguno. Guardar preferencia no equivale a tener notificaciones conectadas. |
| Página | ¿Qué secciones te sirven? | Opciones del rubro con iconos/miniaturas; multiselección. No pedir composición visual todavía. |
| Otras áreas | ¿Preparamos finanzas, logística u operaciones? | Opcional, selección de varias, sin quitar marketing ni bloquear acceso manual. |

### Preguntas posteriores por área

- **Finanzas:** precios definidos, conocimiento de costos, cómo registra ingresos/gastos. Una pregunta por pantalla. Un costo desconocido no es cero.
- **Logística:** cómo entrega lo ofrecido, materiales/compras/inventario/horarios/disponibilidad, principal dificultad de coordinación. Opciones propias del rubro.
- **Operaciones:** por dónde llegan solicitudes, cómo sigue pendientes, quién participa y qué proceso necesita mejorar. No crear permisos de equipo ni automatizaciones por responder.

### Revisión y preparación

La revisión enseña un resumen breve editable por partes. Al confirmar, prepara borradores, pasos y referencias coherentes. No publica, no conecta cuentas y no completa tareas.

La pantalla de preparación muestra operaciones reales: guardar respuestas, preparar estructura, vincular ruta. No una espera artificial de «IA trabajando» si se están usando reglas y plantillas.

## 5. Inicio del proyecto: mi ruta hacia un resultado

Se debe entender en pocos segundos qué hacer. Mostrar:

- Nombre del proyecto y ubicación: Inicio / Mi ruta.
- Una ruta numerada derivada de la prioridad elegida y del estado real del negocio.
- Un paso actual destacado y un botón para hacerlo.
- Pasos posteriores en secuencia, editables y sin bloqueos artificiales.
- Un destino comprensible: preparar la venta, atender una reserva, ordenar la operación o la meta confirmada por la persona.

Ejemplo de recorrido comercial, **no una lista fija impuesta a todos**:

1. Definir lo que te hace diferente y tu oferta.
2. Preparar y revisar tu página.
3. Crear Conóceme, Conversemos y Mi oferta.
4. Preparar perfil y difusión.
5. Atender y registrar la primera/próxima solicitud o venta real.

Si ya vende, puede empezar por pedidos, costos o reservas. Una venta no se marca conseguida por terminar una pantalla. La ruta y el mapa son distintos: la ruta ordena acciones; el mapa permite pensar y conectar.

## 6. Mapa conceptual funcional conectado con FOR U

### Qué debe representar

Centro: el proyecto. Ramas: Marketing, Finanzas, Logística y Operaciones. Los nodos distinguen **ideas**, **información confirmada**, **tareas** y **resultados**. No son cuatro listas decoradas con líneas.

Las conexiones significan algo: «esta idea alimenta este pilar», «esta pieza comunica esta oferta», «esta oferta lleva a esta página», «esta tarea prepara este resultado». Al seleccionar un nodo se entiende de dónde viene y qué se puede hacer con él.

### Recorrido de una idea

1. «Tengo una idea»: escribir o grabar; un solo foco de captura.
2. Guardar el original en la bandeja privada. Capturar no llama a IA.
3. «FOR U, ayúdame a ordenarla»: acción explícita.
4. Mostrar una propuesta breve: área, posible tema/pilar y relación sugerida con trabajo existente. Donde todavía solo se pueda clasificar por área, no simular relaciones avanzadas.
5. Aceptar, corregir o dejar para después. Sin cambios silenciosos.
6. Ver la idea en el mapa y poder reabrirla.
7. Opcionalmente convertirla en tarea, contenido, oferta o material vinculado. Esa conversión es otra acción y conserva el original.

### Diseño del mapa

- Las ramas tienen acentos pastel distintos. No un mapa entero morado.
- Hay foco en una rama, volver al mapa completo y una forma clara de restablecer la vista.
- Acercar, alejar y desplazarse cuando sea necesario. No obligar a hacer zoom para leer todo.
- En móvil, una vista de rama legible con regreso al conjunto; no miniaturizar un lienzo de escritorio.
- Un nodo seleccionado abre un panel contextual, con una acción principal; los otros ajustes se solicitan después.
- El contenido vacío invita a capturar o explorar. No cuatro áreas llenas de «0/0» ni textos largos de falta de datos.
- La IA no mueve notas, crea tareas ni completa pasos sin aceptación.

**Estado:** el mapa visual actual no satisface esta definición. La captura/clasificación recientemente añadida es una parte del flujo, no su cumplimiento completo.

## 7. Kanban, calendario y Mi mundo

### Kanban

Columnas Por hacer, En curso y Hecho. Arrastrar tarjetas es la interacción principal. En táctil/teclado hay una alternativa accesible de mover; no un desplegable de estado dentro de cada tarjeta.

Una tarjeta abre la tarea original. Fechas, estado y área son los mismos del mapa. Mover no duplica la tarea. Reabrir una terminada actualiza el avance sin una segunda recompensa.

### Calendario

Agenda y vistas de tareas/piezas fechadas. Cada evento muestra su tipo y abre el origen. Una tarea sin fecha no recibe una automáticamente. Reordenar la cuadrícula del perfil no cambia fechas.

Crear una actividad: título → día → hora → revisión. Al planificar una pieza se mantiene la misma pieza, no una copia editable en calendario. Distinguir calendario interno, archivo exportable y conexión externa real.

### Mi mundo

Islas de proyectos, espacios de las cuatro áreas, mascotas, descanso, decoraciones y avance real. Comparte tareas con las otras vistas. La persona puede descansar sin penalización.

Vista ligera y movimiento reducido; si WebGL falla, acceso funcional equivalente. No mostrar la lista completa de decenas de islas como obligación inicial. Proyecto actual destacado y búsqueda/viaje cuando se solicite. Juego y descanso no sustituyen el avance real ni completan tareas.

## 8. Mi página: experiencia compartida de edición

«Editar mi página» abre directamente la landing especializada. No otro tablero administrativo.

### Superficie

Página en el centro. Barra compacta: regresar al origen, vista móvil/escritorio, deshacer/rehacer, guardado y Publicar. Los nombres de herramientas y configuraciones avanzadas no compiten con la página.

- Texto: tocar y editar donde aparece, conservando párrafos y selección.
- Foto: tocar para reemplazar, biblioteca o encuadre. Arrastrar al destino en escritorio; elección equivalente en móvil.
- Oferta: abrir su catálogo original, con ID, precio, variantes y extras conservados.
- CTA: editar texto, destino, alineación y variante visual, un ajuste por vez.
- Secciones: «＋ Sección» entre bloques con miniatura de composición; mover por arrastre o controles equivalentes.
- Sección seleccionada: «Crear contenido» conserva página, sección, oferta y proyecto.
- Contacto: dirección, horario y enlace de mapa confirmados; no afirmar validación de horarios operativos si todavía no existe.

### Sin materiales iniciales

Una composición tipográfica deliberada, jerarquía, iconos discretos y espacios de edición cuidados. No rectángulos grises gigantes ni una web llena de muestras publicadas. Las tarjetas «Tu producto» son orientaciones del editor; no son productos comprables.

Historia, testimonios, condiciones, precios y ubicaciones solo se muestran cuando existen datos confirmados. Los testimonios requieren autorización. Un hueco de contenido puede omitirse de la página pública mientras siga pendiente en el editor.

### Guardar y publicar

Borrador y publicación están separados. Guardar no publica; un error conserva los cambios visibles. Publicar exige revisión y autorización. Una página pública anterior continúa hasta publicar otra versión explícitamente.

### Después de preparar la landing

Tutorial breve y saltable sobre lo que se puede tocar. Dos caminos comprensibles: **Crear mis primeros contenidos** o **Seguir editando mi página**. No mandar a un lugar genérico al pulsar Atrás.

### Página de enlaces personalizable — requisito añadido

Una página independiente, simple, para usar en la bio: foto/logo, nombre, descripción breve, enlaces, redes/contacto y apariencia. Añadir, editar, ordenar y desactivar enlaces; vista móvil y previsualización. Permitir enlaces a la landing principal y a promociones sin obligarlos.

Guardar borrador, revisar URL y publicar explícitamente. Editarla no cambia la landing principal. No prometer integraciones avanzadas o todo el producto comercial de Linktree; el alcance acordado es una página de enlaces sencilla y funcional.

### Hasta tres landings promocionales — requisito añadido

Preparar hasta tres borradores editables independientes de ofertas/promociones confirmadas. Cada uno tiene identidad, URL propia, relación con oferta/campaña y estado de publicación separado.

Si solo hay una oferta confirmada, no inventar dos promociones. Los espacios restantes son borradores de trabajo no publicables hasta completarlos. No es una cuota comercial nueva ni un cambio de plan.

Flujo: elegir oferta → revisar beneficio y condiciones → composición enfocada en esa venta → editar → guardar → previsualizar → publicar cuando la persona lo decida. Sin sustituir página principal, catálogo ni precios del servidor.

## 9. Restaurante: experiencia completa

### Diagnóstico específico

Tipo de cocina/oferta, público, local y modalidades que le interesan, menú existente, horarios, equipo y situación operativa. Las modalidades se activan después en configuración, no por contestar la encuesta.

### A: todavía no tiene página

Ruta sugerida: definir propuesta → armar menú → revisar cómo pedir → completar información útil → crear contenidos → preparar difusión → atender pedidos.

### B: ya vende

Ruta sugerida según prioridad: revisar menú real → configurar modalidad de atención → organizar pedidos/preparación → registrar insumos y costos → crear una promoción cuando corresponda.

### Landing pública

1. Portada con propuesta clara y CTA.
2. Menú por categorías; tarjetas legibles con nombre, descripción, precio confirmado y foto opcional.
3. Presentaciones/variantes y extras donde existan.
4. Pedido: mesa, recojo y delivery únicamente si están habilitados.
5. Horarios y ubicación.
6. Historia.
7. Preguntas frecuentes.
8. Testimonios autorizados, si hay.
9. Promoción con condiciones reales y enlace independiente cuando exista.
10. Contacto y CTA persistente que no tape el menú.

Referencia de interacción comercial solicitada: menú sencillo de pedir como Hola Click, manteniendo edición directa de FOR U y su identidad. No copiar marca o interfaz literalmente.

### Cliente

Elegir productos → presentaciones/extras → revisar carrito → elegir modalidad → mesa o zona/dirección, según corresponda → contacto → revisar total del servidor → confirmar → código/seguimiento. Una pregunta por momento. No cobrar por ver el menú ni confirmar dos veces por reintento.

### Operación

- Pedidos y detalle: origen, modalidad, productos, extras, notas, estado, total y referencia de pago.
- Configuración de mesas, recojo, zonas y tarifas; activación explícita.
- Preparación y entrega con estados reales.
- Platos, recetas e ingredientes relacionados.
- Inventario y reposición.
- Compras: proveedor opcional, cantidad, unidad y costo; aumentar existencias una sola vez.
- Costo por porción con rendimiento y unidades compatibles. Costo incompleto se ve como incompleto; diferencia entre precio y costo no se llama utilidad neta.
- Preparar una receta puede tener impacto confirmado en insumos. Un pedido no descuenta ingredientes automáticamente por existir.

### Contenido sugerido

Historia del lugar, elaboración, producto, comunidad y oferta. Tres primeros contenidos: quiénes somos, una conversación útil y qué puedes pedir. Promoción ejemplo de maqueta solo si se identifica como ficticia; nunca grabarla como oferta de un negocio real.

### Límite actual que el diseño no debe ocultar

La landing general y el circuito nativo de pedidos tienen puentes de datos diferentes. Configurar modalidades no demuestra que todo checkout público esté conectado. Esa integración y su QA remota siguen pendientes. Costos/compras no deben presentarse como contabilidad completa.

## 10. Tienda: experiencia completa

### Diagnóstico

Qué vende, si produce o selecciona productos, catálogo actual, público, variantes, entrega/recojo, stock y forma de recibir pedidos.

### Ruta

Propuesta → catálogo → condiciones de compra/entrega → página → contenidos → consulta o compra → seguimiento. Si ya vende, puede empezar por pedidos o stock.

### Landing pública

Portada → categorías/productos → detalle con fotos opcionales, precio y variantes confirmadas → cómo comprar → entrega/recojo/cambios → historia → FAQ → contacto. Productos no disponibles no se ofrecen como disponibles.

### Cliente

Explorar → abrir producto → elegir variantes/cantidad → carrito → entrega/contacto → total del servidor → solicitud/compra según conexión real → seguimiento. Diferenciar pedido recibido, pago confirmado y producto entregado.

### Operación

Productos: nombre, descripción, categoría, precio, imagen, stock y disponibilidad. Pedidos: líneas, cliente/contacto, estados, reserva/liberación de stock, preparación y entrega. Evitar doble descuento por reintento o cancelación repetida.

### Contenido

Uso del producto, historia/proceso, cuidado, comparación honesta, comunidad y oferta. Una pieza y una promoción referencian el mismo producto; no mantienen otro precio editable.

### Límites

Hay operaciones de catálogo y pedidos en código, pero no todo el comercio público, variantes y pagos está verificado con cuentas externas. No diseñar una falsa confirmación de pago.

## 11. Turismo: experiencia completa — referencia INTI CHURIN

INTI CHURIN es la referencia de interacción y presentación solicitada: experiencia visible, portada, galería, recorrido y edición contextual. Se revisó su código en modo lectura. **No se modificará ni se copiarán datos comerciales, fotos, textos o precios sin una decisión explícita.** FOR U todavía no iguala esa experiencia.

### Diagnóstico

Experiencias guiadas/culturales/aventura, público, duración conocida, forma de operar (salidas, privadas o consulta), necesidades de coordinación, guías, calendario y reservas actuales.

### Ruta

Dar forma a la experiencia → presentar recorrido e inclusiones → condiciones → preparar página → salidas/cupos si ya operan → contenidos → consulta/reserva y seguimiento.

### Landing pública

1. Portada con propuesta del proyecto.
2. Experiencias en tarjetas cuidadas, con foto o presentación tipográfica.
3. Detalle de experiencia: nombre, descripción, duración y precio por persona confirmados.
4. Galería contextual si hay material; no forzarla cuando no lo hay.
5. Itinerario ordenado con paradas y explicaciones.
6. Qué incluye y qué no incluye, solo si está confirmado.
7. Punto de encuentro, recomendaciones y condiciones.
8. Salidas y cupos disponibles cuando el circuito esté conectado; en otro caso, consulta clara.
9. Historia/equipo, FAQ, ubicación/contacto pertinentes.

### Edición

Tocar texto/foto/experiencia para editar. Abrir la portada y la galería en su contexto. Añadir y ordenar paradas sin abrir un formulario de todo el tour. Cambiar duración no debe romper salidas del guía. No inventar coordenadas `0,0` para permitir guardar.

### Cliente

Ver experiencia → recorrido → elegir salida, si existe → personas → nombre/contacto → revisar disponibilidad y total → confirmar → referencia y coordinación. El sistema distingue reserva guardada de correo entregado y de pago realizado.

### Operación

Experiencias, guías y contactos privados, idiomas, salidas con fecha/hora/capacidad, asignación de guía, plazas reservadas y cancelaciones. Comprobar solapamientos y cupos. No publicar datos de clientes/guías privados en la landing.

### Contenido

Lugar/cultura, experiencia/recorrido, consejos, personas e historia. Desde una experiencia se crea la pieza con su referencia, no desde una descripción comercial inventada.

### Límites

Existen itinerarios y detalles proyectados a la landing; la galería y presentación integral equivalente a INTI, el circuito completo de reservas y la aceptación visual siguen pendientes. No afirmar disponibilidad automática si solo hay un enlace de consulta.

## 12. Hospedaje: experiencia completa

### Diagnóstico

Habitaciones/casa/estadías, público, servicios, ubicación, modalidad de consulta, estado actual de reservas y coordinación.

### Ruta

Presentar el lugar → habitaciones y condiciones → disponibilidad/consulta → página → contenidos → solicitud/estancia. Si ya opera, comenzar por reservas, limpieza o ingresos/gastos según la prioridad.

### Landing pública

Portada → habitaciones/unidades → servicios confirmados → entorno y cómo llegar → condiciones de estadía → historia → FAQ → consulta/reserva. Fotos opcionales al inicio; no inventar amenidades ni horarios de entrada/salida.

### Cliente

Explorar → unidad → fechas y huéspedes → consultar disponibilidad real o enviar solicitud claramente identificada → confirmación del alcance → coordinación. No simular sincronización con Booking/Airbnb ni confirmación inmediata si no existe.

### Operación

Habitaciones: tipo, capacidad, tarifa, servicios y estado. Calendario de reservas por unidad y fechas. Huéspedes y contacto privado. Check-in/check-out/estado de estancia según las funciones reales. Limpieza separada de ocupación. Ingresos/gastos y balance registrado, sin afirmar utilidad contable completa.

Editar capacidad debe respetar reservas activas. Editar presentación no cambia silenciosamente limpieza ni reserva.

### Contenido

Espacios, experiencia de estadía, hospitalidad, entorno, consejos para visitar y ofertas confirmadas.

### Límites

Hay calendario y gestión interna en código. La disponibilidad pública automatizada y las integraciones con plataformas externas no están confirmadas de extremo a extremo.

## 13. Cursos: experiencia completa

### Diagnóstico

Curso/taller/acompañamiento, a quién enseña, necesidad, formato digital/en vivo, material existente, módulos/lecciones y forma actual de atender alumnos.

### Ruta

Definir aprendizaje ofrecido → ordenar temario y materiales → página → contenidos → consulta/inscripción → acceso y seguimiento según capacidades comprobadas.

### Landing pública

Propuesta de aprendizaje sin promesas inventadas → curso/taller → temario → quién enseña → modalidad/condiciones → materiales realmente incluidos → FAQ → CTA de consulta/inscripción.

### Editor del curso

Curso → módulo → lección → recurso seleccionado. No editar todo el programa en un único formulario. Texto, video, material y evaluación se agregan en su lugar. No anunciar recursos que aún no se cargaron.

### Operación

Cursos, módulos, lecciones, grabación de contenido, materiales, preguntas/opciones de evaluación donde existan, alumnos/inscripciones, progreso, pagos registrados y certificados emitidos sobre progreso confirmado.

### Alumno

Acceso autorizado → curso inscrito → lección → recurso → avance registrado → evaluación/finalización cuando corresponda. **Esta es la experiencia objetivo, no una afirmación de aula pública completa actual.** No mostrar un aula terminada solo porque existe un editor de cursos.

### Contenido

Quién enseña, una idea útil, práctica/proceso, preguntas, comunidad y oferta del curso. El video promocional y el video de una lección son objetos diferentes y deben etiquetarse.

## 14. Servicios y ofertas mixtas: experiencia completa

### Diagnóstico

Servicios, asesorías, paquetes o combinación con productos; problema atendido, público, alcance, modalidad presencial/remota, proceso, forma de cotizar y seguimiento.

### Ruta

Propuesta clara → servicio/paquete → proceso y alcance → página → contenidos → solicitud → cotización → seguimiento. No pedir stock ni recetas para una asesoría.

### Landing pública

Propuesta y diferencia → servicios/paquetes → para quién y qué recibe → cómo trabajamos → historia/equipo → testimonios autorizados → FAQ → contacto/cotizar. Un precio puede ser fijo, gratis confirmado o por cotización; un campo vacío no es gratis.

### Cliente

Entender servicio → elegir alcance/oferta → enviar consulta o pedir cotización → recibir referencia → seguimiento. Una solicitud no se marca como venta/pago por enviarse.

### Operación

Bandeja de solicitudes, detalle de necesidad/contacto/oferta, cotización y estado, fechas de seguimiento. Productos físicos dentro de una oferta mixta usan sus catálogos reales; no duplicar precios ni fingir un módulo completo de CRM si falta implementarlo.

### Contenido

Diferencia, método, consejos, proceso, personas, confianza basada en hechos y oferta. Se reutilizan pilares y referencias del proyecto.

### Límite actual

La ruta semántica de servicios, propuesta y contenido existen; el circuito completo de cotizaciones/seguimiento necesita integración y verificación. Evitar que nombres internos de ecommerce aparezcan en esta experiencia.

## 15. Creator Studio: crear sin pensar todo a la vez

Vistas internas: **Crear · Campañas · Mi perfil · Biblioteca**. Pilares, plantillas, guion y video pertenecen a este espacio; no son destinos desconectados que hay que descubrir.

### A. Desarrollar tus temas/pilares

Tres barras grandes iniciales. Cada una abre un tema, con una pregunta de desarrollo. Se puede crear el nombre por separado y escribir o adjuntar material después. Los temas adicionales históricos permanecen accesibles sin llenar la primera pantalla.

El tema se guarda en el proyecto y puede alimentar varias piezas. No confundir «mi pilar» con «el objetivo de esta publicación». Renombrarlo no debe borrar notas, referencias ni piezas guardadas.

### B. Crear una pieza

Tema o idea → desarrollar texto → intención → formato → composición → edición.

- Temas sin miniaturas de diseño.
- Tres intenciones principales: **Que me conozcan · Conversar · Vender**.
- Las categorías ampliadas de plantillas —reconocimiento, conexión, confianza, oferta, retomar y fidelizar— son filtros secundarios, no seis pasos obligatorios ni seis decisiones iniciales.
- Reutilizar lo escrito en el pilar y lo confirmado en página/oferta. No pedir que se escriba otra vez la propuesta completa.
- Después de la intención, decidir formato 1:1, 4:5 o 9:16. Carrusel se introduce cuando aporta a la idea, no como pregunta inaugural.
- Las propuestas de diseño aparecen recién en ese momento. Las composiciones con plantillas no consumen IA.
- Al guardar, diseño/texto/guion/archivos/fecha/estado son parte de la misma pieza.

### C. Tres contenidos para empezar el perfil

1. **Conóceme:** quién eres, por qué existe el negocio y qué lo hace propio.
2. **Conversemos:** idea, pregunta o utilidad que invite a interacción auténtica.
3. **Mi oferta:** qué ofreces, beneficio/condiciones confirmados y acción concreta.

No exigir diez publicaciones para sentirse preparado. Estas tres piezas son espacios de planificación editables. Prepararlas o anclarlas en la maqueta no cambia Instagram.

### D. Editor de diseño

Resultado en el centro. Tocar título, texto, imagen, logo o CTA. Ajustes de capas/tipografía/color/alineación aparecen según selección. Deshacer/rehacer, variantes, guardado y exportación. No un lienzo vacío con controles sin explicación.

Conservar nombre, origen, campaña y revisión. Una modificación en la página marca revisión necesaria; no sobrescribe automáticamente el diseño social.

### E. Campañas y plantillas

Crear sin campaña siempre es posible. Campaña: objetivo → oferta relacionada o negocio general → nombre → periodo opcional → piezas.

Dentro de Crear: filtros por intención, oferta, pilar y campaña cuando se soliciten. Plantillas adaptadas a recursos/rubro. No repetir selección de rubro. No mezclar filtros, estructura de campaña, edición del tema y diseño en la misma primera pantalla.

### F. Mi perfil y cuadrícula

Maqueta de foto, nombre, bio y enlace; destacados y tres publicaciones principales. Cuadrícula orgánica con miniaturas reales, títulos de ideas o portadas de reel.

Escribir un título crea una idea de pieza. Esa misma pieza puede convertirse en diseño de imagen, portada y luego reel. No crear un documento nuevo por cada herramienta.

Reordenar mediante arrastre y controles equivalentes. Filtros por campaña, pilar, intención y estado; vistas cuadrícula, lista y calendario. Cambiar orden no cambia fechas ni el perfil real de Instagram.

### G. Historias destacadas

Elegir tema → desarrollar ideas → título/portada → guardar en la maqueta. Temas sugeridos pertinentes: sobre nosotros, oferta, proceso, dudas, cómo llegar/contacto, según el negocio. No generar testimonios ni certificaciones ficticias.

### H. Crear video de este post

Post → guion → tomas → teleprompter → ensayar → grabar → revisar/repetir → portada → guardar en la misma pieza.

- Cámara/micrófono solo al iniciar la acción correspondiente.
- Portada desde diseño vertical o fotograma.
- Encuadre de portada para la cuadrícula independiente del encuadre del video.
- Archivos conservan proyecto/campaña/pieza.
- Identificar formato real del archivo; no anunciar MP4 o compatibilidad de publicación sin comprobarla.
- Recorte, orden de fragmentos y subtítulos muestran exportación real, no solo una previsualización.
- Video generativo y montajes automáticos no forman parte del alcance vigente.

### I. Biblioteca

Fotos, audios, diseños, videos, portadas y materiales. Filtros por proyecto, tipo, pieza y estado. Elegir una foto desde un elemento devuelve al elemento original.

Subida desde archivo, cámara/galería y arrastre donde proceda. Sin selector de archivos nativo gigante como experiencia principal. Estados: subiendo, guardado, error/reintento, formato no compatible. Material privado separado de imágenes publicadas.

## 16. FOR U como ayuda contextual, no como formulario adicional

La acción FOR U debe entender el trabajo seleccionado: idea, pilar, sección, oferta, texto del post o guion. No mandar al usuario a un chat vacío sin contexto.

Flujo deseado:

1. Crear o seleccionar material propio.
2. Pulsar FOR U con una intención clara: ordenar, desarrollar, enfocar para vender o preparar guion.
3. Mostrar de qué parte y qué fuentes tomará. Ajustes avanzados opcionales, sin cuestionario adicional obligatorio.
4. Procesar una llamada real, con estado honesto.
5. Mostrar original y propuesta de forma comprensible.
6. Editar, aceptar o descartar.
7. Guardar en el mismo objeto; mantener recuperación del original y revisión.

Para enfocar a la venta puede proponer una apertura, mensaje, beneficio y CTA coherentes. No inventa precios, urgencia, resultados, testimonios, contactos o condiciones.

La animación original de FOR U puede acompañar la transformación. No usar una espera teatral. Respetar movimiento reducido.

Referencia de NotebookLM: trabajar con fuentes elegidas y contexto del proyecto, no responder genéricamente. Fuentes posibles: respuestas confirmadas, propuesta, catálogo, secciones, piezas, notas y referencias autorizadas. Mostrar procedencia verificable; no afirmar citas por frase si el sistema solo guarda fuentes por revisión.

Adjuntar/grabar/navegar/escribir no llama a IA. Interpretar requiere clic explícito. No activar un proveedor pagado ni facturación nueva. Si IA falla, se conserva el trabajo y continúa el modo manual.

## 17. Resultados, conexiones, ayuda y configuración

### Resultados

Avance real por área, contenido creado, visitas/contactos/pedidos comprobados y acceso al origen. Separar datos internos, métricas de proveedores y declaraciones manuales. Periodo visible. Error de consulta no se muestra como cero.

### Cuenta y proyecto

Nombre preferido/trato/accesibilidad pertenecen a cuenta. Historia, oferta, diagnóstico, ruta y operación pertenecen a proyecto. Cambiar proyecto conserva contexto y pendientes sin mezclar cuentas.

### Conexiones

Google Calendar, Calendly, ManyChat, Meta Ads y WhatsApp aparecen según los conectores presentes. Diseñar estados reales: sin conectar, solicitando autorización, conectada/verificada, autorización vencida, verificación pendiente y error. Abrir la página del proveedor no significa conectarlo.

La conexión actual de Google Calendar no debe representarse como un inicio OAuth completamente integrado si requiere configuración manual. La publicación en Meta no está terminada por tener un planificador.

### Cobros

Mercado Pago por proyecto y cuenta autorizada. Mostrar modo de prueba o producción, autorización y estado comprobado. Pago coordinado, opcional u obligatorio solo donde esté implementado. Cancelar un pedido no implica reembolso automático; una reserva no implica cobro. No activar producción como parte de la maqueta o QA.

### Automatizaciones

Diferenciar texto/respuesta preparada, recordatorio local, integración conectada y automatización que se ejecutó. No mostrar «enviado» cuando solo se redactó.

### Ayuda y Pomodoro

Carita FOR U: ayuda breve preparada, captura de ideas, bandeja personal/proyecto y acciones contextualizadas. La ayuda preparada no consume IA.

Pomodoro: iniciar, pausar, ajustar, cerrar controles; descanso opcional. Sin tapar teclado o modales, sin completar trabajo por terminar el temporizador.

## 18. Pantallas y estados que debe incluir la maqueta

Estos grupos son familias de pantallas, no un menú de cien opciones para el usuario:

| Familia | Pantallas/estados |
|---|---|
| Acceso | Bienvenida, landing institucional, registro, login, recuperación/autorización cuando corresponda, carga/error. |
| Proyectos | Lista, búsqueda/todos, nuevo proyecto, borrador local recuperable, proyecto no disponible. |
| Conocerte | Persona, rubro, etapa, equipo, origen, propósito, horizonte, público, oferta, necesidades, prioridad, esencia, comodidad, materiales, herramientas, difusión, otras áreas. Una pregunta por estado. |
| Ruta | Resumen revisable, preparación real, inicio numerado, paso actual, revisión de respuestas. |
| Mapa | Conjunto, rama enfocada, nodo seleccionado, capturar idea, audio, sugerencia IA, revisión, idea guardada, convertir en paso/contenido. |
| Kanban | Tres columnas, arrastre, movimiento accesible, detalle de tarea, fecha y guardado/error. |
| Calendario | Agenda, tareas/piezas, detalle de origen, fecha, actividad nueva, conexión/exportación diferenciadas. |
| Mundo | Isla actual, viaje entre proyectos, área/mascota, tarea, descanso, decoraciones, vista ligera y error de WebGL. |
| Propuesta | Oferta/público/mensaje/contacto por tarjetas; oferta propia o referencia a catálogo; diferencias reales al preparar página existente. |
| Editor web | Landing completa, selección de texto/foto/oferta/CTA, catálogo, alta, sección, orden, biblioteca, encuadre, historial, revisión y publicación. |
| Enlaces | Editor de página de enlaces, enlace individual, orden/apariencia, vista móvil, borrador/publicación. |
| Promociones | Hasta tres borradores, oferta y condiciones, editor de campaña/landing, URL y publicación separadas. |
| Studio | Temas, desarrollar pilar, idea, intención, fuente, formato, composiciones, editor de diseño. |
| Campañas | Lista/vacío, intención, oferta, nombre, periodo, revisión, piezas. |
| Perfil | Identidad, foto, destacados, tres principales, cuadrícula, lista, filtros y calendario. |
| Pieza | Texto, diseño, guion, tomas, IA, materiales, fecha/estado y regreso al origen. |
| Video | Teleprompter, ensayo, permisos, grabación, revisión, fragmentos, subtítulos, portada y exportación. |
| Biblioteca | Materiales, subida, selección, error de formato, recuperación y relación con piezas. |
| Restaurante | Menú, producto, variantes/extras, modalidad, carrito, checkout, pedido, seguimiento, recetas, inventario, compras/costos. |
| Tienda | Catálogo, producto, stock, carrito, checkout, pedido, pago/entrega, seguimiento. |
| Turismo | Experiencias, detalle/galería/itinerario, guías, salidas, cupos, reserva, cancelación y seguimiento. |
| Hospedaje | Habitaciones, calendario, solicitud/reserva, huéspedes, limpieza, movimientos. |
| Cursos | Cursos, módulos, lecciones, material, grabación, alumnos, progreso, pagos/certificados; aula autorizada como pendiente. |
| Servicios | Servicios/paquetes, alcance, proceso, consulta, cotización y seguimiento. |
| Gestión común | Resultados, cuenta, identidad, conexiones, cobros, automatizaciones, ayuda y Pomodoro. |

## 19. Contratos que el diseño debe respetar

- Una cuenta tiene proyectos. Un proyecto tiene diagnóstico, ruta, propuesta y referencias a catálogo, borradores/publicaciones, campañas, piezas y operación.
- Oferta y precio tienen una fuente canónica. Una landing, widget y pieza referencian esa oferta.
- La pieza conserva diseño, texto, guion, tomas, archivos, video, portada, campaña, fecha y estado.
- Calendario, cuadrícula, Kanban y mapa son vistas de registros; no otras copias editables de los mismos datos.
- Borrador y publicación separados. Solo Publicar modifica una página pública.
- Costos, clientes, notas privadas, audios y guías internos no se filtran a páginas públicas.
- Un widget utiliza contenido publicado y autorizado. Si no está disponible, presenta un estado claro; no una copia oculta de información privada.
- Revisiones y conflictos: una respuesta tardía de otro proyecto no se aplica. Ante conflicto, conservar cambios y permitir recuperación explícita.
- Los reintentos no duplican tareas, compras, pedidos, pagos o premios.
- Los niveles guían recomendaciones, no bloquean herramientas ni cambian la suscripción.

## 20. Qué no convertir en una promesa visual falsa

No mostrar como terminado: publicación en Instagram/Meta, generación de imágenes, video generativo, montajes automáticos, integración externa sin autorización, correo de reserva enviado sin entrega confirmada, cobros productivos sin prueba/autorización, sincronización con plataformas de hospedaje, aula pública completa sin acceso verificado, utilidad neta sin contabilidad, compra que se repite al reintentar.

Quedan además pendientes de verificación remota/externa: aislamiento con segunda cuenta, cuotas de almacenamiento, Hostinger y revisión de negocios reales antes de republicar. No modificar INTI, activar facturación ni publicar negocios reales durante la maqueta/QA.

## 21. Recorridos de aceptación para la maqueta

La aprobación debe darse sobre una navegación completa, no sobre capturas aisladas:

1. Persona sin fotos: entra, omite lo no esencial, responde con opciones, reconoce su ruta, abre la landing y entiende qué tocar.
2. Negocio que ya vende: elige una prioridad operativa y llega a su herramienta sin recorrer de nuevo todo marketing.
3. Idea espontánea: captura, solicita ayuda, revisa clasificación, la ve en mapa y elige convertirla; no se marca trabajo hecho automáticamente.
4. Landing: edita texto/foto/CTA/oferta, añade y ordena sección, guarda, recarga y regresa al mismo lugar sin cambiar lo publicado.
5. Contenido: desarrolla un tema, elige intención y solo después diseño; guarda pieza, abre guion/video, vuelve al origen y conserva todo.
6. Perfil: idea de título → diseño o portada de reel → cuadrícula → calendario → misma pieza. No duplicados ni publicación real en redes.
7. Cada rubro completa su camino específico hasta el resultado que verdaderamente esté disponible.
8. Dos proyectos: nombres, notas, piezas y operación aislados; Atrás no salta a otro proyecto.
9. Red fallida, reintento, guardado parcial y conflicto: no pérdida silenciosa ni falso «Guardado».
10. Celular: 360/768/1440 px comprobados y prueba física en iPhone 16/Safari; teclado, cámara/micrófono y áreas seguras. La emulación no sustituye el dispositivo.

## 22. Material entregable para Stitch

- Este documento: experiencia completa deseada y límites actuales.
- `FOR_U_STITCH_INVENTARIO.csv`: todos los accesos de la matriz actual y vistas internas adicionales. «Existe en código» no equivale a «probado».
- `FOR_U_STITCH_PROMPT.md`: instrucciones compactas para empezar a maquetar sin perder las reglas principales.
- `FOR_U_STITCH_PREGUNTAS.md`: banco extraído de la guía actual para conservar preguntas/opciones. Donde contradiga decisiones posteriores, prevalece este contrato —por ejemplo, tres intenciones principales en la entrada a Studio—.

La maqueta no necesita nuevos precios, testimonios, negocios o resultados reales para verse profesional. Usar datos claramente ficticios y estados honestos de funciones pendientes.

## 23. Fuentes del inventario y alcance de la revisión

Router local `frontend/src/App.tsx`; tipos de herramientas; módulos y modelos; perfil/piezas; bibliotecas; mapa/guía; conexiones/pagos; `FOR_U_MASTER_SPEC.md`, `FOR_U_REQUIREMENTS.csv` y `FOR_U_SCREEN_COVERAGE.csv`. Revisión de fuente, no una auditoría remota completa de cada función.

Las pantallas históricas de captación de «El Estudio de Nicole» y administración legacy se enumeran por separado. Sus URLs se conservan; no deben aparecer como pasos necesarios dentro del recorrido del negocio.
