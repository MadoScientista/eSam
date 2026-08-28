import { LoginForm } from "../components/LoginForm";


export function Login(){
    return(
        <div className="container">
            <h2 className="text-center">ESum</h2>
            <h3 className="text-center mb-5">Ingresa a tu cuenta</h3>
            <LoginForm/>
        </div>
    )
}