import { useNavigate } from "react-router-dom"
import { useUsuarioForm } from "../../hooks/useUsuarioForm"
import { useAuth } from "../../context/authContext"
import { crearUsuario, crearUsuarioAdmin, actualizarUsuario, actualizarPerfil } from "../../services/usuarioService"
import { CamposUsuario } from "./CamposUsuario"
import { AlertMessage } from "../AlertMessage"

export function RegisterForm({ idUsuario, esAdmin = false, wideLayout = false }) {

    const navigate = useNavigate()
    const { usuario, estaAutenticado, esSesionGoogle, refrescarPerfil } = useAuth()
    const idUsuarioActual = usuario?.id ?? usuario?.idUsuario
    const esPropio = Boolean(estaAutenticado && idUsuarioActual === idUsuario)

    const {
        esEdicion,
        formulario,
        regionesComunas,
        comunas,
        mensajeAlerta,
        setMensajeAlerta,
        handleChange,
        handleChangeRut,
        construirPayload,
        limpiarFormulario
    } = useUsuarioForm({ idUsuario, esAdmin, esPropio, esOAuth: esSesionGoogle })

    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = construirPayload()

        if (!payload) return

        try {
            if (esEdicion) {
                if (esPropio) {
                    await actualizarPerfil(payload)
                    await refrescarPerfil()
                } else {
                    await actualizarUsuario(idUsuario, payload)
                }
                setMensajeAlerta({ type: "success", message: "Usuario actualizado correctamente." })
            } else {
                if (esAdmin) {
                    await crearUsuarioAdmin(payload)
                } else {
                    await crearUsuario(payload)
                }
                limpiarFormulario()
                navigate("/login")
            }
        } catch (error) {
            console.error("Error al guardar usuario", error)
            setMensajeAlerta({ type: "danger", message: error?.message || "No se pudo guardar el usuario." })
        }
    }

    return (
        <div className={`register-form ${wideLayout ? "user-form-card" : "esam-form-card p-5"}`}>
            <form onSubmit={handleSubmit}>
                {wideLayout ? (
                    <div className="form-card-head">
                        <span className="form-card-icon" aria-hidden="true">
                            <i className={`bi ${esEdicion ? "bi-person-gear" : "bi-person-plus"}`}></i>
                        </span>
                        <div>
                            <div className="h3 user-form-title">
                                {esEdicion ? "Editar Perfil" : "Formulario de Registro"}
                            </div>
                            <p className="form-card-subtitle">
                                {esEdicion
                                    ? "Revisa y actualiza tus datos. Los campos con * son obligatorios."
                                    : "Completa tus datos para crear tu cuenta. Los campos con * son obligatorios."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h3 mb-5 text-center">
                        {esEdicion ? "Editar Perfil" : "Formulario de Registro"}
                    </div>
                )}

                <CamposUsuario
                    wideLayout={wideLayout}
                    formulario={formulario}
                    handleChange={handleChange}
                    handleChangeRut={handleChangeRut}
                    esEdicion={esEdicion}
                    esOAuth={esSesionGoogle}
                    regionesComunas={regionesComunas}
                    comunas={comunas}
                />

                <div className="mt-4 d-flex justify-content-between align-items-center">
                    <button type="submit" className="btn btn-dark">
                        {esEdicion ? "Guardar Perfil" : "Registrar"}
                    </button>
                </div>

                <div className="mt-3">
                    <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
                </div>
            </form>
        </div>
    )
}