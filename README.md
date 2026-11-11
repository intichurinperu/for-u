# For U

> **Plan vigente (21 octubre 2026):** [especificación maestra](docs/FOR_U_MASTER_SPEC.md), [ejecución de los 16 objetivos](docs/FOR_U_EXECUTION.md), [matriz de aceptación](docs/FOR_U_REQUIREMENTS.csv) e [inspección de la base](docs/FOR_U_BASELINE.md). La guía de uso inferior refleja etapas anteriores y no es prueba de la nueva experiencia. Compatibilidad acordada: Node18/20, Vite4 y Tailwind3. No ejecutar todas las migraciones históricas por seguir esta guía: cada reparación requiere diagnóstico del entorno y prueba aislada. El objetivo1 es documental; no autoriza cambios remotos ni despliegues.

Aplicación React, Vite y TypeScript con una sesión Supabase, proyectos por rubro y herramientas compartidas.

## Ejecutar en desarrollo

Requiere Node.js 22 o posterior. Desde la carpeta del repositorio:

```sh
cd frontend
npm ci
npm run dev
```

Configura `frontend/.env` usando `frontend/.env.example`. La autenticación y los módulos usan `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (o `VITE_SUPABASE_PUBLISHABLE_KEY`) del mismo proyecto Supabase.

El backend debe tener las migraciones existentes de `supabase/migrations/`, en orden. Los módulos utilizan `projects`, sus campos de rubro de la migración 10, `toolkit_documents` y el bucket privado `user-uploads` de la migración 11. El código nuevo no crea una segunda sesión ni requiere otro proyecto Supabase.

## Usar los módulos

1. Inicia sesión en `/login` y abre `/dashboard`. La entrada muestra «Hoy», con una sola tarea. Abre **Mis proyectos** en el menú para administrar tus negocios (`/dashboard?view=projects`).
2. Pulsa **Crear nuevo proyecto**, escribe su nombre y elige Restaurante, Tienda, Hospedaje, Turismo o Cursos. Se mantienen los límites del plan existente.
3. Abre una tarjeta o una isla para entrar en su módulo. Cada dirección incluye `?project=ID`, por lo que dos negocios del mismo rubro conservan datos independientes.
4. Edita el negocio y pulsa **Guardar cambios**. Si falla la conexión, el borrador sigue en pantalla: reintenta antes de salir. Si otra ventana cambió el documento, el guardado detecta el conflicto.
5. Desde cualquier módulo, abre **Crear Contenido**. Selecciona un proyecto, el propósito de la publicación y una plantilla, o elige **Crear desde cero**.
6. Personaliza título, subtítulo, texto, colores, formato e imagen. Guarda el contenido, copia el texto o descarga la imagen PNG.

| Módulo | Administración | Editor |
| --- | --- | --- |
| Restaurante | `/modules/restaurant` | `/modules/restaurant/editor` |
| Tienda | `/modules/ecommerce` | `/modules/ecommerce/editor` |
| Hospedaje | `/modules/hospitality` | `/modules/hospitality/editor` |
| Turismo | `/modules/tourism` | `/modules/tourism/editor` |
| Cursos | `/modules/courses` | `/modules/courses/editor` |

El creador compartido está en `/content-creator`. `/workspace` conserva la Ruta Digital, las herramientas, monedas y rachas. El estudio previo se abre desde `/dashboard?view=studio`; su acceso anterior permanece en `/studio/dashboard`.

## Funciones de administración implementadas

- **Restaurante:** carta y secciones, ingredientes, recetas, cálculo de preparación y descuento de stock con validación.
- **Tienda:** catálogo, cantidades, carrito y pedidos pendientes; cancelar repone stock. Registrar un pedido no cobra una tarjeta.
- **Hospedaje:** habitaciones, calendario, reservas sin solapamiento, huéspedes, limpieza y movimientos de dinero. Una reserva no se cuenta como ingreso hasta registrar el cobro.
- **Turismo:** experiencias, itinerarios, guías, mapas, salidas por fecha y control de plazas y horarios.
- **Cursos:** estructura por módulos/lecciones, texto/video/archivo/quiz, alumnos, progreso, cobros registrados y certificados SVG. La grabación utiliza el teleprompter y el editor de video existentes.
- **Imágenes:** portadas, platos, productos, habitaciones, experiencias y cursos comparten la biblioteca privada del proyecto. Permite subir/arrastrar imágenes, elegirlas o usar un enlace externo; los archivos privados conservan su ruta y renuevan su enlace al mostrarse.
- **Contenido:** 31 plantillas, seis categorías por rubro, creación vacía, biblioteca privada de imágenes y borradores separados por proyecto.

## Publicar la carta del restaurante

Instala también la migración `18_module_sites.sql` en tu backend, después de las anteriores. El bucket público `site-assets` procede de la migración 16; la biblioteca original permanece privada.

En Restaurante, guarda tus cambios y abre **Publicar y compartir mi carta**. Escribe una dirección y pulsa **Publicar carta**. Se publica una copia de los platos disponibles y las secciones visibles, sin inventario ni recetas. Desde ahí puedes abrir/copiar el enlace, descargar el QR SVG, actualizar o retirar la carta. El enlace público es `/negocio/:slug` y no pide iniciar sesión.

Genera el enlace y el QR desde el dominio donde esté desplegada la app, no desde localhost. Al publicar se crean copias públicas de las imágenes elegidas. Retirar la carta oculta la página; esas copias conservan sus enlaces públicos. La migración y el despliegue remoto todavía requieren verificación en la cuenta configurada.

## Publicar experiencias y recibir reservas

Instala `19_tourism_public_bookings.sql` después de la migración 18. En Turismo, elige la zona horaria, crea las experiencias, guías y salidas, y guarda el proyecto. **Publicar y compartir mis experiencias** genera el enlace `/experiencias/:slug` y su QR.

Las plazas se consultan desde los datos guardados del módulo. Una reserva pública comprueba disponibilidad y registra al viajero en una operación de base de datos; reintentar la misma solicitud no duplica la reserva. Se utiliza el precio publicado. La confirmación no realiza un cobro: el pago se coordina con la agencia. En el panel, **Actualizar datos** recupera las reservas recibidas; cancelar y guardar libera plazas. Un borrador antiguo no puede sobrescribir una reserva nueva.

La publicación muestra el catálogo; los contactos de guías y viajeros permanecen privados. Los cambios del catálogo requieren volver a publicar. La verificación con una cuenta real y el despliegue de las migraciones siguen pendientes.

## Verificar cambios

Desde `frontend`:

```sh
npm run typecheck
npm run build
npx tsx --require ./tests/setup.cjs --test tests/restaurant-module.test.mjs tests/hospitality-module.test.mjs tests/ecommerce-module.test.mjs tests/tourism-module.test.mjs tests/courses-module.test.mjs tests/content-creator.test.mjs tests/project-media.test.mjs tests/restaurant-publication.test.mjs tests/tourism-publication.test.mjs
```

Las pruebas de dominio y de componentes locales no sustituyen una prueba con cuenta real: comprueba creación de proyectos, guardado, recarga, cambio de cuenta y subida de imágenes en el backend configurado.

## Estado de la integración

La integración completa todavía está en desarrollo. La publicación de Restaurante y Turismo tiene implementación y pruebas locales. Quedan pendientes su verificación remota, publicación de los otros módulos, checkout/pasarela, reservas públicas de hospedaje, algunos recursos multimedia y la verificación autenticada de extremo a extremo. No se ha configurado ni probado un cobro real.

El detalle de avances, pruebas y pendientes está en [docs/MODULE_INTEGRATION.md](docs/MODULE_INTEGRATION.md). Los HTML recibidos se conservan en [referencias](referencias); Tienda y Turismo se construyeron a partir del objetivo, porque los adjuntos incluyen dos variantes de Restaurante y dos de Hospedaje.
