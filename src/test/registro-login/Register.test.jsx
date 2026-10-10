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
import { crearUsuario, obtenerRolesUsuario } from "../../services/usuarioService"
import { Register } from "../../pages/Register"
import { AuthProvider } from "../../context/AuthProvider"

const regiones = [
    { idRegion: 1, nombre: "Metropolitana", comunas: [{ idComuna: 1, nombre: "Santiago" }, { idComuna: 2, nombre: "Ñuñoa" }] }
]

// Render del registro público dentro de AuthProvider (RegisterForm usa useAuth).
const renderRegister = () =>
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/registro"]}>
                <Routes>
                    <Route path="/registro" element={<Register />} />
                    <Route path="/login" element={<div>Página login</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    )

// Completa el formulario con datos válidos; permite sobrescribir campos puntuales.
const llenarFormulario = async (overrides = {}) => {
    await screen.findByRole("option", { name: "Metropolitana" })

    const campos = {
        "Nombres*": "Ana",
        "Apellido Paterno*": "Pérez",
        "RUN*": "123456785",
        "Correo*": "ana@duoc.cl",
        "Confirme correo*": "ana@duoc.cl",
        "Contraseña*": "clave-larga",
        "Confirme Contraseña*": "clave-larga",
        "Dirección*": "Av. Central 123",
        ...overrides
    }

    Object.entries(campos).forEach(([label, value]) => {
        fireEvent.change(screen.getByLabelText(label), { target: { value } })
    })

    // Región habilita las opciones de comuna.
    fireEvent.change(screen.getByLabelText("Región*"), { target: { value: "1" } })
    await screen.findByRole("option", { name: "Santiago" })
    fireEvent.change(screen.getByLabelText("Comuna*"), { target: { value: "1" } })
}

describe("Register", () => {
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
        obtenerRegionesComunas.mockResolvedValue(regiones)
        obtenerRolesUsuario.mockResolvedValue([])
    })

    it("Muestra el formulario de registro", async () => {
        renderRegister()

        expect(screen.getByText("Formulario de Registro")).toBeInTheDocument()
        expect(screen.getByLabelText("Nombres*")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Registrar" })).toBeInTheDocument()
        // Las regiones llegan del servicio y se muestran como opciones.
        expect(await screen.findByRole("option", { name: "Metropolitana" })).toBeInTheDocument()
    })

    it("Registra al usuario y navega al login", async () => {
        crearUsuario.mockResolvedValue({ idUsuario: 10 })

        renderRegister()
        await llenarFormulario()

        fireEvent.click(screen.getByRole("button", { name: "Registrar" }))

        await waitFor(() => expect(crearUsuario).toHaveBeenCalledTimes(1))
        expect(crearUsuario.mock.calls[0][0]).toMatchObject({
            nombres: "Ana",
            aPaterno: "Pérez",
            correo: "ana@duoc.cl",
            idRegion: 1,
            idComuna: 1
        })
        expect(await screen.findByText("Página login")).toBeInTheDocument()
    })

    it("Muestra validación para correos de dominio no permitido", async () => {
        renderRegister()
        await llenarFormulario({ "Correo*": "ana@hotmail.com", "Confirme correo*": "ana@hotmail.com" })

        fireEvent.click(screen.getByRole("button", { name: "Registrar" }))

        expect(await screen.findByText("Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com.")).toBeInTheDocument()
        expect(crearUsuario).not.toHaveBeenCalled()
    })

    it("Muestra validación cuando las contraseñas no coinciden", async () => {
        renderRegister()
        await llenarFormulario({ "Confirme Contraseña*": "otra-clave" })

        fireEvent.click(screen.getByRole("button", { name: "Registrar" }))

        expect(await screen.findByText("Las contraseñas no coinciden.")).toBeInTheDocument()
        expect(crearUsuario).not.toHaveBeenCalled()
    })

    it("Muestra error si falla el registro", async () => {
        crearUsuario.mockRejectedValue(new Error("El correo ya está registrado"))

        renderRegister()
        await llenarFormulario()

        fireEvent.click(screen.getByRole("button", { name: "Registrar" }))

        expect(await screen.findByText("El correo ya está registrado")).toBeInTheDocument()
    })
})
