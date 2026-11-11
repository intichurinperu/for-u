# Compilación en Hostinger

- Directorio de la aplicación: `frontend`.
- Node: seleccionar Node 20 (verificado con 20.19.5) o Node 18 (18.20.8).
- Instalación reproducible: `npm ci --include=dev`.
- Compilación: `npm run build`.
- Resultado estático: `dist/`.
- Configurar las variables `VITE_*` utilizadas por la aplicación antes de compilar.

El campo `engines.node` permite Node >=18.0.0; para ejecutar también ESLint y todas las herramientas de desarrollo, usar las versiones indicadas arriba (ESLint requiere 18.18+ o 20.9+).

Vite queda fijado en 4.5.3 y el complemento React en 4.3.4. El lockfile fija las dependencias compatibles; no borrarlo ni regenerarlo durante el despliegue. Supabase, React Router, Drei y ESLint usan versiones compatibles con Node 18/20. Las pruebas TypeScript se ejecutan con `npm test` mediante tsx, sin requerir el soporte nativo de Node 22.

Este cambio prepara la compilación. La versión de GLIBC necesaria para arrancar el binario de Node depende del sistema de Hostinger; un build en macOS no valida esa biblioteca de Linux. Si Node falla antes de ejecutar npm, Hostinger debe proporcionar un binario compatible, o se debe compilar fuera del servidor y desplegar `dist/`.

Al servir `dist/`, configurar el fallback de las rutas de la SPA a `index.html`. Las funciones de `api/` necesitan su entorno de ejecución propio: el build de Vite no las convierte en un servidor Node. `vite preview` es una herramienta de comprobación local, no un servidor de producción.

## Verificación local

Se comprobó una instalación limpia del lockfile con `npm ci --engine-strict --include=dev` y builds con Node 18.20.8 y Node 20.19.5. TypeScript pasó. Las 42 pruebas de los cinco módulos, medios, creador y publicaciones pasaron con Node 20; la suite completa en Node 18 dio 63/66. Los tres fallos restantes verifican restricciones visuales sobre colores, gradientes y sombras del CSS existente. ESLint sigue señalando 24 errores y una advertencia en código de la aplicación; no bloquean `npm run build`.

La comprobación limpia se ejecutó en una copia temporal local porque algunos archivos del directorio original se leían incompletos. Se revisaron la portada y la navegación al acceso en el navegador sin errores de consola. No se ha ejecutado un despliegue ni una prueba autenticada contra Hostinger.
