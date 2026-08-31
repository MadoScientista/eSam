import { NavLink } from "react-router-dom";

const ADMIN_MENU_ITEMS = [
    { label: "Perfil", path: "/admin" },
    { label: "Productos", path: "/admin/productos" },
    { label: "Usuarios", path: "/admin/usuarios" },
];

export function AdminSidebar() {
    return (
        <nav className="col-md-3 col-lg-2 d-md-block bg-black sidebar collapse">
            <div className="position-sticky pt-3">
                <h6 className="text-white-50 text-uppercase px-3 mb-2">
                    Administración
                </h6>
                <ul className="nav flex-column">
                    {ADMIN_MENU_ITEMS.map(({ label, path }) => (
                        <li className="nav-item" key={path}>
                            <NavLink
                                to={path}
                                end={path === "/admin"}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active text-white fw-bold" : "text-white-50"}`
                                }
                            >
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}