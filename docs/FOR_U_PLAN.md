# FOR U: proyectos con propósito, rutas por rubro y páginas conectadas

> **Aviso de precedencia — 21 octubre 2026:** este archivo conserva el plan y la evidencia históricos. La definición vigente está en [FOR_U_MASTER_SPEC.md](FOR_U_MASTER_SPEC.md), su [matriz](FOR_U_REQUIREMENTS.csv) y el [registro de los 16 objetivos](FOR_U_EXECUTION.md). Las instrucciones antiguas contradictorias no autorizan implementación, SQL ni despliegues. El objetivo activo es documental; la maqueta del objetivo2 requiere aprobación antes de extender cambios a la aplicación.

## Plan vigente — aprobado el 13 de octubre de 2026

Este plan sustituye las decisiones contradictorias del historial conservado abajo. Se ejecuta **una entrega por instrucción**; la instrucción vigente autoriza cerrar Mi mundo y la experiencia visual/emocional, sin desplegar ni empezar otras integraciones. Mercado Pago conserva su bloqueo externo. Pedidos internos y perfil opcional de cliente ya tienen recorrido QA; la entrega 2 incorporó publicación. No se declara terminado el objetivo completo mientras queden entregas pendientes.

FOR U organiza proyectos con identidad propia. El rubro principal orienta preguntas, herramientas y pasos, sin limitar tipos de oferta; las páginas podrán mostrar ofertas publicadas de otros proyectos mediante widgets autorizados.

- Studio4U: café, alfajores y captación presencial con asesoría gratuita de 15 minutos en el Valle Sagrado.
- Marketing4U: servicios de marketing a distancia, con su propia propuesta y página.
- Ironic: entrenamiento y asesorías; posteriormente productos educativos.
- Finca Intiquilla: presentación del lugar y sus espacios, incluyendo Studio4U.
- Puy: proyectos especializados de escalada, hospedaje o experiencias que pueden presentarse juntos.

Decisiones sustituidas: el inicio general muestra proyectos y prioridades, sin exigir landing; Creator Studio es el espacio creativo dentro del proyecto; las áreas abren tareas y herramientas, no el agente; el rubro no impide mostrar widgets de otras ofertas. Los widgets mostrarán la última **publicación** fuente, nunca su borrador.

## Entregas y aceptación

1. **Mi espacio de trabajo y enfoque:** proyectos con estado y continuar; Hoy con hasta tres referencias a tareas existentes de cualquier proyecto; cuatro áreas en modal; gestión antes de crear página; protección de borradores y errores. Aceptación: crear tarea, elegirla para Hoy, abrir herramienta, cambiar proyecto y recargar sin perder datos ni afirmar guardados fallidos.
2. **Mi propuesta y una página lista para publicar:** tres pasos (qué ofrezco y para quién, mis ofertas, mensaje y contacto); productos, servicios y paquetes combinables sin repetir ni cambiar el rubro. Catálogos originales con referencias y ofertas complementarias privadas, precio fijo confirmado, cotización o gratis explícito. Preparación selectiva del borrador, revisión de ofertas guardadas y publicación explícita protegida por comparación del estado leído. Aceptación: QA Studio4U y QA Marketing4U desde propuesta hasta URL pública, sin modificar negocios reales.
**Publicación incluida en la entrega 2:** plantilla editable y catálogo completo (fotos, descripciones, precios, presentaciones y extras), historial, móvil y publicación; cambios de propuesta señalan revisión sin sobrescribir ediciones. Aceptación: recorrido completo hasta URL pública. **Primer hito utilizable: entregas 1–3 desplegadas y verificadas en Hostinger.**
3. **Mi perfil y piezas (antes entrega 4; publicación ya incorporada en entrega 2):** foto, nombre, bio, enlace, destacados y tres publicaciones principales antes de contenido orgánico; piezas con objetivo, texto, diseño, guion, tomas, archivos, fecha y estado; creador, biblioteca, calendario y teleprompter conectados. No afirmar cambios en Instagram sin integración.
4. **Widgets entre proyectos:** seleccionar fuente y secciones propias o compartidas autorizadas, ordenar y publicar; actualización desde última publicación; revocación con estado discreto y aviso; sin ciclos ni widgets anidados; autorización y campos públicos validados en servidor.
5. **Gestión fiable:** Calendario persistente con recuperación explícita, reservas UUID y cupos transaccionales, conexiones verificadas por cuenta y métricas reales por proyecto. Diagnóstico remoto antes de reparaciones. No cerrar correo, proveedor externo o aislamiento remoto sin evidencia. Estado al 14 de octubre: implementación y recorridos QA principales verificados; pendientes externos detallados en FOR_U_DELIVERY5_ACTIVATION.md.

**Estado al 14 de octubre de 2026:** entrega 4 implementada (`004c912`) y recorrido QA remoto verificado tras activar SQL 22 y la corrección de permisos 23. QA Studio4U conserva su identidad y muestra oferta de QA Marketing4U mediante contenido con CTA y tarjeta. Guardado/recarga, publicación fuente, borrador independiente, retirada/restauración y eliminación de referencias comprobados. Lectura anónima pública válida y funciones privadas denegadas. Compartición entre dos cuentas probada en PostgreSQL aislado; falta segunda sesión para repetirla remotamente. Hostinger continúa pendiente, sin cambios a negocios reales. Evidencias en FOR_U_PROGRESS.md.

Pedidos/clientes implementados: cálculo desde catálogo publicado, mesa/recojo/delivery, invitado, seguimiento privado, favoritos e historial. Se conservan sus límites y los pendientes externos de entrega 5.

### Integración vigente — Mercado Pago

Únicamente Mercado Pago: PEN/Perú, cuenta autorizada explícitamente por proyecto, coordinación/opcional/obligatorio, OAuth con credenciales cifradas en servidor y producción desactivada. Reutilizar pedidos de restaurante; añadir compras comerciales para ofertas publicadas sin otro pedido transaccional. Un carrito pertenece a un negocio; widgets dirigen al proyecto fuente. Cotizaciones versionadas requieren aceptación vigente; hospedaje/experiencias/cursos no confirman fechas, cupos o acceso automáticamente.

Calcular precios en servidor, conservar instantáneas, un intento activo y clave/cuerpo idempotentes; ante resultado incierto consultar antes de reintentar. Confirmar solo tras consulta a Mercado Pago con vendedor, app, referencia, importe, PEN y entorno válidos. Notificación firmada; retorno no equivale a pago. Pago y ejecución separados, bloqueo de ejecución obligatoria sin aprobación (excepto gratuito); cancelación no implica devolución. Devoluciones desde Mercado Pago; mantener histórico al desconectar.

Estado: código base preservado en `04e0c70`, SQL 27/28 y función desplegados con autorización QA. Compras/cotización/seguimiento y permisos principales comprobados en Supabase real; proveedor externo **pendiente** de aplicación, secretos, vendedor/comprador de prueba y origen HTTPS. Guía exacta: FOR_U_MERCADO_PAGO.md. No se han conectado cuentas financieras ni cobrado dinero. Cuotas de nube y publicación Meta no se empiezan en esta entrega. Mundo, mascotas, onboarding, Pomodoro y Pro siguen en el objetivo posterior. Los agentes acompañan sin reemplazar resultados guardados.

## Datos y protecciones

### Cierre vigente — Mi mundo y experiencia FOR U

- Tablero y Mi mundo gratuitos, con proyectos, tareas y progreso comunes; sin bloqueos por landing, onboarding o logro. Identidad dorado/rosa/violeta/cyan y herramientas existentes conservadas.
- Una isla por proyecto guardado; barco y cámara controlados; cuatro espacios y mascotas con Avanzar/Descansar. Modal accesible, tres pendientes, búsqueda libre, caricias/snack y tres decoraciones por área; sin nuevas monedas ni premios duplicados.
- Tareas y mundo mantienen revisiones independientes, estado por documento y recuperación explícita de conflictos. Guardado parcial conserva pendientes. Reclamos de primera tarea viajan con las tareas para sobrevivir a error de decoración, reapertura o eliminación; sin convertir marcas manuales antiguas en premios.
- Propósito/emoción explícitos, omisión y edición desde Configuración; preservar JSONB ajeno a la brújula. Pomodoro global por cuenta/dispositivo, controles entre pestañas, reloj por vencimiento y celebración única. Temporizador antiguo conservado para recuperación explícita.
- Modo Pro es un logro calculado desde las cuatro áreas completas guardadas: estadísticas reales, sin cambiar suscripción ni almacenamiento. Retirar activación comercial simulada y exclusividad de Mi mundo en la presentación de planes; no implementar cuotas ni contratación.
- Carga 3D diferida, tres islas visibles, DPR limitado, pausa al ocultar, reducción de movimiento y alternativa ligera con reintento. Antes de desplegar: recorridos QA, 360/768/1440, teclado, errores/conflictos, TypeScript/build/pruebas y medición física de 60 segundos en iPhone 16/Safari. Segunda cuenta remota y prueba física no se declaran verificadas sin evidencia. Guía/evidencias en FOR_U_WORLD.md y FOR_U_PROGRESS.md.

Conservar UUID, URLs, publicaciones, catálogos, tareas, nodos antiguos y borradores. Formatos nuevos versionados, sin conversión automática ni plantillas que sobrescriban documentos antiguos. Separar borrador/publicación y cuenta/proyecto; mantener revisiones y conflictos entre pestañas. Comparar SQL con esquema remoto antes de aplicar cambios; no ejecutar migraciones antiguas basadas en IDs de texto.

Datos previstos: propuesta vinculada a identificadores del catálogo; preferencias de enfoque por usuario (referencias a tareas y último trabajo); perfil social y piezas con referencias a archivos/guiones; ofertas de servicios compatibles dentro del rubro existente, sin nuevo selector obligatorio; bloque de referencia a secciones y lectura pública validada en servidor. Reutilizar toolkit_documents privado donde permisos/esquema lo permitan.

Mantener Vite 4, Tailwind 3 y Node 18/20. Por entrega: persistencia, cuentas/proyectos, red/reintento/conflicto, conservación de datos, 360/768/1440 px, TypeScript, build, pruebas relevantes, commit revisable y registro. Distinguir implementación, verificación local y despliegue. Sol Medio para interfaz; Sol Alto para persistencia/permisos/publicación; revisión Astra solo ante problema concreto.

---

## Historial anterior (decisiones contradictorias sustituidas por el plan vigente)

# FOR U: Creator Studio creativo y contextual

## Experiencia principal

Creator Studio será el inicio del proyecto. Reemplazaremos el selector «landing / menú / curso» por una **ruta visual de creación**, con tarjetas ilustradas, muestras del contenido y una acción principal: **Continuar mi creación**.

Ejemplo para tu negocio de alfajores:

1. **Dale personalidad:** nombre, propósito, colores y portada.
2. **Presenta tus alfajores:** productos, fotos, descripciones y precios.
3. **Hazlo tuyo:** editar y previsualizar tu página.
4. **Compártelo:** revisar, publicar y copiar el enlace.

Cada paso mostrará su estado real: pendiente, en proceso o listo. Podrás volver a cualquier paso; no será un asistente rígido.

El lenguaje y los contenidos cambiarán según el rubro ya guardado: productos, habitaciones, experiencias o cursos. Cambiar de proyecto actualizará todo el contexto.

## Diseño y herramientas

- Inicio cálido, colorido y creativo: vista previa del proyecto, mascota guía y una sugerencia breve, sin párrafos extensos ni todas las herramientas abiertas.
- Cada paso incluirá contenido inicial editable y propuestas contextualizadas. No inventaremos precios, testimonios ni resultados.
- Plantillas, creador visual, IA y teleprompter aparecerán donde ayuden a completar el paso, conservando proyecto y sección.
- Las herramientas seguirán accesibles desde un acceso secundario «Herramientas creativas».
- Editor con barra superior compacta, panel de bloques plegable, controles contextuales, escritorio amplio y móvil de 360 px.
- Navegación común, Pomodoro persistente, ayudas breves y estados claros de guardado, carga y error.

## Gestión, publicación y pedidos

Se conserva el resto del plan acordado:

- Tablero de cuatro áreas disponible después de guardar el primer borrador válido; Creator Studio permanece como inicio.
- Áreas en modales con tareas y progreso compartidos con Mi mundo.
- Calendario, conexiones, estadísticas, agentes y mascotas integrados, sin considerar terminados los pendientes por abrir sus pantallas.
- Publicación vinculada a los datos reales del negocio, preservando los cinco rubros y las URLs existentes.
- Restaurante con catálogo real, variantes, extras, carrito y pedidos para mesa, recojo y delivery gestionado por el negocio.
- Seguimiento real, compra como invitado y perfil opcional con favoritos e historial.
- Mercado Pago como primera integración prevista, con cobros a la cuenta de cada negocio y verificación en servidor.

## Datos y reglas de progreso

- El rubro guardado en el proyecto determinará los pasos y las herramientas: no habrá una segunda elección de tipo de negocio.
- Los pasos de creación usarán el contenido y estado de guardado/publicación existentes para indicar avance. Abrir una herramienta no contará como completar un paso.
- Las tareas manuales de las cuatro áreas conservarán su propio estado; no se completarán automáticamente por recorrer el Studio.
- Mantendremos UUID, Supabase, recuperación de borradores y control de conflictos.
- Las ampliaciones de catálogo, pedidos, perfiles y pagos serán aditivas, con permisos por negocio y cliente, y credenciales exclusivamente en servidor.
- Se mantienen Tailwind 3, Vite 4 y Node 18/20, sin añadir librerías de animación.

## Entrega y validación

Orden: **Studio contextual y editor → publicación y catálogo → pedidos y perfiles → pagos → integración de gestión y mundo**.

La primera revisión mostrará tu proyecto de alfajores con su ruta creativa y el editor amplio, sin selector redundante de formatos.

Verificaremos:

- Pasos y etiquetas correctos para los cinco rubros.
- Continuar desde el avance guardado y cambiar de proyecto sin mezclar contenido.
- Crear, editar, guardar, recargar y publicar.
- Pedidos, pagos, seguimiento y aislamiento entre cuentas.
- Calendario, métricas, conexiones y sincronización Tablero/Mundo.
- Accesibilidad y pantallas de 360, 768 y 1440 px.
- TypeScript, build y pruebas funcionales, con commits revisables y comprobación posterior en Hostinger.
- /goal Implementar y verificar el plan completo de FOR U acordado en esta conversación, incluyendo sus correcciones posteriores. No limitar la entrega al último cambio visual.

  Antes de editar:
  1. Consolida los requisitos vigentes en docs/FOR\_U\_PLAN.md.
  2. Crea docs/FOR\_U\_PROGRESS.md con cada requisito, su estado (pendiente, en curso, verificado o bloqueado), evidencia y siguiente acción.
  3. Contrasta el código existente para aprovechar lo que funciona y no repetir trabajo. Las decisiones más recientes prevalecen sobre las anteriores.
  Decisiones obligatorias:
  - Creator Studio es el inicio creativo dentro del proyecto; el rubro ya está elegido. No mostrar otro selector de landing/menú/curso.
  - Mostrar una ruta visual contextual, contenido inicial editable y herramientas por sección.
  - El tablero de cuatro áreas aparece después de guardar el primer borrador válido.
  - Completar el editor amplio, navegación común, publicación real, pedidos, perfiles opcionales, pagos, agentes y los pendientes de Calendario, conexiones, métricas, tareas y Mi mundo descritos en el plan.
  - Conservar datos, UUID, funcionalidades existentes y compatibilidad con Vite 4, Tailwind 3 y Node 18/20.
  Trabaja por entregas completas en el orden acordado y continúa con la siguiente sin pedirme “continúa”. No reduzcas ni elimines requisitos silenciosamente. Si una integración necesita credenciales o intervención mía, registra el bloqueo exacto y avanza con el trabajo independiente.

  No marques algo como verificado solamente porque abre la pantalla o pasa el build. Comprueba sus acciones, datos guardados, recarga, errores y permisos. Revisa la interfaz en 360, 768 y 1440 px y ejecuta TypeScript, build y pruebas pertinentes.

  Mantén el registro actualizado para retomar sin repetir análisis. Optimiza consumo con búsquedas dirigidas, reutilización y comprobaciones proporcionales; evita relecturas y pruebas repetidas sin motivo.

  Prepara commits revisables. Distingue siempre implementación local, validación local y verificación del despliegue. No declares cumplido el objetivo mientras existan requisitos pendientes o bloqueados.

  Empieza por Creator Studio contextual y el editor amplio, mostrando el resultado real de esa primera entrega, y después continúa con las demás.

## Contrato de implementación (2026-10-07)
- Prevalece Creator Studio contextual como inicio. Los cinco rubros no se vuelven a elegir dentro del proyecto.
- Mantener las URLs públicas y los UUID existentes; reparar el esquema solamente tras compararlo con producción.
- Pedidos: precios calculados en servidor, estados de pago separados de preparación, webhooks idempotentes y seguimiento privado. Mercado Pago por negocio; delivery gestionado por cada negocio.
- Mundo: carga diferida, cuatro áreas, mascotas con avanzar/descansar, caricias/snack/búsqueda y decoraciones sin penalizaciones; progreso compartido y sin duplicar premios.
- Calendario: CRUD persistente por proyecto, horario local, semana/mes y exportación; recordatorios internos requieren app abierta.
- Conexiones: distinguir consulta fallida, desconectada, verificada y vencida; reintentos y permisos reales.
- Métricas: visita/clic público hasta resumen privado; cero válido distinto de error; clic no equivale a venta.
- Comprobar contraste, teclado, movimiento reducido, recuperación de borradores y conflictos entre pestañas.

## Actualización visual vigente — 10 de octubre
Sidebar blanca, cabecera translúcida con breadcrumbs y selector de proyecto, contenido gris #F4F4F5. Unificar con tokens FOR U: dorado #fbbf24, rosa #f472b6, violeta #a78bfa y cyan #22d3ee; texto #0A0A0A y secundario #6B6B6B. Reutilizar magic-card y botones pill. Reducir iconografía decorativa y acciones principales; conservar navegación, proyecto, guardado y datos. Esta actualización sustituye la sidebar oscura anterior, no cancela reservas, pedidos, pagos ni verificaciones pendientes.

## Instrucción vigente — experiencia completa e IA eficiente (15 de octubre)

La entrega actual unifica el sistema de controles y simplifica los recorridos, incluyendo registro, herramientas y publicación versionada; conserva funciones y datos. La primera muestra fue rechazada por demasiado neutra y por no simplificar suficiente. Se priorizan revelado progresivo, una acción principal y estética FOR U futurista/elegante/jugable. No se considera visualmente aprobada aún. Alcance y activación segura de Gemini sin gasto nuevo en FOR_U_EXPERIENCE.md. Páginas reales solo cambian tras previsualizar y republicar; no se despliega Hostinger en esta entrega.

## Dirección aprobada — 15 de octubre de 2026

La instrucción vigente es «Tu negocio toma forma: ideas, mapa, creación y publicación», incluida la composición determinista de piezas desde cada sección de la landing. Su implementación y límites se siguen en FOR_U_CREATIVE_EXPERIENCE.md. La carita da ayuda local y captura ideas; Gemini se invoca explícitamente para clasificar y para operaciones creativas estructuradas. Imágenes generativas desactivadas, sin gasto nuevo. Conservar todas las entregas previas y su evidencia; no marcar cerrado el plan por una muestra de interfaz.


## 20 octubre 2026 — Editor como centro creativo (en ejecución)

Plan aprobado: A editor directo y controles contextuales → B creación guiada y propuesta visual → C captura de texto/fotos/audio e interpretación explícita → D composiciones conectadas a landing → E extensión y verificación integrada. Sustituye el orden previo que comenzaba por formularios. La página es la superficie de trabajo; controles secundarios bajo selección. Se conserva todo el estado y la publicación solo cambia con Publicar. INTI CHURIN es referencia de interacción, de solo lectura.

Primer hito: oferta manual → foto → landing editable → guardar → recargar, independiente de Gemini. Pruebas QA, Node20/Vite4/Tailwind3, 360/768/1440 y prueba física iPhone16/Safari por separado. No incluye publicar negocios reales, Hostinger o facturación. Gemini real/audio y accesos externos permanecen pendientes hasta evidencia. Este apartado registra trabajo iniciado, no cierre ni aprobación visual.
