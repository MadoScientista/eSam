import { EstadoPedidoBadge } from "./EstadoPedidoBadge"
import { formatearPrecio } from "../utils/moneda"

function fechaHora(fecha) {
    if (!fecha) return "—"
    const date = new Date(fecha)
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function direccionTexto(envio) {
    if (!envio) return null
    return [
        [envio.calle, envio.numero].filter(Boolean).join(" "),
        envio.complemento,
        [envio.comunaNombre, envio.regionNombre].filter(Boolean).join(", ")
    ].filter(Boolean).join(", ")
}

// Detalle de un pedido para el administrador. Lee el PedidoAdminDTOResponse ya
// cargado en el listado, por lo que incluye los artículos, la modalidad de
// entrega (despacho o retiro en tienda), el comprador y el historial de estados.
export function OrderDetailModal({ show, orden, onClose }) {
    if (!show || !orden) return null

    const detalles = orden.detalles ?? []
    const historial = orden.historialEstados ?? []
    const esDespacho = orden.tipoEntrega === "DESPACHO"

    return (
        <>
            <div className="modal-backdrop show"></div>
            <div className="modal d-block" tabIndex="-1" onClick={onClose}>
                <div
                    className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                    onClick={(evento) => evento.stopPropagation()}
                >
                    <div className="modal-content shadow-lg">
                        <div className="modal-header">
                            <div>
                                <h5 className="modal-title mb-1">Pedido #{orden.idPedido}</h5>
                                <span className="text-secondary small">Creado el {fechaHora(orden.creadoEn)}</span>
                            </div>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
                        </div>

                        <div className="modal-body">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span className="text-secondary small text-uppercase fw-bold">Estado actual</span>
                                <EstadoPedidoBadge estado={orden.estado} />
                            </div>

                            <h6 className="fw-bold">Artículos</h6>
                            <ul className="list-group list-group-flush mb-4">
                                {detalles.length === 0 ? (
                                    <li className="list-group-item px-0 text-secondary">Sin artículos registrados.</li>
                                ) : detalles.map((detalle) => (
                                    <li
                                        className="list-group-item d-flex justify-content-between px-0"
                                        key={detalle.idDetallePedido ?? detalle.idProducto}
                                    >
                                        <span>
                                            {detalle.cantidad} × {detalle.nombreProducto}
                                            {detalle.skuProducto && (
                                                <span className="text-secondary small ms-2">SKU {detalle.skuProducto}</span>
                                            )}
                                        </span>
                                        <span>{formatearPrecio(detalle.subtotal ?? 0)}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="d-flex justify-content-between fw-bold border-top pt-2">
                                <span>Total</span>
                                <span>{formatearPrecio(orden.total ?? 0)}</span>
                            </p>

                            <h6 className="fw-bold">Entrega</h6>
                            <ul className="list-group list-group-flush mb-4">
                                <li className="list-group-item px-0 d-flex justify-content-between">
                                    <span className="text-secondary">Modalidad</span>
                                    <strong>{esDespacho ? "Despacho a domicilio" : "Retiro en tienda"}</strong>
                                </li>
                                {esDespacho && orden.envio && (
                                    <>
                                        <li className="list-group-item px-0 d-flex justify-content-between">
                                            <span className="text-secondary">Recibe</span>
                                            <span>{orden.envio.nombreReceptor || "—"}</span>
                                        </li>
                                        <li className="list-group-item px-0 d-flex justify-content-between">
                                            <span className="text-secondary">Teléfono</span>
                                            <span>{orden.envio.telefonoReceptor || "—"}</span>
                                        </li>
                                        <li className="list-group-item px-0 d-flex justify-content-between">
                                            <span className="text-secondary">Dirección</span>
                                            <span className="text-end">{direccionTexto(orden.envio) || "—"}</span>
                                        </li>
                                    </>
                                )}
                            </ul>

                            <h6 className="fw-bold">Comprador</h6>
                            <ul className="list-group list-group-flush mb-4">
                                <li className="list-group-item px-0 d-flex justify-content-between">
                                    <span className="text-secondary">Correo</span>
                                    <span>{orden.emailUsuario || "—"}</span>
                                </li>
                            </ul>

                            <h6 className="fw-bold">Historial de estados</h6>
                            <ol className="list-group list-group-numbered list-group-flush">
                                {historial.length === 0 ? (
                                    <li className="list-group-item px-0 text-secondary">Sin cambios registrados.</li>
                                ) : historial.map((evento, index) => (
                                    <li className="list-group-item px-0" key={`${evento.estadoNuevo}-${index}`}>
                                        <div className="d-flex justify-content-between gap-2">
                                            <span>
                                                {evento.estadoAnterior
                                                    ? `${evento.estadoAnterior} → ${evento.estadoNuevo}`
                                                    : `Creado en ${evento.estadoNuevo}`}
                                            </span>
                                            <span className="text-secondary small text-nowrap">
                                                {fechaHora(evento.cambiadoEn)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
