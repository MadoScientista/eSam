export function ProductCardH({product, handleClick}){

    return (
        <div className=" mb-3" id={product.sku}>
            <div className="row g-0">
                <div className="col-md-4">
                    <img src={product.img} className="img-fluid" style={{maxHeight:"8rem"}}></img>
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <h6 className="card-title">{product.nombre}</h6>
                        <p className="card-text">${product.precio}</p>
                        
                        
                        <div className="input-group input-group-sm" style={{maxWidth: "10rem"}}>
                            <button className="btn btn-outline-secondary" type="button">−</button>
                            <input type="number" className="form-control" value={product.cantidad} readOnly />
                            <button className="btn btn-outline-secondary" type="button">+</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}