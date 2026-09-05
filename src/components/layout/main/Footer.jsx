import { Link } from "react-router-dom"

export function Footer(){
    return (
        <footer className="container-fluid bg-black text-light">
            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-md-4">
                        <h5 className="fw-bold mb-3">ESam</h5>
                        <p className="text-secondary mb-0">
                            Artículos de librería y papelería para tu estudio, oficina y creatividad.
                        </p>
                    </div>

                    <div className="col-md-3">
                        <h6 className="text-uppercase mb-3">Enlaces</h6>
                        <ul className="list-unstyled mb-0">
                            <li><Link to="/" className="text-secondary text-decoration-none">Inicio</Link></li>
                            <li><Link to="/productos" className="text-secondary text-decoration-none">Productos</Link></li>
                            <li><Link to="/nosotros" className="text-secondary text-decoration-none">Nosotros</Link></li>
                            <li><Link to="/contacto" className="text-secondary text-decoration-none">Contacto</Link></li>
                            <li><Link to="/blogs" className="text-secondary text-decoration-none">Blog</Link></li>
                        </ul>
                    </div>

                    <div className="col-md-3">
                        <h6 className="text-uppercase mb-3">Mi Cuenta</h6>
                        <ul className="list-unstyled mb-0">
                            <li><Link to="/login" className="text-secondary text-decoration-none">Inicia Sesión</Link></li>
                            <li><Link to="/registro" className="text-secondary text-decoration-none">Regístrate</Link></li>
                            <li><Link to="/usuario" className="text-secondary text-decoration-none">Mi Perfil</Link></li>
                            <li><Link to="/carrito" className="text-secondary text-decoration-none">Carrito</Link></li>
                        </ul>
                    </div>

                    <div className="col-md-2">
                        <h6 className="text-uppercase mb-3">Contacto</h6>
                        <ul className="list-unstyled mb-0 text-secondary">
                            <li><i className="bi bi-envelope me-2"></i>contacto@esam.cl</li>
                            <li><i className="bi bi-telephone me-2"></i>+56 2 2345 6789</li>
                        </ul>
                        <ul className="list-inline mt-3 mb-0">
                            <li className="list-inline-item me-2">
                                <a href="#" className="text-secondary" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                            </li>
                            <li className="list-inline-item me-2">
                                <a href="#" className="text-secondary" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                            </li>
                            <li className="list-inline-item">
                                <a href="#" className="text-secondary" aria-label="X"><i className="bi bi-twitter-x"></i></a>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="border-secondary" />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                    {/* <p className="text-secondary mb-0">
                        © {new Date().getFullYear()} ESam. Todos los derechos reservados.
                    </p> */}
                    <div className="text-secondary">
                        <i className="bi bi-credit-card-2-back me-3"></i>
                        <i className="bi bi-credit-card me-3"></i>
                        <i className="bi bi-bank"></i>
                    </div>
                </div>
            </div>
        </footer>
    )
}