# Especificación del flujo de carrito y pago

1. Un usuario autenticado tiene un carrito que puede ser almacenado en la base de datos con las especificaciones de @dtos.md 

2. Un usuario con productos en el carrito puede iniciar el pago. El pago debe tener una bifurcación. Por un lado puede pedir despacho a domicilio o solo realizar el pago para retiro en tienda. En caso de solicitar el despacho a domicilio se debe poder seleccionar una de las direcciones ingresadas previamente y si no tiene ninguna, debe poder crear una nueva dirección desde el mismo flujo.

3. Luego de seleccionar la dirección o pago directo para retiro en tienda debe presionar el botón pagar.

4. Al presionar el botón pagar debe aparecer que se ha realizado el pago con éxito y descontar el stock de la base de datos.

Importante:

1. No puede realizar el pago si no hay stock suficiente para cumplir con la orden

2. No puede realizar el pago si seleccionó despacho a domicilio y no ha ingresado o seleccionado ninguna dirección.