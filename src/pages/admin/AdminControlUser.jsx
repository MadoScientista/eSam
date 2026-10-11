import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UsersTable } from "../../components/UsersTable"
import { TableCard } from "../../components/TableCard"
import { AlertMessage } from "../../components/AlertMessage"
import { obtenerUsuarios } from "../../services/usuarioService"

export function AdminControlUser() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const data = await obtenerUsuarios()
                setUsers(data)
            } catch (error) {
                console.error("Error al cargar usuarios", error)
                setMensajeAlerta({ type: "danger", message: error?.message || "No se pudieron cargar los usuarios." })
            }
        }

        cargarUsuarios()
    }, [])

    const handleClick = (id) => {
        navigate(`${id}`)
    }

    const filtrados = users.filter((u) =>
        u.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.aPaterno?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(u.rol).toLowerCase().includes(busqueda.toLowerCase()) ||
        String(u.id).includes(busqueda)
    )

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                <h2 className="mb-0">Administración Usuarios</h2>
                <button
                    className="btn btn-dark"
                    onClick={() => { navigate("nuevo") }}
                >
                    Nuevo usuario
                </button>
            </div>
            <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
            <TableCard
                title="Todos los usuarios"
                subtitle="Listado de usuarios registrados"
                toolbar={
                    <div className="input-group" style={{ maxWidth: "25rem" }}>
                        <span className="input-group-text border-black"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control border-black"
                            placeholder="Buscar por nombre, correo, rol o ID"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                }
            >
                <UsersTable dataUser={filtrados} handleClick={handleClick} />
            </TableCard>
        </>
    )
}