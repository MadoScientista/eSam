import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// AdminControlMarca solo consume obtenerMarcas.
vi.mock("../../services/marcaService", () => ({ obtenerMarcas: vi.fn() }))

import { obtenerMarcas } from "../../services/marcaService"
import { AdminControlMarca } from "../../pages/admin/AdminControlMarca"
import { AuthContext } from "../../context/authContext"

const marcas = [
    { idMarca: 1, nombre: "Torre" },
    { idMarca: 2, nombre: "Lenovo" }
]

const renderControl = (usuario) =>
    render(
        <AuthContext.Provider value={{ usuario, estaAutenticado: Boolean(usuario), token: "token-fake" }}>
            <MemoryRouter initialEntries={["/admin/marcas"]}>
                <Routes>
                    <Route path="/admin/marcas" element={<AdminControlMarca />} />
                    <Route path="/admin/marcas/nuevo" element={<div>Formulario nueva marca</div>} />
                    <Route path="/admin/marcas/:idMarca" element={<div>Formulario marca</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )

const admin = { id: 1, rol: "admin" }
const vendedor = { id: 2, rol: "vendedor" }

describe("AdminControlMarca", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        obtenerMarcas.mockResolvedValue(marcas)
    })

    it("Lista las marcas con acciones de edición para un admin", async () => {
        renderControl(admin)

        expect(await screen.findByText("Torre")).toBeInTheDocument()
        expect(screen.getByText("Lenovo")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Editar Torre" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Nueva marca" })).toBeInTheDocument()
    })

    it("Oculta las acciones de edición para un vendedor", async () => {
        renderControl(vendedor)

        expect(await screen.findByText("Torre")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Nueva marca" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /^Editar/ })).not.toBeInTheDocument()
    })

    it("Filtra por nombre", async () => {
        renderControl(admin)
        await screen.findByText("Torre")

        fireEvent.change(screen.getByPlaceholderText("Buscar por nombre o ID"), { target: { value: "leno" } })

        expect(screen.getByText("Lenovo")).toBeInTheDocument()
        expect(screen.queryByText("Torre")).not.toBeInTheDocument()
    })

    it("Navega al formulario de nueva marca", async () => {
        renderControl(admin)
        await screen.findByText("Torre")

        fireEvent.click(screen.getByRole("button", { name: "Nueva marca" }))

        expect(await screen.findByText("Formulario nueva marca")).toBeInTheDocument()
    })

    it("Navega al formulario de edición", async () => {
        renderControl(admin)
        await screen.findByText("Torre")

        fireEvent.click(screen.getByRole("button", { name: "Editar Torre" }))

        expect(await screen.findByText("Formulario marca")).toBeInTheDocument()
    })

    it("Muestra un error si falla la carga", async () => {
        obtenerMarcas.mockRejectedValue(new Error("Fallo marcas"))

        renderControl(admin)

        expect(await screen.findByText("Fallo marcas")).toBeInTheDocument()
    })
})
