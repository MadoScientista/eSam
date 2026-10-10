import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AboutUs } from "../../pages/AboutUs"

describe("AboutUs", () => {
    it("Muestra el encabezado, la historia y la misión", () => {
        render(<AboutUs />)

        expect(screen.getByRole("heading", { name: "Sobre nosotros" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Nuestra historia" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Nuestra misión" })).toBeInTheDocument()
        expect(screen.getByText(/eSam nació en un pequeño local de barrio/)).toBeInTheDocument()
    })

    it("Lista los cuatro valores de la empresa", () => {
        render(<AboutUs />)

        const lista = screen.getByRole("list")
        expect(within(lista).getAllByRole("listitem")).toHaveLength(4)
        expect(within(lista).getByText(/Calidad:/)).toBeInTheDocument()
        expect(within(lista).getByText(/Comunidad:/)).toBeInTheDocument()
    })

    it("Muestra los datos de contacto", () => {
        render(<AboutUs />)

        expect(screen.getByText(/Av\. de los Estudiantes 1234/)).toBeInTheDocument()
        expect(screen.getByText("(11) 555-0199")).toBeInTheDocument()
        expect(screen.getByText("hola@esam.com")).toBeInTheDocument()
    })
})
