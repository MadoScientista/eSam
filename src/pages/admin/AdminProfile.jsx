import { RegisterForm } from "../../components/user-form/RegisterForm"
import { useAuth } from "../../context/authContext"

export function AdminProfile() {
    const { usuario } = useAuth()

    return (
        <div className="admin-page admin-profile-page">
            <header className="admin-page-header">
                <div>
                    <span className="admin-eyebrow">CUENTA</span>
                    <h1>Perfil</h1>
                    <p>Administra tus datos personales y de acceso.</p>
                </div>
            </header>
            <RegisterForm
                idUsuario={usuario?.id}
                wideLayout
            />
        </div>
    )
}