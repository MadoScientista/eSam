import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock del servicio: CustomerOrders solo consume obtenerMisPedidos.
vi.mock("../../services/pedidoService", () => ({
    obtenerMisPedidos: vi.fn()
}))

import { obtenerMisPedidos } from "../../services/pedidoService"
import { CustomerOrders } from "../../pages/CustomerOrders"

// Fila mínima del historial (PedidoResumenDTOResponse).
const pedidoResumen = (overrides = {}) => ({
    idPedido: 1,
    estado: "PENDIENTE",
    total: 2490,
    cantidadItems: 2,
    creadoEn: "2026-01-15T12:30:00Z",
    ...overrides
})

// Render con rutas para el enlace al detalle y a productos.
const renderCustomerOrders = () =>
    render(
        <MemoryRouter initialEntries={["/usuario/pedidos"]}>
            <Routes>
                <Route path="/usuario/pedidos" element={<CustomerOrders />} />
                <Route path="/usuario/pedidos/:idPedido" element={<div>Página detalle</div>} />
                <Route path="/productos" element={<div>Página productos</div>} />
            </Routes>
        </MemoryRouter>
    )

describe("CustomerOrders", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("Muestra el estado de carga mientras obtiene el historial", () => {
        // Promesa pendiente: la vista permanece en "Cargando pedidos...".
        obtenerMisPedidos.mockReturnValue(new Promise(() => {}))

        renderCustomerOrders()

        expect(screen.getByText("Cargando pedidos...")).toBeInTheDocument()
    })

    it("Muestra la tabla con los pedidos del cliente", async () => {
        obtenerMisPedidos.mockResolvedValue([
            pedidoResumen({ idPedido: 1, estado: "PENDIENTE", total: 2490, cantidadItems: 2 }),
            pedidoResumen({ idPedido: 2, estado: "ENTREGADO", total: 5430, cantidadItems: 3 })
        ])

        renderCustomerOrders()

        expect(await screen.findByText("#1")).toBeInTheDocument()
        expect(screen.getByText("#2")).toBeInTheDocument()
        expect(screen.getByText("$2.490")).toBeInTheDocument()
        expect(screen.getByText("$5.430")).toBeInTheDocument()
        // Dos badges de estado, uno por fila.
        expect(screen.getByText("PENDIENTE")).toBeInTheDocument()
        expect(screen.getByText("ENTREGADO")).toBeInTheDocument()
        // Enlace al detalle con el id correcto.
        expect(screen.getAllByRole("link", { name: "Ver detalle" })[0]).toHaveAttribute("href", "/usuario/pedidos/1")
    })

    it("Muestra datos alternativos cuando faltan fecha o cantidad de artículos", async () => {
        obtenerMisPedidos.mockResolvedValue([
            pedidoResumen({ creadoEn: null, cantidadItems: null })
        ])

        renderCustomerOrders()

        expect(await screen.findByText("#1")).toBeInTheDocument()
        // Fecha y artículos caen al guion largo.
        expect(screen.getAllByText("—")).toHaveLength(2)
    })

    it("Muestra estado vacío cuando no hay pedidos", async () => {
        obtenerMisPedidos.mockResolvedValue([])

        renderCustomerOrders()

        expect(await screen.findByText("Aún no tienes pedidos registrados.")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Ver productos" })).toBeInTheDocument()
    })

    it("Muestra el error de carga y permite cerrarlo", async () => {
        obtenerMisPedidos.mockRejectedValue(new Error("Error de red"))

        renderCustomerOrders()

        expect(await screen.findByText("Error de red")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Cerrar" }))
        await waitFor(() => expect(screen.queryByText("Error de red")).not.toBeInTheDocument())
    })

    it("Muestra error si el servidor devuelve un formato inesperado", async () => {
        // Un objeto no-array no es un historial válido.
        obtenerMisPedidos.mockResolvedValue({ pedidos: [] })

        renderCustomerOrders()

        expect(await screen.findByText("El servidor devolvió un formato de pedidos inesperado.")).toBeInTheDocument()
    })
})
