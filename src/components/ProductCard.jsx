
export function ProductCard({product}){
    return (
        <div className="card product-card mb-4">
            <img src="https://dimeiggsschl.vtexassets.com/arquivos/ids/174150-800-auto?v=638580423950430000&width=800&height=auto&aspect=true" className="card-img-top" alt="..."></img>
            <div className="card-body">
                <h6 className="card-title">{product.nombre}</h6>
                <p className="card-text">{product.precio}</p>
                <p className="card-text">{product.stock}</p>
            </div>
        </div>
    )
}