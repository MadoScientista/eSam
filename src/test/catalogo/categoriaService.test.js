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
    actualizarCategoria,
    crearCategoria,
    eliminarCategoria,
    eliminarImagenCategoria,
    obtenerCategoria,
    obtenerCategorias,
    obtenerCategoriasPorPadre,
    obtenerCategoriasRaiz,
    subirImagenCategoria
} from "../../services/categoriaService"

describe("categoriaService", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe("obtenerCategorias", () => {
        it("obtiene todas las categorías desde /categorias", async () => {
            const categorias = [{ idCategoria: 1, nombre: "Papelería" }]
            api.get.mockResolvedValue({ data: categorias })

            const resultado = await obtenerCategorias()

            expect(api.get).toHaveBeenCalledWith("/categorias")
            expect(resultado).toEqual(categorias)
        })
    })

    describe("obtenerCategoriasRaiz", () => {
        it("obtiene las categorías de primer nivel", async () => {
            const raiz = [{ idCategoria: 1, idCategoriaPadre: null }]
            api.get.mockResolvedValue({ data: raiz })

            const resultado = await obtenerCategoriasRaiz()

            expect(api.get).toHaveBeenCalledWith("/categorias/raiz")
            expect(resultado).toEqual(raiz)
        })
    })

    describe("obtenerCategoriasPorPadre", () => {
        it("obtiene las hijas del padre indicado", async () => {
            api.get.mockResolvedValue({ data: [] })

            await obtenerCategoriasPorPadre(3)

            expect(api.get).toHaveBeenCalledWith("/categorias/padre/3")
        })
    })

    describe("obtenerCategoria", () => {
        it("obtiene una categoría por su id", async () => {
            const categoria = { idCategoria: 5, nombre: "Cuadernos" }
            api.get.mockResolvedValue({ data: categoria })

            const resultado = await obtenerCategoria(5)

            expect(api.get).toHaveBeenCalledWith("/categorias/5")
            expect(resultado).toEqual(categoria)
        })
    })

    describe("crearCategoria", () => {
        it("envía la categoría por POST a /categorias", async () => {
            const categoria = { nombre: "Pintura" }
            api.post.mockResolvedValue({ data: { idCategoria: 9, ...categoria } })

            const resultado = await crearCategoria(categoria)

            expect(api.post).toHaveBeenCalledWith("/categorias", categoria)
            expect(resultado).toEqual({ idCategoria: 9, ...categoria })
        })
    })

    describe("actualizarCategoria", () => {
        it("actualiza con PUT y el id en la ruta", async () => {
            const categoria = { nombre: "Pintura artística" }
            api.put.mockResolvedValue({ data: categoria })

            await actualizarCategoria(9, categoria)

            expect(api.put).toHaveBeenCalledWith("/categorias/9", categoria)
        })
    })

    describe("eliminarCategoria", () => {
        it("elimina por DELETE con el id en la ruta", async () => {
            api.delete.mockResolvedValue({ data: null })

            await eliminarCategoria(9)

            expect(api.delete).toHaveBeenCalledWith("/categorias/9")
        })
    })

    describe("subirImagenCategoria", () => {
        it("envía multipart/form-data con el campo file", async () => {
            const archivo = new File(["contenido"], "portada.png", { type: "image/png" })
            api.post.mockResolvedValue({ data: { idCategoria: 9 } })

            await subirImagenCategoria(9, archivo)

            const [ruta, formData] = api.post.mock.calls[0]

            expect(ruta).toBe("/categorias/9/imagen")
            expect(formData).toBeInstanceOf(FormData)
            expect(formData.get("file")).toBe(archivo)
        })
    })

    describe("eliminarImagenCategoria", () => {
        it("elimina la imagen de portada de la categoría", async () => {
            api.delete.mockResolvedValue({ data: null })

            await eliminarImagenCategoria(9)

            expect(api.delete).toHaveBeenCalledWith("/categorias/9/imagen")
        })
    })
})