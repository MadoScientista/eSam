import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock de servicios: Checkout consume varios servicios en montaje y al completar pedido.
vi.mock("../../services/direccionService", () => ({
    obtenerDirecciones: vi.fn(),
    crearDireccion: vi.fn()
}))
vi.mock("../../services/regionComunaService", () => ({
    obtenerRegionesComunas: vi.fn()
}))
vi.mock("../../services/carritoService", () => ({
    fusionarCarritoLocal: vi.fn()
}))
vi.mock("../../services/pedidoService", () => ({
    crearPedido: vi.fn()
}))

import { obtenerDirecciones, crearDireccion } from "../../services/direccionService"
import { obtenerRegionesComunas } from "../../services/regionComunaService"
import { fusionarCarritoLocal } from "../../services/carritoService"
import { crearPedido } from "../../services/pedidoService"
import { Checkout } from "../../pages/Checkout"
import { AuthProvider } from "../../context/AuthProvider"
import { CartProvider } from "../../context/CartProvider"

// Producto mínimo para poblar el carrito.
const producto = (id, nombre, precio, stock = 10) => ({
    idProducto: id,
    nombre,
    precio,
    stock,
    stockReservado: 0,
    sku: `SKU-${id}`,
    descripcion: `Descripción ${nombre}`,
    marcaDetalle: null,
    categorias: [{ idCategoria: 1, nombre: "Oficina" }],
    imagenes: []
})

// Formato de línea del carrito leído por CartProvider desde localStorage.
const itemCarrito = (p, units) => ({ product: p, units })

// Siembra carrito local para que CartProvider lo cargue.
const seedCart = (items) => {
    localStorage.setItem("eSamCart", JSON.stringify(items))
}

// Siembra sesión cliente (Checkout lee usuario desde useAuth).
const seedSesionCliente = () => {
    localStorage.setItem("eSamToken", "token-fake")
    localStorage.setItem("eSamSession", JSON.stringify({ id: 1, rol: "cliente", nombres: "Ana", aPaterno: "López" }))
}

// Render con providers y rutas para destinos de navegación.
const renderCheckout = () =>
    render(
        <AuthProvider>
            <CartProvider>
                <MemoryRouter initialEntries={["/usuario/checkout"]}>
                    <Routes>
                        <Route path="/usuario/checkout" element={<Checkout />} />
                        <Route path="/" element={<div>Página inicio</div>} />
                        <Route path="/productos" element={<div>Página productos</div>} />
                        <Route path="/usuario/pedidos" element={<div>Página mis pedidos</div>} />
                    </Routes>
                </MemoryRouter>
            </CartProvider>
        </AuthProvider>
    )

describe("Checkout", () => {
    // Cada test arranca limpio: sin sesión, sin carrito y mocks reseteados.
    beforeEach(() => {
        localStorage.clear()
        vi.resetAllMocks()
    })

    it("Muestra aviso y botón a productos cuando el carrito está vacío", async () => {
        // Sin items: Checkout muestra mensaje de carrito vacío.
        obtenerDirecciones.mockResolvedValue([])
        obtenerRegionesComunas.mockResolvedValue([])

        renderCheckout()

        expect(await screen.findByText("Tu carrito está vacío.")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Ver productos" })).toBeInTheDocument()
    })

    it("Muestra resumen con total y modalidad de retiro por defecto", async () => {
        seedSesionCliente()
        seedCart([itemCarrito(producto(1, "Cuaderno", 2490), 2), itemCarrito(producto(2, "Lápiz", 450), 1)])
        obtenerDirecciones.mockResolvedValue([])
        obtenerRegionesComunas.mockResolvedValue([])

        renderCheckout()

        // Carga datos y muestra resumen.
        expect(await screen.findByText("Finalizar compra")).toBeInTheDocument()
        expect(screen.getByText("2 × Cuaderno")).toBeInTheDocument()
        expect(screen.getByText("1 × Lápiz")).toBeInTheDocument()
        expect(screen.getByText("Total estimado")).toBeInTheDocument()
        expect(screen.getByText("$5.430")).toBeInTheDocument()
        // Retiro en tienda seleccionado por defecto.
        expect(screen.getByLabelText("Retiro en tienda")).toBeChecked()
        expect(screen.getByLabelText("Despacho a domicilio")).not.toBeChecked()
    })

    it("Carga direcciones y regiones al montar; deshabilita pagar si despacho sin dirección", async () => {
        seedSesionCliente()
        seedCart([itemCarrito(producto(1, "Cuaderno", 2490), 1)])
        // Sin direcciones guardadas → en despacho debe pedir agregar una.
        obtenerDirecciones.mockResolvedValue([])
        obtenerRegionesComunas.mockResolvedValue([
            { idRegion: 1, nombre: "Metropolitana", comunas: [{ idComuna: 1, nombre: "Santiago" }] }
        ])

        renderCheckout()

        // Espera a que terminen las llamadas iniciales.
        await waitFor(() => {
            expect(obtenerDirecciones).toHaveBeenCalledTimes(1)
            expect(obtenerRegionesComunas).toHaveBeenCalledTimes(1)
        })

        // Cambia a despacho: sin direcciones, muestra aviso y botón "Agregar dirección".
        fireEvent.click(screen.getByLabelText("Despacho a domicilio"))
        expect(await screen.findByText("No tienes direcciones guardadas. Agrega una para continuar con despacho.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Agregar dirección" })).toBeInTheDocument()
        // Botón pagar deshabilitado mientras no haya dirección seleccionada en despacho.
        expect(screen.getByRole("button", { name: "Pagar" })).toBeDisabled()
    })

    it("Permite agregar nueva dirección, selecciona región/comuna y guarda", async () => {
        seedSesionCliente()
        seedCart([itemCarrito(producto(1, "Cuaderno", 2490), 1)])
        obtenerDirecciones.mockResolvedValue([])
        obtenerRegionesComunas.mockResolvedValue([
            { idRegion: 1, nombre: "Metropolitana", comunas: [{ idComuna: 1, nombre: "Santiago" }, { idComuna: 2, nombre: "Ñuñoa" }] }
        ])
        crearDireccion.mockResolvedValue({
            idDireccion: 10,
            calle: "Av. Siempre Viva",
            numero: "742",
            comuna: { nombre: "Ñuñoa" },
            activo: true
        })

        renderCheckout()

        await waitFor(() => expect(obtenerDirecciones).toHaveBeenCalledTimes(1))

        // Abre formulario de nueva dirección en modo despacho.
        fireEvent.click(screen.getByLabelText("Despacho a domicilio"))
        fireEvent.click(screen.getByRole("button", { name: "Agregar dirección" }))

        // Completa formulario: usa nombre autocompletado desde usuario.
        fireEvent.change(screen.getByLabelText("Teléfono"), { target: { value: "+56912345678" } })
        fireEvent.change(screen.getByLabelText("Calle"), { target: { value: "Av. Siempre Viva" } })
        fireEvent.change(screen.getByLabelText("Número"), { target: { value: "742" } })
        fireEvent.change(screen.getByLabelText("Región"), { target: { value: "1" } })
        // Al cambiar región, comuna se habilita con opciones.
        expect(await screen.findByLabelText("Comuna")).not.toBeDisabled()
        fireEvent.change(screen.getByLabelText("Comuna"), { target: { value: "2" } })

        // Guarda dirección.
        fireEvent.click(screen.getByRole("button", { name: "Guardar dirección" }))

        await waitFor(() => expect(crearDireccion).toHaveBeenCalledTimes(1))
        // Tras guardar, se selecciona la nueva dirección y se habilita Pagar.
        expect(await screen.findByRole("button", { name: "Pagar" })).not.toBeDisabled()
    })

    it("Completa pedido con retiro en tienda: fusiona carrito, crea pedido y muestra éxito", async () => {
        seedSesionCliente()
        seedCart([itemCarrito(producto(1, "Cuaderno", 2490), 1)])
        obtenerDirecciones.mockResolvedValue([])
        obtenerRegionesComunas.mockResolvedValue([])
        fusionarCarritoLocal.mockResolvedValue({ items: [] })
        crearPedido.mockResolvedValue({
            idPedido: 1001,
            estado: "PENDIENTE",
            total: 2490,
            detalles: [
                { idDetallePedido: 1, cantidad: 1, nombreProducto: "Cuaderno", subtotal: 2490 }
            ]
        })

        renderCheckout()

        await waitFor(() => expect(obtenerDirecciones).toHaveBeenCalledTimes(1))

        // Con retiro por defecto, pagar debe funcionar.
        fireEvent.click(screen.getByRole("button", { name: "Pagar" }))

        await waitFor(() => {
            expect(fusionarCarritoLocal).toHaveBeenCalledTimes(1)
            expect(crearPedido).toHaveBeenCalledWith("RETIRA_TIENDA", undefined)
        })

        // Muestra pantalla de éxito con datos del pedido.
        expect(await screen.findByText("Pedido recibido")).toBeInTheDocument()
        expect(screen.getByText(/El pedido #1001 fue creado exitosamente/)).toBeInTheDocument()
        expect(screen.getByText("1 × Cuaderno")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Mis pedidos" })).toBeInTheDocument()
        // Botón para volver al catálogo navega a /.
        fireEvent.click(screen.getByRole("button", { name: "Volver al catálogo" }))
        expect(await screen.findByText("Página inicio")).toBeInTheDocument()
    })

    it("Completa pedido con despacho: envía idDireccion correcto", async () => {
        seedSesionCliente()
        seedCart([itemCarrito(producto(1, "Cuaderno", 2490), 1)])
        obtenerDirecciones.mockResolvedValue([
            { idDireccion: 5, calle: "Calle 1", numero: "123", comuna: { nombre: "Santiago" }, activo: true }
        ])
        obtenerRegionesComunas.mockResolvedValue([])
        fusionarCarritoLocal.mockResolvedValue({ items: [] })
        crearPedido.mockResolvedValue({
            idPedido: 1002,
            estado: "PENDIENTE",
            total: 2490,
            detalles: [{ idDetallePedido: 1, cantidad: 1, nombreProducto: "Cuaderno", subtotal: 2490 }]
        })

        renderCheckout()

        await waitFor(() => expect(obtenerDirecciones).toHaveBeenCalledTimes(1))

        // Selecciona despacho y usa dirección existente.
        fireEvent.click(screen.getByLabelText("Despacho a domicilio"))
        expect(await screen.findByLabelText("Dirección de despacho")).toBeInTheDocument()
        // Selecciona la dirección guardada.
        fireEvent.change(screen.getByLabelText("Dirección de despacho"), { target: { value: "5" } })

        fireEvent.click(screen.getByRole("button", { name: "Pagar" }))

        await waitFor(() => {
            expect(crearPedido).toHaveBeenCalledWith("DESPACHO", 5)
        })
        expect(await screen.findByText("Pedido recibido")).toBeInTheDocument()
    })

    it("Muestra advertencia ante conflicto de stock (409 CONFLICTO_STOCK)", async () => {
        seedSesionCliente()
        seedCart([itemCarrito(producto(1, "Cuaderno", 2490), 5)])
        obtenerDirecciones.mockResolvedValue([])
        obtenerRegionesComunas.mockResolvedValue([])
        fusionarCarritoLocal.mockResolvedValue({ items: [] })
        const errorStock = new Error("Stock insuficiente")
        errorStock.status = 409
        errorStock.code = "CONFLICTO_STOCK"
        crearPedido.mockRejectedValue(errorStock)

        renderCheckout()

        await waitFor(() => expect(obtenerDirecciones).toHaveBeenCalledTimes(1))

        fireEvent.click(screen.getByRole("button", { name: "Pagar" }))

        expect(await screen.findByText("Algunos de los productos no tienen stock suficiente. Revisa las cantidades e inténtalo nuevamente.")).toBeInTheDocument()
    })

    it("Muestra mensaje de error genérico al fallar la creación del pedido", async () => {
        seedSesionCliente()
        seedCart([itemCarrito(producto(1, "Cuaderno", 2490), 1)])
        obtenerDirecciones.mockResolvedValue([])
        obtenerRegionesComunas.mockResolvedValue([])
        fusionarCarritoLocal.mockResolvedValue({ items: [] })
        crearPedido.mockRejectedValue(new Error("Error de red"))

        renderCheckout()

        await waitFor(() => expect(obtenerDirecciones).toHaveBeenCalledTimes(1))

        fireEvent.click(screen.getByRole("button", { name: "Pagar" }))

        expect(await screen.findByText("Error de red")).toBeInTheDocument()
    })

    it("Muestra error si falla la carga inicial de datos de checkout", async () => {
        seedSesionCliente()
        seedCart([itemCarrito(producto(1, "Cuaderno", 2490), 1)])
        obtenerDirecciones.mockRejectedValue(new Error("Fallo al obtener direcciones"))
        obtenerRegionesComunas.mockResolvedValue([])

        renderCheckout()

        expect(await screen.findByText("Fallo al obtener direcciones")).toBeInTheDocument()
    })
})
