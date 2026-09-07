import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AdminUsuarioForm } from "../../components/AdminUsuarioForm"
import { crearUsuario, actualizarUsuario, eliminarUsuario } from "../../services/usuarioService"
import { ConfirmModal } from "../../components/ConfirmModal"
import { AlertMessage } from "../../components/AlertMessage"

export function AdminUserForm() {

    // Obtiene el id de la ruta
    const { id } = useParams()
    const navigate = useNavigate()

    // Estados para modales y alertas
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [mensajeAlerta, setMensajeAlerta] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [eliminado, setEliminado] = useState(false)
    
    // Payload para comunicación con backend
    const [payload, setPayload] = useState(null)

    // Estado que controla las acciones del submit y botones
    const [accion, setAccion] = useState(null)

    // RegisterForm valida y arma el payload, luego lo delega aquí
    const handleSubmit = (datos) => {
        setPayload(datos)
        setAccion(id ? "actualizar" : "crear")
        setMostrarConfirmacion(true)
    }

    // Botón eliminar
    const handleEliminar = () => {
        setAccion("eliminar")
        setMostrarConfirmacion(true)
    }

    // Confirmación del modal
    const handleConfirmar = async () => {
        setCargando(true)
        try {
            if (accion === "crear") {
                await crearUsuario(payload)
                setMensajeAlerta({ type: "success", message: "Usuario creado correctamente." })
            } else if (accion === "actualizar") {
                await actualizarUsuario(id, payload)
                setMensajeAlerta({ type: "success", message: `Usuario ${id} actualizado correctamente.` })
            } else if (accion === "eliminar") {
                await eliminarUsuario(id)
                setEliminado(true)
                setMostrarConfirmacion(true)
                return
            }
            setMostrarConfirmacion(false)
        } catch (error) {
            console.error("Error al guardar usuario", error)
            setMensajeAlerta({
                type: "danger",
                message: accion === "eliminar" ? "No se pudo eliminar el usuario." : "No se pudo guardar el usuario."
            })
            setMostrarConfirmacion(false)
        } finally {
            setCargando(false)
        }
    }

    const cerrarModal = () => {
        setMostrarConfirmacion(false)
        if (eliminado) {
            navigate("/admin/usuarios")
        }
    }

    return (
        <>
            <div className="container">
                <h2 className="mb-4">{id ? "Editar usuario" : "Nuevo Usuario"}</h2>

                <AdminUsuarioForm
                    idUsuario={id}
                    onSubmit={handleSubmit}
                    onDelete={handleEliminar}
                />

                <div className="mb-3 mt-3">
                    <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
                </div>

                {
                    mostrarConfirmacion &&
                    <ConfirmModal
                        show={mostrarConfirmacion}
                        title={
                            eliminado ? "Usuario eliminado" :
                            accion === "crear" ? "Guardar usuario" :
                            accion === "actualizar" ? "Actualizar usuario" : "Eliminar usuario"
                        }
                        message={
                            eliminado ? `El usuario con id ${id} fue eliminado.` :
                            accion === "crear" ? "¿Estás seguro de guardar el nuevo usuario?" :
                            accion === "actualizar" ? `¿Estás seguro de actualizar el usuario ${id}?` :
                            `¿Estás seguro de eliminar el usuario ${id}?`
                        }
                        confirmText={
                            accion === "crear" || accion === "actualizar" ? "Guardar" : "Eliminar"
                        }
                        variant={accion === "eliminar" ? "danger" : "dark"}
                        icon={
                            eliminado ? "bi-check-circle" :
                            accion === "eliminar" ? "bi-trash" : "bi-check2-circle"
                        }
                        success={eliminado}
                        onConfirm={handleConfirmar}
                        onCancel={cerrarModal}
                        disabled={cargando}
                    />
                }
            </div>
        </>
    )
}