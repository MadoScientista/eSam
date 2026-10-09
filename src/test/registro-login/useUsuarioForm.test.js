import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useUsuarioForm } from "../../hooks/useUsuarioForm"

vi.mock("../../services/regionComunaService", () => ({
    obtenerRegionesComunas: vi.fn()
}))

vi.mock("../../services/usuarioService", () => ({
    obtenerPerfil: vi.fn(),
    obtenerRolesUsuario: vi.fn(),
    obtenerUsuarioId: vi.fn()
}))

import { obtenerRegionesComunas } from "../../services/regionComunaService"
import { obtenerRolesUsuario } from "../../services/usuarioService"

const camposValidos = {
    nombres: "Ana",
    aPaterno: "Perez",
    aMaterno: "Soto",
    correo: "ana@duoc.cl",
    correoConfirm: "ana@duoc.cl",
    password: "clave-larga",
    passwordConfirm: "clave-larga",
    direccion: "Av. Central 123",
    idRegion: "1",
    idComuna: "1"
}

const montarHook = async (props = {}) => {
    const utils = renderHook(() => useUsuarioForm(props))

    await act(async () => {})

    return utils
}

const rellenar = (result, campos) => {
    act(() => {
        Object.entries(campos).forEach(([name, value]) => {
            result.current.handleChange({ target: { name, value } })
        })
    })
}

const construirPayload = (result) => {
    let payload

    act(() => {
        payload = result.current.construirPayload()
    })

    return payload
}

describe("useUsuarioForm", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        obtenerRegionesComunas.mockResolvedValue([])
        obtenerRolesUsuario.mockResolvedValue([])
    })

    it("construye el payload completo para el registro público", async () => {
        const { result } = await montarHook()

        rellenar(result, { ...camposValidos, rut: "123456785" })

        const payload = construirPayload(result)

        expect(payload).toEqual({
            nombre: "Ana",
            apellido: "Perez",
            email: "ana@duoc.cl",
            nombres: "Ana",
            aPaterno: "Perez",
            aMaterno: "Soto",
            rut: 12345678,
            dv: "5",
            fechaNacimiento: null,
            direccion: "Av. Central 123",
            correo: "ana@duoc.cl",
            telefono: null,
            password: "clave-larga",
            idRegion: 1,
            idComuna: 1
        })
        expect(payload).not.toHaveProperty("idRolUsuario")
    })

    it("incluye idRolUsuario cuando esAdmin y trimea el teléfono", async () => {
        const { result } = await montarHook({ esAdmin: true })

        rellenar(result, {
            ...camposValidos,
            rut: "123456785",
            telefono: "  +569123456  ",
            idRolUsuario: "2"
        })

        const payload = construirPayload(result)

        expect(payload.telefono).toBe("+569123456")
        expect(payload.idRolUsuario).toBe(2)
    })

    it("rechaza cuando faltan nombres o apellido", async () => {
        const { result } = await montarHook()

        rellenar(result, { nombres: "", aPaterno: "Perez" })

        expect(construirPayload(result)).toBeNull()
        expect(result.current.mensajeAlerta).toEqual({
            type: "danger",
            message: "El nombre es obligatorio"
        })
    })

    it("rechaza un RUN inválido", async () => {
        const { result } = await montarHook()

        rellenar(result, { ...camposValidos, rut: "123456780" })

        expect(construirPayload(result)).toBeNull()
        expect(result.current.mensajeAlerta.message).toBe("El RUN ingresado no es válido.")
    })

    it("rechaza correos con dominio no permitido", async () => {
        const { result } = await montarHook()

        rellenar(result, { ...camposValidos, rut: "123456785", correo: "ana@hotmail.com", correoConfirm: "ana@hotmail.com" })

        expect(construirPayload(result)).toBeNull()
        expect(result.current.mensajeAlerta.message).toBe("Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com.")
    })

    it("rechaza contraseñas que no coinciden", async () => {
        const { result } = await montarHook()

        rellenar(result, { ...camposValidos, rut: "123456785", passwordConfirm: "otra-clave" })

        expect(construirPayload(result)).toBeNull()
        expect(result.current.mensajeAlerta.message).toBe("Las contraseñas no coinciden.")
    })

    it("exige seleccionar región y comuna", async () => {
        const { result } = await montarHook()

        rellenar(result, { ...camposValidos, rut: "123456785", idRegion: "", idComuna: "" })

        expect(construirPayload(result)).toBeNull()
        expect(result.current.mensajeAlerta.message).toBe("Seleccione una región.")
    })

    it("exige seleccionar un tipo de usuario cuando esAdmin", async () => {
        const { result } = await montarHook({ esAdmin: true })

        rellenar(result, { ...camposValidos, rut: "123456785" })

        expect(construirPayload(result)).toBeNull()
        expect(result.current.mensajeAlerta.message).toBe("Seleccione un tipo de usuario.")
    })

    it("normaliza el RUT eliminando separadores y letras inválidas", async () => {
        const { result } = await montarHook()

        act(() => {
            result.current.handleChangeRut({ target: { value: "12.345.678-5x" } })
        })

        expect(result.current.formulario.rut).toBe("123456785")
    })
})