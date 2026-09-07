const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
]

export function formatearFecha(fecha) {
    if (!fecha) return ""
    const [dia, mes, anio] = fecha.split("-")
    return `${parseInt(dia, 10)} de ${meses[parseInt(mes, 10) - 1]} de ${anio}`
}

export function tiempoLectura(texto) {
    if (!texto) return 1
    const palabras = texto.trim().split(/\s+/).length
    return Math.max(1, Math.round(palabras / 200))
}

export function parsearCuerpo(texto) {
    const lineas = texto.split("\n").map((l) => l.trim()).filter((l) => l !== "")
    const bloques = []
    let lista = null

    for (const linea of lineas) {
        const match = linea.match(/^\d+[.)]\s+(.+)$/)
        if (match) {
            if (!lista) {
                lista = []
                bloques.push({ tipo: "lista", items: lista })
            }
            lista.push(match[1])
        } else {
            lista = null
            bloques.push({ tipo: "parrafo", texto: linea })
        }
    }

    return bloques
}