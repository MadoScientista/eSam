import { api } from "./api"


// Obtener todos los usuarios (requiere rol admin)
export const obtenerUsuarios = async () => {
    const response = await api.get("/usuarios")

    return response.data
}

// Filtrar un usuario por id (requiere rol admin)
export const obtenerUsuarioId = async (idUsuario) => {
    const response = await api.get(`/usuarios/${idUsuario}`)

    return response.data
}

// Obtener todos los roles de usuario
export const obtenerRolesUsuario = async () => {
    const response = await api.get("/roles")

    return response.data
}

// Obtener los usuarios que tienen un rol específico (requiere rol admin)
export const obtenerUsuariosPorRol = async (idRolUsuario) => {
    const response = await api.get(`/usuarios/rol/${idRolUsuario}`)

    return response.data
}

// Eliminar un usuario por id (requiere rol admin)
export const eliminarUsuario = async (idUsuario) => {
    const response = await api.delete(`/usuarios/${idUsuario}`)

    return response.data
}

// Iniciar sesión.
// El backend espera { correo, password } y responde { loggin, token, usuario }.
// Un 401 arrive con loggin en false, por lo que el service propaga el error.
export const iniciarSesion = async (correo, password) => {
    const response = await api.post("/usuarios/login", { correo, password })

    return response.data
}

// Crear un usuario en el registro público.
// El servidor asigna el rol "cliente", por lo que no se envía idRolUsuario.
export const crearUsuario = async (usuario) => {
    const response = await api.post("/usuarios", usuario)

    return response.data
}

// Crear un usuario con rol (requiere rol admin)
export const crearUsuarioAdmin = async (usuario) => {
    const response = await api.post("/usuarios/admin", usuario)

    return response.data
}

// Actualizar un usuario por id (requiere rol admin)
export const actualizarUsuario = async (idUsuario, usuario) => {
    const response = await api.put(`/usuarios/${idUsuario}`, usuario)

    return response.data
}

// Obtener el perfil del usuario autenticado
export const obtenerPerfil = async () => {
    const response = await api.get("/usuarios/perfil")

    return response.data
}

// Actualizar el perfil del usuario autenticado.
// El DTO exige password y el servicio reemplaza la contraseña por la recibida.
export const actualizarPerfil = async (usuario) => {
    const response = await api.put("/usuarios/perfil", usuario)

    return response.data
}