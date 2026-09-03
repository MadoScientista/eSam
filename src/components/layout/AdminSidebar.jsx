import { NavLink } from "react-router-dom";

const ADMIN_MENU_ITEMS = [
    { label: "Perfil", path: "/admin" },
    { label: "Productos", path: "/admin/productos" },
    { label: "Usuarios", path: "/admin/usuarios" },
];

export function AdminSidebar() {
    return (
        <nav className="col-md-3 col-lg-2 d-md-block pt-5 collapse text-end border-end align-items-center">
            <div className="position-sticky pt-3">
                <h6 className="text-black text-uppercase px-3 mb-2">
                    Administración
                </h6>
                <ul className="nav flex-column">
                    {ADMIN_MENU_ITEMS.map(({ label, path }) => (
                        <li className="nav-item" key={path}>
                            <NavLink
                                to={path}
                                end={path === "/admin"}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "fw-bold active" : "text-black"}`
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