🎮 Master Blueprint: FOR U — "Emprende Como Jugando"
La Magia de NotebookLM + El Poder Visual de Canva + La Simplicidad de CapCut

Filosofía Clave: "Emprender no tiene que ser aburrido ni pesado. Es un juego creativo donde tus ideas se transforman en tu negocio real sin que te des cuenta."

1. El Concepto Revolucionario: "Tu Negocio como NotebookLM"

En NotebookLM, tú subes tus notas o PDFs y el sistema automáticamente:

Entiende todo tu contenido.
Te crea resúmenes, guías de estudio o podcasts con 1 clic.

En FOR U aplicamos esa misma magia al emprendimiento:

La "Fuente Viva" (Tus Fuentes):
Lo que la clienta escribe en su Landing (su historia, sus productos, sus precios, cómo empezó, sus clientes felices).
El "Studio Generator" (La Magia automática):
El sistema analiza esa fuente viva y le dice:

"¡Veo que tu historia con tu abuela es hermosa! ¿La convertimos en un Reel?" "Tienes 3 alfajores estrella: ¿creamos un carrusel de catálogo?"

El Botón Mágico: [Convertir en Video] / [Crear Imagen con Gemini]:
Todo conectado. Cero hojas en blanco.
2. Sal y Pimienta: El Creador de Imágenes Gemini (Imagen 3)

Si la clienta no tiene fotos profesionales o le faltan imágenes estéticas:

Botón: "✨ Crear foto mágica con Gemini":
Lee los datos de la sección (ej. "Alfajor artesanal de chocolate belga con lluvia de coco").
Genera automáticamente un prompt hiper-enfocado: "Professional commercial product photography, artisan chocolate alfajor, warm cafe ambient, soft natural light, high-end food magazine style, 4k".
Le muestra 2 o 3 opciones para elegir.
Ella da clic en "Usar en mi web" o "Usar en mi video" y ¡listo!
3. Las 4 Plantillas de Video (Los 4 Momentos de Venta)

Inspiradas en Canva, pero automatizadas:

[ Fuente en Landing ]
       │
       ▼
[ Botón: Convertir en Video ]
       │
       ├── 1. 📖 Plantilla HISTORIA (Atracción / Storytelling)
       │      Foto de fondo con zoom sutil + Texto emotivo sincronizado + Logo
       │
       ├── 2. 🛍️ Plantilla PRODUCTO ESTRELLA (Interés / Showcase)
       │      Fotos dinámicas del producto + Precio destacado + Badge "El más pedido"
       │
       ├── 3. ⚡ Plantilla OFERTA FLASH (Decisión / Promo)
       │      Animación de impacto + Descuento o beneficio + CTA a WhatsApp
       │
       └── 4. ⭐ Plantilla TESTIMONIO (Confianza / Social Proof)
              Placa elegante con reseña de cliente + 5 estrellas + Prueba social
4. El Flujo de Juego ("Emprende como Jugando")
Jugar a Escribir: Llena su historia como si le contara a una amiga.
Jugar a Diseñar: La web se auto-completa. Si le falta una foto, Gemini la crea.
Jugar a Crear: Toca un botón y su historia se convierte en un Reel listo para TikTok/Instagram con música y texto animado.
Vender sin sufrir: Ya tiene presencia digital completa en una sola tarde.
5. El Flujo de Navegación Definitivo (Sin Rebotes ni Mapas Mentales)

Regla de Oro: "El botón 'Atrás' siempre te lleva a un lugar predecible (Tu Ruta o Tu Home), nunca a un mapa mental ni a sub-vistas intermedias."

[ HOME PRINCIPAL: Lanzador ]
       │
       ▼ (Al elegir o abrir un proyecto)
[ RUTA DIGITAL: Paso a Paso (view=start) ]
  ├── Paso 1: Esencia & Oferta
  ├── Paso 2: Tu Web / Menú ───► [ Editor de Página ] ──(Atrás)──► [ Vuelve a la Ruta ]
  ├── Paso 3: Tu Contenido ────► [ Creator Studio ]  ──(Atrás)──► [ Vuelve a la Ruta ]
  └── Paso 4: Tu Video ────────► [ Editor CapCut ]   ──(Atrás)──► [ Vuelve a la Ruta ]
Cambios Concretos de Navegación para Codex:

En frontend/src/pages/dashboard/WorkspaceShell.tsx (Línea 113):

Problema: El link de retorno dice {sourcePage ? '← Mi página' : '← Mapa'} y manda a view=map.
Solución: Cambiarlo a:
tsx
<Link to={sourcePage || (project ? `/dashboard?project=${project.id}&view=start` : '/dashboard')}>
  {sourcePage ? '← Mi página' : '← Mi Ruta'}
</Link>
Efecto: Al salir del Editor de Video o Creator Studio, la clienta vuelve directo a su Ruta Digital, nunca al mapa mental.

En las vistas de Proyecto:

La vista por defecto de un proyecto siempre debe ser view=start (la lista clara de pasos numerados).
El mapa mental interactivo (view=map) se traslada a "Opciones avanzadas" o se apaga, para no marear a la usuaria.
6. Arquitectura Técnica para Continuar en Codex (Roadmap de Ejecución)

Si estás abriendo Codex ahora mismo, este es el orden exacto de tareas listas para ejecutar:

📌 Tarea 1: Arreglar el Botón "Atrás" Unificado (15 min)
Archivo: frontend/src/pages/dashboard/WorkspaceShell.tsx
Cambiar el link de salida en workspace-focus-bar para que apunte siempre a &view=start (Tu Ruta Digital).
📌 Tarea 2: Conectar el Receptor de Plantillas en VideoEditor.tsx (30 min)
Ya dejamos listo el selector de las 4 plantillas en StudioCanvas.tsx (VideoTemplateSelector.tsx).
Ahora en frontend/src/toolkit/VideoEditor.tsx:
Leer el parámetro const template = params.get('template');
Si viene template='story', pre-configurar subtítulos y estilo editorial automáticamente sin pedir video desde cero.
📌 Tarea 3: Desplegar a Hostinger
Recuerda siempre: en tu terminal, antes de subir a Hostinger:
bash
cd frontend
npm run build
git add dist/
git commit -m "build: update dist for hostinger"
git push origin main
(Hostinger lee la carpeta dist/ compilada, no el código fuente .tsx directamente).
1. El Diagnóstico Crudo del Problema Actual
Lo que tiene FOR U hoy	Por qué confunde	Cómo debe ser (Nuevo FOR U)
Metáforas mezcladas	Mezcla gamificación (islas, monedas), meditación (estados de energía) y herramientas técnicas en una misma ensalada.	Orientado a resultados tangibles: "¿Qué quieres lograr hoy?" con lenguaje directo y profesional.
Herramientas secuestradas	El editor de video, el editor de web y el teleprompter están enterrados bajo 8 pasos de onboarding y proyectos guardados.	Acceso inmediato: Entras y puedes editar un video o armar tu web desde el minuto 1 sin bloqueos.
Sobrecarga cognitiva	Demasiados paneles, sub-menús, cards flotantes y textos largos compitiendo por atención.	Foco secuencial (1 sola tarea a la vez): Como Canva, Shopify o CapCut.
2. El Viaje del Usuario Paso a Paso (User Journey)

El objetivo final de una usuaria en FOR U es: "Tener mi presencia y estrategia digital lista para vender".
Este camino se divide en 4 Fases Claras y Consecutivas:

🟢 FASE 1: Momento 1 — Entrada & Claridad Inmediata (0 a 3 minutos)
Objetivo:

Que la usuaria sienta alivio instantáneo, no confusión.

Pantalla de Bienvenida / Landing:

Cero jerga de "dopamina" o "islas".
Encabezado claro: "Lanza la estrategia digital de tu negocio sin volverte loca."
Dos botones principales de acción inmediata:
🚀 "Empezar mi estrategia guiada" (flujo paso a paso).
🛠️ "Ir directo a herramientas" (Editor de Video | Editor Web).

Diagnóstico Rápido (3 preguntas, no 8 estaciones):

Pregunta 1: ¿Cuál es tu rubro? (Comida/Restaurante, Moda/Tienda, Servicios/Cursos, Turismo/Hospedaje, Marca Personal).
Pregunta 2: ¿Qué vendes principalmente? (Nombre de producto o servicio estrella).
Pregunta 3: ¿Qué te falta urgente hoy? (Mi Web / Mis Videos / Ordenar mis ideas / Todo).

Resultado de la Fase 1: El sistema genera automáticamente su "Kit de Marca" preliminar (colores recomendados, textos base y estructura sugerida).

🌐 FASE 2: Tu Web / Menú / Catálogo (Día 1)
Objetivo:

Tener un enlace público real listo para compartir en Instagram / WhatsApp.

Editor Web WYSIWYG (Lo que ves es lo que es):
Vista dividida o enfocada en móvil (el 90% de sus clientes lo verán en teléfono).
Secciones pre-armadas en bloques drag & drop:
Cabecera con foto y propuesta de valor.
Catálogo / Menú con precios y botón de WhatsApp o pago.
Horarios, ubicación y preguntas frecuentes.
Botón de Publicación con 1 Clic:
Genera automáticamente: foru.bio/tunegocio o link de restaurante/tienda.
Código QR descargable listo para imprimir o compartir.
🎬 FASE 3: Fábrica de Contenido & Video CapCut-Style (Día 2)
Objetivo:

Crear los primeros 3 a 5 reels/TikToks promocionando su negocio sin miedo a la cámara.

Guiones con IA (Teleprompter integrado):
Basado en lo que cargó en la Fase 1 y 2, la IA le sugiere 3 ideas con gancho:
Video 1: "¿Por qué creé este negocio?" (Historia).
Video 2: "El error que comete la gente al comprar X" (Educativo).
Video 3: "Mostrando cómo preparamos tu pedido" (Detrás de escena).
Editor de Video Simplificado (Móvil & Desktop):
Cargar Video: Admite videos de iPhone (.mov, HEVC) y Android sin trabas.
3 Botones Clave (Inferior estilo CapCut):
✂️ Cortar / Silencios: Quita pausas muertas en 1 toque.
✦ Subtítulos IA: Transcripción automática con estilo moderno en tendencia.
🏷️ Logo / Marca: Pega el logo de su negocio en la esquina.
Exportar: Descarga directa en MP4 lista para Instagram Reels / TikTok.
📈 FASE 4: Estrategia de Lanzamiento & Operación Diaria (Día 3 en adelante)
Objetivo:

Mantener el negocio activo sin burnout ni frustración.

El Tablero "Qué hago hoy" (Daily Focus):
En lugar de 20 gráficos complejos, solo 3 micro-acciones por día:
Acción 1: Publicar el video editado con el copy sugerido.
Acción 2: Revisar pedidos o mensajes de clientes.
Acción 3: Ajustar una foto en la web.
Centro de Control Unificado:
Accesible siempre en la barra lateral con nombres normales:
🌐 Mi Web / Catálogo
🎬 Editor de Video
📝 Guiones y Copys
📦 Pedidos / Compras
📊 Visitas y Clics
3. Arquitectura de Información Limpia (Sitemap Propuesto)

Para que nunca más te pierdas ni se pierda una usuaria:

FOR U
├── / (Home / Inicio claro con accesos directos)
├── /editor-web (Editor de página / menú / catálogo)
├── /editor-video (Editor de video con bottom-sheet CapCut)
├── /dashboard (Panel del negocio)
│   ├── /dashboard/hoy (3 micro-tareas del día)
│   ├── /dashboard/contenido (Guiones e ideas de posts)
│   ├── /dashboard/pedidos (Seguimiento de compras/reservas)
│   └── /dashboard/ajustes (Cuenta y marca)
└── /s/:slug (Web pública del negocio)
4. Plan de Acción y Roadmap de Implementación (Listo para Codex)

Si vas a continuar este trabajo en Codex o en tus siguientes sesiones, este es el orden exacto de tareas técnicas:

Paso 1: Limpieza del Header & Navegación Global
Archivo: frontend/src/pages/dashboard/WorkspaceShell.tsx
Cambio: Agregar botones directos permanentes en el sidebar y barra superior:
[🎬 Editor de Video] apuntando a /dashboard/tools/video
[🌐 Mi Web] apuntando a /dashboard/tools/landing
Eliminar los bloqueos que impiden hacer clic en las herramientas si no hay proyecto activo.
Paso 2: Crear la pantalla Hub "/herramientas" (Quick Start)
Crear una vista simple estilo tarjeta:
Tarjeta 1: Editor de Video Express (Subir video -> Subtitular -> Exportar).
Tarjeta 2: Editor de Tienda / Web (Elegir diseño -> Cargar productos -> Publicar).
Tarjeta 3: Generador de Guiones con IA (Elegir tema -> Grabar con Teleprompter).
Paso 3: Pulir el Editor de Video Móvil (Refinamiento final)
Aprovechar los estilos CapCut #111113 que acabamos de subir.
Garantizar que el botón de Cerrar Sheet (swipe down o botón x) regrese a la vista completa del video fluidamente.
Paso 4: Rediseñar la Home / Landing
Archivo: frontend/src/pages/LandingPage.tsx
Reemplazar textos abstractos por promesas tangibles ("Tu web + tus videos en 1 solo lugar").
