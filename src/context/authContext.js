import { createContext, useContext } from "react"

export const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

// El backend devuelve "rol" como texto y "rolDetalle" como objeto, así que
// ambos casos tienen que resolverse para no dejar rutas bloqueadas.
export function nombreRol(usuario) {
    if (!usuario) return null

    if (typeof usuario.rol === "string") {
        return usuario.rol
    }

    return usuario.rol?.nombre ?? usuario.rolDetalle?.nombre ?? null
}

export function tieneRol(usuario, rol) {
    return nombreRol(usuario) === rol
}