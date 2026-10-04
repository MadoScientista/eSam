export function CategoriasTable({ categorias, todas = [], handleClick }){

    // idCategoriaPadre es nullable: null significa que la categoría es de primer nivel.
    const nombrePadre = (id) => {
        if (id == null) return null

        return todas.find((c) => c.idCategoria === id)?.nombre ?? `(${id})`
    }

    return(
        <div className="container" style={{maxWidth:"70%"}}>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Categoría padre</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        categorias.length === 0
                        ? <tr>
                            <td colSpan="4" className="text-secondary text-center py-4">
                                No hay categorías para mostrar.
                            </td>
                        </tr>
                        : categorias.map(c => (
                            <tr key={c.idCategoria} style={{cursor:"pointer"}}>
                                <td>{c.idCategoria}</td>
                                <td>{c.nombre}</td>
                                <td className="text-secondary">{nombrePadre(c.idCategoriaPadre) ?? "—"}</td>
                                <td>
                                    <button
                                        className="btn btn-dark"
                                        onClick={()=>{handleClick(c.idCategoria)}}
                                        aria-label={`Editar ${c.nombre}`}
                                    >
                                        <i className="bi bi-pencil-square"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}