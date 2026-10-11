import { formatearPrecio } from "../utils/moneda"


export function ProductTable({products, handleClick, editable = true}){
    return(
        <table className="table site-table align-middle mb-0">
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
                {products.length === 0 ? (
                    <tr>
                        <td colSpan={editable ? "6" : "5"} className="site-table-empty">No hay productos para mostrar.</td>
                    </tr>
                ) : products.map(p => {
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
    )
}
