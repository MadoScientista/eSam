import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock de Bootstrap: jsdom no implementa las transiciones, así que Toast se
// reemplaza por una clase vacía que solo permite montar el componente sin
// tocar el código real de Bootstrap.
vi.mock("bootstrap", () => ({
    Toast: class {
        constructor() {}
        dispose() {}
        static getOrCreateInstance() {
            return { show() {} }
        }
    }
}))

// Mock de los dos servicios que consume Products al montar: obtenerProductos y
// obtenerCategorias se sustituyen por vi.fn para controlar su resolución.
vi.mock("../../services/productoService", () => ({
    obtenerProductos: vi.fn()
}))

vi.mock("../../services/categoriaService", () => ({
    obtenerCategorias: vi.fn()
}))

import { obtenerProductos } from "../../services/productoService"
import { obtenerCategorias } from "../../services/categoriaService"
import { Products } from "../../pages/Products"
import { CartProvider } from "../../context/CartProvider"

// Factoría de productos: la misma forma mínima que esperan ProductCard y las
// utilidades de filtrado (categorías, marcaDetalle, imágenes y stock).
const product = (id, nombre, precio, marca = "Marca Genérica", categorias = []) => ({
    idProducto: id,
    nombre,
    precio,
    stock: 5,
    stockReservado: 0,
    sku: `SKU-${id}`,
    marcaDetalle: { nombre: marca },
    categorias,
    imagenes: [{ url: `img-${id}.jpg`, principal: true }]
})

// Factoría de categoría con la estructura que espera el árbol (idCategoriaPadre).
const categoria = (id, nombre, idCategoriaPadre = null) => ({
    idCategoria: id,
    nombre,
    idCategoriaPadre
})

// Renderiza Products con los providers que necesita: CartProvider (useCart de
// ProductCard) y MemoryRouter con una ruta para el detalle, además de la ruta
// inicial para los tests que entran con ?categoria= en la URL.
const renderProducts = (initialEntries = ["/"]) =>
    render(
        <CartProvider>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/" element={<Products />} />
                    <Route path="/detalleProducto/:idProducto" element={<div>Página detalle</div>} />
                </Routes>
            </MemoryRouter>
        </CartProvider>
    )

describe("Products", () => {
    // Cada test parte con el carrito local limpio y los mocks sin estado previo.
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
    })

    it("Carga productos y categorías, y muestra la grilla con su contador", async () => {
        obtenerProductos.mockResolvedValue([
            product(1, "Cuaderno", 2490),
            product(2, "Lápiz", 450)
        ])
        obtenerCategorias.mockResolvedValue([])

        renderProducts()

        expect(await screen.findByText("Cuaderno")).toBeInTheDocument()
        expect(screen.getByText("Lápiz")).toBeInTheDocument()
        expect(screen.getByText("Productos")).toBeInTheDocument()
        expect(screen.getByText("Mostrando 2 de 2 productos")).toBeInTheDocument()
    })

    it("Muestra la alerta y registra el error cuando falla la carga", async () => {
        const error = new Error("no se pudo contactar el backend")
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        obtenerProductos.mockRejectedValue(error)

        renderProducts()

        // Promise.all rechaza con el primer error; la página lo muestra en una
        // alerta y lo reporta por consola. Se restaura el spy al final.
        await screen.findByRole("alert")
        expect(screen.getByRole("alert")).toHaveTextContent("no se pudo contactar el backend")
        expect(consoleSpy).toHaveBeenCalledWith("Error al cargar productos", error)
        consoleSpy.mockRestore()
    })

    it("Filtra la grilla por búsqueda de texto", async () => {
        obtenerProductos.mockResolvedValue([
            product(1, "Cuaderno", 2490),
            product(2, "Lápiz", 450)
        ])
        obtenerCategorias.mockResolvedValue([])

        renderProducts()
        await screen.findByText("Cuaderno")

        fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: "lapiz" } })

        // La búsqueda es insensible a tildes (normalizarTexto), así que "lapiz"
        // encuentra "Lápiz" y oculta "Cuaderno".
        expect(screen.getByText("Lápiz")).toBeInTheDocument()
        expect(screen.queryByText("Cuaderno")).not.toBeInTheDocument()
    })

    it("Ordena los productos por precio ascendente", async () => {
        obtenerProductos.mockResolvedValue([
            product(1, "Cuaderno", 2490),
            product(2, "Lápiz", 450),
            product(3, "Regla", 990)
        ])
        obtenerCategorias.mockResolvedValue([])

        const { container } = renderProducts()
        await screen.findByText("Cuaderno")

        fireEvent.change(screen.getByLabelText("Ordenar por"), { target: { value: "precio-asc" } })

        // Se lee el orden real de las tarjetas en el DOM para verificar que el
        // criterio elegido reordena la grilla de menor a mayor precio.
        const titulos = [...container.querySelectorAll(".card-title")].map((el) => el.textContent)
        expect(titulos).toEqual(["Lápiz", "Regla", "Cuaderno"])
    })

    it("Filtra la grilla por marca seleccionada", async () => {
        obtenerProductos.mockResolvedValue([
            product(1, "Cuaderno", 2490, "Marca A"),
            product(2, "Lápiz", 450, "Marca B")
        ])
        obtenerCategorias.mockResolvedValue([])

        renderProducts()
        await screen.findByText("Cuaderno")

        fireEvent.click(screen.getByRole("checkbox", { name: /Marca A/ }))

        expect(screen.getByText("Cuaderno")).toBeInTheDocument()
        expect(screen.queryByText("Lápiz")).not.toBeInTheDocument()
    })

    it("Filtra por categoría desde la URL y muestra su nombre en el encabezado", async () => {
        obtenerProductos.mockResolvedValue([
            product(1, "Cuaderno", 2490, "Marca A", [{ idCategoria: 1 }]),
            product(2, "Lápiz", 450, "Marca B", [{ idCategoria: 2 }])
        ])
        obtenerCategorias.mockResolvedValue([categoria(1, "Librería")])

        renderProducts(["/?categoria=1"])

        // Con una sola categoría el encabezado toma su nombre y el listado queda
        // limitado a sus productos. Se busca por rol heading porque el nombre de
        // la categoría también aparece como etiqueta del filtro en el sidebar.
        expect(await screen.findByText("Cuaderno")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Librería" })).toBeInTheDocument()
        expect(screen.queryByText("Lápiz")).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Ver todos los productos" })).toBeInTheDocument()
    })

    it("Ver todos los productos limpia el filtro de categoría", async () => {
        obtenerProductos.mockResolvedValue([
            product(1, "Cuaderno", 2490, "Marca A", [{ idCategoria: 1 }]),
            product(2, "Lápiz", 450, "Marca B", [{ idCategoria: 2 }])
        ])
        obtenerCategorias.mockResolvedValue([categoria(1, "Librería")])

        renderProducts(["/?categoria=1"])
        await screen.findByText("Cuaderno")

        fireEvent.click(screen.getByRole("button", { name: "Ver todos los productos" }))

        // Al limpiar, el encabezado vuelve al título general, desaparece el botón
        // y vuelven a verse todos los productos.
        expect(screen.getByText("Productos")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Ver todos los productos" })).not.toBeInTheDocument()
        expect(screen.getByText("Lápiz")).toBeInTheDocument()
    })

    it("Muestra el mensaje vacío cuando ningún producto coincide con los filtros", async () => {
        obtenerProductos.mockResolvedValue([product(1, "Cuaderno", 2490)])
        obtenerCategorias.mockResolvedValue([])

        renderProducts()
        await screen.findByText("Cuaderno")

        fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: "no existe" } })

        expect(screen.getByText("No se encontraron productos con esos filtros.")).toBeInTheDocument()
        expect(screen.queryByText("Cuaderno")).not.toBeInTheDocument()
    })

    it("Click en una tarjeta navega al detalle del producto", async () => {
        obtenerProductos.mockResolvedValue([product(1, "Cuaderno", 2490)])
        obtenerCategorias.mockResolvedValue([])

        renderProducts()
        fireEvent.click(await screen.findByText("Cuaderno"))

        expect(screen.getByText("Página detalle")).toBeInTheDocument()
    })
})