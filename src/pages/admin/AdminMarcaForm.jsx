import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AlertMessage } from "../../components/AlertMessage"
import { ConfirmModal } from "../../components/ConfirmModal"
import { obtenerMarcas, crearMarca, actualizarMarca, eliminarMarca } from "../../services/marcaService"
import { validarNombreMarca } from "../../utils/marca"

export function AdminMarcaForm() {

    const { idMarca } = useParams()
    const navigate = useNavigate()

    const esEdicion = Boolean(idMarca)

    const [formulario, setFormulario] = useState({ nombre: "" })
    const [marcas, setMarcas] = useState([])
    const [mensajeFormulario, setMensajeFormulario] = useState("")
    const [mensajeAlerta, setMensajeAlerta] = useState(null)
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [accion, setAccion] = useState(null)
    const [eliminado, setEliminado] = useState(false)
    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        const cargarMarcas = async () => {
            try {
                const data = await obtenerMarcas()
                setMarcas(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Error al cargar marcas", error)
                setMensajeAlerta({ type: "danger", message: error?.message || "No se pudieron cargar las marcas." })
            }
        }

        cargarMarcas()
    }, [])

    const propia = marcas.find((m) => String(m.idMarca) === String(idMarca))

    // Se ajusta el estado durante el render cuando llega el dato del servidor, en
    // vez de copiarlo en un efecto: un setState síncrono dentro de un efecto
    // encadena renders. Mismo patrón que usa AdminCategoriaForm con el id de la ruta.
    const [idAplicado, setIdAplicado] = useState(null)

    if (propia && idAplicado !== String(propia.idMarca)) {
        setIdAplicado(String(propia.idMarca))
        setFormulario({ nombre: propia.nombre ?? "" })
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormulario((prev) => ({ ...prev, [name]: value }))
    }

    const construirPayload = () => {
        const nombre = formulario.nombre.trim()
        const errorNombre = validarNombreMarca(nombre)

        if (errorNombre) {
            setMensajeFormulario(errorNombre)
            return null
        }

        setMensajeFormulario("")

        return { nombre }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const payload = construirPayload()

        if (!payload) return

        setAccion(esEdicion ? "actualizar" : "crear")
        setMostrarConfirmacion(true)
    }

    const handleEliminar = () => {
        setAccion("eliminar")
        setMostrarConfirmacion(true)
    }

    const mensajeError = (error, porDefecto) => {
        const detalles = error?.errores
            ?.map(({ campo, mensaje }) => `${campo}: ${mensaje}`)
            .join(" ")

        return detalles || error?.message || porDefecto
    }

    const handleConfirmar = async () => {
        setCargando(true)
        try {
            if (accion === "crear") {
                const creada = await crearMarca(construirPayload())

                setMensajeAlerta({ type: "success", message: "Marca creada correctamente." })
                setMostrarConfirmacion(false)

                // La nueva marca se agrega al listado para que el formulario de
                // edición la encuentre al cambiar de ruta.
                if (creada?.idMarca != null) {
                    setMarcas((prev) =>
                        prev.some((m) => m.idMarca === creada.idMarca) ? prev : [...prev, creada]
                    )

                    navigate(`/admin/marcas/${creada.idMarca}`, { replace: true })
                }

                return
            } else if (accion === "actualizar") {
                await actualizarMarca(idMarca, construirPayload())
                setMensajeAlerta({ type: "success", message: `Marca ${idMarca} actualizada correctamente.` })
            } else if (accion === "eliminar") {
                await eliminarMarca(idMarca)
                setEliminado(true)
                setMostrarConfirmacion(true)
                return
            }
            setMostrarConfirmacion(false)
        } catch (error) {
            console.error("Error al guardar marca", error)
            setMensajeAlerta({
                type: "danger",
                message: accion === "eliminar"
                    ? mensajeError(error, "No se pudo eliminar la marca.")
                    : mensajeError(error, "No se pudo guardar la marca.")
            })
            setMostrarConfirmacion(false)
        } finally {
            setCargando(false)
        }
    }

    const cerrarModal = () => {
        setMostrarConfirmacion(false)
        if (eliminado) {
            navigate("/admin/marcas")
        }
    }

    return (
        <>
        <div className="container" style={{ maxWidth: "40rem" }}>
            <h2 className="mb-4">{esEdicion ? `Editar marca id: ${idMarca}` : "Nueva Marca"}</h2>

            <form className="border border-black p-5 rounded-2 shadow-sm" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label fw-bold">Nombre</label>
                    <input
                        type="text"
                        className="form-control border-black"
                        name="nombre"
                        placeholder="Torre"
                        value={formulario.nombre}
                        onChange={handleChange}
                        maxLength={100}
                        required
                        autoFocus/>
                </div>

                {mensajeFormulario != "" && <p className="text-danger">{mensajeFormulario}</p>}

                <div className="mt-4">
                    <button type="submit" className="btn btn-dark me-3" disabled={cargando}>Guardar</button>
                    {esEdicion && <button type="button" className="btn btn-danger" onClick={handleEliminar} disabled={cargando}>Eliminar</button>}
                </div>
            </form>

            <div className="mt-3 mb-3">
                <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
            </div>

            {
                mostrarConfirmacion &&
                <ConfirmModal
                    show={mostrarConfirmacion}
                    title={
                        eliminado ? "Marca eliminada" :
                        accion === "crear" ? "Guardar marca" :
                        accion === "actualizar" ? "Actualizar marca" : "Eliminar marca"
                    }
                    message={
                        eliminado ? `La marca ${idMarca} fue eliminada.` :
                        accion === "crear" ? "¿Estás seguro de guardar la nueva marca?" :
                        accion === "actualizar" ? `¿Estás seguro de actualizar la marca ${idMarca}?` :
                        `¿Estás seguro de eliminar la marca ${idMarca}?`
                    }
                    confirmText={accion === "crear" || accion === "actualizar" ? "Guardar" : "Eliminar"}
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
