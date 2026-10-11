import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MarcasTable } from "../../components/MarcasTable"
import { TableCard } from "../../components/TableCard"
import { AlertMessage } from "../../components/AlertMessage"
import { obtenerMarcas } from "../../services/marcaService"
import { useAuth, tieneRol } from "../../context/authContext"

export function AdminControlMarca() {
    const navigate = useNavigate()
    const { usuario } = useAuth()
    const esAdmin = tieneRol(usuario, "admin")
    const [marcas, setMarcas] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    useEffect(() => {
        const cargarMarcas = async () => {
            try {
                const data = await obtenerMarcas()
                setMarcas(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Error al cargar marcas", error)
                setMensajeAlerta({ type: "danger", message: error?.message || "No se pudieron cargar las marcas." })
            }
        }

        cargarMarcas()
    }, [])

    const handleClick = (idMarca) => {
        navigate(`${idMarca}`)
    }

    const filtradas = marcas.filter((m) =>
        m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(m.idMarca).includes(busqueda)
    )

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                <h2 className="mb-0">Administración Marcas</h2>
                {esAdmin && (
                    <button className="btn btn-dark" onClick={() => { navigate("nuevo") }}>
                        Nueva marca
                    </button>
                )}
            </div>

            <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
            <TableCard
                title="Todas las marcas"
                subtitle="Listado de marcas de la tienda"
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
                <MarcasTable
                    marcas={filtradas}
                    handleClick={handleClick}
                    editable={esAdmin}
                />
            </TableCard>
        </>
    )
}
