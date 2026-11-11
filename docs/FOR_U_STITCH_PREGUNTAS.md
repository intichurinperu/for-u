# FOR U — Banco de preguntas y opciones

Extraído del constructor de guía local el 24 de octubre de 2026. Es un inventario del banco actual, no una aprobación de su redacción ni la obligación de mostrar todas las preguntas. El documento de experiencia prevalece ante contradicciones.

## Cómo debe mostrarse

Una pregunta por pantalla. Icono y explicación breve opcional; Atrás, Continuar y Omitir/Lo definiré después. Multiselección cuando las opciones sean compatibles. Las respuestas previas deciden qué preguntas aparecen; no mostrar simultáneamente preguntas de marketing, diseño y operación.

Antes de este banco hay pasos de bienvenida para nombre preferido, forma de dirigirse a la persona (opcional), nombre del proyecto y rubro. No inferir género por nombre. La preferencia de trato es de la cuenta; las respuestas del negocio pertenecen al proyecto. Texto/audio opcional y modo manual siempre accesible.

## Banco común (variantes de restaurante como base)

### 1. ¿Desde dónde empiezas?

Clave: `stage` · Área: `person` · Selección única o respuesta de este paso.

Tu camino se adapta a tu momento. Todas las herramientas siguen disponibles.

Opciones: Vengo a explorar · Estoy empezando · Ya tengo un negocio.

### 2. ¿Hace cuánto comenzó este viaje?

Clave: `age` · Área: `project` · Selección única o respuesta de este paso.

Queremos aprovechar lo que ya has vivido, sin hacerte empezar de nuevo.

Opciones: Todavía es una idea · Menos de un año · Entre uno y tres años · Más de tres años.

### 3. ¿Cómo lo están llevando?

Clave: `team` · Área: `project` · Selección única o respuesta de este paso.

No necesitas un gran equipo. Vamos a cuidar que el siguiente paso sea manejable.

Opciones: Por mi cuenta · Somos un equipo · Todavía lo estoy definiendo.

### 4. ¿Cuántas personas son?

Clave: `teamSize` · Área: `project` · Selección única o respuesta de este paso.

Solo orienta la organización. Esto no crea usuarios ni comparte información.

Opciones: Dos personas · Entre tres y cinco · Más de cinco · Lo definiré después.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 5. ¿Dónde nació tu idea?

Clave: `origin` · Área: `project` · Multiselección.

Tu origen puede ser una buena forma de conectar. Después le das tus propias palabras.

Opciones: Proyecto familiar · Iniciativa personal · Con socios · Por una necesidad · Por una oportunidad · Otra historia.

Respuesta propia opcional: Si quieres, cuenta un poco más.

### 6. ¿Qué te gustaría aportar?

Clave: `purpose` · Área: `project` · Multiselección.

Esta es tu brújula. No hace falta escribir una misión perfecta.

Opciones: Crear un lugar de encuentro · Compartir nuestra cocina · Hacer más fácil una pausa · Lo definiré después.

Respuesta propia opcional: O dilo con tus palabras.

### 7. ¿Qué horizonte te emociona?

Clave: `vision` · Área: `project` · Multiselección.

Elegimos una dirección, no una obligación. Puedes cambiarla más adelante.

Opciones: Vivir de mi proyecto · Llegar a más personas · Trabajar con más calma · Hacer crecer mi equipo · Lo definiré después.

Respuesta propia opcional: Otro horizonte.

### 8. ¿A quién te gustaría llegar?

Clave: `audience` · Área: `project` · Multiselección.

Esto ayuda a que tu página y tus contenidos hablen con claridad.

Opciones: Personas del barrio · Familias · Visitantes · Lo definiré después.

Respuesta propia opcional: Otro público, con tus palabras.

### 9. ¿Qué ofrece tu proyecto?

Clave: `offering` · Área: `project` · Multiselección.

Puedes combinar ofertas. Fotos, precios y detalles pueden venir después.

Opciones: Café y bebidas · Platos y menú · Postres · Lo definiré después.

Respuesta propia opcional: Escribe tu oferta si ya la tienes clara.

### 10. ¿Qué les gustaría resolver contigo?

Clave: `need` · Área: `project` · Multiselección.

Una oferta se entiende mejor cuando se reconoce la necesidad que atiende.

Opciones: Encontrar algo de calidad · Vivir una experiencia · Aprender o mejorar algo · Ahorrar tiempo o esfuerzo · Lo definiré después.

Respuesta propia opcional: Otra necesidad.

### 11. ¿Qué te ayudaría más en este momento?

Clave: `needs` · Área: `project` · Multiselección.

Elige lo que necesitas. Conservaremos todas tus elecciones para preparar tu ruta.

Opciones: Mostrar lo que ofrezco · Preparar contenido para darme a conocer · Organizar mis pendientes · Gestionar pedidos o reservas · Explorar antes de decidir.

### 12. ¿Por cuál empezamos?

Clave: `goal` · Área: `project` · Selección única o respuesta de este paso.

Elige una para comenzar; podrás trabajar las demás después. Ninguna herramienta queda bloqueada.

Opciones: Mostrar lo que ofrezco · Preparar contenido para darme a conocer · Organizar mis pendientes · Gestionar pedidos o reservas.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 13. ¿Ya tienes un espacio digital?

Clave: `web` · Área: `project` · Multiselección.

Lo que ya existe cuenta. Declararlo aquí no conecta ni importa tus cuentas.

Opciones: Todavía no · Tengo redes sociales · Tengo página o catálogo.

### 14. ¿Cómo van tus ventas?

Clave: `sales` · Área: `project` · Selección única o respuesta de este paso.

Solo orienta tu ruta. No decide tu nivel, tu valor ni el acceso a herramientas.

Opciones: Todavía no vendo · Vendo de vez en cuando · Vendo habitualmente · Prefiero omitirlo.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 15. ¿Qué te gustaría que las personas sientan contigo?

Clave: `brandFeeling` · Área: `brand` · Multiselección.

Elige la experiencia que quieres cuidar. No afirmamos que tus clientes ya se sienten así.

Opciones: Cercanía · Tranquilidad · Inspiración · Diversión · Confianza · Lo definiré después.

Respuesta propia opcional: Otra sensación, con tus palabras.

### 16. ¿Qué hace diferente tu forma de hacerlo?

Clave: `difference` · Área: `brand` · Multiselección.

Elige solo lo que representa a tu negocio. Esto se guarda en la diferencia de tu propuesta.

Opciones: Atención personal · Elaboración propia · Especialización · Una experiencia cuidada · Comunidad · Lo definiré después.

Respuesta propia opcional: Mi diferencia, con mis palabras.

### 17. ¿Cómo quieres que suene tu marca?

Clave: `voice` · Área: `brand` · Multiselección.

Puedes combinar estilos. Nos orientan al crear; no cambian automáticamente tus textos.

Opciones: Cálida · Directa · Divertida · Educativa · Elegante · Lo definiré después.

### 18. ¿Qué no representa a tu marca?

Clave: `brandAvoid` · Área: `brand` · Multiselección.

También importa saber qué evitar. Ninguna respuesta limita tus herramientas.

Opciones: Presionar para vender · Jerga técnica · Exagerar promesas · Humor forzado · Un tono distante · Lo definiré después.

Respuesta propia opcional: Algo más que prefiero evitar.

### 19. ¿De qué temas te gustaría hablar?

Clave: `pillars` · Área: `brand` · Multiselección.

Estos serán tus pilares de contenido. Elige hasta cinco o añade los tuyos, uno por línea. Puedes empezar con uno o dejarlos para después.

Opciones: Café y productos · Personas y comunidad · Historia y proceso · Consejos para disfrutar · Vida del espacio · Lo definiré después.

Respuesta propia opcional: Añadir mis propios temas.

Máximo actual: 5. Revisar si este límite es necesario.

### 20. Tu radar de inspiración

Clave: `inspiration` · Área: `brand` · Selección única o respuesta de este paso.

Perfiles, marcas o ideas que te gustan. Descubramos qué rescatar y qué harías a tu manera, sin copiar su identidad.

### 21. Ahora, tu manera de comunicar.

Clave: `marketingStart` · Área: `marketing` · Selección única o respuesta de este paso.

Unas pocas elecciones nos ayudan a crear contigo. También puedes dejar esta parte para después.

Opciones: Quiero prepararla ahora · Más adelante.

### 22. ¿Qué quieres conseguir con tu contenido?

Clave: `intent` · Área: `marketing` · Multiselección.

Puedes trabajar varias intenciones. El formato viene después.

Opciones: Dar a conocer · Conversar y conectar · Construir confianza · Presentar una oferta · Retomar el contacto · Fidelizar.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 23. ¿Cómo te sientes a gusto creando?

Clave: `comfort` · Área: `marketing` · Multiselección.

Puedes elegir varias formas. No necesitas aparecer frente a una cámara.

Opciones: Hablando a cámara · Usando mi voz · Escribiendo · Mostrando productos · Mostrando el proceso · Todavía no lo sé.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 24. ¿Qué prefieres evitar por ahora?

Clave: `avoid` · Área: `marketing` · Multiselección.

Vamos a empezar por una forma que se sienta posible para ti.

Opciones: Mostrar mi cara · Grabar mi voz · Editar videos · Escribir mucho · Publicar seguido · Nada en particular.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 25. ¿Con qué material cuentas?

Clave: `resources` · Área: `marketing` · Multiselección.

No hace falta subir nada ahora. Podemos crear algo cuidado incluso sin fotos.

Opciones: Ninguno todavía · Fotos · Videos · Textos · Testimonios autorizados · Publicaciones anteriores.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 26. ¿Qué herramientas ya conoces?

Clave: `tools` · Área: `marketing` · Multiselección.

Para acompañarte mejor, sin pedirte que aprendas otra aplicación antes de empezar.

Opciones: Canva · CapCut · Instagram · TikTok · Otras herramientas · Ninguna todavía.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 27. ¿Qué ritmo te viene bien?

Clave: `time` · Área: `marketing` · Selección única o respuesta de este paso.

Tu plan debe caber en tu vida. Las fechas las eliges tú.

Opciones: Sesiones breves · Un bloque semanal · Varios momentos por semana · Todavía no lo sé.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 28. ¿Dónde te gustaría una mano?

Clave: `friction` · Área: `marketing` · Multiselección.

No hay una forma correcta de crear. Elegimos una ayuda concreta para tu siguiente paso.

Opciones: No sé qué decir · Me cuesta empezar · Me da vergüenza · Me pierdo editando · No tengo material · Me cuesta organizarme.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 29. ¿En qué espacios quieres compartirlo?

Clave: `channel` · Área: `marketing` · Multiselección.

Prepararemos formatos pertinentes. Esto no conecta tus redes ni publica nada.

Opciones: Instagram · TikTok · WhatsApp · Mi página · Todavía no lo sé.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 30. ¿Cómo te gustaría darlo a conocer?

Clave: `diffusion` · Área: `marketing` · Multiselección.

Podemos empezar sin anuncios. Ninguna opción activa cobros ni publicidad.

Opciones: Contenido orgánico · Anuncios con presupuesto · Ya hago anuncios · Todavía no lo sé.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 31. ¿Quieres dejar una referencia de presupuesto?

Clave: `budget` · Área: `marketing` · Selección única o respuesta de este paso.

S/10 diarios durante siete días es solo un ejemplo editable. No garantiza resultados ni es un mínimo.

Opciones: S/10 diarios por siete días · ejemplo · Definir otra referencia · Lo definiré después.

Respuesta propia opcional: Monto y duración que quieres considerar, opcional.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 32. ¿Quieres recordatorios para crear?

Clave: `reminders` · Área: `marketing` · Selección única o respuesta de este paso.

Tú eliges. Guardamos tu preferencia. Activar avisos será una acción separada.

Opciones: Sin recordatorios · Una vez por semana · Dos veces por semana · Lo decidiré después.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 33. ¿Qué te gustaría contar en tu página?

Clave: `sections` · Área: `page` · Multiselección.

Elige las secciones que te sirven ahora. Puedes sumar otras mientras editas.

Opciones: Menú · Nuestra historia · Cómo pedir · Ubicación y horarios · Preguntas frecuentes · Contacto · Testimonios.

### 34. ¿Preparamos también otra parte de tu negocio?

Clave: `otherAreas` · Área: `other` · Multiselección.

Marketing ya tiene un punto de partida. Puedes ampliar tu ruta o seguir con lo elegido.

Opciones: Finanzas · Logística · Operaciones · Por ahora, seguir con lo elegido.

### 35. ¿Ya tienes precios definidos?

Clave: `prices` · Área: `other` · Selección única o respuesta de este paso.

Si falta un precio, no lo inventaremos. Tu catálogo puede completarse después.

Opciones: Sí · Algunos · Todavía no.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 36. ¿Sabes cuánto cuesta entregar tu oferta?

Clave: `cost` · Área: `other` · Selección única o respuesta de este paso.

Un costo incompleto merece claridad. Nunca lo convertimos en cero.

Opciones: Sí · Parcialmente · No.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 37. ¿Cómo registras ingresos y gastos?

Clave: `moneyTracking` · Área: `other` · Multiselección.

Aprovechamos tu forma actual de llevar las cuentas.

Opciones: En un cuaderno · En una hoja de cálculo · En una herramienta · Todavía no registro.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 38. ¿Cómo recibe el cliente tu oferta?

Clave: `delivery` · Área: `other` · Multiselección.

Esta elección orienta la configuración. No activa pedidos ni reservas automáticamente.

Opciones: En el local · Recojo · Delivery · Lo definiré después.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 39. ¿Qué necesitas tener más a mano?

Clave: `control` · Área: `other` · Multiselección.

Destacaremos herramientas útiles sin ocultar las demás.

Opciones: Materiales · Compras · Inventario · Horarios · Disponibilidad.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 40. ¿Qué te complica más la coordinación?

Clave: `logisticsFriction` · Área: `other` · Multiselección.

Un punto de partida es suficiente; puedes dejarlo para después.

Opciones: Faltantes · Entregas · Coordinación · Proveedores · Todavía no lo sé.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 41. ¿Por dónde llegan las solicitudes?

Clave: `requests` · Área: `other` · Multiselección.

No conectamos estas cuentas por elegirlas; solo entendemos tu recorrido.

Opciones: WhatsApp · Redes sociales · Mi página · En persona · Varios canales.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 42. ¿Cómo recuerdas lo que está pendiente?

Clave: `tracking` · Área: `other` · Multiselección.

Podemos ayudar a sacarlo de tu cabeza sin borrar tu forma de trabajar.

Opciones: Lo recuerdo · Reviso mensajes · Uso una lista · Uso un calendario · Tengo un sistema.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 43. ¿Quiénes participan en la atención o el trabajo?

Clave: `responsible` · Área: `other` · Multiselección.

Esto propone organización; no comparte datos ni añade personas a tu cuenta.

Opciones: Yo · Mi equipo · Personas externas.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

### 44. ¿Qué parte de tu atención te gustaría mejorar?

Clave: `operationGoal` · Área: `other` · Multiselección.

Elige los procesos donde necesitas ayuda. Prepararemos pasos de tu actividad, sin activar funciones automáticamente.

Opciones: Pedidos · Preparación · Compras y costos.

Condicional: solo se muestra si las respuestas anteriores lo requieren; esta extracción activó las ramas de negocio con equipo y anuncios.

## Variantes por rubro

### Restaurante

**offer**: Café y bebidas · Platos y menú · Postres · Lo definiré después.

**people**: Personas del barrio · Familias · Visitantes · Lo definiré después.

**purpose**: Crear un lugar de encuentro · Compartir nuestra cocina · Hacer más fácil una pausa.

**sections**: Menú · Nuestra historia · Cómo pedir · Ubicación y horarios · Preguntas frecuentes · Contacto · Testimonios.

**delivery**: En el local · Recojo · Delivery · Lo definiré después.

### Tienda

**offer**: Productos hechos por mí · Productos seleccionados · Un paquete de productos · Lo definiré después.

**people**: Personas que valoran el diseño · Una comunidad específica · Clientes que ya me conocen · Lo definiré después.

**purpose**: Hacer algo útil · Compartir lo que creamos · Resolver una necesidad cotidiana.

**sections**: Productos · Nuestra historia · Cómo comprar · Envíos y cambios · Preguntas frecuentes · Contacto · Testimonios.

**delivery**: En tienda · Recojo · Envío · Lo definiré después.

**¿Qué te gustaría aportar?** (`purpose`): Hacer algo útil · Compartir lo que creamos · Resolver una necesidad cotidiana · Lo definiré después.

**¿A quién te gustaría llegar?** (`audience`): Personas que valoran el diseño · Una comunidad específica · Clientes que ya me conocen · Lo definiré después.

**¿Qué ofrece tu proyecto?** (`offering`): Productos hechos por mí · Productos seleccionados · Un paquete de productos · Lo definiré después.

**¿De qué temas te gustaría hablar?** (`pillars`): Productos y usos · Cómo lo hacemos · Personas y comunidad · Consejos de cuidado · Historia de la marca · Lo definiré después.

**¿Qué te gustaría contar en tu página?** (`sections`): Productos · Nuestra historia · Cómo comprar · Envíos y cambios · Preguntas frecuentes · Contacto · Testimonios.

**¿Cómo recibe el cliente tu oferta?** (`delivery`): En tienda · Recojo · Envío · Lo definiré después.

**¿Qué parte de tu atención te gustaría mejorar?** (`operationGoal`): Solicitudes · Reservas o entregas · Seguimiento.

### Turismo

**offer**: Una experiencia guiada · Una ruta de aventura · Una experiencia cultural · Lo definiré después.

**people**: Viajeros independientes · Familias · Grupos pequeños · Lo definiré después.

**purpose**: Conectar personas y lugares · Compartir la cultura local · Crear experiencias cuidadas.

**sections**: Experiencias · Itinerario · Qué incluye · Condiciones y reservas · Nuestra historia · Contacto · Preguntas frecuentes.

**delivery**: Salida programada · Experiencia privada · Consulta previa · Lo definiré después.

**¿Qué te gustaría aportar?** (`purpose`): Conectar personas y lugares · Compartir la cultura local · Crear experiencias cuidadas · Lo definiré después.

**¿A quién te gustaría llegar?** (`audience`): Viajeros independientes · Familias · Grupos pequeños · Lo definiré después.

**¿Qué ofrece tu proyecto?** (`offering`): Una experiencia guiada · Una ruta de aventura · Una experiencia cultural · Lo definiré después.

**¿De qué temas te gustaría hablar?** (`pillars`): Lugares y cultura · Experiencias y recorridos · Personas del viaje · Consejos para viajar · Historia del proyecto · Lo definiré después.

**¿Qué te gustaría contar en tu página?** (`sections`): Experiencias · Itinerario · Qué incluye · Condiciones y reservas · Nuestra historia · Contacto · Preguntas frecuentes.

**¿Cómo recibe el cliente tu oferta?** (`delivery`): Salida programada · Experiencia privada · Consulta previa · Lo definiré después.

**¿Qué parte de tu atención te gustaría mejorar?** (`operationGoal`): Solicitudes · Reservas o entregas · Seguimiento.

### Hospedaje

**offer**: Habitaciones · Una casa completa · Estadías con experiencia · Lo definiré después.

**people**: Parejas · Familias · Viajeros que buscan descanso · Lo definiré después.

**purpose**: Hacer que se sientan en casa · Crear un lugar para descansar · Conectar con el entorno.

**sections**: Habitaciones · Servicios · Cómo llegar · Condiciones de estadía · Nuestra historia · Contacto · Preguntas frecuentes.

**delivery**: Consulta de disponibilidad · Coordinación por mensaje · Lo definiré después.

**¿Qué te gustaría aportar?** (`purpose`): Hacer que se sientan en casa · Crear un lugar para descansar · Conectar con el entorno · Lo definiré después.

**¿A quién te gustaría llegar?** (`audience`): Parejas · Familias · Viajeros que buscan descanso · Lo definiré después.

**¿Qué ofrece tu proyecto?** (`offering`): Habitaciones · Una casa completa · Estadías con experiencia · Lo definiré después.

**¿De qué temas te gustaría hablar?** (`pillars`): Espacios y estadías · Vida local · Personas y hospitalidad · Consejos para tu visita · Historia del lugar · Lo definiré después.

**¿Qué te gustaría contar en tu página?** (`sections`): Habitaciones · Servicios · Cómo llegar · Condiciones de estadía · Nuestra historia · Contacto · Preguntas frecuentes.

**¿Cómo recibe el cliente tu oferta?** (`delivery`): Consulta de disponibilidad · Coordinación por mensaje · Lo definiré después.

**¿Qué parte de tu atención te gustaría mejorar?** (`operationGoal`): Solicitudes · Reservas o entregas · Seguimiento.

### Cursos

**offer**: Un curso · Un taller en vivo · Materiales y acompañamiento · Lo definiré después.

**people**: Personas que empiezan · Profesionales · Mi comunidad · Lo definiré después.

**purpose**: Compartir lo que sé · Ayudar a practicar · Hacer más accesible aprender.

**sections**: Cursos · Temario · Quién enseña · Materiales · Preguntas frecuentes · Contacto · Testimonios.

**delivery**: Contenido digital · Sesión en vivo · Acompañamiento · Lo definiré después.

**¿Qué te gustaría aportar?** (`purpose`): Compartir lo que sé · Ayudar a practicar · Hacer más accesible aprender · Lo definiré después.

**¿A quién te gustaría llegar?** (`audience`): Personas que empiezan · Profesionales · Mi comunidad · Lo definiré después.

**¿Qué ofrece tu proyecto?** (`offering`): Un curso · Un taller en vivo · Materiales y acompañamiento · Lo definiré después.

**¿De qué temas te gustaría hablar?** (`pillars`): Ideas para aprender · Práctica y proceso · Personas y comunidad · Dudas frecuentes · Historia de quien enseña · Lo definiré después.

**¿Qué te gustaría contar en tu página?** (`sections`): Cursos · Temario · Quién enseña · Materiales · Preguntas frecuentes · Contacto · Testimonios.

**¿Cómo recibe el cliente tu oferta?** (`delivery`): Contenido digital · Sesión en vivo · Acompañamiento · Lo definiré después.

**¿Qué parte de tu atención te gustaría mejorar?** (`operationGoal`): Contenido educativo · Materiales · Seguimiento.

### Servicios y ofertas mixtas

**offer**: Un servicio · Una asesoría · Un paquete de servicios · Productos y servicios · Lo definiré después.

**people**: Emprendimientos · Personas independientes · Equipos · Lo definiré después.

**purpose**: Acompañar un cambio · Resolver un problema concreto · Compartir mi experiencia.

**sections**: Servicios y paquetes · Cómo trabajamos · Nuestra historia · Preguntas frecuentes · Contacto · Testimonios.

**delivery**: En persona · A distancia · Ambas modalidades · Lo definiré después.

**¿Qué te gustaría aportar?** (`purpose`): Acompañar un cambio · Resolver un problema concreto · Compartir mi experiencia · Lo definiré después.

**¿A quién te gustaría llegar?** (`audience`): Emprendimientos · Personas independientes · Equipos · Lo definiré después.

**¿Qué ofrece tu proyecto?** (`offering`): Un servicio · Una asesoría · Un paquete de servicios · Productos y servicios · Lo definiré después.

**¿De qué temas te gustaría hablar?** (`pillars`): Problemas que ayudamos a resolver · Proceso y método · Personas y comunidad · Consejos prácticos · Historia y propósito · Lo definiré después.

**¿Qué te gustaría contar en tu página?** (`sections`): Servicios y paquetes · Cómo trabajamos · Nuestra historia · Preguntas frecuentes · Contacto · Testimonios.

**¿Cómo recibe el cliente tu oferta?** (`delivery`): En persona · A distancia · Ambas modalidades · Lo definiré después.

**¿Qué parte de tu atención te gustaría mejorar?** (`operationGoal`): Solicitudes · Cotizaciones · Seguimiento.

## Correcciones que debe aplicar la maqueta

- Tres intenciones principales al crear contenido: reconocimiento, conversación y venta. Las seis categorías históricas quedan como filtros secundarios; no son seis pasos de venta.

- Desarrollar pilares en tres espacios amplios con palabras propias; conservar temas adicionales históricos. Tema → idea → intención → formato → diseño.

- Referencias: pedir perfil/enlace y qué gusta (tono, diseño, temas, edición, forma de vender). Guardarlo no equivale a haber analizado el perfil.

- Esencia: qué diferencia al negocio, qué quiere hacer sentir, cómo habla, qué demuestra y qué evita. No forzar respuestas profesionales ni inventarlas.

- S/10 diarios por una semana puede presentarse solo como ejemplo de presupuesto, nunca como mínimo ni garantía de efectividad. El resultado depende del negocio y la campaña; contenido orgánico sigue siendo válido.

- Audio se guarda privado; transcribir/organizar con IA requiere acción explícita y revisión antes de modificar respuestas.

- Saltarse preguntas no bloquea herramientas. No completar tareas por haber respondido ni vincular nivel/suscripción a ingresos.
