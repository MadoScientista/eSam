export function imagenPrincipalProducto(producto) {
    const imagenes = producto?.imagenes

    if (!Array.isArray(imagenes) || imagenes.length === 0) {
        return null
    }

    const principal = imagenes.find((imagen) => imagen?.principal)

return (principal ?? imagenes[0])?.url ?? null
}

// Sin tildes y en minúscula, para que "lapiz" encuentre "Lápiz".
export function normalizarTexto(valor) {
    return String(valor ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
}

// La marca que se muestra del producto. El backend deja idMarca en null, pero sí
// trae marcaDetalle con el nombre, así que se usa ese cuando está.
export function nombreMarcaProducto(producto) {
    return producto?.marcaDetalle?.nombre ?? producto?.marca ?? ""
}

// Marcas del catálogo con la cantidad de productos de cada una. La clave es el
// nombre normalizado, para no repetir "Torre" y "torre" como marcas distintas.
export function marcasCatalogo(productos) {
    const conteo = new Map()

    ;(productos ?? []).forEach((p) => {
        const nombre = nombreMarcaProducto(p).trim()
        if (!nombre) return

        const clave = normalizarTexto(nombre)
        const actual = conteo.get(clave)

        // Se conserva la primera grafía vista, para no terminar mostrando
        // "torre" en el filtro solo porque llegó después de "Torre".
        conteo.set(clave, { clave, nombre: actual?.nombre ?? nombre, total: (actual?.total ?? 0) + 1 })
    })

    return [...conteo.values()].sort((a, b) => a.clave.localeCompare(b.clave, "es"))
}

// Un número escrito por el usuario puede no ser número ("abc", un "-"), y en ese
// caso el filtro de precio se ignora en vez de dejar la lista vacía.
function aPrecio(valor) {
    if (valor === null || valor === undefined || valor === "") return null

    const numero = Number(valor)

    return Number.isFinite(numero) ? numero : null
}

// Aplica búsqueda por texto, categorías, marcas y rango de precio. Un criterio
// vacío no filtra: por ejemplo, sin marcas seleccionadas aparecen todas.
export function filtrarProductos(productos, { busqueda = "", idsCategoria = [], marcas = [], precioMin = null, precioMax = null } = {}) {
    const termino = normalizarTexto(busqueda)
    const objetivo = new Set((idsCategoria ?? []).map(Number))
    const objetivoMarcas = new Set((marcas ?? []).map(normalizarTexto))
    const min = aPrecio(precioMin)
    const max = aPrecio(precioMax)

    return (productos ?? []).filter((p) => {
        if (termino) {
            const coincide = [p.nombre, p.sku, nombreMarcaProducto(p), p.descripcion]
                .some((campo) => normalizarTexto(campo).includes(termino))

            if (!coincide) return false
        }

        if (objetivo.size > 0 && !(p.categorias ?? []).some((c) => objetivo.has(c.idCategoria))) return false

        if (objetivoMarcas.size > 0 && !objetivoMarcas.has(normalizarTexto(nombreMarcaProducto(p)))) return false

        if (min !== null && p.precio < min) return false
        if (max !== null && p.precio > max) return false

        return true
    })
}

export const ORDENES_PRODUCTO = [
    { valor: "destacados", etiqueta: "Destacados" },
    { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
    { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
    { valor: "nombre-asc", etiqueta: "Nombre: A a Z" },
    { valor: "nombre-desc", etiqueta: "Nombre: Z a A" },
]

// "destacados" no reordena: deja el orden en que los entrega el catálogo, que es
// el mismo que usa el home.
export function ordenarProductos(productos, orden = "destacados") {
    const lista = [...(productos ?? [])]

    switch (orden) {
        case "precio-asc":
            return lista.sort((a, b) => a.precio - b.precio)
        case "precio-desc":
            return lista.sort((a, b) => b.precio - a.precio)
        case "nombre-asc":
            return lista.sort((a, b) => normalizarTexto(a.nombre).localeCompare(normalizarTexto(b.nombre), "es"))
        case "nombre-desc":
            return lista.sort((a, b) => normalizarTexto(b.nombre).localeCompare(normalizarTexto(a.nombre), "es"))
        default:
            return lista
    }
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

// Productos que pertenecen a alguna de las categorías indicadas, en el orden en
// que los entrega el catálogo.
export function productosDeCategoria(catalogo, idsCategoria) {
    const objetivo = new Set((idsCategoria ?? []).map(Number))

    if (objetivo.size === 0) return []

    return (catalogo ?? []).filter((p) =>
        (p.categorias ?? []).some((c) => objetivo.has(c.idCategoria))
    )
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
