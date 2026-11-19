import { render, screen, waitFor, within } from "@testing-library/react"
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

vi.mock("../../services/categoriaService", () => ({
    obtenerCategorias: vi.fn()
}))

import { obtenerProductos } from "../../services/productoService"
import { obtenerCategorias } from "../../services/categoriaService"
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

const category = (id, nombre, idCategoriaPadre = null) => ({
    idCategoria: id,
    nombre,
    idCategoriaPadre,
    imagenUrl: null
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
        obtenerCategorias.mockResolvedValue([])
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
        obtenerProductos.mockResolvedValue([
            { ...product(1, "Cuaderno", 2490), marcaDetalle: { nombre: "Artel" } },
            { ...product(2, "Lápiz", 450), marca: "Torre" },
            { ...product(3, "Cuaderno Artel alternativo", 1890), marcaDetalle: { nombre: "artel" } },
            product(4, "Goma sin marca", 250)
        ])

        renderHome()

        // El título de la sección aparece de inmediato; las tarjetas dependen de
        // la promesa resuelta de obtenerProductos, por eso se espera con findBy.
        expect(screen.getByText("Productos destacados")).toBeInTheDocument()
        const featuredSection = screen.getByRole("heading", { level: 2, name: "Productos destacados" }).closest("section")
        expect(await within(featuredSection).findByText("Cuaderno")).toBeInTheDocument()
        expect(within(featuredSection).getByText("Lápiz")).toBeInTheDocument()
        expect(within(featuredSection).queryByText("Cuaderno Artel alternativo")).not.toBeInTheDocument()
        expect(within(featuredSection).queryByText("Goma sin marca")).not.toBeInTheDocument()
        expect(obtenerProductos).toHaveBeenCalledTimes(1)
    })

    it("Muestra los productos Artel en su carrusel y conserva Cuadernos debajo", async () => {
        obtenerProductos.mockResolvedValue([
            { ...product(1, "Cuaderno universitario", 2490), categorias: [{ idCategoria: 5 }] },
            { ...product(2, "Lápices Artel", 450), marcaDetalle: { nombre: "Artel" } },
            { ...product(3, "Témperas Artel", 890), marca: "artel" },
            { ...product(4, "Pinceles Torre", 650), marcaDetalle: { nombre: "Torre" } }
        ])
        obtenerCategorias.mockResolvedValue([
            category(1, "Escritura"),
            category(2, "Lápices", 1),
            category(3, "Arte"),
            category(4, "Cuadernos"),
            category(5, "Universitarios", 4),
            category(6, "Escolar")
        ])

        renderHome()

        const artelHeading = await screen.findByRole("heading", { level: 2, name: "Productos Artel" })
        const artelSection = artelHeading.closest("section")
        expect(within(artelSection).getByText("Lápices Artel")).toBeInTheDocument()
        expect(within(artelSection).getByText("Témperas Artel")).toBeInTheDocument()
        expect(within(artelSection).queryByText("Pinceles Torre")).not.toBeInTheDocument()
        expect(within(artelSection).queryByText("Cuaderno universitario")).not.toBeInTheDocument()

        const cuadernosSection = screen.getByRole("heading", { level: 2, name: "Cuadernos" }).closest("section")
        expect(within(cuadernosSection).getByText("Cuaderno universitario")).toBeInTheDocument()
        expect(within(cuadernosSection).queryByText("Lápices Artel")).not.toBeInTheDocument()
        expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
            "Productos destacados",
            "Productos Artel",
            "Cuadernos"
        ])
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