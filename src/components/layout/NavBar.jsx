

export function NavBar(){
    return <>
        <nav class="navbar navbar-expand-lg bg-dark navbar-dark">
            <div class="container">
                <a class="navbar-brand" href="#">ESam</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="#">Inicio</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="#">Productos</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="#">Contacto</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" aria-disabled="true">Blog</a>
                    </li>
                </ul>

                
                {/* Iconos a la derecha */}
                <ul className="navbar-nav ms-auto">
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