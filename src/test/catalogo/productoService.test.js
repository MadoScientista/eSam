import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../services/api", () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}))

import { api } from "../../services/api"
import {
    actualizarProducto,
    aumentarStock,
    crearProducto,
    disminuirStock,
    eliminarImagenProducto,
    eliminarProducto,
    eliminarTodasImagenesProducto,
    marcarImagenPrincipal,
    obtenerImagenesProducto,
    obtenerProductoPorId,
    obtenerProductos,
    obtenerProductosPorMarca,
    obtenerProductosPorNombre,
    obtenerProductosPorPrecio,
    setearStock,
    subirImagenProducto
} from "../../services/productoService"

describe("productoService", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe("obtenerProductos", () => {
        it("obtiene la lista desde /productos", async () => {
            const productos = [{ idProducto: 1 }, { idProducto: 2 }]
            api.get.mockResolvedValue({ data: productos })

            const resultado = await obtenerProductos()

            expect(api.get).toHaveBeenCalledWith("/productos")
            expect(resultado).toEqual(productos)
        })
    })

    describe("obtenerProductoPorId", () => {
        it("obtiene un producto por su id numérico", async () => {
            const producto = { idProducto: 7, nombre: "Zapatilla" }
            api.get.mockResolvedValue({ data: producto })

            const resultado = await obtenerProductoPorId(7)

            expect(api.get).toHaveBeenCalledWith("/productos/7")
            expect(resultado).toEqual(producto)
        })
    })

    describe("obtenerProductosPorMarca", () => {
        it("codifica la marca en la ruta", async () => {
            api.get.mockResolvedValue({ data: [] })

            await obtenerProductosPorMarca("Nike Pro")

            expect(api.get).toHaveBeenCalledWith("/productos/marca/Nike%20Pro")
        })
    })

    describe("obtenerProductosPorPrecio", () => {
        it("envía el rango de precio como parámetros", async () => {
            api.get.mockResolvedValue({ data: [] })

            await obtenerProductosPorPrecio(1000, 5000)

            expect(api.get).toHaveBeenCalledWith("/productos/precio", {
                params: { min: 1000, max: 5000 }
            })
        })
    })

    describe("obtenerProductosPorNombre", () => {
        it("envía el nombre como parámetro", async () => {
            api.get.mockResolvedValue({ data: [] })

            await obtenerProductosPorNombre("zapatilla")

            expect(api.get).toHaveBeenCalledWith("/productos/nombre", {
                params: { nombre: "zapatilla" }
            })
        })
    })

    describe("crearProducto", () => {
        it("envía el producto por POST a /productos", async () => {
            const producto = { nombre: "Polera", precio: 9990 }
            api.post.mockResolvedValue({ data: { idProducto: 1, ...producto } })

            const resultado = await crearProducto(producto)

            expect(api.post).toHaveBeenCalledWith("/productos", producto)
            expect(resultado).toEqual({ idProducto: 1, ...producto })
        })
    })

    describe("actualizarProducto", () => {
        it("actualiza con POST e id numérico en la ruta", async () => {
            const producto = { nombre: "Polera nueva" }
            api.post.mockResolvedValue({ data: producto })

            await actualizarProducto(3, producto)

            expect(api.post).toHaveBeenCalledWith("/productos/3", producto)
        })
    })

    describe("eliminarProducto", () => {
        it("elimina por DELETE con el id en la ruta", async () => {
            api.delete.mockResolvedValue({ data: null })

            await eliminarProducto(9)

            expect(api.delete).toHaveBeenCalledWith("/productos/9")
        })
    })

    describe("obtenerImagenesProducto", () => {
        it("lista las imágenes del producto", async () => {
            const imagenes = [{ idImagenProducto: 1, url: "a.png" }]
            api.get.mockResolvedValue({ data: imagenes })

            const resultado = await obtenerImagenesProducto(2)

            expect(api.get).toHaveBeenCalledWith("/productos/2/imagenes")
            expect(resultado).toEqual(imagenes)
        })
    })

    describe("subirImagenProducto", () => {
        it("envía multipart/form-data con el campo file", async () => {
            const archivo = new File(["contenido"], "foto.png", { type: "image/png" })
            api.post.mockResolvedValue({ data: { idImagenProducto: 1 } })

            await subirImagenProducto(4, archivo)

            const [ruta, formData] = api.post.mock.calls[0]

            expect(ruta).toBe("/productos/4/imagenes")
            expect(formData).toBeInstanceOf(FormData)
            expect(formData.get("file")).toBe(archivo)
        })
    })

    describe("eliminarImagenProducto", () => {
        it("elimina una imagen concreta del producto", async () => {
            api.delete.mockResolvedValue({ data: null })

            await eliminarImagenProducto(4, 8)

            expect(api.delete).toHaveBeenCalledWith("/productos/4/imagenes/8")
        })
    })

    describe("eliminarTodasImagenesProducto", () => {
        it("elimina todas las imágenes del producto", async () => {
            api.delete.mockResolvedValue({ data: null })

            await eliminarTodasImagenesProducto(4)

            expect(api.delete).toHaveBeenCalledWith("/productos/4/imagenes")
        })
    })

    describe("setearStock", () => {
        it("fija el stock exacto como parámetro", async () => {
            api.put.mockResolvedValue({ data: { stock: 20 } })

            await setearStock(5, 20)

            expect(api.put).toHaveBeenCalledWith(
                "/productos/5/stock/setear",
                null,
                { params: { stock: 20 } }
            )
        })
    })

    describe("aumentarStock", () => {
        it("aumenta el stock con las unidades como parámetro", async () => {
            api.put.mockResolvedValue({ data: { stock: 15 } })

            await aumentarStock(5, 5)

            expect(api.put).toHaveBeenCalledWith(
                "/productos/5/stock/aumentar",
                null,
                { params: { unidades: 5 } }
            )
        })
    })

    describe("disminuirStock", () => {
        it("disminuye el stock con las unidades como parámetro", async () => {
            api.put.mockResolvedValue({ data: { stock: 3 } })

            await disminuirStock(5, 2)

            expect(api.put).toHaveBeenCalledWith(
                "/productos/5/stock/disminuir",
                null,
                { params: { unidades: 2 } }
            )
        })
    })

    describe("marcarImagenPrincipal", () => {
        it("marca la imagen como principal", async () => {
            api.put.mockResolvedValue({ data: null })

            await marcarImagenPrincipal(6, 11)

            expect(api.put).toHaveBeenCalledWith("/productos/6/imagenes/11/principal")
        })
    })
})
