export function MarcasTable({ marcas, handleClick, editable = true }){

    return(
        <div className="container" style={{maxWidth:"70%"}}>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nombre</th>
                        {editable && <th scope="col"></th>}
                    </tr>
                </thead>
                <tbody>
                    {
                        marcas.length === 0
                        ? <tr>
                            <td colSpan={editable ? "3" : "2"} className="text-secondary text-center py-4">
                                No hay marcas para mostrar.
                            </td>
                        </tr>
                        : marcas.map(m => (
                            <tr key={m.idMarca} style={{cursor:"pointer"}}>
                                <td>{m.idMarca}</td>
                                <td>{m.nombre}</td>
                                {editable && (
                                    <td>
                                        <button
                                            className="btn btn-dark"
                                            onClick={()=>{handleClick(m.idMarca)}}
                                            aria-label={`Editar ${m.nombre}`}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}
