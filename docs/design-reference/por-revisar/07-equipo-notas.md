# Equipo y tamaño del equipo implementados

Autorización: «ok continua con el siguiente paso». ProjectTeamStep y ProjectTeamSizeStep reutilizan ProjectQuestionStep, sus estilos adaptables y PearlButton.

La primera pregunta muestra Por mi cuenta, Somos un equipo y Todavía lo estoy definiendo. El tamaño aparece únicamente para Somos un equipo, con Dos personas, Entre tres y cinco, Más de cinco y Lo definiré después. projectTeamPresentation y projectTeamSizePresentation adaptan los textos a los seis rubros. No se crean miembros, invitaciones ni permisos.

GuidedJourney conserva changeAnswer/go, el guardado por proyecto, los reintentos y retorno al resumen/Studio. El siguiente cursor se obtiene de buildQuestions después de la respuesta, por lo que omite teamSize cuando no corresponde. Una referencia de tamaño previa se conserva al cambiar la respuesta de equipo, aunque su pregunta quede oculta.

Verificación: 3 pruebas cubren los seis rubros, valores canónicos, selección única, condición de aparición y conservación de tamaño previo. TypeScript, build y diff-check correctos. QA visual del paso team del diagnóstico turístico existente en celular (390 px CSS, sin desbordamiento) y computadora (1440 px). El tamaño condicional fue comprobado mediante pruebas de contrato y compilación; no se guardaron respuestas en la cuenta real para forzar ese recorrido.

Capturas reales: equipo-implementado-movil.jpg y equipo-implementado-computadora.jpg. El resto de preguntas posteriores conserva su presentación previa. Sin publicación.
