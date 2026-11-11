# FOR U — experiencia coherente e IA eficiente

## Estado de esta entrega

Implementación técnica local preparada, con activación externa y revisión visual pendientes, basada en los commits de Mi mundo. La propietaria rechazó la primera muestra por demasiado neutra y por mostrar demasiadas opciones. La corrección prioriza simplificación real y estética luminosa/futurista; el logo y la animación originales aún no se recibieron. No se considera aprobada la dirección visual final por el solo hecho de pasar pruebas.

## Cambios de uso

- Contenedor de aplicación separado de páginas de clientes; componentes compartidos con colores FOR U y foco visible. Se conserva CSS antiguo fuera del ámbito privado y de publicaciones que opten por versión 2.
- Sidebar: cuatro accesos cotidianos y buscador de todas las herramientas. El buscador abre las herramientas con el proyecto correcto; alternativas equivalentes en móvil, sin varios submenús.
- Tablero de proyecto con una sola identidad principal; los borradores antiguos se conservan y se consultan desde la vista general, no como aviso repetido en cada proyecto.
- Área: tres próximos pasos, lista completa opcional; añadir, ajustar y explorar herramientas se revelan al solicitarlo. La tarea conserva su herramienta y guardado. Descanso permanece disponible.
- Restaurante: pasos reales Tu negocio / Tus productos / Revisar y publicar. Los otros campos quedan ocultos conservando el estado; un formulario de producto sin aplicar impide cambiar de paso. Publicación, diseño y vista previa aparecen en el paso de revisión.
- Creator Studio: una acción principal para continuar; ruta completa y herramientas creativas desplegables. Los catálogos de tienda/turismo/cursos mantienen identidad bajo un desplegable; hospedaje conserva edición contextual y previsualización opcional. Las piezas sociales agrupan guion/tomas, planificación y archivos sin borrar campos.

## Presentación pública versionada

`presentationVersion` opcional (1/2) en LandingDraft y documentos de restaurante/turismo; ausencia conserva el diseño anterior. No se migra ningún documento al leerlo. Restaurantes trasladan la versión a `menu` en su instantánea; turismo a su raíz. Las otras ofertas se publican mediante landing.

La comparación muestra ambos diseños con el mismo contenido del borrador. Elegir diseño no publica. Guardar conserva la elección; Publicar actualiza la instantánea mediante el control de revisión existente. URLs, catálogos, condiciones, imágenes y datos privados no se sustituyen. Las versiones desconocidas se rechazan. No se ha publicado ningún negocio real.

## IA: código preparado, activación externa pendiente

`toolkit-ai` sigue siendo la entrada autenticada. Verifica cuenta/proyecto antes del proveedor. Gemini se selecciona explícitamente; no hay sustitución automática a proveedores pagados. La ruta antigua `chat` queda retirada en el código (410); requiere desplegar esa actualización para retirarla remotamente.

Para activación QA, la administradora debe comprobar en Google AI Studio un proyecto sin facturación habilitada y cuota gratuita disponible; después configurar secretos en Supabase, sin pegarlos en el chat:

- `FORU_AI_PROVIDER=gemini`
- `GEMINI_API_KEY`: clave configurada personalmente en secretos.
- `GEMINI_MODEL=gemini-3.5-flash-lite` (comprobar disponibilidad al activar).
- `FORU_AI_FREE_TIER_CONFIRMED=true`, solo después de comprobar el proyecto de Google.
- Mantener `FORU_AI_PAID_FEATURES_ENABLED` ausente o `false` para esta validación sin gasto nuevo. La transcripción/OpenAI previos quedan detrás de este control explícito; los editores manuales siguen disponibles. No se han alterado secretos ni facturación remotos.

Desplegar `toolkit-ai` con sus archivos `core.ts` y `sharedCache.ts`, además de `chat/index.ts`. Mantener autenticación interna; este cambio no requiere debilitar verificadores del gateway. No copiar solo index.ts dejando fuera sus imports. Comprobar la función de cuota existente y permisos sobre toolkit_documents antes de activar. No aplicar migraciones antiguas.

La operación `mission` recibe proyecto, tarea/actividad y revisión. El servidor lee la fuente privada autorizada; no confía en un precio, tarea o documento enviado por el navegador. Devuelve JSON validado con título, descripción, hasta tres pasos, icono permitido, estimación opcional y título lúdico opcional. Sin enemigos ni XP. Aplicar afecta el borrador; guardar sigue siendo explícito. No completa tareas ni publica.

Ahorro: contexto acotado, historial breve, 700 tokens de salida como máximo (650 para misión), sin llamadas al abrir pantallas. Caché de cinco minutos por cuenta/proyecto/acción/contexto/revisión y reclamo de revisión en un documento privado por acción; impide solicitudes simultáneas entre instancias. Memoria local adicional acotada. La cuota de 30/h se consume solo al generar, no al reutilizar un resultado. Los errores no se guardan como éxito. Un resultado cuyo guardado no pudo confirmarse se informa como incierto; no se regenera automáticamente. No hay caché de pago ni promesa de 90% de ahorro. Los logs nuevos solo registran conteos/modelo/acción.

Gemini no lee Google Calendar automáticamente: solo actividades internas o una fuente externa realmente verificada. La disponibilidad y calidad con Gemini real permanecen pendientes de clave/cuota/despliegue; las respuestas controladas de pruebas no se presentan como IA conectada.

## Validación

Ejecución Node 20, Vite 4 y Tailwind 3, sin dependencias nuevas. Pruebas existentes y nuevas cubren presentación compatible, instantáneas independientes sin inventario/costos, JSON inválido/truncado, fuente ajena/revisión desactualizada, cuota, caché por propietario y concurrencia entre instancias. Evidencias finales de navegador y límites se registran en FOR_U_PROGRESS.md.

Pendientes externos: activar/verificar Gemini con cuota gratuita; segunda sesión autorizada para repetir aislamiento remoto; aprobación visual con los recursos originales de marca; Hostinger y republicación de negocios reales. La prueba física previa de Mi mundo fue 59.4 FPS en iPhone16/Safari; esta entrega no cambia el renderer 3D ni añade animaciones permanentes.

### Configuración comprobada sin revelar valores

Se encontró GEMINI_API_KEY en .env de la raíz y VITE_GEMINI_API_KEY en frontend/.env. El código actual no lee VITE_GEMINI_API_KEY. Estos archivos locales no configuran las Edge Functions de Supabase. Inspección de solo lectura del panel remoto: cuatro funciones (`chat`, `integrations`, `mercado-pago`, `reservations`), todavía sin `toolkit-ai`; Secrets indica que no hay secretos personalizados. No se leyeron valores remotos ni se guardaron claves. Falta desplegar y configurar la función nueva, además de confirmar cuota gratuita. Tener la clave local no prueba esa conexión.

Para facilitar un despliegue posterior mediante editor, se preparó un archivo único sin secretos en `/tmp/foru-delivery1/toolkit-ai-deploy.ts`, generado desde el código probado; evita copiar imports locales incompletos. No se desplegó.

Las comprobaciones QA y la publicación v2 de prueba están registradas en FOR_U_PROGRESS.md. Resultado local final: 163/163, TypeScript y build correctos. La aprobación visual y los recursos originales de marca siguen pendientes; no se declara toda la experiencia validada por usuarios.

### Última comprobación de interfaz

Se verificaron superficies reales con gradiente (computed backgroundImage), cuatro enlaces cotidianos y cero campos de formulario en el tablero. Buscar Teleprompter devuelve su enlace; el buscador móvil vive en un portal para no quedar recortado por la cabecera. Anchos CSS 360/768/1440 sin overflow horizontal; en móvil diálogo340/top10. Escape devuelve el foco. Se restableció el viewport temporal. Contraste calculado de texto: violeta/blanco5.75:1, mint/carbón11.28:1, dorado/carbón7.93:1 y lavanda/texto violeta8.24:1. No equivale a una auditoría exhaustiva de todas las pantallas históricas.

La prueba física previa de FPS no se repite como si validara esta nueva interfaz: no cambió el renderer 3D; falta repetir en teléfono si aparecen problemas con la capa visual. Captura actual: `/tmp/foru-delivery1/foru-focus-ready.jpg`.

El Frasco de Ideas histórico sigue usando reglas locales (no consume Gemini); sus etiquetas se corrigieron para indicarlo y se retiró una espera artificial. No se cambiaron los nodos antiguos ni sus recompensas.


## Reconciliación — 19 de octubre de 2026

Las notas anteriores describen la revisión previa. Logo y animación originales ya fueron recibidos e integrados; navegación horizontal, mapa conectado y bandeja personal están implementados. La usuaria confirmó nivel gratuito. toolkit-ai se desplegó hoy con autenticación interna autorizada y proveedor Gemini configurado, funciones pagadas desactivadas. La clave local sigue sin equivaler al secreto remoto: falta GEMINI_API_KEY y la prueba real. Ver FOR_U_CREATIVE_EXPERIENCE.md y el registro más reciente; no interpretar los antiguos pendientes como el estado actual.
