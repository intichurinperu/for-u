# FOR U — criterios del prompt maestro

Objetivo vigente: archivo adjunto `887ce78a-3f19-4f90-9ab9-c9627176f54d/pasted-text-1.txt` (maestro final, UX Hoy como prioridad). Se conserva el alcance funcional de los adjuntos anteriores.
Ampliación vigente: `3b4df14c-7d24-406d-aa5d-2c268bb1f11a/pasted-text.txt`. La vista Hoy pasa a ser la entrada principal; menú oculto; una tarea y una acción; cinco puntos sin detalles; subtareas solo al abrir el paso. Las variantes cálida, verde y gradiente/serif por estado reemplazan las restricciones cromáticas anteriores exclusivamente en esas vistas. No se cancela el resto del objetivo.

Este documento registra evidencia; una implementación o prueba parcial no equivale a aceptación completa.

| Orden | Requisito | Estado y evidencia pendiente |
|---|---|---|
| 1 | Diseño blanco/negro/gris; gradiente restringido; Inter/Playfair; sombras ≤0.08 | Tokens canónicos y neutralización aplicados. Cuatro verificaciones automáticas pasan; escritorio y móvil revisados visualmente. |
| 2 | TypeScript sin errores | Typecheck completo pasó después del catálogo/editor/reservas. Build de producción pasó (2618 módulos, 2.73 s de compilación; no equivale a carga de usuario). |
| 3 | Sidebar de iconos móvil, panel completo, mapa vertical, escala 90% | Sidebar de iconos, panel al ancho completo, mapa vertical y escala 90% implementados; revisión anterior móvil pasó. Repetir con editor nuevo. |
| 4 | `/s/:slug`, site_data real, SEO dinámico y analytics en tiempo real | RPC devuelve site_data real; SEO dinámico implementado y consulta periódica. Prueba SQL de acceso público pasa. Sin verificación remota: servidor configurado responde ENOTFOUND. |
| 5 | Disponibilidad real, nombre/email/teléfono, reservas RLS y confirmación por Edge Function | Disponibilidad, capacidad, idempotencia, cancelación, RLS y Edge Function de correo implementados. Pruebas PostgreSQL pasan. Envío remoto pendiente de servidor y credenciales de correo. |
| 6 | Visitas únicas, páginas, referrer y clics CTA desde site_analytics | site_analytics, visitantes únicos por navegador, páginas, referrer y CTA conectados. Suscripción en vivo con respaldo de 15 s. Agregación, deduplicación e aislamiento probados en PostgreSQL. |
| 7 | Estado real de Google Calendar, Calendly, ManyChat y Meta Ads | Indicadores y verificación server-side por proveedor implementados. RLS impide falsificar estado o leer tokens. Sin cuentas externas para confirmar llamadas reales. |
| 8 | 10 plantillas completas; ocho rubros enumerados con cinco fases y recursos | 10 plantillas completas, 150 subtareas específicas, 50 hojas descargables. Integradas en onboarding, Ruta Digital y catálogo del estudio. Test de integridad pasa. |
| 9 | IA en servidor, autenticada, límites por usuaria | Edge Function preparada; prueba local RLS/cuota pasó. Falta prueba de despliegue/credenciales. |
| 10 | Cambio de cuenta aislado, limpieza localStorage y consultas por usuaria | Logout reinicia estado y elimina datos FOR U, incluidos backups antiguos. Prueba de limpieza pasa. Falta flujo con dos sesiones reales; auditar operaciones antiguas por project_id. |
| 11 | Teleprompter exacto, editor iframe y mapa SVG; pruebas completas | Grabación/exportación sintética previa pasó. Líneas de 35 caracteres y estados exactos implementados y probados. Editor iframe con postMessage y autosave de 400 ms implementado; edición UI verificada. Falta verificar persistencia remota y flujo completo. |
| 12 | Carga <2 s e interacciones <100 ms | No probado en condiciones definidas de producción. |

Se preservan React/TypeScript y las tablas existentes. Las ampliaciones necesarias se harán con migraciones aditivas, sin borrar ni reinterpretar datos existentes. No se publican ni se simulan conexiones externas sin evidencia.

## Evidencia local más reciente

- `npm test`: 20/20 pruebas.
- PostgreSQL aislado (PGlite): 11/11 pruebas de migraciones 11–15. Falta incorporar migración 16 de imágenes públicas.
- TypeScript: sin errores en todas las fuentes del frontend.
- Build de producción: correcto en copia temporal con dependencias instaladas.
- Lint de fuentes nuevas y autenticación: sin errores; una directiva redundante retirada, pendiente repetir.
- Supabase: lectura intentada dentro y fuera del entorno restringido; ambos intentos fallan con `ENOTFOUND`. No se ha aplicado ninguna migración remota.
- No se ha demostrado la meta de carga <2 s o interacción <100 ms.

## Integraciones

La verificación consulta endpoints de lectura. Tokens permanecen en una tabla sin permisos de cliente, con acceso exclusivo del servidor. El indicador caduca a los 15 minutos. Verificar acceso no activa automatizaciones, campañas ni sincronización de calendarios.

Referencias oficiales: [Google Calendar](https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list), [Calendly](https://developer.calendly.com/api-docs/calendly-api/users/get-current-user), [ManyChat](https://api.manychat.com/swagger). El endpoint Meta requiere validación con una cuenta autorizada.

## Ampliación UX Hoy (en curso)

- Entrada por defecto en el estudio y workspace: una tarea del rubro, una acción y porcentaje.
- Herramientas y plantillas retiradas de la vista inicial. Menú oculto con grupos de hasta tres destinos.
- Panel de tres subtareas bajo demanda; progreso guardado en documentos privados y vinculado a tareas del proyecto.
- Exhausted: botón grande único; anxious: tarea sin progreso futuro; low motivation: tres microtareas; high energy: semana expandida.
- Pendiente: pruebas de navegador, foco/accesibilidad, persistencia del progreso y valoración de la usuaria.
