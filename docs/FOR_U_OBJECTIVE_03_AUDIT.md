# Objetivo 3 — Inspección previa a implementación

21 octubre 2026. Inspección local sobre el estado posterior a `14c0fef`. La inspección inicial no modificó aplicación ni Supabase. Inspección inicial anterior a la aprobación. Posteriormente la propietaria aprobó explícitamente la base: «Sí, apruebo la base; continúa». El objetivo 3 está en implementación; esta tabla conserva el diagnóstico anterior.

## Evidencia actual y decisiones de reutilización

| Requisito | Fuente inspeccionada | Estado / trabajo necesario |
| --- | --- | --- |
| Cuenta y proyecto separados | `frontend/src/services/moduleDocuments.ts`, `frontend/src/experience/journeyModel.ts` | Documentos por cuenta/proyecto ya existen; Journey v1 no admite las nuevas preferencias personales. Definir contrato de cuenta separado, no introducir campos nuevos en v1 ni usar cuenta anclada a otro negocio por inferencia. |
| Contratos versionados | `journeyModel.ts`, `frontend/src/pages/dashboard/workspaceFocusModel.ts` | Journey solo lee v1; Focus lee v1/v2 y convierte al editar explícitamente. Reutilizar esta política para diagnóstico, ruta, propuesta, oferta, campaña, pieza, perfil y materiales; no escribir conversiones durante lectura. |
| Cuatro vistas visibles | `frontend/src/pages/dashboard/WorkspaceShell.tsx`, `frontend/src/experience/ProjectViews.tsx` | Mapa/Kanban/Calendario existen localmente; shell global solo Tablero/Mundo. Llevar los cuatro destinos al marco compartido sin duplicar tareas. |
| Cinco espacios y regreso | `WorkspaceShell.tsx` | Herramientas y enlaces existentes; unificar destinos, conservar alias/URLs, añadir retorno al mapa y resolver operación por rubro. No exigir landing. |
| Continuar por proyecto | `workspaceFocusModel.ts`, `frontend/src/services/workspaceFocusRepository.ts` | Destinations v2 ya separa proyectos. Actualmente LastWork solo conserva herramienta/área/tarea, no pieza/campaña/vista. Ampliación versionada y validación de pertenencia antes de restaurar. |
| Cambio de proyecto | `WorkspaceShell.tsx` | onChange reutiliza pathname salvo rutas de módulos y descarta resto del query. Resolver destino del proyecto seleccionado; nunca arrastrar pieza/diseño del anterior ni sustituir proyecto ausente por otro. |
| Una fuente de tareas | `ProjectViews.tsx`, `ProjectCalendar.tsx` | Ambas consumen AreaDocuments y calendario recibe linkedTasks. Mantener IDs; integrar piezas por referencia, sin una segunda copia editable. |
| Preferencia de vista | `ProjectViews.tsx` | Estado local se inicializa desde localStorage por projectId, sin accountId y sin reinicialización expresa al cambiar proyecto en la misma instancia. Debe quedar acotado y actualizado por cuenta/proyecto. |
| Revisiones y conflictos | `frontend/src/services/revisionDocuments.ts`, `frontend/src/experience/usePrivateDocument.ts` | Escritura condicionada por updated_at, 23505/conflicto y recuperación explícita ya existen. Hook conserva ediciones durante guardado/carga. Falta comprobar consumidores, cierre de sesión, parciales entre documentos, duplicados de petición y respuestas tardías mediante pruebas controladas. No declarar aislamiento completo solo por leer estas funciones. |

## Aceptación que queda por demostrar tras aprobación

1. Dos proyectos con destinos y documentos distintos: navegación, vista recordada, pieza/campaña y retorno sin mezclas; proyecto no disponible no abre otro silenciosamente.
2. Guardar/recargar datos de cuenta y proyecto sin modificar documentos antiguos por leerlos. Versión desconocida no se sustituye por un documento vacío.
3. Mapa/Kanban/Calendario/Mundo y los cinco espacios funcionan sin landing, con los IDs existentes y referencias canónicas.
4. Fallo, reintento, respuesta tardía, edición durante guardado, resultado parcial y conflicto conservan cambios y permiten recuperación explícita.
5. Pruebas pertinentes, TypeScript/build, revisión de UI y evidencia separadas de la aprobación visual. No SQL/despliegue/publicación por esta inspección.

No se implementó ni se marcó completo ningún requisito del objetivo 3 en esta inspección. El siguiente paso dependiente es recibir la aprobación de la maqueta; luego modificar y verificar la aplicación sobre estas bases.

## Estado de implementación tras aprobación

Contratos y cambios locales: [FOR_U_SHARED_DATA.md](FOR_U_SHARED_DATA.md). 32 pruebas pertinentes y, posteriormente, 194 pruebas de frontend pasaron. TypeScript y build siguen en validación; no se declara completo el objetivo. La apertura de la aplicación nueva en el navegador encontró un error de acceso HTTP; no se usa la maqueta como evidencia de aplicación real. Se solicitó abrir la nueva vista con sesión para QA. Sin SQL, publicaciones, proveedores IA ni cobros.

### Seguimiento de la validación local

- La persona confirmó ingreso en la vista estable `http://127.0.0.1:4175/dashboard`. Se verificaron su lista de proyectos y el mapa de «QA Enfoque sin página» mediante la UI autenticada. No se creó un proyecto ni se publicó contenido.
- La compilación anterior terminó, pero conserva la regla CSS que oculta la navegación superior. No es evidencia de aceptación de la versión final.
- La comprobación final detectó una referencia al nombre personal fuera de su ámbito en UnifiedDashboard; se corrigió usando las preferencias del contexto de cuenta dentro de ProjectAreas.
- Las 15 pruebas finales de shared-workspace y workspace-focus pasaron; el conjunto anterior de 194 también había pasado antes de los últimos ajustes.
- Lecturas locales de dependencias fallaron con ECANCELED/ETIMEDOUT; el fallo se repitió fuera del sandbox. Se preparó una copia temporal con código y versiones bloqueadas para repetir TypeScript/build sin alterar dependencias originales. La verificación visual de la compilación final sigue pendiente.

El objetivo sigue en curso. No se ha dado por terminado el aislamiento remoto ni el rediseño de toda la aplicación.

### Cierre técnico del alcance 03

- Copia temporal con `npm ci` desde package-lock existente, sin actualizar versiones. Incluye el contrato de material compartido del servidor importado por el frontend. TypeScript terminó con código 0 y el build final con código 0 en 13,22 s. Ninguna dependencia original fue sustituida.
- UI autenticada: «QA Enfoque sin página» abrió Mapa y Kanban con sus 11/12 pasos históricos. Cambiar a «QA Tienda MVP» restauró su landing anterior y sus 0/13 pasos. Abrir Calendario en Tienda, volver al primer proyecto y recargar conservó Kanban; cambiar nuevamente a Tienda recuperó Calendario desde el documento remoto cargado tras la recarga. El calendario terminó de cargar.
- Mi mundo abrió con el UUID de Tienda y los mismos 0/13 pasos; «Volver a mi mapa» regresó al mapa de Tienda. No se completaron tareas, reclamaron logros, editaron precios ni publicaron páginas.
- Se comprobaron cuatro vistas y cinco espacios, incluido un proyecto sin página, y destinos especializados Hospedaje/Tienda. El resto de editores y rutas corresponde a objetivos posteriores.
- Anchos CSS reales 360, 768 y 1440: sin desbordamiento horizontal de la navegación. Se reparó el logo recortado por el encabezado móvil. Evidencia: `evidence/objective-03/navigation-360.png`, `navigation-768.png`, `navigation-1440.png`. Estas capturas no equivalen a prueba física de Safari/iPhone.
- Pruebas de fallo, parciales, conflicto, revisión desconocida, respuesta tardía y aislamiento: transporte controlado en shared-workspace. La prueba remota realizada aquí usa dos proyectos de una cuenta; segunda cuenta y teléfono físico siguen registrados para objetivo 15.

Se cierra el alcance técnico de datos y navegación del objetivo 03. No se cierra el rediseño visual de editores, las preguntas adaptativas, Creator Studio ni toda la aplicación. Se conserva la limitación del anclaje técnico del enfoque de cuenta descrita en FOR_U_SHARED_DATA.md. No se empieza objetivo 04 sin su instrucción.
