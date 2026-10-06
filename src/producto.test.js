import { describe, it, expect } from "vitest"
import { categoriasCatalogo } from "./utils/categoria"
import { filtrarProductos, marcasCatalogo, nombreMarcaProducto, normalizarTexto, ordenarProductos } from "./utils/producto"

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