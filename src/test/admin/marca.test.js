import { describe, expect, it } from "vitest"
import { validarNombreMarca } from "../../utils/marca"

describe("validarNombreMarca", () => {
    it("acepta nombres válidos", () => {
        expect(validarNombreMarca("Faber-Castell")).toBeNull()
        expect(validarNombreMarca("  Pelikan  ")).toBeNull()
    })

    it("rechaza nombres vacíos o solo espacios", () => {
        expect(validarNombreMarca("")).toBe("El nombre es obligatorio.")
        expect(validarNombreMarca("   ")).toBe("El nombre es obligatorio.")
        expect(validarNombreMarca(null)).toBe("El nombre es obligatorio.")
        expect(validarNombreMarca(undefined)).toBe("El nombre es obligatorio.")
    })

    it("rechaza nombres de más de 100 caracteres", () => {
        expect(validarNombreMarca("a".repeat(100))).toBeNull()
        expect(validarNombreMarca("a".repeat(101))).toBe("El nombre admite hasta 100 caracteres.")
    })
})