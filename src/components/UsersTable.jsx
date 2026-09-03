

export function UsersTable({dataUser}){

    return(
        <div className="container">
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Correo</th>
                        <th scope="col">Region</th>
                        <th scope="col">Comuna</th>
                    </tr>
                </thead>
                <tbody>
                    {dataUser.map(u => {
                        return (
                            <tr key={u.id} style={{cursor:"pointer"}}>
                            <td>{u.id}</td>
                            <td>{u.nombres}</td>
                            <td>{u.correo}</td>
                            <td>{u.region}</td>
                            <td>{u.comuna}</td>
                            </tr>)
                    })}
                </tbody>
            </table>
        </div>
    )
}