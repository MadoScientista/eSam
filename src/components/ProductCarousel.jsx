import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ProductCard } from "./ProductCard"

export function ProductCarousel({ products }) {

    const scrollRef = useRef(null)
    const navigate = useNavigate()

    if (products.length === 0) return null

    const scrollByPage = (dir) => {
        const el = scrollRef.current
        if (!el) return
        const anchoItem = el.querySelector(".product-carousel-item")?.offsetWidth || el.clientWidth / 5
        el.scrollTo({
            left: el.scrollLeft + dir * (anchoItem + 16),
            behavior: "smooth"
        })
    }

    return (
        <div className="position-relative">
            <div className="product-carousel d-flex gap-3" ref={scrollRef}>
                {products.map((p) => (
                    <div className="product-carousel-item d-flex flex-shrink-0 pt-2" key={p.sku}>
                        <ProductCard
                            product={p}
                            handleClick={() => navigate(`/detalleProducto/${p.sku}`)}
                        />
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="carousel-arrow carousel-arrow-prev"
                onClick={() => scrollByPage(-1)}
                aria-label="Productos anteriores"
            >
                <i className="bi bi-chevron-left"></i>
            </button>
            <button
                type="button"
                className="carousel-arrow carousel-arrow-next"
                onClick={() => scrollByPage(1)}
                aria-label="Siguientes productos"
            >
                <i className="bi bi-chevron-right"></i>
            </button>
        </div>
    )
}