

export function ProductCard({product, handleClick}){

    return (
        <div className="card mb-4 p-3" id={product.sku} onClick={handleClick} style={{cursor:"pointer"}}>
            <img src={product.img} 
            className="card-img-top" alt="..."></img>
            <div className="card-body d-flex flex-column">
                <h6 className="card-title">{product.nombre}</h6>
                <p className="card-text">${product.precio}</p>
                <p className="card-text ">Quedan: {product.stock}u</p>
            </div>
        </div>
    )
}