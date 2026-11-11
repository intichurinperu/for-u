# Entrega pendiente: áreas, editor y agentes

Solicitud vigente del 5 octubre: conservar el alcance anterior y reducir llamadas repetidas para cuidar el uso semanal.

1. Áreas en modal accesible con progreso, tareas completas/pendientes y acceso al proceso desde cada tarea. El chat será una opción, no reemplazará las tareas.
2. Editor amplio: barra superior con dispositivo/historial/guardado/publicación, secciones plegables, configuración bajo botón y controles contextuales, vista móvil real de 360px, indicador de destino de arrastre.
3. Agentes: integrar AgentChat, personalidades, conversación guiada e IA mediante toolkit-ai (claves solo servidor); usar el proyecto y nombre reales; persistencia aislada por usuario y proyecto; errores y reintento explícitos. No presentar respuestas locales como IA.
4. Comprobar duplicados CSS por su contenido antes de eliminar reglas; las líneas del adjunto no son autoritativas.
5. Verificación conjunta TypeScript/build/pruebas y QA de interacciones. Commit de archivos propios y push a main solo tras verificaciones.

Hallazgos: agentConversations.ts no existe; AgentChat tiene temporizadores y botones sin acción; las asignaciones de mascotas del nuevo archivo difieren del tablero. La migración propuesta en el adjunto carece de RLS: no desplegarla así. Revisar el esquema UUID y los servicios de documentos existentes antes de elegir almacenamiento.

No está implementado ni validado el conjunto por el solo hecho de registrar este alcance.
