# Mercado Pago por negocio — activación y evidencias

Estado: implementación disponible; **no cerrado ni autorizado para dinero real**.
Solo esta integración está en curso. Cuotas de nube y publicación en Meta siguen pendientes.

## Qué se reutiliza

Los pedidos de restaurante conservan sus UUID, cálculo de variantes/extras/entrega, seguimiento y estados. El pago vive en intentos separados. Las páginas `/s/:slug` permiten comprar las ofertas publicadas o solicitar cotización; las experiencias del módulo turístico también tienen acceso al recorrido comercial. No se crea otro catálogo editable.

La política de cada negocio puede ser coordinada, opcional u obligatoria. Se captura al crear un pedido; los pedidos anteriores conservan coordinación. En modalidad obligatoria, el servidor bloquea ejecución/preparación sin pago aprobado. Las ofertas gratuitas no pasan por Mercado Pago. Las condiciones y precios de una cotización se guardan por versión y el cliente acepta esa versión vigente. Hospedaje, experiencias y cursos requieren confirmar alcance/unidad/fechas antes del pago: no se crean reservas ni matrículas automáticamente.

`commerce_orders` es la base necesaria para las ofertas sin un pedido transaccional previo; no duplica `restaurant_orders`. Cada carrito pertenece a una página y negocio. Los widgets llevan al negocio fuente y nunca cobran en nombre de la página anfitriona.

## Activación remota

El 14 de octubre se contrastó el diagnóstico UUID y la ausencia de tablas homónimas mediante SQL de solo lectura. Se aplicaron, con autorización explícita, las migraciones 27 y 28. RLS está activo en las seis tablas nuevas, sin SELECT directo para anon/authenticated. Crear/consultar compras exige validación; mutar pagos, reclamar OAuth y resolver credenciales son funciones exclusivas del servidor. Se desplegó `mercado-pago`, con Verify JWT legacy apagado y autenticación en código, también autorizada expresamente.

El código distingue claves públicas de sesiones verificadas incluso si la clave anon del frontend difiere de la del runtime. Interpretar un encabezado público **no** atribuye identidad: se exige el secreto del pedido. Configuración exige `auth.getUser` y propiedad del proyecto.

## Lo que necesitas hacer, en este orden

1. Abrir [Tus integraciones](https://www.mercadopago.com.pe/developers/panel/app) e iniciar sesión personalmente. La pestaña preparada está en login; todavía no hay acceso autorizado a Developers.
2. Crear una aplicación FOR U para Checkout Pro / Orders API. Preparar vendedor peruano y comprador **de prueba**, separados. El servidor verifica `site_id=MPE` y etiqueta `test_user` al autorizar el entorno de prueba.
3. Registrar la URL OAuth exacta: `https://yizkrarmnrwkdrndqdji.supabase.co/functions/v1/mercado-pago`. Usar Authorization Code con PKCE S256.
4. Configurar notificaciones de Order a `https://yizkrarmnrwkdrndqdji.supabase.co/functions/v1/mercado-pago?webhook=1`. Guardar la clave de firma en Supabase, nunca en el frontend.
5. En Supabase → Edge Functions → Secrets, ingresar personalmente los secretos indicados abajo. No pegarlos en el chat. Mantener producción desactivada.
6. Abrir un proyecto QA en FOR U → Configuración → Cobros. Autorizar explícitamente el vendedor de prueba para ese proyecto, comprobarlo y guardar modalidad opcional u obligatoria. Vincular la misma cuenta a otro proyecto requiere otra selección/autorización explícita.
7. Realizar personalmente las compras de prueba y verificar retorno, webhook y consulta. Después de esa comprobación se podrá solicitar activación productiva; no está incluida una transacción real ni un despliegue Hostinger en esta verificación.

### Secretos y configuración

| Nombre | Valor y destino |
|---|---|
| `MP_APP_ID` | Identificador de aplicación de Mercado Pago |
| `MP_CLIENT_SECRET` | Secreto de esa aplicación; solo Supabase |
| `MP_CREDENTIAL_KEY` | 32 bytes aleatorios expresados como 64 caracteres hexadecimales; solo Supabase |
| `MP_WEBHOOK_SECRET` | Firma de notificaciones de esa aplicación; solo Supabase |
| `MP_SITE_ORIGIN` | Origen HTTPS donde se abrirá la versión actual de FOR U, sin rutas ni barra final |
| `MP_ENABLE_PRODUCTION` | Ausente o `false` durante QA; no cambiar sin autorización y pruebas |

Para generar personalmente la clave de cifrado puede usarse `openssl rand -hex 32` en tu terminal y copiar el resultado únicamente al campo del secreto. No conservarla en Git. Una rotación de esta clave necesita recifrado o nueva autorización: no reemplazarla sin plan.

Checkout Pro Orders API usa las credenciales del **vendedor de prueba**, no un Access Token `TEST-` genérico. El comprador QA debe usar su email `@testuser.com`. Las fechas de expiración se toman de la respuesta OAuth, no de una duración supuesta. [API oficial](https://www.mercadopago.com.pe/developers/es/reference/online-payments/checkout-pro/create-order/post).

El retorno del checkout debe abrirse en el mismo origen y navegador que conserva el enlace privado. Si se prueba desde localhost y el retorno va al dominio, habrá que abrir el enlace privado en ese dominio; no se transfiere el secreto mediante URLs de Mercado Pago. La vista `/cobros/retorno` no anuncia pago por parámetros de URL. Antes de probar el retorno completo es necesario servir esta versión en un origen HTTPS disponible.

## Controles y recuperación

- Autorizaciones cifradas AES-GCM, estado OAuth aleatorio de un uso, PKCE, expiración y verificación de propietario/vendedor/entorno. Renovación con comparación de la credencial previamente leída.
- Total calculado desde publicación válida o cotización aceptada; borradores y documentos privados no alimentan el checkout. Cambios de catálogo anteriores al inicio exigen revisar la compra. Un pedido antiguo bloqueado por cambio de precio debe cancelarse y volver a revisarse; no se cambia su importe silenciosamente.
- Intento e idempotency key persistidos antes de solicitar el checkout; cuerpo congelado para reintentos. Un único intento activo por pedido. Una respuesta perdida se recupera mediante búsqueda por referencia, verificación completa y consulta del proveedor; no se reemplaza la clave a ciegas.
- Firma HMAC de notificaciones y consulta autenticada al proveedor. Se validan app, vendedor, referencia, monto, moneda PEN, país y entorno antes de actualizar. Notificaciones repetidas o antiguas no revierten un pago aprobado. Estados desconocidos permanecen por confirmar.
- Pago separado de preparación. Cancelar no devuelve dinero. Devoluciones totales/parciales se gestionan en Mercado Pago y se reflejan al consultar; eventos no reconocidos no se convierten en aprobación. Los contracargos reales requieren comprobar el payload de la cuenta autorizada.
- Desconectar bloquea nuevos cobros y conserva el vínculo histórico. Un checkout previamente creado puede recibir un pago: debe consultarse y devolverse desde Mercado Pago si corresponde. Revocar la aplicación en Mercado Pago impide consultas históricas hasta renovar una autorización válida del mismo vendedor.
- El seguimiento invitado utiliza un secreto aleatorio de 256 bits en el fragmento del enlace, sin exponer email, teléfono ni credenciales. Guardar el enlace; el retorno conserva contexto en sessionStorage y no garantiza recuperación al cerrar el navegador.
- No se añaden suscripciones, anticipos, comisiones FOR U, entrega automática de cursos, disponibilidad por fechas ni cobros agrupados entre negocios.

## Evidencias y límites

- TypeScript frontend y función: comprobado; build Vite 4 en Node 20: comprobado.
- Suite frontend: 136/136. Pruebas nuevas de servidor: 19/19; regresión previa de pedidos, gestión y Edge Functions: 20/20. Los endpoints Mercado Pago de las pruebas unitarias usan fixtures técnicos, **no una cuenta conectada**.
- Supabase real: compras invitadas QA en Studio4U y Marketing4U; tres solicitudes simultáneas por UUID producen el mismo pedido. Precio de cliente alterado rechazado. Seguimiento con secreto correcto, rechazo con secreto ajeno y tablas privadas denegadas. Función desplegada devuelve `attempt:null` y política coordinada; no hay un pago ficticio.
- Interfaz real QA Marketing4U: guardar cotización técnica → aceptar versión → recargar conserva total, condiciones e historial. Cambiar a QA Studio4U muestra solamente sus compras de café/alfajor; regresar y recargar recupera la cotización. Consulta propietaria confirma coordinación sin pago online. Los importes son fixtures, no precios comerciales. La cotización no modifica la publicación fuente.
- Seguimiento y administración comprobados a 360, 768 y 1440 CSS px, sin desbordamiento horizontal; overrides restaurados. Evidencias temporales: `mp-tracking-360.jpg`, `mp-tracking-768.jpg` y `mp-management-360.jpg` en `/tmp/foru-delivery1`. La gestión conserva borradores de cotización ante actualización/conflicto; lectura de importe/fecha desde formulario nativo evita el bloqueo de Guardar detectado durante QA.
- Autorización OAuth real, renovación/revocación real, compra aprobada/pendiente/rechazada, entrega del webhook, retorno HTTPS y devoluciones: **pendientes de aplicación, secretos y cuentas de prueba autorizadas**.
- Aislamiento entre cuentas probado en PostgreSQL aislado; falta segunda sesión remota autorizada. La concurrencia del proveedor se comprueba con fixtures locales; falta repetirla con Mercado Pago.
- Turismo/hospedaje pueden requerir información adicional del proveedor según su actividad. No se inventarán pasajeros, fechas ni rutas; completar los requisitos de la cuenta antes de activar cobros para esas ofertas.
- Gestión lista los últimos 200 pedidos por proyecto. Credenciales, perfiles reales, costos y publicaciones existentes no se cambiaron. Hostinger, almacenamiento y Meta permanecen pendientes.

Los secretos y enlaces de seguimiento técnicos de QA están únicamente en archivos temporales no versionados. La reparación que corresponda en una instalación nueva es 27; 28 conserva la corrección acotada ya aplicada durante QA.
