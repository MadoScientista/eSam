import { RegisterForm } from "../../components/RegisterForm"
import { useAuth } from "../../context/authContext"

export function AdminProfile() {
    const { usuario } = useAuth()

    return (
        <div className="container">
            <RegisterForm
                modo="perfil"
                idUsuario={usuario?.id}
            />
        </div>
    )
}