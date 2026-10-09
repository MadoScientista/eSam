import { describe, expect, it } from "vitest"
import { formatearPrecio } from "../../utils/moneda"

describe("formatearPrecio", () => {
    it("Formatea en pesos chilenos con separador de miles", () => {
        expect(formatearPrecio(2490)).toBe("$2.490")
        expect(formatearPrecio(1000000)).toBe("$1.000.000")
    })

    it("Precios sin miles se muestran tal cual", () => {
        expect(formatearPrecio(450)).toBe("$450")
        expect(formatearPrecio(0)).toBe("$0")
    })

    it("Redondea precios con decimales", () => {
        expect(formatearPrecio(12345.5)).toBe("$12.346")
    })
})