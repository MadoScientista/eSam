import {api} from "./api"


export const obtenerProductos = async () => {
    const response = await api.get("/productos")

    return response.data
}

export const obtenerProductoSku = async (sku) => {
    const response = await api.get("/productos/" + sku)

    return response.data
}