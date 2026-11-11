# Objetivo 3 — Contratos y navegación compartidos

Implementación local iniciada el 21 octubre 2026 tras aprobación explícita: «Sí, apruebo la base; continúa». No implica aprobación de todas las pantallas ni autorización para publicar o migrar negocios.

## Propiedad y versiones

| Registro | Propiedad / almacenamiento | Lectura y edición |
| --- | --- | --- |
| Preferencias personales, Hoy y Continuar | Cuenta autenticada; documento existente `module-workspace-focus`, consultado por user_id. Conserva su proyecto de anclaje técnico existente; no deriva preferencias de datos comerciales. | Lee v1/v2 sin convertir; edición explícita escribe v3 con preferencias v1 y destinos por proyecto. No se crean tablas ni se traslada el anclaje silenciosamente. |
| Respuestas históricas | Proyecto; `module-project-journey` v1 | Parser y campos originales conservados. No se sobrescribe con el diagnóstico nuevo ni se copian respuestas automáticamente. |
| Diagnóstico | Proyecto; `module-project-diagnostic` v2 | Respuestas de negocio, rubro y cursor; rechaza nombre personal/trato como respuestas del proyecto. Seis rutas reconocidas. Lectura compatible de formato Journey v1 al solicitarla; conversión solo mediante edición explícita. |
| Ruta | Proyecto; `module-project-route` v1 | Etapa, revisión del diagnóstico, IDs y motivos. No copia tareas ni marca finalizaciones. |
| Propuesta y catálogo | Proyecto; `module-proposal` v1 y repositorios existentes | Se reutiliza parseProposal, referencias nativas e IDs históricos. No cambia publicaciones ni precios. |
| Oferta específica | Proyecto; `module-specific-offers` v1 | UUID, beneficio, condiciones, referencia y revisión de fuente, pageId independiente. No almacena otro precio. La UI especializada pertenece al objetivo 8. |
| Campañas | Proyecto; `module-campaigns` v1 | UUID, intención, oferta referenciada, periodo opcional y IDs de piezas. No copia contenido ni activa anuncios. |
| Perfil/piezas | Proyecto; `module-social-profile` v1/v2 | Lee v1 intacto; edición estructural explícita escribe v2. Conserva títulos, guiones, ficheros y UUID. v2 añade orden por IDs; piezas pueden referenciar campaña, fuente, materiales, video y portada. |
| Materiales | Cuenta + proyecto; `module-materials` v1 | Registro de referencias privadas, no bytes/base64 ni URLs firmadas persistidas. Cada ruta debe comenzar con cuenta/proyecto correspondientes. |
| Tareas / mundo | Repositorios AreaDocuments existentes | Fuente única en las cuatro vistas, UUID y logros históricos conservados. No se migró ni completó ninguna tarea por navegar. |
| Calendario | Agenda existente y referencias de tareas/piezas | ProjectCalendar recibe tareas originales y resuelve piezas del perfil del proyecto. Pulsar la pieza abre su origen. El acceso histórico /dashboard/tools/calendar redirige al mismo calendario. |

El anclaje técnico del enfoque a un proyecto ya existía: si ese proyecto no está accesible el guardado muestra error, conserva pendientes y no crea una segunda copia. Eliminar/migrar ese anclaje requerirá una reparación independiente; esta entrega no oculta esa limitación ni hace SQL automático.

## Navegación

`workspace/navigation.ts` es la lista permitida de destinos y parámetros. No acepta URLs externas, projectId dentro de los parámetros guardados, rutas públicas o claves arbitrarias. Al reanudar agrega exclusivamente el UUID del proyecto de destino. Si cambia el rubro, un destino de módulo incompatible vuelve al mapa en vez de abrir otro módulo.

WorkspaceShell muestra Mapa/Kanban/Calendario/Mi mundo y Mi página/Creator Studio/Mi operación/Resultados/Configuración. Volver a mi mapa conserva proyecto. Cambiar proyecto restaura su destino o su mapa; no reutiliza el pathname ni IDs de pieza del negocio anterior. Ubicaciones transitorias de creación/setup no se guardan como Continuar. Restaurar/cargar un documento no genera una conversión por sí mismo.

La preferencia local de vista está separada por cuenta y proyecto, ignora valores desconocidos y reacciona al cambio de identidad. No importa preferencias antiguas sin cuenta. UUID, aliases y URLs públicas no se modificaron.

## Guardado

`PrivateDocumentController` pertenece a una sola combinación cuenta/proyecto/tipo. Mantiene cambios durante guardado/recuperación, bloquea escrituras simultáneas y conserva borradores ante errores. No acepta formatos desconocidos como documentos vacíos. La recuperación que compite con otra edición se rechaza explícitamente.

`writeRevisionDocument` conserva comparación de revisión y protección ante inserciones duplicadas. Toolkit reutiliza esa misma frontera en vez de mantener otra consulta de escritura. Reintentar una revisión vieja no sobrescribe un cambio ajeno.

`saveDocumentGroup` informa resultado por documento; no pretende ser una transacción. `useProjectStructure` expone documentos/revisiones, respuestas históricas separadas, validación de referencias y guardado de miembros pendientes. Después de un parcial los exitosos dejan de estar pendientes y el reintento no los vuelve a escribir. Un resultado parcial no se puede presentar como página publicada ni conjunto completo. Su UI guiada se conectará en los objetivos correspondientes; este objetivo entrega los contratos compartidos.

## Verificación

La evidencia y pendientes deben registrarse en FOR_U_OBJECTIVE_03_AUDIT.md. No confundir pruebas de transporte controlado con Supabase remoto, validación visual con compilación o aprobación de base con producto terminado.
