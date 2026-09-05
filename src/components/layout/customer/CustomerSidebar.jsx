import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const CUSTOMER_MENU_ITEMS = [
    { label: "Perfil", path: "/usuario", end: true },
    { label: "Carrito", path: "/usuario/carrito" },
];

export function CustomerSidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="col-md-3 col-lg-2 d-md-block pt-5 collapse text-end border-end shadow-sm align-items-center">
            <div className="position-sticky pt-3">
                <h6 className="text-black text-uppercase px-3 mb-2">
                    Mi Cuenta
                </h6>
                <ul className="nav flex-column">
                    {CUSTOMER_MENU_ITEMS.map((item) => (
                        <li className="nav-item" key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "fw-bold active text-black" : "text-black"}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                    <li className="nav-item">
                        <button
                            type="button"
                            className="nav-link text-black border-0 bg-transparent text-end w-100"
                            onClick={handleLogout}
                        >
                            Cerrar sesión
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}