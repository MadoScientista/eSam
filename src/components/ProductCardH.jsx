import { formatearPrecio } from "../utils/moneda"
import { imagenPrincipalProducto, stockDisponible } from "../utils/producto"

export function ProductCardH({item, handleClickPlus, handleClicklMinus, handleTrash}){

    const imagen = imagenPrincipalProducto(item.product)
    const disponible = stockDisponible(item.product)

    return (
        <div className="esam-cart-item mb-3" id={`item-${item.product.idProducto}`}>
            <div className="row g-3 align-items-center">
                <div className="col-md-4">
                    <div className="esam-cart-media">
                        {
                            imagen
                            ? <img src={imagen} alt={item.product.nombre} />
                            : <i className="bi bi-image fs-2 text-secondary"></i>
                        }
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card-body p-0">
                        <h6 className="card-title mb-1">{item.product.nombre}</h6>
                        <p className="product-price mb-1">{formatearPrecio(item.product.precio)}</p>
                        <p className="text-secondary small mb-3">Disponibles ahora: {disponible}u</p>


                        <div className="d-flex flex-row align-items-center gap-2">
                            <div className="input-group input-group-sm" style={{width:"auto", flexWrap:"nowrap"}}>
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={handleClicklMinus}
                                    key={`btnMinus-${item.product.idProducto}`}
                                >−</button>
                                <input
                                    type="number"
                                    className="form-control qty-input"
                                    style={{width:"3rem"}}
                                    value={item.units}
                                    readOnly
                                    key={`input-${item.product.idProducto}`}
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={handleClickPlus}
                                    disabled={item.units >= disponible}
                                    key={`btnPlus-${item.product.idProducto}`}
                                >+</button>
                            </div>

                            <button className="btn btn-outline-danger btn-sm" onClick={handleTrash} aria-label={`Quitar ${item.product.nombre} del carrito`}>
                                <i className="bi bi-trash3-fill"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
