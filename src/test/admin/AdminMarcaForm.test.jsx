import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Servicios de marca usados por el formulario.
vi.mock("../../services/marcaService", () => ({
    obtenerMarcas: vi.fn(),
    crearMarca: vi.fn(),
    actualizarMarca: vi.fn(),
    eliminarMarca: vi.fn()
}))

import { crearMarca, eliminarMarca, obtenerMarcas } from "../../services/marcaService"
import { AdminMarcaForm } from "../../pages/admin/AdminMarcaForm"

const marcas = [{ idMarca: 3, nombre: "Torre" }]

const renderForm = (ruta) =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <Routes>
                <Route path="/admin/marcas/nuevo" element={<AdminMarcaForm />} />
                <Route path="/admin/marcas/:idMarca" element={<AdminMarcaForm />} />
                <Route path="/admin/marcas" element={<div>Lista marcas</div>} />
            </Routes>
        </MemoryRouter>
    )

describe("AdminMarcaForm", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        obtenerMarcas.mockResolvedValue(marcas)
    })

    it("Crea una marca tras confirmar y pasa a modo edición", async () => {
        crearMarca.mockResolvedValue({ idMarca: 9, nombre: "Papelería" })

        renderForm("/admin/marcas/nuevo")
        expect(screen.getByText("Nueva Marca")).toBeInTheDocument()

        fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Papelería" } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar" }))

        expect(screen.getByText("¿Estás seguro de guardar la nueva marca?")).toBeInTheDocument()
        const botones = screen.getAllByRole("button", { name: "Guardar" })
        fireEvent.click(botones[botones.length - 1])

        await waitFor(() => expect(crearMarca).toHaveBeenCalledWith({ nombre: "Papelería" }))
        expect(await screen.findByText("Editar marca id: 9")).toBeInTheDocument()
    })

    it("Valida el nombre de la marca", async () => {
        renderForm("/admin/marcas/nuevo")

        fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "   " } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar" }))

        expect(await screen.findByText("El nombre es obligatorio.")).toBeInTheDocument()
        expect(crearMarca).not.toHaveBeenCalled()
    })

    it("Elimina una marca en modo edición y vuelve al listado", async () => {
        eliminarMarca.mockResolvedValue({})

        renderForm("/admin/marcas/3")
        expect(await screen.findByText("Editar marca id: 3")).toBeInTheDocument()
        await screen.findByDisplayValue("Torre")

        fireEvent.click(screen.getByRole("button", { name: "Eliminar" }))
        expect(screen.getByText("¿Estás seguro de eliminar la marca 3?")).toBeInTheDocument()

        const botones = screen.getAllByRole("button", { name: "Eliminar" })
        fireEvent.click(botones[botones.length - 1])

        await waitFor(() => expect(eliminarMarca).toHaveBeenCalledWith("3"))
        expect(await screen.findByText("La marca 3 fue eliminada.")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Aceptar" }))
        expect(await screen.findByText("Lista marcas")).toBeInTheDocument()
    })
})
