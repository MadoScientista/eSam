import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Servicios que consumen useUsuarioForm y RegisterForm.
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
import { AdminProfile } from "../../pages/admin/AdminProfile"
import { AuthContext } from "../../context/authContext"

const regiones = [
    { idRegion: 1, nombre: "Metropolitana", comunas: [{ idComuna: 1, nombre: "Santiago" }] }
]

const perfil = {
    nombres: "Carla",
    aPaterno: "Rojas",
    aMaterno: "Díaz",
    rut: 12345678,
    dv: "5",
    correo: "carla@duoc.cl",
    telefono: 569123456,
    fechaNacimiento: "1988-05-05",
    direccion: "Los Aromos 45",
    comuna: { idComuna: 1, idRegion: 1, nombre: "Santiago" },
    rolDetalle: { idRolUsuario: 3, nombre: "admin" }
}

// El admin autenticado edita su propio perfil (esPropio).
const renderPerfil = () =>
    render(
        <AuthContext.Provider value={{
            usuario: { id: 1, rol: "admin" },
            estaAutenticado: true,
            token: "token-fake",
            refrescarPerfil: vi.fn().mockResolvedValue(perfil)
        }}>
            <MemoryRouter>
                <AdminProfile />
            </MemoryRouter>
        </AuthContext.Provider>
    )

describe("AdminProfile", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        obtenerRegionesComunas.mockResolvedValue(regiones)
        obtenerRolesUsuario.mockResolvedValue([])
        obtenerPerfil.mockResolvedValue(perfil)
    })

    it("Carga el modo Editar Perfil con los datos del administrador", async () => {
        renderPerfil()

        expect(screen.getByText("Perfil")).toBeInTheDocument()
        expect(await screen.findByText("Editar Perfil")).toBeInTheDocument()
        expect(await screen.findByDisplayValue("Carla")).toBeInTheDocument()
        expect(screen.getByLabelText("Correo*")).toHaveValue("carla@duoc.cl")
        expect(screen.getByLabelText(/run/i)).toBeDisabled()
        expect(screen.getByRole("button", { name: "Guardar Perfil" })).toBeInTheDocument()
    })

    it("Guarda los cambios del perfil", async () => {
        actualizarPerfil.mockResolvedValue({ idUsuario: 1 })

        renderPerfil()
        await screen.findByDisplayValue("Carla")

        fireEvent.change(screen.getByLabelText("Contraseña*"), { target: { value: "clave-admin" } })
        fireEvent.change(screen.getByLabelText("Confirme Contraseña*"), { target: { value: "clave-admin" } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar Perfil" }))

        await waitFor(() => expect(actualizarPerfil).toHaveBeenCalledTimes(1))
        expect(actualizarPerfil.mock.calls[0][0]).toMatchObject({ nombres: "Carla", correo: "carla@duoc.cl" })
        expect(await screen.findByText("Usuario actualizado correctamente.")).toBeInTheDocument()
    })

    it("Muestra error si falla la actualización", async () => {
        actualizarPerfil.mockRejectedValue(new Error("No se pudo guardar"))

        renderPerfil()
        await screen.findByDisplayValue("Carla")

        fireEvent.change(screen.getByLabelText("Contraseña*"), { target: { value: "clave-admin" } })
        fireEvent.change(screen.getByLabelText("Confirme Contraseña*"), { target: { value: "clave-admin" } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar Perfil" }))

        expect(await screen.findByText("No se pudo guardar")).toBeInTheDocument()
    })
})
