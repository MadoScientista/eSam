import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CategoriasTable } from "../../components/CategoriasTable"
import { TableCard } from "../../components/TableCard"
import { AlertMessage } from "../../components/AlertMessage"
import { obtenerCategorias } from "../../services/categoriaService"
import { useAuth, tieneRol } from "../../context/authContext"

export function AdminControlCategoria() {
    const navigate = useNavigate()
    const { usuario } = useAuth()
    const esAdmin = tieneRol(usuario, "admin")
    const [categorias, setCategorias] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const data = await obtenerCategorias()
                setCategorias(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Error al cargar categorías", error)
                setMensajeAlerta({ type: "danger", message: error?.message || "No se pudieron cargar las categorías." })
            }
        }

        cargarCategorias()
    }, [])

    const handleClick = (idCategoria) => {
        navigate(`${idCategoria}`)
    }

    const filtradas = categorias.filter((c) =>
        c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(c.idCategoria).includes(busqueda)
    )

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                <h2 className="mb-0">Administración Categorías</h2>
                {esAdmin && (
                    <button className="btn btn-dark" onClick={() => { navigate("nuevo") }}>
                        Nueva categoría
                    </button>
                )}
            </div>

            <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
            <TableCard
                title="Todas las categorías"
                subtitle="Listado de categorías de la tienda"
                toolbar={
                    <div className="input-group" style={{ maxWidth: "25rem" }}>
                        <span className="input-group-text border-black"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control border-black"
                            placeholder="Buscar por nombre o ID"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                }
            >
                <CategoriasTable
                    categorias={filtradas}
                    todas={categorias}
                    handleClick={handleClick}
                    editable={esAdmin}
                />
            </TableCard>
        </>
    )
}