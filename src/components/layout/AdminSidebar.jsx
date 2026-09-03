import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const ADMIN_MENU_ITEMS = [
    { label: "Perfil", path: "/admin" },
    {
        label: "Productos",
        path: "/admin/productos",
        children: [
            { label: "Todos", path: "/admin/productos" },
            { label: "Nuevo producto", path: "/admin/productos/nuevo" },
        ],
    },
    { label: "Usuarios", path: "/admin/usuarios" },
];

function SubMenu({ item }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { label, path, children } = item;
    const [open, setOpen] = useState(
        location.pathname.startsWith(path)
    );

    if (!children) {
        return (
            <li className="nav-item">
                <NavLink
                    to={path}
                    end={path === "/admin"}
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "fw-bold active text-black" : "text-black"}`
                    }
                >
                    {label}
                </NavLink>
            </li>
        );
    }

    const handleClick = (e) => {
        e.preventDefault();
        setOpen((prev) => !prev);
        if (!open) navigate(path);
    };

    return (
        <li className="nav-item">
            <a href={path} onClick={handleClick} className="nav-link text-black">
                <i
                    className={`bi bi-chevron-${open ? "down" : "right"} me-2`}
                />
                {label}
            </a>
            {open && (
                <ul className="nav flex-column ps-3">
                    {children.map((child) => (
                        <li className="nav-item" key={child.path}>
                            <NavLink
                                to={child.path}
                                end
                                className={({ isActive }) =>
                                    `nav-link py-0 ${isActive ? "fw-bold active text-black" : "text-secondary"}`
                                }
                            >
                                {child.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}

export function AdminSidebar() {
    return (
        <nav className="col-md-3 col-lg-2 d-md-block pt-5 collapse text-end border-end align-items-center">
            <div className="position-sticky pt-3">
                <h6 className="text-black text-uppercase px-3 mb-2">
                    Administración
                </h6>
                <ul className="nav flex-column">
                    {ADMIN_MENU_ITEMS.map((item) => (
                        <SubMenu key={item.path} item={item} />
                    ))}
                </ul>
            </div>
        </nav>
    );
}