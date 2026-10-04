// Ordena las categorías para que cada una quede debajo de su padre, de modo que
// la jerarquía (idCategoriaPadre) sea legible y se puedan elegir sin ctrl.
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