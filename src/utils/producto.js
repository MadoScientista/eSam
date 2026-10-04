export function imagenPrincipalProducto(producto) {
    const imagenes = producto?.imagenes

    if (!Array.isArray(imagenes) || imagenes.length === 0) {
        return null
    }

    const principal = imagenes.find((imagen) => imagen?.principal)

    return (principal ?? imagenes[0])?.url ?? null
}