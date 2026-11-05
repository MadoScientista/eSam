import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Contact } from "../../pages/Contact"

const enviarMensaje = () => {
    fireEvent.change(screen.getByLabelText("Nombre completo"), { target: { value: "Ana" } })
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "ana@duoc.cl" } })
    fireEvent.change(screen.getByLabelText("Mensaje"), { target: { value: "Hola" } })
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }))
}

describe("Contact", () => {
    it("Muestra los datos de contacto, redes y el formulario", () => {
        render(<Contact />)

        expect(screen.getByRole("heading", { name: "Contáctanos" })).toBeInTheDocument()
        expect(screen.getByText("(+56) 22554878")).toBeInTheDocument()
        expect(screen.getByText("hola@esam.com")).toBeInTheDocument()
        expect(screen.getByText("Envíanos un mensaje")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Instagram" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Facebook" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "WhatsApp" })).toBeInTheDocument()
    })

    it("Envía el mensaje y muestra la alerta de éxito con el formulario limpio", () => {
        render(<Contact />)

        enviarMensaje()

        expect(screen.getByRole("alert")).toHaveTextContent("Tu mensaje fue enviado. Te responderemos a la brevedad.")
        expect(screen.getByLabelText("Nombre completo")).toHaveValue("")
        expect(screen.getByLabelText("Mensaje")).toHaveValue("")
    })

    it("Cierra la alerta de éxito", () => {
        render(<Contact />)

        enviarMensaje()
        fireEvent.click(screen.getByRole("button", { name: "Cerrar" }))

        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })
})
