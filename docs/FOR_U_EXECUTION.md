# FOR U — Registro de ejecución de los 16 objetivos

Actualizado: 22 de octubre de 2026. **Autorización vigente: ejecutar tres entregas completas; una pregunta a la vez. Entrega 1 en curso.** La autorización vigente permite continuar las tres entregas; los 16 objetivos son la lista interna, sin nuevos permisos entre avances. Especificación: [maestra](FOR_U_MASTER_SPEC.md); detalle de aceptación: [155 requisitos](FOR_U_REQUIREMENTS.csv); diagnóstico: [base](FOR_U_BASELINE.md).

## Estados y criterio de cierre

- `pendiente`: destino aceptado pero no trabajado/cerrado en esta secuencia.
- `en curso`: trabajo del objetivo activo, todavía sin cierre.
- `implementado`: código o documentos preparados; falta su verificación completa.
- `comprobado`: la aceptación de ese requisito/objetivo está probada con evidencia de alcance suficiente. Documentación comprobada no significa producto comprobado.
- `pendiente de aprobación visual`: recorrido técnico/muestra listo, se necesita decisión explícita de la propietaria.
- `bloqueado externamente`: falta una condición externa concreta, su evidencia, responsable y acción. Usar por subrecorrido; seguir trabajo independiente.

Registrar además evidencia de código, prueba local, transporte controlado, SQL aislado, sesión remota, teléfono físico, versión desplegada y aprobación visual por separado. No convertir un dato histórico en prueba actual. Un objetivo puede tener comprobaciones técnicas y revisión visual pendiente: se informa ambas y no se llama acabado globalmente.

## Orden, dependencias y estado actual

| Objetivo | Resultado | Dependencia | Estado de esta secuencia | Prueba/cierre |
| --- | --- | --- | --- | --- |
| 01 | Acuerdo, matriz, base y registro persistentes | Instrucción actual | comprobado | Auditoría documental A01–A10 y FOR_U_AGREEMENT_AUDIT.json |
| 02 | Maqueta actualizada y recorrido aprobado | 01 | comprobado | Base aprobada explícitamente el 21 octubre: «Sí, apruebo la base; continúa». No aprobación global del producto. |
| 03 | Datos compartidos y navegación | 02 **aprobado explícitamente** | comprobado | FOR_U_OBJECTIVE_03_AUDIT.md: dos proyectos QA, recarga, referencias, 360/768/1440, TypeScript y build. Alcances posteriores y prueba física separados. |
| 04 | Bienvenida, persona y proyecto | 03 | pendiente | Omitir/manual/retomar y audio privado |
| 05 | Diagnóstico adaptativo de cuatro áreas | 04 | pendiente | Respuestas cambian recomendaciones sin bloqueos |
| 06 | Ruta y resultados derivados | 05 y contratos03 | pendiente | Síntesis, diferencias, idempotencia y vistas compartidas |
| 07 | Páginas/editores de seis rubros | 03,06; diseño02 | pendiente | Edición directa, recursos, guardado/publicación separada |
| 08 | Ofertas y landings específicas | 07,contratos03 | pendiente | Oferta→landing propia sin duplicar catálogo |
| 09 | Campañas, plantillas, piezas | 08 | en curso | Tres composiciones, variantes, exportación real |
| 10 | Perfil, destacados, organización | 09 | pendiente | Referencias/grid/calendario/biblioteca sin duplicación |
| 11 | Guion, grabación y portada | 09,10 | pendiente | Medios reales vinculados a pieza; físico pendiente separado |
| 12 | Gemini real y material interpretado | Contratos03,flujos04/09/11; X01 para proveedor | pendiente | Respuesta real y aceptación sin mutación automática |
| 13 | Operación especializada | 07,08; X04/X06 solo donde aplique | pendiente | Resultado disponible por cada rubro, costos/pedidos reales QA |
| 14 | Resto de herramientas integrado | 03–13 según herramienta | pendiente | Matriz de accesos recorrida, estados y retorno |
| 15 | Validación transversal | Implementación anterior; X02/X03 para remota/física | pendiente | Seguridad, red, conflictos, móvil, teléfono y renderer |
| 16 | Demostración/cierre integral | 01–15 | pendiente | Auditoría de matriz, aceptación técnica/visual y externos |

La base ya existente NO vuelve estos objetivos completos. No volver a implementar lo que pueda conservarse; cada entrega empieza por sus IDs y B de la matriz, adapta y comprueba el nuevo destino.

## Contratos copiables de trabajo

### 01 — Acuerdo completo y trazabilidad

Guardar especificación, fuente íntegra, matriz requisito/objetivo/pantalla/datos/prueba, registro e inventario de base/discrepancias. Conservar todos los requisitos compatibles del plan integral y personalización. Solo documentos; sin aplicación/Supabase.

Aceptación: cobertura de todas las secciones, fuentes identificables, estados honestos y auditoría de archivos/enlaces; siguiente trabajo objetivo02, no implementación real.

### 02 — Actualizar la maqueta integrada

Actualizar la maqueta existente, no empezar otra inconexa: tres entradas, persona/proyecto, preguntas adaptativas de cuatro áreas, resumen corregible, preparación real ilustrada y resultados diferenciados. Página y oferta con landing propia; campaña→intención/oferta→tres propuestas→pieza→guion/video→perfil/destacados; cuatro vistas visibles y seis rubros. Probar sin materiales, principiante y negocio existente en360/768/1440.

Aceptación: cada recomendación entendible y derivada de elecciones; simulaciones identificadas; entregar para revisión de la propietaria. **Detener extensión a app hasta aprobación explícita.** Base aprobada explícitamente el 21 octubre: «Sí, apruebo la base; continúa». No aprobación global de la aplicación.

### 03 — Datos compartidos y navegación

Tras02aprobado, definir contratos/versiones para cuenta/diagnóstico/ruta/propuesta/oferta/página/campaña/pieza/perfil/materiales/costos, reutilizando repositorios. Separar cuenta/proyecto y conservarUUID/URLs/histórico; lectura compatible y mutación explícita. Implementar cuatro vistas, cinco espacios, retorno, Hoy/Continuar; estados/revisiones/guardado parcial y recuperación. No crear segundo catálogo/sesión.

Aceptación: dos proyectos sin mezcla, recarga y referencias correctas, formatos desconocidos rechazados; acceso sin página/guía. B02/B04/B13/B18 expresan ampliaciones necesarias, no permiso de migración automática.

### 04 — Bienvenida y persona

Recursos originales saltable/carga paralela/una apertura/sonido opcional/reduced-motion. Entradas ruta/explorar/manual. Una pregunta con explicación, opciones y texto/audio voluntarios; nombre/trato separados de proyecto/rubro/momento/equipo/antigüedad/origen/propósito/horizonte/público/objetivo. Guardar al continuar, omitir/volver/retomar. Audio privado90s, escuchar/descartar/reintentar por clic; no IA automática ni material obligatorio.

Aceptación: completar, omitir, error, reintentar y recargar sin duplicar ni perder; preferencias no inferidas. La guía no duplica datos comerciales canónicos.

### 05 — Diagnóstico adaptativo

Implementar todas las preguntas/opciones de secciones5–6 del maestro y situación existente de4. Marketing primero; otras áreas opcionales después. Selección múltiple cuando aporte. Adaptar recomendaciones a comodidad, límites, recursos, herramientas, tiempo, fricción y canal. Orgánico/anuncios sin gasto; presupuesto/periodo opcionales, ejemploS/10 sin garantía; recordatorios opt-in.

Aceptación: los cinco casos de personalización M12 y variantes por rubro cambian ruta; ingresos no fijan nivel/acceso, omisión no insiste ni inventa.

### 06 — Preparación, mapa y vistas

Resumen corregible→Preparar mi espacio mediante reglas versionadas. Ruta/etapa, estructura de página, tareas con motivo y aceptación/posponer/quitar, Studio/perfil/operación pertinentes; fechas solo aceptadas. Progreso real sin espera ni IA automática. Mapas hechos/tareas/resultados; foco móvil; Kanban/Mundo/Calendario mismas referencias. Cambios posteriores muestran diferencias y no borran trabajo aceptado.

Aceptación: dos diagnósticos generan resultados distintos; repetir no duplica; responder no completa. Acceso manual conservado y Hoy hasta3. Medir después objetivo de primera estrategia en10min sin promesa comercial.

### 07 — Editores y páginas profesionales

Página como superficie directa en seis rubros; barra/selección/textos/imágenes/ofertas/CTA/secciones/miniaturas/orden/historial. Fotos por biblioteca/subir/encuadrar, URL secundaria, drag por destino y alternativa táctil. Propuesta canónica y diferencias selectivas. Sin fotos composición tipográfica; orientaciones no publicables, ningún dato inventado. Conservar catálogos/variantes/extras/widgets/URLs y puente validado. Comparación/presentación pública versionada/republicación explícita.

Aceptación: cada rubro edita texto/foto/CTA/oferta/sección, ordena, guarda y recarga; mantiene publicación anterior y datos privados; móvil real. No basta profesionalizar el editor genérico dejando otros intactos.

### 08 — Oferta y landing específica

Oferta de beneficio/paquete/descuento ligada a catálogo: precio/condiciones/vigencia/modalidad/público/mensaje/CTA/límite confirmado. Página principal y múltiples landings de oferta independientes, borrador/publicación y campaña/piezas relacionadas. Precios validados en servidor y sin activar por diagnóstico.

Aceptación:2x1caféQA y otra oferta con landings propias, recarga/cambio/publicaciónQA explícita sin sustituir principal o duplicar productos; términos válidos y sin publicidad real.

### 09 — Creator Studio conectado

Campañas/Crear/Perfil/Biblioteca. Campaña con objetivo/oferta/periodo/referencias, pieza suelta permitida. Seis momentos comerciales; intención/oferta/comodidad/campaña antes del formato. Tres composiciones distintas desde idea/sección/oferta/página por reglas y recursos confirmados. Capas/logo/CTA, variantes/historial/deshacer, carrusel/grupo, formatos1:1/4:5/9:16 y exportación real con desbordamiento. Fuente/revisión/cambios sin sobrescribir.

Aceptación: campaña→oferta→plantilla→pieza→guardar/recargar/exportar; repetir sin fotos/campaña y comprobar misma fuente/UUID. Ningún texto de orientación termina como oferta real por error.

### 10 — Perfil y organización

Identidad editable; tres principales Conóceme/Conversemos/Oferta recomendadas sin bloqueo. Miniaturas reales y portadas reel; encuadregrid independiente. Destacados por rubro con nombres/portadas/material. Cuadrícula/lista/calendario y filtros campaña/momento/estado; ordenar por drag/botones sin modificar fechas; biblioteca multimedios por proyecto/pieza.

Aceptación: reordenar/guardar/recargar/abrir pieza conserva referencias; datos iguales en calendario; nada afirma modificarInstagram. No exigir diez contenidos antes de trabajar.

### 11 — Video de este post

Misma pieza: guion/tomas manuales o IA explícita→ensayo/teleprompter→grabación por acción/permisos→revisión/repetición→portada vertical o fotograma→archivo/formato real/biblioteca. Cropgrid separado. Reutilizar recorte/subtítulos/exportación comprobados; no mantener solo estado en memoria.

Aceptación: post/guion/video/portada sobreviven recarga y cambio de herramienta; permisos denegados/interrupción/reintento sin pérdida. FísicoSafari por separado. Montajes/video generativo/transiciones avanzadas quedan futuros.

### 12 — Gemini real y materiales

Revalidar configuración/secreto/cuota/modelo sin exponer claves. toolkit-ai autenticado y referencias/revisión autorizadas; operaciones separadas/schemaJSON/validación para ideas/contenido/layout/guion/página/tarea/material y transcripción revisable. Hasta10ideas, tarea<=3pasos/icono permitido/estimación explícita/sinXP. Contexto acotado, cuota/caché5min y exclusión de duplicados; no llamada al navegar/escribir/adjuntar/grabar; aceptación antes de aplicar.

Aceptación: respuesta del proveedor real y pruebas de permisos/contextoajeno/JSON/promptmalicioso/cuota/reintento; manual sigue funcionando. Logs solo uso, no texto/secretos; sin facturación/fallbackpagado/imagen/cachépagada. SiX01 falta, cerrar solo partes comprobadas y continuar independiente, sin declarar IA funcional.

### 13 — Operación por rubro

Restaurante menú→carrito/pedido→preparación/entrega/seguimiento; modalidades/horarios/zonas/tarifas y precio servidor. Compras de insumos/costos privados ligados a plato/receta/ingrediente/unidad/rendimiento; directo confirmado, incompleto visible, margen no utilidad, compra idempotente y preparación existente conservada. No confundir compra de insumos con commerce_orders.

Tienda pedidos/clientes/entrega; turismo salidas/cupos/reservas; hospedaje solicitudes/disponibilidad; cursos materiales/acceso real; servicios cotización/seguimiento. Preservar MercadoPago separado de ejecución, cotizaciones/versiones, política del negocio, anonimato/token y reintento. Correo separado de reserva.

Aceptación: resultadoQAporseisrutas y controles de precio/permisos/duplicado; capacidad incompleta reparada o identificada; sin proveedor inventado ni cobro real. X04/X06 no bloquean interfaz/operación manual independiente.

### 14 — Toda herramienta integrada

Recorrer la cobertura de App y herramientas y extender el patrón aprobado a registro/login/legacy/públicas/proyectos/propuesta/calendario/resultados/conexiones/cobros/automatizaciones/configuración/ayuda/Pomodoro/Mundo. Contexto, guardado y retorno en cada una; URLs antiguas siguen válidas. Ayuda preparada sinIA; ideas separadas y conversión explícita; recordatorios con consentimiento. Datos de métricas y conexiones tienen carga/vacío/error/pending/vencido diferentes. No fakezero/autoconexión/autopublicación.

Aceptación: cada fila de cobertura tiene ubicación nueva y prueba; sin acceso huérfano ni rubro incorrecto. Carita/timer no cubren contenido y operación de descanso no modifica tareas.

### 15 — Validación transversal

Comprobar teclado/foco/modales/contraste>=4.5/targets44/reduced-motion/alternativasdrag, safeareas/teclado/zoom/orientación; anchosCSS360/768/1440. FísicoiPhone16Safari enHTTPS para audio/cámara/video/exportación. Dos proyectos, cambioscuenta/red/reintento/parcial/conflicto real/formatos/compatibilidad/permiso/preciomanipulado/públicoanónimo; segunda sesión autorizada para aislamiento remoto. Mi mundo alternativo/renderer60s si cambia, preservar recompensas/logros/timer.

Aceptación: evidencia por alcance y fallos corregidos; fixtures y emulación etiquetados, no sustituyen proveedor/físico/remoto. Checks TypeScript/pruebas/build proporcionales con Vite4Tailwind3Node18/20. SQL nuevo solo diagnóstico y ensayo aislado antes de autorización aplicable.

### 16 — Cierre del recorrido y auditoría completa

Revisar matriz y resolver omisiones. Recorrido de extremo a extremo: bienvenida→diagnóstico corregible→espacio/mapa/tarea→página→oferta/landingpropia→campaña/trespropuestas→pieza/guardar/recargar/exportar→guion/grabar/portada→perfil/destacados/biblioteca/calendario→operación/resultados. Repetir sinmateriales/existente/manual y cambiarproyecto. Edición de borrador no modifica publicación/piezas.

Aceptación: tiempos observados para primera estrategia; checks pertinentes, commits revisables, previewactualizada y versión local/dominio diferenciadas. Informe separado de funcionamiento, aprobación visual y externos. No declarar appoptimizada con filas sin comprobar. SinHostinger/INTICHURIN/publicaciónreal/cobroproductivo/facturación; imágenes/Meta/cuotas/transicionesfuturas no se pierden del registro.

## Sesión documental — 21 octubre 2026

Cambios autorizados: solo documentación. No acceso remoto, no secretos, no SQL, no pruebas de app ni despliegue. Se inspeccionaron contratos y pantallas registradas en B01–B26, se archivó el adjunto íntegro y se consolidaron155requisitos. Se conservarán los documentos antiguos con aviso de precedencia.

### Auditoría de aceptación del objetivo1

| Auditoría | Requisito | Evidencia necesaria | Resultado |
| --- | --- | --- | --- |
| A01 | Fuente íntegra sin pérdida | Igualdad de bytes/SHA256 adjunto y copia | comprobado; hash en auditoríaJSON |
| A02 | Todos los apartados del adjunto | Trazabilidad de sus12apartados a IDs | comprobado; tabla por apartado, referencias validadas |
| A03 | Plan integral y requisitos compatibles | Tabla integral en trazabilidad y secciones2–19maestra | comprobado documentalmente; contraste manual, no prueba de app |
| A04 | Matriz completa usable | IDs únicos, columnas completas, objetivos1–16, sección válida y B resolubles | comprobado;155filas válidas y26bases |
| A05 | Cobertura sin herramientas/rutas olvidadas | Comparar App.tsx y ToolId con filas de pantalla | comprobado;52rutas+12herramientas+10accesos=74filas pendientes de QA |
| A06 | Base reutilizable y límites reales | B01–B26 y D01–D20 con archivos y huecos concretos | comprobado por inspección; ninguna base declarada funcional solo por código |
| A07 | Estados y aprobaciones honestos | Objetivos2–16pendientes y no considerar aprobado el prototipo | comprobado; soloG01–G04 documentales cerrados en matriz |
| A08 | Persistencia de documentación y enlaces | Todos los enlaces internos y CSV legibles | comprobado; enlaces resuelven, fuente copiada al proyecto |
| A09 | No aplicación ni Supabase | Gitdiff solo docs/README; ninguna llamada remota o mutación externa | comprobado; diff frontend/supabase/scripts vacío, herramientas solo locales |
| A10 | Retomar sin repetir análisis | Objetivo02/dependencias/bloqueos/futuros y fuente identificados | comprobado; siguiente objetivo02 requiere su instrucción, no se inició |

Evidencia estructural: [FOR_U_AGREEMENT_AUDIT.json](FOR_U_AGREEMENT_AUDIT.json). Se comprobó igualdad de fuente,12apartados,19secciones maestras,16contratos de objetivo, referencias/IDs/estados, rutas exactas frente a App.tsx, expansión de ToolId, enlaces locales y conservación del cuerpo de README/plan/registro históricos. La cobertura semántica se contrastó manualmente en FOR_U_SOURCE_TRACEABILITY.md; el validador estructural no pretende probarla automáticamente. No se ejecutaron TypeScript/build/pruebas de app porque no cambió su código. No hubo acceso remoto. La aprobación visual pendiente del producto no impide completar esta consolidación documental.

## Protocolo al retomar cualquier objetivo

1. Leer sección propia, IDs de matriz y B pertinentes; no releer todo el historial ni repetir QA sin motivo.
2. Contrastar git y código actual; si cambió desde esta inspección, actualizar base y conservar requisito.
3. Trabajar solo alcance autorizado y reutilizar bases. Registrar discrepancias, no resolverlas borrando funciones.
4. Mantener evidencia de cambios/pruebas/versión y estado por requisito. No marcar producto comprobado por documentación.
5. Si hace falta intervención externa, indicar acción concreta sin claves por chat y avanzar partes independientes.
6. Entregar recorrido revisable; conservar gate visual y futuras instrucciones por objetivo. No comenzar otro automáticamente por tenerlo documentado.

## 21 octubre — Objetivo 2: muestra personalizada y corrección de preguntas

Actualizada la maqueta independiente existente. Evidencia, límites y recorridos: [FOR_U_MOCKUP_REVIEW.md](FOR_U_MOCKUP_REVIEW.md). La propietaria rechazó la campaña con cuatro campos simultáneos: la regla ahora es global, una pregunta o decisión de edición por momento, también en paneles secundarios. Campaña, producto, promoción, perfil y calendario se recorrieron con controles progresivos y resumen revisable; el fondo se recoge mientras se responde.

La muestra está lista para revisar, **sin aprobación visual y sin autorización para objetivo 3**. Ningún resultado del prototipo cierra requisitos de la aplicación. No se modificaron frontend, Supabase, INTI CHURIN ni negocios reales. No se ejecutaron build/TypeScript de la app porque esta entrega no cambia su código.

## Agrupación autorizada: tres entregas utilizables

La propietaria autorizó el 21 octubre: «Ejecuta estas tres entregas usando el acuerdo guardado. Empieza por el recorrido completo de entrada a página editable; corrige también la pantalla actual. No cierres la entrega por pruebas técnicas si el recorrido sigue siendo confuso». Sustituye la obligación de copiar objetivos uno por uno; los 16 y sus requisitos se conservan como lista interna. No autoriza publicar negocios reales, activar facturación ni modificar INTI CHURIN.

1. **Mi negocio toma forma — en curso:** entrada/proyectos actual, bienvenida, tres entradas, preguntas de cuenta/proyecto, diagnóstico, revisión/preparación, mapas y página editable especializada. Objetivos 04–08 y partes pertinentes de 14–15; reutiliza 01–03.
2. **Creo y organizo contenido — pendiente:** ofertas/campañas/plantillas/composición, biblioteca/perfil/cuadrícula, guion/teleprompter/video/portada/calendario. Objetivos 08–11 y capacidades de 12 pertinentes.
3. **Gestiono y compruebo mi negocio — pendiente:** operación y resultados de seis rubros, herramientas restantes y cierre integrado. Objetivos 13–16.

Persistencia, móvil, accesibilidad e IA por acción acompañan cada entrega. El cierre visual exige recorrido real entendible, no solo TypeScript/build. No se eliminan requisitos por esta agrupación.

## Avance de la entrega 1 — entrada y página editable (21 octubre)

Estado: **en curso; sin cierre visual**. Se implementaron la bienvenida con tres entradas, preguntas progresivas, diagnóstico seleccionable, resumen revisable y preparación idempotente de ruta, tareas y borrador por rubro. Se conservan los documentos históricos y la publicación existente. El acceso Mi página converge en el editor compartido; los catálogos originales siguen disponibles.

QA autenticado: proyecto `aa420f8a-2267-4fbf-b1bb-e756278fd352`, «QA Ruta visual · 21 octubre». Crear → responder → revisar → preparar guardó dos tareas y un borrador. Editar título directamente → esperar «Borrador guardado» → recargar conservó «Un café para encontrarnos · QA». No se publicó la página. Una respuesta comercial requirió reintento; se conservó y luego guardó, sin diagnóstico definitivo de causa remota.

Inicio: corregidos enlace de Hoy y accesos de recuperación que conservaban azul/subrayado nativo. Vista compilada de 4175 actualizada; comprobación DOM: sin enlaces visibles azules subrayados; ancho CSS360 con documento360. Carita/timer compactados. Cabecera del editor compactada; resumen muestra primero elecciones esenciales.

Verificación: 25 pruebas pertinentes aprobadas, build aprobado; TypeScript aprobado también después de la última compactación. Evidencia local: `/tmp/foru-delivery-evidence/inicio-actual.png`, `/tmp/foru-delivery-evidence/inicio-360.png`. No equivale a aprobación visual ni prueba física iPhone.

Pendientes de esta entrega: edición contextual de una decisión por momento, ofertas/catálogo y navegación completa por seis rubros, mapa/Kanban/calendario con resultados reales, recuperación/conflictos, móvil integral. Entregas 2 y 3 siguen pendientes. Gemini real, audio interpretado, publicación de presentación3, aislamiento con segunda cuenta y pruebas físicas no verificados en esta sesión. Sin cambios en negocios reales, INTI CHURIN, Hostinger ni facturación.

## Avance de la entrega 1 — edición por decisión (22 octubre)

Estado: **implementación parcial, QA visual pendiente; entrega no cerrada**.

- Panel contextual de la landing: elegir un ajuste antes de mostrar su control; texto, destino, alineación y color de CTA separados. Fotos y descripción accesible separadas. Configuración agrupada por identidad, contacto, publicación y ayuda.
- Añadir sección separado de ordenar; composiciones con miniaturas y sección libre insertada en el destino elegido, conservando arrastre, flechas e historial.
- Oferta nueva: tipo → nombre → descripción → modalidad de precio → importe cuando corresponde → revisión. Fotos, condiciones, presentaciones y extras opcionales después. Los productos confirmados siguen usando el catálogo original; no se cambia el contrato de precios ni de IDs.
- Presentaciones y extras: nombre, precio y disponibilidad por momentos. Una opción nueva usa precio pendiente, sin asumir cero.
- Paneles portados fuera del contenido: fondo inerte, foco contenido y devolución al cerrar, bloqueo de scroll con recuento de paneles y áreas seguras. Conservan la clase de identidad para evitar botones negros fuera del contenedor principal. Este comportamiento todavía requiere comprobación visual/teclado real.
- Sugerencia textual antigua de configuración ahora requiere revisión y aceptación; no se aplica automáticamente. No se probó proveedor real.
- Mapa/Kanban: motivos de tareas leídos de la ruta, información del diagnóstico nuevo con lectura compatible anterior. Reparado `studio` como herramienta reconocida: los pasos generados pueden abrir Creator Studio y conservar el destino desde Hoy.

Validación local con Node20.20.2 en copia temporal y dependencias del lockfile: suite completa 199/199; tras añadir regresión de destinos, 12/12 pruebas de ruta/enfoque; TypeScript aprobado. Build aprobado también después del ajuste de devolución de foco. Se respeta «Marketing más adelante» sin añadir la sugerencia de contenido. No se modificaron Vite4/Tailwind3/dependencias del proyecto. La carpeta original de dependencias bloqueaba las comprobaciones; no se reemplazó.

Vista local restablecida en `http://127.0.0.1:4175/dashboard`. La pestaña del usuario seguía en 50118 sin servidor. El control del navegador rechazó adquirir la pestaña por política de URL; no se intentó eludirlo. Se pidió al usuario abrir 4175 manualmente. Sin captura nueva ni recorrido visual de este avance: no sustituirlos por las capturas del 21. Continúan pendientes las pruebas integradas y físicas indicadas en el acuerdo.

### Continuación de QA y corrección de densidad — 22 octubre

La usuaria abrió 4175 y se retomó el navegador autorizado. Verificado en `aa420f8a-2267-4fbf-b1bb-e756278fd352`: CTA → un único input visible en panel → cambio a «Ver mi propuesta QA» → «Borrador guardado» → recarga conserva el texto. En CSS360, documento360 y raíz de fondo con atributo inert. Evidencia `/tmp/foru-o22-evidence/editor-one-question-360.png`.

Nueva oferta QA por preguntas: producto → nombre «Café de prueba QA · no comercial» → descripción de prueba → precio confirmado S/6 → revisión → guardado en catálogo → guardado de selección en propuesta. Recarga y vuelta a Tus ofertas muestra una sola oferta con el precio confirmado. No se publicó ni se completó una tarea. Evidencia del paso de precio `/tmp/foru-o22-evidence/oferta-precio-360.png`.

La usuaria rechazó la cantidad de botones de la pantalla de propuesta durante QA. Se redujo la navegación permanente dentro de herramientas a Mapa, proyecto y menú; las cuatro vistas siguen visibles al estar en el mapa y disponibles en el menú de herramientas. Eliminados títulos duplicados y tres pestañas grandes de propuesta; selector compacto de vistas. Acciones de ajustes/catálogo recogidas, una acción principal, sin foto vacía en oferta. Foto/condiciones/opciones de la revisión recogidas explícitamente. La aprobación visual final sigue pendiente. Evidencia `/tmp/foru-o22-evidence/propuesta-simplificada-360.png`.

Añadida lectura del catálogo confirmado en un borrador vinculado al módulo para que la oferta recién guardada aparezca al abrir la página; conserva textos y documentos guardados, y no cambia publicaciones. Regresión comprueba aislamiento respecto a páginas vinculadas a propuesta e inmutabilidad de snapshot. Suite final 201/201, TypeScript y build aprobados; comprobar actualización final de la vista al cerrar. La vista se actualiza conservando los assets anteriores para evitar fallos de carga de pestañas abiertas durante una compilación.

Pendientes conservados: prueba de reemplazo/subida/encuadre real de foto, recorrido de CTA/secciones completo y recuperación bajo conflicto, QA móvil integral de cada rubro, proveedor real/audio e iPhone físico, contenido y operación de las entregas 2–3. Este registro no declara completa la entrega 1 por tener checks técnicos.

Cierre de este avance parcial: verificado producto QA visible en la landing vinculada, FAQ insertada antes de Historia, subida con flecha, deshacer, texto de dos párrafos, guardado y recarga conservando orden/contenido. La barra de tablet desbordaba30px; corregida y medidos documento/viewport iguales en360/768/1440. La barra de edición contextual se recoge hasta seleccionar. Evidencia persistente en `docs/evidence/2026-10-22/`, en especial `ofertas-sin-navegacion-duplicada-360.png`. No se trata de una prueba física de Safari ni de aprobación final del diseño.


## Entrega 2 — Studio por intención y piezas conectadas (22 octubre)

**Avance parcial, sin cierre técnico integral ni aprobación visual.** Se continúa el objetivo global; no se han dado por terminadas las entregas 1–3.

Studio ahora comienza por intención → información confirmada/idea → formato → tres composiciones revisables → editar. Las seis intenciones son opciones de una pregunta; no seis formularios. Campañas, Crear, Mi perfil y Biblioteca se reúnen en un selector. Las capacidades anteriores siguen disponibles en controles secundarios. No se exige foto, página ni campaña para crear.

Tres composiciones tienen geometría propia y comparten el renderer del editor, miniatura, pieza y exportador. Sin fotografías usan texto confirmado. El editor muestra Guardar como acción principal, edición directa y ajustes de un campo por momento. Exportación, variantes, historial y guion quedan en el menú. La planificación de una pieza también abre un ajuste por momento.

Fuentes con proyecto/revisión y comprobación de existencia al guardar; rechaza origen ajeno, enlaces temporales y rutas inválidas. Guardado ordenado diseño → pieza → campaña, identifica guardado parcial y conserva UUID al reintentar. Pruebas cubren fallo intermedio, duplicados, fuente retirada/cambiada y contexto inválido. Ideas escritas se conservan en sessionStorage por cuenta/proyecto durante la sesión. Sin IA ni cambios comerciales automáticos.

QA real autenticado en `aa420f8a-2267-4fbf-b1bb-e756278fd352`:
- Oferta S/6 existente → propuesta → diseño `73e11fd0-7f96-4411-b123-c745728757bb` → título directo «Café para conversar · QA» → guardar y recargar conserva edición.
- Exportación produjo PNG real 1080×1350, inspeccionado. Archivo recibido en Downloads, sin publicación.
- Abrir guion conserva el UUID. Guion manual QA guardado y presente en teleprompter. No se activaron cámara ni micrófono.
- Campaña `275fd383-a338-4e29-9097-685c3a759ce6`, «Café y conversación · prueba QA», con objetivo/oferta; crear diseño `e129e1bd-a6f3-4f81-80d5-d624792bf6cb`; recarga muestra una pieza y su miniatura enlazada. Biblioteca recupera ambos diseños.
- Viewport/documento iguales en CSS360/768/1440 para superficies comprobadas de Studio. Se corrigieron miniaturas móviles inicialmente demasiado pequeñas y cabecera del editor que estrechaba el estado. No equivale a prueba física Safari/iPhone ni a comprobación de todas las pantallas.

Verificación local con dependencias del lockfile en snapshot temporal: 209 pruebas aprobadas (8 nuevas de composición/guardado), TypeScript y build aprobados. Sin cambios de dependencias ni Vite/Tailwind/Node soportados. Vista4175 actualizada conservando chunks anteriores.

Evidencia persistente en `docs/evidence/2026-10-22/`: `studio-editor-360.png`, `studio-campana-360.png`, `studio-intencion-360.png`, `studio-intencion-1440.png`.

**Pendientes explícitos de Studio:** adaptar composiciones/plantillas por rubro y momento comercial, filtros completos de comodidad y ofertas específicas, fuente publicada y aviso integral de revisión, carrusel progresivo, organización del perfil/grid/destacados/calendario, biblioteca unificada de todos los tipos de material, grabación/portada/exportación real y Safari físico. La biblioteca integrada de este avance muestra diseños y la biblioteca de fotos existente; no se declara completa la biblioteca multimedia. Continuar además las entregas 1 y 3 y la matriz de todas las herramientas. Gemini real/audio, aislamiento remoto con segunda cuenta e integraciones externas siguen sin prueba de cierre.

## Addendum de prueba personal — 22 octubre: siete ajustes, alcance acumulativo

Se incorpora al acuerdo vigente, sin sustituir las tres entregas ni sus requisitos: multiselección compatible; necesidades separadas de una prioridad; composiciones/widgets por seis rubros; tutorial posterior a preparar página; primeros contenidos Conóceme/Conversemos/Mi oferta; creación desde sección; retorno al origen con proyecto y cambios conservados.

Avance de implementación, todavía sin cierre visual:
- Preguntas compatibles admiten varias selecciones, conservan el texto comercial canónico y restauran opciones separadas por « · ». Necesidades múltiples producen recomendaciones independientes; prioridad solo ordena, sin quitar necesidades. Se conserva la lectura de respuestas anteriores.
- Perfil con vista de resultado, destacados, tres posiciones principales, cuadrícula/lista/calendario y filtros; selección y orden mediante referencias a piezas. Pruebas QA previas: biografía/destacado recargados, posición tercera conservada, orden orgánico guardado sin cambiar fechas ni borrar piezas. No equivale a completar grabación o biblioteca multimedia.
- Tutorial contextual y omisible al abrir la página preparada desde la guía: Crear mis primeros contenidos / Seguir editando. Un propósito por elección; propuestas por reglas y recursos confirmados.
- Origen cerrado de landing guardado dentro del diseño, validado por proyecto; regreso desde editor y pieza recupera sección conocida. Se evita interpretar metadatos como rutas arbitrarias. Selección inválida vuelve al hero.
- La acción contextual guarda primero el borrador cuando hace falta y solo navega si el guardado termina correctamente.

Verificación local inicial: 222 pruebas aprobadas, TypeScript y build. Se inicia QA autenticado en proyecto desechable `aa420f8a-2267-4fbf-b1bb-e756278fd352`, pestaña separada; no se altera el proyecto de prueba personal `87b198a9-9d1c-4934-800e-89b14eb1517f`.

Pendiente para este addendum: comprobación completa de ida/vuelta, estado/scroll y Atrás; widgets/composiciones especializados; dos proyectos y recorrido nuevo completo; tamaños y teclado; aprobación visual de Nicole. Se mantienen TODOS los pendientes externos y de las entregas anteriores. No se publica, no se activa facturación ni se despliega en Hostinger.

QA adicional comprobado en interfaz: tutorial → Conóceme → fuente hero confirmada → formato vertical → tres propuestas → guardado del diseño `b274dbe5-e9b5-4dc9-b8f4-7363e4592375` → recarga → botón «Volver a mi página» → landing del mismo proyecto con `section=hero&resume=1` y borrador cargado. Evidencia: `studio-retorno-origen.png`. Durante QA se detectó una selección de fuente repetida tras elegir intención desde la landing; se corrigió para usar la sección conocida en Conóceme/Conversemos. Mi oferta sigue solicitando una oferta confirmada para no convertir historia en una venta inventada. Último TypeScript/build de esa corrección aprobados. Falta repetirla visualmente y verificar sección distinta de hero, guion, móvil y Atrás; no cierre del recorrido total.

## Secciones tipadas y composición conectada — 22 octubre (avance abierto)

Las estructuras nuevas identifican catálogo, historia, FAQ, ubicación y detalles. Se conserva lectura de bloques previos y solo la presentación v3 usa estas composiciones. El menú/catálogo confirmado se muestra dentro de su sección, sin una segunda copia al final; tarjetas conservan IDs, precios, condiciones, presentaciones y extras. Sin catálogo, el editor ofrece configurar su fuente; no aparecen productos ficticios en público.

Preguntas frecuentes con pares pregunta/respuesta explícitos se muestran en desplegables nativos. Historia y contacto reciben composiciones propias. La proyección del catálogo puede reutilizar historia/dirección/horario confirmados únicamente en secciones nuevas que lo permiten; borrar o editar el texto desactiva ese origen para no restaurar contenido contra la decisión de la persona. Datos de costos/inventario no se incorporan a la página.

227 pruebas aprobadas, TypeScript y build. QA autenticado: menú dentro de Menú con producto original; FAQ «¿Es una oferta real?» abre «No. Esta página contiene datos de prueba QA.»; creación contextual desde FAQ lleva sus textos a tres composiciones sin pedir nuevamente la fuente. Evidencia `secciones-menu-faq.png` muestra el desplegable abierto (no acredita todas las secciones ni todos los tamaños).

Pendientes conservados: modalidades/horarios de pedido integrados con validación, composiciones específicas completas y acciones operativas por seis rubros, configuración guiada de todas las secciones, regreso desde sección distinta de hero tras guion y recarga, móvil y dos proyectos, aprobación visual. No confundir los widgets de otros proyectos publicados con los componentes operativos del negocio. No se ha publicado esta página ni desplegado a Hostinger.

QA contextual adicional: FAQ `b196865e-1239-4404-9624-1642af0c3020` → intención confianza → formato cuadrado → composición guardada `b20fee32-126b-43cf-809a-11575f9dc098` → Volver a mi página devuelve esa sección exacta y carga borrador/FAQ/catálogo. No acredita todavía guion, calendario, Atrás o móvil. Pestaña QA conservada para continuar. Git status/diff global siguen sin devolver resultado en los handles observados; los cambios permanecen en el árbol de trabajo y el commit revisable continúa pendiente, sin reiniciar ni descartar procesos por timeout.

## Retorno de vista y controles móviles — 22 octubre (sin cierre global)

Se guarda selección/vista de edición en sesión por cuenta/proyecto; se ignoran secciones eliminadas y datos de caché inválidos. El origen de una pieza admite vista móvil/escritorio validada, sin destinos arbitrarios. Atrás del navegador vuelve a la landing conservando la vista móvil elegida. Comprobado QA en CSS360: ancho de documento 360, sin desbordamiento horizontal; retorno de Studio a FAQ con vista móvil activa. La captura `editor-seccion-360.png` acredita esa superficie, no el recorrido físico iPhone.

Se corrigió herencia de texto blanco en flechas de ordenar sección; controles de sección se revelan con selección/foco y mantienen alternativa táctil. Iconos de dispositivo/undo/redo pasan a SVG de la librería ya instalada, sin dependencia nueva.

Diagnóstico adicional: la ruta Servicios creaba una página vinculada a un módulo que no existe. Ahora usa las ofertas de su propuesta y puede comprobarlas antes de publicar sin pedir un catálogo de restaurante. Se oculta el enlace `/modules/undefined/editor`; se conserva rechazo de referencias nativas inexistentes. Cambio probado localmente; falta recorrido remoto completo de servicios y publicación QA explícita.

230 pruebas aprobadas, TypeScript/build. No se modifica la publicación de ningún negocio. Permanecen pendientes el recorrido nuevo con dos proyectos, calendario/guion/origen completo, componentes operativos por rubro, matriz global y aprobación visual.

QA nuevo creado desde cero: `c902defd-93f6-4542-bd79-24545e231315`, «QA Servicios · multiselección 22 octubre». Se omiten preferencias personales, sin sustituir nombre ni tratamiento de la cuenta. Ruta Servicios, inicio exploratorio sin materiales; preguntas opcionales omitidas. En oferta, «Un servicio» y «Una asesoría» quedan seleccionadas a la vez sin avanzar; Continuar inicia guardado. Se continúa verificando regreso y recarga antes de preparar su página. El proyecto personal de Nicole sigue intacto.

QA nuevo: después de Continuar → Atrás → recarga, las dos ofertas siguen marcadas en la pregunta única. Se seleccionan dos necesidades (mostrar oferta y crear contenido), luego contenido como prioridad. La revisión conserva ambas y ofrece exactamente los dos pasos correspondientes. Preparar guarda borrador de Servicios y dos tareas sin completarlas; abrir página presenta el tutorial con ambas acciones. Se inicia Conóceme sin pedir otra vez el rubro ni materiales. Evidencia de recarga: `guia-multiseleccion-recarga.png`.

Checkpoint revisable del avance acumulado: commit `ce39acd`. Después del checkpoint se corrigen las etiquetas de resumen (necesidades frente a prioridad) y el foco visual del encabezado para que no parezca un campo de formulario; estos últimos ajustes se validan con TypeScript/build antes de actualizar la vista local.

Segundo proyecto: tutorial → Conóceme usa directamente hero → formato cuadrado → tres propuestas sin fotos → diseño `510b157f-22ee-4fd7-b51c-ce07ee2ff529`. Título editado en lienzo a «Tu siguiente paso, con claridad · QA» y guardado confirmado en interfaz. Se recarga para continuar comprobación de guion/perfil/calendario y regreso. La pieza QA no contiene datos del restaurante previo. Corrección de etiquetas/foco guardada en `52c11af`.

Revisión pendiente de protección al navegar: la comprobación de Atrás realizada hasta ahora es con cambios guardados. El hook compartido de navegación protege enlaces y cierre, pero requiere comprobar específicamente popstate con cambios sin guardar; no se acredita protección de ese caso por la prueba de retorno limpio.

## Protección de navegación y esencia/pilares — addendum 22 octubre

El ajuste solicitado sobre esencia y pilares se suma al alcance anterior: sensaciones deseadas, diferencia confirmada, voz, límites y hasta cinco temas por rubro. Una pregunta por pantalla; selección múltiple, texto propio y omisión. La diferencia se reutiliza desde `proposal.value`, sin otra copia comercial editable. Los pilares separan el tema del momento de venta y no se infieren como testimonios, cualidades demostradas ni hechos comerciales.

Studio incorpora el paso de pilar cuando existe una elección guardada; se puede crear sin elegirlo. Las propuestas conservan una instantánea privada de identidad, pilar y revisión; voz Educativa/Divertida orienta el orden de composiciones, sin cambiar ni inventar el texto confirmado. Perfil/lista/calendario pueden filtrar por el pilar de la pieza. Acceso explícito desde Studio para editar pilares existentes. La interpretación de audio y la generación textual de Gemini siguen siendo acciones explícitas; no se acredita su funcionamiento por añadir estas preguntas.

Protección de navegación: se sustituye BrowserRouter por el enrutador de datos de la misma versión instalada, conservando rutas existentes y un único bloqueo compartido. La prueba real anterior al último ajuste confirmó: guion pendiente → Atrás del navegador → panel «Tu trabajo sigue aquí» → Escape → reabrir guion conserva texto. Evidencia `proteccion-atras-guion.png`. Ahora también se evita repetir el aviso cuando una acción manual ya fue autorizada. Se conserva aviso nativo al cerrar/recargar con trabajo pendiente. Falta repetir otros recorridos y validar transición con cambios en varios documentos.

237 pruebas aprobadas, TypeScript/build. Pruebas nuevas cubren identidad por proyecto, diferencia canónica, límite de pilares sin descartar un sexto silenciosamente, instantáneas inmutables, filtro sin duplicar piezas ni alterar fechas y bloqueo de cambios de ruta/proyecto. No constituye aprobación visual ni cierre del objetivo. El guion QA de la pieza `510b157f-22ee-4fd7-b51c-ce07ee2ff529` se volvió a escribir y guardó explícitamente; el ensayo/calendario continúan pendientes.

Corrección de precisión: Servicios conserva un adaptador interno de tienda para almacenamiento compatible. Su presentación es la ruta Servicios y su landing reutiliza las ofertas seleccionadas de la propuesta; no se afirma que ese almacenamiento equivalga a un módulo nuevo de servicios. No se alteran documentos históricos ni se publican negocios reales.

### 22 octubre — radar de inspiración y continuidad (ampliación, no cierre)

Se añadió el radar opcional a la guía y un acceso posterior desde la identidad de Studio. Cada referencia conserva nombre/@/enlace, gustos múltiples, notas, adaptación propia y capturas privadas opcionales. Una pregunta visible por momento; guardar cada paso, recuperar y editar varias referencias. Adjuntar no analiza perfiles ni consume IA. Las piezas guardan notas de referencia como contexto privado separado, nunca como copy público ni como fotografías copiadas. Compatibilidad mediante campo opcional del diagnóstico, sin SQL ni migración masiva.

QA real en `c902defd-93f6-4542-bd79-24545e231315` (Servicios, adaptador compatible ecommerce): referencia ficticia `@referencia-qa`, Fotografías + Forma de escribir, adaptación propia. Guardado, recarga en el segundo paso, recuperación de ambas selecciones y nota, finalización y regreso a Studio comprobados. A 360 CSS px: scrollWidth 360 y un único h1. Captura `referencias-multiseleccion-360.png`. Subida de capturas de referencia todavía no comprobada en esta ampliación; iPhone físico pendiente.

También se comprobó diseño `57aefb2a-dd04-40bb-8c78-a82c98a90547` → Crear video/guion → Studio/mi perfil con misma pieza y pilar «Proceso y método», sin falso aviso de salida tras guardar. Protección de Atrás con guion pendiente conserva cambios al cancelar (evidencia `proteccion-atras-guion.png`). Pilares confirmados visibles en `studio-pilares-confirmados.png`.

TypeScript, build y 238 pruebas correctos en snapshot Node20; fuentes canónicas en frontend. Corrección adicional de foco del título y etiqueta explícita «Guardar y volver a Studio» se validan en la misma versión antes de entrega. Estas comprobaciones no cierran las rutas operativas, widgets restantes, proveedor real, aislamiento con segunda cuenta, prueba física Safari ni aprobación visual. No se modificó el proyecto del usuario 87b198a9… ni se publicaron negocios reales.

### 22 octubre — referencia NotebookLM y preguntas frecuentes

Se investigó documentación oficial de Google sobre fuentes seleccionadas, citas, artefactos y control de generación, y documentación de Gemini sobre JSON/caché. Propuesta de adaptación y límites registrada en FOR_U_NOTEBOOKLM_REFERENCE.md y requisito AI-NB01: una entrada contextual, fuentes autorizadas elegidas, procedencia y aceptación separadas. Investigación no equivale a integración ni prueba real de proveedor; identidad/referencias siguen pendientes como fuentes seleccionables de IA.

Hallazgo reparado localmente: toolkit-ai rechazaba perfiles v2 al preparar guiones/textos. creativePieceSource ahora acepta v1/v2 del proyecto autorizado y selecciona solo una pieza y campos limitados; rechaza versiones desconocidas, proyecto ajeno y pieza ausente. Pruebas del handler y helper correctas. Backend no desplegado en esta revisión; no se acredita respuesta real Gemini.

FAQ: se sustituye la caja de formato manual por editor contextual pregunta → respuesta → lista. Se conserva formato de almacenamiento; preguntas incompletas no se publican ni convierten una respuesta huérfana en pregunta. Pruebas de secciones correctas; recorrido visible y guardado se documentarán después de comprobarlos.

FAQ comprobada en restaurante QA `aa420f8a-2267-4fbf-b1bb-e756278fd352`, sección `b196865e-1239-4404-9624-1642af0c3020`: añadir pregunta → recuperar pendiente tras recarga → editar pregunta → escribir respuesta → cerrar panel → Borrador guardado → abrir desplegable muestra respuesta íntegra. Se detectó durante la prueba una pérdida de espacios al normalizar en cada tecla; corregida conservando texto en edición y normalizando únicamente para render público. Prueba de regresión incluida y repetición real de escritura conserva espacios. Evidencia `faq-configurada-desplegable.png`. No se pulsó Publicar. Esto acredita ese widget, no el conjunto de pedidos/reservas de todos los rubros.

Validación del checkpoint: 241 pruebas aprobadas, TypeScript y build correctos en Node20. Backend de compatibilidad probado localmente; despliegue y proveedor real pendientes. Mantener objetivo general activo y aprobación visual separada.

### 23 octubre — continuidad del alcance, fuentes y reparación visual compartida (en curso)

Se conserva el objetivo completo: siete ajustes y alcance previo de rutas, mapa/Kanban/calendario/mundo, esencia, pilares/referencias, IA por fuentes, página y operación, campañas, cuadrícula y video. El usuario pide avances visibles en pantalla; no atribuir aprobación visual a las pruebas técnicas. La protesta y las cinco capturas del 23 de octubre se consideran defectos pendientes de navegación/jerarquía, no meras preferencias de color.

Implementación local acumulada: contexto adicional de IA optativo por identidad, pilares y notas de referencia, revisiones exactas y procedencia privada; rechazo de contexto cambiado antes de aplicar. Backend probado localmente, todavía no desplegado ni acreditado con Gemini real. La procedencia identifica documentos usados; no simula citas por afirmación. Presentación de página v4 con composición tipográfica sin fotos, secciones contextuales y lectura compatible con v1–v3; cambio explícito solo en borrador QA restaurante aa420f8a. Se reparó lector Studio que inicialmente rechazaba v4. No se publicó.

Cuadrícula: captura de una idea mediante un único título, misma pieza para diseño/portada vertical/guion; guardado antes de abrir y conservación de UUID. En QA Servicios c902defd se inicia prueba real con «Una idea pequeña, un avance real · QA». No se acredita aún el recorrido grabación/exportación ni Safari físico.

Correcciones a las capturas: biblioteca abre subida directa y miniaturas; desaparecen los botones de paginación cuando no hay páginas, el selector nativo visible y el botón de actualizar permanente. La foto subida se selecciona al finalizar; el cambio sigue siendo privado y guardable. Las tareas abren un solo paso con acción principal nombrada, sin repetir lista ni mostrar todos sus ajustes; opciones y eliminación permanecen disponibles bajo «Opciones de este paso». Se reduce resumen de progreso, se evita duplicación de título de área y se oculta Guardar cuando no hay cambios. Aviso de borrador local usa texto comprensible sin alarma amarilla. Navegación de espacios se recoge bajo «Trabajar en…» manteniendo visibles las cuatro vistas del proyecto.

Verificación actual: 250 pruebas aprobadas, TypeScript y build correctos en snapshot Node20. Esto no cierra la entrega. Se verificó que la raíz servida nueva es index-ce39ee52 y se cargó expresamente en pestaña QA propia; la pestaña antigua podía conservar módulos previos hasta recarga. Biblioteca visible comprobada, captura biblioteca-contextual-desktop.png. Pendientes inmediatos: recorrido real de idea/portada, tarea simplificada, medidas móviles y capturas; siguen pendientes matriz global, otros widgets/rubros, proveedor remoto, dos cuentas y aprobación visual.

### 23 octubre — corrección del enfoque de tarea, tras rechazo de la captura

El usuario aclara que pide mejorar la experiencia, no detener todo el trabajo. No aprueba la captura del panel de tarea: reducir controles no le permite comprender qué hacer. Se cambia la interacción principal: una tarea con herramienta abre directamente su trabajo desde mapa/Kanban/calendario y lista del área; tareas manuales siguen abriendo su detalle. Organizar/renombrar/dividir/eliminar permanece en opciones, sin quitar funciones ni marcar tareas automáticamente.

«Crear mi primer contenido» abre una pregunta única con tres intenciones y muestras: Que me conozcan, Conversar con mis clientes y Mostrar mi oferta. Reutiliza fuentes confirmadas para preparar composiciones por reglas, sin IA. Si existen varias ofertas, pide elegir una; si falta información, pide una idea. No fuerza seleccionar formato/pilar antes de mostrar resultados; los demás recorridos conservan los pilares y controles avanzados. Hay acceso manual a todas las opciones. El destino recordado conserva la entrada y tarea. Sin publicación ni cambio comercial real.

25 pruebas focalizadas correctas (incluyen lanzamiento directo sin completar tareas, destino recuperable y fuentes/revisiones conservadas sin fotos), TypeScript y build correctos. Validación visible en curso: mapa QA Servicios → tarea navega directamente a /creator-studio con start=first-content, sin modal intermedio. No se acredita aún satisfacción visual, ni cierre del objetivo completo.

QA adicional: idea 9ad56365-a6b7-4acb-9498-d95612b4c381 creada por titulo en Servicios, guardada antes de abrir, transformada en portada 9:16 y guion, ida/vuelta al teleprompter sin perder referencia. Canvas recuperado 360x640 en vista de escritorio. Grabacion fisica no comprobada.

Recorrido nuevo verificado en pestaña QA propia: mapa de Servicios → Crear mi primer contenido → pregunta única con tres opciones visuales, sin modal intermedio. A 360 CSS px (innerWidth 360, scrollWidth 360, alto 800) se ven las tres opciones; accesos flotantes compactos no cubren las tarjetas. Elegir «Que me conozcan» muestra tres composiciones con la fuente guardada y acción Editar esta propuesta. Evidencia primer-contenido-pregunta-360.png. La captura anterior tarea-un-paso-360.png fue rechazada por el usuario: conservar solo como historia del intento, nunca como aprobación. La nueva experiencia todavía requiere revisión del usuario; resto del objetivo sigue abierto.

Cierre parcial de esta corrección: elegir composición → guardado real → editor de diseño 1372112a-48e2-417c-8aa9-08010332c846 en QA Servicios. Retorno específico «Elegir contenido» vuelve a la pregunta inicial conservando proyecto y tarea; compatible con volver a landing/perfil en sus otros recorridos. TypeScript y build finales correctos; tres regresiones del nuevo flujo correctas. No se acredita grabación, proveedor real ni aprobación del usuario. Se mantiene el alcance completo.

### 23 octubre — composiciones por sección y continuidad desde la landing (en curso)

Se agregan composiciones v4 de pasos/proceso/temario, elementos incluidos/comodidades/materiales y testimonios escritos por el propietario. Conservan el texto histórico en body; no se crea otro documento, no se inventan datos ni se cambia la presentación de publicaciones v1-v3. Edición contextual de un elemento por vez, con límite agregado visible y misma recuperación/guardado del borrador. Se agregan Ubicación/contacto y Testimonios al selector de secciones. Hotel: la sección nueva Servicios se distingue del catálogo de habitaciones; los kinds explícitos históricos no se migran al leer.

Continuidad: el tutorial de landing abre la misma pregunta visual de primeros contenidos en lugar de repetir otra selección de intención. Se conserva la sección elegida como fuente; si ya no tiene contenido no se sustituye silenciosamente por portada. El resultado mantiene origen de landing para regresar a la sección. No hay llamadas a IA al seleccionar o componer.

Validación local: 15 pruebas focalizadas correctas de secciones/catálogos/origen y primer contenido; TypeScript/build finales correctos. Verificación real en restaurante QA aa420f8a en curso; no se ha publicado.

QA real: restaurante aa420f8a → + Sección abre directamente miniaturas → Pedidos y entregas → una pregunta por paso → tres textos QA → cerrar → Borrador guardado → recarga conserva los tres. Sección nueva 88571f81-43b8-4646-9817-7d49c59c8c77. Evidencia editor-pasos-recarga-360.png, viewport CSS 360x800 sin desbordamiento lateral. Cabecera móvil única; vista/undo/redo disponibles bajo menú y retorno directo al mapa. Accesos flotantes compactos con espacio reservado. El texto QA aclara que no se envía un pedido real; esta composición no reemplaza ni acredita el checkout operativo.

254 pruebas completas aprobadas; TypeScript y build finales correctos después de la corrección visual. Matriz de requisitos conserva todas las filas; se corrige la nota antigua «Requiere su objetivo», porque el acuerdo vigente ya autoriza el alcance completo. No se exige copiar nuevos objetivos para pendientes incluidos. Proveedor real, operaciones restantes y aprobación visual siguen sin cerrar.

Sección → contenido comprobado realmente: 88571f81-43b8-4646-9817-7d49c59c8c77 → intención Conversar → composiciones con sus tres textos → diseño 61305dbe-b37b-47de-b7ae-a914c717e99a guardado → Volver a mi página regresa a la misma sección, proyecto y viewport. No se pulsa Publicar. Capturas adicionales editor-pasos-desktop.png (1440x900 CSS, scrollWidth1440) y editor-pasos-tablet.png (768x826 CSS, scrollWidth768). La prueba móvil anterior es 360x800 CSS. Emulación no sustituye iPhone físico. Se devuelve el viewport a tamaño habitual.


### 23 octubre — corrección de la pantalla rechazada
La captura anterior no se considera aprobación visual. Inicio prioriza elegir proyecto: tres tarjetas iniciales con una sola acción cada una, sin duplicar Crear contenido ni Nuevo proyecto; prioridades de Hoy recogidas. Marketing presenta un paso pendiente con una acción directa; lista completa, ajustes, nuevas tareas y herramientas se consultan bajo demanda. No se modifican estados ni finalizaciones. Verificado enlace QA Marketing → pregunta inicial de contenido manteniendo proyecto y tarea. TypeScript, build y 20 pruebas existentes de referencias/tareas/persistencia correctos. Aceptación visual pendiente de la usuaria; no cierra el objetivo completo.
Actualización toolkit-ai: interfaz remota confirma despliegue con fecha «a few seconds ago» tras confirmar; todavía no equivale a prueba real de Gemini.


### 23 octubre — planificación contextual y prueba remota de fuentes
Se desplegó toolkit-ai actualizado con selección de contexto, autenticación de sesión y propiedad de proyecto. Solicitud única real desde pieza QA Servicios 9ad56365 con pilar Proceso y método y referencia ficticia seleccionados: respuesta «Falta configurar Gemini en el servidor». No hubo resultado de proveedor, ni aceptación, ni modificación de pieza. Despliegue acreditado no implica Gemini funcional. Se solicita comprobar el nombre GEMINI_API_KEY sin compartir su valor.
Se elimina el desplegable redundante al abrir Ayuda IA y se presentan fuentes como tarjetas seleccionables accesibles. Planificar abre directamente la fecha, sin obligar a recorrer colores/formato. Hoy/Mañana/posponer/fecha manual conservan la misma pieza; fecha real QA 2026-10-24 guardada y observada en calendario del proyecto. Se comprueba enlace por UUID a pieza original; se corrige el destino de calendario para abrir Studio integrado, no la ruta antigua. Cabecera general de Studio se recoge mientras se edita una pieza.
Calendario: se retira formulario permanente de tres campos y se ofrece Añadir una actividad con título → día → hora. Al fallar guarda mantiene la edición y reutiliza ID durante reintentos, sin duplicar actividades. Ajustes de exportación y recordatorios bajo demanda. Validación visual final de este cambio en curso; requisitos completos y aprobación del usuario siguen abiertos.

Verificación posterior: actividad «Ensayo de contenido · actividad QA» creada con una pregunta por pantalla, Atrás conserva título, fecha 2026-10-24 y 10:00. Guardado real recuperado desde una pestaña nueva (sin estado local), una sola actividad, sin marcar Hecho. Pieza 9ad56365 también visible el día24 y enlace nuevo abre /creator-studio con el mismo UUID. Se conserva script/diseño. Se añade prueba de regresión de reintento con ID estable y conservación de metadatos; seis pruebas focalizadas de reintento/navegación aprobadas, TypeScript y build correctos. La usuaria confirma que en Secrets ve GEMINI_MODEL; se explica que falta GEMINI_API_KEY y se guía la copia privada desde AI Studio, sin pedir el valor por chat.


23 octubre — Gemini real comprobado después de que la usuaria guardara GEMINI_API_KEY: una solicitud Proponer texto desde pieza QA Servicios 9ad56365 obtuvo contenido estructurado aceptado por el cliente. Fuentes verificadas: pieza guardada revisión 2026-10-23T18:26:33.567242+00:00, diagnóstico revisión 2026-10-23T19:30:13.833917+00:00; identidad desmarcada, pilar Proceso y método, una referencia ficticia elegida. No se enviaron perfiles externos ni se visitaron referencias. Se acepta en borrador QA, guarda, recarga y recupera tanto texto como procedencia. No hubo llamada al abrir, recargar ni consultar procedencia. Evidencia gemini-real-fuentes-qa.png. Esto prueba contenido contextual con Gemini real; no acredita todavía todas las operaciones, transcripción/audio o aislamiento con segunda cuenta.


### 23 octubre — catálogo de restaurante dentro de la landing
Se elimina el desvío a otro editor al tocar un producto nativo. Ajustes contextuales de nombre/precio/descripción/foto y opciones avanzadas por una decisión. Alta desde + Añadir producto: nombre → precio confirmado; foto opcional, precio inicialmente vacío (no se convierte en cero). SaveDish y catálogo original conservan UUID, variantes, extras, inventario y recetas. Para páginas que seleccionan ofertas mediante propuesta se añade solo la referencia nativeIds; servicios y paquetes no se sustituyen ni se copian precios. Reintento con el mismo UUID y errores parciales explícitos, comprobación de revisiones de catálogo/propuesta. Historia de la página sincroniza fuentes confirmadas en pasado/presente/futuro: Deshacer no revierte precios del catálogo.
QA real aa420f8a: café de prueba pasa de S/6 a S/6.50, vuelve a la misma sección y recupera el precio tras recarga. Se añade Alfajor de prueba QA · no comercial a S/3.50 desde la landing sin foto; ambos productos y el resto de secciones se conservan, Borrador guardado. No se pulsa Publicar. Pruebas nuevas cubren referencia mixta, preservación privada/opciones, reintento sin duplicados e historial sin precios antiguos. Falta extensión de esta interacción a todos los catálogos; no declarar editor completo de todos los rubros.
Ajustes adicionales: los accesos antiguos /dashboard/tools/profile redirigen a Studio integrado manteniendo proyecto y pieza. Inicio prioriza proyecto activo y recientes; no elimina proyectos. Exportación ICS incluye también piezas planificadas con UID de origen propio y fecha de todo el día, sin inventar hora ni duplicar tareas. 258 pruebas completas correctas antes de últimos cambios solo de alias/título; TypeScript y build final correctos. Verificación responsive y checkpoint Git en curso.

Comprobación responsive posterior del producto contextual: ancho CSS360, alto800, scrollWidth360 y un único campo en el diálogo; evidencia producto-en-landing-360.png. Menú con ambos productos recuperado tras recarga; ancho768/900 y1440/900 sin desbordamiento lateral (capturas menu-contextual-tablet.png y menu-contextual-desktop.png; tablet conserva posición de scroll y no representa vista completa). Se restaura tamaño habitual. Se mejora separación precio/acción Editar sin repetir nombre comercial en cada botón; aria-label conserva el nombre para teclado/lectores. Build final servido /tmp/foru-o23-delivery-dist en4175, compilación correcta. Dominio público no actualizado. Checkpoint Git de estos cambios todavía pendiente; no se solicita un permiso nuevo mientras la usuaria está ausente.

Pendientes conservados después de este avance: extensión de catálogos contextuales al resto de rubros; formularios antiguos de operación; selección exacta de oferta al pasar de landing a primeras composiciones (hoy se conserva sección, pero aún no el filtro explícito de una oferta seleccionada); retorno visible al punto editado, no solo ruta; revisión completa de la matriz y aprobación visual; Safari físico/cámara/audio y segunda cuenta. Acceso antiguo de perfil comprobado en UI: /dashboard/tools/profile con c902defd y9ad56365 normaliza a /creator-studio?tab=profile conservando ambos IDs y recuperando la portada/guion. La verificación no mezcla el menú del restaurante. No se introducen permisos nuevos mientras la usuaria está ausente.


### 23 octubre — oferta exacta al crear y regresar
Se amplía el origen de contenido con sección, oferta confirmada, revisión de página y viewport. Las tres intenciones iniciales respetan la oferta elegida; una oferta eliminada no se sustituye silenciosamente por otra ni por portada. Se eliminan copias de catálogo de la selección de fuentes. Antes de guardar una composición se comprueba revisión de página, sección y pertenencia de la oferta al catálogo/propuesta. Orígenes históricos sin estos campos siguen siendo legibles. El indicador de fuente también avisa si cambió la página de una pieza nacida del catálogo.
QA real restaurante aa420f8a: seleccionar Alfajor 2999a098-e6e0-4b99-bd22-7a9eef6b153d → Crear contenido → Mostrar mi oferta → tres composiciones del alfajor S/3.50, sin preguntar nuevamente qué producto. Diseño 482e5b63-bbb1-49c5-89fe-d1689d5d18c9 guardado y recuperado tras recarga; abrir pieza/guion mantiene el mismo UUID y Volver a mi página retorna a route-section-0 con el alfajor visible y enfocado. No se llama a IA ni se pulsa Publicar. Detectado durante QA que el foco reenviaba selección genérica de sección; corrección posterior conserva el ID de oferta al enfocar una tarjeta, validado contra el catálogo del proyecto.
262 pruebas completas aprobadas antes del pequeño ajuste de foco; TypeScript/build actualizados y nueva comprobación visual del foco en curso. Casos nuevos: oferta exacta por intención, origen persistente, revisión obsoleta sin escrituras, sección inexistente y oferta ajena rechazadas, referencias nativas/propuesta válidas. Aprobación visual de la usuaria y resto del objetivo siguen pendientes. No se piden nuevos permisos mientras está ausente.

Verificación final del ajuste: recarga de landing QA con offer=restaurant:2999a098-e6e0-4b99-bd22-7a9eef6b153d conserva nombre en barra contextual, foco visible en Editar del alfajor y sección Menú. Captura retorno-oferta-exacta.png. TypeScript y build final correctos, servido en4175. Aprobación visual pendiente.


### 23 octubre — correcciones pedidas en capturas de Kanban, contenido e inicio
Se retira el selector de estado de cada tarjeta del Kanban compartido. TaskBoard usa arrastre HTML con destino resaltado, validación de proyecto/tarea y tarjetas del mismo documento de áreas. Alternativa táctil/teclado: Mover y dos destinos posibles, Escape cancela. Actualiza mediante updateTaskState existente y guarda por el controlador con revisión; los errores conservan cambios. No usa el Kanban histórico de nodos como una segunda fuente. QA Servicios c902: mover Crear mi primer contenido a En curso con botón → guardado; devolver arrastrando físicamente a Por hacer → guardado → recarga conserva dos tareas Por hacer. No se completa ninguna tarea ni se conceden recompensas. Evidencia kanban-sin-desplegables.png.
La ruta antigua /dashboard/tools/content ya no muestra tema, formato, tono y resultado juntos. Idea → formato → voz → resultado; elección por tarjetas, Continuar guarda el paso, fuente anterior compatible, red fallida conserva la edición, IA explícita secundaria. Se mantiene guardar/copiar/descargar/teleprompter. QA real: elegir oferta → Continuar → recarga recupera formato → Continuar → Ver mi borrador con plantilla → guardar → recarga recupera texto y paso4; no se llamó a Gemini. Evidencia contenido-una-decision.png. Se elimina cabecera duplicada «Contenido con IA»: la entrada usa plantillas por defecto y no atribuye a IA lo que no lo es.
Se sustituye la cabecera de inicio (antiguo aside con details que alteraba su altura) por barra propia: logo, Nuevo proyecto y cuenta. Cuenta es un panel superpuesto, cierre exterior/Escape, sin agrandar el encabezado. Se reduce repetición de títulos en inicio. Verificación visual final en curso; no se considera aprobación de experiencia.
Nueva edición contextual de ofertas propias de la propuesta preparada en ProposalOfferEditor, reutiliza OfferComposer pregunta por pregunta y guarda el catálogo único de propuesta, con revisión y UUID estable. Pruebas cubren preservar referencias nativas/otras ofertas/metadatos, reintentos, oferta eliminada/precio inválido/límite30. Su recorrido UI de servicios todavía no se ha verificado completo: no declararlo terminado. Resto de catálogos nativos sigue pendiente.
264 pruebas completas aprobadas con cambios de Kanban/contenido y ofertas; TypeScript y builds posteriores correctos. Cambios de cabecera son posteriores a esa ejecución; revisión visual y móvil continúan. No publicación, cobros, migración ni permisos nuevos.

Verificación posterior de inicio: menú cuenta antes/después mantiene altura64.91 CSSpx en viewport360x800; scrollWidth360. Escape cierra y devuelve foco. Evidencias inicio-menu-superpuesto.png e inicio-cuenta-360.png. Contenido móvil muestra una pregunta, tarjetas y Continuar dentro del viewport (abajo585px en la captura), sin desbordamiento. Se ajusta margen de foco para no recortar el título al avanzar. Se corrige etiqueta Servicios y ofertas mixtas en tarjetas de proyectos cuyo módulo de persistencia es ecommerce; no se cambia el módulo ni los documentos.
Oferta de propuesta comprobada en segundo proyecto QA c902: crear Asesoría de prueba QA · no comercial (IDd602f415-be90-47e9-92a1-d765e18cc4b8), tipo servicio, sin foto, precio Solicitar cotización; guarda desde landing y recupera tras recarga. Se abre edición de la misma oferta y el salto a contenido conserva ID/proyecto/route-section-0 y revisión2026-10-24T03:03:44.797021+00:00. No incluye datos del restaurante QA. El catálogo de los otros rubros nativos aún no se declara completo. Se limita a30 el total de ofertas nativas referenciadas más ofertas propias antes de escribir la propuesta.

### 23 octubre — texto y diseño dejan de ser destinos aislados
La herramienta de texto ofrece Diseñar mi publicación después de guardar/revisar un caption. Crea una portada tipográfica con el título y conserva el texto completo como caption de la pieza, usando saveComposition y el UUID compartido entre diseño/perfil. Reintentos de guardado parcial conservan el mismo ID mientras no cambie el contenido. Sin generación de fotografía ni llamada a IA. Desde sección conserva origen/revisión de landing; sin sección vuelve a Studio. Fuentes de sección distintas remontan la herramienta para no conservar respuestas del documento anterior. Textos de más de10 000 caracteres se conservan en el borrador y se pide reducir antes de escribir diseños/piezas; no se recortan silenciosamente.
QA real c902: borrador textual recuperado → Diseñar mi publicación → diseño956f8684-d86d-4327-99da-9b86ab054ef6 → abrir la pieza con el mismo UUID en perfil → Texto del post muestra texto completo original. Evidencia texto-a-diseno-misma-pieza.png. La prueba accedió a perfil por URL conocida con UUID guardado; no acredita por sí sola toda la navegación de cuadrícula. La portada inicial posterior usa composición poster para enfatizar el título sin simular un espacio de fotografía faltante.
QA contextual de servicio completado: oferta d602f415 → Conversar → tres composiciones con la asesoría y CTA ¿Qué te gustaría saber? → guardar diseñoecb90c91-43d9-45f0-a68d-bbf50dc81e11 → Volver a mi página → misma oferta/route-section-0 visible y enfocada. Evidencia servicio-regreso-a-landing.png. No se mezcló con el catálogo restaurante aa420f8a. Las invitaciones de Conóceme/Conversemos/Mi oferta ahora cambian según intención; se mantiene texto fuente y no se inventan testimonios/beneficios/precios.
266 pruebas completas correctas antes del límite adicional de texto y ajuste de layout de portada; pruebas focalizadas posteriores de esos contratos y TypeScript/build en revisión final. Aprobación visual pendiente; no se considera optimizada toda la aplicación. La usuaria pidió nuevamente acumular consultas hasta avisar que volvió.

Revisión final de esta tanda: TypeScript y build /tmp/foru-o23-text-design-poster-dist correctos, servido en4175. Prueba focalizada de portada/límite10 000 y origen ajeno correcta después de los últimos ajustes. Inicio final recupera etiqueta Servicios y ofertas mixtas y menú superpuesto (inicio-cuenta-final.png); Escape cierra. La pestaña QA se deja en inicio sin menú abierto. La aprobación visual sigue pendiente, también Safari físico/segunda cuenta/operación y catálogo del resto de rubros. No se ejecutó ninguna nueva migración ni se pidió intervención mientras la usuaria se duerme. Checkpoint Git sigue pendiente, no se afirma un commit nuevo.


### 24 octubre — pedidos preparados sin otro formulario
La entrada Pedidos y entregas del editor conserva proyecto, sección y viewport; Volver a mi página devuelve al menú. Atrás/Adelante del navegador recupera los destinos; la landing vuelve a mostrar los dos productos QA. RestaurantOrderSetup sustituye la configuración extensa por modalidades múltiples → mesas/zonas → nombre → tarifa → activación explícita → revisión. No se convierte una tarifa vacía en gratuita; cero requiere escribirlo. Se mantienen UUID, límites del servidor y configuración de destinos aunque una modalidad se retire. Conflictos y reintentos siguen usando el RPC con revisión existente.
QA remoto aa420f8a: Recojo y Delivery guardados, Zona QA · no comercial S/2.50; enabled=false antes y después. Recarga recupera modalidades y tarifa. No se activaron pedidos, publicó un negocio ni aplicó SQL. Pantallas medidas en360x800,768x900,1440x900: scrollWidth coincide con innerWidth. Evidencias pedidos-modalidades-final-360.png, -768.png, -1440.png; el título corto Pedidos y Cerrar evitan el salto de cabecera en móvil.

Brecha confirmada por inspección: PublicSite utiliza CommerceCheckout/toolkit_sites, mientras RestaurantCheckout y sus RPC de modalidades/tarifas utilizan module_sites. La configuración real del menú operativo NO demuestra que la landing general use ese mismo canal. OP01/R01 permanecen en curso. Horarios todavía no se validan en el servidor de pedidos: OP02 no se cierra. La unificación exige contrato de publicación y pruebas aisladas antes de cualquier cambio remoto; no se aplicaron migraciones durante la ausencia.

### 24 octubre — cliente del menú operativo, una pregunta por momento
RestaurantCheckout conserva el intento durable, secreto privado, cotización de servidor, recuperación y confirmación existentes. Solo se sustituye la superficie de entrada por tarjetas y pasos: modalidad → mesa, o zona y dirección cuando corresponda → nombre → teléfono → nota opcional → resumen y Confirmar pedido. Elegir una tarjeta no avanza automáticamente. Atrás mantiene las respuestas; cambiar modalidad retira el destino anterior. Se rechazan zona/mesa ajenas o retiradas, dirección de menos de5 caracteres y teléfono fuera del contrato antes de continuar. Una cotización que responde tarde después de cambiar carrito/destino se descarta, en lugar de habilitar un total antiguo.
Prueba visual aislada LOCAL (sin RPC ni pedidos): delivery llega al resumen S/6.50 + S/2.50, Atrás conserva dirección y zona; teléfono123 no avanza; nota vacía sí. Mesa pregunta la mesa y salta directamente al nombre. Esto prueba interacción del componente, NO publicación, cobro ni recorrido remoto completo. Evidencia checkout-modalidades-qa-final-360.png; checkout-revision-qa-360.png es captura inicial anterior al ajuste final de botón y no sirve como aprobación visual final.
270 pruebas completas y TypeScript correctos tras introducir el recorrido; después se ajusta dirección al mínimo5 del contrato SQL y se repiten pruebas focalizadas, TypeScript/build. Sin prueba física Safari ni segunda cuenta. No hay aprobación visual de la usuaria; objetivo general activo. Cambios posteriores a418a44b continúan sin checkpoint nuevo.

24 octubre — ampliación directa de la usuaria registrada como entrega final: página tipoLinktree personalizable y hasta tres borradores de promociones con enlaces propios, edición y publicación separada; EXT-L01..03. No implementado aún ni usado como motivo para omitir requisitos anteriores. Build final de checkout20.45s y seis pruebas focalizadas posteriores al mínimo de dirección correctos; servido en4175.


### 24 octubre — contacto estructurado y recuperación del entorno
Se añade metadata contact versión1 en cada bloque de ubicación: dirección pública, horario informativo, enlace HTTPS y nota histórica. Edición contextual por una pregunta; Aplicar confirma el dato y vuelve al selector, Cancelar distingue cambios locales. Cerrar con cambios sin aplicar exige descartarlos explícitamente; también quedan bajo la protección de navegación. El texto body es una proyección compatible para fuentes/plantillas, no una segunda copia editable. El texto histórico se conserva como nota al editar; sobrepasar2000 caracteres rechaza el cambio sin recortar lo anterior. Renombrar el bloque conserva su tipo location. Una edición directa heredada de body retira metadata estructurada para no presentar dirección/horarios obsoletos.
La composición presenta dirección y horario en tarjetas y enlaces de ubicación/WhatsApp solo si existen datos válidos. No se carga iframe de mapas ni recursos externos por visitar la sección. Dentro del editor, tocar esos enlaces abre el panel, sin navegar fuera. Parseo público toma exclusivamente campos conocidos, valida versión/límites/HTTPS sin credenciales y conserva versiones anteriores sin convertirlas automáticamente. Un borrador con contacto mal formado se deriva a recuperación en lugar de montarse o sustituirse por vacío. Los horarios son informativos: no validan disponibilidad, reservas ni pedidos.

Después de la interrupción desaparecieron los directorios temporales y servidores del entorno anterior. Fuente canónica conservada. Dependencias de ejecución recuperadas desde caché npm sin red mediante npm ci --offline --ignore-scripts en /tmp/foru-current-source; no cambia versiones ni lockfile de la aplicación. Se restablece Vite4 en4175 desde esta copia; el sistema requirió autorización para escuchar el puerto local. No se modifica Supabase ni se vuelve a guardar ninguna clave. El control del navegador rechazó observar la pestaña que quedó en página de error; no se intentó eludirlo por otro navegador/tecnología. Validación de contacto en navegador, guardado remoto y recarga siguen pendientes hasta que la usuaria reabra la vista; no hay nueva captura de aceptación.

Validación actual:275 pruebas completas correctas (incluida composición HTML sin iframe ni afirmaciones inventadas), TypeScript correcto y build /tmp/foru-contact-current-dist correcto16.37s. Ejecutado con Node24 disponible en este nuevo entorno, no acredita una nueva repetición en18/20; package engines conserva >=18 y Vite4/Tailwind3 sin actualización. La antigua ejecución falló por exportaciones interpretadas como CommonJS; package.json privado type:module delimita toolkit-ai como ESM, sin cambiar lógica ni desplegar la función. El script de pruebas ahora señala tsconfig.app.json para usar el mismo JSX automático que la aplicación; pruebas SSR no dependen de una variable React global. Las275 pasan después de ambos ajustes. Repetición en Node18/20, Safari físico, dos cuentas y aprobación visual permanecen pendientes. Objetivo completo activo; Linktree y las tres promociones se mantienen como ampliación final, no implementados en esta tanda. Sin checkpoint Git nuevo.


### 24 octubre — ofertas existentes de los cuatro catálogos nativos dentro de la landing
NativeCatalogOfferEditor abre al tocar una oferta nativa de tienda, hospedaje, turismo o cursos, sin salir del editor. Nombre, precio, descripción/amenidades e imagen se editan una decisión por momento; los detalles propios se recogen en una opción secundaria. Usa los documentos module-ecommerce/module-hospitality/module-tourism/module-courses originales y sus funciones saveProduct/saveRoom/saveTour/saveCourse, no una copia comercial nueva. Se mantiene el mismo ID, revisión CAS, guardia de cambios y bloqueo de doble guardado. Revisión cambiada/ID eliminado/documento incompatible conserva la edición y no sobrescribe. Al guardar sincroniza el catálogo en pasado/presente/futuro de la landing para que deshacer no revierta precios, conserva sección/oferta y usa el foco de regreso existente. Borrador y publicación permanecen separados.
El helper admite exclusivamente los campos del rubro: no permite cambiar IDs, documentos privados o ajustes por rutas arbitrarias. Antes de escribir valida además la oferta pública; precio vacío no pasa a cero. Stock debe ser entero. Hospedaje conserva estado de limpieza, reservas y finanzas y bloquea reducir capacidad por debajo de huéspedes ya reservados. Turismo conserva itinerario/coordenadas y aplica la comprobación de cruces de guía al cambiar duración. Cursos conserva módulos/lecciones/materiales/inscripciones/ventas/certificados; no se presenta una portada editada como aula completa.
Tres pruebas nuevas cubren los cuatro rubros con conservación de registros privados, rechazo de IDs/patches/documentos inválidos, capacidad de reserva y cruces reales de horario. TypeScript correcto y build final /tmp/foru-native-inline-final-dist correcto. Prueba completa278 antes de último agrupamiento y validación pública; repetición final en curso al registrar. No hay prueba UI/guardado remoto de estos cuatro nuevos paneles todavía: continúa pendiente que la usuaria reabra la vista tras la restricción del navegador. No se crean ni publican ofertas reales durante esta tanda. Creación de ofertas nativas nuevas y la operación completa de cada rubro todavía requieren integración; los accesos avanzados heredados no se declaran rediseñados. No se cierra E07 ni las rutas por estas pruebas.

Verificación posterior de esta tanda:278/278 pruebas completas correctas tras los últimos cambios, TypeScript correcto y build final11.78s. Runtime de4175 contiene los archivos nuevos. git diff --check sigue en ejecución (sesión21559), sin resultado terminal al registrar; no se reinicia por la espera ni se afirma checkpoint. Revisión de altas nativas, navegador/guardado remoto,18/20 y aprobación visual pendientes.


### 24 octubre — alta de ofertas nativas sin salir de la landing
NativeCatalogOfferCreator amplía la selección existente de tienda/hospedaje/turismo/cursos a crear en su catálogo original, con ID estable durante reintentos: nombre → precio confirmado → stock / capacidad y estado / duración, según rubro → revisión. Una pregunta por pantalla y Continuar; foto y otros detalles pueden venir después. Stock, duración, capacidad y precio empiezan sin valor confirmado, nunca en cero por campo vacío. Habitación exige elegir explícitamente lista/en preparación. Las nuevas configuraciones de hospedaje no inventan horarios de entrada/salida. Cursos nace sin módulos/lecciones y avisa que la oferta no activa aula. Se conserva CAS/guardia, historia del catálogo y borrador separado de publicación. Al guardar la landing recibe el mismo ID y el botón Añadir vuelve a estar disponible en catálogos nativos ya poblados. En páginas de propuesta se conserva el alta de oferta propia de propuesta; no se transforma en producto nativo silenciosamente.

Turismo admite ahora ausencia explícita de mapa con latitude/longitude null; número/número válido sigue compatible con publicaciones anteriores. No se genera enlace a un mapa cuando ambas faltan, ni se acepta una sola coordenada o un rango inválido. Punto de encuentro vacío no genera un rótulo público vacío. La alta heredada de turismo deja también de precargar precio0, duración60 y coordenadas0/0. No se migran ni publican registros históricos; pares numéricos existentes conservan su significado. Snapshot y lector público aceptan el caso sin mapa; esto no crea disponibilidad ni reserva.

Pruebas nuevas: cuatro rutas de creación y reintento sin duplicado, precio/cantidades/estado sin inventar, rechazo de campos privados/capacidad/stock/catálogo mayor30, publicación de experiencia sin mapa y preservación del mapa numérico histórico.282 pruebas completas correctas; build final /tmp/foru-native-create-dist13.40s. TypeScript correcto antes del último ocultamiento de rótulo vacío; revisión final en curso. No guardado remoto ni aprobación visual de altas nuevas: control del navegador sigue sin acceso a la pestaña de error data:. Se conserva la consulta de reapertura humana sin eludirla.

A petición de la usuaria se reabre la referencia INTI CHURIN leyendo sus fuentes actuales. Comparación en DESIGN_SYSTEM_AND_EDITOR.md: el detalle turístico con portada/galería aún no se equipara a INTI. No se modificó ese proyecto ni se copiaron sus datos de negocio. Próxima mejora pendiente de turismo: presentación completa y edición de experiencia/itinerario/galería basada en ese patrón. Crear los registros no sustituye ese requisito.

### 24 octubre — corrección de entrada y decisiones de creación (en curso)

- Checkpoint anterior guardado localmente: `d0e1067` (99 archivos). Sin push, publicación de negocios reales ni cambios a INTI CHURIN.
- Abrir proyecto y cambiar de proyecto ahora apuntan a inicio explícito `view=start`, con pasos numerados derivados de las tareas existentes y una acción principal. Mapa/Kanban/calendario/mundo siguen disponibles. La antigua sección «Mi ruta personalizada» que solo abría respuestas se sustituyó por acceso a la ruta; las respuestas se ajustan aparte.
- Navegar por cada URL ya no reescribe automáticamente el enfoque compartido de la cuenta. Las elecciones explícitas de herramienta/tarea mantienen su guardado. Los conflictos existentes se conservan y se ofrecen en aviso compacto, sin descartar preferencias.
- Mapa: captura una idea en su bandeja privada existente, clasificación explícita con Gemini, revisión y aceptación; se muestran las ideas como ideas en su rama, separadas de las tareas. Se añade conversión explícita a tarea sin recompensas automáticas.
- QA real restaurante `aa420f8a-2267-4fbf-b1bb-e756278fd352`: idea «mostrar cómo se prepara el café… Prueba de navegación, no campaña comercial» guardada; Gemini respondió Marketing; aceptación guardada y nodo observado en esa rama. La recarga posterior requiere aún confirmar la vista tras finalizar carga. No se convirtió en tarea.
- Studio: tema primero con tres barras, texto de la idea, tres intenciones principales y después formatos/composiciones. Ya no hay miniaturas en la primera pregunta ni seis categorías simultáneas como entrada. QA servicios: Atrás conservó dos párrafos; Conversar abrió formato y luego tres composiciones, sin IA. Guardado de la nueva composición en comprobación.
- Turismo: detalles públicos de duración/itinerario/encuentro proyectados desde catálogo a oferta y landing; editor contextual de paradas con orden accesible. Se excluyen guías/clientes/reservas; lectura compatible con proyecciones históricas sin detalles. No equivale todavía a la galería y presentación completa de INTI.
- 287 pruebas y build correctos en runtime local Node 24; TypeScript correcto antes de los últimos cambios menores, comprobación final en curso. Vite 4/Tailwind 3/lockfile conservados. Node 18/20 y Safari físico aún pendientes.
- Sigue pendiente: taller real de pilares desarrollados, acción contextual FOR U de enfoque comercial simplificada/animada, audio en mapa, rediseño profundo del mapa, validación visual completa y resto de MASTER_SPEC. No se declara entrega cerrada.

- QA Studio confirmada: composición `7d45bc6a-52e0-437e-aa00-ecd3de95eafd` en proyecto de servicios, layout Mensaje protagonista, tema Proceso y método, dos párrafos y CTA de conversación. Recarga conservó ID, título, cuerpo y tema. No publicación ni llamada IA durante composición. La prueba aún no cubre todos los formatos/retornos nuevos.
- Verificación final de este checkpoint: 287/287 pruebas, TypeScript y build correctos en runtime Node 24. La revisión visual y el objetivo global continúan abiertos.

- Corrección visual adicional: se quitó `body min-width:320px`, responsable de recortar la vista lateral real (297 px medidos). Tras el cambio, `scrollWidth === innerWidth` en esa vista. No se etiqueta esta captura como 360 px: el navegador lateral no aplicó ese ancho solicitado. Carita/Pomodoro van tras el contenido en los pasos enfocados para no cubrir acciones. Evidencia: `docs/evidence/2026-10-24/studio-temas-completo.png`. La prueba física y las medidas 360/768/1440 del nuevo flujo siguen pendientes.


### 25 octubre — continuidad de temas, mapa y archivos de la pieza
- Los borradores de ideas se separan por cuenta/proyecto/tema; notas del pilar recuperadas en QA Servicios y reutilizadas sin transcribirlas. Cambiar de tema conserva el borrador anterior.
- El mapa carga el grafo solo en escritorio. Verificado a 360 px reales: sin desbordamiento horizontal ni grafo oculto montado. Marketing abre la idea y los pasos originales del restaurante QA.
- Guardado explícito de video/portada: archivo privado → manifiesto → referencia en la misma pieza, con reintento sin duplicados. Portada PNG QA subida, recuperada desde Biblioteca → Videos y portadas y vinculada a cc0d9f58-379b-4454-a71f-84b42de03c6b; guion y origen conservados.
- 303 pruebas, TypeScript y build correctos. Los cambios finales de MIME/reintento y borradores pasaron sus 7 pruebas focalizadas.
- Pendiente: grabación/exportación en iPhone/Safari, diagnóstico remoto de formatos de video permitidos y aprobación visual. No equiparar estos resultados con cierre del objetivo completo. No se publicó contenido ni se modificó INTI CHURIN. Consultas de intervención reservadas hasta que Nicole vuelva.

### 25 octubre — secciones completas y retorno móvil
- Añadidos catálogos reinsertables de turismo/cursos, compra, comodidades/llegada/condiciones de hospedaje, docente/materiales y proceso de servicios. Composiciones nuevas vacías hasta completar datos reales. Docente no toma automáticamente la historia del negocio; páginas nuevas no fuerzan violeta.
- Añadir una composición actualiza solo el borrador a presentación 4 y admite Deshacer; publicación anterior intacta. Primer catálogo vincula su fuente cuando no hay ofertas manuales que conservar.
- QA Servicios: sección Cómo trabajamos 31678897-801f-467e-a02e-7c82dd80e08d guardada y recuperada; creó pieza 8dd7f7b5-0c39-4abd-b2c4-742556927272 con dos pasos QA, formato 4:5 y origen conservado. Regreso a esa misma sección comprobado. No se publicó.
- Corregido scroll de recuperación: desplaza el documento del iframe sin mover el editor detrás de su barra. Verificado a 360×818 reales, sin desbordamiento horizontal.
- 307 pruebas y TypeScript correctos; build general correcto y recompilación final del ajuste móvil registrada en /tmp/foru-sections-mobile-build.log. Aprobación visual, dispositivos físicos y restantes rubros/operaciones siguen pendientes de completar, no equivalentes a cierre global.

### 26 octubre — idea → portada y regreso al contexto de trabajo
- Las ideas sin diseño se muestran como tarjetas de título, no como diseños terminados. Nuevo recorrido: palabras → intención → formato → composición, conservando la misma pieza; errores parciales de guardado identificados.
- Nueva idea QA Servicios 6c6a8849-1df7-42f0-810a-3c951a65101e, título «Idea QA: una pausa para conversar», convertida en portada 9:16 con el mismo UUID. Arrastre real mediante su agarrador a la primera posición orgánica, guardado y recarga comprobados. No modifica pines ni fechas. Nuevo orden incluye también piezas omitidas de listas históricas parciales.
- Mover dispone de selección visual equivalente con teclado, sin desplegable. Guardar dejó de quedar debajo de la navegación fija; se comprobó el receptor real del clic antes de guardar. Arrastre táctil físico en iPhone sigue sin verificar.
- El contexto de entrada prevalece sobre el origen histórico: Cuadrícula/Lista/Calendario/Biblioteca regresan a su vista. Se conserva por separado el origen de landing. Biblioteca mantiene también Diseños/Fotos/Videos y portadas y campaña. Continuar conserva from/viewport/compose/pin/panel/library sin cambiar proyecto.
- QA 8dd7f7b5-0c39-4abd-b2c4-742556927272: Biblioteca → editor → guion guardado → teleprompter recuperó el texto y el mismo UUID; contexto de regreso Biblioteca conservado. Sin cámara, publicación ni llamadas IA.
- 315 pruebas, TypeScript y build correctos (/tmp/foru-grid-return-*). El objetivo y la revisión visual siguen abiertos; encuadre separado de portada en la grilla, cámara/exportación física, rubros/operación restantes y aprobaciones pendientes aún no se declaran completados.
