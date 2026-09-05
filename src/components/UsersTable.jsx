export function UsersTable({ dataUser, handleClick }) {
    return (
        <div className="container" style={{ maxWidth: "70%" }}>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Rol</th>
                        <th scope="col">Nombres</th>
                        <th scope="col">Apellido Paterno</th>
                        <th scope="col">Correo</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {dataUser.map((u) => (
                        <tr key={u.id} style={{ cursor: "pointer" }}>
                            <td>{u.id}</td>
                            <td>{u.rol?.nombre || u.rol}</td>
                            <td>{u.nombres}</td>
                            <td>{u.aPaterno}</td>
                            <td>{u.correo}</td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn-dark"
                                    onClick={() => handleClick(u.id)}
                                >
                                    <i className="bi bi-pencil-square"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}