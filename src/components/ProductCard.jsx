import { useState } from "react"
import { createPortal } from "react-dom"
import { formatearPrecio } from "../utils/moneda"
import { useCart } from "../context/cartContext"
import { Toast } from "./Toast"

export function ProductCard({ product, handleClick }) {

    const { addProduct } = useCart()
    const [toastTrigger, setToastTrigger] = useState(0)

    const handleAddToCart = (e) => {
        e.stopPropagation()
        addProduct(product)
        setToastTrigger(t => t + 1)
    }

    return (
        <div
            className="card h-100 w-100 d-flex flex-column mb-4 p-3 card-hover"
            id={product.sku}
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
                <img
                    src={product.img}
                    alt={product.nombre}
                    style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain"
                    }}
                />
                <button
                    type="button"
                    className="product-cart-btn"
                    onClick={handleAddToCart}
                    aria-label={`Agregar ${product.nombre} al carrito`}
                >
                    <i className="bi bi-cart-plus"></i>
                </button>
            </div>

            <div className="card-body d-flex flex-column flex-grow-1">
                <h6 className="card-title">{product.nombre}</h6>
                <div className="mt-auto">
                    <p className="card-text mb-0">{formatearPrecio(product.precio)}</p>
                    <p className="card-text mb-0">Quedan: {product.stock}u</p>
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