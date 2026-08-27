
export function ProductCard(){
    return (
        <div className="card product-card">
            <img src="rutaImagen" className="card-img-top" alt="..."></img>
            <div className="card-body">
                <h6 className="card-title">Nombre producto</h6>
                <p className="card-text">Precio: </p>
                <p className="card-text">Stock: </p>
            </div>
        </div>
    )
}