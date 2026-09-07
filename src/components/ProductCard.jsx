import { formatearPrecio } from "../utils/moneda"

export function ProductCard({ product, handleClick }) {

    return (
        <div
            className="card h-100 w-100 d-flex flex-column mb-4 p-3 card-hover"
            id={product.sku}
            onClick={handleClick}
            style={{ cursor: "pointer" }}
        >

            <div
                style={{
                    height: "8rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
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
            </div>

            <div className="card-body d-flex flex-column flex-grow-1">
                <h6 className="card-title">{product.nombre}</h6>
                <div className="mt-auto">
                    <p className="card-text mb-0">{formatearPrecio(product.precio)}</p>
                    <p className="card-text mb-0">Quedan: {product.stock}u</p>
                </div>
            </div>

        </div>
    );
}