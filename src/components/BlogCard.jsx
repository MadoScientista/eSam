import { useNavigate } from "react-router-dom"


export function BlogCard({entrada}){
    const navigate = useNavigate()
    const handleBtn = () => navigate(`/entradaBlog/${entrada.id}`)

    return(
        <div className="mb-3" style={{maxWidth: "50rem", cursor:"pointer"}} onClick={handleBtn}>
            <div className="row g-0">
                <div className="col-md-4">
                    <img src={entrada.img} className="img-fluid rounded-start h-100 w-100" alt="..." style={{objectFit:"cover"}} />
                </div>
                <div className="col-md-8 p-4">
                    <div className="card-body d-flex flex-column h-100">
                        <h5 className="card-title">{entrada.titulo}</h5>
                        <p className="card-text flex-grow-1">{entrada.resumen}</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-body-secondary">{entrada.fecha}</small>
                            <button className="btn btn-dark btn-sm" type="button">Leer</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
