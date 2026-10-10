import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock de Bootstrap: jsdom no implementa las transiciones del carrusel ni del
// toast, así que se reemplazan por clases vacías que solo permiten montar los
// componentes sin ejecutar el código real de Bootstrap.
vi.mock("bootstrap", () => ({
    Carousel: class {
        constructor() {}
        dispose() {}
    },
    Toast: class {
        constructor() {}
        dispose() {}
        static getOrCreateInstance() {
            return { show() {} }
        }
    }
}))

// Mock del servicio de productos: Home llama a obtenerProductos al montar,
// así que se sustituye por un vi.fn para controlar su resolución en cada test.
vi.mock("../../services/productoService", () => ({
    obtenerProductos: vi.fn()
}))

import { obtenerProductos } from "../../services/productoService"
import { Home } from "../../pages/Home"
import { CartProvider } from "../../context/CartProvider"

// Factoría de productos: devuelve un producto con la forma mínima que espera
// ProductCard (imagen principal, stock y categorías) para poder renderizarlo.
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

// Renderiza Home dentro de los providers que necesita: CartProvider (usado por
// ProductCard a través de useCart) y MemoryRouter para los enlaces/navegación.
const renderHome = () =>
    render(
        <CartProvider>
            <MemoryRouter initialEntries={["/"]}>
                <Home />
            </MemoryRouter>
        </CartProvider>
    )

describe("Home", () => {
    // Cada test parte con el carrito local limpio y los mocks sin estado previo.
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
    })

    it("Renderiza el banner de bienvenida con el acceso al catálogo", () => {
        obtenerProductos.mockResolvedValue([])

        renderHome()

        expect(screen.getByText("Bienvenido a ESam")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Revisa nuestro catálogo" })).toHaveAttribute(
            "href",
            "/productos"
        )
    })

    it("Carga los productos destacados con obtenerProductos", async () => {
        obtenerProductos.mockResolvedValue([product(1, "Cuaderno", 2490), product(2, "Lápiz", 450)])

        renderHome()

        // El título de la sección aparece de inmediato; las tarjetas dependen de
        // la promesa resuelta de obtenerProductos, por eso se espera con findBy.
        expect(screen.getByText("Productos destacados")).toBeInTheDocument()
        expect(await screen.findByText("Cuaderno")).toBeInTheDocument()
        expect(screen.getByText("Lápiz")).toBeInTheDocument()
        expect(obtenerProductos).toHaveBeenCalledTimes(1)
    })

    it("No muestra el carrusel cuando no hay productos", async () => {
        obtenerProductos.mockResolvedValue([])

        renderHome()

        // Se espera a que la carga termine y luego se verifica que, al no haber
        // datos, la sección queda sin flechas de navegación de carrusel.
        await waitFor(() => expect(obtenerProductos).toHaveBeenCalled())
        expect(screen.getByText("Productos destacados")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Siguientes productos" })).not.toBeInTheDocument()
    })

    it("Registra el error en consola cuando falla la carga de productos", async () => {
        const error = new Error("backend caído")
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        obtenerProductos.mockRejectedValue(error)

        renderHome()

        // Home captura el rechazo y lo reporta con console.error; el spy permite
        // verificarlo sin ensuciar la salida del runner. Se restaura al final.
        await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith("Error al cargar productos", error)
        )
        consoleSpy.mockRestore()
    })
})