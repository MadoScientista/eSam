import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// AdminDashboard consume los tres servicios de resumen.
vi.mock("../../services/pedidoService", () => ({ obtenerPedidosAdmin: vi.fn() }))
vi.mock("../../services/productoService", () => ({ obtenerProductos: vi.fn() }))
vi.mock("../../services/usuarioService", () => ({ obtenerUsuarios: vi.fn() }))

import { obtenerPedidosAdmin } from "../../services/pedidoService"
import { obtenerProductos } from "../../services/productoService"
import { obtenerUsuarios } from "../../services/usuarioService"
import { AdminDashboard } from "../../pages/admin/AdminDashboard"
import { AuthContext } from "../../context/authContext"

// Envuelve la página en un AuthContext con el rol indicado.
const renderDashboard = (usuario) =>
    render(
        <AuthContext.Provider value={{ usuario, estaAutenticado: Boolean(usuario), token: "token-fake" }}>
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        </AuthContext.Provider>
    )

const productos = [{ stock: 5 }, { stock: 0 }]

describe("AdminDashboard", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("Muestra el resumen completo para un administrador", async () => {
        obtenerPedidosAdmin.mockResolvedValue([{ idPedido: 1 }, { idPedido: 2 }])
        obtenerProductos.mockResolvedValue(productos)
        obtenerUsuarios.mockResolvedValue([{ rol: "cliente" }, { rol: "vendedor" }, { rol: "admin" }])

        renderDashboard({ id: 1, rol: "admin" })

        const tarjetaCompras = (await screen.findByText("Compras")).closest(".admin-stat-card")
        expect(within(tarjetaCompras).getByText("2")).toBeInTheDocument()
        expect(screen.getByText("Con stock disponible / productos totales")).toBeInTheDocument()
        expect(screen.getByText("1 clientes · 1 vendedores · 1 administradores")).toBeInTheDocument()
        // El acceso a Usuarios solo está para admin.
        expect(screen.getByRole("link", { name: /Usuarios/ })).toBeInTheDocument()
        expect(obtenerUsuarios).toHaveBeenCalledTimes(1)
    })

    it("Oculta la sección de usuarios y ajusta los accesos para un vendedor", async () => {
        obtenerPedidosAdmin.mockResolvedValue([{ idPedido: 1 }])
        obtenerProductos.mockResolvedValue(productos)

        renderDashboard({ id: 2, rol: "vendedor" })

        expect(await screen.findByText("RESUMEN DE VENTAS")).toBeInTheDocument()
        expect(screen.getByText("Panel de vendedor")).toBeInTheDocument()
        expect(screen.queryByRole("link", { name: /Usuarios/ })).not.toBeInTheDocument()
        expect(screen.queryByText("Usuarios")).not.toBeInTheDocument()
        // Los textos de las tarjetas cambian para vendedor.
        expect(screen.getByText("Consulta el catálogo y el inventario.")).toBeInTheDocument()
        expect(screen.getByText("Consulta las categorías disponibles.")).toBeInTheDocument()
        expect(obtenerUsuarios).not.toHaveBeenCalled()
    })

    it("Muestra un error si el servidor devuelve un formato inesperado", async () => {
        obtenerPedidosAdmin.mockResolvedValue({ ordenes: [] })
        obtenerProductos.mockResolvedValue(productos)
        obtenerUsuarios.mockResolvedValue([])

        renderDashboard({ id: 1, rol: "admin" })

        expect(await screen.findByText("El servidor devolvió un formato de datos inesperado.")).toBeInTheDocument()
    })

    it("Muestra guiones mientras carga el resumen", () => {
        // Promesas pendientes: la vista permanece en estado de carga.
        obtenerPedidosAdmin.mockReturnValue(new Promise(() => {}))
        obtenerProductos.mockReturnValue(new Promise(() => {}))
        obtenerUsuarios.mockReturnValue(new Promise(() => {}))

        renderDashboard({ id: 1, rol: "admin" })

        expect(screen.getByText("Cargando distribución...")).toBeInTheDocument()
        expect(screen.getAllByText("—").length).toBeGreaterThan(0)
    })
})
