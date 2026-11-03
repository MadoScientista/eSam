import { useEffect, useState } from "react"
import { AuthContext } from "./authContext"
import { iniciarSesion, iniciarSesionGoogle, obtenerPerfil } from "../services/usuarioService"
import { guardarToken, limpiarToken, onSesionExpirada } from "../services/api"

const OAUTH_SESSION_KEY = "eSamGoogleSession"

export function AuthProvider({children}){

    const [usuario, setUsuario] = useState(()=>{
        const saved = localStorage.getItem("eSamSession")

        return saved ? JSON.parse(saved) : null
    })

    const [token, setToken] = useState(()=>localStorage.getItem("eSamToken"))
    const [esSesionGoogle, setEsSesionGoogle] = useState(
        () => localStorage.getItem(OAUTH_SESSION_KEY) === "true"
    )

    // Por qué se terminó la sesión. El interceptor de api.js avisa cuando el
    // backend rechaza el token; se distingue de un cierre de sesión voluntary
    // para poder explicarle al usuario qué pasó en vez de solo rebotarlo.
    const [sesionCerrada, setSesionCerrada] = useState(null)

    // Cuando el interceptor detecta un 401 limpia el token y avisa; aquí se
    // sincroniza el estado de React para sacar al usuario de las rutas privadas.
    useEffect(()=>{
        return onSesionExpirada(()=>{
            setUsuario(null)
            setToken(null)
            setEsSesionGoogle(false)
            setSesionCerrada("rechazada")
            localStorage.removeItem(OAUTH_SESSION_KEY)
        })
    },[])

    const guardarSesion = (data, esGoogle = false) => {
        guardarToken(data.token)
        setToken(data.token)
        setUsuario(data.usuario)
        setEsSesionGoogle(esGoogle)
        setSesionCerrada(null)
        localStorage.setItem("eSamSession", JSON.stringify(data.usuario))

        if (esGoogle) {
            localStorage.setItem(OAUTH_SESSION_KEY, "true")
        } else {
            localStorage.removeItem(OAUTH_SESSION_KEY)
        }

        return { ok: true, usuario: data.usuario }
    }

    const login = async (correo, password) => {
        const data = await iniciarSesion(correo, password)

        if(!data?.loggin){
            return { ok: false }
        }

        return guardarSesion(data)
    }

    const loginGoogle = async (idToken) => {
        const data = await iniciarSesionGoogle(idToken)

        if(!data?.loggin){
            return { ok: false }
        }

        return guardarSesion(data, true)
    }

    const refrescarPerfil = async () => {
        const perfil = await obtenerPerfil()
        const usuarioActualizado = { ...usuario, ...perfil }
        setUsuario(usuarioActualizado)
        localStorage.setItem("eSamSession", JSON.stringify(usuarioActualizado))

        return usuarioActualizado
    }

    const logout = () => {
        limpiarToken()
        setToken(null)
        setUsuario(null)
        setEsSesionGoogle(false)
        setSesionCerrada(null)
        localStorage.removeItem("eSamSession")
        localStorage.removeItem(OAUTH_SESSION_KEY)
    }

    return (
        <AuthContext.Provider
            value={{
                usuario,
                token,
                estaAutenticado: Boolean(usuario && token),
                sesionCerrada,
                esSesionGoogle,
                login,
                loginGoogle,
                refrescarPerfil,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}