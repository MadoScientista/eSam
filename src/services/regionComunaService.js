import { api } from "./api"


// Obtener las regiones con sus comunas.
// Cada elemento llega como { idRegion, region, comunas: [{ idComuna, nombre }] }.
export const obtenerRegionesComunas = async () => {
    const response = await api.get("/regiones/comunas")

    return response.data
}

// Obtener todas las regiones como { idRegion, nombre }
export const obtenerRegiones = async () => {
    const response = await api.get("/regiones")

    return response.data
}

// Obtener todas las comunas como { idComuna, nombre, idRegion }
export const obtenerComunas = async () => {
    const response = await api.get("/comunas")

    return response.data
}