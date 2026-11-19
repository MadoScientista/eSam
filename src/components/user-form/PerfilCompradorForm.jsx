import { useEffect, useState } from "react"
import { AlertMessage } from "../AlertMessage"
import { useAuth } from "../../context/authContext"
import { actualizarPerfil, obtenerPerfil } from "../../services/usuarioService"
import "./user-form.css"

function datosDelPerfil(perfil) {
    return {
        nombres: perfil.nombres ?? "",
        aPaterno: perfil.aPaterno ?? "",
        aMaterno: perfil.aMaterno ?? "",
        fechaNacimiento: perfil.fechaNacimiento ?? "",
        telefono: perfil.telefono != null ? String(perfil.telefono) : ""
    }
}

export function PerfilCompradorForm({ paraCompra = false, onSuccess }) {
    const { usuario, refrescarPerfil } = useAuth()
    const [formulario, setFormulario] = useState(() => datosDelPerfil(usuario ?? {}))
    const [cargando, setCargando] = useState(true)
    const [perfilCargado, setPerfilCargado] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState(null)

    useEffect(() => {
        let activo = true

        obtenerPerfil()
            .then((perfil) => {
                if (!perfil || typeof perfil !== "object") {
                    throw new Error("El servidor devolvió un perfil con formato inesperado.")
                }
                if (activo) {
                    setFormulario(datosDelPerfil(perfil))
                    setPerfilCargado(true)
                }
            })
            .catch((error) => {
                console.error("Error al cargar perfil de comprador", error)
                if (activo) {
                    setMensaje({
                        type: "danger",
                        message: error?.message || "No se pudo cargar tu perfil."
                    })
                }
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [])

    const actualizarCampo = (event) => {
        const { name, value } = event.target
        setFormulario((actual) => ({ ...actual, [name]: value }))
    }

    const guardarPerfil = async (event) => {
        event.preventDefault()
        setMensaje(null)

        const payload = {
            nombres: formulario.nombres.trim(),
            aPaterno: formulario.aPaterno.trim(),
            fechaNacimiento: formulario.fechaNacimiento
        }
        if (!payload.nombres || !payload.aPaterno || !payload.fechaNacimiento) {
            setMensaje({
                type: "danger",
                message: "Completa nombres, apellido paterno y fecha de nacimiento."
            })
            return
        }

        const aMaterno = formulario.aMaterno.trim()
        if (aMaterno) payload.aMaterno = aMaterno

        const telefono = formulario.telefono.trim()
        if (telefono) payload.telefono = telefono

        setGuardando(true)
        try {
            await actualizarPerfil(payload)
            const perfilActualizado = await refrescarPerfil()
            if (onSuccess && perfilActualizado.perfilCompleto === false) {
                setMensaje({
                    type: "warning",
                    message: "Tus datos se guardaron, pero aún no podemos continuar con tu compra. Contacta a soporte si el problema continúa."
                })
                return
            }

            if (onSuccess) {
                onSuccess()
            } else {
                setMensaje({ type: "success", message: "Perfil actualizado correctamente." })
            }
        } catch (error) {
            console.error("Error al guardar perfil de comprador", error)
            setMensaje({
                type: "danger",
                message: error?.message || "No se pudo guardar tu perfil."
            })
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="user-form-card">
            <form onSubmit={guardarPerfil}>
                <div className="h3 user-form-title">
                    {paraCompra ? "Completa tu perfil para comprar" : "Editar perfil"}
                </div>
                <div className="user-form-fields">
                    <div className="user-form-field">
                        <label className="form-label" htmlFor="nombres">Nombres*</label>
                        <input
                            id="nombres"
                            name="nombres"
                            className="form-control"
                            maxLength={50}
                            required
                            value={formulario.nombres}
                            onChange={actualizarCampo}
                        />
                    </div>
                    <div className="user-form-field">
                        <label className="form-label" htmlFor="aPaterno">Apellido paterno*</label>
                        <input
                            id="aPaterno"
                            name="aPaterno"
                            className="form-control"
                            maxLength={50}
                            required
                            value={formulario.aPaterno}
                            onChange={actualizarCampo}
                        />
                    </div>
                    <div className="user-form-field">
                        <label className="form-label" htmlFor="aMaterno">Apellido materno</label>
                        <input
                            id="aMaterno"
                            name="aMaterno"
                            className="form-control"
                            maxLength={50}
                            value={formulario.aMaterno}
                            onChange={actualizarCampo}
                        />
                    </div>
                    <div className="user-form-field">
                        <label className="form-label" htmlFor="fechaNacimiento">Fecha de nacimiento*</label>
                        <input
                            id="fechaNacimiento"
                            name="fechaNacimiento"
                            type="date"
                            className="form-control"
                            required
                            value={formulario.fechaNacimiento}
                            onChange={actualizarCampo}
                        />
                    </div>
                    <div className="user-form-field">
                        <label className="form-label" htmlFor="telefono">Teléfono (opcional)</label>
                        <input
                            id="telefono"
                            name="telefono"
                            type="tel"
                            className="form-control"
                            maxLength={15}
                            value={formulario.telefono}
                            onChange={actualizarCampo}
                        />
                    </div>
                    <div className="user-form-actions">
                        <button type="submit" className="btn btn-dark" disabled={cargando || !perfilCargado || guardando}>
                            {cargando
                                ? "Cargando perfil..."
                                : !perfilCargado
                                    ? "Perfil no disponible"
                                    : guardando ? "Guardando..." : "Guardar perfil"}
                        </button>
                    </div>
                </div>
                <div className="mt-3">
                    <AlertMessage type={mensaje?.type} message={mensaje?.message} />
                </div>
            </form>
        </div>
    )
}
