import { api } from "./api"

export const obtenerUsuarios = async () => {
    const response = await api.get("/usuarios")

    return response.data
}

export const obtenerUsuarioId = async (id) => {
    const response = await api.get("/usuarios/" + id)

    return response.data
}