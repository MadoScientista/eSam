import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Servicios que consumen AdminUsuarioForm (useUsuarioForm) y AdminUserForm.
vi.mock("../../services/regionComunaService", () => ({ obtenerRegionesComunas: vi.fn() }))
vi.mock("../../services/usuarioService", () => ({
    crearUsuarioAdmin: vi.fn(),
    actualizarUsuario: vi.fn(),
    eliminarUsuario: vi.fn(),
    obtenerRolesUsuario: vi.fn(),
    obtenerPerfil: vi.fn(),
    obtenerUsuarioId: vi.fn()
}))

import { obtenerRegionesComunas } from "../../services/regionComunaService"
import { crearUsuarioAdmin, eliminarUsuario, obtenerRolesUsuario, obtenerUsuarioId } from "../../services/usuarioService"
import { AdminUserForm } from "../../pages/admin/AdminUserForm"

const regiones = [
    { idRegion: 1, nombre: "Metropolitana", comunas: [{ idComuna: 1, nombre: "Santiago" }] }
]

const usuario = {
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

const renderForm = (ruta, path) =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <Routes>
                <Route path={path} element={<AdminUserForm />} />
                <Route path="/admin/usuarios" element={<div>Lista usuarios</div>} />
            </Routes>
        </MemoryRouter>
    )

// Completa el formulario de usuario (creación) con datos válidos.
const llenarFormulario = async () => {
    // Regiones y roles cargan de forma asíncrona: hay que esperar a que las
    // opciones existan antes de seleccionarlas (un <select> controlado ignora
    // un valor que no está entre sus opciones).
    await screen.findByRole("option", { name: "Metropolitana" })
    await screen.findByRole("option", { name: "cliente" })

    fireEvent.change(screen.getByLabelText("Nombres*"), { target: { value: "Ana" } })
    fireEvent.change(screen.getByLabelText("Apellido Paterno*"), { target: { value: "López" } })
    fireEvent.change(screen.getByLabelText(/run/i), { target: { value: "123456785" } })
    fireEvent.change(screen.getByLabelText("Correo*"), { target: { value: "ana@duoc.cl" } })
    fireEvent.change(screen.getByLabelText("Confirme correo*"), { target: { value: "ana@duoc.cl" } })
    fireEvent.change(screen.getByLabelText("Contraseña*"), { target: { value: "clave1234" } })
    fireEvent.change(screen.getByLabelText("Confirme Contraseña*"), { target: { value: "clave1234" } })
    fireEvent.change(screen.getByLabelText("Región*"), { target: { value: "1" } })

    await screen.findByRole("option", { name: "Santiago" })
    fireEvent.change(screen.getByLabelText("Comuna*"), { target: { value: "1" } })

    fireEvent.change(screen.getByLabelText("Dirección*"), { target: { value: "Av. Central 123" } })
    fireEvent.change(screen.getByLabelText("Tipo de Usuario*"), { target: { value: "1" } })
}

describe("AdminUserForm", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        obtenerRegionesComunas.mockResolvedValue(regiones)
        obtenerRolesUsuario.mockResolvedValue([{ idRolUsuario: 1, nombre: "cliente" }])
        obtenerUsuarioId.mockResolvedValue(usuario)
    })

    it("Crea un usuario tras confirmar en el modal", async () => {
        crearUsuarioAdmin.mockResolvedValue({ id: 7 })

        renderForm("/admin/usuarios/nuevo", "/admin/usuarios/nuevo")
        expect(screen.getByText("Nuevo usuario")).toBeInTheDocument()

        await llenarFormulario()
        fireEvent.click(screen.getByRole("button", { name: "Guardar Usuario" }))

        expect(screen.getByText("¿Estás seguro de guardar el nuevo usuario?")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Guardar" }))

        await waitFor(() => expect(crearUsuarioAdmin).toHaveBeenCalledTimes(1))
        expect(crearUsuarioAdmin.mock.calls[0][0]).toMatchObject({ nombres: "Ana", correo: "ana@duoc.cl", idRolUsuario: 1 })
        expect(await screen.findByText("Usuario creado correctamente.")).toBeInTheDocument()
    })

    it("Valida los campos obligatorios", async () => {
        renderForm("/admin/usuarios/nuevo", "/admin/usuarios/nuevo")

        // Se dispara submit directo: los campos tienen `required` y el navegador
        // (jsdom) bloquearía el click sin llegar al onSubmit de React.
        fireEvent.submit(screen.getByRole("button", { name: "Guardar Usuario" }).closest("form"))

        expect(await screen.findByText("El nombre es obligatorio")).toBeInTheDocument()
        expect(crearUsuarioAdmin).not.toHaveBeenCalled()
    })

    it("Elimina un usuario en modo edición y vuelve al listado", async () => {
        eliminarUsuario.mockResolvedValue({})

        renderForm("/admin/usuarios/1", "/admin/usuarios/:id")
        expect(await screen.findByText("Editar usuario")).toBeInTheDocument()
        await screen.findByDisplayValue("Ana")

        fireEvent.click(screen.getByRole("button", { name: "Eliminar" }))
        expect(screen.getByText("¿Estás seguro de eliminar el usuario 1?")).toBeInTheDocument()

        const botones = screen.getAllByRole("button", { name: "Eliminar" })
        fireEvent.click(botones[botones.length - 1])

        await waitFor(() => expect(eliminarUsuario).toHaveBeenCalledWith("1"))
        expect(await screen.findByText("El usuario con id 1 fue eliminado.")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Aceptar" }))
        expect(await screen.findByText("Lista usuarios")).toBeInTheDocument()
    })
})
