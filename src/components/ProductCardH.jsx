import { formatearPrecio } from "../utils/moneda"

export function ProductCardH({item, handleClickPlus, handleClicklMinus, handleTrash}){

    return (
        <div className=" mb-3" id={item.product.sku}>
            <div className="row g-0">
                <div className="col-md-4">
                    <img src={item.product.img} className="img-fluid" style={{maxHeight:"8rem"}}></img>
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <h6 className="card-title">{item.product.nombre}</h6>
                        <p className="card-text">{formatearPrecio(item.product.precio)}</p>
                        
                        
                        <div className="d-flex flex-row align-items-center gap-2">
                            <div className="input-group input-group-sm" style={{width:"auto", flexWrap:"nowrap"}}>
                                <button 
                                    className="btn btn-outline-secondary" 
                                    type="button"
                                    onClick={handleClicklMinus}
                                    key={"btnMinus" + item.product.sku}
                                >−</button>
                                <input 
                                    type="number" 
                                    className="form-control qty-input"
                                    style={{width:"3rem"}} 
                                    value={item.units} 
                                    readOnly
                                    key={"input"+item.product.sku}
                                />
                                <button 
                                    className="btn btn-outline-secondary" 
                                    type="button"
                                    onClick={handleClickPlus} 
                                    key={"btnPlus" + item.product.sku}   
                                >+</button>
                            </div>

                            <button className="btn btn-danger btn-sm" onClick={handleTrash}>
                                <i className="bi bi-trash3-fill"></i>
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}