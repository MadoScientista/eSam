import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock de Bootstrap: jsdom no implementa las transiciones del Toast, así que se
// reemplaza por una clase vacía que solo permite montar el componente y mostrar.
vi.mock("bootstrap", () => ({
    Toast: class {
        constructor() {}
        dispose() {}
        static getOrCreateInstance() {
            return { show() {} }
        }
    }
}))

// Mock de los dos servicios que consume ProductDetails: obtenerProductoPorId
// (producto actual) y obtenerProductos (catálogo para los relacionados).
vi.mock("../../services/productoService", () => ({
    obtenerProductoPorId: vi.fn(),
    obtenerProductos: vi.fn()
}))

import { obtenerProductoPorId, obtenerProductos } from "../../services/productoService"
import { ProductDetails } from "../../pages/ProductDetails"
import { CartProvider } from "../../context/CartProvider"

// Factoría de productos: la misma forma mínima que esperan ProductCard, el
// detalle (categorías, imágenes, stock) y productosRecomendados.
const product = (id, nombre, precio, stock = 5, categorias = []) => ({
    idProducto: id,
    nombre,
    precio,
    stock,
    stockReservado: 0,
    sku: `SKU-${id}`,
    descripcion: `Descripción de ${nombre}`,
    marcaDetalle: null,
    categorias,
    imagenes: [{ url: `img-${id}.jpg`, principal: true }]
})

// Renderiza ProductDetails con los providers que necesita: CartProvider (useCart
// del botón y de las tarjetas) y MemoryRouter con la ruta del detalle.
const renderProductDetails = (id = "1") =>
    render(
        <CartProvider>
            <MemoryRouter initialEntries={[`/detalleProducto/${id}`]}>
                <Routes>
                    <Route path="/detalleProducto/:idProducto" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        </CartProvider>
    )

describe("ProductDetails", () => {
    // Cada test parte con el carrito limpio, los mocks sin estado y el scroll del
    // lienzo simulado porque jsdom no implementa window.scrollTo.
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
        window.scrollTo = vi.fn()
    })

    it("Carga el producto por su id y muestra su información y stock", async () => {
        obtenerProductoPorId.mockResolvedValue(product(1, "Cuaderno", 2490))
        obtenerProductos.mockResolvedValue([])

        renderProductDetails("7")

        expect(await screen.findByText("Cuaderno")).toBeInTheDocument()
        expect(screen.getByText("Descripción de Cuaderno")).toBeInTheDocument()
        expect(screen.getByText("$2.490")).toBeInTheDocument()
        expect(screen.getByText(/Disponibles: 5/)).toBeInTheDocument()
        expect(obtenerProductoPorId).toHaveBeenCalledWith("7")
    })

    it("Muestra la imagen principal del producto", async () => {
        obtenerProductoPorId.mockResolvedValue(product(1, "Cuaderno", 2490))
        obtenerProductos.mockResolvedValue([])

        renderProductDetails()

        // Sin relacionados no hay otras tarjetas, así que el alt solo corresponde
        // a la imagen principal del detalle.
        const imagen = await screen.findByAltText("Cuaderno")
        expect(imagen).toHaveAttribute("src", "img-1.jpg")
    })

    it("Añadir agrega al carrito y muestra el toast", async () => {
        obtenerProductoPorId.mockResolvedValue(product(1, "Cuaderno", 2490))
        obtenerProductos.mockResolvedValue([])

        renderProductDetails()
        fireEvent.click(await screen.findByRole("button", { name: "Añadir" }))

        // El título del toast va en un <strong> aparte, así que la aserción usa
        // el rol alert y verifica el texto completo del cuerpo.
        expect(screen.getByRole("alert")).toHaveTextContent("Carrito: Cuaderno agregado al carrito.")
    })

    it("Deshabilita Añadir cuando el carrito agota el stock disponible", async () => {
        obtenerProductoPorId.mockResolvedValue(product(1, "Cuaderno", 2490, 2))
        obtenerProductos.mockResolvedValue([])

        renderProductDetails()
        const boton = await screen.findByRole("button", { name: "Añadir" })

        expect(boton).toBeEnabled()

        // Con dos clics se alcanza el stock (2 de 2) y el botón queda inactivo.
        fireEvent.click(boton)
        fireEvent.click(boton)

        expect(boton).toBeDisabled()
    })

    it("Muestra los productos relacionados de la misma categoría", async () => {
        obtenerProductoPorId.mockResolvedValue(product(1, "Cuaderno", 2490, 5, [{ idCategoria: 1 }]))
        obtenerProductos.mockResolvedValue([
            product(2, "Lápiz", 450, 5, [{ idCategoria: 1 }]),
            product(3, "Regla", 990, 5, [{ idCategoria: 9 }])
        ])

        renderProductDetails()

        // El carrusel de relacionados se llena primero con la misma categoría y
        // se completa con los primeros del catálogo; el producto actual no se repite.
        expect(await screen.findByText("Lápiz")).toBeInTheDocument()
        expect(screen.getByText("Regla")).toBeInTheDocument()
        expect(screen.getByText("Productos relacionados")).toBeInTheDocument()
        expect(screen.queryByText("Descripción de Cuaderno")).toBeInTheDocument()
    })

    it("Muestra el mensaje cuando no hay productos relacionados", async () => {
        obtenerProductoPorId.mockResolvedValue(product(1, "Cuaderno", 2490))
        obtenerProductos.mockResolvedValue([])

        renderProductDetails()

        expect(await screen.findByText("No hay otros productos relacionados por ahora.")).toBeInTheDocument()
    })

    it("Registra el error y deja el botón deshabilitado cuando falla la carga", async () => {
        const error = new Error("backend caído")
        obtenerProductoPorId.mockRejectedValue(error)
        obtenerProductos.mockResolvedValue([])
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

        renderProductDetails()

        // Sin producto cargado no hay nada que añadir y el error se reporta.
        await screen.findByRole("button", { name: "Añadir" })
        expect(screen.getByRole("button", { name: "Añadir" })).toBeDisabled()
        expect(consoleSpy).toHaveBeenCalledWith("Error al cargar producto", error)
        consoleSpy.mockRestore()
    })
})