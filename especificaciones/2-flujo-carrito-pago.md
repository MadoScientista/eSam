# Especificación del flujo de carrito y pago

1. Un usuario autenticado tiene un carrito que se almacena en la base de datos según el contrato de [1-dtos.md](./1-dtos.md).

2. Un usuario con productos en el carrito puede iniciar el pago. El pago debe tener una bifurcación. Por un lado puede pedir despacho a domicilio o solo realizar el pago para retiro en tienda. En caso de solicitar el despacho a domicilio se debe poder seleccionar una de las direcciones ingresadas previamente y si no tiene ninguna, debe poder crear una nueva dirección desde el mismo flujo.

3. Luego de seleccionar la dirección o pago directo para retiro en tienda debe presionar el botón pagar.

4. Al presionar pagar, el frontend crea un pedido desde el carrito persistido. El pedido queda `PENDIENTE` y el backend reserva stock disponible; el stock físico no se descuenta en este paso. El frontend puede simular la pasarela y mostrar el resultado de esa simulación, pero solo admin o vendedor registra el pago aceptado cambiando el estado a `CONFIRMADO`.

Importante:

1. No puede crear el pedido si no hay stock disponible suficiente (`stock - stockReservado`) para cumplir con la orden. El backend valida atómicamente y responde `409 CONFLICTO_STOCK`; no se debe confiar solo en la validación visual del frontend.

2. No puede realizar el pago si seleccionó despacho a domicilio y no ha ingresado o seleccionado ninguna dirección.

## Lista de tareas de implementación

- [x] Mostrar el stock disponible (`stock - stockReservado`) en catálogo, detalle y carrito, y limitar las cantidades locales al disponible observado. La validación definitiva sigue siendo del backend.
- [x] Al iniciar checkout, fusionar el carrito local con el persistido: mantener los productos que ya estaban solo en la cuenta y, para productos coincidentes, usar la cantidad del carrito local.
- [ ] Persistir en el backend cada alta, cambio de cantidad y eliminación del carrito del cliente; por ahora la edición del carrito sigue siendo local hasta iniciar checkout.
- [x] Si el cliente invitado inicia sesión desde el carrito, conservarlo y devolverlo al checkout.
- [x] Implementar checkout con retiro en tienda o despacho, selección de dirección activa y creación de dirección en el mismo flujo.
- [x] Crear el pedido desde el carrito mediante `POST /api/pedidos` con `tipoEntrega` y, solo para despacho, `idDireccion`; reflejar `409 CONFLICTO_STOCK` sin vaciar ni perder el carrito local.
- [x] Simular el resultado exitoso en el frontend sin declarar que el backend confirmó el pago ni descontar stock físico; mostrar el pedido como pendiente hasta que admin o vendedor lo confirme.
- [ ] Verificar el flujo completo con un pedido pendiente, reserva de stock, manejo de errores y carrito vaciado únicamente tras la creación exitosa del pedido.