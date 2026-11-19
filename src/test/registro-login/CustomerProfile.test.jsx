import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

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
vi.mock("../../services/pedidoService", () => ({
    obtenerMisPedidos: vi.fn(),
    obtenerMiPedido: vi.fn()
}))
vi.mock("../../services/productoService", () => ({
    obtenerProductoPorId: vi.fn()
}))
vi.mock("../../services/direccionService", () => ({
    obtenerDirecciones: vi.fn(),
    crearDireccion: vi.fn(),
    actualizarDireccion: vi.fn(),
    eliminarDireccion: vi.fn()
}))

import { obtenerRegionesComunas } from "../../services/regionComunaService"
import { actualizarPerfil, obtenerPerfil, obtenerRolesUsuario } from "../../services/usuarioService"
import { obtenerMisPedidos, obtenerMiPedido } from "../../services/pedidoService"
import { obtenerProductoPorId } from "../../services/productoService"
import {
    obtenerDirecciones,
    crearDireccion,
    actualizarDireccion,
    eliminarDireccion
} from "../../services/direccionService"
import { CustomerProfile } from "../../pages/CustomerProfile"
import { AuthProvider } from "../../context/AuthProvider"

const regiones = [
    { idRegion: 1, nombre: "Metropolitana", comunas: [{ idComuna: 1, nombre: "Santiago" }] }
]

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

const seedSesion = ({ esGoogle = false } = {}) => {
    localStorage.setItem("eSamToken", "token-fake")
    localStorage.setItem("eSamSession", JSON.stringify({ id: 1, rol: "cliente", nombres: "Ana", aPaterno: "López" }))
    if (esGoogle) localStorage.setItem("eSamGoogleSession", "true")
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

const abrirEdicionPerfil = async () => {
    fireEvent.click(await screen.findByRole("button", { name: /editar perfil/i }))
    await screen.findByText("Editar perfil")
}

describe("CustomerProfile", () => {
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
        seedSesion()
        obtenerRegionesComunas.mockResolvedValue(regiones)
        obtenerRolesUsuario.mockResolvedValue([])
        obtenerPerfil.mockResolvedValue(perfil)
        obtenerMisPedidos.mockResolvedValue([])
        obtenerProductoPorId.mockResolvedValue({
            idProducto: 7,
            nombre: "Cuaderno",
            imagenes: [{ url: "cuaderno.jpg", principal: true }]
        })
        obtenerDirecciones.mockResolvedValue([])
    })

    it("muestra la bienvenida, los pedidos recientes y el acceso al historial", async () => {
        obtenerMisPedidos.mockResolvedValue([{
            idPedido: 5,
            estado: "ENTREGADO",
            total: 2490,
            cantidadItems: 5,
            creadoEn: "2026-01-15T12:30:00Z"
        }])
        obtenerMiPedido.mockResolvedValue({
            detalles: [{ idDetallePedido: 1, idProducto: 7, nombreProducto: "Cuaderno", cantidad: 5 }]
        })

        renderPerfil()

        expect(await screen.findByRole("heading", { name: "Hola, Ana López." })).toBeInTheDocument()
        expect(await screen.findByText("Cuaderno")).toBeInTheDocument()
        expect(screen.getByAltText("Cuaderno")).toHaveAttribute("src", "cuaderno.jpg")
        expect(screen.getByText("4 productos más")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /ver todos los pedidos/i })).toHaveAttribute("href", "/usuario/pedidos")
        expect(screen.getByRole("link", { name: /pedido #5/i })).toHaveAttribute("href", "/usuario/pedidos/5")
    })

    it("abre el formulario de comprador y guarda sólo sus datos de perfil", async () => {
        actualizarPerfil.mockResolvedValue({ idUsuario: 1 })

        renderPerfil()
        await abrirEdicionPerfil()
        await screen.findByDisplayValue("Ana")

        expect(screen.getByLabelText("Apellido paterno*")).toHaveValue("López")
        expect(screen.getByLabelText("Apellido materno")).toHaveValue("Soto")
        expect(screen.getByLabelText("Fecha de nacimiento*")).toHaveValue("1990-01-01")
        expect(screen.getByLabelText("Teléfono (opcional)")).toHaveValue("569123456")
        expect(screen.queryByLabelText("Correo*")).not.toBeInTheDocument()
        expect(screen.queryByLabelText("Dirección*")).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }))

        await waitFor(() => expect(actualizarPerfil).toHaveBeenCalledTimes(1))
        expect(actualizarPerfil.mock.calls[0][0]).toEqual({
            nombres: "Ana",
            aPaterno: "López",
            aMaterno: "Soto",
            fechaNacimiento: "1990-01-01",
            telefono: "569123456"
        })
        expect(await screen.findByText("Perfil actualizado correctamente.")).toBeInTheDocument()
    })

    it("permite guardar el perfil de Google sin teléfono", async () => {
        seedSesion({ esGoogle: true })
        obtenerPerfil.mockResolvedValue({ ...perfil, telefono: null })
        actualizarPerfil.mockResolvedValue({ idUsuario: 1 })

        renderPerfil()
        await abrirEdicionPerfil()
        await screen.findByDisplayValue("Ana")

        expect(screen.getByLabelText("Teléfono (opcional)")).not.toBeRequired()
        fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }))

        await waitFor(() => expect(actualizarPerfil).toHaveBeenCalledTimes(1))
        expect(actualizarPerfil.mock.calls[0][0]).not.toHaveProperty("telefono")
        await waitFor(() => expect(obtenerPerfil).toHaveBeenCalledTimes(2))
        expect(await screen.findByText("Perfil actualizado correctamente.")).toBeInTheDocument()
    })

    it("abre el formulario de perfil incompleto desde checkout y vuelve al guardar", async () => {
        seedSesion({ esGoogle: true })
        obtenerPerfil.mockResolvedValue({ ...perfil, perfilCompleto: true })
        actualizarPerfil.mockResolvedValue({ idUsuario: 1 })

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={[{
                    pathname: "/usuario",
                    state: { completarPerfilParaCompra: true }
                }]}>
                    <Routes>
                        <Route path="/usuario" element={<CustomerProfile />} />
                        <Route path="/usuario/checkout" element={<div>Volver a finalizar compra</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        )

        expect(await screen.findByText("Completa tus datos para continuar con tu compra")).toBeInTheDocument()
        expect(await screen.findByLabelText("Fecha de nacimiento*")).toBeRequired()
        fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }))

        await waitFor(
            () => expect(screen.getByText("Volver a finalizar compra")).toBeInTheDocument(),
            { timeout: 3000 }
        )
        expect(actualizarPerfil).toHaveBeenCalledTimes(1)
    })

    it("muestra un aviso para el comprador si el backend conserva perfilCompleto en false", async () => {
        seedSesion({ esGoogle: true })
        obtenerPerfil.mockResolvedValue({ ...perfil, perfilCompleto: false })
        actualizarPerfil.mockResolvedValue({ idUsuario: 1 })

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={[{
                    pathname: "/usuario",
                    state: { completarPerfilParaCompra: true }
                }]}>
                    <Routes>
                        <Route path="/usuario" element={<CustomerProfile />} />
                        <Route path="/usuario/checkout" element={<div>Volver a finalizar compra</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        )

        await screen.findByLabelText("Fecha de nacimiento*")
        await waitFor(() => expect(screen.getByRole("button", { name: "Guardar perfil" })).not.toBeDisabled())
        fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }))

        expect(await screen.findByText(
            "Tus datos se guardaron, pero aún no podemos continuar con tu compra. Contacta a soporte si el problema continúa."
        )).toBeInTheDocument()
        expect(screen.queryByText("Volver a finalizar compra")).not.toBeInTheDocument()
    })

    it("permite guardar sin apellido materno", async () => {
        obtenerPerfil.mockResolvedValue({ ...perfil, aMaterno: "" })
        actualizarPerfil.mockResolvedValue({ idUsuario: 1 })

        renderPerfil()
        await abrirEdicionPerfil()
        await screen.findByDisplayValue("Ana")

        expect(screen.getByLabelText("Apellido materno")).not.toBeRequired()
        fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }))

        await waitFor(() => expect(actualizarPerfil).toHaveBeenCalledTimes(1))
        expect(actualizarPerfil.mock.calls[0][0]).not.toHaveProperty("aMaterno")
    })

    it("muestra error si falla la actualización del perfil", async () => {
        actualizarPerfil.mockRejectedValue(new Error("No se pudo actualizar el perfil"))

        renderPerfil()
        await abrirEdicionPerfil()
        await screen.findByDisplayValue("Ana")

        fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }))

        expect(await screen.findByText("No se pudo actualizar el perfil")).toBeInTheDocument()
    })

    it("permite crear una dirección de despacho", async () => {
        crearDireccion.mockResolvedValue({ idDireccion: 9, calle: "Av. Central", numero: "123" })

        renderPerfil()
        fireEvent.click(await screen.findByRole("button", { name: /agregar dirección/i }))

        fireEvent.change(await screen.findByLabelText("Nombre de quien recibe"), { target: { value: "Ana López" } })
        fireEvent.change(screen.getByLabelText("Teléfono"), { target: { value: "569123456" } })
        fireEvent.change(screen.getByLabelText("Calle"), { target: { value: "Av. Central" } })
        fireEvent.change(screen.getByLabelText("Número"), { target: { value: "123" } })
        fireEvent.change(screen.getByLabelText("Región"), { target: { value: "1" } })
        fireEvent.change(screen.getByLabelText("Comuna"), { target: { value: "1" } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar dirección" }))

        await waitFor(() => expect(crearDireccion).toHaveBeenCalledWith(expect.objectContaining({
            nombreReceptor: "Ana López",
            calle: "Av. Central",
            idComuna: 1,
            idUsuario: 1
        })))
        expect(await screen.findByText("Dirección agregada correctamente.")).toBeInTheDocument()
    })

    it("permite editar y eliminar una dirección guardada", async () => {
        obtenerDirecciones.mockResolvedValue([{
            idDireccion: 2,
            nombreReceptor: "Ana López",
            telefonoReceptor: "569123456",
            calle: "Calle Antigua",
            numero: "45",
            comuna: { idComuna: 1, nombre: "Santiago" }
        }])
        actualizarDireccion.mockResolvedValue({})

        renderPerfil()
        expect(await screen.findByText("Calle Antigua 45, Santiago")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Editar" }))
        fireEvent.change(await screen.findByLabelText("Calle"), { target: { value: "Calle Nueva" } })
        fireEvent.click(screen.getByRole("button", { name: "Guardar dirección" }))

        await waitFor(() => expect(actualizarDireccion).toHaveBeenCalledWith(
            2,
            expect.objectContaining({ calle: "Calle Nueva", idComuna: 1 })
        ))

        fireEvent.click(await screen.findByRole("button", { name: "Eliminar" }))
        fireEvent.click(screen.getAllByRole("button", { name: "Eliminar", exact: true }).slice(-1)[0])

        await waitFor(() => expect(eliminarDireccion).toHaveBeenCalledWith(2))
        expect(await screen.findByText("Dirección eliminada correctamente.")).toBeInTheDocument()
    })
})
