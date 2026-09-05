import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UsersTable } from "../../components/UsersTable"
import { obtenerUsuarios } from "../../services/usuarioService"

export function AdminControlUser() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])

    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const data = await obtenerUsuarios()
                setUsers(data)
            } catch (error) {
                console.error("Error al cargar usuarios", error)
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
            <UsersTable dataUser={users} handleClick={handleClick} />
        </>
    )
}