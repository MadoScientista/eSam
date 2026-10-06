import { ORDENES_PRODUCTO } from "../utils/producto"

export function ProductToolbar({ busqueda, onBusquedaChange, orden, onOrdenChange }) {

    return (
        <div className="row g-3 align-items-end justify-content-center mb-4">
            <div className="col-12 col-md-7 col-lg-5">
                <label htmlFor="buscarProducto" className="form-label mb-1">Buscar</label>
                <div className="input-group">
                    <span className="input-group-text border-black"><i className="bi bi-search"></i></span>
                    <input
                        id="buscarProducto"
                        type="search"
                        className="form-control border-black"
                        placeholder="Nombre, marca o SKU"
                        value={busqueda}
                        onChange={(e) => onBusquedaChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="col-8 col-md-5 col-lg-3">
                <label htmlFor="ordenarProductos" className="form-label mb-1">Ordenar por</label>
                <select
                    id="ordenarProductos"
                    className="form-select border-black"
                    value={orden}
                    onChange={(e) => onOrdenChange(e.target.value)}
                >
                    {ORDENES_PRODUCTO.map((o) => (
                        <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}