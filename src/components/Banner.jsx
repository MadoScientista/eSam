import { NavLink } from "react-router-dom"


export function Banner( {children} ){
    return(
        <section className="esam-hero">
            <div className="container esam-hero-grid">
                <div className="esam-hero-copy">
                    <h1 className="esam-hero-title">Bienvenido a ESam</h1>
                    <p className="esam-hero-lead">
                        Encuentra todos los productos escolares que necesitas.
                        Artículos de librería y papelería para tu estudio, oficina
                        y creatividad.
                    </p>
                    <div className="esam-hero-actions">
                        <NavLink className="btn btn-primary btn-lg" to="productos">
                            Revisa nuestro catálogo
                            <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
                        </NavLink>
                        <NavLink className="btn btn-outline-dark btn-lg" to="categorias">
                            Ver categorías
                        </NavLink>
                    </div>
                </div>
                <div className="esam-hero-media">
                    {children}
                </div>
            </div>
        </section>
    )
}
