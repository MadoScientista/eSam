
export function CategoryCard({category, handleClick}){
    return(
        <>
            <div
                className="card h-100 w-100 d-flex flex-column p-3 card-hover"
                onClick={handleClick}
                style={{ cursor: "pointer" }}
            >
    
                <div
                    className="product-image-wrap"
                    style={{
                        height: "8rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative"
                    }}
                >
{
                    category.imagenUrl
                    ? <img
                            src={category.imagenUrl}
                            alt={category.nombre}
                            style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                objectFit: "contain"
                            }}
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