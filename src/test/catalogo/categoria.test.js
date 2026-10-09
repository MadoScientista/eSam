import { describe, expect, it } from "vitest"
import { aplanarCategorias, idsCategoriaConDescendientes, validarImagenCategoria, validarNombreCategoria } from "../../utils/categoria"

describe("idsCategoriaConDescendientes", () => {
    // 1 -> 2, 3; 3 -> 5; 4 -> 6
    const arbol = [
        { idCategoria: 1, idCategoriaPadre: null },
        { idCategoria: 2, idCategoriaPadre: 1 },
        { idCategoria: 3, idCategoriaPadre: 1 },
        { idCategoria: 4, idCategoriaPadre: null },
        { idCategoria: 5, idCategoriaPadre: 3 },
        { idCategoria: 6, idCategoriaPadre: 4 }
    ]

    it("Incluye la categoría y todas sus descendientes", () => {
        expect(idsCategoriaConDescendientes(arbol, 1)).toEqual(new Set([1, 2, 3, 5]))
        expect(idsCategoriaConDescendientes(arbol, 3)).toEqual(new Set([3, 5]))
    })

    it("Una hoja solo devuelve su propio id", () => {
        expect(idsCategoriaConDescendientes(arbol, 2)).toEqual(new Set([2]))
    })

    it("Una descendiente varios niveles más abajo también aparece", () => {
        expect(idsCategoriaConDescendientes(arbol, 4)).toEqual(new Set([4, 6]))
    })

    it("Un id que no está en la lista se devuelve igual", () => {
        expect(idsCategoriaConDescendientes(arbol, 99)).toEqual(new Set([99]))
    })

    it("Resuelve descendientes aunque vengan antes que su padre en el arreglo", () => {
        const desordenado = [
            { idCategoria: 5, idCategoriaPadre: 3 },
            { idCategoria: 3, idCategoriaPadre: 1 },
            { idCategoria: 1, idCategoriaPadre: null }
        ]

        expect(idsCategoriaConDescendientes(desordenado, 1)).toEqual(new Set([1, 3, 5]))
    })

    it("No rompe con categorías vacías", () => {
        expect(idsCategoriaConDescendientes([], 7)).toEqual(new Set([7]))
    })
})

describe("validarNombreCategoria", () => {
    it("Acepta nombres válidos", () => {
        expect(validarNombreCategoria("Papelería")).toBeNull()
        expect(validarNombreCategoria("  Cuadernos  ")).toBeNull()
    })

    it("Rechaza nombres vacíos o solo espacios", () => {
        expect(validarNombreCategoria("")).toBe("El nombre es obligatorio.")
        expect(validarNombreCategoria("   ")).toBe("El nombre es obligatorio.")
        expect(validarNombreCategoria(null)).toBe("El nombre es obligatorio.")
    })

    it("Rechaza nombres de más de 100 caracteres", () => {
        expect(validarNombreCategoria("a".repeat(100))).toBeNull()
        expect(validarNombreCategoria("a".repeat(101))).toBe("El nombre admite hasta 100 caracteres.")
    })
})

describe("validarImagenCategoria", () => {
    it("Exige seleccionar una imagen", () => {
        expect(validarImagenCategoria(null)).toBe("Selecciona una imagen.")
        expect(validarImagenCategoria(undefined)).toBe("Selecciona una imagen.")
    })

    it("Solo admite JPEG, PNG o WebP", () => {
        expect(validarImagenCategoria({ type: "image/jpeg", size: 100 })).toBeNull()
        expect(validarImagenCategoria({ type: "image/png", size: 100 })).toBeNull()
        expect(validarImagenCategoria({ type: "image/webp", size: 100 })).toBeNull()
        expect(validarImagenCategoria({ type: "image/gif", size: 100 })).toBe("La imagen debe ser JPEG, PNG o WebP.")
        expect(validarImagenCategoria({ type: "", size: 100 })).toBe("La imagen debe ser JPEG, PNG o WebP.")
    })

    it("Rechaza imágenes de más de 5 MB", () => {
        const limite = 5 * 1024 * 1024

        expect(validarImagenCategoria({ type: "image/png", size: limite })).toBeNull()
        expect(validarImagenCategoria({ type: "image/png", size: limite + 1 })).toBe("La imagen no puede superar los 5 MB.")
    })
})

describe("aplanarCategorias", () => {
    it("Coloca cada categoría bajo su padre con su nivel de profundidad", () => {
        const arbol = [
            { idCategoria: 1, idCategoriaPadre: null, nombre: "Papelería" },
            { idCategoria: 2, idCategoriaPadre: 1, nombre: "Cuadernos" },
            { idCategoria: 3, idCategoriaPadre: 1, nombre: "Cartulinas" },
            { idCategoria: 4, idCategoriaPadre: null, nombre: "Pintura" },
            { idCategoria: 5, idCategoriaPadre: 3, nombre: "Lisas" },
            { idCategoria: 6, idCategoriaPadre: 3, nombre: "Texturadas" }
        ]

        const aplanadas = aplanarCategorias(arbol)

        expect(aplanadas.map((e) => `${e.categoria.nombre}@${e.nivel}`)).toEqual([
            "Papelería@0",
            "Cartulinas@1",
            "Lisas@2",
            "Texturadas@2",
            "Cuadernos@1",
            "Pintura@0"
        ])
    })

    it("Ordena alfabéticamente los hermanos en cada nivel", () => {
        const aplanadas = aplanarCategorias([
            { idCategoria: 1, idCategoriaPadre: null, nombre: "B" },
            { idCategoria: 2, idCategoriaPadre: null, nombre: "A" },
            { idCategoria: 3, idCategoriaPadre: 1, nombre: "D" },
            { idCategoria: 4, idCategoriaPadre: 1, nombre: "C" }
        ])

        expect(aplanadas.map((e) => e.categoria.nombre)).toEqual(["A", "B", "C", "D"])
    })

    it("Una categoría cuyo padre no existe se agrega al final sin perderse", () => {
        const aplanadas = aplanarCategorias([
            { idCategoria: 1, idCategoriaPadre: null, nombre: "A" },
            { idCategoria: 2, idCategoriaPadre: 1, nombre: "B" },
            { idCategoria: 8, idCategoriaPadre: 99, nombre: "Huérfana" }
        ])

        expect(aplanadas.map((e) => `${e.categoria.nombre}@${e.nivel}`)).toEqual(["A@0", "B@1", "Huérfana@0"])
    })

    it("No se cuelga con un ciclo y devuelve todas las categorías", () => {
        const aplanadas = aplanarCategorias([
            { idCategoria: 1, idCategoriaPadre: 2, nombre: "Uno" },
            { idCategoria: 2, idCategoriaPadre: 1, nombre: "Dos" }
        ])

        expect(aplanadas).toHaveLength(2)
        expect(aplanadas.map((e) => e.categoria.nombre)).toEqual(["Uno", "Dos"])
    })
})