import { useParams } from "react-router-dom"
import { ProductCarousel } from "../components/ProductCarousel"
import { useEffect, useState } from "react"
import { obtenerProductos, obtenerProductoPorId } from "../services/productoService"
import { useCart } from "../context/cartContext"
import { Toast } from "../components/Toast"
import { formatearPrecio } from "../utils/moneda"
import { imagenPrincipalProducto } from "../utils/producto"

export function ProductDetails(){

    const { idProducto } = useParams()

    const [product, setProduct] = useState(null)
    const [products, setProducts] = useState([])
    const [toastTrigger, setToastTrigger] = useState(0)

    const { addProduct } = useCart()


    useEffect(()=>{
        window.scrollTo(0,0)

        const cargarProducto = async ()=>{
            try{
                const data = await obtenerProductoPorId(idProducto)
                setProduct(data)
            }catch(error){
                console.error("Error al cargar producto", error)
            }
        }

        cargarProducto()
    },[idProducto])


    useEffect(()=>{

        const cargarProductos = async ()=>{
            try{
                const data = await obtenerProductos()
                setProducts(data)
            }catch(error){
                console.error("Error al cargar producto", error)
            }
        }

        cargarProductos()
    },[])

    const handleClick = () => {
        addProduct(product)
        setToastTrigger(t => t + 1)
    }

    const imagen = imagenPrincipalProducto(product)

    return (
    <div className="container mt-5">
        <div className="row mb-4">
            <div className="col border me-5" style={{maxWidth:'35rem', padding:'2rem'}}>
                {
                    imagen
                    ? <img src={imagen} alt={product?.nombre ?? ""} style={{maxWidth:'30rem', maxHeight:"30rem", padding:'2rem'}} className="figure-img img-fluid rounded"/>
                    : <i className="bi bi-image fs-1 text-secondary"></i>
                }
            </div>
            <div className="col pt-5" style={{maxWidth:'30rem'}}>
                <div className="h3">{product?.nombre}</div>
                <p>{product?.descripcion}</p>
                <p>{product ? formatearPrecio(product.precio) : ""}</p>
                <p>Quedan: {product?.stock}</p>
                <button className="btn btn-dark" onClick={handleClick} disabled={!product}>
                    <i className="bi bi-cart"></i> Añadir
                </button>
            </div>
        </div>
        <div className="container">
            <h3 className="mb-4">Productos relacionados</h3>
            <ProductCarousel products={products.slice(5,12)}/>
        </div>
        <Toast trigger={toastTrigger} message={`${product?.nombre ?? ""} agregado al carrito.`} />
    </div>
    )
}