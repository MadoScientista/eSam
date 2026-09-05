export const digitoVerificador = (cuerpo) => {
    let suma = 0
    let multiplo = 2

    String(cuerpo)
        .split("")
        .reverse()
        .forEach((digito) => {
            suma += Number(digito) * multiplo
            multiplo = multiplo === 7 ? 2 : multiplo + 1
        })

    const dv = 11 - (suma % 11)

    if (dv === 11) return "0"
    if (dv === 10) return "K"
    return String(dv)
}

export const validarRut = (rutCompleto) => {
    const limpio = String(rutCompleto).replace(/[.\-\s]/g, "")

    if (!/^\d{1,8}[0-9kK]$/.test(limpio)) return false

    const cuerpo = limpio.slice(0, -1)
    const dvIngresado = limpio.slice(-1).toUpperCase()

    return digitoVerificador(cuerpo) === dvIngresado
}

export const descomponerRut = (rutCompleto) => {
    const limpio = String(rutCompleto).replace(/[.\-\s]/g, "")

    return {
        rut: Number(limpio.slice(0, -1)),
        dv: limpio.slice(-1).toUpperCase()
    }
}