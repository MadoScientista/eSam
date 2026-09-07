const formateadorPrecio = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0
})

export function formatearPrecio(valor) {
    return formateadorPrecio.format(valor)
}