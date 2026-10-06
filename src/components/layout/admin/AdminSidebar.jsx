import { NavLink, useNavigate } from "react-router-dom";
import { tieneRol, useAuth } from "../../../context/authContext";

export function AdminSidebar() {
    const { logout, usuario } = useAuth();
    const navigate = useNavigate();
    const esVendedor = tieneRol(usuario, "vendedor");
    const menuItems = [
        { label: "Dashboard", path: "/admin", icon: "bi-grid-1x2" },
        { label: "Órdenes", path: "/admin/ordenes", icon: "bi-bag" },
        { label: "Productos", path: "/admin/productos", icon: "bi-box-seam" },
        { label: "Categorías", path: "/admin/categorias", icon: "bi-tags" },
        ...(!esVendedor ? [{ label: "Usuarios", path: "/admin/usuarios", icon: "bi-people" }] : []),
    ];

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const nombre = [usuario?.nombres, usuario?.aPaterno].filter(Boolean).join(" ");

    return (
        <aside className="admin-sidebar">
            <NavLink to="/admin" className="admin-brand">
                <span className="admin-brand-mark"><i className="bi bi-bag-heart-fill" /></span>
                <span>eSam <small>{esVendedor ? "VENDEDOR" : "ADMIN"}</small></span>
            </NavLink>

            <div className="admin-sidebar-label">MENÚ PRINCIPAL</div>
            <nav aria-label="Navegación de administración">
                <ul className="admin-nav-list">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.path === "/admin"}
                                className={({ isActive }) =>
                                    `admin-nav-link${isActive ? " is-active" : ""}`
                                }
                            >
                                <i className={`bi ${item.icon}`} aria-hidden="true" />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                    <li>
                        <span className="admin-nav-link is-disabled" aria-disabled="true">
                            <i className="bi bi-bar-chart-line" aria-hidden="true" />
                            <span>Reportes</span>
                            <span className="admin-coming-soon">Próximamente</span>
                        </span>
                    </li>
                    <li>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `admin-nav-link${isActive ? " is-active" : ""}`
                            }
                        >
                            <i className="bi bi-arrow-left-circle" aria-hidden="true" />
                            <span>Volver a la tienda</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className="admin-sidebar-divider" />
            <div className="admin-sidebar-bottom">
                {nombre && (
                    <div className="admin-account">
                        <span className="admin-avatar">{nombre.charAt(0).toUpperCase()}</span>
                        <span className="admin-account-copy">
                            <strong>{nombre}</strong>
                            <small>{esVendedor ? "Vendedor" : "Administrador"}</small>
                        </span>
                    </div>
                )}
                <NavLink
                    to="/admin/perfil"
                    className={({ isActive }) =>
                        `admin-nav-link${isActive ? " is-active" : ""}`
                    }
                >
                    <i className="bi bi-person-circle" aria-hidden="true" />
                    <span>Perfil</span>
                </NavLink>
                <div className="admin-sidebar-divider" />
                <button type="button" className="admin-logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-left" aria-hidden="true" />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
}
