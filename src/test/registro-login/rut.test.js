import { describe, expect, it } from "vitest"
import { descomponerRut, digitoVerificador, validarRut } from "../../utils/rut"

describe("digitoVerificador", () => {
    it("Calcula el dígito verificador de un RUT", () => {
        expect(digitoVerificador(1)).toBe("9")
        expect(digitoVerificador("12345678")).toBe("5")
    })

    it("Devuelve '0' cuando el resultado del algoritmo es 11", () => {
        expect(digitoVerificador("112")).toBe("0")
    })

    it("Devuelve 'K' cuando el resultado del algoritmo es 10", () => {
        expect(digitoVerificador(6)).toBe("K")
    })
})

describe("validarRut", () => {
    it("Acepta RUT válidos", () => {
        expect(validarRut("1-9")).toBe(true)
        expect(validarRut("112-0")).toBe(true)
        expect(validarRut("12.345.678-5")).toBe(true)
    })

    it("Acepta el dígito verificador K en mayúscula y minúscula", () => {
        expect(validarRut("6K")).toBe(true)
        expect(validarRut("6-k")).toBe(true)
    })

    it("Tolera puntos, guiones y espacios en el formato", () => {
        expect(validarRut("12 345 678-5")).toBe(true)
        expect(validarRut("1.9")).toBe(true)
        expect(validarRut("1-9 ")).toBe(true)
    })

    it("Rechaza RUT con dígito verificador incorrecto", () => {
        expect(validarRut("1-8")).toBe(false)
        expect(validarRut("12.345.678-6")).toBe(false)
        expect(validarRut("112-1")).toBe(false)
    })

    it("Rechaza valores sin dígito verificador", () => {
        expect(validarRut("12345678")).toBe(false)
        expect(validarRut("")).toBe(false)
    })

    it("Rechaza formatos inválidos", () => {
        expect(validarRut("abcdef")).toBe(false)
        expect(validarRut("1-A")).toBe(false)
        expect(validarRut("123456789-1")).toBe(false)
    })
})

describe("descomponerRut", () => {
    it("Separa cuerpo y dígito verificador", () => {
        expect(descomponerRut("12.345.678-5")).toEqual({ rut: 12345678, dv: "5" })
        expect(descomponerRut("1-9")).toEqual({ rut: 1, dv: "9" })
    })

    it("Convierte el dígito verificador a mayúscula", () => {
        expect(descomponerRut("6-K")).toEqual({ rut: 6, dv: "K" })
        expect(descomponerRut("6-k")).toEqual({ rut: 6, dv: "K" })
    })

    it("Tolera puntos, guiones y espacios en el formato", () => {
        expect(descomponerRut("6 k")).toEqual({ rut: 6, dv: "K" })
    })
})