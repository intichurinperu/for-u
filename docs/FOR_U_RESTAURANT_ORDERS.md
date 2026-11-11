# Pedidos internos de restaurante

## Usar

1. Dentro de un proyecto Restaurante, abre **Mi menú**, guarda catálogo y publica la carta. Publicar decide qué catálogo público puede comprarse; editar el borrador no cambia sus precios.
2. Abre **Pedidos internos** en la barra lateral (también Operaciones). En **Modalidades, mesas y tarifas**, activa la recepción, elige mesa/recojo/delivery y guarda mesas y zonas. Una tarifa vacía no se convierte en cero; para delivery sin cargo escribe explícitamente 0.
3. En la carta pública, el cliente agrega presentaciones, extras, cantidades y notas. Selecciona entrega, completa contacto y revisa el total. **Confirmar pedido** registra el pedido en FOR U; no requiere cuenta y no cobra.
4. El negocio actualiza pedidos y avanza/cancela estados. El cliente conserva su enlace privado de seguimiento o asocia el pedido a su cuenta opcional para recuperar historial. WhatsApp solo permite consultar aparte.

## Activación

SQL `supabase/migrations/26_restaurant_orders.sql` ya aplicado en el Supabase actual con autorización. No necesita nuevas Edge Functions, tokens de proveedor ni claves privadas en frontend. Para otro entorno, ejecutar primero el diagnóstico `supabase/diagnostics/restaurant_orders_schema.sql`, contrastar UUID/relaciones y probar la migración; no ejecutar todas las antiguas.

- Tablas: configuración por proyecto, pedidos con instantánea pública y datos operativos privados, favoritos por cuenta/página.
- RPCs privados: configuración, gestión y perfil autenticado. Públicos: configuración de menú publicado, cotización/creación y consulta con token. Las tablas no se leen ni modifican directamente desde el navegador.
- Tarifas/configuración se guardan explícitamente y afectan nuevos pedidos; no requieren republicar textos de la carta. Totales de pedidos existentes no cambian al modificar tarifa o publicar otro catálogo.
- Conflictos de negocio devuelven HTTP409/PT409, evitando SQLSTATE40001 y sus reintentos automáticos. La actualización se compara con la revisión guardada.
- Ante confirmación incierta, reintenta la misma solicitud o comprueba el resultado antes de corregir. No se crea otro UUID automáticamente. Pendiente/recibo se guardan en esa pestaña; el carrito por negocio se conserva localmente.
- El enlace privado funciona como permiso de consulta y asociación a perfil. No publicarlo en redes. En el servidor solo se guarda su hash; el negocio no recibe el token. No se devuelve identidad/dirección del cliente al seguimiento.

## Pruebas y límites

QA separado `5e98ab15-4048-40f4-8bba-e7c5bd942c28`, menú `/qa-pedidos-internos-restaurante`. Usar únicamente datos técnicos para seguir probando; no son precios, fotos ni contacto de Studio4U.

132 pruebas frontend y 20 pruebas de servidor pertinentes pasan con Node20; build Vite4 y TypeScript pasan. Pedidos invitados para las tres modalidades, concurrencia del mismo identificador, manipulación del total, token incorrecto, gestión, carrito/recarga y favoritos/historial comprobados. Detalles y comprobaciones pendientes en FOR_U_PROGRESS.md.

Pendientes externos: segunda sesión remota y alta/confirmación de cuenta cliente por email. Gestión muestra últimos200 pedidos, historial últimos100. Dirección/zona se revisan por el negocio; no se verifica distancia automáticamente. El precio siempre procede del catálogo y tarifa publicados/configurados, no del importe enviado por el cliente. Pago por coordinar; Mercado Pago y despliegue Hostinger pertenecen a entregas posteriores.
