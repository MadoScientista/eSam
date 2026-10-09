import { beforeEach, describe, expect, it, vi } from "vitest"
import { api, guardarToken, limpiarToken, obtenerToken } from "../../services/api"
import { iniciarSesion } from "../../services/usuarioService"

vi.mock("../../services/api", async (importOriginal) => {
    const actual = await importOriginal()

    return {
        ...actual,
        api: { post: vi.fn() }
    }
})

describe("guardarToken / obtenerToken", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it("Almacena el token y lo recupera", () => {
        expect(obtenerToken()).toBeNull()

        guardarToken("token-123")

        expect(obtenerToken()).toBe("token-123")
    })

    it("Sin token elimina el almacenado", () => {
        guardarToken("token-123")

        guardarToken(null)

        expect(obtenerToken()).toBeNull()
    })

    it("Guardar otro token reemplaza el anterior", () => {
        guardarToken("token-123")

        guardarToken("token-456")

        expect(obtenerToken()).toBe("token-456")
    })
})

describe("limpiarToken", () => {
    it("Elimina el token almacenado", () => {
        guardarToken("token-123")

        limpiarToken()

        expect(obtenerToken()).toBeNull()
    })

    it("No falla cuando no hay token", () => {
        expect(() => limpiarToken()).not.toThrow()
    })
})

describe("iniciarSesion", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("Envía correo y password a /usuarios/login y devuelve los datos", async () => {
        const respuesta = { data: { loggin: true, token: "token-123", usuario: { id: 1, correo: "a@b.cl" } } }
        api.post.mockResolvedValue(respuesta)

        const resultado = await iniciarSesion("a@b.cl", "clave-123")

        expect(api.post).toHaveBeenCalledWith("/usuarios/login", {
            correo: "a@b.cl",
            password: "clave-123"
        })
        expect(resultado).toEqual(respuesta.data)
    })

    it("Propaga el error cuando el login falla", async () => {
        api.post.mockRejectedValue(new Error("Credenciales inválidas"))

        await expect(iniciarSesion("a@b.cl", "mal")).rejects.toThrow("Credenciales inválidas")
    })
})