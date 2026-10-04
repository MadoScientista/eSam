import { describe, it, expect } from "vitest";
import { saludo } from "./saludo";

describe("Saludo", () => {
    it("Valida Saludo", () => {
        expect(saludo("carola")).toBe("Hola carola")
    }) 
})