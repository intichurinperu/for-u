# FOR U: ejecución y servicios

La aplicación usa React/TypeScript/Vite y Supabase. No se añadieron dependencias de producción para estos cambios.

## Frontend

Desde `frontend`, instala las dependencias existentes y ejecuta:

```sh
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

Variables públicas: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (o `VITE_SUPABASE_PUBLISHABLE_KEY`). Nunca uses una clave secreta de Supabase ni una clave de IA con prefijo `VITE_`.

- `/workspace`: sesión real, proyectos y pantalla Hoy por defecto.
- `/herramientas/demo`: prueba local sin cuentas externas. Los cambios duran la sesión de la vista.
- `/s/:slug`: sitio publicado desde Supabase.
- `/site-preview`: marco interno del editor; solo recibe contenido de su ventana padre del mismo origen.

## Supabase

Verifica primero el proyecto y las migraciones instaladas. Las migraciones nuevas son `11` a `17`; se aplican en orden sobre la base existente. No borres ni vuelvas a crear las tablas previas.

- `toolkit_documents`: borradores y progreso privado de cada cuenta/proyecto.
- `toolkit_sites`: fuente de las publicaciones; `published_sites` proyecta únicamente `slug` y `site_data` publicados. La migración 17 conserva cualquier relación `published_sites` preexistente, que debe revisarse por compatibilidad antes de desplegar.
- `reservation_slots`, `reservations`, `reservation_notifications`: horarios, cupos, reservas y estado de correo.
- `site_analytics`: visitas anónimas por navegador y clics CTA; resumen de 30 días y suscripción en vivo.
- `integration_connections`: resultados de verificación accesibles solo por la propietaria. `integration_credentials` no admite acceso de navegador.
- Storage: `user-uploads` privado; `site-assets` público para portadas que la usuaria elige publicar.

Despliega las funciones `toolkit-ai`, `reservations` e `integrations` usando `supabase/config.toml`. IA e integraciones validan la sesión dentro de la función. Crear reservas es público; reintentar correos requiere sesión y propiedad de la reserva.

Secretos del servidor:

| Variable | Uso |
|---|---|
| `OPENAI_API_KEY` | Generación y transcripción autenticadas |
| `OPENAI_MODEL` | Modelo de texto; valor inicial `gpt-4.1-mini` |
| `RESEND_API_KEY` | Envío de confirmaciones de reserva |
| `RESERVATIONS_FROM_EMAIL` | Remitente verificado en Resend |
| `META_GRAPH_VERSION` | Versión de Meta Graph API usada para verificar acceso |

Supabase proporciona `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` al entorno de sus funciones. No copies secretos a archivos del frontend ni al repositorio.

Sin correo configurado, la reserva se conserva y se informa que el correo está pendiente. El negocio puede reintentar desde Reservas. La confirmación indica explícitamente la hora de Lima; la agenda del navegador muestra su zona local.

Conectar una cuenta verifica acceso de lectura. No equivale a sincronizar calendarios, activar campañas o enviar mensajes. Tokens de Google/Meta pueden caducar; el indicador exige una comprobación en los últimos 15 minutos.

## Verificación

```sh
node --test supabase/tests/edge-auth.test.mjs
PGLITE_MODULE_PATH=/ruta/temporal/@electric-sql/pglite/dist/index.js node --test supabase/tests/toolkit-rls.test.mjs
```

PGlite es solo una herramienta temporal de prueba de PostgreSQL, no una dependencia de la aplicación. Estas pruebas no sustituyen la comprobación contra el servidor real.

Prueba manual: entrar → Hoy → Empezar → completar una subtarea → comprobar progreso → salir → entrar con otra cuenta. En móvil, abrir el menú y el panel. Publicar un sitio, abrirlo sin sesión, reservar un cupo, recibir correo y comprobar métricas. Comprobar cada integración con una cuenta autorizada.

`frontend/tests/media-smoke.html` genera video/audio sintéticos y verifica grabación, silencios y exportación. `frontend/tests/performance.html` mide carga e interacción local si se copia a un servidor de la compilación de producción; no se publica como parte de la app.

## Estado externo observado

El host configurado de Supabase no resuelve (`ENOTFOUND`) dentro ni fuera del entorno restringido. No se aplicaron migraciones remotas y no se verificaron servicios de IA, correo ni cuentas externas en vivo. El detalle actualizado está en `IMPLEMENTATION_STATUS.md`.
