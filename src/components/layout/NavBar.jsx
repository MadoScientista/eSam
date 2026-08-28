import { NavLink } from "react-router-dom"

export function NavBar(){
    return <>
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark sticky-top">
            <div className="container">
                <NavLink className="navbar-brand" to="/">ESam</NavLink>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                    <NavLink className="nav-link" aria-current="page" to="/">Inicio</NavLink>
                    </li>
                    <li className="nav-item">
                    <NavLink className="nav-link" to="productos">Productos</NavLink>
                    </li>
                    <li className="nav-item">
                    <NavLink className="nav-link"  to="nosotros">Nosotros</NavLink>
                    </li>
                    <li className="nav-item">
                    <NavLink className="nav-link" to="contacto">Contacto</NavLink>
                    </li>
                    <li className="nav-item">
                    <NavLink className="nav-link"  to="blogs">Blog</NavLink>
                    </li>
                </ul>

                
                {/* Iconos a la derecha */}
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                    <NavLink className="nav-link"  to="login">Inicia Sesión</NavLink>
                    </li>
                    <li className="nav-item">
                    <NavLink className="nav-link"  to="registro">Regístrate</NavLink>
                    </li>
                    <li className="nav-item">
                    <a className="nav-link" href="/buscar" title="Buscar">
                        <i className="bi bi-search"></i>
                    </a>
                    </li>

                    <li className="nav-item">
                    <a className="nav-link" href="/notificaciones" title="Notificaciones">
                        <i className="bi bi-bell"></i>
                    </a>
                    </li>

                    <li className="nav-item">
                    <a className="nav-link" href="/perfil" title="Perfil">
                        <i className="bi bi-person-circle"></i>
                    </a>
                    </li>
                </ul>
                </div>
            </div>
        </nav>
    </>
}