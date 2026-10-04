import { useEffect, useState } from "react"
import {obtenerProductos} from "../../services/productoService"
import { ProductTable } from "../../components/ProductTable"
import { AlertMessage } from "../../components/AlertMessage"
import { useNavigate } from "react-router-dom"


export function AdminControlProduct(){
    
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    useEffect(() => {
        const cargarProductos = async () =>{
            try{
                const data = await obtenerProductos();
                setProducts(data)
            }catch(error){
                console.error("Error al cargar productos", error)
                setMensajeAlerta({ type: "danger", message: error?.message || "No se pudieron cargar los productos." })
            }
        }

        cargarProductos()
    }, [])
        
    const handleClick = (idProducto) =>{
        navigate(`${idProducto}`)
    }

    const productosFiltrados = products.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(p.sku).toLowerCase().includes(busqueda.toLowerCase()) ||
        String(p.idProducto).includes(busqueda)
    )

    return(
        <>
            <h2 className="mb-5 mt-3 text-center">Administración Productos</h2>
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
                <button 
                    className="btn btn-dark"
                    onClick={()=>{navigate("nuevo")}}
                >   
                    Nuevo producto
                </button>
            </div>
            <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
            <ProductTable products={productosFiltrados} handleClick={handleClick}/>
        </>
    )
}