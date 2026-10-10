import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { Blogs } from "../../pages/Blogs"
import { entradasBlog } from "../../const/entradasBlog"

const renderBlogs = () =>
    render(
        <MemoryRouter initialEntries={["/blogs"]}>
            <Routes>
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/entradaBlog/:idEntrada" element={<div>Detalle entrada</div>} />
            </Routes>
        </MemoryRouter>
    )

describe("Blogs", () => {
    it("Muestra el encabezado y una tarjeta por entrada", () => {
        renderBlogs()

        expect(screen.getByRole("heading", { name: "Blog" })).toBeInTheDocument()
        entradasBlog.forEach((entrada) => {
            expect(screen.getByRole("heading", { name: entrada.titulo })).toBeInTheDocument()
        })
    })

    it("Navega al detalle al hacer click en una tarjeta", () => {
        renderBlogs()

        fireEvent.click(screen.getByRole("heading", { name: entradasBlog[0].titulo }))

        expect(screen.getByText("Detalle entrada")).toBeInTheDocument()
    })
})
