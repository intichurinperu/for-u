# NotebookLM como referencia para IA contextual de FOR U

Investigación: 22 octubre 2026. Ampliación del acuerdo vigente; no sustituye recorridos, aceptación visual ni pendientes de operación.

## Evidencia oficial

- Google Help, crear un notebook: https://support.google.com/notebooklm/answer/16206563?hl=en — organización de fuentes por proyecto, selección de fuentes, resultados guardados en Studio y personalización de instrucciones. Algunos automatismos del producto no se trasladan: FOR U conserva generación exclusivamente por clic.
- Google Help, chat: https://support.google.com/notebooklm/answer/16179559?hl=en — elegir fuentes, respuestas con citas navegables para revisar su precisión, longitud/estilo y guardar respuestas como notas. La documentación puede redirigir al nombre actual del producto; se utiliza como referencia de interacción, no como dependencia de FOR U.
- Gemini, salidas estructuradas: https://ai.google.dev/gemini-api/docs/structured-output — JSON Schema con validación independiente. Estructura válida no prueba hechos correctos.
- Gemini, caché: https://ai.google.dev/gemini-api/docs/caching — caché implícita y condiciones por modelo; consultar uso real. No prueba ahorro fijo ni disponibilidad gratuita para cualquier modelo. No activar caché explícita de pago.
- Precios: https://ai.google.dev/gemini-api/docs/pricing — separar límites/planes del producto NotebookLM y cuotas/precios de la API de FOR U.

No se estudió ni se afirma conocer la implementación interna de Google. No se importa NotebookLM ni se comparten proyectos con ese servicio.

## Adaptación concreta

Flujo: elegir acción contextual → revisar fuentes seleccionadas → generar por clic → revisar sugerencia y procedencia → editar/aceptar → guardar el resultado separado de sus fuentes.

Una única entrada contextual «Crear conmigo» despliega acciones cuando sean pertinentes, sin añadir una fila permanente de botones. En celular se abre el panel inferior existente, una decisión por momento.

| Lugar | Acción | Fuentes permitidas por defecto | Resultado revisable |
| --- | --- | --- | --- |
| Respuesta inicial | Ordenar mi respuesta | Texto/audio/foto seleccionados explícitamente | Transcripción y campos sugeridos, sin aceptar automáticamente |
| Identidad | Ayúdame a expresar mi diferencia | Respuestas confirmadas, propuesta; notas de inspiración elegidas | Redacción propuesta, no hechos nuevos |
| Landing | Mejorar este mensaje | Solo sección elegida; esencia opcional | Titular, texto o CTA para comparar con el actual |
| Landing | Preparar preguntas frecuentes | Oferta/condiciones confirmadas seleccionadas | Preguntas con respuestas sustentadas; lo que falta se pregunta, no se inventa |
| Studio | Adaptar a mi voz | Pieza guardada; identidad/pilar elegidos | Variante textual que conserva datos comerciales |
| Pieza | Crear guion de este post | Mismo post; preferencias de creación opcionales | Guion breve y tomas, revisables antes del teleprompter |
| Tarea | Ayúdame a empezar | Tarea seleccionada | Hasta tres pasos; nunca marcar completada |
| Bandeja | Ordenar mis ideas | Hasta diez ideas elegidas | Categorías, sin ejecución ni reescritura del original |

«Crear contenido desde mi página» y sus variantes de plantillas siguen siendo locales sin IA. Personalizar con IA será una elección separada.

## Fuentes y trazabilidad

- Mostrar «Usaré…» con documento, pieza/sección/oferta y revisión guardada antes de generar.
- Seleccionar identidad, pilares, notas de referencias y material adicional de forma explícita; no enviar toda la cuenta ni todos los proyectos.
- Fuente primaria y material de inspiración se distinguen. Un enlace guardado no equivale a perfil leído. No visitar ni copiar contenido externo automáticamente. Capturas privadas requieren selección explícita para análisis.
- Resolver y autorizar fuentes en servidor por cuenta/proyecto/ID/revisión. Rechazar referencias desconocidas, conflictos y versiones incompatibles.
- Construir procedencia desde referencias verificadas del servidor; no confiar en URLs o IDs inventados por la respuesta del modelo. Una cita permite verificar, no garantiza exactitud.
- Guardar sugerencia, procedencia y decisión del propietario; nunca convertir automáticamente una respuesta generada en un hecho confirmado o en fuente canónica de precios.
- Al cambiar una fuente, indicar revisión necesaria; no sobrescribir piezas ni publicaciones.

## Consumo y honestidad

Un clic = una solicitud acotada. Contexto mínimo por operación, salida limitada, JSON propio, deduplicación y caché existente con revisiones incluidas. Reutilizar resultado cuando siga vigente; nueva variante exige otro clic. No llamadas al abrir, escribir o navegar. Mostrar cuota agotada y alternativa manual. No prometer ahorro del 90% ni cambiar automáticamente a proveedor/modelo pagado. Registrar tokens y aciertos de caché sin textos privados.

## Auditoría local y aceptación pendiente

La base toolkit-ai ya autentica, resuelve una fuente guardada, valida revisión, limita solicitudes y reutiliza respuestas. PageAI y PieceAI ya ofrecen aceptación explícita. Sin embargo, identidad/referencias añadidas recientemente todavía no son fuentes seleccionables del servidor: NO se afirma que la IA ya use esos datos. Tampoco existen todavía citas verificadas por campo de salida. Se detectó que la lectura de piezas del servidor solo admite perfil v1, mientras la interfaz ya guarda v2: reparar y probar antes de acreditar guiones reales.

Para cerrar: seleccionar fuente real → vista de datos enviados → proveedor real → procedencia verificada → aceptar al borrador → guardar/recargar. Repetir sin identidad, con cuota agotada, fuente cambiada, referencia ajena/inyección y dos proyectos. Comprobar celular y no multiplicar botones visibles. No se acredita esta aceptación solo con mocks ni documentación.

Actualización de implementación local: el rechazo de perfiles v2 se corrigió con creativePieceSource, que solo extrae la pieza autorizada seleccionada. Pruebas del helper y del handler aprobadas. No se desplegó el backend ni se acreditó una respuesta de Gemini con este cambio.


Estado 23 octubre: selección de identidad/pilares/notas de referencia implementada en cliente y desplegada en toolkit-ai; servidor valida revisiones y propiedad. Prueba real de solicitud QA respondió falta de GEMINI_API_KEY en el entorno de ejecución. No se acredita generación real ni se presenta como funcional hasta resolver configuración y obtener respuesta válida.


23 octubre — Gemini real comprobado después de que la usuaria guardara GEMINI_API_KEY: una solicitud Proponer texto desde pieza QA Servicios 9ad56365 obtuvo contenido estructurado aceptado por el cliente. Fuentes verificadas: pieza guardada revisión 2026-10-23T18:26:33.567242+00:00, diagnóstico revisión 2026-10-23T19:30:13.833917+00:00; identidad desmarcada, pilar Proceso y método, una referencia ficticia elegida. No se enviaron perfiles externos ni se visitaron referencias. Se acepta en borrador QA, guarda, recarga y recupera tanto texto como procedencia. No hubo llamada al abrir, recargar ni consultar procedencia. Evidencia gemini-real-fuentes-qa.png. Esto prueba contenido contextual con Gemini real; no acredita todavía todas las operaciones, transcripción/audio o aislamiento con segunda cuenta.
