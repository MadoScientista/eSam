import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../services/api", () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn()
    }
}))

import { api } from "../../services/api"
import { crearPedido } from "../../services/pedidoService"

describe("crearPedido", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        api.post.mockResolvedValue({ data: { idPedido: 1, estado: "PENDIENTE" } })
    })

    it("envía modalidad e ID de dirección para despacho", async () => {
        await crearPedido("DESPACHO", 42)

        expect(api.post).toHaveBeenCalledWith("/pedidos", {
            tipoEntrega: "DESPACHO",
            idDireccion: 42
        })
    })

    it("omite dirección para retiro en tienda", async () => {
        await crearPedido("RETIRA_TIENDA")

        expect(api.post).toHaveBeenCalledWith("/pedidos", {
            tipoEntrega: "RETIRA_TIENDA"
        })
    })
})
