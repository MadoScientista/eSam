import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth, tieneRol } from "../context/authContext"
import { AlertMessage } from "./AlertMessage"

export function LoginForm(){

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [ formulario, setFormulario ] = useState({
        email: "",
        password: ""
    })

    // Si el backend rechazó el token, RequireAuth rebotó acá y borró la sesión.
    // Sin esto el usuario solo veía un parpadeo y ningún motivo.
    const [mensajeAlerta, setMensajeAlerta] = useState(
        location.state?.sesionCerrada === "rechazada"
            ? {
                type: "danger",
                message: "El servidor rechazó tu sesión y se cerró. Vuelve a iniciar sesión."
            }
            : null
    )
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
                navigate(
                    tieneRol(res.usuario, "admin") || tieneRol(res.usuario, "vendedor")
                        ? "/admin"
                        : location.state?.from?.pathname === "/usuario/checkout"
                            ? "/usuario/checkout"
                            : "/usuario"
                )
            }else{
                setMensajeAlerta({type: "danger", message: "Correo o contraseña incorrectos."})
            }
        } catch(error) {
            console.error("Error al iniciar sesión", error)

            const mensaje = error?.status === 401
                ? "Correo o contraseña incorrectos."
                : error?.message || "No se pudo iniciar sesión."

            setMensajeAlerta({type: "danger", message: mensaje})
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="login-form border border-black p-5 rounded-2 mb-5 shadow-sm">
            <form onSubmit={handleSubmit}>
                <div className="h3">Inicio de Sesión</div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo</label>
                    <input
                        type="email"
                        id="email"
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
                        id="password"
                        className="form-control border-black"
                        name="password"
                        minLength={8}   // El DTO exige entre 8 y 72 caracteres
                        maxLength={72}
                        required        // Contraseña requerida
                        value={formulario.password}
                        onChange={handleChange}/>
                </div>
                <button type="submit" className="btn btn-dark" disabled={cargando}>Entrar</button>

                {/* RequireAuth rebota a /login cuando no hay sesión, así que el
                    login es la puerta de entrada habitual al registro. */}
                <p className="text-center mt-3 mb-0">
                    ¿No tienes cuenta?{" "}
                    <Link to="/registro">Regístrate</Link>
                </p>

                <div className="mt-3">
                    <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={()=>setMensajeAlerta(null)}/>
                </div>
            </form>
        </div>
    )
}