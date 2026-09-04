import {api} from "./api"


// Obtener todas las marcas
export const obtenerMarcas = async () => {
    const response = await api.get("/marcas")

    return response.data
}