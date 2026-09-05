import { RegisterForm } from "../components/RegisterForm"
import { useAuth } from "../context/AuthContext"

export function UserProfile() {
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