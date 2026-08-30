import { useParams } from "react-router-dom"
import { ProductList } from "../components/ProductList"
import { products } from "../const/products"
import { useEffect } from "react"

export function ProductDetails(){
    
    const { sku } = useParams()

    useEffect(()=>{
        window.scrollTo(0,0)
    },[sku])
    
    const product = products.find((p)=> p.sku === sku)

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
                <button className="btn btn-dark"><i class="bi bi-cart"></i> Añadir</button>
            </div>
        </div>
        <div className="container">
            <h3 className="mb-4">Productos relacionados</h3>
            <ProductList products={products.slice(0,4)} cols={4}/>
        </div>
    </div>
    )
}