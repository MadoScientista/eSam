import { nombreRol } from "../context/authContext"

export function UsersTable({ dataUser, handleClick }) {
    return (
        <table className="table site-table align-middle mb-0">
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
                {dataUser.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="site-table-empty">No hay usuarios para mostrar.</td>
                    </tr>
                ) : dataUser.map((u) => (
                    <tr key={u.id} style={{ cursor: "pointer" }}>
                        <td>{u.id}</td>
                        <td>{nombreRol(u)}</td>
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
    )
}
