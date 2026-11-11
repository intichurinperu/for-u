# Objetivo 2 — Maqueta para revisión

21 octubre 2026. Estado: pendiente de aprobación visual. Fragmento independiente: `prototypes/foru-personalized.html`. No modifica la aplicación ni Supabase. Sustituye la muestra anterior para esta revisión; no autoriza implementar objetivo 3.

## Qué se puede recorrer

- Preparar mi ruta, explorar o crear manualmente, sin materiales obligatorios.
- Persona/proyecto y elecciones adaptativas de marketing, finanzas, logística y operaciones. Opciones, explicación, omitir, atrás, continuar después, resumen corregible y preparación local sin IA.
- Respuestas derivan página, siguientes pasos con motivo, mapa y tres propuestas. Responder no completa tareas, asigna fechas ni publica.
- Seis actividades con estructura y operación representativas. Cuatro vistas visibles: Mapa, Kanban, Calendario y Mi mundo.
- Página principal, catálogo y promoción con landing propia y referencia al producto. La promoción no sustituye la principal.
- Campaña, intención, oferta, tres composiciones, pieza, guion/video ilustrado, portada, perfil/destacados y biblioteca.

## Corrección exigida durante la revisión

La captura de la propietaria mostró cuatro campos de campaña simultáneos. Ese patrón incumplía el acuerdo. Todas las formas locales de creación/edición se presentan ahora mediante una decisión por paso, conservando los controles y valores originales al avanzar/volver. Las selecciones se muestran como tarjetas. El resumen es de lectura y Cambiar abre un detalle; confirmar es explícito. Campaña empieza por intención y oferta; el nombre es editable con valor sugerido y fecha opcional.

Al abrir un panel de preguntas se recoge el contenido de fondo. No hay que recorrer tres diseños para encontrarlo. Los filtros de fuente/campaña se abren individualmente. La etiqueta accesible del campo no repite otra pregunta visualmente.

## Evidencia comprobada

- Tres recorridos: sin materiales, proyecto que empieza y negocio que ya vende. Los ejemplos son ficticios e identificados.
- Sin materiales: escritura, sin cámara, sin herramientas y sesiones breves → propuesta tipográfica, dos pasos sugeridos, sin fechas ni tareas completadas. Pausa y recarga recuperaron respuesta y cursor. Corrección de secciones cambia la página preparada.
- Proyecto inicial: voz y evitar edición → guion/portada; recorrido pieza → guion → grabación ilustrada → portada → perfil. No se grabó audio/video real.
- Negocio existente: objetivo operación, material declarado y otras áreas → primera acción de operación y seis pasos pertinentes. Editar áreas dirige a sus preguntas, no a un formulario colectivo.
- Campaña: intención Conversar y conectar → producto Café → nombre QA → omitir fecha → revisar → guardar. Atrás conservó nombre; recargar conservó campaña, fuente e intención.
- Producto: editar nombre, revisar y guardar conservó catálogo. Perfil: editar bio mediante un solo campo y guardar conservó el texto. Promoción: producto → nombre → 2×1 → revisar/guardar abrió landing propia; la principal permaneció separada.
- Calendario: Actividad abre título primero, fecha después. Mapa/Kanban conservan referencias; aceptar/mover estado no duplica tareas.
- Entrada manual final: elegir actividad y destino en momentos separados; Servicios abre su página sin cuestionario y volver a Restaurante conserva la campaña.
- Seis páginas y superficies de operación recorridas a 360 CSS px: restaurante, tienda, turismo, hospedaje, cursos y servicios. Estas son representaciones de diseño, no prueba funcional de los módulos reales.
- Anchos finales medidos en DOM: 360/360, 768/768 y 1440/1440 (clientWidth/scrollWidth), sin desbordamiento en las vistas capturadas. Esto no prueba todas las pantallas ni sustituye iPhone físico.
- Seis pruebas Node del modelo: omisión de materiales, voz, negocio existente/áreas, idempotencia de tareas y exclusiones, seis rubros y fragmento independiente sin llamadas de servicio. Sintaxis JS comprobada.

Capturas en `evidence/2026-10-21-objective2/`. `propuestas-campana-intermedia-696.png` es una captura intermedia de 696 CSS px, no evidencia de 768. Las capturas de campaña de una pregunta y mapa 1440 corresponden a la corrección final de presentación.

## Límites y siguientes pasos

- Audio, interpretación, cámara, video, publicación, pedidos, exportación y proveedores están simulados e identificados. No se probó Gemini real en esta entrega.
- Guardado reducido del prototipo solo para revisión; no admite archivos ni representa el guardado remoto real. No introducir información privada. La memoria de revisión tiene límite; no es almacén de proyectos comerciales.
- Falta revisión/aprobación de la propietaria; teléfono físico, accesibilidad completa y QA de la aplicación pertenecen a objetivos posteriores. Los contratos de datos reales no se migraron.
- No se ejecutaron tests/build de producción ni se modificó Supabase. No se publicó nada en el dominio o negocios reales. Cierre de la maqueta no equivale a cierre del producto.
