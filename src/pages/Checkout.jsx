import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertMessage } from "../components/AlertMessage"
import { useAuth } from "../context/authContext"
import { useCart } from "../context/cartContext"
import { crearDireccion, obtenerDirecciones } from "../services/direccionService"
import { fusionarCarritoLocal } from "../services/carritoService"
import { crearPedido } from "../services/pedidoService"
import { obtenerRegionesComunas } from "../services/regionComunaService"
import { formatearPrecio } from "../utils/moneda"

const formularioDireccionVacio = {
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

export function Checkout() {
    const navigate = useNavigate()
    const { usuario } = useAuth()
    const { cart, clearCart } = useCart()
    const [direcciones, setDirecciones] = useState([])
    const [regionesComunas, setRegionesComunas] = useState([])
    const [tipoEntrega, setTipoEntrega] = useState("RETIRA_TIENDA")
    const [idDireccion, setIdDireccion] = useState("")
    const [mostrarFormularioDireccion, setMostrarFormularioDireccion] = useState(false)
    const [formularioDireccion, setFormularioDireccion] = useState(() => ({
        ...formularioDireccionVacio,
        nombreReceptor: nombreCompleto(usuario)
    }))
    const [cargandoDatos, setCargandoDatos] = useState(true)
    const [procesando, setProcesando] = useState(false)
    const [mensaje, setMensaje] = useState(null)
    const [pedido, setPedido] = useState(null)

    useEffect(() => {
        let activo = true

        Promise.all([obtenerDirecciones(), obtenerRegionesComunas()])
            .then(([direccionesData, regionesData]) => {
                if (!Array.isArray(direccionesData) || !Array.isArray(regionesData)) {
                    throw new Error("El servidor devolvió datos de checkout con formato inesperado.")
                }
                if (!activo) return

                const activas = direccionesData.filter((direccion) => direccion.activo !== false)
                setDirecciones(activas)
                setRegionesComunas(regionesData)
                if (activas.length > 0) setIdDireccion(String(activas[0].idDireccion))
            })
            .catch((error) => {
                console.error("Error al cargar datos del checkout", error)
                if (activo) setMensaje({ type: "danger", message: error?.message || "No se pudieron cargar los datos de despacho." })
            })
            .finally(() => {
                if (activo) setCargandoDatos(false)
            })

        return () => { activo = false }
    }, [])

    const comunas = useMemo(() => {
        const region = regionesComunas.find((item) => String(item.idRegion) === formularioDireccion.idRegion)
        return region?.comunas ?? []
    }, [regionesComunas, formularioDireccion.idRegion])

    const totalLocal = cart.reduce((total, item) => total + item.units * Number(item.product.precio || 0), 0)

    const actualizarDireccion = (event) => {
        const { name, value } = event.target
        setFormularioDireccion((actual) => ({
            ...actual,
            [name]: value,
            ...(name === "idRegion" ? { idComuna: "" } : {})
        }))
    }

    const guardarDireccion = async (event) => {
        event.preventDefault()
        setMensaje(null)
        setProcesando(true)

        try {
            const direccion = await crearDireccion({
                nombreReceptor: formularioDireccion.nombreReceptor.trim(),
                telefonoReceptor: formularioDireccion.telefonoReceptor.trim(),
                calle: formularioDireccion.calle.trim(),
                numero: formularioDireccion.numero.trim(),
                complemento: formularioDireccion.complemento.trim(),
                predeterminada: direcciones.length === 0,
                idUsuario: usuario.id,
                idComuna: Number(formularioDireccion.idComuna)
            })

            if (!direccion?.idDireccion) {
                throw new Error("El servidor no devolvió el identificador de la dirección creada.")
            }

            setDirecciones((actuales) => [...actuales, direccion])
            setIdDireccion(String(direccion.idDireccion))
            setTipoEntrega("DESPACHO")
            setMostrarFormularioDireccion(false)
            setFormularioDireccion({ ...formularioDireccionVacio, nombreReceptor: nombreCompleto(usuario) })
        } catch (error) {
            console.error("Error al crear dirección de despacho", error)
            setMensaje({ type: "danger", message: error?.message || "No se pudo guardar la dirección." })
        } finally {
            setProcesando(false)
        }
    }

    const completarPedido = async () => {
        setMensaje(null)

        if (cart.length === 0) {
            setMensaje({ type: "warning", message: "El carrito está vacío. Agrega productos antes de continuar." })
            return
        }
        if (tipoEntrega === "DESPACHO" && !idDireccion) {
            setMensaje({ type: "warning", message: "Selecciona o agrega una dirección para el despacho." })
            return
        }

        setProcesando(true)
        try {
            await fusionarCarritoLocal(cart)
            const pedidoCreado = await crearPedido(
                tipoEntrega,
                tipoEntrega === "DESPACHO" ? Number(idDireccion) : undefined
            )

            if (!pedidoCreado?.idPedido || pedidoCreado.estado !== "PENDIENTE") {
                throw new Error("El servidor devolvió un pedido con formato o estado inesperado.")
            }

            clearCart()
            setPedido(pedidoCreado)
        } catch (error) {
            console.error("Error al crear el pedido", error)
            const conflictoStock = error?.status === 409 && error?.code === "CONFLICTO_STOCK"
            setMensaje({
                type: conflictoStock ? "warning" : "danger",
                message: conflictoStock
                    ? "El stock disponible cambió y no alcanza para completar el pedido. Revisa las cantidades e inténtalo nuevamente."
                    : error?.message || "No se pudo crear el pedido."
            })
        } finally {
            setProcesando(false)
        }
    }

    if (pedido) {
        return (
            <section className="container py-4">
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <h1 className="h3">Pedido recibido</h1>
                        <AlertMessage
                            type="success"
                            message={`La simulación de pago finalizó. El pedido ${pedido.numeroPedido || `#${pedido.idPedido}`} quedó PENDIENTE; el stock está reservado y falta que un vendedor o administrador confirme el pago.`}
                        />
                        <p>El stock físico todavía no se descuenta. Puedes consultar el estado desde tu cuenta cuando el historial de pedidos esté disponible.</p>
                        <h2 className="h5 mt-4">Resumen del pedido</h2>
                        <ul className="list-group mb-4">
                            {(pedido.detalles ?? []).map((detalle) => (
                                <li className="list-group-item d-flex justify-content-between" key={detalle.idDetallePedido}>
                                    <span>{detalle.cantidad} × {detalle.nombreProducto}</span>
                                    <span>{formatearPrecio(detalle.subtotal)}</span>
                                </li>
                            ))}
                            <li className="list-group-item d-flex justify-content-between fw-bold">
                                <span>Total</span>
                                <span>{formatearPrecio(pedido.total)}</span>
                            </li>
                        </ul>
                        <button type="button" className="btn btn-dark" onClick={() => navigate("/")}>Volver al catálogo</button>
                    </div>
                </div>
            </section>
        )
    }

    if (cart.length === 0) {
        return (
            <section className="container py-4">
                <h1 className="h3">Finalizar compra</h1>
                <AlertMessage type="warning" message="Tu carrito está vacío." />
                <Link className="btn btn-dark" to="/productos">Ver productos</Link>
            </section>
        )
    }

    return (
        <section className="container py-4">
            <h1 className="h3 mb-4">Finalizar compra</h1>
            <AlertMessage type={mensaje?.type} message={mensaje?.message} />
            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="h5">Modalidad de entrega</h2>
                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="retira-tienda"
                                    name="tipoEntrega"
                                    value="RETIRA_TIENDA"
                                    checked={tipoEntrega === "RETIRA_TIENDA"}
                                    onChange={() => setTipoEntrega("RETIRA_TIENDA")}
                                />
                                <label className="form-check-label" htmlFor="retira-tienda">Retiro en tienda</label>
                            </div>
                            <div className="form-check mb-3">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="despacho"
                                    name="tipoEntrega"
                                    value="DESPACHO"
                                    checked={tipoEntrega === "DESPACHO"}
                                    onChange={() => setTipoEntrega("DESPACHO")}
                                />
                                <label className="form-check-label" htmlFor="despacho">Despacho a domicilio</label>
                            </div>

                            {tipoEntrega === "DESPACHO" && (
                                <div className="border-top pt-3">
                                    {cargandoDatos ? <p>Cargando direcciones...</p> : (
                                        <>
                                            {direcciones.length > 0 ? (
                                                <div className="mb-3">
                                                    <label className="form-label" htmlFor="direccion">Dirección de despacho</label>
                                                    <select
                                                        id="direccion"
                                                        className="form-select"
                                                        value={idDireccion}
                                                        onChange={(event) => setIdDireccion(event.target.value)}
                                                    >
                                                        <option value="">Selecciona una dirección</option>
                                                        {direcciones.map((direccion) => (
                                                            <option key={direccion.idDireccion} value={direccion.idDireccion}>
                                                                {[direccion.calle, direccion.numero, direccion.comuna?.nombre ?? direccion.comunaNombre].filter(Boolean).join(", ")}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : <p>No tienes direcciones guardadas. Agrega una para continuar con despacho.</p>}

                                            {!mostrarFormularioDireccion ? (
                                                <button type="button" className="btn btn-outline-dark" onClick={() => setMostrarFormularioDireccion(true)}>
                                                    Agregar dirección
                                                </button>
                                            ) : (
                                                <form onSubmit={guardarDireccion} className="row g-3">
                                                    <div className="col-12">
                                                        <h3 className="h6">Nueva dirección</h3>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="nombreReceptor">Nombre de quien recibe</label>
                                                        <input id="nombreReceptor" name="nombreReceptor" className="form-control" required maxLength={120} value={formularioDireccion.nombreReceptor} onChange={actualizarDireccion} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="telefonoReceptor">Teléfono</label>
                                                        <input id="telefonoReceptor" name="telefonoReceptor" className="form-control" required maxLength={30} value={formularioDireccion.telefonoReceptor} onChange={actualizarDireccion} />
                                                    </div>
                                                    <div className="col-md-8">
                                                        <label className="form-label" htmlFor="calle">Calle</label>
                                                        <input id="calle" name="calle" className="form-control" required maxLength={150} value={formularioDireccion.calle} onChange={actualizarDireccion} />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label" htmlFor="numero">Número</label>
                                                        <input id="numero" name="numero" className="form-control" required maxLength={20} value={formularioDireccion.numero} onChange={actualizarDireccion} />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label" htmlFor="complemento">Complemento (opcional)</label>
                                                        <input id="complemento" name="complemento" className="form-control" maxLength={150} value={formularioDireccion.complemento} onChange={actualizarDireccion} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="idRegion">Región</label>
                                                        <select id="idRegion" name="idRegion" className="form-select" required value={formularioDireccion.idRegion} onChange={actualizarDireccion}>
                                                            <option value="">Selecciona una región</option>
                                                            {regionesComunas.map((region) => (
                                                                <option key={region.idRegion} value={region.idRegion}>{region.nombre ?? region.region}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label" htmlFor="idComuna">Comuna</label>
                                                        <select id="idComuna" name="idComuna" className="form-select" required disabled={!comunas.length} value={formularioDireccion.idComuna} onChange={actualizarDireccion}>
                                                            <option value="">Selecciona una comuna</option>
                                                            {comunas.map((comuna) => (
                                                                <option key={comuna.idComuna} value={comuna.idComuna}>{comuna.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-12 d-flex gap-2">
                                                        <button type="submit" className="btn btn-dark" disabled={procesando}>Guardar dirección</button>
                                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setMostrarFormularioDireccion(false)} disabled={procesando}>Cancelar</button>
                                                    </div>
                                                </form>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="h5">Resumen</h2>
                            <ul className="list-group list-group-flush mb-3">
                                {cart.map((item) => (
                                    <li className="list-group-item d-flex justify-content-between px-0" key={item.product.idProducto}>
                                        <span>{item.units} × {item.product.nombre}</span>
                                        <span>{formatearPrecio(item.units * Number(item.product.precio || 0))}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="d-flex justify-content-between fw-bold">
                                <span>Total estimado</span>
                                <span>{formatearPrecio(totalLocal)}</span>
                            </p>
                            <p className="small text-secondary">El servidor calcula el total definitivo, valida el stock disponible y reserva las unidades al crear el pedido. La simulación no confirma el pago en backend.</p>
                            <button
                                type="button"
                                className="btn btn-dark w-100"
                                onClick={completarPedido}
                                disabled={procesando || cargandoDatos || (tipoEntrega === "DESPACHO" && !idDireccion)}
                            >
                                {procesando ? "Procesando..." : "Pagar (simulación)"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
