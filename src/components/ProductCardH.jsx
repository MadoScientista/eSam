import { formatearPrecio } from "../utils/moneda"
import { imagenPrincipalProducto, stockDisponible } from "../utils/producto"

export function ProductCardH({item, handleClickPlus, handleClicklMinus, handleTrash}){

    const imagen = imagenPrincipalProducto(item.product)
    const disponible = stockDisponible(item.product)

    return (
        <div className=" mb-3" id={`item-${item.product.idProducto}`}>
            <div className="row g-0">
                <div className="col-md-4">
                    {
                        imagen
                        ? <img src={imagen} alt={item.product.nombre} className="img-fluid" style={{maxHeight:"8rem", objectFit:"contain"}}/>
                        : <i className="bi bi-image fs-2 text-secondary"></i>
                    }
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <h6 className="card-title">{item.product.nombre}</h6>
                        <p className="card-text">{formatearPrecio(item.product.precio)}</p>
                        <p className="card-text">Disponibles ahora: {disponible}u</p>


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

                            <button className="btn btn-danger btn-sm" onClick={handleTrash} aria-label={`Quitar ${item.product.nombre} del carrito`}>
                                <i className="bi bi-trash3-fill"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}