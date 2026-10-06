import { formatearPrecio } from "../utils/moneda"


export function ProductTable({products, handleClick, editable = true}){
    return(
        <div className="container" style={{maxWidth:"70%"}}>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">SKU</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Precio</th>
                        <th scope="col">Stock</th>
                        {editable && <th scope="col"></th>}
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => {
                        return (
                            <tr key={p.idProducto}>
                                <td>{p.idProducto}</td>
                                <td>{p.sku}</td>
                                <td>{p.nombre}</td>
                                <td>{formatearPrecio(p.precio)}</td>
                                <td>{p.stock}</td>
                                {editable && (
                                    <td>
                                        <button
                                            className="btn btn-dark"
                                            onClick={() => {handleClick(p.idProducto)}}
                                            aria-label={`Editar ${p.nombre}`}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}