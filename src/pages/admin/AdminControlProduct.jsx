import { useEffect, useState } from "react"
import {obtenerProductos} from "../../services/productoService"
import { ProductTable } from "../../components/ProductTable"
import { useNavigate } from "react-router-dom"


export function AdminControlProduct(){
    
    const navigate = useNavigate()
    const [products, setProducts] = useState([])

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

    return(
        <>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2 className="mb-0">Administración Productos</h2>
                <button 
                    className="btn btn-dark"
                    onClick={()=>{navigate("nuevo")}}
                >   
                    Nuevo producto
                </button>
            </div>
            <ProductTable products={products} handleClick={handleClick}/>
        </>
    )
}