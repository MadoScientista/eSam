import { RegisterForm } from "../components/user-form/RegisterForm"
import { useAuth } from "../context/authContext"

export function CustomerProfile() {
    const { usuario } = useAuth()

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Mi perfil</h1>
            </div>
            <RegisterForm
                idUsuario={usuario?.id}
                wideLayout
            />
        </div>
    )
}