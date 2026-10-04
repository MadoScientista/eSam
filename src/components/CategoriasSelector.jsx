import { useMemo, useState } from "react"
import { aplanarCategorias } from "../utils/categoria"

export function CategoriasSelector({ categorias = [], seleccionadas = [], onChange, buscarPlaceholder = "Buscar categoría..." }) {

    const [busqueda, setBusqueda] = useState("")

    const planas = useMemo(() => aplanarCategorias(categorias), [categorias])

    const filtro = busqueda.trim().toLowerCase()
    const visibles = filtro
        ? planas.filter(({ categoria }) => categoria.nombre?.toLowerCase().includes(filtro))
        : planas

    const idsSeleccionados = seleccionadas.map(String)

    const alternar = (idCategoria) => {
        const id = String(idCategoria)
        const siguiente = idsSeleccionados.includes(id)
            ? idsSeleccionados.filter((x) => x !== id)
            : [...idsSeleccionados, id]

        onChange(siguiente.map(Number))
    }

    const seleccionarTodas = () => onChange(visibles.map(({ categoria }) => categoria.idCategoria))
    const limpiar = () => onChange([])

    return (
        <div className="border border-black rounded p-2">
            <div className="input-group input-group-sm mb-2">
                <span className="input-group-text border-black"><i className="bi bi-search"></i></span>
                <input
                    type="text"
                    className="form-control border-black"
                    placeholder={buscarPlaceholder}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-1 px-1">
                <small className="text-secondary">
                    {idsSeleccionados.length > 0 ? `${idsSeleccionados.length} seleccionada(s)` : "Sin seleccionar"}
                </small>
                <div>
                    <button type="button" className="btn btn-link btn-sm p-0 me-2" onClick={seleccionarTodas} disabled={visibles.length === 0}>
                        Todas
                    </button>
                    <button type="button" className="btn btn-link btn-sm p-0" onClick={limpiar} disabled={idsSeleccionados.length === 0}>
                        Quitar
                    </button>
                </div>
            </div>

            <div className="overflow-auto" style={{ maxHeight: "12rem" }}>
                {visibles.length === 0
                    ? <p className="text-secondary text-center py-3 mb-0">
                        {categorias.length === 0
                            ? "No hay categorías cargadas."
                            : "Ninguna categoría coincide con la búsqueda."}
                    </p>
                    : visibles.map(({ categoria, nivel }) => (
                        <div className="form-check" key={categoria.idCategoria} style={{ paddingLeft: `${1.5 + nivel * 1.1}rem` }}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`categoria-${categoria.idCategoria}`}
                                checked={idsSeleccionados.includes(String(categoria.idCategoria))}
                                onChange={() => alternar(categoria.idCategoria)}
                            />
                            <label
                                className="form-check-label"
                                htmlFor={`categoria-${categoria.idCategoria}`}
                                style={nivel > 0 ? { fontSize: "0.9rem" } : undefined}
                            >
                                {categoria.nombre}
                            </label>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}