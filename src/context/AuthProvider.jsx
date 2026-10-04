import { useEffect, useState } from "react"
import { AuthContext } from "./authContext"
import { iniciarSesion } from "../services/usuarioService"
import { guardarToken, limpiarToken, onSesionExpirada } from "../services/api"

export function AuthProvider({children}){

    const [usuario, setUsuario] = useState(()=>{
        const saved = localStorage.getItem("eSamSession")

        return saved ? JSON.parse(saved) : null
    })

    const [token, setToken] = useState(()=>localStorage.getItem("eSamToken"))

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
            setSesionCerrada("rechazada")
        })
    },[])

    const login = async (correo, password) => {
        const data = await iniciarSesion(correo, password)

        if(!data?.loggin){
            return { ok: false }
        }

        guardarToken(data.token)
        setToken(data.token)
        setUsuario(data.usuario)
        setSesionCerrada(null)
        localStorage.setItem("eSamSession", JSON.stringify(data.usuario))

        return { ok: true, usuario: data.usuario }
    }

    const logout = () => {
        limpiarToken()
        setToken(null)
        setUsuario(null)
        setSesionCerrada(null)
        localStorage.removeItem("eSamSession")
    }

    return (
        <AuthContext.Provider
            value={{
                usuario,
                token,
                estaAutenticado: Boolean(usuario && token),
                sesionCerrada,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}