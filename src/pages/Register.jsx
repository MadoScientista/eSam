import {RegisterForm} from '../components/user-form/RegisterForm'

export function Register(){
    return (
        <section className="public-register-page">
            <div className="container">
                <div className="esam-auth-heading">
                    <span className="esam-auth-brand">ESam</span>
                    <h1 className="esam-auth-title">Crea tu cuenta</h1>
                    <p className="esam-auth-lead">
                        Guarda tus direcciones, sigue tus pedidos y compra más rápido.
                    </p>
                </div>
                <RegisterForm wideLayout />
            </div>
        </section>
    )
}
