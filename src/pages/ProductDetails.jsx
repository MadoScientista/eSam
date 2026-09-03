import { useParams } from "react-router-dom"
import { ProductList } from "../components/ProductList"
import { useEffect, useState } from "react"
import { obtenerProductos, obtenerProductoSku } from "../services/productoService"
import { useCart } from "../context/CartContext"

export function ProductDetails(){
    
    const { sku } = useParams()

    const [product, setProduct] = useState([])
    const [products, setProducts] = useState([])

    const { addProduct } = useCart()


    useEffect(()=>{
        window.scrollTo(0,0)

        const cargarProducto = async (sku) =>{
            try{
                const data = await obtenerProductoSku(sku)
                setProduct(data)
            }catch(error){
                console.error("Error al cargar producto", error)
            }
        }

        cargarProducto(sku)
    },[sku])
    

    useEffect(()=>{
 
        const cargarProductos = async () =>{
            try{
                const data = await obtenerProductos()
                setProducts(data)
            }catch(error){
                console.error("Error al cargar producto", error)
            }
        }

        cargarProductos()
    },[])

    return (
    <div className="container mt-5">
        <div className="row mb-4">
            <div className="col border me-5" style={{maxWidth:'35rem', padding:'2rem'}}>
                <img src={product.img} alt="" style={{maxWidth:'30rem', padding:'2rem'}} className="figure-img img-fluid rounded"/>
            </div>
            <div className="col pt-5" style={{maxWidth:'30rem'}}>
                <div className="h3">{product.nombre}</div>
                <p>{product.descripcion}</p>
                <p>${product.precio}</p>
                <p>Quedan: {product.stock}</p>
                <button className="btn btn-dark" onClick={() => addProduct(product)}>
                    <i className="bi bi-cart"></i> Añadir
                </button>
            </div>
        </div>
        <div className="container">
            <h3 className="mb-4">Productos relacionados</h3>
            <ProductList products={products.slice(0,4)} cols={4}/>
        </div>
    </div>
    )
}