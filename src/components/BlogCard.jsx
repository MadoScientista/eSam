import { useNavigate } from "react-router-dom"
import { formatearFecha } from "../utils/blog"

export function BlogCard({ entrada }) {
    const navigate = useNavigate()
    const handleClick = () => navigate(`/entradaBlog/${entrada.id}`)

    return (
        <div
            className="card h-100 border-0 shadow-sm blog-card"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
        >
            <div style={{ height: "12rem", overflow: "hidden" }}>
                <img
                    src={entrada.img}
                    alt={entrada.titulo}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                />
            </div>
            <div className="card-body d-flex flex-column p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge text-bg-light border">{entrada.categoria}</span>
                    <small className="text-body-secondary">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatearFecha(entrada.fecha)}
                    </small>
                </div>
                <h5 className="card-title">{entrada.titulo}</h5>
                <p className="card-text text-secondary flex-grow-1">{entrada.resumen}</p>
                <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <small className="text-body-secondary">
                        <i className="bi bi-person me-1"></i>
                        {entrada.autor}
                    </small>
                    <span className="btn btn-sm btn-outline-dark">
                        Leer más <i className="bi bi-arrow-right ms-1"></i>
                    </span>
                </div>
            </div>
        </div>
    )
}