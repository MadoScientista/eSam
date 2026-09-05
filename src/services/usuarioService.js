import { api } from "./api"


// Obtener todos los usuarios
export const obtenerUsuarios = async () => {
    const response = await api.get("/usuarios")

    return response.data
}

// Filtrar un usuario por id
export const obtenerUsuarioId = async (id) => {
    const response = await api.get("/usuarios/" + id)

    return response.data
}

// Obtener todos los roles de usuario
export const obtenerRolesUsuario = async () => {
    const response = await api.get("/roles")

    return response.data
}

// Crear un usuario
export const crearUsuario = async (usuario) => {
    console.log(usuario)
    const response = await api.post("/usuarios", usuario)

    return response.data
}

// Actualizar un usuario
export const actualizarUsuario = async (id, usuario) => {
    console.log(usuario)
    const response = await api.post("/usuarios/" + id, usuario)

    return response.data
}