import { api } from "./api"


// Obtener todos los productos
export const obtenerProductos = async () => {
    const response = await api.get("/productos")

    return response.data
}

// Obtener un producto.
// Las rutas del backend reciben el id numérico del producto, no su sku.
export const obtenerProductoPorId = async (idProducto) => {
    const response = await api.get(`/productos/${idProducto}`)

    return response.data
}

// Obtener los productos de una marca
export const obtenerProductosPorMarca = async (marca) => {
    const response = await api.get(`/productos/marca/${encodeURIComponent(marca)}`)

    return response.data
}

// Obtener los productos dentro de un rango de precio
export const obtenerProductosPorPrecio = async (min, max) => {
    const response = await api.get("/productos/precio", { params: { min, max } })

    return response.data
}

// Obtener los productos cuyo nombre coincide con el texto buscado
export const obtenerProductosPorNombre = async (nombre) => {
    const response = await api.get("/productos/nombre", { params: { nombre } })

    return response.data
}

// Crear un producto
export const crearProducto = async (producto) => {
    const response = await api.post("/productos", producto)

    return response.data
}

// Actualizar un producto.
// El backend actualiza con POST, no con PUT, y recibe el id numérico en la ruta.
export const actualizarProducto = async (idProducto, producto) => {
    const response = await api.post(`/productos/${idProducto}`, producto)

    return response.data
}

// Eliminar un producto por id
export const eliminarProducto = async (idProducto) => {
    const response = await api.delete(`/productos/${idProducto}`)

    return response.data
}

// Listar las imágenes de un producto
export const obtenerImagenesProducto = async (idProducto) => {
    const response = await api.get(`/productos/${idProducto}/imagenes`)

    return response.data
}

// Subir una imagen para un producto.
// El backend espera multipart/form-data con el campo "file".
export const subirImagenProducto = async (idProducto, archivo) => {
    const formData = new FormData()
    formData.append("file", archivo)

    const response = await api.post(`/productos/${idProducto}/imagenes`, formData)

    return response.data
}

// Eliminar una imagen de un producto
export const eliminarImagenProducto = async (idProducto, idImagenProducto) => {
    const response = await api.delete(`/productos/${idProducto}/imagenes/${idImagenProducto}`)

    return response.data
}

// Eliminar todas las imágenes de un producto
export const eliminarTodasImagenesProducto = async (idProducto) => {
    const response = await api.delete(`/productos/${idProducto}/imagenes`)

    return response.data
}

// Fijar el stock de un producto a un valor exacto
export const setearStock = async (idProducto, stock) => {
    const response = await api.put(`/productos/${idProducto}/stock/setear`, null, { params: { stock } })

    return response.data
}

// Aumentar el stock de un producto
export const aumentarStock = async (idProducto, unidades) => {
    const response = await api.put(`/productos/${idProducto}/stock/aumentar`, null, { params: { unidades } })

    return response.data
}

// Disminuir el stock de un producto
export const disminuirStock = async (idProducto, unidades) => {
    const response = await api.put(`/productos/${idProducto}/stock/disminuir`, null, { params: { unidades } })

    return response.data
}

// Marcar una imagen como principal
export const marcarImagenPrincipal = async (idProducto, idImagenProducto) => {
    const response = await api.put(`/productos/${idProducto}/imagenes/${idImagenProducto}/principal`)

    return response.data
}