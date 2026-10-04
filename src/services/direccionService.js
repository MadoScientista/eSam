import { api } from "./api"


// Obtener las direcciones del usuario autenticado
export const obtenerDirecciones = async () => {
    const response = await api.get("/direcciones")

    return response.data
}

// Obtener las direcciones de un usuario.
// El id debe corresponder al principal autenticado.
export const obtenerDireccionesUsuario = async (idUsuario) => {
    const response = await api.get(`/direcciones/usuario/${idUsuario}`)

    return response.data
}

// Obtener sólo las direcciones activas de un usuario
export const obtenerDireccionesActivas = async (idUsuario) => {
    const response = await api.get(`/direcciones/usuario/${idUsuario}/activas`)

    return response.data
}

// Obtener una dirección propia por id
export const obtenerDireccion = async (idDireccion) => {
    const response = await api.get(`/direcciones/${idDireccion}`)

    return response.data
}

// Crear una dirección.
// El DTO exige idUsuario, pero el controlador asocia la dirección al usuario del
// token, así que se envía el id propio.
export const crearDireccion = async (direccion) => {
    const response = await api.post("/direcciones", direccion)

    return response.data
}

// Actualizar una dirección propia
export const actualizarDireccion = async (idDireccion, direccion) => {
    const response = await api.put(`/direcciones/${idDireccion}`, direccion)

    return response.data
}

// Eliminar una dirección propia
export const eliminarDireccion = async (idDireccion) => {
    const response = await api.delete(`/direcciones/${idDireccion}`)

    return response.data
}