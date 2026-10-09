import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../services/api", () => ({
    api: {
        get: vi.fn()
    }
}))

import { api } from "../../services/api"
import {
    obtenerComunas,
    obtenerRegiones,
    obtenerRegionesComunas
} from "../../services/regionComunaService"

describe("regionComunaService", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe("obtenerRegionesComunas", () => {
        it("obtiene las regiones con sus comunas", async () => {
            const regiones = [
                { idRegion: 1, region: "Metropolitana", comunas: [{ idComuna: 1, nombre: "Santiago" }] }
            ]
            api.get.mockResolvedValue({ data: regiones })

            const resultado = await obtenerRegionesComunas()

            expect(api.get).toHaveBeenCalledWith("/regiones/comunas")
            expect(resultado).toEqual(regiones)
        })
    })

    describe("obtenerRegiones", () => {
        it("obtiene todas las regiones", async () => {
            const regiones = [{ idRegion: 1, nombre: "Metropolitana" }]
            api.get.mockResolvedValue({ data: regiones })

            const resultado = await obtenerRegiones()

            expect(api.get).toHaveBeenCalledWith("/regiones")
            expect(resultado).toEqual(regiones)
        })
    })

    describe("obtenerComunas", () => {
        it("obtiene todas las comunas", async () => {
            const comunas = [{ idComuna: 1, nombre: "Santiago", idRegion: 1 }]
            api.get.mockResolvedValue({ data: comunas })

            const resultado = await obtenerComunas()

            expect(api.get).toHaveBeenCalledWith("/comunas")
            expect(resultado).toEqual(comunas)
        })
    })
})