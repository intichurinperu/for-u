# Primer proyecto: aprobado e implementado localmente

La usuaria aclaró que «procede» autorizaba la implementación. Referencia: 03-primer-proyecto-movil-computadora.png.

Implementación real: /onboarding abre la pantalla del nombre con el componente ProjectNameStep, el estilo compartido del registro y PearlButton. Continuar valida un nombre provisional y pasa a la actividad existente. Atrás desde actividad vuelve a esta pantalla. No se vuelve a pedir el nombre personal para una entrada nueva.

Se conserva el borrador por cuenta foru-create-v2 y la persistencia existente al confirmar actividad. creationDraft conserva nombres, actividad, destinos manual/explore e identidad de proyectos preparados para reintentar. La nueva entrada no escribe preferencias personales que no se editaron. Las preferencias históricas de borradores guiados se conservan. La ruta existente de crear desde dashboard mantiene sus alternativas.

El video de bienvenida y las utilidades flotantes no tapan /onboarding. El diálogo mantiene foco y el fondo inerte.

Verificación local: TypeScript y build correctos. Navegador: campo vacío, nombre -> actividad -> atrás, recuperación tras recarga y vistas móvil/computadora sin desbordamiento horizontal. No se confirmó la creación de un proyecto remoto durante QA. Nombre de prueba retirado del campo al terminar.

Capturas: primer-proyecto-implementado-movil.jpg y primer-proyecto-implementado-computadora.jpg.
Vista local con sesión: http://127.0.0.1:4173/onboarding. No publicado.

Asset de producción: frontend/public/brand/foru-project-pavilion.png. Preparado con la herramienta integrada de generación de imágenes usando la propuesta aprobada como referencia: pabellón vacío blanco de cristal, plataforma aqua translúcida, velero nacarado, fondo blanco sin textos ni UI. El prompt pidió recrear solo esa ilustración sin cambiar la dirección visual.
