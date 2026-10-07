import { api } from "./api"


// Crear un pedido a partir del carrito persistido.
// idDireccion sólo se envía para despacho.
export const crearPedido = async (tipoEntrega, idDireccion) => {
    const body = tipoEntrega === "DESPACHO"
        ? { tipoEntrega, idDireccion }
        : { tipoEntrega }
    const response = await api.post("/pedidos", body)

    return response.data
}

// Obtener el historial de pedidos del usuario autenticado
export const obtenerMisPedidos = async () => {
    const response = await api.get("/pedidos")

    return response.data
}

// Obtener el detalle de un pedido propio
export const obtenerMiPedido = async (idPedido) => {
    const response = await api.get(`/pedidos/${idPedido}`)

    return response.data
}

// Obtener todos los pedidos (requiere rol admin)
export const obtenerPedidosAdmin = async () => {
    const response = await api.get("/pedidos/admin")

    return response.data
}

// Obtener un pedido por id (requiere rol admin)
export const obtenerPedidoAdmin = async (idPedido) => {
    const response = await api.get(`/pedidos/admin/${idPedido}`)

    return response.data
}

// Cambiar el estado de un pedido (requiere rol admin).
// Estados válidos: PENDIENTE, CONFIRMADO, ENVIADO, ENTREGADO, CANCELADO.
export const actualizarEstadoPedido = async (idPedido, estado) => {
    const response = await api.put(`/pedidos/admin/${idPedido}/estado`, { estado })

    return response.data
}