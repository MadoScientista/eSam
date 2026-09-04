import {api} from "./api"


// Obtener todos los productos
export const obtenerProductos = async () => {
    const response = await api.get("/productos")

    return response.data
}


// Obtener un producto filtrado por sku
export const obtenerProductoSku = async (sku) => {
    const response = await api.get("/productos/" + sku)

    return response.data
}

// Eliminar producto por sku
export const eliminarProducto = async (sku) => {
    const response = await api.delete("/productos/" + sku)

    return response.data
}


// Post para guardar un producto
export const crearProductoSku = async (producto) => {
    console.log("Producto enviado", producto)
    const response = await api.post("/productos", producto)

    return response.data
}


// Post para actualizar un producto
export const actualizarProductoSku = async (sku, producto) => {
    const response = await api.post("/productos/" + sku, producto)

    return response.data
}