# Especificación flujo de pedidos

1. Un pedido puede estar asociado a un retiro en tienda o despacho a domicilio.

2. Un pedido cuyo pago ha sido confirmado debe estar en estado confirmado.

3. Al crear el pedido debe validarse que exista stock suficiente para cumplir con todos sus productos. Si no alcanza el stock, el pedido no debe crearse. El stock debe quedar reservado para que el pago pueda aceptarse posteriormente sin inconvenientes.

4. Las especificaciones de comunicación con DTOs con el frontend están en [1-dtos.md](./1-dtos.md).

5. El pedido se crea siempre desde el carrito persistido del usuario; el cuerpo de la solicitud no lleva ítems. Al crearse exitosamente, el carrito queda vacío.

6. Ciclo de stock por estado del pedido:

   | Estado / transición | Efecto sobre el stock |
   |---|---|
   | Creación → `PENDIENTE` | Se reserva: `stockReservado += cantidad`. El total físico no cambia. |
   | `PENDIENTE` → `CONFIRMADO` | Sin cambio; la reserva se mantiene mientras el pago está aceptado. |
   | `CONFIRMADO` → `ENVIADO` | Sin cambio. |
   | `ENVIADO` → `ENTREGADO` | Se descuenta lo vendido y se libera la reserva: `stock -= cantidad` y `stockReservado -= cantidad`. |
   | `PENDIENTE` → `CANCELADO` | Se libera la reserva sin tocar el total: `stockReservado -= cantidad`. |

   El stock total representa unidades físicas; `stockReservado` es la parte comprometida por pedidos aún no entregados ni cancelados; el disponible para vender es `stock - stockReservado`.

7. Transiciones permitidas: `PENDIENTE → CONFIRMADO`, `PENDIENTE → CANCELADO`, `CONFIRMADO → ENVIADO` y `ENVIADO → ENTREGADO`. `ENTREGADO` y `CANCELADO` son estados finales. Cualquier otra transición se rechaza.

8. El pago es simulado y no se procesa en el backend: no existe endpoint de pago. El pedido nace `PENDIENTE`, el frontend del cliente puede simular la pasarela en su interfaz y solo un **admin o vendedor** registra el pago aceptado, cambiando el pedido a `CONFIRMADO` con `PUT /api/pedidos/admin/{idPedido}/estado`. Esa ruta está vedada al rol `cliente`.

9. Todo cambio de estado queda registrado en el historial del pedido con el estado anterior, el nuevo y la fecha, y se audita quién lo hizo en el registro (aunque el DTO de respuesta no expone ese usuario).

## Lista de tareas de implementación

- [x] Mostrar stock disponible (`stock - stockReservado`) en el catálogo, detalle y carrito, y no permitir aumentar el carrito local por encima del disponible observado. La creación del pedido debe volver a validar el stock en backend.
- [x] Conectar la compra al endpoint de creación de pedidos usando el carrito persistido; antes se fusiona el carrito invitado, conservando productos exclusivos de la cuenta y usando cantidades locales para coincidencias. Tratar el `409 CONFLICTO_STOCK` sin presentar la compra como exitosa.
- [x] Mostrar el pedido recién creado como `PENDIENTE` y comunicar que sus unidades están reservadas, no descontadas del stock físico.
- [ ] Agregar en el panel admin/vendedor acciones para las transiciones permitidas, incluyendo la confirmación (`PENDIENTE` → `CONFIRMADO`) tras la simulación de pago.
- [ ] Implementar la consulta de pedidos e historial del cliente con sus DTOs y estados actuales.
- [ ] Verificar todas las transiciones y que la reserva se mantenga, se libere o se descuente según el ciclo de stock especificado.
