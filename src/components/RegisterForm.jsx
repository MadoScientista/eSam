import { useNavigate } from "react-router-dom"
import { useUsuarioForm } from "../hooks/useUsuarioForm"
import { crearUsuario, actualizarUsuario } from "../services/usuarioService"
import { CamposUsuario } from "./CamposUsuario"
import { AlertMessage } from "./AlertMessage"

export function RegisterForm({ idUsuario }) {

    const navigate = useNavigate()

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
    } = useUsuarioForm({ idUsuario })

    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = construirPayload()

        if (!payload) return

        try {
            if (esEdicion) {
                await actualizarUsuario(idUsuario, payload)
                setMensajeAlerta({ type: "success", message: "Usuario actualizado correctamente." })
            } else {
                await crearUsuario(payload)
                limpiarFormulario()
                navigate("/login")
            }
        } catch (error) {
            console.error("Error al guardar usuario", error)
            setMensajeAlerta({ type: "danger", message: "No se pudo guardar el usuario." })
        }
    }

    return (
        <div className="register-form border border-black p-5 rounded-2 shadow">
            <form onSubmit={handleSubmit}>
                <div className="h3 mb-5 text-center">
                    {esEdicion ? "Editar Perfil" : "Formulario de Registro"}
                </div>

                <CamposUsuario
                    formulario={formulario}
                    handleChange={handleChange}
                    handleChangeRut={handleChangeRut}
                    esEdicion={esEdicion}
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