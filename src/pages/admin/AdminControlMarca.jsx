import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MarcasTable } from "../../components/MarcasTable"
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
            <h2 className="mb-4 mt-3 text-center">Administración Marcas</h2>

            <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
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
                {esAdmin && (
                    <button className="btn btn-dark" onClick={() => { navigate("nuevo") }}>
                        Nueva marca
                    </button>
                )}
            </div>

            <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
            <MarcasTable
                marcas={filtradas}
                handleClick={handleClick}
                editable={esAdmin}
            />
        </>
    )
}
