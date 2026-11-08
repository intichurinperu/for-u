# Cierre de FOR U

Usa esta lista con Codex o AntiGravity, un bloque por turno. Antes de editar, revisa el estado de Git para conservar lo que haya hecho la otra herramienta. Marca un bloque como terminado solo cuando se pueda recorrer desde su botón real y comprobar el resultado. Si algo queda pendiente de publicar o de probar con una cuenta, anótalo en ese bloque.

La referencia visual es [la carpeta ordenada del 8 de noviembre](design-reference/2026-11-08/LEEME.md). Usa sus pantallas vigentes y las ilustraciones del proyecto. Las imágenes de versiones anteriores sirven para ver la evolución. Conserva la U vertical, los fondos claros perlados, las ilustraciones propias por pantalla y los reflejos iridiscentes pastel en el botón principal y en detalles. Mantén sobrias las acciones secundarias, sin subrayados, desplegables con triángulos ni botones duplicados. Muestra capturas del resultado en computadora y celular e indica si vienen de la app publicada, una vista local o una prueba aislada. Las capturas de pruebas de funcionamiento se guardan como evidencia técnica. Si hace falta un diseño nuevo, muestra la propuesta en ambas vistas y espera su aprobación antes de aplicarla.

## 1. Ruta digital, oferta y entrada al Studio

> Abre docs/CIERRE-FOR-U.md y ejecuta el bloque 1. Reusa las referencias guardadas y prueba el flujo desde una sesión nueva con un proyecto de prueba separado de Paradero Cero. Muéstrame las capturas reales y dime qué versión está publicada.

- Desde la portada, verifica Nuevo proyecto, preguntas por rubro, Mi ruta digital, oferta y precios, cómo vender y entrada a Creator Studio. En el cuestionario conserva un solo control de grabación y permite adjuntar las fotos que correspondan al rubro.
- Mi ruta digital guía sobre el proyecto y el público, la oferta con sus precios y cómo venderla. Ver mi proyecto abre cuatro islas clicables, sin repetir sus nombres en una fila de botones. Las acciones secundarias viven dentro de cada área.
- Añadir oferta abre un modal breve. La oferta guardada permite editarla y revisar sus costos. Para una promoción, se pueden seleccionar varias ofertas antes de abrir Studio. Al salir y regresar se conserva la selección.
- Creator Studio reúne Mi página, Publicaciones y Videos. Mi página abre el editor visual incluso en restaurante. El catálogo sigue accesible desde su contexto. En cada salto verifica Atrás del navegador y el botón de regreso. Ambos deben llevar a su destino esperado sin perder el proyecto ni abrir una pantalla antigua por defecto.
- Revisa también la carga inicial y el error que impedía abrir Studio. Contrasta el despliegue de Hostinger con la revisión que probaste y recorre la misma entrada en incógnito.

## 2. Idea a publicación editable

> Ejecuta el bloque 2 de docs/CIERRE-FOR-U.md. Prueba la conexión real de «Crear mi diseño con FOR U» con una idea concreta, guarda el borrador y vuelve a abrirlo. Si la IA falla, comprueba que puedo continuar con mi texto.

- El código local conecta el botón principal al servicio existente de Gemini. Valida una solicitud real desde una cuenta de prueba, con la función de Supabase y el frontend de la misma revisión. Comprueba que llega título, texto, llamada a la acción y composición editables y que se conserva el original.
- Comprueba 1:1, 4:5 y 9:16 en el lienzo, subida de fotos, guardado, reapertura desde Mis diseños y descarga. Verifica que Atrás restaura el borrador abierto.
- Si la IA no responde o la cuota se agota, conserva la idea y deja abrir el editor manual o crear con el texto original. Distingue esta composición de la generación de una imagen nueva.

**Prueba del 8 de noviembre.** En Chrome, el editor local pasó el recorrido de idea, tres formatos, guardado, regreso a Mis diseños, reapertura y descarga PNG. La respuesta creativa de escritorio y el almacenamiento de prueba fueron controlados. En celular se reprodujo un rechazo de autorización y «Crear con mi texto» conservó la idea completa. La solicitud directa real a Gemini con la clave local recibió un rechazo de autorización. Hostinger mostró el botón anterior «Crear mi diseño». Sigue pendiente validar en una cuenta de prueba con el frontend y la función de Supabase de esta revisión, incluida la subida de fotos al almacenamiento real. [Editor en computadora](evidence/2026-11-08/studio-bloque-2/editor-compu.png) · [Recuperación en celular](evidence/2026-11-08/studio-bloque-2/fallback-celular.png) · [Editor en celular](evidence/2026-11-08/studio-bloque-2/editor-celular.png)

## 3. Fotos y voz en la misma idea

> Ejecuta el bloque 3 de docs/CIERRE-FOR-U.md. Integra fotos y voz en el mismo borrador. Comprueba qué generación de imágenes está disponible con la configuración y cuota que ya tenemos.

- Permite subir y arrastrar fotos y elegir cuál va al lienzo. Transcribe el audio con el servicio autorizado y deja revisar el texto antes de convertirlo en diseño. Conserva un solo control de grabación y protege los archivos por cuenta y proyecto.
- Si existe un proveedor habilitado para generar imágenes, prueba que crea una imagen real, se puede elegir o descartar y queda editable como recurso del lienzo. Si falta configuración o cuota, identifica exactamente cuál y deja la subida de imágenes operativa. No habilites servicios de pago por defecto.

**Estado del bloque.** Creator Studio incorpora una foto de la biblioteca privada y una nota de voz en el mismo diseño. La transcripción se solicita por separado, se puede corregir y se añade al texto por decisión de la persona. En Chrome, con almacenamiento y respuestas controladas, se verificaron el guardado y la reapertura en computadora y celular, incluida la recuperación cuando falla la transcripción. Queda pendiente repetir el recorrido con una cuenta de prueba y los servicios publicados.

Gemini 3.5 Flash-Lite admite audio y devuelve texto. Los modelos de imagen Nano Banana revisados requieren cuota de pago en la API. Studio usa la biblioteca de fotos y la subida de archivos. [Modelo configurado](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite) · [Precios de Gemini](https://ai.google.dev/gemini-api/docs/pricing)

## 4. Plantillas, teleprompter, editor y subtítulos

> Ejecuta el bloque 4 de docs/CIERRE-FOR-U.md. Abre dos plantillas diferentes desde el Studio, recorre sus tomas y termina con un video reproducible y subtítulos editables.

- Cada plantilla tiene una secuencia propia con propósito, duración y guía por toma. Permite grabar o subir cada clip, ver el avance y pasar los clips al editor en el orden correcto. Para empezar sin plantilla, ofrece grabar con teleprompter o subir un video.
- Distingue el montaje de clips propios de generar un clip nuevo con IA. Si hay un proveedor habilitado para video generativo, verifica que su clip se pueda revisar y añadir a una toma. Si requiere otra cuota o configuración, registra el pendiente y mantén utilizable el flujo de grabar o subir clips.
- El teleprompter abre con vista de cámara protagonista. Debajo están el guion editable y la velocidad. Al terminar, pasa la grabación al editor. Conserva el vínculo con la publicación, el proyecto o la plantilla desde donde entró.
- Usa la referencia del editor de video en computadora y celular para dar prioridad a una vista previa grande y una línea de tiempo utilizable. Verifica que los subtítulos se generan desde el audio, se pueden editar y se ven en el archivo exportado. Comprueba el video completo antes de cerrar el bloque.

## 5. Finanzas y operaciones por rubro

> Ejecuta el bloque 5 de docs/CIERRE-FOR-U.md. Haz el flujo mínimo de costos y precios por rubro y prueba la descarga en Excel con datos que yo misma pueda volver a abrir.

- Desde una oferta, abre sus costos conservando el contexto. Adapta los campos a restaurante (ingredientes, compras, merma), hospedaje (limpieza y mantenimiento), turismo (tiempos y recursos), clases (materiales o producto digital), tienda (compras e inventario) y servicios (horas y recursos).
- Guarda y vuelve a abrir datos reales de prueba. Para una promoción, conserva los precios y costos de cada oferta y permite ver el conjunto. Comprueba el archivo Excel `.xlsx` con moneda, cantidades y totales del proyecto. Si ya hay una exportación CSV, identifica su formato como tal.
- Verifica que Operaciones abre las tareas del rubro y que Logística abre los recursos o proveedores donde corresponda. Usa la guía de FOR U para señalar la siguiente acción en Operaciones.

**Prueba local.** «Ver costos» conserva la oferta y el acceso desde Finanzas. Se probó registrar costos, recargar y editar el precio en los seis rubros con datos de prueba. La comparación suma una unidad de cada oferta seleccionada y deja pendiente la diferencia si falta un importe. El botón «Descargar Excel» generó un archivo en PEN con dos hojas. Se reabrió en Numbers y se verificaron los importes numéricos. Los destinos de Logística y la guía de tareas de Operaciones se revisaron en el código. Queda pendiente el recorrido con una cuenta real en la web publicada. [Archivo de prueba](evidence/2026-11-08/costos-y-precios/costos-y-precios-cafe-bruma.xlsx) · [Computadora](evidence/2026-11-08/costos-y-precios/costos-computadora.png) · [Celular](evidence/2026-11-08/costos-y-precios/costos-celular.png)

## 6. Limpieza y prueba de publicación

> Ejecuta el bloque 6 de docs/CIERRE-FOR-U.md. Haz el recorrido completo en computadora y celular, retira las entradas antiguas que sigan apareciendo y dime exactamente qué quedó probado en la web publicada.

- Recorre portada, inicio de sesión, carga, nuevo proyecto, ruta, islas y Studio en una cuenta de prueba. Repite con un proyecto creado antes del cambio para comprobar que siguen abriendo su información y sus borradores.
- Retira de la navegación las entradas antiguas confirmadas. Antes de borrar una pantalla o un componente, comprueba si se usa desde otros rubros, enlaces existentes o proyectos previos.
- Deja por bloque las capturas reales, las pruebas hechas y los pendientes concretos. Registra la revisión publicada y distingue lo verificado en local de lo probado en Hostinger y Supabase.
