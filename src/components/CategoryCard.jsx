
export function CategoryCard({category, handleClick}){
    return(
        <>
            <div
                className="card esam-category-card h-100 w-100 d-flex flex-column"
                onClick={handleClick}
                style={{ cursor: "pointer" }}
            >
    
                <div className="category-image-wrap">
{
                    category.imagenUrl
                    ? <img
                            src={category.imagenUrl}
                            alt={category.nombre}
                        />
                    : <i className="bi bi-tags fs-1 text-secondary"></i>
                }
            </div>
            <div className="card-body d-flex flex-column flex-grow-1">
                <h6 className="card-title text-capitalize">{category.nombre}</h6>
            </div>
            </div>
        </>
    )
}