import { RegisterForm } from "../components/user-form/RegisterForm"
import { useAuth } from "../context/authContext"

export function CustomerProfile() {
    const { usuario } = useAuth()

    return (
        <div className="container">
            <RegisterForm
                idUsuario={usuario?.id}
            />
        </div>
    )
}