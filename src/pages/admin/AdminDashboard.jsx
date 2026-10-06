import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { nombreRol, tieneRol, useAuth } from "../../context/authContext";
import { obtenerPedidosAdmin } from "../../services/pedidoService";
import { obtenerProductos } from "../../services/productoService";
import { obtenerUsuarios } from "../../services/usuarioService";
import { AlertMessage } from "../../components/AlertMessage";

const ACCESS_CARDS = [
    {
        title: "Órdenes",
        description: "Revisa las compras y su estado.",
        path: "/admin/ordenes",
        icon: "bi-bag",
        color: "violet",
    },
    {
        title: "Productos",
        description: "Administra el catálogo y el inventario.",
        path: "/admin/productos",
        icon: "bi-box-seam",
        color: "blue",
    },
    {
        title: "Categorías",
        description: "Organiza las categorías de la tienda.",
        path: "/admin/categorias",
        icon: "bi-tags",
        color: "orange",
    },
    {
        title: "Usuarios",
        description: "Gestiona clientes, vendedores y admins.",
        path: "/admin/usuarios",
        icon: "bi-people",
        color: "green",
    },
];

function contarRoles(usuarios) {
    return usuarios.reduce(
        (conteo, usuario) => {
            const rol = nombreRol(usuario)?.toLowerCase();
            if (rol === "cliente") conteo.clientes += 1;
            if (rol === "vendedor") conteo.vendedores += 1;
            if (rol === "admin") conteo.administradores += 1;
            return conteo;
        },
        { clientes: 0, vendedores: 0, administradores: 0 }
    );
}

export function AdminDashboard() {
    const { usuario } = useAuth();
    const esAdmin = tieneRol(usuario, "admin");
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;

        const cargarResumen = async () => {
            try {
                const [ordenes, productos, usuarios] = await Promise.all([
                    obtenerPedidosAdmin(),
                    obtenerProductos(),
                    esAdmin ? obtenerUsuarios() : Promise.resolve(null),
                ]);

                if (!Array.isArray(ordenes) || !Array.isArray(productos) || (esAdmin && !Array.isArray(usuarios))) {
                    throw new Error("El servidor devolvió un formato de datos inesperado.");
                }

                if (activo) {
                    setResumen({
                        ordenes: ordenes.length,
                        productosConStock: productos.filter((producto) => Number(producto.stock) > 0).length,
                        productosTotales: productos.length,
                        ...(esAdmin ? { usuarios: contarRoles(usuarios) } : {}),
                    });
                }
            } catch (errorCarga) {
                console.error("Error al cargar el resumen de administración", errorCarga);
                if (activo) {
                    setError(errorCarga?.message || "No se pudo cargar el resumen del panel.");
                }
            } finally {
                if (activo) setCargando(false);
            }
        };

        cargarResumen();
        return () => { activo = false; };
    }, [esAdmin]);

    return (
        <div className="admin-page">
            <header className="admin-page-header">
                <div>
                    <span className="admin-eyebrow">{esAdmin ? "RESUMEN GENERAL" : "RESUMEN DE VENTAS"}</span>
                    <h1>Dashboard</h1>
                    <p>Un vistazo rápido a la actividad de tu tienda.</p>
                </div>
                <div className="admin-date-chip">
                    <i className="bi bi-calendar3" aria-hidden="true" />
                    {esAdmin ? "Panel de administración" : "Panel de vendedor"}
                </div>
            </header>

            {error && <AlertMessage type="danger" message={error} />}

            <section className="admin-stats-grid" aria-label="Indicadores generales">
                <article className="admin-stat-card">
                    <div className="admin-stat-top">
                        <span className="admin-stat-icon violet"><i className="bi bi-bag-check" /></span>
                        <span className="admin-stat-caption">TOTAL ACUMULADO</span>
                    </div>
                    <p className="admin-stat-title">Compras</p>
                    <p className="admin-stat-value">{cargando || error ? "—" : resumen?.ordenes ?? 0}</p>
                    <p className="admin-stat-footnote">{error ? "No se pudieron cargar las compras" : "Compras realizadas en la plataforma"}</p>
                </article>

                <article className="admin-stat-card">
                    <div className="admin-stat-top">
                        <span className="admin-stat-icon blue"><i className="bi bi-box-seam" /></span>
                        <span className="admin-stat-caption">INVENTARIO</span>
                    </div>
                    <p className="admin-stat-title">Productos</p>
                    <p className="admin-stat-value">
                        {cargando || error ? "—" : resumen?.productosConStock ?? 0}
                        <span className="admin-stat-total"> / {cargando || error ? "—" : resumen?.productosTotales ?? 0}</span>
                    </p>
                    <p className="admin-stat-footnote">{error ? "No se pudo cargar el inventario" : "Con stock disponible / productos totales"}</p>
                </article>

                {esAdmin && <article className="admin-stat-card">
                    <div className="admin-stat-top">
                        <span className="admin-stat-icon green"><i className="bi bi-people" /></span>
                        <span className="admin-stat-caption">COMUNIDAD</span>
                    </div>
                    <p className="admin-stat-title">Usuarios</p>
                    <p className="admin-stat-value">{cargando || error ? "—" : resumen
                        ? resumen.usuarios.clientes + resumen.usuarios.vendedores + resumen.usuarios.administradores
                        : 0}</p>
                    <p className="admin-stat-footnote">
                        {error ? "No se pudo cargar la distribución" : cargando ? "Cargando distribución..." : resumen
                            ? `${resumen.usuarios.clientes} clientes · ${resumen.usuarios.vendedores} vendedores · ${resumen.usuarios.administradores} administradores`
                            : "Clientes, vendedores y administradores"}
                    </p>
                </article>}
            </section>

            <section className="admin-section">
                <div className="admin-section-heading">
                    <div>
                        <span className="admin-eyebrow">GESTIÓN</span>
                        <h2>Accesos rápidos</h2>
                    </div>
                    <span className="admin-section-hint">Elige una sección para comenzar</span>
                </div>
                <div className="admin-access-grid">
                    {ACCESS_CARDS.filter((card) => esAdmin || card.title !== "Usuarios").map((card) => (
                        <Link className="admin-access-card" to={card.path} key={card.path}>
                            <span className={`admin-access-icon ${card.color}`}>
                                <i className={`bi ${card.icon}`} aria-hidden="true" />
                            </span>
                            <span className="admin-access-copy">
                                <strong>{card.title}</strong>
                                <small>
                                    {!esAdmin && card.title === "Productos"
                                        ? "Consulta el catálogo y el inventario."
                                        : !esAdmin && card.title === "Categorías"
                                            ? "Consulta las categorías disponibles."
                                            : card.description}
                                </small>
                            </span>
                            <i className="bi bi-arrow-up-right admin-access-arrow" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
