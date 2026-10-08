const VARIANTES = {
    PENDIENTE: "text-bg-warning",
    CONFIRMADO: "text-bg-primary",
    ENVIADO: "text-bg-info",
    ENTREGADO: "text-bg-success",
    CANCELADO: "text-bg-danger",
};

export function EstadoPedidoBadge({ estado }) {
    return (
        <span className={`badge ${VARIANTES[estado] ?? "text-bg-secondary"}`}>
            {estado ?? "Sin estado"}
        </span>
    );
}
