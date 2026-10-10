import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { BlogArticle } from "../../pages/BlogArticle"
import { entradasBlog } from "../../const/entradasBlog"

const renderArticle = (id) =>
    render(
        <MemoryRouter initialEntries={[`/entradaBlog/${id}`]}>
            <Routes>
                <Route path="/entradaBlog/:idEntrada" element={<BlogArticle />} />
                <Route path="/blogs" element={<div>Lista blogs</div>} />
            </Routes>
        </MemoryRouter>
    )

describe("BlogArticle", () => {
    it("Muestra la información de la entrada y su contenido", () => {
        const entrada = entradasBlog[0]
        renderArticle(entrada.id)

        expect(screen.getByRole("heading", { name: entrada.titulo })).toBeInTheDocument()
        expect(screen.getByText(entrada.autor)).toBeInTheDocument()
        expect(screen.getByText(entrada.categoria)).toBeInTheDocument()
        expect(screen.getByText("15 de agosto de 2026")).toBeInTheDocument()
        expect(screen.getByText(entrada.resumen)).toBeInTheDocument()
        expect(screen.getByText(/min de lectura/)).toBeInTheDocument()
    })

    it("Renderiza los pasos numerados del cuerpo como lista", () => {
        renderArticle(2)

        const lista = screen.getByRole("list")
        expect(within(lista).getAllByRole("listitem")).toHaveLength(5)
        expect(within(lista).getByText(/Utiliza carpetas o fundas para proteger los cuadernos/)).toBeInTheDocument()
    })

    it("Muestra las otras entradas en Sigue leyendo", () => {
        renderArticle(1)

        expect(screen.getByRole("heading", { name: "Sigue leyendo" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: entradasBlog[1].titulo })).toBeInTheDocument()
    })

    it("Muestra el aviso y permite volver cuando la entrada no existe", () => {
        renderArticle(99)

        expect(screen.getByRole("heading", { name: "Entrada no encontrada" })).toBeInTheDocument()

        fireEvent.click(screen.getByRole("link", { name: /Volver al blog/ }))
        expect(screen.getByText("Lista blogs")).toBeInTheDocument()
    })
})
