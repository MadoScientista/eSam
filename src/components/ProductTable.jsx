

export function ProductTable({products, handleClick}){
    return(
        <div className="container" style={{maxWidth:"70%"}}>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Precio</th>
                        <th scope="col">Stock</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => {
                        return (
                            <tr key={p.sku} style={{cursor:"pointer"}}>
                                <td>{p.sku}</td>
                                <td>{p.nombre}</td>
                                <td>{p.precio}</td>
                                <td>{p.stock}</td>
                                <td>
                                    <button 
                                        className="btn btn-dark"
                                        onClick={() => {handleClick(p.sku)}}
                                    >
                                        <i className="bi bi-pencil-square"></i>
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    ) 
}