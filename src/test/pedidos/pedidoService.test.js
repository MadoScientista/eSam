import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../services/api", () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn()
    }
}))

import { api } from "../../services/api"
import {
    actualizarEstadoPedido,
    crearPedido,
    obtenerMisPedidos,
    obtenerMiPedido,
    obtenerPedidoAdmin,
    obtenerPedidosAdmin
} from "../../services/pedidoService"

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

describe("obtenerMisPedidos", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("obtiene el historial desde /pedidos", async () => {
        const pedidos = [{ idPedido: 1 }, { idPedido: 2 }]
        api.get.mockResolvedValue({ data: pedidos })

        const resultado = await obtenerMisPedidos()

        expect(api.get).toHaveBeenCalledWith("/pedidos")
        expect(resultado).toEqual(pedidos)
    })
})

describe("obtenerMiPedido", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("obtiene el detalle del pedido propio por id", async () => {
        const pedido = { idPedido: 7, estado: "ENVIADO" }
        api.get.mockResolvedValue({ data: pedido })

        const resultado = await obtenerMiPedido(7)

        expect(api.get).toHaveBeenCalledWith("/pedidos/7")
        expect(resultado).toEqual(pedido)
    })
})

describe("obtenerPedidosAdmin", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("obtiene todos los pedidos desde /pedidos/admin", async () => {
        const pedidos = [{ idPedido: 1 }]
        api.get.mockResolvedValue({ data: pedidos })

        const resultado = await obtenerPedidosAdmin()

        expect(api.get).toHaveBeenCalledWith("/pedidos/admin")
        expect(resultado).toEqual(pedidos)
    })
})

describe("obtenerPedidoAdmin", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("obtiene un pedido por id desde /pedidos/admin", async () => {
        api.get.mockResolvedValue({ data: { idPedido: 3 } })

        await obtenerPedidoAdmin(3)

        expect(api.get).toHaveBeenCalledWith("/pedidos/admin/3")
    })
})

describe("actualizarEstadoPedido", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("envía el nuevo estado por PUT a la ruta de admin", async () => {
        api.put.mockResolvedValue({ data: { idPedido: 3, estado: "ENTREGADO" } })

        await actualizarEstadoPedido(3, "ENTREGADO")

        expect(api.put).toHaveBeenCalledWith("/pedidos/admin/3/estado", {
            estado: "ENTREGADO"
        })
    })
})
