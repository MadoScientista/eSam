import { useEffect, useState } from "react";
import { AlertMessage } from "../../components/AlertMessage";
import { ConfirmModal } from "../../components/ConfirmModal";
import { obtenerPedidosAdmin, actualizarEstadoPedido } from "../../services/pedidoService";
import { formatearPrecio } from "../../utils/moneda";

// Transiciones permitidas por la especificación: PENDIENTE -> CONFIRMADO |
// CANCELADO, CONFIRMADO -> ENVIADO y ENVIADO -> ENTREGADO. ENTREGADO y
// CANCELADO son estados finales. El backend vuelve a validar cada cambio.
const TRANSICIONES_PERMITIDAS = {
    PENDIENTE: [
        { estado: "CONFIRMADO", etiqueta: "Confirmar pago", icono: "bi-cash-coin" },
        { estado: "CANCELADO", etiqueta: "Cancelar pedido", icono: "bi-x-circle" },
    ],
    CONFIRMADO: [
        { estado: "ENVIADO", etiqueta: "Marcar enviado", icono: "bi-truck" },
    ],
    ENVIADO: [
        { estado: "ENTREGADO", etiqueta: "Marcar entregado", icono: "bi-box-seam" },
    ],
    ENTREGADO: [],
    CANCELADO: [],
};

const CONFIRMACIONES = {
    CONFIRMADO: "Se registrará el pago aceptado: el pedido pasará a CONFIRMADO y la reserva de stock se mantiene. ¿Continuar?",
    CANCELADO: "El pedido pasará a CANCELADO y se liberará la reserva de stock. Esta acción es definitiva. ¿Continuar?",
    ENVIADO: "El pedido pasará a ENVIADO y la reserva de stock se mantiene. ¿Continuar?",
    ENTREGADO: "El pedido pasará a ENTREGADO: se descontará el stock vendido y se liberará la reserva. Esta acción es definitiva. ¿Continuar?",
};

function fechaPedido(fecha) {
    if (!fecha) return "—";
    const date = new Date(fecha);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(date);
}

function claseEstado(estado) {
    const estados = {
        PENDIENTE: "pending",
        CONFIRMADO: "confirmed",
        ENVIADO: "shipped",
        ENTREGADO: "delivered",
        CANCELADO: "cancelled",
    };
    return estados[estado] || "pending";
}

// PedidoAdminDTOResponse trae `detalles`, no `cantidadItems` (ese campo es del
// resumen del cliente); el total de artículos se suma desde el detalle.
function totalArticulos(orden) {
    if (!Array.isArray(orden.detalles)) return "—";
    return orden.detalles.reduce((total, detalle) => total + Number(detalle.cantidad ?? 0), 0);
}

export function AdminOrders() {
    const [ordenes, setOrdenes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState(null);
    const [transicionPendiente, setTransicionPendiente] = useState(null);
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        let activo = true;

        obtenerPedidosAdmin()
            .then((data) => {
                if (!Array.isArray(data)) {
                    throw new Error("El servidor devolvió un formato de órdenes inesperado.");
                }
                if (activo) setOrdenes(data);
            })
            .catch((errorCarga) => {
                console.error("Error al cargar órdenes", errorCarga);
                if (activo) setError(errorCarga?.message || "No se pudieron cargar las órdenes.");
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => { activo = false; };
    }, []);

    const cerrarModal = () => {
        if (procesando) return;
        setTransicionPendiente(null);
    };

    const confirmarTransicion = async () => {
        if (!transicionPendiente) return;

        const { orden, transicion } = transicionPendiente;
        setMensaje(null);
        setProcesando(true);

        try {
            const actualizado = await actualizarEstadoPedido(orden.idPedido, transicion.estado);

            if (!actualizado?.idPedido) {
                throw new Error("El servidor devolvió un pedido con formato inesperado.");
            }

            setOrdenes((actuales) =>
                actuales.map((actual) => actual.idPedido === actualizado.idPedido ? actualizado : actual)
            );
            setMensaje({
                type: "success",
                message: `El pedido ${actualizado.numeroPedido || `#${actualizado.idPedido}`} quedó en estado ${actualizado.estado}.`,
            });
        } catch (errorCambio) {
            console.error("Error al cambiar el estado del pedido", errorCambio);
            const conflicto = errorCambio?.status === 400 && errorCambio?.code === "PEDIDO_INVALIDO";
            setMensaje({
                type: "danger",
                message: conflicto
                    ? "La transición de estado no está permitida para este pedido."
                    : errorCambio?.message || "No se pudo actualizar el estado del pedido.",
            });
        } finally {
            setProcesando(false);
            setTransicionPendiente(null);
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-page-header">
                <div>
                    <span className="admin-eyebrow">VENTAS</span>
                    <h1>Órdenes</h1>
                    <p>Consulta las compras realizadas en la plataforma y registra los cambios de estado.</p>
                </div>
                <span className="admin-count-chip">
                    <i className="bi bi-receipt" aria-hidden="true" />
                    {cargando ? "Cargando..." : `${ordenes.length} órdenes`}
                </span>
            </header>

            <AlertMessage type={mensaje?.type} message={mensaje?.message} onClose={() => setMensaje(null)} />
            {error && <AlertMessage type="danger" message={error} />}

            <section className="admin-table-card">
                <div className="admin-table-heading">
                    <div>
                        <h2>Todas las órdenes</h2>
                        <p>Listado general de compras de la tienda</p>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table admin-orders-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col">ORDEN</th>
                                <th scope="col">FECHA</th>
                                <th scope="col">ARTÍCULOS</th>
                                <th scope="col">TOTAL</th>
                                <th scope="col">ESTADO</th>
                                <th scope="col">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr><td colSpan="6" className="admin-table-empty">Cargando órdenes...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="admin-table-empty">No fue posible mostrar las órdenes.</td></tr>
                            ) : ordenes.length === 0 ? (
                                <tr><td colSpan="6" className="admin-table-empty">Todavía no hay órdenes registradas.</td></tr>
                            ) : ordenes.map((orden) => {
                                const transiciones = TRANSICIONES_PERMITIDAS[orden.estado] ?? [];

                                return (
                                <tr key={orden.idPedido}>
                                    <td>
                                        <strong className="admin-order-number">
                                            {orden.numeroPedido || `#${orden.idPedido}`}
                                        </strong>
                                    </td>
                                    <td>{fechaPedido(orden.creadoEn)}</td>
                                    <td>{totalArticulos(orden)}</td>
                                    <td><strong>{formatearPrecio(orden.total ?? 0)}</strong></td>
                                    <td>
                                        <span className={`admin-order-status ${claseEstado(orden.estado)}`}>
                                            {orden.estado || "Sin estado"}
                                        </span>
                                    </td>
                                    <td>
                                        {transiciones.length === 0 ? (
                                            <span className="text-secondary small">Sin acciones disponibles</span>
                                        ) : (
                                            <div className="d-flex flex-wrap gap-1">
                                                {transiciones.map((transicion) => (
                                                    <button
                                                        key={transicion.estado}
                                                        type="button"
                                                        className={`btn btn-sm ${transicion.estado === "CANCELADO" ? "btn-outline-danger" : "btn-outline-dark"}`}
                                                        onClick={() => setTransicionPendiente({ orden, transicion })}
                                                        disabled={procesando}
                                                    >
                                                        <i className={`bi ${transicion.icono} me-1`} aria-hidden="true" />
                                                        {transicion.etiqueta}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {transicionPendiente && (
                <ConfirmModal
                    show
                    title={`${transicionPendiente.transicion.etiqueta} · ${transicionPendiente.orden.numeroPedido || `#${transicionPendiente.orden.idPedido}`}`}
                    message={CONFIRMACIONES[transicionPendiente.transicion.estado]}
                    confirmText={transicionPendiente.transicion.etiqueta}
                    cancelText="Volver"
                    variant={transicionPendiente.transicion.estado === "CANCELADO" ? "danger" : "dark"}
                    icon={`bi ${transicionPendiente.transicion.icono}`}
                    disabled={procesando}
                    onConfirm={confirmarTransicion}
                    onCancel={cerrarModal}
                />
            )}
        </div>
    );
}
