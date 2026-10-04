import { api } from "./api"


// Obtener todas las categorías.
// Estas consultas requieren token en la configuración actual del backend.
export const obtenerCategorias = async () => {
    const response = await api.get("/categorias")

    return response.data
}

// Obtener las categorías de primer nivel
export const obtenerCategoriasRaiz = async () => {
    const response = await api.get("/categorias/raiz")

    return response.data
}

// Obtener las categorías hijas de una categoría
export const obtenerCategoriasPorPadre = async (idCategoriaPadre) => {
    const response = await api.get(`/categorias/padre/${idCategoriaPadre}`)

    return response.data
}

// Obtener una categoría por id
export const obtenerCategoria = async (idCategoria) => {
    const response = await api.get(`/categorias/${idCategoria}`)

    return response.data
}

// Crear una categoría (requiere rol admin)
export const crearCategoria = async (categoria) => {
    const response = await api.post("/categorias", categoria)

    return response.data
}

// Actualizar una categoría (requiere rol admin)
export const actualizarCategoria = async (idCategoria, categoria) => {
    const response = await api.put(`/categorias/${idCategoria}`, categoria)

    return response.data
}

// Eliminar una categoría (requiere rol admin)
export const eliminarCategoria = async (idCategoria) => {
    const response = await api.delete(`/categorias/${idCategoria}`)

    return response.data
}