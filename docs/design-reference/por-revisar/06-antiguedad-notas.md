# Antigüedad implementada: móvil y computadora

Autorización de la usuaria: «ok procede no olvides tambien adaptarlo a cel».

ProjectAgeStep usa ProjectQuestionStep, el mismo componente visual que el momento del proyecto. Mantiene fondo blanco, el pabellón y PearlButton. projectAgePresentation adapta textos y ayudas a los seis rubros. Valores age intactos: Todavía es una idea, Menos de un año, Entre uno y tres años, Más de tres años.

GuidedJourney conserva changeAnswer/go y la persistencia por proyecto. Volver guarda el paso antes de regresar a stage; continuar avanza a team, u ofrece volver al resumen/Studio cuando se edita una respuesta. Omitir mantiene el comportamiento existente. Durante escritura los controles se bloquean y se conservan errores/recuperación.

Verificación: 3 pruebas cubren seis rubros, selección única y conservación stage/age por proyecto; typecheck/build correctos. QA del diagnóstico turístico existente sin modificar sus respuestas. Vistas de celular a 359 y 390 px CSS sin desbordamiento horizontal; botón principal visible antes de desplazarse. Capturas reales de celular (390 px) y computadora. No se guardaron respuestas de prueba en la cuenta.

Capturas: antiguedad-implementada-movil.jpg y antiguedad-implementada-computadora.jpg.
Vista local de la respuesta age: /dashboard?project=<id>&setup=1&question=age.
