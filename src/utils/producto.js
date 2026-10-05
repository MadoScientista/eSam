export function imagenPrincipalProducto(producto) {
    const imagenes = producto?.imagenes

    if (!Array.isArray(imagenes) || imagenes.length === 0) {
        return null
    }

    const principal = imagenes.find((imagen) => imagen?.principal)

return (principal ?? imagenes[0])?.url ?? null
}

// Tarjetas que caben en una fila del carrusel: .product-carousel-item usa 20% de
// ancho desde 1200px, y ProductCarousel mide la fila como clientWidth / 5.
export const CANTIDAD_RELACIONADOS = 5

// Recomendados para un conjunto de categorías: primero los productos de esas
// categorías y, si no llenan la fila, se completa con los primeros del catálogo,
// que son los mismos destacados que muestra el home. Los ids excluidos no
// aparecen y ningún producto se repite.
export function productosRecomendados(catalogo, idsCategoria, idsExcluidos = [], cantidad = CANTIDAD_RELACIONADOS) {
    const lista = Array.isArray(catalogo) ? catalogo : []

    const objetivo = new Set((idsCategoria ?? []).map(Number))
    const yaUsados = new Set((idsExcluidos ?? []).map(Number))

    const enCategoria = objetivo.size === 0
        ? []
        : lista.filter((p) => {
            if(yaUsados.has(p.idProducto)) return false
            if(!(p.categorias ?? []).some((c) => objetivo.has(c.idCategoria))) return false

            yaUsados.add(p.idProducto)
            return true
        })

    if(enCategoria.length >= cantidad) return enCategoria.slice(0, cantidad)

    const destacados = lista.filter((p) => {
        if(yaUsados.has(p.idProducto)) return false

        yaUsados.add(p.idProducto)
        return true
    })

    return [...enCategoria, ...destacados.slice(0, cantidad - enCategoria.length)]
}

// Categoría que más se repite en una lista de productos. Cada producto vota una
// vez por cada una de sus categorías, sin importar cuántas unidades se hayan
// agregado al carrito; en caso de empate gana la primera que aparece.
export function categoriaMasPresente(productos) {
    const conteo = new Map()

    ;(productos ?? []).forEach((p) => {
        (p?.categorias ?? []).forEach((c) => {
            conteo.set(c.idCategoria, (conteo.get(c.idCategoria) ?? 0) + 1)
        })
    })

    let ganadora = null
    let maximo = 0

    conteo.forEach((total, idCategoria) => {
        if(total > maximo){
            ganadora = idCategoria
            maximo = total
        }
    })

    return ganadora
}
