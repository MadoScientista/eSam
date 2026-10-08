const NOMBRE_MAXIMO = 100

export function validarNombreMarca(nombre) {
    if (!nombre || nombre.trim().length === 0) return "El nombre es obligatorio."

    if (nombre.trim().length > NOMBRE_MAXIMO) {
        return `El nombre admite hasta ${NOMBRE_MAXIMO} caracteres.`
    }

    return null
}
