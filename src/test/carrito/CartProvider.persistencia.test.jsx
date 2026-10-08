import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CartProvider } from "../../context/CartProvider"
import { useCart } from "../../context/cartContext"
import { AuthContext } from "../../context/authContext"
import {
    agregarItemCarrito,
    actualizarCantidadItem,
    eliminarItemCarrito,
    obtenerCarrito,
    vaciarCarrito
} from "../../services/carritoService"

vi.mock("../../services/carritoService", () => ({
    agregarItemCarrito: vi.fn(),
    actualizarCantidadItem: vi.fn(),
    eliminarItemCarrito: vi.fn(),
    obtenerCarrito: vi.fn(),
    vaciarCarrito: vi.fn()
}))

const producto = { idProducto: 7, nombre: "Cuaderno", precio: 2990, stock: 5, stockReservado: 0 }

// Carrito persistido simulado: las operaciones del frontend se aplican sobre
// este estado para poder verificar la reconciliación completa.
let carritoServidor

function instalarCarritoServidor() {
    carritoServidor = []

    obtenerCarrito.mockImplementation(async () => ({
        items: carritoServidor.map((item) => ({ producto: { idProducto: item.idProducto }, cantidad: item.cantidad }))
    }))
    agregarItemCarrito.mockImplementation(async (idProducto, cantidad) => {
        carritoServidor.push({ idProducto, cantidad })
    })
    actualizarCantidadItem.mockImplementation(async (idProducto, cantidad) => {
        const item = carritoServidor.find((actual) => actual.idProducto === idProducto)
        if (item) item.cantidad = cantidad
    })
    eliminarItemCarrito.mockImplementation(async (idProducto) => {
        carritoServidor = carritoServidor.filter((item) => item.idProducto !== idProducto)
    })
    vaciarCarrito.mockImplementation(async () => {
        carritoServidor = []
    })
}

function wrapperCliente({ children }) {
    return (
        <AuthContext.Provider value={{ estaAutenticado: true, usuario: { rol: "cliente" } }}>
            <CartProvider>{children}</CartProvider>
        </AuthContext.Provider>
    )
}

describe("CartProvider persistencia del carrito", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        instalarCarritoServidor()
    })

    it("no toca el backend cuando no hay sesión", async () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider })

        await act(async () => {
            result.current.addProduct(producto, 2)
        })
        await Promise.resolve()

        expect(obtenerCarrito).not.toHaveBeenCalled()
        expect(agregarItemCarrito).not.toHaveBeenCalled()
        expect(result.current.cart[0].units).toBe(2)
    })

    it("persiste el alta de un producto", async () => {
        const { result } = renderHook(() => useCart(), { wrapper: wrapperCliente })

        await act(async () => {
            result.current.addProduct(producto, 2)
        })

        await waitFor(() => expect(agregarItemCarrito).toHaveBeenCalledWith(7, 2))
        expect(carritoServidor).toEqual([{ idProducto: 7, cantidad: 2 }])
        expect(eliminarItemCarrito).not.toHaveBeenCalled()
    })

    it("persiste el cambio de cantidad", async () => {
        const { result } = renderHook(() => useCart(), { wrapper: wrapperCliente })

        await act(async () => {
            result.current.addProduct(producto, 1)
        })
        await waitFor(() => expect(agregarItemCarrito).toHaveBeenCalled())

        await act(async () => {
            result.current.increaseUnits(7)
        })

        await waitFor(() => expect(actualizarCantidadItem).toHaveBeenCalledWith(7, 2))
        expect(carritoServidor).toEqual([{ idProducto: 7, cantidad: 2 }])
        expect(agregarItemCarrito).toHaveBeenCalledTimes(1)
    })

    it("persiste la eliminación de un producto", async () => {
        const { result } = renderHook(() => useCart(), { wrapper: wrapperCliente })

        await act(async () => {
            result.current.addProduct(producto, 1)
        })
        await waitFor(() => expect(agregarItemCarrito).toHaveBeenCalled())

        await act(async () => {
            result.current.removeProduct(7)
        })

        await waitFor(() => expect(eliminarItemCarrito).toHaveBeenCalledWith(7))
        expect(carritoServidor).toEqual([])
        expect(result.current.cart).toEqual([])
    })

    it("vacía el carrito persistido al vaciar el local con sesión", async () => {
        const { result } = renderHook(() => useCart(), { wrapper: wrapperCliente })

        await act(async () => {
            result.current.addProduct(producto, 1)
        })
        await waitFor(() => expect(agregarItemCarrito).toHaveBeenCalled())

        await act(async () => {
            result.current.clearCart()
        })

        await waitFor(() => expect(vaciarCarrito).toHaveBeenCalled())
        expect(carritoServidor).toEqual([])
        expect(result.current.cart).toEqual([])
    })

    it("serializa las operaciones y deja la última cantidad en el backend", async () => {
        const { result } = renderHook(() => useCart(), { wrapper: wrapperCliente })

        await act(async () => {
            result.current.addProduct(producto, 1)
            result.current.increaseUnits(7)
            result.current.increaseUnits(7)
        })

        await waitFor(() => expect(actualizarCantidadItem).toHaveBeenCalledWith(7, 3))
        expect(carritoServidor).toEqual([{ idProducto: 7, cantidad: 3 }])
        expect(agregarItemCarrito).toHaveBeenCalledTimes(1)
        expect(obtenerCarrito).toHaveBeenCalledTimes(3)
    })
})
