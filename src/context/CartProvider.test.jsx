import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { CartProvider } from "./CartProvider"
import { useCart } from "./cartContext"

describe("CartProvider stock disponible", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it("no agrega más unidades que el stock disponible", () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
        })

        act(() => {
            result.current.addProduct({
                idProducto: 1,
                stock: 8,
                stockReservado: 5
            }, 5)
        })

        expect(result.current.cart[0].units).toBe(3)
    })

    it("no agrega productos sin unidades disponibles", () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
        })

        act(() => {
            result.current.addProduct({
                idProducto: 1,
                stock: 4,
                stockReservado: 4
            })
        })

        expect(result.current.cart).toEqual([])
    })

    it("bloquea incrementos que superan el stock disponible", () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
        })

        act(() => {
            result.current.addProduct({
                idProducto: 1,
                stock: 4,
                stockReservado: 2
            })
        })
        act(() => {
            result.current.increaseUnits(1)
            result.current.increaseUnits(1)
        })

        expect(result.current.cart[0].units).toBe(2)
    })
})
