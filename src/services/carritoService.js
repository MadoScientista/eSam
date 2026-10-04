import { api } from "./api"


// Obtener el carrito del usuario autenticado
export const obtenerCarrito = async () => {
    const response = await api.get("/carrito")

    return response.data
}

// Agregar un producto al carrito.
// El precio y el subtotal los calcula el servidor, no se envían.
export const agregarItemCarrito = async (idProducto, cantidad) => {
    const response = await api.post("/carrito/items", { idProducto, cantidad })

    return response.data
}

// Cambiar la cantidad de un producto ya presente en el carrito
export const actualizarCantidadItem = async (idProducto, cantidad) => {
    const response = await api.put(`/carrito/items/${idProducto}`, { cantidad })

    return response.data
}

// Quitar un producto del carrito
export const eliminarItemCarrito = async (idProducto) => {
    const response = await api.delete(`/carrito/items/${idProducto}`)

    return response.data
}

// Vaciar el carrito
export const vaciarCarrito = async () => {
    const response = await api.delete("/carrito")

    return response.data
}