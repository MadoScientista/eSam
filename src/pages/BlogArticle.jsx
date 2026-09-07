import { Link, useParams } from "react-router-dom"

import { entradasBlog } from "../const/entradasBlog"
import { formatearFecha, parsearCuerpo, tiempoLectura } from "../utils/blog"
import { BlogCard } from "../components/BlogCard"

export function BlogArticle(){

    const { idEntrada } = useParams()
    const entrada = entradasBlog.find((eb) => eb.id == idEntrada)

    if (!entrada) {
        return (
            <div className="container pt-5 pb-5 text-center">
                <h2>Entrada no encontrada</h2>
                <p className="text-secondary">
                    La entrada que buscás no existe o fue eliminada.
                </p>
                <Link to="/blogs" className="btn btn-dark">
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver al blog
                </Link>
            </div>
        )
    }

    const otrasEntradas = entradasBlog.filter((eb) => eb.id != idEntrada)

    return (
        <div className="container pt-5 pb-5">
            <Link to="/blogs" className="btn btn-outline-dark btn-sm mb-4">
                <i className="bi bi-arrow-left me-2"></i>
                Volver al blog
            </Link>

            <article>
                <img
                    src={entrada.img}
                    alt={entrada.titulo}
                    className="img-fluid rounded mb-4 w-100"
                    style={{ maxHeight: "20rem", objectFit: "cover" }}
                />

                <div className="d-flex flex-wrap align-items-center gap-3 text-body-secondary small mb-3">
                    <span className="badge text-bg-light border">{entrada.categoria}</span>
                    <span><i className="bi bi-calendar3 me-1"></i>{formatearFecha(entrada.fecha)}</span>
                    <span><i className="bi bi-person me-1"></i>{entrada.autor}</span>
                    <span><i className="bi bi-clock me-1"></i>{tiempoLectura(entrada.cuerpo)} min de lectura</span>
                </div>

                <h2 className="mb-4">{entrada.titulo}</h2>
                <p className="lead">{entrada.resumen}</p>
                <hr />

                <div>
                    {parsearCuerpo(entrada.cuerpo).map((bloque, i) =>
                        bloque.tipo === "lista"
                            ? (
                                <ol key={i} className="mb-3">
                                    {bloque.items.map((item, j) => (
                                        <li key={j} className="mb-2">{item}</li>
                                    ))}
                                </ol>
                            )
                            : (
                                <p key={i}>{bloque.texto}</p>
                            )
                    )}
                </div>
            </article>

            {otrasEntradas.length > 0 && (
                <section className="mt-5">
                    <h4 className="mb-4">Sigue leyendo</h4>
                    <div className="row g-4">
                        {otrasEntradas.map((eb) => (
                            <div className="col-md-6 d-flex" key={eb.id}>
                                <BlogCard entrada={eb}/>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}