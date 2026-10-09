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
    actualizarDireccion,
    crearDireccion,
    eliminarDireccion,
    obtenerDireccion,
    obtenerDirecciones,
    obtenerDireccionesActivas,
    obtenerDireccionesUsuario
} from "../../services/direccionService"

describe("direccionService", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe("obtenerDirecciones", () => {
        it("obtiene las direcciones del usuario autenticado", async () => {
            const direcciones = [{ idDireccion: 1, calle: "Av. Central" }]
            api.get.mockResolvedValue({ data: direcciones })

            const resultado = await obtenerDirecciones()

            expect(api.get).toHaveBeenCalledWith("/direcciones")
            expect(resultado).toEqual(direcciones)
        })
    })

    describe("obtenerDireccionesUsuario", () => {
        it("obtiene las direcciones de un usuario por id", async () => {
            api.get.mockResolvedValue({ data: [] })

            await obtenerDireccionesUsuario(5)

            expect(api.get).toHaveBeenCalledWith("/direcciones/usuario/5")
        })
    })

    describe("obtenerDireccionesActivas", () => {
        it("obtiene sólo las direcciones activas", async () => {
            api.get.mockResolvedValue({ data: [] })

            await obtenerDireccionesActivas(5)

            expect(api.get).toHaveBeenCalledWith("/direcciones/usuario/5/activas")
        })
    })

    describe("obtenerDireccion", () => {
        it("obtiene una dirección por id", async () => {
            const direccion = { idDireccion: 9, calle: "Calle Uno" }
            api.get.mockResolvedValue({ data: direccion })

            const resultado = await obtenerDireccion(9)

            expect(api.get).toHaveBeenCalledWith("/direcciones/9")
            expect(resultado).toEqual(direccion)
        })
    })

    describe("crearDireccion", () => {
        it("envía la dirección por POST a /direcciones", async () => {
            const direccion = { idUsuario: 5, calle: "Calle Uno" }
            api.post.mockResolvedValue({ data: { idDireccion: 9, ...direccion } })

            const resultado = await crearDireccion(direccion)

            expect(api.post).toHaveBeenCalledWith("/direcciones", direccion)
            expect(resultado).toEqual({ idDireccion: 9, ...direccion })
        })
    })

    describe("actualizarDireccion", () => {
        it("actualiza con PUT y el id en la ruta", async () => {
            const direccion = { calle: "Calle Nueva" }
            api.put.mockResolvedValue({ data: direccion })

            await actualizarDireccion(9, direccion)

            expect(api.put).toHaveBeenCalledWith("/direcciones/9", direccion)
        })
    })

    describe("eliminarDireccion", () => {
        it("elimina por DELETE con el id en la ruta", async () => {
            api.delete.mockResolvedValue({ data: null })

            await eliminarDireccion(9)

            expect(api.delete).toHaveBeenCalledWith("/direcciones/9")
        })
    })
})