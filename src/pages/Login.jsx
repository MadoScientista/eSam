import { LoginForm } from "../components/LoginForm";


export function Login(){
    return(
            <div className="container mt-5">
                <div className="esam-auth-heading">
                    {/* <span className="esam-auth-brand">ESam</span> */}
                    <h1 className="esam-auth-title">Ingresa a tu cuenta</h1>
                    <p className="esam-auth-lead">
                        Revisa tus pedidos, direcciones y compras en un solo lugar.
                    </p>
                </div>
                <LoginForm/>
            </div>
    )
}
