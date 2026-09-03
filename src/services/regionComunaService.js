
import { api } from "./api"

export const obtenerRegionesComunas = async () => {
    const response = await api.get("/regiones/comunas")

    return response.data
}

export const obtenerComunasDeRegion = async (idComuna) =>{
    const response = await api.get(`/regiones/${idComuna}/comunas`)

    return response.data
}