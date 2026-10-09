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
    actualizarMarca,
    crearMarca,
    eliminarMarca,
    obtenerMarcas
} from "../../services/marcaService"

describe("marcaService", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe("obtenerMarcas", () => {
        it("obtiene todas las marcas desde /marcas", async () => {
            const marcas = [{ idMarca: 1, nombre: "Faber" }]
            api.get.mockResolvedValue({ data: marcas })

            const resultado = await obtenerMarcas()

            expect(api.get).toHaveBeenCalledWith("/marcas")
            expect(resultado).toEqual(marcas)
        })
    })

    describe("crearMarca", () => {
        it("envía la marca por POST a /marcas", async () => {
            const marca = { nombre: "Faber" }
            api.post.mockResolvedValue({ data: { idMarca: 1, ...marca } })

            const resultado = await crearMarca(marca)

            expect(api.post).toHaveBeenCalledWith("/marcas", marca)
            expect(resultado).toEqual({ idMarca: 1, ...marca })
        })
    })

    describe("actualizarMarca", () => {
        it("actualiza con PUT y el id en la ruta", async () => {
            const marca = { nombre: "Faber-Castell" }
            api.put.mockResolvedValue({ data: marca })

            await actualizarMarca(1, marca)

            expect(api.put).toHaveBeenCalledWith("/marcas/1", marca)
        })
    })

    describe("eliminarMarca", () => {
        it("elimina por DELETE con el id en la ruta", async () => {
            api.delete.mockResolvedValue({ data: null })

            await eliminarMarca(1)

            expect(api.delete).toHaveBeenCalledWith("/marcas/1")
        })
    })
})