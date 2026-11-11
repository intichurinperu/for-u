# FOR U — Tu negocio toma forma

Plan aprobado el 15 de octubre de 2026: bienvenida original, creación por preguntas, mapa/Kanban/calendario/mundo sobre tareas compartidas, compañía local, editores contextuales y composiciones desde la landing. Sustituye la muestra visual anterior rechazada. No confundir implementación con aprobación visual de la propietaria.

## Implementación de esta revisión

- Logo PNG original en componente compartido, acceso y navegación; se encuadra con CSS sin modificar el archivo. Animación MP4 original en bienvenida saltable por sesión de pestaña, muda inicialmente, sin bloquear la carga de proyectos. Archivo comprobado en navegador: 960×960, 5.062 segundos, sin error de decodificación.
- Creación nueva y onboarding utilizan la misma secuencia de rubro inicial y nombre. Borrador inicial conservado en sessionStorage por cuenta. Las preguntas posteriores se guardan en `module-project-journey` mediante revisión. Opciones de equipo, omitir, volver, recuperar y adjuntar material. No inventar respuestas ni completar tareas por responder.
- Mapa con cuatro ramas, tareas y foco por área; Kanban con estados; calendario existente integrado y tareas fechadas por referencia; mundo existente. Las tareas v1 se leen sin conversión y una edición explícita de estado/fecha produce v2. Los nodos antiguos no se cambian. Conserva recompensas permanentes al reabrir.
- Navegación horizontal, selector de proyecto, menú de herramientas y cuenta; Pomodoro global y carita. La ayuda de la carita es búsqueda de guía preparada, sin llamadas a IA. Ideas por proyecto en `module-idea-inbox`, con categorías manuales, adjuntos, guardado con revisión y conversión explícita a tarea usando el UUID de idea para evitar duplicarla. La clasificación solo acepta resultados revisados y nunca crea tareas.
- Fotos: biblioteca/subida principal y enlace avanzado en todos los consumidores de ProjectImageField. Encuadre opcional guarda un archivo nuevo; conserva el original. Fallos de CORS/almacenamiento se muestran como errores.
- Creator Studio presenta Portada/Publicación/Carrusel/Historia, conserva ruta y herramientas. Compositor determinista desde hero, bloques y ofertas del borrador guardado: 1:1,4:5,9:16, identidad y CTA editables. Lote de hasta doce diseños con grupo de carrusel; revisión antes de guardar. Sin llamadas a IA ni imágenes inventadas.
- Cada diseño conserva fuente y revisión; un cambio posterior señala revisión necesaria sin regenerar ni sobrescribir. Se excluyen enlaces firmados temporales de la instantánea. Exportación PNG con comprobación de desbordamiento y errores de imagen.
- Creador visual dentro del contenedor común, diseño protagonista, título/texto editables directamente, imagen seleccionable y ajustes recogidos. Guiones, piezas y teleprompter existentes conservan su documento común.
- Respuestas iniciales pueden incorporarse selectivamente a Mi propuesta: no reemplaza datos automáticamente ni duplica catálogo. El editor de landing enlaza a la sección correspondiente del compositor.

## Gemini: preparado en código, no dar por conectado

Nuevas operaciones autenticadas en toolkit-ai: `classify` y `studio` (`content`, `layout`, `script`, `landing`). El servidor verifica propietario, lee documento/revisión guardados, limita contexto y devuelve JSON validado con esquema específico. No ejecuta acciones. Las instrucciones de usuario se envían como datos; no reemplazan instrucciones de sistema.

Se conserva cuota de 30/h, caché de cinco minutos por revisión/operación, exclusión de duplicados entre instancias y logs solo de uso. La operación forma parte de la clave de caché para no confundir composición y texto. Sin llamadas al abrir pantallas, fallback de pago, caché explícita de pago o generación de imágenes. La clave local no configura Supabase.

La usuaria confirmó nivel gratuito en Google AI Studio. El 19 de octubre se desplegó toolkit-ai y se configuraron proveedor Gemini, modelo gemini-3.5-flash-lite, confirmación del nivel gratuito y funciones pagadas desactivadas. Se desactivó el verificador JWT heredado con autorización específica; auth.getUser y propiedad siguen comprobándose en el código. Falta guardar personalmente GEMINI_API_KEY en Supabase y probar respuestas reales. La documentación oficial del modelo y su tabla de precios gratuitos se comprobaron el 19 de octubre. No se ha leído ni mostrado la clave, no se activó facturación y no se simula éxito. La usuaria pidió instrucciones para comprobar AI Studio; se enviaron. El cierre end-to-end Gemini queda pendiente hasta verificarlo.

## Límites que siguen abiertos

- Bandeja personal independiente implementada en foru_account_documents, con RLS por cuenta y revisión. Migración 29 autorizada y tabla remota confirmada el 19 de octubre. Captura, guardado, recarga y asignación explícita al proyecto QA comprobados; queda pendiente aislamiento remoto con segunda cuenta. No usa un proyecto ficticio.
- Verificación completa de todos los rubros, aula de cursos y todas las herramientas: no cerrada por cambiar controles comunes. Validar recorridos específicos.
- Compositor permite borrador guardado o última publicación como fuente; conserva modo y huella de revisión. Selección de fuente publicada, composición Café QA, guardado, recarga y PNG comprobados el 19 de octubre; ver registro.
- Los diseños del carrusel conservan grupo y diapositiva; la exportación actual es por imagen, no un archivo conjunto. Logo como capa gráfica independiente y deshacer/rehacer/variantes están implementados; queda validar todos sus recorridos de interfaz.
- Ayuda preparada no entiende cualquier pregunta libre; búsqueda sin coincidencias ofrece guardar la duda. No se presenta como conversación IA.
- Autoguardado de cada respuesta inicial aún no existe: se guarda explícitamente, manteniendo edición pendiente en la sesión de trabajo. La recarga advierte si hay cambios pendientes.
- No se declara completado todo el plan mientras falten esos recorridos y la prueba externa. No se desplegó Hostinger ni se publicaron negocios reales en esta revisión.

La evidencia de navegador y pruebas se añade al registro al completar las comprobaciones.


El registro del 19 de octubre documenta la recuperación de entorno y las comprobaciones remotas/UI. Gemini Flash-Lite figura con structured outputs y nivel gratuito en la documentación oficial consultada: [modelo](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [precios](https://ai.google.dev/gemini-api/docs/pricing). Esto no sustituye probar la cuota y respuesta de la clave concreta.

## 20 octubre — edición directa y guía breve

La landing es ahora la superficie principal: paneles bajo selección de texto, foto/galería, CTA u oferta; herramientas y widgets recogidos. El puente solo admite operaciones y destinos existentes, nunca rutas arbitrarias. El borrador vacío es un formato válido de edición y no se considera listo para publicar. Propuesta muestra tarjetas y diferencias reales; fotos en biblioteca privada y promoción pública únicamente al publicar.

La guía nueva usa oferta/público/objetivo después del nombre y rubro. Cada Continuar guarda; oferta y público se editan en `module-proposal`, mientras objetivo, material y cursor permanecen en `module-project-journey`. Las guías antiguas siguen siendo legibles. Su información comercial se incorpora al documento canónico solo al guardar explícitamente, sin sobrescribir propuestas existentes. Mapa lee la propuesta actual; responder no completa tareas.

Grabadora por clic (90 segundos, reproducción, descarte, reintento), límite de archivo 20 MB. En Safari móvil necesita HTTPS para el micrófono; la vista previa LAN por HTTP permite adjuntar una nota de voz o escribir. No se interpretan adjuntos automáticamente. Operación `material` en toolkit-ai valida cuenta, proyecto, revisión de guía y propuesta, pertenencia de hasta tres referencias guardadas y hasta 12 MB. El servidor descarga únicamente objetos privados propios; no acepta URLs arbitrarias. JSON de transcripción/textos/nombres y descripciones de oferta, editable antes de aceptar. Los precios se confirman en catálogo. Uso/caché/cuota existentes conservados; sin nuevo proveedor ni facturación.

20 octubre: `toolkit-ai` actualizado en Supabase (bundle 33747 caracteres, igualdad comprobada antes de Deploy). Prueba autenticada con WAV técnico guardado devuelve «Falta configurar Gemini en el servidor». Verifica ruta real y rechazo recuperable, NO inferencia del proveedor. Falta GEMINI_API_KEY remoto. No se leyó ni trasladó una clave local.

Diagnóstico remoto de Storage: user-uploads privado, 20 MB, inicialmente JPG/PNG/WebP; se añadieron solamente cinco MIME de audio desde Bucket settings, conservando privacidad y tamaño. WAV técnico subido y vinculado a la guía QA. `site-assets` ausente: reparación nueva `30_creative_media_configuration.sql` probada dos veces en PostgreSQL aislado (PGlite), con denegación entre propietario/proyecto, anónimo, privacidad incompatible y sin modificar proyectos/publicaciones. La usuaria autorizó su aplicación el 20 de octubre. SQL remoto confirmó Success. La primera publicación QA reveló que la subconsulta tomaba projects.name en vez del objeto; reparación 31 califica storage.objects.name, aplicada con Success. La prueba aislada incorpora ahora projects.name y repite 30/31 dos veces, comprobando propietario y denegaciones. No se ejecutaron migraciones históricas.

El diagnóstico también muestra políticas antiguas anónimas de escritura/borrado en `foru-studio-content` y carga anónima en `creator-media`. No se utilizan para el nuevo recorrido privado ni se cambiaron sus archivos/permisos en esta entrega; requiere una reparación separada, contrastada con sus consumidores, para no romper contenido histórico. Esto es evidencia del diagnóstico, no una comprobación de aislamiento remoto entre dos cuentas.

Creator Studio reutiliza fotos privadas de la landing y muestra propuestas visuales locales de composiciones, sin llamadas a IA. La revisión/guardado de piezas, variantes, exportación y vínculo con guiones se conservan; pruebas nuevas y límites se documentan en FOR_U_PROGRESS.md. El cierre técnico y la aprobación visual se mantienen separados.


La continuación de 20 octubre añadió vínculo explícito diseño → pieza → guion/tomas con UUID común e idempotencia. El guion QA abre el teleprompter y regresa conservando contexto; una pieza seleccionada recoge el perfil general para enfocar el trabajo. Publicación QA con foto pública completada tras reparación 31; editar después el borrador no altera su instantánea pública. Exportación PNG comprobada 1080×1350. Ver FOR_U_PROGRESS.md para límites de tamaños, proveedor y teléfono.
