import { useState } from "react"
import { createPortal } from "react-dom"
import { formatearPrecio } from "../utils/moneda"
import { imagenPrincipalProducto, stockDisponible } from "../utils/producto"
import { useCart } from "../context/cartContext"
import { Toast } from "./Toast"

export function ProductCard({ product, handleClick }) {

    const { cart, addProduct } = useCart()
    const [toastTrigger, setToastTrigger] = useState(0)

    const imagen = imagenPrincipalProducto(product)
    const disponible = stockDisponible(product)
    const unidadesEnCarrito = cart.find((item) => item.product.idProducto === product.idProducto)?.units ?? 0
    const puedeAgregar = unidadesEnCarrito < disponible

    const handleAddToCart = (e) => {
        e.stopPropagation()
        if (!puedeAgregar) return
        addProduct(product)
        setToastTrigger(t => t + 1)
    }

    return (
        <div
            className="card h-100 w-100 d-flex flex-column mb-4 p-3 card-hover"
            id={product.idProducto}
            onClick={handleClick}
            style={{ cursor: "pointer" }}
        >

            <div
                className="product-image-wrap"
                style={{
                    height: "8rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative"
                }}
            >
                {
                    imagen
                    ? <img
                        src={imagen}
                        alt={product.nombre}
                        style={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain"
                        }}
                    />
                    : <i className="bi bi-image fs-1 text-secondary"></i>
                }
                <button
                    type="button"
                    className="product-cart-btn"
                    onClick={handleAddToCart}
                    disabled={!puedeAgregar}
                    aria-label={`Agregar ${product.nombre} al carrito`}
                >
                    <i className="bi bi-cart-plus"></i>
                </button>
            </div>

            <div className="card-body d-flex flex-column flex-grow-1">
                <h6 className="card-title">{product.nombre}</h6>
                <div className="mt-auto">
                    <p className="card-text mb-0">{formatearPrecio(product.precio)}</p>
                    <p className="card-text mb-0">Disponibles: {disponible}u</p>
                </div>
            </div>

            {toastTrigger > 0 &&
                createPortal(
                    <Toast trigger={toastTrigger} message={`${product.nombre} agregado al carrito.`} />,
                    document.body
                )}

        </div>
    );
}