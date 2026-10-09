import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AlertMessage } from "../components/AlertMessage"
import { EstadoPedidoBadge } from "../components/EstadoPedidoBadge"
import { obtenerMisPedidos } from "../services/pedidoService"
import { formatearPrecio } from "../utils/moneda"

function fechaPedido(fecha) {
    if (!fecha) return "—"
    const date = new Date(fecha)
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

// Historial propio del cliente: PedidoResumenDTOResponse, ordenado por
// creadoEn descendente según el backend.
export function CustomerOrders() {
    const [pedidos, setPedidos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let activo = true

        obtenerMisPedidos()
            .then((data) => {
                if (!Array.isArray(data)) {
                    throw new Error("El servidor devolvió un formato de pedidos inesperado.")
                }
                if (activo) setPedidos(data)
            })
            .catch((errorCarga) => {
                console.error("Error al cargar pedidos", errorCarga)
                if (activo) setError(errorCarga?.message || "No se pudieron cargar tus pedidos.")
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => { activo = false }
    }, [])

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Mis pedidos</h1>
                <Link className="btn btn-outline-dark btn-sm" to="/productos">Seguir comprando</Link>
            </div>

            <AlertMessage type={error ? "danger" : undefined} message={error} onClose={() => setError(null)} />

            {cargando ? (
                <p>Cargando pedidos...</p>
            ) : pedidos.length === 0 ? (
                <div>
                    <p>Aún no tienes pedidos registrados.</p>
                    <Link className="btn btn-dark" to="/productos">Ver productos</Link>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th scope="col">ID PEDIDO</th>
                                <th scope="col">FECHA</th>
                                <th scope="col">ARTÍCULOS</th>
                                <th scope="col">TOTAL</th>
                                <th scope="col">ESTADO</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map((pedido) => (
                                <tr key={pedido.idPedido}>
                                    <td><strong>#{pedido.idPedido}</strong></td>
                                    <td>{fechaPedido(pedido.creadoEn)}</td>
                                    <td>{pedido.cantidadItems ?? "—"}</td>
                                    <td><strong>{formatearPrecio(pedido.total ?? 0)}</strong></td>
                                    <td><EstadoPedidoBadge estado={pedido.estado} /></td>
                                    <td className="text-end">
                                        <Link className="btn btn-outline-dark btn-sm" to={`/usuario/pedidos/${pedido.idPedido}`}>
                                            Ver detalle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
