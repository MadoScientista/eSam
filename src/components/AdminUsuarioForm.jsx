import { useUsuarioForm } from "../hooks/useUsuarioForm"
import { CamposUsuario } from "./CamposUsuario"
import { AlertMessage } from "./AlertMessage"

export function AdminUsuarioForm({ idUsuario, onSubmit, onDelete }) {

    const {
        esEdicion,
        formulario,
        regionesComunas,
        comunas,
        roles,
        mensajeAlerta,
        setMensajeAlerta,
        handleChange,
        handleChangeRut,
        construirPayload
    } = useUsuarioForm({ idUsuario, esAdmin: true })

    const handleSubmit = (e) => {
        e.preventDefault()

        const payload = construirPayload()

        if (!payload) return

        onSubmit(payload)
    }

    return (
        <div className="register-form border border-black p-5 rounded-2 shadow-sm">
            <form onSubmit={handleSubmit}>
                <div className="h3 mb-5 text-center">
                    {esEdicion ? "Editar Usuario" : "Nuevo Usuario"}
                </div>

                {
                    esEdicion &&
                    <div className="mb-3">
                        <label htmlFor="idUsuario" className="form-label">ID Usuario</label>
                        <input
                            type="text"
                            className="form-control border-black"
                            name="idUsuario"
                            value={idUsuario}
                            disabled
                            readOnly/>
                    </div>
                }

                <CamposUsuario
                    formulario={formulario}
                    handleChange={handleChange}
                    handleChangeRut={handleChangeRut}
                    esEdicion={esEdicion}
                    regionesComunas={regionesComunas}
                    comunas={comunas}
                />

                <div className="mb-3">
                    <label htmlFor="idRolUsuario" className="form-label">Tipo de Usuario*</label>
                    <select
                        className="form-select border-black"
                        name="idRolUsuario"
                        value={formulario.idRolUsuario}
                        onChange={handleChange}
                        required>
                        <option value="">-- Seleccione Rol --</option>
                        {
                            roles.map((rol) => (
                                <option value={rol.idRolUsuario} key={rol.idRolUsuario}>{rol.nombre}</option>
                            ))
                        }
                    </select>
                </div>

                <div className="mt-4 d-flex justify-content-between align-items-center">
                    {
                        esEdicion && onDelete &&
                        <button type="button" className="btn btn-danger" onClick={onDelete}>Eliminar</button>
                    }
                    <button type="submit" className="btn btn-dark">
                        {esEdicion ? "Guardar Cambios" : "Guardar Usuario"}
                    </button>
                </div>

                <div className="mt-3">
                    <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
                </div>
            </form>
        </div>
    )
}