# Continuar FOR U en AntiGravity

Abre la carpeta `/Users/nicoleiriartegomez/Documents/FOR U` como workspace. Esta guía vive dentro del proyecto. Si trabajas en otra máquina o en un clon nuevo, lleva también los cambios locales y las referencias indicados abajo.

## Mensaje para pegar en AntiGravity

```text
Continúa el desarrollo de FOR U en el workspace actual. Lee completo docs/CONTINUAR-FOR-U-EN-ANTIGRAVITY.md y abre las referencias visuales que enlaza.

Empieza revisando git status para conservar el trabajo local. Mis proyectos, Mi ruta digital y Mi isla con 24 vistas por rubro ya tienen una implementación. Verifica el estado de esas vistas sin rehacerlas.

Implementa el bloque 04, Creator Studio. La referencia principal es docs/design-reference/2026-11-08/03-creator-studio/01-ofertas-y-entrada-al-studio.png. Desde «Cómo vender tu oferta» deja elegir una o varias ofertas reales. «Empezar a crear» abre el Studio del mismo proyecto con esa selección visible y editable. Dentro del Studio deben convivir «Mi página», «Publicaciones» y «Videos», con acceso a los editores y borradores existentes. Mantén el proyecto, la pieza y el punto de partida al abrir una herramienta y volver.

Conserva el estilo FOR U, reutiliza PearlButton y los datos y editores actuales. Valida el recorrido con datos de prueba en compu y celular y muéstrame capturas de la implementación. El bloque 05, editor de video, viene después de revisar el 04.
```

## Estado del proyecto al entregar

- **01 · Proyectos.** La portada Mis proyectos muestra tarjetas, búsqueda y «Nuevo proyecto». La creación empieza por nombre y rubro, luego abre el cuestionario. «Abrir proyecto» lleva a Mi ruta digital del proyecto elegido. Hay una corrección local para esperar la carga de la cuenta antes de decidir si corresponde el asistente de primer proyecto.
- **02 · Mi ruta digital.** El flujo tiene tres etapas: «Cuéntame sobre tu proyecto», «Define tu oferta y tus precios» y «Cómo vender tu oferta». El cuestionario y el catálogo ya existen. La segunda etapa abre ofertas y precios, con un formulario breve para añadir oferta. La tercera actualmente enlaza directo al Studio con `tab=create`. Ese enlace es el punto de entrada que debe incorporar la selección del bloque 04.
- **03 · Mi isla.** El mapa tiene cuatro islas clicables, con el nombre en cada isla. Las 24 vistas de área cruzan Marketing, Finanzas, Logística y Operaciones con restaurante, hospedaje, turismo, clases y cursos, tienda y servicios. Marketing y Finanzas pueden mostrar ofertas guardadas. Operaciones muestra tareas guardadas y abre el asistente. Las acciones se enlazan a las herramientas existentes de cada rubro y conservan el proyecto y el origen para volver.
- **04 · Creator Studio.** Hay un Studio funcional con creación, campañas, perfil, biblioteca, lienzo y conexión con editores. La entrega pendiente es la entrada por ofertas y la integración visible de las tres áreas de creación en el mismo Studio. Marketing ya puede entrar al Studio y abrir el flujo de campaña con `tab=campaigns&start=campaign`.
- **05 · Editor de video.** Ya hay plantillas, teleprompter y editor. Su nueva distribución está en referencia y sigue pendiente de implementación.

La rama local era `main`, con `2003674` como último commit visible al preparar la guía. Hay código, ilustraciones, referencias y capturas locales, incluidos archivos nuevos sin seguimiento. Usa la misma carpeta para tener todo disponible. Un clon del último commit puede carecer de parte de lo que se hizo aquí. Confirma el estado con `git status --short` y `git log -1 --oneline` antes de editar.

## Qué implementar ahora en Creator Studio

1. **Entrada desde Mi ruta digital.** Abre «Cómo vender tu oferta» con la composición de la mitad izquierda de la referencia. Carga las ofertas del proyecto desde la propuesta y el catálogo que ya usa el Studio. Muestra título, lista con casillas, conteo de seleccionadas y un botón principal «Empezar a crear». La persona puede elegir una o varias, especialmente para una promoción. Usa los nombres, imágenes y precios que realmente estén guardados. Si el proyecto aún está vacío, ofrece «Definir oferta» hacia el flujo existente y conserva la posibilidad de crear una idea libre cuando corresponda.
2. **Abrir el Studio con contexto.** La mitad derecha de la referencia muestra el encabezado «Creator Studio» y las ofertas elegidas como fichas que se pueden quitar. Mantén esas ofertas al cambiar entre «Mi página», «Publicaciones» y «Videos», al abrir una pieza y al volver. Usa las referencias estables de origen que ya maneja el Studio. Valida que todas pertenezcan al mismo proyecto, conserva los formatos anteriores de datos y contempla una oferta eliminada o modificada. La selección es contexto para trabajar y nunca debe cambiar por sí sola la propuesta, el catálogo o la página publicada.
3. **Mi página.** Muestra el estado de la página o su borrador y una entrada clara «Abrir el editor» al constructor actual. Reutiliza los bloques, vistas previas y estado de publicación existentes. Cuando se regrese desde otra herramienta, recupera la sección y la vista compu o celular cuando ese contexto exista.
4. **Publicaciones.** Da prioridad a «Tu próxima pieza» y «Mis diseños». Abre el borrador real desde su tarjeta y conserva la idea, las fotos, el texto y el formato. Para una pieza nueva conserva la entrada por texto, **un solo control para grabar audio** y un control para añadir imágenes. «Abrir editor manualmente» abre el lienzo real, con texto, archivos y formatos que cambian de verdad la proporción, incluidos 1:1, 4:5 y 9:16.
5. **Videos.** Haz accesibles las opciones existentes de elegir plantilla, grabar con teleprompter y subir video. Si se llega desde un diseño, «Crear esta idea en video» conserva el contexto y permite «Volver a mi diseño» al mismo borrador. En este bloque se conectan las entradas. La distribución nueva del editor y los ajustes visuales de plantillas y teleprompter se revisan en el bloque de video.
6. **Campañas y biblioteca.** Conserva su funcionamiento y los enlaces que ya usan Marketing, los perfiles y los borradores. Los accesos secundarios viven dentro del Studio. El modelo actual de campañas admite una oferta vinculada. Si la selección de varias ofertas va a guardarse en una campaña, revisa expresamente su modelo, validación y compatibilidad antes de cambiar la persistencia. Comprueba que una selección múltiple no termine reducida en silencio a la primera oferta.

Rutas útiles que ya existen:

- `/dashboard?project=<id>&view=start` abre Mi ruta digital.
- `/dashboard?project=<id>&view=island&area=marketing` abre Marketing del proyecto.
- `/creator-studio?project=<id>&tab=create`, `tab=campaigns`, `tab=profile` y `tab=library` son entradas actuales.
- `/dashboard/tools/proposal?project=<id>&section=offers` abre ofertas y precios.
- `/dashboard/tools/landing?project=<id>`, `/dashboard/tools/video?project=<id>` y `/dashboard/tools/teleprompter?project=<id>` son herramientas actuales.

## Archivos de trabajo

| Tema | Punto de partida |
| --- | --- |
| Proyectos, ruta y navegación del workspace | `frontend/src/pages/dashboard/UnifiedDashboard.tsx`, `WorkspaceHome.tsx`, `ProjectStart.tsx`, `WorkspaceShell.tsx` en esa misma carpeta, y `frontend/src/workspace/navigation.ts` |
| Islas y acciones por rubro | `frontend/src/pages/dashboard/ProjectIsland.tsx`, `ProjectIslandArea.tsx`, `islandAreaContent.ts` y `projectIsland.css` en esa misma carpeta. Ilustraciones en `frontend/public/brand/island-areas/` |
| Creator Studio y sus fuentes | `frontend/src/pages/dashboard/CreatorStudio.tsx`, `frontend/src/studio/StudioComposer.tsx`, `StudioCanvas.tsx`, `CampaignStudio.tsx`, `StudioLibrary.tsx`, `model.ts` y `navigation.ts` en `frontend/src/studio/` |
| Datos de propuesta y proyecto | `frontend/src/proposal/model.ts`, `frontend/src/proposal/ProposalEditor.tsx`, `frontend/src/experience/usePrivateDocument.ts`, `frontend/src/services/moduleDocuments.ts` y `frontend/src/toolkit/ToolkitContext.tsx` |
| Landing, audio y video | `frontend/src/toolkit/LandingBuilder.tsx`, `VideoEditor.tsx`, `videoWorkspace.css`, `VideoTemplateSelector.tsx` y `Teleprompter.tsx` en `frontend/src/toolkit/`, más `frontend/src/experience/AudioCapture.tsx` |
| Botón y marca | `frontend/src/components/ui/PearlButton.tsx`, `frontend/src/components/ui/pearlButton.css` y `frontend/public/brand/foru-logo.png` |

## Referencias y decisiones visuales

- [Índice de diseño del 8 de noviembre](design-reference/2026-11-08/LEEME.md). Aquí están las 20 láminas originales, sus estados y las versiones anteriores.
- [Lámina principal de Creator Studio](design-reference/2026-11-08/03-creator-studio/01-ofertas-y-entrada-al-studio.png). Define la selección de ofertas y la llegada al Studio.
- [Lámina correcta del editor de video en compu y celular](design-reference/2026-11-08/03-creator-studio/02-editor-de-video-computadora-y-celular.png). Consultarla al abrir el bloque 05.
- [Referencias elegidas para la identidad](design-reference/LEEME.md), [capturas de la ruta y la isla](evidence/2026-11-08/ruta-e-isla/) y [48 capturas de las áreas por rubro](evidence/2026-11-08/areas-por-rubro/LEEME.md).

FOR U es futurista, luminoso y fácil de leer. Usa el logo original con la U erguida, fondos claros, ilustraciones propias de cada área y reflejos pastel en bordes y acentos. Reserva el acabado nacarado para la acción principal o el estado seleccionado. Los controles secundarios pueden ser sobrios con un detalle de color al interactuar. Evita fucsia fuerte, dominantes verdes, texto subrayado tipo enlace y desplegables con flechas que parezcan controles provisionales. La navegación debe poder escanearse rápido, con poco texto y una acción principal visible, también en celular.

Reutiliza las ilustraciones y el código que ya se aprobaron. Los brownies, el café y Casa Bruma de las láminas son ejemplos. La app usa el contenido del proyecto. Si necesitas proponer una pantalla nueva o apartarte de la referencia, muestra primero la imagen en compu y celular para revisión. La usuaria aprueba los cambios visuales antes de pasar esa propuesta a código.

## Verificación y entrega

- La app está en `frontend/` y usa React, TypeScript, Vite y Supabase. Desde esa carpeta están disponibles `npm run dev`, `npm run typecheck`, `npm test` y `npm run build`. Usa `frontend/.env.example` para saber qué variables necesita el entorno y conserva la configuración local existente. Mantén los valores de configuración fuera del chat y de los commits.
- Las 382 pruebas automatizadas pasaron en el bloque de islas. Las 24 vistas se renderizaron en Chrome en compu y celular con datos de prueba y se comprobaron sus enlaces. La compilación completa y el chequeo de tipos de ese bloque seguían en curso al preparar este contexto. Confirma ambos en tu entorno antes de dar el nuevo bloque por verificado.
- Prueba una oferta, varias ofertas, un proyecto sin ofertas, una oferta que dejó de existir y un borrador anterior. Comprueba que cambiar de proyecto no mezcla ofertas ni piezas y que abrir, guardar, volver y retomar funcionan. Repite el recorrido desde Mi ruta digital y desde Marketing con datos de prueba.
- Valida compu y celular, adjunta capturas de la app y registra en el índice qué se implementó, qué se probó y qué queda pendiente. Deja identificadas las rutas de retorno y cualquier decisión sobre compatibilidad.

## Orden posterior al bloque 04

**05 · Editor de video.** La lámina del bloque muestra un video vertical grande en 9:16, reproducción y pantalla completa justo debajo y una línea de tiempo visible con pistas separadas de video y subtítulos. En compu el panel lateral cambia según la herramienta o el bloque elegido. En celular se abre al tocar la herramienta. Revisa el límite de tamaño en `VideoEditor.tsx` y los estilos de `videoWorkspace.css`. El teleprompter debe enseñar primero la vista de grabación, con el guion editable y la velocidad a mano. Las entradas de plantilla, teleprompter y video subido deben poder volver a la pieza de origen.

**Pendientes de negocio.** Siguen por definir e implementar el costeo por porción, la merma y las promociones con varias ofertas. Hoy el restaurante tiene precios, recetas e inventario en sus herramientas existentes. Los módulos de otros rubros tienen sus propios registros. Cualquier dato nuevo que una lámina sugiera, como costo de limpieza, recursos, comisiones o mantenimiento, debe verificarse contra el modelo de ese rubro antes de presentarlo como guardado o calculado.
