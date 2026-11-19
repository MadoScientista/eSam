import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";

const CUSTOMER_MENU_ITEMS = [
    { label: "Perfil", path: "/usuario", icon: "bi-person", end: true },
    { label: "Carrito", path: "/usuario/carrito", icon: "bi-cart" },
    { label: "Mis pedidos", path: "/usuario/pedidos", icon: "bi-bag-check" },
];

export function CustomerSidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <aside className="app-sidebar">
            <NavLink to="/usuario" className="app-brand">
                <span className="app-brand-mark"><i className="bi bi-bag-heart-fill" /></span>
                <span>eSam <small>CLIENTE</small></span>
            </NavLink>

            <div className="app-sidebar-label">MENÚ PRINCIPAL</div>
            <nav aria-label="Navegación de la cuenta">
                <ul className="app-nav-list">
                    {CUSTOMER_MENU_ITEMS.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `app-nav-link${isActive ? " is-active" : ""}`
                                }
                            >
                                <i className={`bi ${item.icon}`} aria-hidden="true" />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <button type="button" className="app-logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-left" aria-hidden="true" />
                    <span>Cerrar sesión</span>
                </button>
            </nav>

        </aside>
    );
}
