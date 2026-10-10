import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// AdminControlUser solo consume obtenerUsuarios.
vi.mock("../../services/usuarioService", () => ({ obtenerUsuarios: vi.fn() }))

import { obtenerUsuarios } from "../../services/usuarioService"
import { AdminControlUser } from "../../pages/admin/AdminControlUser"

const usuarios = [
    { id: 1, rol: "admin", nombres: "Ana", aPaterno: "López", correo: "ana@duoc.cl" },
    { id: 2, rol: "cliente", nombres: "Bruno", aPaterno: "Pérez", correo: "bruno@gmail.com" }
]

const renderControl = () =>
    render(
        <MemoryRouter initialEntries={["/admin/usuarios"]}>
            <Routes>
                <Route path="/admin/usuarios" element={<AdminControlUser />} />
                <Route path="/admin/usuarios/nuevo" element={<div>Formulario nuevo usuario</div>} />
                <Route path="/admin/usuarios/:id" element={<div>Formulario usuario</div>} />
            </Routes>
        </MemoryRouter>
    )

describe("AdminControlUser", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("Lista los usuarios con su rol", async () => {
        obtenerUsuarios.mockResolvedValue(usuarios)

        renderControl()

        const fila = (await screen.findByText("Ana")).closest("tr")
        expect(within(fila).getByText("admin")).toBeInTheDocument()
        expect(within(fila).getByText("ana@duoc.cl")).toBeInTheDocument()
        expect(screen.getByText("Bruno")).toBeInTheDocument()
    })

    it("Permite abrir el formulario de un usuario", async () => {
        obtenerUsuarios.mockResolvedValue(usuarios)

        renderControl()

        const fila = (await screen.findByText("Ana")).closest("tr")
        fireEvent.click(within(fila).getByRole("button"))

        expect(await screen.findByText("Formulario usuario")).toBeInTheDocument()
    })

    it("Navega al formulario de nuevo usuario", async () => {
        obtenerUsuarios.mockResolvedValue(usuarios)

        renderControl()
        await screen.findByText("Ana")

        fireEvent.click(screen.getByRole("button", { name: "Nuevo usuario" }))

        expect(await screen.findByText("Formulario nuevo usuario")).toBeInTheDocument()
    })

    it("Muestra un error si falla la carga", async () => {
        obtenerUsuarios.mockRejectedValue(new Error("Fallo usuarios"))

        renderControl()

        expect(await screen.findByText("Fallo usuarios")).toBeInTheDocument()
    })
})
