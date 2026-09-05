import { createContext, useContext, useState } from "react"
import { iniciarSesion } from "../services/usuarioService"


const AuthContext = createContext()

export function AuthProvider({children}){

    const [usuario, setUsuario] = useState(()=>{
        const saved = localStorage.getItem("eSamSession")

        return saved ? JSON.parse(saved) : null
    })

    const login = async (nombreUsuario, password) => {
        const data = await iniciarSesion(nombreUsuario, password)

        if(!data?.loggin){
            return { ok: false }
        }

        setUsuario(data.usuario)
        localStorage.setItem("eSamSession", JSON.stringify(data.usuario))

        return { ok: true, usuario: data.usuario }
    }

    const logout = () => {
        setUsuario(null)
        localStorage.removeItem("eSamSession")
    }

    return (
        <AuthContext.Provider
            value={{
                usuario,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth(){
    return useContext(AuthContext)
}