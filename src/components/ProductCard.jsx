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
            className="card esam-product-card h-100 w-100 d-flex flex-column"
            id={product.idProducto}
            onClick={handleClick}
            style={{ cursor: "pointer" }}
        >

            <div className="product-image-wrap">
                {
                    imagen
                    ? <img
                        src={imagen}
                        alt={product.nombre}
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
                <h6 className="card-title product-title">{product.nombre}</h6>
                <div className="product-meta mt-auto">
                    <p className="product-price">{formatearPrecio(product.precio)}</p>
                    <span className={`product-stock${disponible === 0 ? " is-out" : ""}`}>
                        <i className={`bi ${disponible > 0 ? "bi-check-circle" : "bi-x-circle"}`} aria-hidden="true"></i>
                        Disponibles: {disponible}u
                    </span>
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