import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { AlertMessage } from "../components/AlertMessage"
import { EstadoPedidoBadge } from "../components/EstadoPedidoBadge"
import { obtenerMiPedido } from "../services/pedidoService"
import { formatearPrecio } from "../utils/moneda"

function fechaPedido(fecha) {
    if (!fecha) return "—"
    const date = new Date(fecha)
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

// Explica al cliente qué significa el estado actual sobre el stock reservado,
// siguiendo el ciclo de stock de la especificación de pedidos.
const EXPLICACION_ESTADO = {
    PENDIENTE: "El pago está pendiente de confirmación: las unidades del pedido están reservadas para tí hasta que se confirme el pago",
    CONFIRMADO: "El pago fue confirmado por un vendedor o administrador",
    ENVIADO: "El pedido está en camino.",
    ENTREGADO: "El pedido fue entregado.",
    CANCELADO: "El pedido fue cancelado.",
}

function direccionTexto(envio) {
    if (!envio) return null
    return [
        [envio.calle, envio.numero].filter(Boolean).join(" "),
        envio.complemento,
        [envio.comunaNombre, envio.regionNombre].filter(Boolean).join(", ")
    ].filter(Boolean).join(", ")
}

export function CustomerOrderDetail() {
    const { idPedido } = useParams()
    const [pedido, setPedido] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let activo = true

        obtenerMiPedido(idPedido)
            .then((data) => {
                if (!data?.idPedido) {
                    throw new Error("El servidor devolvió un pedido con formato inesperado.")
                }
                if (activo) setPedido(data)
            })
            .catch((errorCarga) => {
                console.error("Error al cargar el pedido", errorCarga)
                const noEncontrado = errorCarga?.status === 404 && errorCarga?.code === "PEDIDO_NO_ENCONTRADO"
                if (activo) {
                    setError(noEncontrado
                        ? "No encontramos este pedido, o no pertenece a tu cuenta."
                        : errorCarga?.message || "No se pudo cargar el pedido.")
                }
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [idPedido])

    if (cargando) {
        return (
            <div className="container py-4">
                <p>Cargando pedido...</p>
            </div>
        )
    }

    if (error || !pedido) {
        return (
            <div className="container py-4">
                <h1 className="h3 mb-3">Detalle del pedido</h1>
                <AlertMessage type="danger" message={error} />
                <Link className="btn btn-outline-dark" to="/usuario/pedidos">Volver a mis pedidos</Link>
            </div>
        )
    }

    return (
        <div className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                <div>
                    <Link className="text-decoration-none small" to="/usuario/pedidos">← Mis pedidos</Link>
                    <h1 className="h3 mb-1">#${pedido.idPedido}</h1>
                    <p className="text-secondary mb-0">Creado el {fechaPedido(pedido.creadoEn)}</p>
                </div>
                <EstadoPedidoBadge estado={pedido.estado} />
            </div>

            <div className="alert alert-secondary">
                {EXPLICACION_ESTADO[pedido.estado] ?? "Estado del pedido sin descripción."}
            </div>

            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="h5">Productos</h2>
                            <ul className="list-group list-group-flush">
                                {(pedido.detalles ?? []).map((detalle) => (
                                    <li className="list-group-item d-flex justify-content-between px-0" key={detalle.idDetallePedido}>
                                        <span>
                                            {detalle.cantidad} × {detalle.nombreProducto}
                                            {detalle.skuProducto && <span className="text-secondary small ms-2">SKU {detalle.skuProducto}</span>}
                                        </span>
                                        <span>{formatearPrecio(detalle.subtotal)}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="d-flex justify-content-between fw-bold mb-0 pt-2">
                                <span>Total</span>
                                <span>{formatearPrecio(pedido.total ?? 0)}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h2 className="h5">Entrega</h2>
                            <p className="mb-1">
                                <strong>Modalidad:</strong>{" "}
                                {pedido.tipoEntrega === "DESPACHO" ? "Despacho a domicilio" : "Retiro en tienda"}
                            </p>
                            {pedido.tipoEntrega === "DESPACHO" && pedido.envio && (
                                <>
                                    <p className="mb-1"><strong>Recibe:</strong> {pedido.envio.nombreReceptor}</p>
                                    <p className="mb-1"><strong>Teléfono:</strong> {pedido.envio.telefonoReceptor}</p>
                                    <p className="mb-0"><strong>Dirección:</strong> {direccionTexto(pedido.envio)}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h2 className="h5">Historial de estados</h2>
                            <ol className="list-group list-group-numbered list-group-flush">
                                {(pedido.historialEstados ?? []).map((evento, index) => (
                                    <li className="list-group-item px-0" key={`${evento.estadoNuevo}-${index}`}>
                                        <div className="d-flex justify-content-between gap-2">
                                            <span>
                                                {evento.estadoAnterior
                                                    ? `${evento.estadoAnterior} → ${evento.estadoNuevo}`
                                                    : `Creado en ${evento.estadoNuevo}`}
                                            </span>
                                            <span className="text-secondary small text-nowrap">
                                                {fechaPedido(evento.cambiadoEn)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
