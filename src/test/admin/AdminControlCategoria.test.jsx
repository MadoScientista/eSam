import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// AdminControlCategoria solo consume obtenerCategorias.
vi.mock("../../services/categoriaService", () => ({ obtenerCategorias: vi.fn() }))

import { obtenerCategorias } from "../../services/categoriaService"
import { AdminControlCategoria } from "../../pages/admin/AdminControlCategoria"
import { AuthContext } from "../../context/authContext"

const categorias = [
    { idCategoria: 1, nombre: "Herramientas", idCategoriaPadre: null, imagenUrl: null },
    { idCategoria: 2, nombre: "Taladros", idCategoriaPadre: 1, imagenUrl: null }
]

const renderControl = (usuario) =>
    render(
        <AuthContext.Provider value={{ usuario, estaAutenticado: Boolean(usuario), token: "token-fake" }}>
            <MemoryRouter initialEntries={["/admin/categorias"]}>
                <Routes>
                    <Route path="/admin/categorias" element={<AdminControlCategoria />} />
                    <Route path="/admin/categorias/nuevo" element={<div>Formulario nueva categoría</div>} />
                    <Route path="/admin/categorias/:idCategoria" element={<div>Formulario categoría</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )

const admin = { id: 1, rol: "admin" }
const vendedor = { id: 2, rol: "vendedor" }

describe("AdminControlCategoria", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        obtenerCategorias.mockResolvedValue(categorias)
    })

    it("Lista categorías con su padre y permite editarlas como admin", async () => {
        renderControl(admin)

        const fila = (await screen.findByText("Taladros")).closest("tr")
        expect(within(fila).getByText("Herramientas")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Editar Herramientas" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Nueva categoría" })).toBeInTheDocument()
    })

    it("Oculta las acciones de edición para un vendedor", async () => {
        renderControl(vendedor)

        expect(await screen.findByText("Taladros")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Nueva categoría" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /^Editar/ })).not.toBeInTheDocument()
    })

    it("Filtra por nombre", async () => {
        renderControl(admin)
        await screen.findByText("Taladros")

        fireEvent.change(screen.getByPlaceholderText("Buscar por nombre o ID"), { target: { value: "tala" } })

        expect(screen.getByText("Taladros")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Editar Taladros" })).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Editar Herramientas" })).not.toBeInTheDocument()
    })

    it("Navega al formulario de nueva categoría", async () => {
        renderControl(admin)
        await screen.findByText("Taladros")

        fireEvent.click(screen.getByRole("button", { name: "Nueva categoría" }))

        expect(await screen.findByText("Formulario nueva categoría")).toBeInTheDocument()
    })

    it("Navega al formulario de edición", async () => {
        renderControl(admin)
        await screen.findByText("Taladros")

        fireEvent.click(screen.getByRole("button", { name: "Editar Herramientas" }))

        expect(await screen.findByText("Formulario categoría")).toBeInTheDocument()
    })

    it("Muestra un error si falla la carga", async () => {
        obtenerCategorias.mockRejectedValue(new Error("Fallo categorías"))

        renderControl(admin)

        expect(await screen.findByText("Fallo categorías")).toBeInTheDocument()
    })
})
