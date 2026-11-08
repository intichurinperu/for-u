# Origen de la idea implementado

Autorización: «ok procede» tras revisar el siguiente paso. ProjectOriginStep reutiliza el layout de ProjectQuestionStep mediante un bloque de respuesta propio. No se cambia la persistencia del diagnóstico.

Opciones de buildQuestions: Proyecto familiar, Iniciativa personal, Con socios, Por una necesidad, Por una oportunidad, Otra historia. Selección múltiple mediante casillas accesibles; los seleccionados reutilizan el acabado nacarado. Los valores históricos de texto o array se restauran con choiceValues; opciones antiguas desconocidas siguen visibles y removibles.

Detalles Contarlo con mis palabras abre la historia opcional originCustom. Si existe texto guardado, se abre inicialmente. Cerrar no borra el texto. Máximo 2000 caracteres, ejemplos distintos por rubro explícitamente marcados como ejemplo. changeAnswer/selectChoice y go siguen guardando respuestas y cursor en el documento existente. Se conserva retorno a resumen/Studio, errores y recuperación.

Solo originCustom sirve de texto de Nuestra historia al preparar la página. Las categorías seleccionadas y los ejemplos nunca se convierten en historia pública.

Verificación: 4 pruebas para los seis rubros, selección múltiple/restauración legacy, preservación por proyecto y origen de la historia pública. TypeScript, build y diff-check correctos. Navegador con el diagnóstico turístico existente: controles y campo opcional, placeholder, celular a 359/390 px sin desbordamiento y computadora a 1440 px. No se modificaron respuestas ni se guardaron datos de prueba en la cuenta.

Capturas reales: origen-implementado-movil.jpg y origen-implementado-computadora.jpg (con campo opcional abierto). Sin publicación.
