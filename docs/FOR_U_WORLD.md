# Mi mundo — uso y validación

Estado: implementación y recorrido QA principal disponibles localmente. **Rendimiento físico comprobado; aislamiento remoto entre dos cuentas pendiente.** No desplegado en Hostinger.

## Qué puedes usar

- Desde un proyecto: Tablero / Mi mundo. Cada isla representa un proyecto guardado. Sus cuatro espacios leen las mismas tareas y progreso; no requieren landing ni plan de pago.
- Abrir un espacio muestra tres pasos destacados, detalle y herramientas. Avanzar no marca tareas automáticamente. Descansar permite acariciar, compartir snack y buscar tres objetos sin cronómetro.
- Planta inicial; flores por primera búsqueda; estrella por primera tarea completada. Reabrir/eliminar tareas o repetir búsquedas no agrega premios. Los saldos históricos permanecen intactos; este recorrido no utiliza monedas.
- Guardar muestra tareas y decoración por separado. Ante fallo parcial, conserva pendientes y reintenta lo que falta. Conflicto bloquea escritura hasta recuperación explícita; copia antes los cambios que quieras conservar. Ninguna recuperación escribe automáticamente en la nube.
- Propósito y emoción en Configuración → Mi brújula. Omitir no inventa respuestas ni bloquea herramientas. Modo Pro reconoce cuatro áreas completas guardadas; no activa suscripción, cuotas de nube ni métricas avanzadas.
- Pomodoro por cuenta y navegador/dispositivo, persistente al navegar y recargar; controles compartidos entre pestañas del mismo origen. Sonido opcional. La sesión v1 anterior queda conservada y puede recuperarse explícitamente si aún no hay una sesión propia v2. No sincroniza temporizadores entre teléfono y Mac.

## Pruebas realizadas

Solo se editaron proyectos QA:

| Proyecto | Identificador | Evidencia |
|---|---|---|
| QA Studio4U · Propuesta | `135fcc67-e2e5-4d2d-be7e-d290caf98605` | Crear tarea vinculada a propuesta, completar/guardar en mundo, editar/reabrir en tablero, recarga y decoraciones conservadas. Búsqueda repetida no vuelve a dejar el documento pendiente. |
| QA Marketing4U · Propuesta | `46d5279b-bcd6-4929-acc6-b09e616f11da` | Cambiar isla muestra sus propias tareas, sin decoración ni tarea de Studio4U. |
| QA Mi mundo · onboarding | `6566653a-0f3d-479e-9388-e1566202eaed` | Creación nueva, brújula omitida sin respuestas inventadas, tablero sin landing, tareas y decoración guardadas. |
| QA Enfoque sin página | `eaabb4e2-e8e5-4253-a18e-a7264b73c9bd` | Cuatro áreas completas guardadas → logro y resumen válido con cero actividad; reabrir una tarea → 3/4, manteniendo estrella. Propósito/emoción explícitos guardados, badge inmediato y recarga. |

- Conflicto real: A guarda título válido; B conserva su título pendiente, se bloquea y recupera A mediante confirmación interna. Los datos comerciales y publicaciones existentes no se alteran.
- Teclado: apertura de espacio, foco contenido con Tab/Shift+Tab, Escape y retorno al botón de origen; acceso a Configuración y controles de Pomodoro con Enter.
- Pomodoro: sesión de 12 segundos termina; recarga recupera completada sin repetir celebración. Otra pestaña recibe la sesión y su pausa actualiza la primera. Reiniciar también funciona si se pausó antes del primer segundo.
- Modal directo de mundo y descanso sin desbordamiento a 360, 768 y 1440 CSS px. Se corrigió dependencia de estilos que antes exigía visitar el tablero. Vista ligera voluntaria mantiene tareas/juegos y no se anuncia como fallo de WebGL.
- Transporte controlado: lectura/escritura fallidas, guardado parcial, reintento, formatos desconocidos, bloqueo compartido, cambios remotos y respuestas de cuenta descartada. Primera tarea conserva reclamo incluso al eliminarla tras fallo de decoración. No equivale a desconectar físicamente la red.
- WebGL: sonda de contexto ausente, excepción y liberación del contexto temporal verificadas con fábrica controlada. La interfaz ligera se probó realmente; falta hardware sin WebGL para repetir el fallo físico. Movimiento reducido manual comprobado; el listener del sistema y CSS quedan implementados, sin cambiar la configuración del Mac.
- TypeScript y build Vite 4/Node20 pasan; suite frontend 147/147. No se agregaron dependencias ni se aplicó SQL.

## Rendimiento: evidencia y límites

Medición de 60 segundos en Codex In-app Browser: Chrome 155, UA macOS, viewport 1280×720, límite DPR 1.5, tres islas visibles. Resultado **30.1 FPS medios**, 0 cuadros de más de 100 ms y máximo 58 ms. Incluyó apertura de espacio y juego. Este resultado no es una medición de Safari ni del iPhone.

El medidor usa cuadros reales del renderer; registra FPS, duración, pausas, viewport, DPR efectivo y UA. No envía resultados a Supabase. Ocultar pestaña o activar movimiento reducido cancela la medición, sin presentarla como terminada. El objetivo físico es al menos 30 FPS medios.

**Prueba física aportada por la propietaria (captura IMG_7852.PNG): iPhone 16, Safari, 59.4 FPS medios durante 60.0 s, 0 cuadros >100 ms, máximo 81 ms, viewport 461×862, DPR limitado a 1.** Supera el objetivo de 30 FPS en ese dispositivo y sesión. La captura corresponde a la compilación QA de esta entrega anterior a los últimos ajustes de diagnóstico y recuperación. El UA informa `CPU iPhone OS 18_7` y `Version/26.5`; no se deduce una versión definitiva de iOS sin consultar Ajustes. No representa otros móviles.

Para repetir la medición tras nuevos cambios:

1. Mantener Mac y teléfono en el mismo Wi-Fi. La vista previa temporal usa puerto 4174; la dirección local actual se comunicó en el chat. No es Hostinger y puede cambiar al reconectar Wi-Fi.
2. Abrir `/dashboard/world?project=135fcc67-e2e5-4d2d-be7e-d290caf98605` e iniciar sesión personalmente si lo pide.
3. Desactivar Vista ligera y Reducir movimiento para esta medición. Abrir «Comprobar rendimiento de este dispositivo» → «Medir 60 segundos».
4. Permanecer en Safari: mirar la isla, cambiar entre los dos proyectos QA y abrir/cerrar un espacio. Copiar resultado completo y versión de iOS. Después probar Vista ligera y reducir movimiento libremente.

Para la vista previa LAN, las nuevas tareas y el timer usan UUID v4 con Web Crypto incluso sin `randomUUID`; nunca Math.random. [Diferencia documentada entre randomUUID y getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues). HTTPS sigue siendo el destino de producción; cámara y otras herramientas pueden exigirlo. Esta entrega no modifica sus requisitos ni prueba todas las herramientas sobre HTTP local.

Pendientes antes de declarar cierre completo: segunda cuenta remota autorizada y cualquier ajuste revelado por esas pruebas. Hostinger requiere una entrega posterior y verificación de su versión. Mercado Pago, correo/proveedores externos, cuotas de almacenamiento y Meta mantienen sus bloqueos anteriores.

## Dirección visual incorporada — 15 de octubre

Referencias 15.png–20.png: perlado #F4F0EA, lavanda #EDE7F7, violeta #7751B8, mint #A9E8D7, dorado #D9B46B y carbón #24232A; Inter, superficies limpias, jerarquía y menos gradientes decorativos. Aplicación acotada al contenedor privado y mundo; no se cambia la identidad de páginas publicadas. La claridad de navegación toma la referencia Google sin copiar su marca. Se conserva el logotipo existente: falta el original iridiscente independiente, no se extrae ni recrea de baja resolución. La propuesta adicional de Canva sigue pendiente de recepción. El texto de café y coworking pertenece a Studio4U, no a toda la aplicación.

La referencia React posterior se utiliza solo como dirección visual: tarjetas Material, iconos y pulsación sutil con CSS. No se incorporan sus nombres de módulos, nivel ficticio, burbujas aleatorias ni Framer Motion. El selector hace visible la isla activa y la barra lateral permite acceder a todos sus enlaces sin comprimir Crear proyecto.

Verificación final del diseño: 360/768/1440 CSS px sin desbordamiento del documento; modal 340 px en viewport 360. Crear proyecto mide 46 px de alto y la isla activa queda visible en su selector. TypeScript y build final pasan (Vite 4, Node20); 147/147 pruebas con el ejecutor tsx configurado. Capturas: world-brand-final.jpg y dashboard-brand-final.jpg en /tmp/foru-delivery1.
