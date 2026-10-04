import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UsersTable } from "../../components/UsersTable"
import { AlertMessage } from "../../components/AlertMessage"
import { obtenerUsuarios } from "../../services/usuarioService"

export function AdminControlUser() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
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

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2 className="mb-0">Administración Usuarios</h2>
                <button
                    className="btn btn-dark"
                    onClick={() => { navigate("nuevo") }}
                >
                    Nuevo usuario
                </button>
            </div>
            <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
            <UsersTable dataUser={users} handleClick={handleClick} />
        </>
    )
}