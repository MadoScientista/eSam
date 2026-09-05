import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/authContext"
import { AlertMessage } from "./AlertMessage"

export function LoginForm(){

    const { login } = useAuth()
    const navigate = useNavigate()

    const [ formulario, setFormulario ] = useState({
        email: "",
        password: ""
    })
    const [mensajeAlerta, setMensajeAlerta] = useState(null)
    const [cargando, setCargando] = useState(false)

    const handleChange = (e)=>{

        // Almacena en un objeto el nombre
        // y valor del objetivo del evento
        const {name, value} = e.target

        // Copia el objeto formulario actual
        // y modifica el campo objetivo
        setFormulario({
            ...formulario,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMensajeAlerta(null)
        setCargando(true)

        try {
            const res = await login(formulario.email, formulario.password)

            if(res.ok){
                const esAdmin = res.usuario?.rol?.nombre === "admin"
                navigate(esAdmin ? "/admin" : "/usuario")
            }else{
                setMensajeAlerta({type: "danger", message: "Correo o contraseña incorrectos."})
            }
        } catch(error) {
            console.error("Error al iniciar sesión", error)
            setMensajeAlerta({type: "danger", message: "No se pudo iniciar sesión."})
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="login-form border border-black p-5 rounded-2 mb-5 shadow">
            <form onSubmit={handleSubmit}>
                <div className="h3">Inicio de Sesión</div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo</label>
                    <input
                        type="email"
                        className="form-control border-black"
                        name="email"
                        maxLength={100} // Longitud máxma 100 caracteres
                        required        // Correo requerido
                        value={formulario.email}
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                        type="password"
                        className="form-control border-black"
                        name="password"
                        minLength={4}   // Longitud mínima 4 caracteres
                        maxLength={10}  // Longitud máxima 10 caracteres
                        required        // Contraseña requerida
                        value={formulario.password}
                        onChange={handleChange}/>
                </div>
                <button type="submit" className="btn btn-dark" disabled={cargando}>Entrar</button>
                <div className="mt-3">
                    <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={()=>setMensajeAlerta(null)}/>
                </div>
            </form>
        </div>
    )
}