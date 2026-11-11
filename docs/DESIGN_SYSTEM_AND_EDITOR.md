# Sistema de diseño y editor por rubro

Solicitud vigente: adjunto `0d3914b6-ab32-4839-a668-083adf8a0f12/pasted-text-1.txt` más referencia explícita a Inti Churín.

## Referencia inspeccionada (solo lectura)

`/Users/nicoleiriartegomez/Documents/INTI CHURIN/inti-churin-web/admin.html` y `assets/js/admin.js`, `app.js`, `popup-editor.js`.

La referencia tiene barra superior con deshacer/rehacer y estado de guardado, biblioteca lateral de imágenes, vista previa en iframe, selección de contenido directamente sobre la página, edición contextual de secciones/botones y controles de reordenación. La parte inspeccionada de reordenación utiliza controles subir/bajar; no se debe confundir esto con una validación completa de drag and drop de Inti. Sus mensajes de iframe usan destino `*`; FOR U debe conservar validación de origen, ventana y canal, sin copiar ese patrón.

## Cambios en curso

- DesignSystem tipado: botones con atributos nativos y refs conservados; ayudas en portal, foco/hover/Escape; InfoIcon por toque; inputs con labels asociados; tarjetas semánticas e indicador de pasos.
- Migración de botones/input/textarea en 91 archivos. No quedan etiquetas nativas de estos controles fuera de DesignSystem en los TSX examinados. Las tarjetas existentes se migraron en 33 archivos.
- Ayudas concretas en sidebar, áreas, guardado/exportación y Pomodoro. El guardado del creador no se anuncia como automático porque actualmente es manual.
- Restaurante: navegación por anclas reales Datos básicos / Menú / Publicar. Wizard: mismo StepIndicator de cinco pasos.
- TypeScript, build y 78 pruebas pasan después de la migración inicial. Aún falta QA visual y funcional ampliada y resolver estilos anteriores que puedan prevalecer sobre la jerarquía de botones.

## Trabajo pendiente explícito

Auditar ayudas específicas en todos los enlaces, selectores y campos, migrar secciones restantes apropiadas al sistema y revisar todos los flujos con varios pasos. No considerar el alcance completo resuelto por el cambio mecánico de etiquetas.

Editor profesional: consolidar selección contextual, historial, reordenación por arrastre y teclado, imágenes y previsualización móvil/escritorio. Adaptar bloques a restaurante, tienda, hospedaje, turismo y cursos; conservar UUID, documentos existentes y control de revisiones. Validar guardado, recarga y publicación por rubro. No reescribir los datos de Inti Churín.

Primer avance del editor basado en la referencia: historial de 40 estados con deshacer/rehacer, conservando objetos completos y eliminando la rama de rehacer cuando se introduce otro cambio. Se integra en el editor de páginas existente; no publica ni retira páginas por sí solo. TypeScript/build y 80 pruebas pasan. La adaptación profesional a los cinco rubros y la validación visual ampliada continúan pendientes.

## Verificación directa del editor (4 octubre 2026)

- Proyecto QA Cursos MVP: la biblioteca muestra los bloques de aprendizaje e inscripciones correspondientes a Cursos.
- Al seleccionar «Detrás de nuestro negocio» en el lateral, `aria-pressed` cambia a verdadero y el iframe resalta el mismo bloque con `.pe-selected`. Verificado mediante controles y DOM visibles.
- El selector Móvil cambia su estado activo; el selector Escritorio permite regresar.
- Sin desbordamiento horizontal del documento a 360, 767 y 1440 píxeles CSS medidos (`scrollWidth === innerWidth`). El navegador tenía una escala que requiere medir el ancho real; 768 exactos todavía no se han comprobado. Estas mediciones no sustituyen la inspección visual de todas las herramientas.
- Pendiente: prueba de arrastre real, cambios con guardado/recarga en esta versión y validación completa de los cinco rubros. No se modificaron datos durante esta revisión.

### Persistencia de reordenación

En QA Cursos MVP se bajó «Lo que ofrecemos», se observó «Borrador guardado» y se recargó. El iframe recuperó el orden «Detrás de nuestro negocio» → «Lo que ofrecemos». Luego se restauró el orden original y se confirmó nuevamente el guardado. Esto verifica persistencia mediante los controles de reordenación. El resultado del arrastre apareció después de la primera observación: se confirmó el orden invertido en el DOM del iframe. Se restauró nuevamente mediante Subir y se comprobaron tanto el orden original como «Borrador guardado». La prueba evidencia una actualización asíncrona; no debe evaluarse únicamente con la captura inmediata posterior al gesto.

## Revisión del 5 octubre 2026

- Se verificó en navegador el cambio de biblioteca mediante Proyecto activo: Restaurante → Nuestro menú; Tienda → Nuestros productos; Hospedaje → Habitaciones y servicios; Turismo → Tu experiencia paso a paso. Cursos fue verificado anteriormente. No se cambiaron contenidos durante esta prueba.
- Marketing ofrece ahora «Editar mi página» directamente; se comprobó la llegada al editor en dos clics desde el tablero. «Diseñar para redes» distingue el creador gráfico del editor de páginas.
- Los campos de los cinco editores recibieron ayudas específicas. Se añadió Select al sistema de diseño y se aplicó a plantilla, tipo de lección, respuesta correcta y zona horaria. Quedan controles y pantallas por auditar; no supone migración completa de toda la aplicación.
- TypeScript, build Vite 4 y 82 pruebas pasan en el entorno local de validación con Node 20.


## Comparación renovada con INTI CHURIN —24 octubre2026

Inspección actual solo de lectura, no prueba visual ni modificación: admin.html; assets/js/admin.js (openUploadsForPath y estado/historial); assets/js/app.js (makeInlineEditable y tarjetas de experiencia); assets/css/experience-editor.css. El proyecto local confirmado por el registro es /Users/nicoleiriartegomez/Documents/INTI CHURIN/inti-churin-web.

La referencia no es solo un formulario de tours: presenta una experiencia con portada, imagen/galería, contenido y detalles dentro de una superficie dedicada; dispone de barra compacta y selección directa. La biblioteca se abre para una imagen concreta y cambia su contexto al cambiar de destino. Textos multilínea usan innerText, y los controles de imagen/selección se diferencian. FOR U conserva su puente cerrado por origen/ventana/canal/IDs, sin trasladar mensajes con destino* o rutas arbitrarias de la referencia.

Aplicación actual en FOR U: edición directa del resultado, biblioteca por campo con MediaScope, historial y paneles contextuales; las ofertas nativas ahora pueden editarse desde la página y las nuevas pueden prepararse pregunta por pregunta. Diferencia pendiente importante: la tarjeta turística genérica todavía no ofrece una presentación detallada de experiencia equiparable a portada/galería/itinerario de INTI. Esa comparación sigue abierta; no declarar equivalencia visual por pasar tests ni por añadir solo duración/precio. Debe resolverse reutilizando itinerarios/recursos confirmados del catálogo propio, sin copiar ofertas, ubicaciones, precios, imágenes o textos de INTI.
