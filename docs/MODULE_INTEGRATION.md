# Integración de módulos For U

Objetivo: cinco módulos React funcionales, proyectos compartidos, creador de contenido con selector, plantillas por rubro y creación desde cero. El objetivo completo sigue pendiente.

## Referencias recibidas

Los cinco adjuntos se conservaron sin modificaciones en `referencias/`:

- `cursos.html`: Creator Studio.
- `hospedaje-editor.html`: editor de sitio para hospedaje.
- `hospedaje.html`: Stay U, administración de hospedaje.
- `restaurante-editor.html`: editor profesional de restaurante.
- `menu-digital.html`: menú digital, logística y contenido.

No contienen una tienda ni un sistema de turismo. Esos dos módulos se construirán según las funciones del objetivo, siguiendo la estructura visual de estas referencias. No se debe afirmar que son conversiones de HTML recibido.

## Estado comprobado

- Estructura de los cinco módulos, componentes compartidos y archivos de plantillas creada.
- Restaurante: componentes React para portada, carta, edición de platos, orden/visibilidad de seis secciones, historia, ubicación, FAQ y texto de fidelización.
- Restaurante: altas y actualización de ingredientes, recetas con ingredientes y cantidades, cálculo de lotes, bloqueo de stock insuficiente y registro de preparación sin descuento repetido.
- CSS de restaurante extraído de la referencia y limitado a `.restaurant-module`. `index.css` no se modifica.
- Rutas privadas `/modules/restaurant` y `/modules/restaurant/editor`, con `?project=ID`. Acceso desde «Más» del workspace cuando el proyecto es de gastronomía.
- Servicio compartido usa el cliente Supabase existente, tablas `projects` y `toolkit_documents` y documentos `module-restaurant`. No añade una segunda autenticación ni cambia las migraciones.
- Guardado explícito con comparación de `updated_at`: detecta cambios concurrentes en vez de sobrescribir inventario de otra ventana. Fallos de carga bloquean la edición; fallos de guardado conservan el borrador.
- Hospedaje: habitaciones y comodidades, calendario mensual por habitación, huéspedes, reservas sin solapamientos, cambios de estado, limpieza al finalizar estancia y registro explícito de ingresos/gastos por mes. Crear una reserva no inventa un cobro.
- Editor de Hospedaje: seis secciones ordenables por arrastre y por botones, visibilidad, portada, historia, contacto, FAQ, promociones y vista previa React.
- Restaurante y Hospedaje comparten `ModuleWorkspace` para cargar y guardar datos de la cuenta. Rutas privadas de Hospedaje y editor agregadas; el selector permite crear proyectos de los cinco rubros.
- Tienda: catálogo editable, stock, carrito con cantidades y precios, registro de pedidos pendientes, cancelación que repone stock una sola vez y despacho reservado para pedidos con pago confirmado. Falta checkout público y pasarela.
- Turismo: experiencias con itinerarios y punto en OpenStreetMap, guías, salidas fechadas, prevención de horarios superpuestos y reservas limitadas por plazas.
- Cursos: editor de tres paneles, módulos y lecciones de texto/video/archivo/quiz, inscripciones, progreso, registro de cobros recibidos y certificados SVG tras completar el temario. Teleprompter y editor de video existentes conectados al curso; faltan pruebas de cámara y carga de recursos.
- `/dashboard` usa la sesión Supabase y abre «Hoy» con una sola tarea. Los proyectos reales, creación por rubro e islas están en `/dashboard?view=projects`, accesible desde el menú. El estudio previo sigue disponible con `?view=studio` y en `/studio/dashboard` con su acceso anterior. Crear proyectos mantiene los límites del plan existente (Gratis: un proyecto activo; Pro: varios); verificar el recorrido de cinco proyectos con una cuenta que lo permita.
- Creador compartido en `/content-creator`: selector de proyectos, 31 plantillas que cubren las seis categorías de cada rubro, creación vacía, textos/colores/formato, guardado independiente y exportación PNG. Galería usa el bucket privado existente y URLs temporales; se guardan las rutas de los archivos, no enlaces que vencen.

## Verificación realizada

- Ocho pruebas de dominio: actualización sin duplicados, precios válidos, stock insuficiente sin mutación, descuento idempotente, ingredientes repetidos, cantidades/recetas inválidas, unidades de ingredientes y pedidos WhatsApp codificados.
- TypeScript pasa con los componentes y las rutas nuevas.
- Compilación Vite pasa sin advertencias.
- Prueba en navegador con componentes reales y datos aislados: crear y editar plato; crear ingrediente; crear receta; cuatro lotes bloqueados por falta de stock; dos lotes confirmados reducen 1 kg a 0,4 kg. Consola sin errores ni advertencias en ese recorrido.
- La prueba de componentes no demuestra guardado autenticado ni aislamiento remoto. Falta verificar esos flujos con Supabase y una sesión de prueba.
- Hospedaje: siete pruebas de fechas, solapamientos, cancelación, capacidad, mantenimiento, limpieza y finanzas mensuales pasan. En navegador: habitación creada, reserva creada, segunda reserva incompatible rechazada, ingresos permanecen en cero hasta registrar un cobro de S/ 100. Editor actualiza el nombre y reordena secciones; diseño móvil sin desbordamiento horizontal. TypeScript, lint del código nuevo y compilación pasan.
- 28 pruebas de dominio de los cinco módulos pasan; cuatro pruebas adicionales del creador comprueban categorías, personalización, creación vacía y aislamiento por proyecto.
- Cursos en navegador: crear curso, módulo y lección; inscribir alumno; certificado bloqueado al 0%, habilitado tras completar la lección y emitido al 100%. Sin errores de consola en ese recorrido.
- Creador en navegador con repositorio de prueba en memoria: cambiar de Restaurante a Tienda cambia plantillas; crear desde cero abre campos vacíos; guardar en ambos y regresar recupera únicamente el contenido del proyecto correcto; exportación PNG termina sin errores. Esto no demuestra persistencia remota.
- Se corrigieron reglas `@keyframes` de las referencias que no podían recibir un prefijo de selector. La última compilación pasa sin advertencias.

## Trabajo pendiente (no reducir el alcance)

1. Completar Restaurante: verificar subida real de imágenes, verificar remotamente la vista pública y QR, completar CTA y fidelización operativa. El creador compartido ya está conectado; la vista previa incluye el pedido WhatsApp. El texto de fidelización no es un registro de clientes.
2. Hospedaje: completar publicación, CTA y verificar los medios y el creador compartido; verificar persistencia autenticada y navegación desde proyectos. Habitaciones, calendario, reservas, limpieza, huéspedes, finanzas y editor ya tienen implementación y pruebas locales.
3. Tienda: checkout público y pago real mediante proveedor; no simular un cobro exitoso. Se preguntó al usuario por Mercado Pago/Stripe, sin respuesta aún.
4. Turismo: verificar publicación y reservas de clientes con una cuenta real; implementación y pruebas locales disponibles.
5. Cursos: recursos subidos, publicación/acceso de alumnos, pago real y prueba de cámara/teleprompter. Verificar descarga del certificado y currículos extensos.
6. Creador compartido: pruebas de subida real, recuperación remota, formatos y exportación con imágenes; verificar la galería ya conectada a los editores de los módulos.
7. Dashboard e islas: verificar creación y persistencia de cinco proyectos, navegación de todas las rutas, monedas, rachas e IA existentes. Se solicitó sesión de prueba sin pedir contraseña.
8. README incorporado; completar pruebas integradas de navegación, persistencia, aislamiento por usuario/proyecto, consola y diseño móvil; revisión de todos los criterios antes de declarar el objetivo completo.

Los cinco módulos ya contienen código, pero esto no significa que la integración esté terminada. Las referencias incluyen botones simulados y cifras de ejemplo que no deben presentarse como operaciones reales.

## Verificación adicional · continuidad

- Menú de restaurante: vista previa respeta orden y visibilidad de las seis secciones, filtra categorías y prepara un pedido WhatsApp. Dos unidades de S/ 5,50 producen total S/ 11,00 y un enlace codificado correcto. No se envió el mensaje ni se publicó el menú.
- Tienda en navegador: producto con tres unidades, pedido de dos por S/ 39,80, una unidad restante; otro pedido de dos queda bloqueado. Ventas pagadas siguen en cero.
- Turismo en navegador: experiencia, guía y salida de dos plazas; tres viajeros se rechazan, dos se confirman por S/ 100 y la salida queda agotada. No se registra cobro.
- Consolas de esos recorridos sin errores ni advertencias. TypeScript, lint de módulos/componentes compartidos, 32 pruebas y build pasan; compilación sin advertencias.
- La carga de proyectos se identifica por cuenta, rubro e intento para no mostrar datos de una carga anterior al cambiar de cuenta o reintentar.
- Formularios pendientes: los cinco módulos avisan antes de salir desde su navegación y bloquean el guardado global hasta aplicar o cancelar el formulario; también protegen el cierre de pestaña. Cursos permite cerrar explícitamente su edición. En navegador, el aviso cambia de pendiente a aplicado al guardar el curso.
- Se corrigió una regla móvil heredada del HTML de Cursos que ocultaba la estructura y hacía inaccesible crear módulos/lecciones en pantallas estrechas.

## Biblioteca de imágenes en los módulos

- Campo compartido en las portadas y formularios de platos, productos, habitaciones, experiencias y cursos. Admite enlaces externos o selección/subida desde la biblioteca privada; subida por arrastre y selector de archivos.
- Se persiste una referencia durable al archivo, no una URL temporal. La vista comprueba cuenta/proyecto y renueva los enlaces de Storage mientras permanece abierta. La galería reinicia su estado al cambiar de proyecto y no mezcla videos con imágenes.
- Tres pruebas nuevas comprueban aislamiento por propietario/proyecto, rutas inválidas y protocolos externos. Las 35 pruebas de módulos/contenido/imágenes pasan. TypeScript, lint de los componentes nuevos y build sin advertencias pasan en la copia de validación.
- Prueba visual con recursos locales: enlace muestra una imagen cargada, quitarla limpia el valor, referencia de otro proyecto se rechaza. Falta verificación de subida/recarga con la cuenta real.
- Se restauraron las dependencias temporales desde la caché local, tras fallar el acceso al registro. No se modificó package.json del proyecto. README usa npm install porque el repositorio no contiene package-lock.json.

## Publicación de Restaurante y QR

- Nueva tabla `module_sites` y RPC `module_public_site` en la migración 18; las páginas anteriores en `toolkit_sites` permanecen separadas. Propiedad por cuenta/proyecto, restricciones de tipo/versión/tamaño y revisión UUID para detectar cambios concurrentes. No se aplicó la migración a producción.
- Publicar/actualizar/retirar desde el módulo y ruta anónima `/negocio/:slug`. La copia pública incluye únicamente campos explícitos de platos disponibles y secciones visibles. Nunca incluye inventario, recetas ni preparaciones.
- Fotos privadas seleccionadas se copian al bucket público existente `site-assets`. Al retirar la página las copias públicas permanecen; la interfaz informa esta condición. No se ha probado todavía el traslado con la cuenta real.
- QR SVG generado localmente con qrcode-generator 2.0.4 y descargable. El SVG leído de la interfaz se convirtió en PNG y el lector Vision de macOS decodificó exactamente el enlace de prueba. Se advierte al usar localhost.
- 39 pruebas de dominio/contenido/medios/publicación pasan. Las 14 pruebas PostgreSQL aisladas con PGlite pasan, incluyendo permisos entre cuentas, publicación, retirada, versión obsoleta y rechazo de contenido incompatible.
- UI con repositorio local aislado: publicación bloqueada si hay cambios, publicación devuelve enlace y QR, un fallo exige revisar el estado y recupera la publicación existente. Esta prueba no publica en Supabase real.
- Se añadió package-lock.json para instalación reproducible; instalación limpia npm ci desde caché completada sin advertencias.

## Publicación y reservas de Turismo

- Catálogo público en `/experiencias/:slug`, selector de salidas/plazas, formulario de viajeros, recibo con código e importe y enlace de coordinación por WhatsApp. Publicación/retirada, fotos públicas y QR comparten los servicios de Restaurante.
- Zona horaria configurable antes de tener reservas; las fechas pasadas quedan fuera de las salidas públicas. El límite de plazas proviene de cada salida. El precio de la reserva es el publicado, aunque exista un borrador con otro precio.
- Migración 19: disponibilidad anónima sin contactos y reserva bajo bloqueo del documento operativo. Reintentos con el mismo identificador recuperan la confirmación; cancelación libera capacidad; solicitudes obsoletas y duplicadas se rechazan. La revisión del documento avanza en el servidor para impedir que un administrador sobrescriba una reserva desde un borrador antiguo.
- Botón Actualizar datos en los módulos para recuperar operaciones recibidas; pide descartar los borradores antes de reemplazarlos.
- 17 pruebas PostgreSQL aisladas pasan con todas las migraciones 11–19 instaladas desde el inicio de la prueba; incluyen RLS, precio publicado, reintento, agotamiento, cancelación y revisión obsoleta. No constituyen una prueba de carga concurrente contra Supabase real.
- UI local con respuesta perdida simulada: la reserva consume las dos plazas; el reintento recupera el mismo código y total de S/ 100 sin crear otra reserva. Consola sin errores; vista de 375 px sin desbordamiento horizontal.
- Tres pruebas nuevas de catálogo público: exclusión de contactos y tours ocultos; coordenadas/precios/zonas válidas; rechazo de documentos malformados e identificadores repetidos.
- Pendiente aplicar migraciones 18–19 y probar publicación, fotos, recepción y cancelación con la sesión real. No se efectuaron cobros ni reservas reales.
