import { describe, it, expect } from "vitest"
import { categoriasCatalogo } from "../../utils/categoria"
import { categoriaMasPresente, filtrarProductos, imagenPrincipalProducto, marcasCatalogo, nombreMarcaProducto, normalizarTexto, ORDENES_PRODUCTO, ordenarProductos, productosDeCategoria, productosRecomendados, stockDisponible } from "../../utils/producto"

const producto = (id, nombre, precio, cats, extra = {}) => ({
    idProducto: id,
    nombre,
    precio,
    categorias: cats.map((c) => ({ idCategoria: c })),
    sku: `SKU-${id}`,
    marca: "Torre",
    descripcion: "",
    ...extra
})

const catalogo = [
    producto(1, "Cuaderno universitario", 2490, [1], { descripcion: "Papel hilado" }),
    producto(2, "Block de dibujo medium", 2090, [3]),
    producto(3, "Cartulina color", 890, [2], { marca: "ALOColor" }),
    producto(4, "Lápiz grafito", 450, [4], { marca: "Colorín", descripcion: "Hexagonal" })
]

describe("normalizarTexto", () => {
    it("Quita tildes y pasa a minúscula", () => {
        expect(normalizarTexto("Lápiz")).toBe("lapiz")
        expect(normalizarTexto("  PAPEL  ")).toBe("papel")
    })

    it("No rompe con valores nulos", () => {
        expect(normalizarTexto(null)).toBe("")
        expect(normalizarTexto(undefined)).toBe("")
    })
})

describe("stockDisponible", () => {
    it("Resta las unidades reservadas del stock físico", () => {
        expect(stockDisponible({ stock: 12, stockReservado: 5 })).toBe(7)
    })

    it("Limita el disponible a cero cuando todo el stock está reservado", () => {
        expect(stockDisponible({ stock: 3, stockReservado: 5 })).toBe(0)
    })

    it("Mantiene compatibilidad con productos sin stockReservado", () => {
        expect(stockDisponible({ stock: 6 })).toBe(6)
    })

    it("Devuelve cero para datos de stock inválidos", () => {
        expect(stockDisponible({ stock: "no-disponible", stockReservado: 1 })).toBe(0)
    })
})

describe("marcasCatalogo", () => {
    it("Usa marcaDetalle cuando el id de marca viene vacío", () => {
        expect(nombreMarcaProducto({ marca: "Torre", marcaDetalle: null })).toBe("Torre")
        expect(nombreMarcaProducto({ marca: null, marcaDetalle: { nombre: "Torre" } })).toBe("Torre")
        expect(nombreMarcaProducto({})).toBe("")
    })

    it("Cuenta productos por marca sin repetir variantes de mayúsculas", () => {
        const lista = marcasCatalogo([
            producto(1, "A", 100, [1], { marca: "Torre" }),
            producto(2, "B", 100, [1], { marca: "torre" }),
            producto(3, "C", 100, [1], { marca: " ALOColor " }),
            producto(4, "D", 100, [1], { marca: null })
        ])

        expect(lista).toEqual([
            { clave: "alocolor", nombre: "ALOColor", total: 1 },
            { clave: "torre", nombre: "Torre", total: 2 }
        ])
    })
})

describe("categoriasCatalogo", () => {
    // 1 -> 2, 3
    const arbol = [
        { idCategoria: 1, idCategoriaPadre: null, nombre: "Papelería" },
        { idCategoria: 2, idCategoriaPadre: 1, nombre: "cuadernos" },
        { idCategoria: 3, idCategoriaPadre: 1, nombre: "cartulinas" },
        { idCategoria: 4, idCategoriaPadre: null, nombre: "Pintura" }
    ]

    it("Solo devuelve las categorías raíz", () => {
        expect(categoriasCatalogo([], arbol).map((c) => c.nombre)).toEqual(["Papelería", "Pintura"])
    })

    it("Cuenta en la raíz también lo que está en sus subcategorías", () => {
        const productos = [
            producto(1, "A", 100, [1]),
            producto(2, "B", 100, [2]),
            producto(3, "C", 100, [3]),
            producto(4, "D", 100, [4])
        ]

        expect(categoriasCatalogo(productos, arbol)).toEqual([
            { clave: 1, nombre: "Papelería", total: 3 },
            { clave: 4, nombre: "Pintura", total: 1 }
        ])
    })

    it("El conteo coincide con lo que muestra el filtro al marcarlo", () => {
        const productos = [producto(1, "A", 100, [2]), producto(2, "B", 100, [4])]
        const raiz = categoriasCatalogo(productos, arbol).find((c) => c.clave === 1)

        const filtrados = filtrarProductos(productos, { idsCategoria: [1, 2, 3] })

        expect(filtrados).toHaveLength(raiz.total)
    })

    it("Una categoría sin productos igual aparece con total 0", () => {
        expect(categoriasCatalogo([], arbol).map((c) => c.total)).toEqual([0, 0])
    })
})

describe("filtrarProductos", () => {
    it("Busca por nombre ignorando tildes y mayúsculas", () => {
        expect(filtrarProductos(catalogo, { busqueda: "lapiz" }).map((p) => p.idProducto)).toEqual([4])
        expect(filtrarProductos(catalogo, { busqueda: "CUADERNO" }).map((p) => p.idProducto)).toEqual([1])
    })

    it("Busca por marca, sku y descripción", () => {
        expect(filtrarProductos(catalogo, { busqueda: "ALOColor" }).map((p) => p.idProducto)).toEqual([3])
        expect(filtrarProductos(catalogo, { busqueda: "SKU-2" }).map((p) => p.idProducto)).toEqual([2])
        expect(filtrarProductos(catalogo, { busqueda: "hilado" }).map((p) => p.idProducto)).toEqual([1])
    })

    it("Filtra por varias categorías a la vez", () => {
        expect(filtrarProductos(catalogo, { idsCategoria: [1, 2] }).map((p) => p.idProducto)).toEqual([1, 3])
    })

    it("Sin categorías seleccionadas no filtra", () => {
        expect(filtrarProductos(catalogo, { idsCategoria: [] })).toHaveLength(4)
    })

    it("Filtra por una o varias marcas", () => {
        expect(filtrarProductos(catalogo, { marcas: ["alocolor"] }).map((p) => p.idProducto)).toEqual([3])
        expect(filtrarProductos(catalogo, { marcas: ["torre"] }).map((p) => p.idProducto)).toEqual([1, 2])
        expect(filtrarProductos(catalogo, { marcas: ["torre", "alocolor"] })).toHaveLength(3)
        expect(filtrarProductos(catalogo, { marcas: [] })).toHaveLength(4)
    })

    it("Filtra por marca aunque el nombre solo venga en marcaDetalle", () => {
        const sinIdMarca = [producto(9, "X", 100, [1], { marca: null, marcaDetalle: { idMarca: 7, nombre: "Torre" } })]

        expect(filtrarProductos(sinIdMarca, { marcas: ["torre"] })).toHaveLength(1)
        expect(filtrarProductos(sinIdMarca, { marcas: ["otro"] })).toHaveLength(0)
    })

    it("Filtra por rango de precio e incluye los bordes", () => {
        expect(filtrarProductos(catalogo, { precioMin: 890, precioMax: 2090 }).map((p) => p.idProducto)).toEqual([2, 3])
        expect(filtrarProductos(catalogo, { precioMin: 2090 }).map((p) => p.idProducto)).toEqual([1, 2])
    })

    it("Ignora un precio que no es número en vez de vaciar la lista", () => {
        expect(filtrarProductos(catalogo, { precioMin: "abc" })).toHaveLength(4)
        expect(filtrarProductos(catalogo, { precioMax: "" })).toHaveLength(4)
    })

    it("Combina todos los criterios", () => {
        expect(filtrarProductos(catalogo, {
            busqueda: "torre",
            idsCategoria: [1, 3],
            precioMax: 2200
        }).map((p) => p.idProducto)).toEqual([2])
    })

    it("Devuelve lista vacía si nada coincide", () => {
        expect(filtrarProductos(catalogo, { busqueda: "xyz" })).toEqual([])
    })
})

describe("ordenarProductos", () => {
    it("Ordena por precio en ambos sentidos", () => {
        expect(ordenarProductos(catalogo, "precio-asc").map((p) => p.precio)).toEqual([450, 890, 2090, 2490])
        expect(ordenarProductos(catalogo, "precio-desc").map((p) => p.precio)).toEqual([2490, 2090, 890, 450])
    })

    it("Ordena por nombre en ambos sentidos", () => {
        expect(ordenarProductos(catalogo, "nombre-asc").map((p) => p.nombre)).toEqual([
            "Block de dibujo medium",
            "Cartulina color",
            "Cuaderno universitario",
            "Lápiz grafito"
        ])
        expect(ordenarProductos(catalogo, "nombre-desc").map((p) => p.nombre)).toEqual([
            "Lápiz grafito",
            "Cuaderno universitario",
            "Cartulina color",
            "Block de dibujo medium"
        ])
    })

    it(".destacados conserva el orden del catálogo y no muta el original", () => {
        const original = [1, 2, 3, 4]

        expect(ordenarProductos(catalogo, "destacados").map((p) => p.idProducto)).toEqual(original)
        expect(ordenarProductos(catalogo).map((p) => p.idProducto)).toEqual(original)
        expect(catalogo.map((p) => p.idProducto)).toEqual(original)
    })
})

describe("ORDENES_PRODUCTO", () => {
    it("Expone las opciones del selector con destacados primero", () => {
        expect(ORDENES_PRODUCTO.map((o) => o.valor)).toEqual([
            "destacados",
            "precio-asc",
            "precio-desc",
            "nombre-asc",
            "nombre-desc"
        ])
    })
})

describe("imagenPrincipalProducto", () => {
    it("Devuelve la imagen marcada como principal", () => {
        const prod = {
            imagenes: [
                { url: "sec.jpg", principal: false },
                { url: "ppal.jpg", principal: true }
            ]
        }

        expect(imagenPrincipalProducto(prod)).toBe("ppal.jpg")
    })

    it("Sin principal devuelve la primera imagen", () => {
        const prod = { imagenes: [{ url: "a.jpg", principal: false }, { url: "b.jpg", principal: false }] }

        expect(imagenPrincipalProducto(prod)).toBe("a.jpg")
    })

    it("Devuelve null cuando no hay imágenes", () => {
        expect(imagenPrincipalProducto({ imagenes: [] })).toBeNull()
        expect(imagenPrincipalProducto({})).toBeNull()
        expect(imagenPrincipalProducto(null)).toBeNull()
        expect(imagenPrincipalProducto(undefined)).toBeNull()
    })
})

describe("productosDeCategoria", () => {
    it("Devuelve solo los productos de las categorías indicadas", () => {
        expect(productosDeCategoria(catalogo, [1]).map((p) => p.idProducto)).toEqual([1])
        expect(productosDeCategoria(catalogo, [1, 2]).map((p) => p.idProducto)).toEqual([1, 3])
    })

    it("Conserva el orden del catálogo", () => {
        expect(productosDeCategoria(catalogo, [4]).map((p) => p.nombre)).toEqual(["Lápiz grafito"])
    })

    it("Sin categorías objetivo devuelve lista vacía", () => {
        expect(productosDeCategoria(catalogo, [])).toEqual([])
    })

    it("Un producto sin categorías no aparece", () => {
        const sinCat = [{ ...producto(9, "X", 100, []) }]

        expect(productosDeCategoria(sinCat, [9])).toEqual([])
    })
})

describe("categoriaMasPresente", () => {
    it("Devuelve la categoría que más se repite en la lista", () => {
        const lista = [
            producto(1, "A", 100, [1]),
            producto(2, "B", 100, [2]),
            producto(3, "C", 100, [1])
        ]

        expect(categoriaMasPresente(lista)).toBe(1)
    })

    it("Contabiliza también las categorías secundarias de un producto", () => {
        const lista = [
            producto(1, "A", 100, [1]),
            producto(2, "B", 100, [2, 1]),
            producto(3, "C", 100, [2]),
            producto(4, "D", 100, [2])
        ]

        expect(categoriaMasPresente(lista)).toBe(2)
    })

    it("En empate gana la primera categoría que aparece", () => {
        const lista = [producto(1, "A", 100, [1]), producto(2, "B", 100, [2])]

        expect(categoriaMasPresente(lista)).toBe(1)
    })

    it("Devuelve null sin productos o sin categorías", () => {
        expect(categoriaMasPresente([])).toBeNull()
        expect(categoriaMasPresente([{ idProducto: 1, nombre: "X" }])).toBeNull()
        expect(categoriaMasPresente(null)).toBeNull()
    })
})

describe("productosRecomendados", () => {
    // Categorías: 1 -> A, C, E. 2 -> B, F. 3 -> D.
    const rec = [
        producto(1, "A", 100, [1]),
        producto(2, "B", 100, [2]),
        producto(3, "C", 100, [1]),
        producto(4, "D", 100, [3]),
        producto(5, "E", 100, [1]),
        producto(6, "F", 100, [2])
    ]

    it("Completa la fila con destacados cuando la categoría no la llena", () => {
        expect(productosRecomendados(rec, [1], [], 5).map((p) => p.idProducto)).toEqual([1, 3, 5, 2, 4])
    })

    it("Solo devuelve productos de la categoría si llenan la cantidad", () => {
        expect(productosRecomendados(rec, [1, 2], [], 5).map((p) => p.idProducto)).toEqual([1, 2, 3, 5, 6])
    })

    it("No incluye los ids excluidos ni en la categoría ni en los destacados", () => {
        expect(productosRecomendados(rec, [1], [3, 5], 4).map((p) => p.idProducto)).toEqual([1, 2, 4, 6])
    })

    it("Nunca repite productos", () => {
        const resultado = productosRecomendados(rec, [1, 2, 3], [], 5)
        const ids = resultado.map((p) => p.idProducto)

        expect(new Set(ids).size).toBe(ids.length)
    })

    it("Respeta el límite de la cantidad pedida", () => {
        expect(productosRecomendados(rec, [1, 2, 3], [], 4)).toHaveLength(4)
    })

    it("Sin categorías objetivo devuelve los primeros del catálogo", () => {
        expect(productosRecomendados(rec, [], [], 3).map((p) => p.idProducto)).toEqual([1, 2, 3])
    })

    it("Con catálogo vacío devuelve lista vacía", () => {
        expect(productosRecomendados([], [1], [])).toEqual([])
    })
})