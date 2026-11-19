import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AlertMessage } from "../components/AlertMessage"
import { ConfirmModal } from "../components/ConfirmModal"
import { EstadoPedidoBadge } from "../components/EstadoPedidoBadge"
import { RegisterForm } from "../components/user-form/RegisterForm"
import { useAuth } from "../context/authContext"
import { crearDireccion, actualizarDireccion, eliminarDireccion, obtenerDirecciones } from "../services/direccionService"
import { obtenerMiPedido, obtenerMisPedidos } from "../services/pedidoService"
import { obtenerProductoPorId } from "../services/productoService"
import { obtenerRegionesComunas } from "../services/regionComunaService"
import { formatearPrecio } from "../utils/moneda"
import { imagenPrincipalProducto } from "../utils/producto"
import "./CustomerProfile.css"

const formularioVacio = {
    nombreReceptor: "",
    telefonoReceptor: "",
    calle: "",
    numero: "",
    complemento: "",
    idRegion: "",
    idComuna: ""
}

function nombreCompleto(usuario) {
    return [usuario?.nombres, usuario?.aPaterno, usuario?.aMaterno].filter(Boolean).join(" ")
}

function fechaPedido(fecha) {
    if (!fecha) return "Fecha no disponible"
    const date = new Date(fecha)
    return Number.isNaN(date.getTime())
        ? "Fecha no disponible"
        : new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(date)
}

function textoDireccion(direccion) {
    return [
        [direccion.calle, direccion.numero].filter(Boolean).join(" "),
        direccion.complemento,
        direccion.comuna?.nombre ?? direccion.comunaNombre,
        direccion.region?.nombre ?? direccion.regionNombre
    ].filter(Boolean).join(", ")
}

export function CustomerProfile() {
    const { usuario } = useAuth()
    const [editandoPerfil, setEditandoPerfil] = useState(false)
    const [pedidos, setPedidos] = useState([])
    const [cargandoPedidos, setCargandoPedidos] = useState(true)
    const [errorPedidos, setErrorPedidos] = useState(null)
    const [direcciones, setDirecciones] = useState([])
    const [cargandoDirecciones, setCargandoDirecciones] = useState(true)
    const [regionesComunas, setRegionesComunas] = useState([])
    const [formulario, setFormulario] = useState(formularioVacio)
    const [direccionEditada, setDireccionEditada] = useState(null)
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [cargandoRegiones, setCargandoRegiones] = useState(false)
    const [guardandoDireccion, setGuardandoDireccion] = useState(false)
    const [direccionAEliminar, setDireccionAEliminar] = useState(null)
    const [eliminandoDireccion, setEliminandoDireccion] = useState(false)
    const [mensajeDireccion, setMensajeDireccion] = useState(null)

    useEffect(() => {
        let activo = true

        const cargarPedidos = async () => {
            try {
                const resumenes = await obtenerMisPedidos()
                if (!Array.isArray(resumenes)) {
                    throw new Error("El servidor devolvió un formato de pedidos inesperado.")
                }

                const recientes = await Promise.all(resumenes.slice(0, 3).map(async (resumen) => {
                    try {
                        const pedido = await obtenerMiPedido(resumen.idPedido)
                        const primerArticulo = pedido?.detalles?.[0] ?? null
                        let producto = primerArticulo?.producto ?? null
                        const idProducto = primerArticulo?.idProducto ?? producto?.idProducto

                        if (!producto && idProducto != null) {
                            producto = await obtenerProductoPorId(idProducto)
                        }

                        const cantidad = (pedido?.detalles ?? []).reduce(
                            (total, articulo) => total + Number(articulo.cantidad ?? 0),
                            0
                        )

                        return {
                            ...resumen,
                            detalles: pedido?.detalles ?? [],
                            producto,
                            cantidadProductos: cantidad || Number(resumen.cantidadItems) || 0
                        }
                    } catch (error) {
                        console.error(`Error al cargar el detalle del pedido ${resumen.idPedido}`, error)
                        return { ...resumen, errorDetalle: true }
                    }
                }))

                if (activo) setPedidos(recientes)
            } catch (error) {
                console.error("Error al cargar pedidos recientes", error)
                if (activo) setErrorPedidos(error?.message || "No se pudieron cargar tus pedidos.")
            } finally {
                if (activo) setCargandoPedidos(false)
            }
        }

        cargarPedidos()

        return () => { activo = false }
    }, [])

    useEffect(() => {
        let activo = true

        obtenerDirecciones()
            .then((data) => {
                if (!Array.isArray(data)) {
                    throw new Error("El servidor devolvió un formato de direcciones inesperado.")
                }
                if (activo) setDirecciones(data)
            })
            .catch((error) => {
                console.error("Error al cargar direcciones", error)
                if (activo) {
                    setMensajeDireccion({
                        type: "danger",
                        message: error?.message || "No se pudieron cargar tus direcciones."
                    })
                }
            })
            .finally(() => {
                if (activo) setCargandoDirecciones(false)
            })

        return () => { activo = false }
    }, [])

    const comunas = useMemo(() => {
        const region = regionesComunas.find((item) => String(item.idRegion) === formulario.idRegion)
        return region?.comunas ?? []
    }, [regionesComunas, formulario.idRegion])

    const cargarRegiones = async () => {
        if (regionesComunas.length > 0) return regionesComunas

        setCargandoRegiones(true)
        try {
            const data = await obtenerRegionesComunas()
            if (!Array.isArray(data)) {
                throw new Error("El servidor devolvió un formato de regiones inesperado.")
            }
            setRegionesComunas(data)
            return data
        } finally {
            setCargandoRegiones(false)
        }
    }

    const abrirFormularioDireccion = async (direccion = null) => {
        setMensajeDireccion(null)
        try {
            const regiones = await cargarRegiones()
            const idComuna = direccion?.comuna?.idComuna ?? direccion?.idComuna
            const region = regiones.find((item) =>
                item.comunas?.some((comuna) => String(comuna.idComuna) === String(idComuna))
            )

            setDireccionEditada(direccion)
            setFormulario(direccion ? {
                nombreReceptor: direccion.nombreReceptor ?? "",
                telefonoReceptor: direccion.telefonoReceptor ?? "",
                calle: direccion.calle ?? "",
                numero: direccion.numero ?? "",
                complemento: direccion.complemento ?? "",
                idRegion: String(region?.idRegion ?? direccion.comuna?.idRegion ?? ""),
                idComuna: String(idComuna ?? "")
            } : {
                ...formularioVacio,
                nombreReceptor: nombreCompleto(usuario)
            })
            setMostrarFormulario(true)
        } catch (error) {
            console.error("Error al cargar regiones y comunas", error)
            setMensajeDireccion({
                type: "danger",
                message: error?.message || "No se pudieron cargar las regiones y comunas."
            })
        }
    }

    const actualizarCampo = (event) => {
        const { name, value } = event.target
        setFormulario((actual) => ({
            ...actual,
            [name]: value,
            ...(name === "idRegion" ? { idComuna: "" } : {})
        }))
    }

    const guardarDireccion = async (event) => {
        event.preventDefault()
        setMensajeDireccion(null)
        setGuardandoDireccion(true)

        const payload = {
            nombreReceptor: formulario.nombreReceptor.trim(),
            telefonoReceptor: formulario.telefonoReceptor.trim(),
            calle: formulario.calle.trim(),
            numero: formulario.numero.trim(),
            complemento: formulario.complemento.trim(),
            predeterminada: direccionEditada?.predeterminada ?? direcciones.length === 0,
            idUsuario: usuario?.id ?? usuario?.idUsuario,
            idComuna: Number(formulario.idComuna)
        }
        const comunaSeleccionada = comunas.find((comuna) => String(comuna.idComuna) === formulario.idComuna)

        try {
            if (direccionEditada) {
                const actualizada = await actualizarDireccion(direccionEditada.idDireccion, payload)
                setDirecciones((actuales) => actuales.map((direccion) =>
                    direccion.idDireccion === direccionEditada.idDireccion
                        ? {
                            ...direccion,
                            ...payload,
                            ...actualizada,
                            comuna: actualizada?.comuna ?? comunaSeleccionada ?? direccion.comuna
                        }
                        : direccion
                ))
                setMensajeDireccion({ type: "success", message: "Dirección actualizada correctamente." })
            } else {
                const creada = await crearDireccion(payload)
                if (!creada?.idDireccion) {
                    throw new Error("El servidor no devolvió la dirección creada.")
                }
                setDirecciones((actuales) => [
                    ...actuales,
                    { ...payload, ...creada, comuna: creada.comuna ?? comunaSeleccionada }
                ])
                setMensajeDireccion({ type: "success", message: "Dirección agregada correctamente." })
            }

            setMostrarFormulario(false)
            setDireccionEditada(null)
        } catch (error) {
            console.error("Error al guardar dirección", error)
            setMensajeDireccion({
                type: "danger",
                message: error?.message || "No se pudo guardar la dirección."
            })
        } finally {
            setGuardandoDireccion(false)
        }
    }

    const confirmarEliminarDireccion = async () => {
        setEliminandoDireccion(true)
        try {
            await eliminarDireccion(direccionAEliminar.idDireccion)
            setDirecciones((actuales) => actuales.filter(
                (direccion) => direccion.idDireccion !== direccionAEliminar.idDireccion
            ))
            setDireccionAEliminar(null)
            setMensajeDireccion({ type: "success", message: "Dirección eliminada correctamente." })
        } catch (error) {
            console.error("Error al eliminar dirección", error)
            setMensajeDireccion({
                type: "danger",
                message: error?.message || "No se pudo eliminar la dirección."
            })
        } finally {
            setEliminandoDireccion(false)
        }
    }

    if (editandoPerfil) {
        return (
            <section className="customer-profile-page">
                <button
                    type="button"
                    className="customer-profile-back"
                    onClick={() => setEditandoPerfil(false)}
                >
                    <i className="bi bi-arrow-left" aria-hidden="true" /> Volver al perfil
                </button>
                <RegisterForm
                    idUsuario={usuario?.id ?? usuario?.idUsuario}
                    wideLayout
                />
            </section>
        )
    }

    return (
        <section className="customer-profile-page">
            <header className="customer-profile-header">
                <div>
                    <span className="customer-profile-eyebrow">MI CUENTA</span>
                    <h1>Hola, {nombreCompleto(usuario) || "bienvenido"}.</h1>
                    <p>Administra tu información, tus pedidos y tus direcciones.</p>
                </div>
                <button type="button" className="btn btn-outline-dark" onClick={() => setEditandoPerfil(true)}>
                    <i className="bi bi-pencil me-2" aria-hidden="true" />Editar perfil
                </button>
            </header>

            <section className="customer-profile-section" aria-labelledby="pedidos-recientes-titulo">
                <div className="customer-profile-section-heading">
                    <div>
                        <span className="customer-profile-eyebrow">TU ACTIVIDAD</span>
                        <h2 id="pedidos-recientes-titulo">Pedidos recientes</h2>
                    </div>
                    <Link to="/usuario/pedidos" className="customer-profile-text-link">
                        Ver todos los pedidos <i className="bi bi-arrow-right" aria-hidden="true" />
                    </Link>
                </div>

                {errorPedidos && <AlertMessage type="danger" message={errorPedidos} />}
                {cargandoPedidos ? (
                    <p className="customer-profile-muted">Cargando tus pedidos...</p>
                ) : pedidos.length === 0 ? (
                    <div className="customer-profile-empty">
                        <i className="bi bi-bag" aria-hidden="true" />
                        <p>Aún no tienes pedidos.</p>
                        <Link to="/productos">Explorar productos</Link>
                    </div>
                ) : (
                    <div className="customer-order-cards">
                        {pedidos.map((pedido) => {
                            const primerArticulo = pedido.detalles?.[0]
                            const producto = pedido.producto ?? primerArticulo?.producto
                            const imagen = imagenPrincipalProducto(producto)
                                ?? primerArticulo?.imagenUrl
                                ?? primerArticulo?.imagen
                            const cantidadAdicional = Math.max(pedido.cantidadProductos - 1, 0)
                            const nombreArticulo = primerArticulo?.nombreProducto
                                ?? producto?.nombre
                                ?? "Artículo del pedido"

                            return (
                                <Link
                                    key={pedido.idPedido}
                                    to={`/usuario/pedidos/${pedido.idPedido}`}
                                    className="customer-order-card"
                                >
                                    <div className="customer-order-card-top">
                                        <span>Pedido #{pedido.idPedido}</span>
                                        <EstadoPedidoBadge estado={pedido.estado} />
                                    </div>
                                    <div className="customer-order-product">
                                        <div className="customer-order-product-image">
                                            {imagen
                                                ? <img src={imagen} alt={nombreArticulo} />
                                                : <i className="bi bi-box-seam" aria-hidden="true" />}
                                        </div>
                                        <div className="customer-order-product-copy">
                                            <strong>{nombreArticulo}</strong>
                                            {cantidadAdicional > 0 && (
                                                <span>{cantidadAdicional} {cantidadAdicional === 1 ? "producto más" : "productos más"}</span>
                                            )}
                                        </div>
                                    </div>
                                    {pedido.errorDetalle && (
                                        <p className="customer-order-detail-error">
                                            No se pudo cargar el detalle de este pedido.
                                        </p>
                                    )}
                                    <div className="customer-order-card-bottom">
                                        <span>{fechaPedido(pedido.creadoEn)}</span>
                                        <strong>{formatearPrecio(pedido.total ?? 0)}</strong>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </section>

            <section className="customer-profile-section" aria-labelledby="direcciones-titulo">
                <div className="customer-profile-section-heading">
                    <div>
                        <span className="customer-profile-eyebrow">DESPACHO</span>
                        <h2 id="direcciones-titulo">Mis direcciones</h2>
                    </div>
                    {!mostrarFormulario && (
                        <button
                            type="button"
                            className="btn btn-outline-dark"
                            onClick={() => abrirFormularioDireccion()}
                            disabled={cargandoRegiones}
                        >
                            <i className="bi bi-plus-lg me-2" aria-hidden="true" />Agregar dirección
                        </button>
                    )}
                </div>

                <AlertMessage
                    type={mensajeDireccion?.type}
                    message={mensajeDireccion?.message}
                    onClose={() => setMensajeDireccion(null)}
                />

                {mostrarFormulario && (
                    <form className="customer-address-form" onSubmit={guardarDireccion}>
                        <div className="customer-address-form-heading">
                            <h3>{direccionEditada ? "Editar dirección" : "Nueva dirección"}</h3>
                            <p>Completa los datos de despacho.</p>
                        </div>
                        <div className="customer-address-form-grid">
                            <div>
                                <label className="form-label" htmlFor="nombreReceptor">Nombre de quien recibe</label>
                                <input id="nombreReceptor" name="nombreReceptor" className="form-control" required maxLength={120} value={formulario.nombreReceptor} onChange={actualizarCampo} />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="telefonoReceptor">Teléfono</label>
                                <input id="telefonoReceptor" name="telefonoReceptor" className="form-control" required maxLength={30} value={formulario.telefonoReceptor} onChange={actualizarCampo} />
                            </div>
                            <div className="customer-address-street">
                                <label className="form-label" htmlFor="calle">Calle</label>
                                <input id="calle" name="calle" className="form-control" required maxLength={150} value={formulario.calle} onChange={actualizarCampo} />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="numero">Número</label>
                                <input id="numero" name="numero" className="form-control" required maxLength={20} value={formulario.numero} onChange={actualizarCampo} />
                            </div>
                            <div className="customer-address-complement">
                                <label className="form-label" htmlFor="complemento">Complemento (opcional)</label>
                                <input id="complemento" name="complemento" className="form-control" maxLength={150} value={formulario.complemento} onChange={actualizarCampo} />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="idRegion">Región</label>
                                <select id="idRegion" name="idRegion" className="form-select" required value={formulario.idRegion} onChange={actualizarCampo}>
                                    <option value="">Selecciona una región</option>
                                    {regionesComunas.map((region) => (
                                        <option key={region.idRegion} value={region.idRegion}>{region.nombre ?? region.region}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="idComuna">Comuna</label>
                                <select id="idComuna" name="idComuna" className="form-select" required disabled={!comunas.length} value={formulario.idComuna} onChange={actualizarCampo}>
                                    <option value="">Selecciona una comuna</option>
                                    {comunas.map((comuna) => (
                                        <option key={comuna.idComuna} value={comuna.idComuna}>{comuna.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="customer-address-form-actions">
                            <button type="submit" className="btn btn-dark" disabled={guardandoDireccion}>
                                {guardandoDireccion ? "Guardando..." : "Guardar dirección"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={guardandoDireccion}
                                onClick={() => {
                                    setMostrarFormulario(false)
                                    setDireccionEditada(null)
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                {cargandoDirecciones ? (
                    <p className="customer-profile-muted">Cargando direcciones...</p>
                ) : direcciones.length === 0 ? (
                    <div className="customer-profile-empty customer-address-empty">
                        <i className="bi bi-geo-alt" aria-hidden="true" />
                        <p>No tienes direcciones guardadas.</p>
                    </div>
                ) : (
                    <div className="customer-address-list">
                        {direcciones.map((direccion) => (
                            <article className="customer-address-card" key={direccion.idDireccion}>
                                <div className="customer-address-icon">
                                    <i className="bi bi-geo-alt" aria-hidden="true" />
                                </div>
                                <div className="customer-address-copy">
                                    <div className="customer-address-title">
                                        <strong>{textoDireccion(direccion) || "Dirección de despacho"}</strong>
                                        {direccion.predeterminada && <span>Predeterminada</span>}
                                        {direccion.activo === false && <span className="is-inactive">Inactiva</span>}
                                    </div>
                                    <p>{direccion.nombreReceptor}{direccion.telefonoReceptor ? ` · ${direccion.telefonoReceptor}` : ""}</p>
                                </div>
                                <div className="customer-address-actions">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => abrirFormularioDireccion(direccion)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => setDireccionAEliminar(direccion)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <ConfirmModal
                show={Boolean(direccionAEliminar)}
                title="Eliminar dirección"
                message="¿Quieres eliminar esta dirección de despacho?"
                confirmText="Eliminar"
                variant="danger"
                disabled={eliminandoDireccion}
                onConfirm={confirmarEliminarDireccion}
                onCancel={() => setDireccionAEliminar(null)}
            />
        </section>
    )
}
