import { NavLink, useLocation } from "react-router-dom"
import { useEffect } from "react"
import {cartProducts} from "../../const/cartProducts"
import { useCart } from "../../context/CartContext"

export function NavBar(){

    const { cart } = useCart()
    const location = useLocation()

    useEffect(() => {
        const navbarCollapse = document.getElementById('navbarNav')
        if (navbarCollapse) {
            navbarCollapse.classList.remove('show')
        }

        window.scrollTo(0,0)
    }, [location])

    let nProducts = 0

    cart.forEach((item) => {
        nProducts += item.units
    });

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
                        <NavLink className="nav-link" to="admin" title="Perfil">
                            <i className="bi bi-person-circle"></i>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink className="nav-link" to="carrito">
                            <i className="bi bi-cart position-relative">
                                {
                                    nProducts > 0 && 
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {nProducts}
                                    </span>
                                }
                            </i>
                        </NavLink>
                    </li>
                </ul>
                </div>
            </div>
        </nav>
    </>
}