import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// AdminControlProduct solo consume obtenerProductos.
vi.mock("../../services/productoService", () => ({ obtenerProductos: vi.fn() }))

import { obtenerProductos } from "../../services/productoService"
import { AdminControlProduct } from "../../pages/admin/AdminControlProduct"
import { AuthContext } from "../../context/authContext"

const productos = [
    { idProducto: 1, sku: "SKU-001", nombre: "Lápiz", precio: 1000, stock: 10 },
    { idProducto: 2, sku: "SKU-002", nombre: "Cuaderno", precio: 2000, stock: 5 }
]

const renderControl = (usuario, { estado } = {}) =>
    render(
        <AuthContext.Provider value={{ usuario, estaAutenticado: Boolean(usuario), token: "token-fake" }}>
            <MemoryRouter initialEntries={[estado ? { pathname: "/admin/productos", state: estado } : "/admin/productos"]}>
                <Routes>
                    <Route path="/admin/productos" element={<AdminControlProduct />} />
                    <Route path="/admin/productos/nuevo" element={<div>Formulario nuevo</div>} />
                    <Route path="/admin/productos/:idProducto" element={<div>Formulario producto</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )

const admin = { id: 1, rol: "admin" }
const vendedor = { id: 2, rol: "vendedor" }

describe("AdminControlProduct", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        obtenerProductos.mockResolvedValue(productos)
    })

    it("Lista los productos ordenados por SKU descendente para un admin", async () => {
        renderControl(admin)

        expect(await screen.findByText("Administración Productos")).toBeInTheDocument()
        const filas = screen.getAllByRole("row")
        // Primera fila de datos: SKU descendente => SKU-002 primero.
        expect(within(filas[1]).getByText("SKU-002")).toBeInTheDocument()
        // El admin puede editar cada producto.
        expect(screen.getByRole("button", { name: "Editar Lápiz" })).toBeInTheDocument()
    })

    it("Muestra la tabla sin acciones de edición para un vendedor", async () => {
        renderControl(vendedor)

        expect(await screen.findByText("Administración Productos")).toBeInTheDocument()
        expect(screen.getByText("Lápiz")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /^Editar/ })).not.toBeInTheDocument()
    })

    it("Filtra por nombre o SKU", async () => {
        renderControl(admin)
        await screen.findByText("Lápiz")

        fireEvent.change(screen.getByPlaceholderText("Buscar por nombre o ID"), { target: { value: "cuaderno" } })

        expect(screen.getByText("Cuaderno")).toBeInTheDocument()
        expect(screen.queryByText("Lápiz")).not.toBeInTheDocument()
    })

    it("Navega al formulario de nuevo producto", async () => {
        renderControl(admin)
        await screen.findByText("Lápiz")

        fireEvent.click(screen.getByRole("button", { name: "Nuevo producto" }))

        expect(await screen.findByText("Formulario nuevo")).toBeInTheDocument()
    })

    it("Navega al formulario del producto al editar", async () => {
        renderControl(admin)
        await screen.findByText("Lápiz")

        fireEvent.click(screen.getByRole("button", { name: "Editar Lápiz" }))

        expect(await screen.findByText("Formulario producto")).toBeInTheDocument()
    })

    it("Muestra un error si falla la carga de productos", async () => {
        obtenerProductos.mockRejectedValue(new Error("Fallo la carga"))

        renderControl(admin)

        expect(await screen.findByText("Fallo la carga")).toBeInTheDocument()
    })

    it("Muestra la alerta recibida por navegación", async () => {
        renderControl(admin, { estado: { mensajeAlerta: { type: "success", message: "Producto creado." } } })

        expect(await screen.findByText("Producto creado.")).toBeInTheDocument()
    })
})
