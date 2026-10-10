import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Servicios que consume el formulario de producto.
vi.mock("../../services/productoService", () => ({
    obtenerProductoPorId: vi.fn(),
    crearProducto: vi.fn(),
    actualizarProducto: vi.fn(),
    eliminarProducto: vi.fn(),
    subirImagenProducto: vi.fn(),
    eliminarImagenProducto: vi.fn(),
    marcarImagenPrincipal: vi.fn()
}))
vi.mock("../../services/marcaService", () => ({ obtenerMarcas: vi.fn() }))
vi.mock("../../services/categoriaService", () => ({ obtenerCategorias: vi.fn() }))

import {
    crearProducto,
    eliminarProducto,
    obtenerProductoPorId
} from "../../services/productoService"
import { obtenerMarcas } from "../../services/marcaService"
import { obtenerCategorias } from "../../services/categoriaService"
import { AdminProductForm } from "../../pages/admin/AdminProductForm"
import { AuthContext } from "../../context/authContext"

const producto = {
    sku: "SKU-009",
    nombre: "Notebook",
    descripcion: "Notebook 14",
    precio: 500000,
    stock: 3,
    marcaDetalle: { idMarca: 1, nombre: "Lenovo" },
    categorias: [{ idCategoria: 1, nombre: "Tecnología" }],
    imagenes: []
}

const renderForm = (ruta) =>
    render(
        <AuthContext.Provider value={{ usuario: { id: 1, rol: "admin" }, estaAutenticado: true, token: "token-fake" }}>
            <MemoryRouter initialEntries={[ruta]}>
                <Routes>
                    <Route path="/admin/productos/nuevo" element={<AdminProductForm />} />
                    <Route path="/admin/productos/:idProducto" element={<AdminProductForm />} />
                    <Route path="/admin/productos" element={<div>Lista productos</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )

describe("AdminProductForm", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        obtenerMarcas.mockResolvedValue([{ idMarca: 1, nombre: "Lenovo" }])
        obtenerCategorias.mockResolvedValue([{ idCategoria: 1, nombre: "Tecnología" }])
        obtenerProductoPorId.mockResolvedValue(producto)
    })

    it("Crea un producto tras confirmar y pasa a modo edición", async () => {
        crearProducto.mockResolvedValue({ idProducto: 9 })

        renderForm("/admin/productos/nuevo")
        await screen.findByLabelText("Tecnología")

        fireEvent.change(screen.getByLabelText("SKU"), { target: { value: "SKU-009" } })
        fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Notebook" } })
        fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Notebook 14" } })
        fireEvent.change(screen.getByLabelText("Precio"), { target: { value: "500000" } })
        fireEvent.change(screen.getByLabelText("Stock"), { target: { value: "3" } })
        fireEvent.change(screen.getByLabelText("Marca"), { target: { value: "1" } })
        fireEvent.click(screen.getByLabelText("Tecnología"))

        fireEvent.click(screen.getByRole("button", { name: "Guardar" }))
        expect(screen.getByText("¿Estás seguro de guardar el nuevo producto?")).toBeInTheDocument()

        const botones = screen.getAllByRole("button", { name: "Guardar" })
        fireEvent.click(botones[botones.length - 1])

        await waitFor(() => expect(crearProducto).toHaveBeenCalledTimes(1))
        expect(crearProducto.mock.calls[0][0]).toEqual({
            sku: "SKU-009",
            nombre: "Notebook",
            descripcion: "Notebook 14",
            precio: 500000,
            stock: 3,
            idMarca: 1,
            idCategorias: [1]
        })
        expect(await screen.findByText("Detalle producto id: 9")).toBeInTheDocument()
    })

    it("Valida que los campos sean obligatorios", async () => {
        renderForm("/admin/productos/nuevo")

        // Submit directo: los campos son `required` y jsdom bloquea el click.
        fireEvent.submit(screen.getByRole("button", { name: "Guardar" }).closest("form"))

        expect(await screen.findByText("Todos los campos son obligatorios.")).toBeInTheDocument()
        expect(crearProducto).not.toHaveBeenCalled()
    })

    it("Elimina un producto en modo edición y vuelve al listado", async () => {
        eliminarProducto.mockResolvedValue({})

        renderForm("/admin/productos/9")
        expect(await screen.findByText("Detalle producto id: 9")).toBeInTheDocument()
        await screen.findByDisplayValue("Notebook")

        fireEvent.click(screen.getByRole("button", { name: "Eliminar" }))
        expect(screen.getByText("¿Estás seguro de eliminar el producto 9?")).toBeInTheDocument()

        const botones = screen.getAllByRole("button", { name: "Eliminar" })
        fireEvent.click(botones[botones.length - 1])

        await waitFor(() => expect(eliminarProducto).toHaveBeenCalledWith("9"))
        expect(await screen.findByText("El producto se eliminó correctamente.")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Aceptar" }))
        expect(await screen.findByText("Lista productos")).toBeInTheDocument()
    })
})
