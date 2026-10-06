function GrupoFiltro({ legend, hayValores, mensajeSinDatos, children }) {

    return (
        <fieldset className="mb-4">
            <legend className="fs-6 fw-semibold">{legend}</legend>
            {hayValores ? children : <span className="text-secondary small">{mensajeSinDatos}</span>}
        </fieldset>
    )
}

export function ProductFilterSidebar({ marcas, marcasSeleccionadas, onToggleMarca, categorias, idsCategoria, onToggleCategoria, precioMin, precioMax, onPrecioChange, hayFiltros, onLimpiar, mostrados, total }) {

    const listaMarcas = marcas.map((m) => ({ ...m, marcado: marcasSeleccionadas.includes(m.clave) }))
    const listaCategorias = categorias.map((c) => ({ ...c, marcado: idsCategoria.includes(c.clave) }))

    return (
        <div className="border rounded p-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h3 className="fs-6 mb-0">Filtros</h3>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-secondary small">
                        Mostrando {mostrados} de {total} {total === 1 ? "producto" : "productos"}
                    </span>
                    {
                        hayFiltros &&
                        <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={onLimpiar}>
                            Limpiar
                        </button>
                    }
                </div>
            </div>

            <GrupoFiltro legend="Marcas" hayValores={listaMarcas.length > 0} mensajeSinDatos="No hay marcas para filtrar.">
                {listaMarcas.map((m) => (
                    <div className="form-check" key={m.clave}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={`marca-${m.clave}`}
                            checked={m.marcado}
                            onChange={() => onToggleMarca(m.clave)}
                        />
                        <label className="form-check-label d-flex justify-content-between" htmlFor={`marca-${m.clave}`}>
                            <span>{m.nombre}</span>
                            <span className="text-secondary">({m.total})</span>
                        </label>
                    </div>
                ))}
            </GrupoFiltro>

            <GrupoFiltro legend="Categorías" hayValores={listaCategorias.length > 0} mensajeSinDatos="No hay categorías para filtrar.">
                {listaCategorias.map((c) => (
                    <div className="form-check" key={c.clave}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={`categoria-${c.clave}`}
                            checked={c.marcado}
                            onChange={() => onToggleCategoria(c.clave)}
                        />
                        <label className="form-check-label d-flex justify-content-between" htmlFor={`categoria-${c.clave}`}>
                            <span className="text-capitalize">{c.nombre}</span>
                            <span className="text-secondary">({c.total})</span>
                        </label>
                    </div>
                ))}
            </GrupoFiltro>

            <fieldset className="mb-0">
                <legend className="fs-6 fw-semibold">Precio</legend>
                <div className="row g-2">
                    <div className="col-6">
                        <label htmlFor="precioMin" className="form-label small mb-1">Mínimo</label>
                        <input
                            id="precioMin"
                            type="number"
                            min="0"
                            className="form-control form-control-sm border-black"
                            placeholder="$0"
                            value={precioMin}
                            onChange={(e) => onPrecioChange("precioMin", e.target.value)}
                        />
                    </div>
                    <div className="col-6">
                        <label htmlFor="precioMax" className="form-label small mb-1">Máximo</label>
                        <input
                            id="precioMax"
                            type="number"
                            min="0"
                            className="form-control form-control-sm border-black"
                            placeholder="$0"
                            value={precioMax}
                            onChange={(e) => onPrecioChange("precioMax", e.target.value)}
                        />
                    </div>
                </div>
            </fieldset>
        </div>
    )
}