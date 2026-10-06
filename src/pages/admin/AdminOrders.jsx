import { useEffect, useState } from "react";
import { AlertMessage } from "../../components/AlertMessage";
import { obtenerPedidosAdmin } from "../../services/pedidoService";
import { formatearPrecio } from "../../utils/moneda";

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

export function AdminOrders() {
    const [ordenes, setOrdenes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

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

    return (
        <div className="admin-page">
            <header className="admin-page-header">
                <div>
                    <span className="admin-eyebrow">VENTAS</span>
                    <h1>Órdenes</h1>
                    <p>Consulta las compras realizadas en la plataforma.</p>
                </div>
                <span className="admin-count-chip">
                    <i className="bi bi-receipt" aria-hidden="true" />
                    {cargando ? "Cargando..." : `${ordenes.length} órdenes`}
                </span>
            </header>

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
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr><td colSpan="5" className="admin-table-empty">Cargando órdenes...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="5" className="admin-table-empty">No fue posible mostrar las órdenes.</td></tr>
                            ) : ordenes.length === 0 ? (
                                <tr><td colSpan="5" className="admin-table-empty">Todavía no hay órdenes registradas.</td></tr>
                            ) : ordenes.map((orden) => (
                                <tr key={orden.idPedido}>
                                    <td>
                                        <strong className="admin-order-number">
                                            {orden.numeroPedido || `#${orden.idPedido}`}
                                        </strong>
                                    </td>
                                    <td>{fechaPedido(orden.creadoEn)}</td>
                                    <td>{orden.cantidadItems ?? "—"}</td>
                                    <td><strong>{formatearPrecio(orden.total ?? 0)}</strong></td>
                                    <td>
                                        <span className={`admin-order-status ${claseEstado(orden.estado)}`}>
                                            {orden.estado || "Sin estado"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
