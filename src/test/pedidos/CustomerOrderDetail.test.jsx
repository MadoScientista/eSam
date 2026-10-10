import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock del servicio: CustomerOrderDetail solo consume obtenerMiPedido.
vi.mock("../../services/pedidoService", () => ({
    obtenerMiPedido: vi.fn()
}))

import { obtenerMiPedido } from "../../services/pedidoService"
import { CustomerOrderDetail } from "../../pages/CustomerOrderDetail"

// Detalle mínimo de pedido propio para poblar la vista.
const pedidoDetalle = (overrides = {}) => ({
    idPedido: 7,
    estado: "PENDIENTE",
    creadoEn: "2026-01-15T12:30:00Z",
    tipoEntrega: "RETIRA_TIENDA",
    total: 2490,
    detalles: [
        { idDetallePedido: 1, cantidad: 2, nombreProducto: "Cuaderno", skuProducto: "SKU-1", subtotal: 4980 }
    ],
    envio: null,
    historialEstados: [
        { estadoAnterior: null, estadoNuevo: "PENDIENTE", cambiadoEn: "2026-01-15T12:30:00Z" }
    ],
    ...overrides
})

// Render en la ruta /usuario/pedidos/:idPedido con el id indicado.
const renderCustomerOrderDetail = (id = 7) =>
    render(
        <MemoryRouter initialEntries={[`/usuario/pedidos/${id}`]}>
            <Routes>
                <Route path="/usuario/pedidos/:idPedido" element={<CustomerOrderDetail />} />
                <Route path="/usuario/pedidos" element={<div>Página mis pedidos</div>} />
            </Routes>
        </MemoryRouter>
    )

describe("CustomerOrderDetail", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("Muestra el estado de carga mientras obtiene el pedido", () => {
        obtenerMiPedido.mockReturnValue(new Promise(() => {}))

        renderCustomerOrderDetail()

        expect(screen.getByText("Cargando pedido...")).toBeInTheDocument()
        expect(obtenerMiPedido).toHaveBeenCalledWith("7")
    })

    it("Muestra el detalle de un pedido con retiro en tienda", async () => {
        obtenerMiPedido.mockResolvedValue(pedidoDetalle())

        renderCustomerOrderDetail()

        expect(await screen.findByText("#7")).toBeInTheDocument()
        expect(screen.getByText("2 × Cuaderno")).toBeInTheDocument()
        expect(screen.getByText("SKU SKU-1")).toBeInTheDocument()
        expect(screen.getByText("$4.980")).toBeInTheDocument()
        // Sin despacho: retiro en tienda y sin bloque de envío.
        expect(screen.getByText("Retiro en tienda")).toBeInTheDocument()
        expect(screen.queryByText("Recibe:")).not.toBeInTheDocument()
    })

    it("Muestra los datos de envío en un pedido con despacho", async () => {
        obtenerMiPedido.mockResolvedValue(pedidoDetalle({
            tipoEntrega: "DESPACHO",
            envio: {
                nombreReceptor: "Ana López",
                telefonoReceptor: "+56912345678",
                calle: "Av. Siempre Viva",
                numero: "742",
                complemento: "Depto 3",
                comunaNombre: "Santiago",
                regionNombre: "Metropolitana"
            }
        }))

        renderCustomerOrderDetail()

        expect(await screen.findByText("Despacho a domicilio")).toBeInTheDocument()
        expect(screen.getByText("Ana López")).toBeInTheDocument()
        expect(screen.getByText("+56912345678")).toBeInTheDocument()
        expect(screen.getByText("Av. Siempre Viva 742, Depto 3, Santiago, Metropolitana")).toBeInTheDocument()
    })

    it("Muestra la explicación del estado y el historial de cambios", async () => {
        obtenerMiPedido.mockResolvedValue(pedidoDetalle({
            estado: "ENVIADO",
            historialEstados: [
                { estadoAnterior: null, estadoNuevo: "PENDIENTE", cambiadoEn: "2026-01-15T12:30:00Z" },
                { estadoAnterior: "CONFIRMADO", estadoNuevo: "ENVIADO", cambiadoEn: "2026-01-16T09:00:00Z" }
            ]
        }))

        renderCustomerOrderDetail()

        // Explicación propia del estado actual.
        expect(await screen.findByText("El pedido está en camino.")).toBeInTheDocument()
        // Historial: el primer evento es la creación y el segundo una transición.
        expect(screen.getByText("Creado en PENDIENTE")).toBeInTheDocument()
        expect(screen.getByText("CONFIRMADO → ENVIADO")).toBeInTheDocument()
    })

    it("Muestra mensaje de 404 cuando el pedido no existe o no es del usuario", async () => {
        const noEncontrado = new Error("Pedido no encontrado")
        noEncontrado.status = 404
        noEncontrado.code = "PEDIDO_NO_ENCONTRADO"
        obtenerMiPedido.mockRejectedValue(noEncontrado)

        renderCustomerOrderDetail()

        expect(await screen.findByText("No encontramos este pedido, o no pertenece a tu cuenta.")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Volver a mis pedidos" })).toBeInTheDocument()
    })

    it("Muestra error genérico al fallar la carga del pedido", async () => {
        obtenerMiPedido.mockRejectedValue(new Error("Error de red"))

        renderCustomerOrderDetail()

        expect(await screen.findByText("Error de red")).toBeInTheDocument()
    })

    it("Muestra error si el servidor devuelve un formato inesperado", async () => {
        obtenerMiPedido.mockResolvedValue({ estado: "PENDIENTE" })

        renderCustomerOrderDetail()

        expect(await screen.findByText("El servidor devolvió un pedido con formato inesperado.")).toBeInTheDocument()
    })
})
