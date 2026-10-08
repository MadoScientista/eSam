import { describe, expect, it } from "vitest"
import { DIRECCIONES_ORDEN, ORDENES_ADMIN_PRODUCTO, ordenarProductosAdmin } from "../../utils/producto"

const productos = [
    { idProducto: 1, sku: "SKU-9", nombre: "Cuaderno", precio: 2490, stock: 5 },
    { idProducto: 2, sku: "SKU-10", nombre: "Lápiz", precio: 450, stock: 12 },
    { idProducto: 3, sku: "SKU-2", nombre: "Cartulina", precio: 890, stock: 2 }
]

describe("ordenarProductosAdmin", () => {
    it("Ordena descendentemente por SKU por defecto", () => {
        expect(ordenarProductosAdmin(productos).map((p) => p.sku)).toEqual(["SKU-10", "SKU-9", "SKU-2"])
        expect(ordenarProductosAdmin(productos, "sku", "desc").map((p) => p.sku)).toEqual(["SKU-10", "SKU-9", "SKU-2"])
    })

    it("Ordena por SKU ascendente", () => {
        expect(ordenarProductosAdmin(productos, "sku", "asc").map((p) => p.sku)).toEqual(["SKU-2", "SKU-9", "SKU-10"])
    })

    it("Ordena por ID en ambas direcciones", () => {
        expect(ordenarProductosAdmin(productos, "id", "desc").map((p) => p.idProducto)).toEqual([3, 2, 1])
        expect(ordenarProductosAdmin(productos, "id", "asc").map((p) => p.idProducto)).toEqual([1, 2, 3])
    })

    it("Ordena por precio en ambas direcciones", () => {
        expect(ordenarProductosAdmin(productos, "precio", "desc").map((p) => p.precio)).toEqual([2490, 890, 450])
        expect(ordenarProductosAdmin(productos, "precio", "asc").map((p) => p.precio)).toEqual([450, 890, 2490])
    })

    it("Ordena por nombre ignorando tildes", () => {
        expect(ordenarProductosAdmin(productos, "nombre", "asc").map((p) => p.nombre)).toEqual([
            "Cartulina",
            "Cuaderno",
            "Lápiz"
        ])
        expect(ordenarProductosAdmin(productos, "nombre", "desc").map((p) => p.nombre)).toEqual([
            "Lápiz",
            "Cuaderno",
            "Cartulina"
        ])
    })

    it("Ordena por stock en ambas direcciones", () => {
        expect(ordenarProductosAdmin(productos, "stock", "desc").map((p) => p.stock)).toEqual([12, 5, 2])
        expect(ordenarProductosAdmin(productos, "stock", "asc").map((p) => p.stock)).toEqual([2, 5, 12])
    })

    it("Ante un campo desconocido devuelve la lista sin reordenar", () => {
        expect(ordenarProductosAdmin(productos, "otro-campo").map((p) => p.idProducto)).toEqual([1, 2, 3])
    })

    it("No muta la lista original", () => {
        const original = productos.map((p) => p.idProducto)

        ordenarProductosAdmin(productos, "id", "desc")

        expect(productos.map((p) => p.idProducto)).toEqual(original)
    })

    it("Expone los campos del selector con SKU primero", () => {
        expect(ORDENES_ADMIN_PRODUCTO.map((o) => o.valor)).toEqual(["sku", "id", "precio", "nombre", "stock"])
    })

    it("Expone las direcciones ascendente y descendente", () => {
        expect(DIRECCIONES_ORDEN.map((d) => d.valor)).toEqual(["asc", "desc"])
    })
})