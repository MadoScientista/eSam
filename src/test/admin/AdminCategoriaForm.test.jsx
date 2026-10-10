import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Servicios de categoría (el formulario y CategoriaImagenAdmin usan varios).
vi.mock("../../services/categoriaService", () => ({
    obtenerCategorias: vi.fn(),
    crearCategoria: vi.fn(),
    actualizarCategoria: vi.fn(),
    eliminarCategoria: vi.fn(),
    subirImagenCategoria: vi.fn(),
    eliminarImagenCategoria: vi.fn()
}))

import {
    crearCategoria,
    eliminarCategoria,
    obtenerCategorias
} from "../../services/categoriaService"
import { AdminCategoriaForm } from "../../pages/admin/AdminCategoriaForm"

const categorias = [
    { idCategoria: 3, nombre: "Cuadernos", idCategoriaPadre: null, imagenUrl: null }
]

const renderForm = (ruta) =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <Routes>
                <Route path="/admin/categorias/nuevo" element={<AdminCategoriaForm />} />
                <Route path="/admin/categorias/:idCategoria" element={<AdminCategoriaForm />} />
                <Route path="/admin/categorias" element={<div>Lista categorías</div>} />
            </Routes>
        </MemoryRouter>
    )

describe("AdminCategoriaForm", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        obtenerCategorias.mockResolvedValue(categorias)
    })

    it("Crea una categoría tras confirmar y pasa a modo edición", async () => {
        crearCategoria.mockResolvedValue({ idCategoria: 5, nombre: "Libros", idCategoriaPadre: null })

        renderForm("/admin/categorias/nuevo")
        expect(screen.getByText("Nueva Categoría")).toBeInTheDocument()

        fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Libros" } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar" }))

        expect(screen.getByText("¿Estás seguro de guardar la nueva categoría?")).toBeInTheDocument()
        const botones = screen.getAllByRole("button", { name: "Guardar" })
        fireEvent.click(botones[botones.length - 1])

        await waitFor(() => expect(crearCategoria).toHaveBeenCalledWith({ nombre: "Libros", idCategoriaPadre: null }))
        expect(await screen.findByText("Editar categoría id: 5")).toBeInTheDocument()
    })

    it("Valida el nombre de la categoría", async () => {
        renderForm("/admin/categorias/nuevo")

        fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "   " } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar" }))

        expect(await screen.findByText("El nombre es obligatorio.")).toBeInTheDocument()
        expect(crearCategoria).not.toHaveBeenCalled()
    })

    it("Elimina una categoría en modo edición y vuelve al listado", async () => {
        eliminarCategoria.mockResolvedValue({})

        renderForm("/admin/categorias/3")
        expect(await screen.findByText("Editar categoría id: 3")).toBeInTheDocument()
        await screen.findByDisplayValue("Cuadernos")

        fireEvent.click(screen.getByRole("button", { name: "Eliminar" }))
        expect(screen.getByText("¿Estás seguro de eliminar la categoría 3?")).toBeInTheDocument()

        const botones = screen.getAllByRole("button", { name: "Eliminar" })
        fireEvent.click(botones[botones.length - 1])

        await waitFor(() => expect(eliminarCategoria).toHaveBeenCalledWith("3"))
        expect(await screen.findByText("La categoría 3 fue eliminada.")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Aceptar" }))
        expect(await screen.findByText("Lista categorías")).toBeInTheDocument()
    })
})
