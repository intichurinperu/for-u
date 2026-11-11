# Paso 2 UX — alcance añadido al objetivo de FOR U

Solicitud de la usuaria del 3 de octubre de 2026. Este paso amplía el objetivo existente; no sustituye las reparaciones y validaciones pendientes del Paso 1.

## Resultado requerido

Experiencia viva, colorida, inspiradora y TDAH-friendly, conservando los cinco rubros, Tablero / Mi mundo, tareas y progreso compartidos, UUID, guardado en Supabase y las herramientas existentes.

## Entregables

1. Sistema visual con gradientes azul–cian, verde–esmeralda, naranja–ámbar y morado–violeta. Fondo slate–azul sutil, cards redondeadas, sombras suaves, elevación al pasar el puntero e iconos de 48 px.
2. Progreso real desde las tareas: barras con gradiente, porcentaje animado y contador de pasos. Check dorado con brillo al completar un área. Abrir herramientas o jugar no completa tareas.
3. Pomodoro flotante circular con tiempo restante, pulso del color del área activa, celebración al terminar y sonido suave mediante `sound.ts`. Conservar el estado global al navegar. Respetar movimiento reducido y las restricciones de audio del navegador.
4. Brújula emocional al crear el primer proyecto: «¿Qué quieres lograr con este proyecto?», objetivo libre, selección de Libertad, Paz, Orgullo, Creatividad, Abundancia, Conexión, Confianza o Alegría, y botón «¡Comenzar mi ruta!». Persistir dentro de `projects.config` sin sobrescribir otras claves; mostrar la emoción como badge. El modal no debe reaparecer tras guardar y recargar.
5. Modo Pro como logro visual gratuito cuando las cuatro áreas tengan tareas y estén completas. Botón destacado y transición fade/scale a estadísticas. Cards con números animados, actividad semanal real y badge dorado. Mantener estadísticas básicas accesibles antes del desbloqueo; no inventar métricas ni capacidades avanzadas.
6. Feedback: hover y presión de botones, transiciones suaves, toast de éxito arriba a la derecha y skeletons. Mostrar éxito únicamente después de guardar; conservar errores y cambios pendientes.
7. Sidebar oscura con gradiente slate, iconos activos coloreados, hover y contador real de tareas pendientes del proyecto seleccionado.
8. Móvil por debajo de 768 px: cuatro áreas apiladas, navegación hamburguesa o inferior, Pomodoro compacto, tipografía legible y controles táctiles amplios.

## Restricciones y aceptación

- Tailwind 3 y Vite 4; compatibilidad Node 18/20. Verificar configuración real antes de modificar dependencias: en la inspección inicial no aparece Tailwind en package.json ni un archivo de configuración.
- Sin nuevas bibliotecas de animación: usar CSS y utilidades de Tailwind.
- Contraste mínimo 4.5:1, foco visible, teclado y `prefers-reduced-motion`. Las superficies brillantes pueden necesitar texto oscuro para cumplir contraste.
- Probar 360, 768 y 1440 px, creación del primer proyecto, recarga del onboarding, guardado fallido, transición Pro, tareas reabiertas y fin del Pomodoro.
- TypeScript y build de producción correctos. Conservar toda la suite existente: actualmente son 71 pruebas, aunque la solicitud menciona 32.
- El commit de la entrega terminada será: `feat: transformación visual completa con colores, animaciones, gamificación y onboarding emocional (Paso 2 UX)`.

## Pendientes conservados del Paso 1

Aplicar y verificar SQL 21 en Supabase real, desplegar/verificar la función integrations con cuenta autorizada, validar publicación → eventos → métricas, aislamiento remoto entre cuentas, errores de red, rendimiento en móvil y versión desplegada en Hostinger. La implementación visual del Paso 2 no cierra estos pendientes.

## Orden de implementación

Sistema visual y navegación responsive → progreso y feedback → Pomodoro → config y brújula emocional → celebración Pro y estadísticas → regresión funcional y revisión de los tres tamaños → commit y validación del despliegue.

## Implementación actual · 3 de octubre

Implementados en el worktree: Tailwind 3.4.17 sin preflight para preservar editores, gradientes y contraste, progreso porcentual y check dorado, Pomodoro circular con duración global/sonido/celebración, brújula del primer proyecto en config con comparación de versión del JSON, emoción en badge, desbloqueo Pro, métricas animadas, agregado semanal real de siete días UTC, toast de guardado, sidebar con contador y menú móvil.

Verificación local: TypeScript y build Node 20/Vite 4 correctos; 76/76 pruebas. SQL aislado confirma siete días con ceros cuando no hay eventos, deduplicación y aislamiento. Se corrigió el trigger de revisión para que dos escrituras muy próximas siempre reciban revisiones diferentes.

Pendiente: revisión visual a 360/768/1440 px, guardado real de la brújula y recorrido completo autenticado. La sesión del navegador caducó; se solicitó iniciar sesión. También siguen pendientes Supabase real, conexiones autorizadas, métricas remotas, rendimiento móvil y despliegue. El SQL 21 preparado incluye ahora el agregado semanal; esta actualización todavía no está confirmada en Supabase real.

El commit final con el mensaje solicitado y el cierre del objetivo esperan estas comprobaciones. No declarar completo el Paso 2 todavía.
