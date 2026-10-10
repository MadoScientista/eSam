import { fireEvent, render, screen, within, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

// AdminOrders consume el listado de pedidos admin y el cambio de estado.
vi.mock("../../services/pedidoService", () => ({
    obtenerPedidosAdmin: vi.fn(),
    actualizarEstadoPedido: vi.fn()
}))

import { obtenerPedidosAdmin, actualizarEstadoPedido } from "../../services/pedidoService"
import { AdminOrders } from "../../pages/admin/AdminOrders"

// PedidoAdminDTOResponse mínimo: el total de artículos se suma desde `detalles`.
const orden = (overrides = {}) => ({
    idPedido: 5,
    estado: "PENDIENTE",
    total: 2490,
    creadoEn: "2026-01-15T12:30:00Z",
    detalles: [{ cantidad: 2 }, { cantidad: 3 }],
    ...overrides
})

describe("AdminOrders", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("Muestra el estado de carga mientras obtiene las órdenes", () => {
        obtenerPedidosAdmin.mockReturnValue(new Promise(() => {}))

        render(<AdminOrders />)

        expect(screen.getByText("Cargando órdenes...")).toBeInTheDocument()
        expect(screen.getByText("Cargando...")).toBeInTheDocument()
    })

    it("Lista las órdenes con estado, artículos y acciones disponibles", async () => {
        obtenerPedidosAdmin.mockResolvedValue([orden()])

        render(<AdminOrders />)

        const fila = (await screen.findByText("#5")).closest("tr")
        expect(within(fila).getByText("5")).toBeInTheDocument()
        expect(within(fila).getByText("$2.490")).toBeInTheDocument()
        expect(within(fila).getByText("PENDIENTE")).toBeInTheDocument()
        expect(within(fila).getByRole("button", { name: "Confirmar pago" })).toBeInTheDocument()
        expect(within(fila).getByRole("button", { name: "Cancelar pedido" })).toBeInTheDocument()
    })

    it("Muestra 'Sin acciones disponibles' en un estado final", async () => {
        obtenerPedidosAdmin.mockResolvedValue([orden({ estado: "ENTREGADO" })])

        render(<AdminOrders />)

        expect(await screen.findByText("Sin acciones disponibles")).toBeInTheDocument()
    })

    it("Muestra estado vacío cuando no hay órdenes", async () => {
        obtenerPedidosAdmin.mockResolvedValue([])

        render(<AdminOrders />)

        expect(await screen.findByText("Todavía no hay órdenes registradas.")).toBeInTheDocument()
    })

    it("Muestra el error de carga", async () => {
        obtenerPedidosAdmin.mockRejectedValue(new Error("Error de red"))

        render(<AdminOrders />)

        expect(await screen.findByText("Error de red")).toBeInTheDocument()
        expect(screen.getByText("No fue posible mostrar las órdenes.")).toBeInTheDocument()
    })

    it("Confirma un cambio de estado exitoso", async () => {
        obtenerPedidosAdmin.mockResolvedValue([orden()])
        actualizarEstadoPedido.mockResolvedValue({ idPedido: 5, estado: "CONFIRMADO" })

        render(<AdminOrders />)
        fireEvent.click(await screen.findByRole("button", { name: "Confirmar pago" }))

        // El modal aparece con el texto de confirmación específico.
        expect(screen.getByText(/Se registrará el pago aceptado/)).toBeInTheDocument()

        // El botón de confirmar del modal es el último con ese texto.
        const botones = screen.getAllByRole("button", { name: "Confirmar pago" })
        fireEvent.click(botones[botones.length - 1])

        await waitFor(() => expect(actualizarEstadoPedido).toHaveBeenCalledWith(5, "CONFIRMADO"))
        expect(await screen.findByText("El pedido #5 quedó en estado CONFIRMADO.")).toBeInTheDocument()
        expect(screen.getByText("CONFIRMADO")).toBeInTheDocument()
    })

    it("Muestra el error cuando la transición no está permitida", async () => {
        obtenerPedidosAdmin.mockResolvedValue([orden()])
        const error = Object.assign(new Error("conflicto"), { status: 400, code: "PEDIDO_INVALIDO" })
        actualizarEstadoPedido.mockRejectedValue(error)

        render(<AdminOrders />)
        fireEvent.click(await screen.findByRole("button", { name: "Confirmar pago" }))

        const botones = screen.getAllByRole("button", { name: "Confirmar pago" })
        fireEvent.click(botones[botones.length - 1])

        expect(await screen.findByText("La transición de estado no está permitida para este pedido.")).toBeInTheDocument()
    })
})
