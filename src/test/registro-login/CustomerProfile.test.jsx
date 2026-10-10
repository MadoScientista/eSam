import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mocks de servicios que consumen useUsuarioForm y RegisterForm.
vi.mock("../../services/regionComunaService", () => ({
    obtenerRegionesComunas: vi.fn()
}))
vi.mock("../../services/usuarioService", () => ({
    crearUsuario: vi.fn(),
    crearUsuarioAdmin: vi.fn(),
    actualizarUsuario: vi.fn(),
    actualizarPerfil: vi.fn(),
    obtenerRolesUsuario: vi.fn(),
    obtenerPerfil: vi.fn(),
    obtenerUsuarioId: vi.fn()
}))

import { obtenerRegionesComunas } from "../../services/regionComunaService"
import { actualizarPerfil, obtenerPerfil, obtenerRolesUsuario } from "../../services/usuarioService"
import { CustomerProfile } from "../../pages/CustomerProfile"
import { AuthProvider } from "../../context/AuthProvider"

const regiones = [
    { idRegion: 1, nombre: "Metropolitana", comunas: [{ idComuna: 1, nombre: "Santiago" }] }
]

// Perfil que devuelve el backend para el usuario autenticado.
const perfil = {
    nombres: "Ana",
    aPaterno: "López",
    aMaterno: "Soto",
    rut: 12345678,
    dv: "5",
    correo: "ana@duoc.cl",
    telefono: 569123456,
    fechaNacimiento: "1990-01-01",
    direccion: "Av. Central 123",
    comuna: { idComuna: 1, idRegion: 1, nombre: "Santiago" },
    rolDetalle: { idRolUsuario: 1, nombre: "cliente" }
}

// Siembra la sesión para que AuthProvider exponga un usuario autenticado.
const seedSesion = () => {
    localStorage.setItem("eSamToken", "token-fake")
    localStorage.setItem("eSamSession", JSON.stringify({ id: 1, rol: "cliente", nombres: "Ana", aPaterno: "López" }))
}

const renderPerfil = () =>
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/usuario"]}>
                <Routes>
                    <Route path="/usuario" element={<CustomerProfile />} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    )

describe("CustomerProfile", () => {
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
        seedSesion()
        obtenerRegionesComunas.mockResolvedValue(regiones)
        obtenerRolesUsuario.mockResolvedValue([])
        obtenerPerfil.mockResolvedValue(perfil)
    })

    it("Carga el modo Editar Perfil con los datos del usuario", async () => {
        renderPerfil()

        expect(await screen.findByText("Editar Perfil")).toBeInTheDocument()
        expect(await screen.findByDisplayValue("Ana")).toBeInTheDocument()
        expect(screen.getByLabelText("Correo*")).toHaveValue("ana@duoc.cl")
        expect(screen.getByLabelText("Dirección*")).toHaveValue("Av. Central 123")
        // El RUN no es editable en modo edición.
        expect(screen.getByLabelText("RUN*")).toBeDisabled()
        expect(screen.getByRole("button", { name: "Guardar Perfil" })).toBeInTheDocument()
    })

    it("Guarda los cambios del perfil", async () => {
        actualizarPerfil.mockResolvedValue({ idUsuario: 1 })

        renderPerfil()
        await screen.findByDisplayValue("Ana")

        fireEvent.change(screen.getByLabelText("Contraseña*"), { target: { value: "nueva-clave" } })
        fireEvent.change(screen.getByLabelText("Confirme Contraseña*"), { target: { value: "nueva-clave" } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar Perfil" }))

        await waitFor(() => expect(actualizarPerfil).toHaveBeenCalledTimes(1))
        expect(actualizarPerfil.mock.calls[0][0]).toMatchObject({
            nombres: "Ana",
            correo: "ana@duoc.cl",
            password: "nueva-clave"
        })
        expect(await screen.findByText("Usuario actualizado correctamente.")).toBeInTheDocument()
    })

    it("Muestra error si falla la actualización del perfil", async () => {
        actualizarPerfil.mockRejectedValue(new Error("No se pudo actualizar el perfil"))

        renderPerfil()
        await screen.findByDisplayValue("Ana")

        fireEvent.change(screen.getByLabelText("Contraseña*"), { target: { value: "nueva-clave" } })
        fireEvent.change(screen.getByLabelText("Confirme Contraseña*"), { target: { value: "nueva-clave" } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar Perfil" }))

        expect(await screen.findByText("No se pudo actualizar el perfil")).toBeInTheDocument()
    })
})
