import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth, tieneRol } from "../context/authContext"
import { AlertMessage } from "./AlertMessage"

export function LoginForm(){

    const { login, loginGoogle } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const googleButton = useRef(null)
    const googleCallback = useRef(null)
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

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
    const [googleDisponible, setGoogleDisponible] = useState(false)

    const navegarTrasLogin = useCallback((usuario) => {
        navigate(
            tieneRol(usuario, "admin") || tieneRol(usuario, "vendedor")
                ? "/admin"
                : usuario?.perfilCompleto === false
                    ? "/usuario"
                    : location.state?.from?.pathname === "/usuario/checkout"
                        ? "/usuario/checkout"
                        : "/usuario"
        )
    }, [navigate, location.state?.from?.pathname])

    const procesarCredencialGoogle = useCallback(async (credential) => {
        setMensajeAlerta(null)
        setCargando(true)

        try {
            const res = await loginGoogle(credential)

            if(res.ok){
                navegarTrasLogin(res.usuario)
            }else{
                setMensajeAlerta({type: "danger", message: "No se pudo iniciar sesión con Google. Vuelve a intentarlo."})
            }
        } catch(error) {
            console.error("Error al iniciar sesión con Google", error)

            const mensajesPorCodigo = {
                ERROR_VALIDACION: "No se pudo validar la credencial de Google. Vuelve a intentarlo.",
                AUTENTICACION_GOOGLE_INVALIDA: "No se pudo iniciar sesión con Google. Vuelve a intentarlo.",
                GOOGLE_NO_CONFIGURADO: "El inicio de sesión con Google no está disponible. Puedes iniciar sesión con correo y contraseña."
            }
            const mensaje = mensajesPorCodigo[error?.code]
                || error?.message
                || "No se pudo iniciar sesión con Google."

            setMensajeAlerta({type: "danger", message: mensaje})
        } finally {
            setCargando(false)
        }
    }, [loginGoogle, navegarTrasLogin])

    useEffect(() => {
        googleCallback.current = procesarCredencialGoogle
    }, [procesarCredencialGoogle])

    useEffect(() => {
        if (!googleClientId) return undefined

        const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
        if (!script) return undefined

        const inicializarGoogle = () => {
            const google = window.google
            if (!google?.accounts?.id || !googleButton.current) return

            google.accounts.id.initialize({
                client_id: googleClientId,
                callback: ({ credential }) => {
                    if (credential) {
                        googleCallback.current(credential)
                    }
                }
            })
            google.accounts.id.renderButton(googleButton.current, {
                theme: "outline",
                size: "large",
                text: "continue_with",
                width: 320
            })
            setGoogleDisponible(true)
        }

        inicializarGoogle()
        script.addEventListener("load", inicializarGoogle)

        return () => script.removeEventListener("load", inicializarGoogle)
    }, [googleClientId])

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
                navegarTrasLogin(res.usuario)
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

                <div className="mt-4 text-center">
                    <div className="mb-3">o</div>
                    {googleClientId
                        ? <div ref={googleButton} className="d-flex justify-content-center" aria-label="Iniciar sesión con Google" />
                        : <p className="text-secondary mb-0">El inicio de sesión con Google no está configurado.</p>
                    }
                    {googleDisponible && cargando && <span className="visually-hidden">Iniciando sesión con Google...</span>}
                </div>

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