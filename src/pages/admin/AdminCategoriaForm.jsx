import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AlertMessage } from "../../components/AlertMessage"
import { ConfirmModal } from "../../components/ConfirmModal"
import { CategoriaImagenAdmin } from "../../components/CategoriaImagenAdmin"
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from "../../services/categoriaService"
import { validarNombreCategoria } from "../../utils/categoria"

export function AdminCategoriaForm() {

    const { idCategoria } = useParams()
    const navigate = useNavigate()

    const esEdicion = Boolean(idCategoria)

    const [formulario, setFormulario] = useState({ nombre: "", idCategoriaPadre: "" })
    const [categorias, setCategorias] = useState([])
    const [imagenUrl, setImagenUrl] = useState(null)
    const [mensajeFormulario, setMensajeFormulario] = useState("")
    const [mensajeAlerta, setMensajeAlerta] = useState(null)
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [accion, setAccion] = useState(null)
    const [eliminado, setEliminado] = useState(false)
    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const data = await obtenerCategorias()
                setCategorias(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Error al cargar categorías", error)
                setMensajeAlerta({ type: "danger", message: error?.message || "No se pudieron cargar las categorías." })
            }
        }

        cargarCategorias()
    }, [])

    const propia = categorias.find((c) => String(c.idCategoria) === String(idCategoria))

    // Se ajusta el estado durante el render cuando llega el dato del servidor, en
    // vez de copiarlo en un efecto: un setState síncrono dentro de un efecto
    // encadena renders. Mismo patrón que usa AdminProductForm con el id de la ruta.
    const [idAplicado, setIdAplicado] = useState(null)

    if (propia && idAplicado !== String(propia.idCategoria)) {
        setIdAplicado(String(propia.idCategoria))
        setFormulario({
            nombre: propia.nombre ?? "",
            idCategoriaPadre: propia.idCategoriaPadre != null ? String(propia.idCategoriaPadre) : ""
        })
        setImagenUrl(propia.imagenUrl ?? null)
    }

    // Recorrido hacia abajo desde la categoría en edición, para que no pueda
    // elegir como padre a una de sus descendientes y crear un ciclo.
    const descendientes = useMemo(() => {
        if (!esEdicion) return new Set()

        const ids = new Set()
        const pendientes = [Number(idCategoria)]

        while (pendientes.length > 0) {
            const actual = pendientes.pop()

            categorias
                .filter((c) => c.idCategoriaPadre != null && String(c.idCategoriaPadre) === String(actual))
                .forEach((c) => {
                    if (ids.has(c.idCategoria)) return

                    ids.add(c.idCategoria)
                    pendientes.push(c.idCategoria)
                })
        }

        ids.delete(Number(idCategoria))

        return ids
    }, [categorias, idCategoria, esEdicion])

    const categoriasPadre = categorias.filter((c) =>
        !descendientes.has(c.idCategoria) && String(c.idCategoria) !== String(idCategoria)
    )

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormulario((prev) => ({ ...prev, [name]: value }))
    }

    const construirPayload = () => {
        const nombre = formulario.nombre.trim()
        const errorNombre = validarNombreCategoria(nombre)

        if (errorNombre) {
            setMensajeFormulario(errorNombre)
            return null
        }

        setMensajeFormulario("")

        return {
            nombre,
            idCategoriaPadre: formulario.idCategoriaPadre === "" ? null : Number(formulario.idCategoriaPadre)
        }
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
                const creado = await crearCategoria(construirPayload())

                setMensajeAlerta({ type: "success", message: "Categoría creada correctamente." })
                setMostrarConfirmacion(false)

                // La imagen de portada solo puede cargarse sobre una categoría ya
                // persistida, porque el endpoint es /categorias/{id}/imagen. Sin el
                // id generado no hay forma de gestionarla desde el alta. La nueva
                // categoría se agrega al listado para que el formulario de edición
                // la encuentre al cambiar de ruta.
                if (creado?.idCategoria != null) {
                    setCategorias((prev) =>
                        prev.some((c) => c.idCategoria === creado.idCategoria) ? prev : [...prev, creado]
                    )

                    navigate(`/admin/categorias/${creado.idCategoria}`, { replace: true })
                }

                return
            } else if (accion === "actualizar") {
                await actualizarCategoria(idCategoria, construirPayload())
                setMensajeAlerta({ type: "success", message: `Categoría ${idCategoria} actualizada correctamente.` })
            } else if (accion === "eliminar") {
                await eliminarCategoria(idCategoria)
                setEliminado(true)
                setMostrarConfirmacion(true)
                return
            }
            setMostrarConfirmacion(false)
        } catch (error) {
            console.error("Error al guardar categoría", error)
            setMensajeAlerta({
                type: "danger",
                message: accion === "eliminar"
                    ? mensajeError(error, "No se pudo eliminar la categoría.")
                    : mensajeError(error, "No se pudo guardar la categoría.")
            })
            setMostrarConfirmacion(false)
        } finally {
            setCargando(false)
        }
    }

    const cerrarModal = () => {
        setMostrarConfirmacion(false)
        if (eliminado) {
            navigate("/admin/categorias")
        }
    }

    return (
        <>
        <div className="container" style={{ maxWidth: "40rem" }}>
            <h2 className="mb-4">{esEdicion ? `Editar categoría id: ${idCategoria}` : "Nueva Categoría"}</h2>

            <form className="border border-black p-5 rounded-2 shadow-sm" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label fw-bold">Nombre</label>
                    <input
                        type="text"
                        className="form-control border-black"
                        name="nombre"
                        placeholder="Cuadernos"
                        value={formulario.nombre}
                        onChange={handleChange}
                        maxLength={100}
                        required
                        autoFocus/>
                </div>

                <div className="mb-3">
                    <label htmlFor="idCategoriaPadre" className="form-label fw-bold">Categoría padre</label>
                    <select
                        className="form-select border-black"
                        name="idCategoriaPadre"
                        value={formulario.idCategoriaPadre}
                        onChange={handleChange}>
                        <option value="">— Sin categoría padre (primer nivel) —</option>
                        {categoriasPadre.map((c) => (
                            <option key={c.idCategoria} value={c.idCategoria}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                    <small className="text-secondary">Déjalo en primer nivel si no depende de otra.</small>
                </div>

                {mensajeFormulario != "" && <p className="text-danger">{mensajeFormulario}</p>}

                <div className="mt-4 mb-3">
                    {
                        esEdicion
                        ? <CategoriaImagenAdmin
                            idCategoria={idCategoria}
                            imagenUrl={imagenUrl}
                            onSincronizar={setImagenUrl}/>
                        : <p className="text-secondary mb-0">
                            <i className="bi bi-info-circle me-1"></i>
                            Guarda la categoría para poder subirle su imagen de portada.
                        </p>
                    }
                </div>

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
                        eliminado ? "Categoría eliminada" :
                        accion === "crear" ? "Guardar categoría" :
                        accion === "actualizar" ? "Actualizar categoría" : "Eliminar categoría"
                    }
                    message={
                        eliminado ? `La categoría ${idCategoria} fue eliminada.` :
                        accion === "crear" ? "¿Estás seguro de guardar la nueva categoría?" :
                        accion === "actualizar" ? `¿Estás seguro de actualizar la categoría ${idCategoria}?` :
                        `¿Estás seguro de eliminar la categoría ${idCategoria}?`
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