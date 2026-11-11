# FOR U: validación de dashboard y mundo

## Implementado en el worktree

- Contenedor común, selector Tablero / Mi mundo, herramientas y módulos existentes.
- Tareas por cuatro áreas, revisión optimista en Supabase, guardar/reintentar, progreso compartido, borradores antiguos conservados y descargables.
- Islas 3D, viaje del barco, cámara fija con zoom, vista ligera, controles de teclado, movimiento reducido.
- Mascotas por área, caricias, snack, búsqueda de tres objetos y decoración persistente. Sin monedas, pérdida por ausencia ni pago para jugar.
- Calendario editable (título, fecha y hora), exportación y guardado con control de revisión.
- Conexiones centralizadas con estados de error, sin conectar y verificación vencida.
- Reparación SQL UUID para servicios, métricas de landing y módulos públicos, eventos idempotentes y aislamiento por cuenta.

## Evidencia obtenida

- TypeScript y build con Node 20/Vite 4.5.3; el fallo de inicialización React/3D de los chunks manuales fue reproducido y corregido.
- Suite de 71 pruebas: 71 pasaron. Se reemplazaron reglas visuales antiguas incompatibles con el brief de cuatro colores por identidad de áreas y contraste de texto WCAG AA.
- PostgreSQL embebido: migraciones 20 y 21, repetición de 21, métricas vacías, captura de eventos, deduplicación y rechazo de otra cuenta: pasaron.
- Sesión real de Supabase: Turismo creado/editado/guardado/recargado. Restaurante, Tienda y Hospedaje recuperan los textos guardados al recargar; Cursos recupera el curso creado al abrir una pestaña nueva.
- En proyecto de prueba Turismo: tarea completada en tablero se refleja en mundo; decoración Flores y desbloqueos persisten tras recarga.
- Calendario: creación, edición de título y hora local 14:30, y eliminación persistidas después de recargar. Vista mensual y exportación comprobadas; archivo ICS descargado inspeccionado, con actividad, UTC y alarma de diez minutos. La corrección del campo nativo usa onInput y lectura del formulario al enviar.
- Escena 3D visible: se corrigió la escala de etiquetas heredadas que tapaba la cámara ortográfica. Vista ligera y movimiento reducido comprobados. El mundo muestra el mismo progreso 1/3 guardado en el tablero.
- Conflicto real: dos pestañas del proyecto QA Restaurante; la segunda conserva sus cambios y muestra rechazo por revisión antigua.
- SQL aislado también rechaza escritura sobre proyecto ajeno, lectura de credenciales y actualización con revisión antigua.

## Pendientes que impiden declarar completa la entrega

- Aplicar `21_workspace_services_uuid.sql` en Supabase real; solicitado a la usuaria. La clave pública del frontend no puede ejecutar migraciones.
- Desplegar/verificar Edge Function `integrations`; probar conectar, verificar y desconectar con credenciales autorizadas del proveedor. Nunca pegar esas credenciales en Git.
- Completar prueba remota de publicación → visita/clic → resumen de métricas después del SQL.
- Verificar comportamiento completo sin red (los conflictos entre pestañas sí fueron probados).
- Validación visual móvil y rendimiento en dispositivo de referencia; no se ha medido todavía el objetivo de 30 FPS en móvil.
- Commits revisables, push y validación de Hostinger. No se ha desplegado este trabajo a producción.

## Repetir comprobación SQL aislada

Instalar `@electric-sql/pglite` en una carpeta temporal y ejecutar `scripts/verify-workspace-sql.mjs` con `FORU_PGLITE_MODULE` apuntando al módulo instalado (por ejemplo `/tmp/foru-sql-check/node_modules/@electric-sql/pglite/dist/index.js`). El script crea una base efímera con el esquema UUID compartido por la usuaria y no conecta a Supabase.

No ejecutar todas las migraciones históricas sin revisión: varias esperan IDs de texto. La reparación 21 está adaptada para la instalación UUID y fue probada en una base aislada; esto no sustituye comprobar el esquema y permisos reales.
