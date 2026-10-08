import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../services/api", () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn()
    }
}))

import { api } from "../../services/api"
import { fusionarCarritoLocal } from "../../services/carritoService"

describe("fusionarCarritoLocal", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("usa cantidades locales en coincidencias y conserva los productos propios de la cuenta", async () => {
        api.put.mockResolvedValue({ data: {} })
        api.post.mockResolvedValue({ data: {} })
        api.get
            .mockResolvedValueOnce({
                data: {
                    items: [
                        { producto: { idProducto: 1 }, cantidad: 5 },
                        { producto: { idProducto: 2 }, cantidad: 4 }
                    ]
                }
            })
            .mockResolvedValueOnce({ data: { items: [] } })

        await fusionarCarritoLocal([
            { product: { idProducto: 1 }, units: 2 },
            { product: { idProducto: 3 }, units: 1 }
        ])

        expect(api.put).toHaveBeenCalledWith("/carrito/items/1", { cantidad: 2 })
        expect(api.post).toHaveBeenCalledWith("/carrito/items", { idProducto: 3, cantidad: 1 })
    })
})
