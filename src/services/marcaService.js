import { api } from "./api"


// Obtener todas las marcas
export const obtenerMarcas = async () => {
    const response = await api.get("/marcas")

    return response.data
}

// Crear una marca (requiere rol admin)
export const crearMarca = async (marca) => {
    const response = await api.post("/marcas", marca)

    return response.data
}

// Actualizar una marca (requiere rol admin)
export const actualizarMarca = async (idMarca, marca) => {
    const response = await api.put(`/marcas/${idMarca}`, marca)

    return response.data
}

// Eliminar una marca (requiere rol admin)
export const eliminarMarca = async (idMarca) => {
    const response = await api.delete(`/marcas/${idMarca}`)

    return response.data
}