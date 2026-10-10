import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock de Bootstrap: jsdom no implementa las transiciones del Toast de las
// tarjetas, así que se reemplaza por una clase vacía que solo permite montar.
vi.mock("bootstrap", () => ({
    Toast: class {
        constructor() {}
        dispose() {}
        static getOrCreateInstance() {
            return { show() {} }
        }
    }
}))

// Mock del servicio de productos: Cart lo usa para armar los relacionados.
vi.mock("../../services/productoService", () => ({
    obtenerProductos: vi.fn()
}))

import { obtenerProductos } from "../../services/productoService"
import { Cart } from "../../pages/Cart"
import { CartProvider } from "../../context/CartProvider"
import { AuthProvider } from "../../context/AuthProvider"

// Factoría de productos: la forma mínima que esperan las líneas de ProductCardH
// y las utilidades de recomendados (categorías, stock e imagen).
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

// Línea del carrito en el formato que lee CartProvider desde localStorage.
const item = (producto, units) => ({ product: producto, units })

// Siembra el carrito local sin pasar por los botones, igual que haría un
// visitante que dejó productos guardados en su navegador.
const seedCart = (items) => {
    localStorage.setItem("eSamCart", JSON.stringify(items))
}

// Siembra una sesión activa para los flujos de pago autenticados.
const seedSesion = (usuario) => {
    localStorage.setItem("eSamToken", "token-fake")
    localStorage.setItem("eSamSession", JSON.stringify(usuario))
}

// Renderiza Cart con los providers que necesita: AuthProvider (Cart desestructura
// useAuth) y CartProvider, más rutas para los destinos del botón de pago.
const renderCart = () =>
    render(
        <AuthProvider>
            <CartProvider>
                <MemoryRouter initialEntries={["/carrito"]}>
                    <Routes>
                        <Route path="/carrito" element={<Cart />} />
                        <Route path="/usuario/checkout" element={<div>Página checkout</div>} />
                        <Route path="/login" element={<div>Página login</div>} />
                    </Routes>
                </MemoryRouter>
            </CartProvider>
        </AuthProvider>
    )

describe("Cart", () => {
    // Cada test parte sin sesión, sin carrito y con los mocks sin estado.
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
    })

    it("Muestra las líneas con cantidad, unidades y el total del resumen", async () => {
        seedCart([item(product(1, "Cuaderno", 2490), 2), item(product(2, "Lápiz", 450), 1)])
        obtenerProductos.mockResolvedValue([])

        renderCart()

        // Cada producto aparece como línea con su cantidad y en el desglose; el
        // total suma 2 x $2.490 + 1 x $450 = $5.430.
        expect(screen.getByText("Carrito de compras")).toBeInTheDocument()
        expect(screen.getByDisplayValue("2")).toBeInTheDocument()
        expect(screen.getByDisplayValue("1")).toBeInTheDocument()
        expect(screen.getByText("Productos en el carro: 3")).toBeInTheDocument()
        expect(screen.getByText("2 x Cuaderno")).toBeInTheDocument()
        expect(screen.getByText("1 x Lápiz")).toBeInTheDocument()
        expect(screen.getByText("Sub total: $5.430")).toBeInTheDocument()
    })

    it("Aumenta la cantidad con + y actualiza el subtotal", async () => {
        seedCart([item(product(1, "Cuaderno", 2490), 1)])
        obtenerProductos.mockResolvedValue([])

        renderCart()
        fireEvent.click(screen.getByRole("button", { name: "+" }))

        expect(screen.getByDisplayValue("2")).toBeInTheDocument()
        expect(screen.getByText("Sub total: $4.980")).toBeInTheDocument()
    })

    it("El botón − no deja bajar la cantidad bajo 1", async () => {
        seedCart([item(product(1, "Cuaderno", 2490), 2)])
        obtenerProductos.mockResolvedValue([])

        renderCart()

        // La cantidad mínima por línea es 1: el segundo intento de restar no
        // cambia nada (decreaseUnits devuelve antes con units <= 1).
        fireEvent.click(screen.getByRole("button", { name: "−" }))
        fireEvent.click(screen.getByRole("button", { name: "−" }))

        expect(screen.getByDisplayValue("1")).toBeInTheDocument()
        expect(screen.getByText("Productos en el carro: 1")).toBeInTheDocument()
    })

    it("Elimina la línea con la papelera y deshabilita Pagar", async () => {
        seedCart([item(product(1, "Cuaderno", 2490), 1)])
        obtenerProductos.mockResolvedValue([])

        renderCart()

        fireEvent.click(screen.getByRole("button", { name: "Quitar Cuaderno del carrito" }))

        expect(screen.queryByText("Cuaderno")).not.toBeInTheDocument()
        expect(screen.getByText("Productos en el carro: 0")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Pagar" })).toBeDisabled()
    })

    it("Advierte cuando la cantidad supera el stock disponible actualizado", async () => {
        seedCart([item(product(1, "Cuaderno", 2490, 3), 5)])
        obtenerProductos.mockResolvedValue([])

        renderCart()

        expect(screen.getByText("La cantidad supera el stock disponible actualizado.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "+" })).toBeDisabled()
    })

    it("Muestra los relacionados desde la categoría más presente del carrito", async () => {
        seedCart([item(product(1, "Cuaderno", 2490, 5, [{ idCategoria: 1 }]), 1)])
        obtenerProductos.mockResolvedValue([
            product(1, "Cuaderno", 2490, 5, [{ idCategoria: 1 }]),
            product(2, "Lápiz", 450, 5, [{ idCategoria: 1 }]),
            product(3, "Regla", 990, 5, [{ idCategoria: 2 }])
        ])

        renderCart()

        // Los relacionados salen de la categoría más repetida (1), excluyen lo que
        // ya está en el carrito y se completan con los primeros del catálogo.
        expect(await screen.findByText("Productos relacionados")).toBeInTheDocument()
        expect(screen.getByText("Lápiz")).toBeInTheDocument()
        expect(screen.getByText("Regla")).toBeInTheDocument()
        expect(screen.getAllByText("Cuaderno")).toHaveLength(1)
    })

    it("Pagar sin sesión navega al login", async () => {
        seedCart([item(product(1, "Cuaderno", 2490), 1)])
        obtenerProductos.mockResolvedValue([])

        renderCart()
        fireEvent.click(screen.getByRole("button", { name: "Pagar" }))

        expect(screen.getByText("Página login")).toBeInTheDocument()
    })

    it("Pagar con un rol que no es cliente avisa sin navegar", async () => {
        seedSesion({ rol: "vendedor" })
        seedCart([item(product(1, "Cuaderno", 2490), 1)])
        obtenerProductos.mockResolvedValue([])

        renderCart()
        fireEvent.click(screen.getByRole("button", { name: "Pagar" }))

        expect(screen.getByText("Inicia sesión con una cuenta de cliente para finalizar la compra.")).toBeInTheDocument()
        expect(screen.queryByText("Página checkout")).not.toBeInTheDocument()
    })

    it("Pagar como cliente autenticado navega al checkout", async () => {
        seedSesion({ rol: "cliente" })
        seedCart([item(product(1, "Cuaderno", 2490), 1)])
        obtenerProductos.mockResolvedValue([])

        renderCart()
        fireEvent.click(screen.getByRole("button", { name: "Pagar" }))

        expect(screen.getByText("Página checkout")).toBeInTheDocument()
    })
})