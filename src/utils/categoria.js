// Ordena las categorías para que cada una quede debajo de su padre, de modo que
// la jerarquía (idCategoriaPadre) sea legible y se puedan elegir sin ctrl.

const TIPOS_IMAGEN_CATEGORIA = ["image/jpeg", "image/png", "image/webp"]
const TAMANO_MAXIMO_IMAGEN_CATEGORIA = 5 * 1024 * 1024
const NOMBRE_MAXIMO = 100

export function validarImagenCategoria(archivo) {
    if (!archivo) return "Selecciona una imagen."

    if (!TIPOS_IMAGEN_CATEGORIA.includes(archivo.type)) {
        return "La imagen debe ser JPEG, PNG o WebP."
    }

    if (archivo.size > TAMANO_MAXIMO_IMAGEN_CATEGORIA) {
        return "La imagen no puede superar los 5 MB."
    }

    return null
}

export function validarNombreCategoria(nombre) {
    if (!nombre || nombre.trim().length === 0) return "El nombre es obligatorio."

    if (nombre.trim().length > NOMBRE_MAXIMO) {
        return `El nombre admite hasta ${NOMBRE_MAXIMO} caracteres.`
    }

    return null
}
export function aplanarCategorias(categorias) {
    const hijos = new Map()

    categorias.forEach((c) => {
        const clave = c.idCategoriaPadre != null ? String(c.idCategoriaPadre) : ""
        const lista = hijos.get(clave) ?? []

        lista.push(c)
        hijos.set(clave, lista)
    })

    const ordenadas = []
    const vistos = new Set()

    const agregar = (clave, nivel) => {
        const lista = [...(hijos.get(clave) ?? [])].sort((a, b) =>
            String(a.nombre).localeCompare(String(b.nombre), "es")
        )

        lista.forEach((c) => {
            if (vistos.has(String(c.idCategoria))) return

            vistos.add(String(c.idCategoria))
            ordenadas.push({ categoria: c, nivel })

            agregar(String(c.idCategoria), nivel + 1)
        })
    }

    agregar("", 0)

    // Cualquier categoría que no se alcance desde una raíz (padre inexistente o
    // ciclo) se agrega al final para no perderla.
    categorias.forEach((c) => {
        if (vistos.has(String(c.idCategoria))) return

        ordenadas.push({ categoria: c, nivel: 0 })
    })

    return ordenadas
}