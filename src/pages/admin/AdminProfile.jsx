import { RegisterForm } from "../../components/RegisterForm"
import { useAuth } from "../../context/authContext"

export function AdminProfile() {
    const { usuario } = useAuth()

    return (
        <div className="container">
            <RegisterForm
                idUsuario={usuario?.id}
            />
        </div>
    )
}