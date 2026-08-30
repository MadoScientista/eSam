import { useParams } from "react-router-dom"

import { entradasBlog } from "../const/entradasBlog"

export function BlogArticle(){

    const { idEntrada } = useParams()
    const entrada = entradasBlog.find((eb)=> eb.id == idEntrada) 

    return (
        <div className="container pt-5 pb-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <article>
                        <img src={entrada.img} alt="" className="img-fluid rounded mb-4 w-100" style={{maxHeight:"20rem", objectFit:"cover"}} />
                        <p className="text-muted small mb-4">{entrada.fecha}</p>
                        <h2 className="mb-4">{entrada.titulo}</h2>
                        <p className="lead">{entrada.resumen}</p>
                        <hr />
                        {entrada.cuerpo.split("\n").filter((p) => p.trim() !== "").map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </article>
                </div>
            </div>
        </div>
    )
}
