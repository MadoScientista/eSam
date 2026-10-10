import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock de Bootstrap: jsdom no implementa las transiciones del Toast, así que se
// reemplaza por una clase vacía que solo permite montar el componente.
vi.mock("bootstrap", () => ({
    Toast: class {
        constructor() {}
        dispose() {}
        static getOrCreateInstance() {
            return { show() {} }
        }
    }
}))

// Mock de los dos servicios que consume Category al montar: obtenerCategorias y
// obtenerProductos se sustituyen por vi.fn para controlar su resolución.
vi.mock("../../services/categoriaService", () => ({
    obtenerCategorias: vi.fn()
}))

vi.mock("../../services/productoService", () => ({
    obtenerProductos: vi.fn()
}))

import { obtenerCategorias } from "../../services/categoriaService"
import { obtenerProductos } from "../../services/productoService"
import { Category } from "../../pages/Category"
import { CartProvider } from "../../context/CartProvider"

// Stub de la ruta /productos que Category alcanza desde los accesos rápidos y
// desde "Ver todo": muestra el parámetro de categoría para verificar la URL.
function ProductosStub() {
    const [searchParams] = useSearchParams()
    return <div>Página productos categoría {searchParams.get("categoria")}</div>
}

// Factoría de productos: la misma forma mínima que esperan ProductCard,
// productosDeCategoria y el carrusel (categorías, marcaDetalle, stock e imagen).
const product = (id, nombre, precio, categorias = []) => ({
    idProducto: id,
    nombre,
    precio,
    stock: 5,
    stockReservado: 0,
    sku: `SKU-${id}`,
    marcaDetalle: null,
    categorias,
    imagenes: [{ url: `img-${id}.jpg`, principal: true }]
})

// Factoría de categoría: idCategoriaPadre null marca una raíz, el valor usado
// por CategoryBanner (accesos rápidos) y por los bloques de sección.
const categoria = (id, nombre, idCategoriaPadre = null, imagenUrl = null) => ({
    idCategoria: id,
    nombre,
    idCategoriaPadre,
    imagenUrl
})

// Renderiza Category con los providers que necesita: CartProvider (useCart del
// carrusel) y MemoryRouter con la ruta de /productos para verificar la navegación.
const renderCategory = () =>
    render(
        <CartProvider>
            <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route path="/" element={<Category />} />
                    <Route path="/productos" element={<ProductosStub />} />
                </Routes>
            </MemoryRouter>
        </CartProvider>
    )

describe("Category", () => {
    // Cada test parte con el carrito local limpio y los mocks sin estado previo.
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
    })

    it("Carga datos y muestra un bloque por categoría raíz con productos", async () => {
        obtenerCategorias.mockResolvedValue([
            categoria(1, "Librería"),
            categoria(2, "Cuadernos", 1),
            categoria(3, "Pintura")
        ])
        obtenerProductos.mockResolvedValue([
            product(1, "Cuaderno", 2490, [{ idCategoria: 2 }]),
            product(2, "Lápiz", 450, [{ idCategoria: 1 }])
        ])

        renderCategory()

        // La sección de "Librería" reúne los productos de la raíz y sus
        // subcategorías; "Pintura" no tiene productos, así que no genera bloque.
        expect(await screen.findByRole("heading", { level: 3, name: "Librería" })).toBeInTheDocument()
        expect(screen.getByText("Cuaderno")).toBeInTheDocument()
        expect(screen.getByText("Lápiz")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Ver todo" })).toBeInTheDocument()
        expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1)
    })

    it("Muestra los accesos rápidos con las categorías raíz", async () => {
        obtenerCategorias.mockResolvedValue([
            categoria(1, "Librería"),
            categoria(2, "Cuadernos", 1),
            categoria(3, "Pintura")
        ])
        obtenerProductos.mockResolvedValue([product(1, "Cuaderno", 2490, [{ idCategoria: 2 }])])

        renderCategory()

        // El banner coloca una tarjeta por categoría raíz; las subcategorías no
        // aparecen como acceso rápido. La tarjeta usa h6, distinto del h3 de bloque.
        expect(await screen.findByText("Cuaderno")).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 6, name: "Librería" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 6, name: "Pintura" })).toBeInTheDocument()
        expect(screen.queryByRole("heading", { level: 6, name: "Cuadernos" })).not.toBeInTheDocument()
    })

    it("Muestra la alerta y registra el error cuando falla la carga", async () => {
        const error = new Error("backend caído")
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        obtenerCategorias.mockRejectedValue(error)

        renderCategory()

        // Promise.all rechaza con el primer error; la página lo muestra en la
        // alerta y lo reporta por consola. Se restaura el spy al final.
        await screen.findByRole("alert")
        expect(screen.getByRole("alert")).toHaveTextContent("backend caído")
        expect(consoleSpy).toHaveBeenCalledWith("Error al cargar categorias", error)
        consoleSpy.mockRestore()
    })

    it("Avisa cuando hay categorías pero ninguna tiene productos", async () => {
        obtenerCategorias.mockResolvedValue([categoria(1, "Librería")])
        obtenerProductos.mockResolvedValue([])

        renderCategory()

        expect(await screen.findByText("Todavía no hay productos publicados en las categorías.")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Ver todo" })).not.toBeInTheDocument()
    })

    it("Ver todo navega al listado con la categoría de la sección", async () => {
        obtenerCategorias.mockResolvedValue([categoria(1, "Librería")])
        obtenerProductos.mockResolvedValue([product(1, "Cuaderno", 2490, [{ idCategoria: 1 }])])

        renderCategory()
        fireEvent.click(await screen.findByRole("button", { name: "Ver todo" }))

        expect(screen.getByText("Página productos categoría 1")).toBeInTheDocument()
    })

    it("Un acceso rápido navega al listado con su categoría", async () => {
        obtenerCategorias.mockResolvedValue([categoria(3, "Pintura")])
        obtenerProductos.mockResolvedValue([])

        renderCategory()
        fireEvent.click(await screen.findByRole("heading", { level: 6, name: "Pintura" }))

        expect(screen.getByText("Página productos categoría 3")).toBeInTheDocument()
    })
})