import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProductCarousel } from "../../components/ProductCarousel"
import { CartProvider } from "../../context/CartProvider"

// jsdom no implementa las transiciones de Bootstrap; el Toast solo necesita
// renderizarse, así que se evita tocar el código real de bootstrap.
vi.mock("bootstrap", () => ({
    Toast: class {
        constructor() {}
        dispose() {}
        static getOrCreateInstance() {
            return { show() {} }
        }
    }
}))

const product = (id, nombre, precio, stock = 5) => ({
    idProducto: id,
    nombre,
    precio,
    stock,
    stockReservado: 0,
    sku: `SKU-${id}`,
    categorias: [],
    imagenes: [{ url: `img-${id}.jpg`, principal: true }]
})

const renderCarousel = (products, initialEntries = ["/"]) =>
    render(
        <CartProvider>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/" element={<ProductCarousel products={products} />} />
                    <Route path="/detalleProducto/:idProducto" element={<div>Página detalle</div>} />
                </Routes>
            </MemoryRouter>
        </CartProvider>
    )

describe("ProductCarousel", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it("Devuelve null cuando no hay productos", () => {
        const { container } = renderCarousel([])

        expect(container.firstChild).toBeNull()
    })

    it("Renderiza una tarjeta por producto con nombre, precio, imagen y stock", () => {
        renderCarousel([product(1, "Cuaderno", 2490), product(2, "Lápiz", 450)])

        expect(screen.getByText("Cuaderno")).toBeInTheDocument()
        expect(screen.getByText("Lápiz")).toBeInTheDocument()
        expect(screen.getByText("$2.490")).toBeInTheDocument()
        expect(screen.getByText("$450")).toBeInTheDocument()
        expect(screen.getAllByText(/Disponibles: 5u/)).toHaveLength(2)
        expect(screen.getByAltText("Cuaderno")).toHaveAttribute("src", "img-1.jpg")
    })

    it("Muestra las flechas para navegar por el carrusel", () => {
        renderCarousel([product(1, "A", 100)])

        expect(screen.getByRole("button", { name: "Productos anteriores" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Siguientes productos" })).toBeInTheDocument()
    })

    it("Las flechas desplazan el carrusel en la dirección indicada", () => {
        renderCarousel([product(1, "A", 100)])

        const contenedor = document.querySelector(".product-carousel")
        const scrollTo = vi.fn()
        contenedor.scrollTo = scrollTo

        fireEvent.click(screen.getByRole("button", { name: "Siguientes productos" }))
        fireEvent.click(screen.getByRole("button", { name: "Productos anteriores" }))

        expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }))
        expect(scrollTo).toHaveBeenCalledTimes(2)
    })

    it("Click en una tarjeta navega al detalle del producto", () => {
        renderCarousel([product(1, "Cuaderno", 2490)])

        fireEvent.click(screen.getByText("Cuaderno"))

        expect(screen.getByText("Página detalle")).toBeInTheDocument()
    })

    it("Agrega al carrito hasta agotar el stock y muestra el toast", () => {
        renderCarousel([product(1, "Cuaderno", 2490, 2)])

        const botonAgregar = screen.getByRole("button", { name: "Agregar Cuaderno al carrito" })

        fireEvent.click(botonAgregar)
        expect(screen.getByText("Cuaderno agregado al carrito.")).toBeInTheDocument()
        expect(botonAgregar).not.toBeDisabled()

        fireEvent.click(botonAgregar)
        expect(botonAgregar).toBeDisabled()
        expect(screen.queryByText("Página detalle")).not.toBeInTheDocument()
    })
})