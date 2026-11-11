# Entrega 5: activación y comprobaciones pendientes

Fecha: 14 de octubre de 2026. Solo proyectos QA; ningún negocio real debe modificarse.

## Base de datos

La propietaria confirmó Success de las reparaciones 24 y 25. No ejecutar otra vez las migraciones históricas 13, 14, 15 o 21 completas.

- 24_reservations_uuid.sql añade únicamente las tablas/RPC de reservas ausentes en el diagnóstico remoto. Mantiene UUID y páginas existentes.
- 25_analytics_private_summary.sql retira EXECUTE heredado para anon de la función privada de resumen. No cambia los eventos ni la implementación del resumen que ya está instalada.
- Lectura anónima comprobada: disponibilidad válida; tablas de reservas y credenciales denegadas; resumen privado denegado 401/42501.

## Funciones de servidor (activadas)

Inicialmente los endpoints `reservations` e `integrations` respondieron HTTP 404. Tras iniciar sesión la propietaria, se desplegaron desde el editor de Supabase con código comparado exactamente con el repositorio. La propietaria autorizó retirar el verificador JWT legado en ambas; valores OFF comprobados tras recarga. GET responde 405, operaciones privadas anónimas 401. El SQL por sí solo no despliega Edge Functions. Pasos de referencia para futuras actualizaciones:

1. Abrir Supabase → proyecto **for u** → **Edge Functions**.
2. Elegir **Deploy a new function → Via Editor**. Nombre exacto: `reservations`.
3. Reemplazar el ejemplo de `index.ts` por el contenido completo de `supabase/functions/reservations/index.ts`, sin títulos ni fences Markdown. Desplegar.
4. Repetir con nombre `integrations` y `supabase/functions/integrations/index.ts`.
5. En detalles de cada función, desactivar **Verify JWT / Enforce JWT verification** (según la etiqueta de la pantalla). El archivo `supabase/config.toml` ya declara ese ajuste: `integrations` autentica con `auth.getUser`; `reservations` permite create público validado por RPC y autentica retry-email por propietario. Desactivar el verificador de la plataforma no elimina esas comprobaciones.
6. No cambiar ni exponer las variables automáticas `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. No copiarlas al frontend ni al chat.

Alternativa si existe un entorno CLI ya autenticado (no se ejecutó en esta entrega):

```sh
supabase functions deploy reservations --project-ref yizkrarmnrwkdrndqdji --no-verify-jwt
supabase functions deploy integrations --project-ref yizkrarmnrwkdrndqdji --no-verify-jwt
```

No se encontró CLI Supabase ni Deno instalados en este equipo. La propietaria inició sesión en una pestaña del navegador interno y el despliegue se realizó allí. El control de Chrome nativo quedó bloqueado por permisos del equipo. No se extrajeron credenciales de ninguna sesión.

## Correo

En Edge Functions → Secrets, configurar `RESEND_API_KEY` y `RESERVATIONS_FROM_EMAIL` con un remitente verificado en Resend. Se revisaron únicamente los nombres: Supabase mostraba «No custom secrets created», por lo que ambas variables faltan. La propietaria autorizó un correo de prueba a la dirección que proporcionó en el chat; no se añade esa dirección a archivos versionados. La reserva pública ya se guardó, pero el correo permaneció pendiente correctamente.

Resend requiere verificar un dominio propio para envíos comerciales; el email Gmail proporcionado sirve como destinatario de prueba, no como remitente de un dominio propio. [Documentación oficial de dominios](https://resend.com/docs/dashboard/domains/introduction).

- Probar desde la página QA después del despliegue.
- La reserva tiene que aparecer en la agenda del propietario tras recarga.
- «Correo enviado» requiere aceptación del proveedor y persistencia de esa confirmación; la recepción en el buzón requiere comprobación del destinatario.
- Falta de configuración/red: reserva permanece guardada y correo pendiente de confirmar; rechazo del proveedor: envío fallido. Nunca convertir ese fallo en otra reserva ni fingir envío.

## Conexiones

La conexión existente utiliza un token del proveedor introducido por la propietaria en **Configuración → Tus conexiones → Gestionar conexión**. El enlace «Abrir Google Calendar» por sí solo no conecta ni concede permiso. No hay un flujo OAuth de inicio de sesión Google en este alcance; abrir los ajustes de Google Calendar no produce el token.

Tras desplegar `integrations`, probar una autorización de prueba obtenida del proveedor con permisos mínimos. No pegar tokens en el chat. Google requiere autorización de lectura de calendarios; Calendly un token personal de lectura; ManyChat su clave de API; Meta autorización `ads_read` y acceso a una cuenta publicitaria. La disponibilidad de esos permisos depende de la cuenta externa.

Comprobar Conectar y verificar → recargar → Verificar → Desconectar y confirmar eliminación de la credencial. Desconectar solo una autorización creada para QA; no retirar conexiones comerciales existentes. Estados vencidos y fallos se probaron con transporte controlado; falta una autorización externa real para completar el recorrido. Para el endpoint Google actual, el permiso mínimo aplicable es `https://www.googleapis.com/auth/calendar.calendarlist.readonly`; hace falta obtener un token OAuth válido con ese permiso, no acceder a los ajustes del calendario. [Referencia oficial del endpoint y permisos](https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list).

## Aislamiento y límites

- Los roles anon/authenticated y dos propietarios se comprobaron en PostgreSQL aislado. Falta segunda sesión remota autorizada para repetir separación entre cuentas.
- Calendario, métricas y reservas se verifican entre proyectos propios QA; eso no sustituye la segunda cuenta.
- No se implementa sincronización de Google/Calendly, publicación Meta ni gestión de campañas.
- Hostinger no desplegado ni verificado en esta entrega.

## Pruebas reproducibles

Frontend: `npm run typecheck`, `npm test`, `npm run build` en Node 20 con las dependencias del lock existente.

Backend aislado (PGlite y TypeScript pueden proporcionarse mediante rutas temporales; no se añaden dependencias a la app):

```sh
PGLITE_MODULE_PATH=/tmp/foru-widget-tests/node_modules/@electric-sql/pglite/dist/index.js /tmp/foru-runtime/node_modules/node/bin/node --test supabase/tests/management-services.test.mjs
TYPESCRIPT_MODULE_PATH=/tmp/foru-delivery1/frontend/node_modules/typescript/lib/typescript.js /tmp/foru-runtime/node_modules/node/bin/node --test supabase/tests/edge-handlers.test.mjs
```

Las pruebas de handlers transpilan el código real y usan transportes de prueba: no prueban despliegue Deno ni acceso a proveedores reales.
