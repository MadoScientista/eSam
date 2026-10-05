import { useNavigate } from "react-router-dom"
import { CategoryCard } from "./CategoryCard"

// Cuatro accesos rápidos es lo que alcanza en una fila a 4 columnas, y es el
// ancho de las tarjetas de producto del catálogo.
const CANTIDAD_ACCESO_RAPIDO = 4

export function CategoryBanner({ categories }) {

    const navigate = useNavigate()

    if (!categories || categories.length === 0) return null

    return (
        <div className="row row-cols-2 row-cols-md-4 g-3 mb-5">
            {categories.slice(0, CANTIDAD_ACCESO_RAPIDO).map((c) => {
                return (
                    <div className="col d-flex" key={c.idCategoria}>
                        <CategoryCard
                            category={c}
                            handleClick={() => navigate(`/productos?categoria=${c.idCategoria}`)}
                        />
                    </div>
                )
            })}
        </div>
    )
}