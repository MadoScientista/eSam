import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock del servicio de sesión: AuthProvider resuelve login con iniciarSesion.
vi.mock("../../services/usuarioService", () => ({
    iniciarSesion: vi.fn()
}))

import { iniciarSesion } from "../../services/usuarioService"
import { Login } from "../../pages/Login"
import { AuthProvider } from "../../context/AuthProvider"

// Render con sesión limpia y rutas para los destinos de navegación.
const renderLogin = (initialEntry = "/login") =>
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<div>Página registro</div>} />
                    <Route path="/admin" element={<div>Panel admin</div>} />
                    <Route path="/usuario" element={<div>Perfil cliente</div>} />
                    <Route path="/usuario/checkout" element={<div>Página checkout</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    )

const entrar = (email = "ana@duoc.cl", password = "clave-larga") => {
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: email } })
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: password } })
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))
}

describe("Login", () => {
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
    })

    it("Muestra el formulario de inicio de sesión", () => {
        renderLogin()

        expect(screen.getByText("Inicio de Sesión")).toBeInTheDocument()
        expect(screen.getByLabelText("Correo")).toBeInTheDocument()
        expect(screen.getByLabelText("Contraseña")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Regístrate" })).toHaveAttribute("href", "/registro")
    })

    it("Redirige al panel cuando el usuario es admin", async () => {
        iniciarSesion.mockResolvedValue({
            loggin: true,
            token: "token-admin",
            usuario: { id: 1, rol: "admin" }
        })

        renderLogin()
        entrar()

        expect(await screen.findByText("Panel admin")).toBeInTheDocument()
        expect(iniciarSesion).toHaveBeenCalledWith("ana@duoc.cl", "clave-larga")
        // La sesión queda persistida.
        expect(localStorage.getItem("eSamToken")).toBe("token-admin")
    })

    it("Redirige a vendedor al panel", async () => {
        iniciarSesion.mockResolvedValue({
            loggin: true,
            token: "token-vendedor",
            usuario: { id: 2, rol: "vendedor" }
        })

        renderLogin()
        entrar()

        expect(await screen.findByText("Panel admin")).toBeInTheDocument()
    })

    it("Redirige al perfil cuando el usuario es cliente", async () => {
        iniciarSesion.mockResolvedValue({
            loggin: true,
            token: "token-cliente",
            usuario: { id: 3, rol: "cliente" }
        })

        renderLogin()
        entrar()

        expect(await screen.findByText("Perfil cliente")).toBeInTheDocument()
    })

    it("Vuelve al checkout si el login vino desde esa ruta", async () => {
        iniciarSesion.mockResolvedValue({
            loggin: true,
            token: "token-cliente",
            usuario: { id: 3, rol: "cliente" }
        })

        renderLogin({ pathname: "/login", state: { from: { pathname: "/usuario/checkout" } } })
        entrar()

        expect(await screen.findByText("Página checkout")).toBeInTheDocument()
    })

    it("Muestra error cuando el backend responde loggin en false", async () => {
        iniciarSesion.mockResolvedValue({ loggin: false })

        renderLogin()
        entrar()

        expect(await screen.findByText("Correo o contraseña incorrectos.")).toBeInTheDocument()
    })

    it("Muestra error cuando el servidor rechaza con 401", async () => {
        const error = new Error("No autorizado")
        error.status = 401
        iniciarSesion.mockRejectedValue(error)

        renderLogin()
        entrar()

        expect(await screen.findByText("Correo o contraseña incorrectos.")).toBeInTheDocument()
    })

    it("Muestra el mensaje del error ante una falla genérica", async () => {
        iniciarSesion.mockRejectedValue(new Error("No se pudo conectar con el servidor"))

        renderLogin()
        entrar()

        expect(await screen.findByText("No se pudo conectar con el servidor")).toBeInTheDocument()
    })

    it("Explica cuando la sesión previa fue rechazada", async () => {
        renderLogin({ pathname: "/login", state: { sesionCerrada: "rechazada" } })

        expect(await screen.findByText("El servidor rechazó tu sesión y se cerró. Vuelve a iniciar sesión.")).toBeInTheDocument()
    })

    it("Limpia el error de sesión rechazada al cerrarlo", async () => {
        renderLogin({ pathname: "/login", state: { sesionCerrada: "rechazada" } })

        fireEvent.click(await screen.findByRole("button", { name: "Cerrar" }))

        await waitFor(() => expect(screen.queryByText("El servidor rechazó tu sesión y se cerró. Vuelve a iniciar sesión.")).not.toBeInTheDocument())
    })
})
