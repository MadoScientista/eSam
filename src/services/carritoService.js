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

// Incorpora el carrito local de invitado al carrito persistido del usuario.
// Conserva artículos que ya estaban en la cuenta y para coincidencias usa la
// cantidad local como fuente de verdad.
export const fusionarCarritoLocal = async (carritoLocal) => {
    const carritoServidor = await obtenerCarrito()
    const itemsServidor = carritoServidor?.items

    if (!Array.isArray(itemsServidor)) {
        throw new Error("El servidor devolvió un carrito con formato inesperado.")
    }

    const itemsLocales = Array.isArray(carritoLocal) ? carritoLocal : []
    const localesPorProducto = new Map(
        itemsLocales.map(({ product, units }) => [Number(product.idProducto), Number(units)])
    )
    const productosServidor = new Set()

    for (const item of itemsServidor) {
        const idProducto = Number(item.producto?.idProducto ?? item.product?.idProducto ?? item.idProducto)
        if (!Number.isFinite(idProducto)) {
            throw new Error("El servidor devolvió un producto de carrito sin identificador.")
        }
        productosServidor.add(idProducto)

        if (localesPorProducto.has(idProducto)) {
            const cantidadLocal = localesPorProducto.get(idProducto)
            if (Number(item.cantidad) !== cantidadLocal) {
                await actualizarCantidadItem(idProducto, cantidadLocal)
            }
        }
    }

    for (const { product, units } of itemsLocales) {
        const idProducto = Number(product?.idProducto)
        if (!Number.isFinite(idProducto) || !Number.isInteger(units) || units < 1) {
            throw new Error("El carrito local contiene un producto o cantidad inválida.")
        }
        if (!productosServidor.has(idProducto)) {
            await agregarItemCarrito(idProducto, units)
        }
    }

    return obtenerCarrito()
}