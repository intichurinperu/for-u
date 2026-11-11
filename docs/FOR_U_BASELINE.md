# FOR U — Base inspeccionada y discrepancias

Inspección local de solo lectura: 21 de octubre de 2026. HEAD observado: `66d4f12` (pieza visual contextual); anteriores `8527e29`, `a853d0b`. Git estaba limpio antes de crear estos documentos. No se ejecutaron pruebas de aplicación, navegador, SQL ni proveedores en este objetivo: la modificación es documental. Los archivos citados se inspeccionaron; su presencia **no prueba** funcionamiento completo ni despliegue.

## Cómo interpretar la base

- **Reutilizable:** implementación localizada que debe evaluarse/adaptarse, no reescribirse por defecto.
- **Incompleto respecto al destino:** hay base, falta integrar comportamiento o comprobar aceptación actual.
- **Ausente en contrato inspeccionado:** el modelo o registro concreto no expresa la nueva capacidad; no afirma que no exista ningún código parecido en todo el repositorio.
- **Evidencia histórica:** afirmación fechada en registro previo; no repetida ni elevada a comprobación actual.
- **Pendiente de comprobación externa:** condición histórica que debe revalidarse con acceso autorizado. No implica bloqueo de documentación/interfaz independiente.

La matriz mantiene requisitos finales en `pendiente` hasta su propia prueba. Solo los entregables documentales de objetivo 1 pueden cerrarse aquí.

## Inventario de reutilización

| Base | Archivos inspeccionados / evidencia | Hallazgo y límite | Objetivos |
| --- | --- | --- | --- |
| B01 | `frontend/package.json`, `frontend/src/App.tsx` | Vite4.5.3, Tailwind3.4, engine >=18; rutas privadas/públicas y alias existentes. Contrastar versiones, no actualizar dependencias por rediseño. | 1,3,14–16 |
| B02 | `frontend/src/modules/moduleProjects.ts` | `moduleLabels` y `ModuleType` tienen cinco rubros; servicios no es una sexta ruta explícita. No confundir ofertas service/package con ruta especializada. | 3,5–8,13 |
| B03 | `frontend/src/experience/BrandWelcome.tsx`; `frontend/public/brand/foru-logo.png`, `foru-welcome.mp4` | Logo/video existen. Bienvenida usa sessionStorage, salto/sonido/error/reduced-motion. Una sesión de pestaña no equivale necesariamente a «apertura de aplicación»; verificar semántica y alternativa estática. | 2,4,15 |
| B04 | `frontend/src/experience/ProjectJourney.tsx`, `journeyModel.ts` | Wizard rubro/nombre; guía breve oferta/público/objetivo con textarea, cursor y Continuar guardado; preguntas extra. No están expresados diagnóstico adaptativo completo ni preferencias personales. `Journey` v1 restringe keys antiguas: no extenderlas silenciosamente. | 3–6 |
| B05 | `frontend/src/experience/usePrivateDocument.ts`; `frontend/src/services/moduleDocuments.ts`, `revisionDocuments.ts`; `frontend/src/pages/dashboard/areaPersistence.ts` | Claves por cuenta/proyecto/documento; revisión y conflicto/recuperación. Área distingue tarea/mundo, locks y estados. Reutilizar; probar nuevas entidades y cambios tardíos. La protección beforeunload no autoriza confirmaciones nativas como navegación principal. | 3,4,6,15 |
| B06 | `frontend/src/experience/ProjectViews.tsx`, `ProjectCalendar.tsx`; `frontend/src/pages/dashboard/WorkspaceShell.tsx` | Mapa/Kanban/calendario ya existen con tareas compartidas; shell global solo Tablero/Mundo y otros accesos. Tareas iniciales genéricas, sin motivo aceptable de diagnóstico; map facts desde propuesta/guía. No están integrados los cuatro accesos globales según destino. | 3,6,14 |
| B07 | `frontend/src/pages/dashboard/WorkspaceFocus.tsx`, `WorkspaceHome.tsx`; servicios `workspaceFocus*`; pruebas `workspace-focus*`, `today-model` | Base Hoy/Continuar localizada y documentada históricamente; no duplicar preferencias ni IDs de tareas. Revalidar con navegación nueva. | 3,6,14 |
| B08 | `frontend/src/proposal/model.ts`; `frontend/src/proposal/ProposalEditor.tsx` (localizado); `frontend/tests/proposal*.test.mjs` | `OfferKind` admite product/service/package/course/stay/experience; catálogo nativo y ofertas complementarias, preparación selectiva y diferencias reales. Falta contrato de promoción específica y múltiples landings por oferta en esta base. | 6–9 |
| B09 | `frontend/src/toolkit/LandingBuilder.tsx`, `SiteEditorFrame.tsx`, `editorBridge.ts`, `editorSections.ts`, `editorHistory.ts` (selección/servicios inspeccionados); `docs/FOR_U_CREATIVE_EXPERIENCE.md` | Edición/puente e historial tienen base; publicación y controles ya existentes. Historial QA señala texto/CTA/sección/portada/conflicto; arrastre en toda galería/oferta y profesionalización de seis rutas no cerrados. Conservar validación origen/ventana/canal/IDs. | 7,15 |
| B10 | `frontend/src/services/landingPublication.ts`, `modulePublishing.ts`; `frontend/src/presentation/model.ts`; pruebas `catalog-snapshot`, `landing-public-data`, `presentation` | Instantáneas y presentación1/2, versión desconocida rechazada. Restaurante/turismo y landing tienen vías existentes; varias páginas de campaña/oferta requieren contrato adicional. Verificar publicación coherente, anonimato y diferencias por rubro. | 7,8,15,16 |
| B11 | `frontend/src/pages/dashboard/CreatorStudio.tsx` | Entrada todavía Portada/Publicación/Carrusel/Historia y ruta de cuatro pasos; herramientas bajo desplegable. Falta unión Campañas/Crear/Perfil/Biblioteca e intención/oferta primero. | 2,9,10 |
| B12 | `frontend/src/experience/pageComposition.ts`, `designPiece.ts`; `frontend/src/components/shared/contentModel.ts`; pruebas `experience`, `content-creator` | Composición determinista, fuente/revisión, formatos1080×1080/1350/1920 y unión diseño-pieza mismoUUID. ContentDraft tiene carouselId/slide/logoPath/source, no campaña/portada de video como contrato canónico. No descartar composiciones ni exportador existentes. | 8–11 |
| B13 | `frontend/src/social/model.ts`; `frontend/src/social/SocialProfile.tsx`, `PieceWorkspace.tsx` (localizados); `frontend/tests/social.test.mjs` | Perfil main hasta3 y destacados; Piece contiene título/objetivo/texto/guion/tomas/fecha/estado/archivos. No campaignId, video/cover dedicados ni gridOrder completo en contrato inspeccionado. Nueva experiencia visual rechazada en historia, no aprobada. | 3,9–11 |
| B14 | `frontend/src/experience/AudioCapture.tsx`; `MaterialAttachments.tsx`, `OrganizeMaterial.tsx` (localizados); `supabase/functions/toolkit-ai/material.ts` | Grabación hasta90s, solo por clic, formatos detectados, escuchar/descartar/reintentar, HTTPS y permisos; operación material preparada. Falta prueba física iPhone y transcripción real. | 4,12,15 |
| B15 | `frontend/src/toolkit/Toolkit.tsx`, `VideoEditor.tsx`; `Teleprompter.tsx`, `media.ts` (localizados); `frontend/src/modules/courses/CourseRecorder.tsx` | Guion/archivo/subtítulos pasan entre componentes; VideoEditor analiza pausas/exporta mediante servicios. Parte del estado está en memoria de Toolkit. No asumir que video/portada permanecen unidos a pieza tras recarga ni que Safari exporta correctamente. | 11,15 |
| B16 | `frontend/src/experience/ForUCompanion.tsx`, `PersonalInbox.tsx`; `frontend/src/services/accountIdeas.ts` (localizados); `journeyModel.ts`; pruebas `experience`, `supabase/tests/account-ideas.test.mjs` | Base ayuda preparada, bandejas personal/proyecto, categorías y conversión separada. Historial registra migración29; no volverla a aplicar. Revalidar límites10, adjuntos y contexto de pantallas nuevas. | 12,14,15 |
| B17 | `supabase/functions/toolkit-ai/{index,core,creative,material,sharedCache}.ts`; pruebas `ai-efficiency`, `experience`, `ai-creative-server` | auth.getUser, fuente/revisión, JSON schema Gemini, cuota30/h, caché y protección de pago. Errores diferenciados. Modelo por env con valor por defecto histórico: verificar disponibilidad al activar. No se consultaron secretos remotos; respuesta real no demostrada aquí. | 12,15 |
| B18 | `frontend/src/modules/restaurant/model.ts`, `orders.ts`, `orderOptions.ts`; `supabase/migrations/26_restaurant_orders.sql`; pruebas `restaurant-module`, `restaurant-cart`, `supabase/tests/restaurant-orders.test.mjs` | Platos/variantes/extras, ingredientes/unidad/stock, recetas/rendimiento/preparación idempotente y pedidos tienen base. Ingredient no tiene costo y Recipe no tiene dishId; RestaurantData no compras ni libro de costos. No afirmar que calcular preparación ya calcula costo por porción. | 8,13,15 |
| B19 | `frontend/src/modules/{ecommerce,hospitality,tourism,courses}/model.ts` y workspaces/editores localizados; pruebas respectivas | Tienda pedidos/stock; hospedaje reservas/finanzas; turismo salidas/plazas; cursos módulos/lecciones/progreso/certificados. Fuente local no prueba aula pública, matrícula/autorización, pago o reserva remota de cada rubro. | 7,13,15 |
| B20 | `frontend/src/toolkit/Calendar.tsx`, `calendarModel.ts`, `BusinessTools.tsx`, `ConnectionStatus.tsx` (localizados); `supabase/functions/{reservations,integrations}/index.ts`; documentos activación5 | Agenda/tareas enlazadas, métricas/reservas/conexiones tienen base. Historial indica correo y autorizaciones externas pendientes. Nuevo calendario debe integrar piezas por referencia, no copiar texto a otro documento. | 10,13,14–16 |
| B21 | `frontend/src/payments/*` localizados, `supabase/functions/mercado-pago/{core,handler,index}.ts`; `docs/FOR_U_MERCADO_PAGO.md` | Compras/cotizaciones/MercadoPago ya tienen arquitectura y pruebas históricas. No rehacer catálogo/pedidos/pagos. Credenciales/cuentas QA/retornoHTTPS/webhook reales siguen sin evidencia actual. | 8,13–16 |
| B22 | `frontend/src/pages/dashboard/{WorldPage,WorldScene,worldLifecycle,areaModel,areaPersistence}.tsx/.ts` localizados; `frontend/src/contexts/PomodoroContext.tsx`; `docs/FOR_U_WORLD.md`; pruebas `world-persistence`, `experience`, `pomodoro-state` | Reutilizar renderer, alternativa ligera, mascotas, premios/timer. Controlador parcial y tests inspeccionados; QA/FPS históricos no prueban nueva interfaz. Conservar formatos/nodos/desbloqueos. | 6,14,15 |
| B23 | `frontend/src/components/ui/DesignSystem.tsx`, estilos `materialExperience.css`, `experience.css` localizados; package y documentos de diseño | Componentes/tokens/CSS existentes, reglas históricas en varias capas. No migración mecánica global de colores ni nuevas librerías. Auditoría visual/táctil de todas pantallas aún necesaria. | 2,4–15 |
| B24 | `frontend/src/widgets/{model,service,ProjectWidgets,WidgetEditor}.ts/.tsx` localizados; `docs/FOR_U_PLAN.md`; pruebas `project-widgets` | Widgets ya implementados con fuente publicada y permisos según registro. Mantener autorización/revocación/sin ciclos y compra en fuente. Falta segunda cuenta remota actual. | 7,8,14,15 |
| B25 | `supabase/migrations/05_studio_content_assets.sql`; registro 20oct en `FOR_U_CREATIVE_EXPERIENCE.md` | SQL histórico incluye políticas anon/authenticated para escritura/borrado. Registro reporta riesgo heredado en foru-studio-content/creator-media. **No se inspeccionó esquema remoto hoy**: diagnosticar consumidores/permisos y reparar de forma separada y autorizada; no declarar seguridad global. | 3,12,15 |
| B26 | Maqueta `foru-recorrido-integrado.html` en carpeta de visualizaciones de este chat; revisión de la propietaria en conversación | La propietaria la vio «un poco mejor» pero pidió cambios sustanciales de diagnóstico. No aprobada para implementación. Audio/video/pedido/exportación son simulaciones marcadas; no evidencia de app. Objetivo2 debe actualizarla y obtener aprobación explícita. | 2 |

Los IDs B son evidencia de inspección, no niveles de progreso del producto. Los ficheros de pruebas se localizaron/leyeron selectivamente, no se ejecutaron en objetivo1. Los contratos se ampliarán solo tras la aprobación del objetivo2 y las decisiones del objetivo3.

## Discrepancias resueltas o conservadas explícitamente

| ID | Antes/base | Decisión vigente | Destino |
| --- | --- | --- | --- |
| D01 | Muchos documentos se llaman «vigentes», con fechas y órdenes distintos | Esta especificación maestra y ejecución16 objetivos prevalecen; históricos conservados con aviso | O01 |
| D02 | Studio o editor como único inicio; tablero tras primer borrador | Diagnóstico propone ruta, luego mapa; Explorar/manual accesibles antes de página | O02,4,6 |
| D03 | Cinco rubros, services como tipo de oferta | Sexta ruta servicios/mixtas con identidad y operación propias, sin perder ofertas combinables | O03,5,7,13 |
| D04 | Guía corta con textareas; extensiones históricas de keys | Tarjetas/opciones adaptativas con explicación, preferencias, omitir/retomar y audio voluntario; versionar lectura compatible | O04–6 |
| D05 | Elección formato al entrar a Studio | Intención/oferta/comodidad/campaña antes del formato; tres propuestas | O09 |
| D06 | Publicación principal única por proyecto en contratos existentes | Oferta específica requiere múltiples borradores/publicaciones relacionados y URL estable, sin duplicar catálogo; definir contrato antes de migrar | O03,8 |
| D07 | Tres principales sin papeles comerciales guiados | Conóceme/Conversemos/Oferta recomendadas, nunca bloqueo obligatorio | O10 |
| D08 | Pedido de XP/enemigos/modelos antiguos en textos de Google | Sin XP/enemigos nuevos; modelo configurable/verificado al activar, no asumir recomendación antigua | O12 |
| D09 | «IA solo categorizar» interpretado para toda app | Restricción de bandeja; Studio/material/tareas con acciones IA propias explícitas | O12,14 |
| D10 | Pedir fotos al comenzar; usar café como predeterminado | Conocer primero, sin recursos obligatorios; textos de cada negocio aislados, orientación no publicable | O04,7 |
| D11 | Todo automático en diez minutos | Objetivo medido de primera estrategia/borrador/siguiente paso; corrección/aceptación antes de incorporar y publicación aparte | O06,16 |
| D12 | Más recordatorios por orgánico; S/10 garantiza efecto | Avisos solo opt-in con frecuencia; presupuesto ilustrativo editable sin garantía | O05,14 |
| D13 | Archivos/grabación sueltos o estado en memoria | Video/portada/guion/diseño misma pieza con referencias persistentes y encuadre separado | O03,11 |
| D14 | README dice Node22+, instalar todas las migraciones | Preservar Node18/20, Vite4/Tailwind3; diagnóstico antes de SQL acotado; no ejecutar histórico a ciegas | O01,3,15 |
| D15 | Recomendación antigua de cambios JWT y claves .env | No ejecutar de nuevo; auth en servidor conserva controles. Estado remoto debe revalidarse, clave local no es secreto remoto | O12 |
| D16 | Colores antiguos o negro forzado; logo «pendiente» en docs antiguos | Paleta confirmada y recursos originales existen; auditar CSS/controles, no reponer logo ni saturar gradientes | O02,7,14 |
| D17 | Límite comercial de proyectos/Pro vs niveles de guía | Niveles del diagnóstico y logro ModoPro no cambian suscripción ni bloquean herramientas; no añadir cuotas ni modificar plan comercial por inferencia | O03,6,14 |
| D18 | Costos/preparación confundidos; compras comerciales vs compras de insumos | Dos procesos distintos: commerce_orders conserva ventas/cotizaciones; insumos/costos requieren contrato propio sin duplicar catálogo | O03,13 |
| D19 | Emulación, build y fixtures como cierre; pantalla de pieza rechazada | Técnica, evidencia local, remota, física y aprobación visual separadas | Todos; O15–16 |
| D20 | Push/deploy como cierre automático en notas antiguas | Commit revisable sí en implementación; ningún push, Hostinger, republicación real ni cobro productivo por este objetivo | O01–16 |

## Evidencia histórica que se conserva sin volverla a certificar

- `FOR_U_PROGRESS.md` último tramo20oct: 185 pruebas frontend, TypeScript y build Vite4/Node20; QA foto pública tras reparaciones30/31, borrador independiente, PNG1080×1350, vínculo diseño-pieza-guion, conflicto entre pestañas. No se reejecutaron aquí; no cubren nueva personalización/campañas.
- `FOR_U_WORLD.md`: iPhone16/Safari, captura aportada, 59.4 FPS durante60s, 0 cuadros>100ms, máximo81ms; una sesión anterior, no los cambios futuros. VersióniOS definitiva no confirmada por Ajustes.
- `FOR_U_CREATIVE_EXPERIENCE.md`: última respuesta remota de material20oct «Falta configurar Gemini en el servidor»; no respuesta Gemini real. Revalidar secreto/cuota con el usuario, sin leer claves.
- Activación5 y MercadoPago: SQL/endpoints y QA históricos; correo, autorizaciones externas, pago/webhook real y segunda sesión autorizada permanecen por demostrar.
- Historia de Storage: reparaciones29/30/31 autorizadas/aplicadas según registro. No repetirlas para documentar, ni asumir que su código equivale a estado remoto actual.

## Bloqueos externos y alcance independiente

| Código | Evidencia faltante | Trabajo que NO debe detener |
| --- | --- | --- |
| X01 | Gemini: secreto remoto/configuración/cuota/modelo y respuesta real, a revalidar | Guía, reglas, composición, editor y organización manual |
| X02 | Segunda sesión remota autorizada | Pruebas locales y aislamiento entre proyectos propios QA |
| X03 | iPhone16/Safari en HTTPS y colaboración para permisos/medios/prueba física | Responsive/teclado y pruebas de dominio locales |
| X04 | Correo: remitente/proveedor y recepción autorizada | Reserva guardada y estados recuperables |
| X05 | Tokens/permisos de Google/Calendly/Meta/ManyChat, según integración | Navegación/configuración y estados honestos |
| X06 | MercadoPago: aplicación/secretos/vendedor-comprador QA/origenHTTPS/webhook | Catálogo, pedidos coordinados, cotizaciones y pruebas de contratos |
| X07 | Hostinger, autorización de versión/despliegue y negocios reales antes de republicar | Preparar/verificar versión local; fuera de QA actual |
| X08 | Presupuesto/límites para imagen generativa, Meta y cuotas comerciales | Plantillas, fotos propias y exportación |

No marcar un objetivo global como «bloqueado externamente» si todavía tiene trabajo independiente. Un bloqueo tiene acción exacta, responsable y evidencia faltante; no se usa como sustituto de una auditoría.
