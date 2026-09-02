

export function ProductCard({ product, handleClick }) {

    return (
        <div
            className="card mb-4 p-3"
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

            <div className="card-body d-flex flex-column">
                <h6 className="card-title">{product.nombre}</h6>
                <p className="card-text">${product.precio}</p>
                <p className="card-text">Quedan: {product.stock}u</p>
            </div>

        </div>
    );
}