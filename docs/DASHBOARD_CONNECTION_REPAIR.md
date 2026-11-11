# Diagnóstico de la conexión del dashboard

La prueba en la sesión real del 1 de octubre de 2026 confirmó:

- Supabase rechaza columnas de `profiles` y `projects`, incluyendo `display_name`, `description` y `tangible_goal`.
- `public.toolkit_documents` no aparece en la caché del esquema. El editor de Turismo necesita esta tabla para cargar y guardar.
- Las versiones anteriores del dashboard enviaban los enlaces laterales a `/dashboard` cuando no había proyecto: el clic no cambiaba nada.

## Estado actualizado · 2 de octubre

La usuaria confirmó Success al aplicar la reparación 20. Las pruebas posteriores verificaron creación y guardado de proyectos con UUID en la base real, conservando IDs y slugs existentes. Los borradores locales incompatibles se muestran como pendientes y pueden descargarse; no se presentan como guardados.

La reparación adicional `supabase/migrations/21_workspace_services_uuid.sql` está pendiente de aplicar en Supabase real. Reúne únicamente las dependencias revisadas de herramientas, publicaciones, métricas y conexiones, adaptadas a UUID. No ejecutar indiscriminadamente las migraciones 11–19 originales: algunas usan relaciones con IDs de texto.

El SQL 21 incluye `verification_state` y `last_error` para distinguir autorización rechazada de errores de servicio. Después debe desplegarse la función `supabase/functions/integrations/index.ts` actualizada. La verificación remota de proveedores requiere una cuenta autorizada; los enlaces externos no cuentan como conexiones.

La compilación no sustituye comprobar tablas, permisos y persistencia remotos. Consulta `WORKSPACE_MVP_VALIDATION.md` para la evidencia y los pendientes.
