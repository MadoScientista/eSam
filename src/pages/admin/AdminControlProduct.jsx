import { useEffect, useState } from "react"
import {obtenerProductos} from "../../services/productoService"
import { ProductTable } from "../../components/ProductTable"
import { useNavigate } from "react-router-dom"


export function AdminControlProduct(){
    
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [busqueda, setBusqueda] = useState("")

    useEffect(() => {
        const cargarProductos = async () =>{
            try{
                const data = await obtenerProductos();
                setProducts(data)
            }catch(error){
                console.error("Error al cargar productos", error)
            }
        }

        cargarProductos()
    }, [])
        
    const handleClick = (sku) =>{
        navigate(`${sku}`)
    }

    const productosFiltrados = products.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toString().toLowerCase().includes(busqueda.toLowerCase())
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
            <ProductTable products={productosFiltrados} handleClick={handleClick}/>
        </>
    )
}