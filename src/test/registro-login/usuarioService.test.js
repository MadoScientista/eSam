import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../services/api", () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}))

import { api } from "../../services/api"
import {
    actualizarPerfil,
    actualizarUsuario,
    crearUsuario,
    crearUsuarioAdmin,
    eliminarUsuario,
    iniciarSesion,
    obtenerPerfil,
    obtenerRolesUsuario,
    obtenerUsuarioId,
    obtenerUsuarios,
    obtenerUsuariosPorRol
} from "../../services/usuarioService"

describe("usuarioService", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe("obtenerUsuarios", () => {
        it("obtiene todos los usuarios desde /usuarios", async () => {
            const usuarios = [{ idUsuario: 1, correo: "a@duoc.cl" }]
            api.get.mockResolvedValue({ data: usuarios })

            const resultado = await obtenerUsuarios()

            expect(api.get).toHaveBeenCalledWith("/usuarios")
            expect(resultado).toEqual(usuarios)
        })
    })

    describe("obtenerUsuarioId", () => {
        it("obtiene un usuario por id", async () => {
            api.get.mockResolvedValue({ data: { idUsuario: 5 } })

            await obtenerUsuarioId(5)

            expect(api.get).toHaveBeenCalledWith("/usuarios/5")
        })
    })

    describe("obtenerRolesUsuario", () => {
        it("obtiene todos los roles desde /roles", async () => {
            const roles = [{ idRolUsuario: 1, nombre: "ADMIN" }]
            api.get.mockResolvedValue({ data: roles })

            const resultado = await obtenerRolesUsuario()

            expect(api.get).toHaveBeenCalledWith("/roles")
            expect(resultado).toEqual(roles)
        })
    })

    describe("obtenerUsuariosPorRol", () => {
        it("filtra los usuarios por rol", async () => {
            api.get.mockResolvedValue({ data: [] })

            await obtenerUsuariosPorRol(2)

            expect(api.get).toHaveBeenCalledWith("/usuarios/rol/2")
        })
    })

    describe("eliminarUsuario", () => {
        it("elimina por DELETE con el id en la ruta", async () => {
            api.delete.mockResolvedValue({ data: null })

            await eliminarUsuario(3)

            expect(api.delete).toHaveBeenCalledWith("/usuarios/3")
        })
    })

    describe("iniciarSesion", () => {
        it("envía correo y password a /usuarios/login", async () => {
            const respuesta = { data: { loggin: true, token: "t1", usuario: {} } }
            api.post.mockResolvedValue(respuesta)

            const resultado = await iniciarSesion("a@duoc.cl", "clave")

            expect(api.post).toHaveBeenCalledWith("/usuarios/login", {
                correo: "a@duoc.cl",
                password: "clave"
            })
            expect(resultado).toEqual(respuesta.data)
        })
    })

    describe("crearUsuario", () => {
        it("envía el usuario por POST a /usuarios (registro público)", async () => {
            const usuario = { correo: "a@duoc.cl" }
            api.post.mockResolvedValue({ data: { idUsuario: 1, ...usuario } })

            const resultado = await crearUsuario(usuario)

            expect(api.post).toHaveBeenCalledWith("/usuarios", usuario)
            expect(resultado).toEqual({ idUsuario: 1, ...usuario })
        })
    })

    describe("crearUsuarioAdmin", () => {
        it("envía el usuario con rol a /usuarios/admin", async () => {
            const usuario = { correo: "a@duoc.cl", idRolUsuario: 2 }
            api.post.mockResolvedValue({ data: usuario })

            await crearUsuarioAdmin(usuario)

            expect(api.post).toHaveBeenCalledWith("/usuarios/admin", usuario)
        })
    })

    describe("actualizarUsuario", () => {
        it("actualiza con PUT y el id en la ruta", async () => {
            const usuario = { correo: "b@duoc.cl" }
            api.put.mockResolvedValue({ data: usuario })

            await actualizarUsuario(4, usuario)

            expect(api.put).toHaveBeenCalledWith("/usuarios/4", usuario)
        })
    })

    describe("obtenerPerfil", () => {
        it("obtiene el perfil del usuario autenticado", async () => {
            const perfil = { idUsuario: 1, correo: "a@duoc.cl" }
            api.get.mockResolvedValue({ data: perfil })

            const resultado = await obtenerPerfil()

            expect(api.get).toHaveBeenCalledWith("/usuarios/perfil")
            expect(resultado).toEqual(perfil)
        })
    })

    describe("actualizarPerfil", () => {
        it("actualiza el perfil por PUT a /usuarios/perfil", async () => {
            const usuario = { correo: "a@duoc.cl", password: "nueva" }
            api.put.mockResolvedValue({ data: usuario })

            await actualizarPerfil(usuario)

            expect(api.put).toHaveBeenCalledWith("/usuarios/perfil", usuario)
        })
    })
})