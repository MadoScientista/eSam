import { useParams } from "react-router-dom"
import { ProductCarousel } from "../components/ProductCarousel"
import { useEffect, useMemo, useState } from "react"
import { obtenerProductos, obtenerProductoPorId } from "../services/productoService"
import { useCart } from "../context/cartContext"
import { Toast } from "../components/Toast"
import { formatearPrecio } from "../utils/moneda"
import { imagenPrincipalProducto, productosRecomendados, stockDisponible } from "../utils/producto"

export function ProductDetails(){

    const { idProducto } = useParams()

    const [product, setProduct] = useState(null)
    const [products, setProducts] = useState([])
    const [toastTrigger, setToastTrigger] = useState(0)
    const [cantidad, setCantidad] = useState(1)

    const { cart, addProduct } = useCart()


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
        addProduct(product, cantidad)
        setToastTrigger(t => t + 1)
        setCantidad(1)
    }

    // Los relacionados salen de la categoría del producto que se está viendo. Si no
    // llenan la fila, el resto se completa con los primeros del catálogo, que son
    // los mismos destacados que muestra el home. El producto actual queda fuera y
    // ningún producto se repite.
    const relacionados = useMemo(() => {
        if(!product) return []

        const idsCategoria = (product.categorias ?? []).map((c) => c.idCategoria)

        return productosRecomendados(products, idsCategoria, [product.idProducto])
    },[product, products])

    const imagen = imagenPrincipalProducto(product)
    const disponible = stockDisponible(product)
    const unidadesEnCarrito = cart.find((item) => item.product.idProducto === product?.idProducto)?.units ?? 0
    const maxAgregar = Math.max(0, disponible - unidadesEnCarrito)
    const sinStock = !product || maxAgregar <= 0

    // La cantidad elegida nunca puede superar las unidades que aún se pueden
    // agregar: el stock disponible menos lo que ya está en el carrito.
    const manejarCantidad = (valor) => {
        const numero = Math.floor(Number(valor))

        if (!Number.isFinite(numero)) {
            setCantidad(1)
            return
        }

        setCantidad(Math.min(Math.max(1, numero), Math.max(1, maxAgregar)))
    }

    return (
    <div className="container esam-page">
        <div className="row g-5 align-items-start">
            <div className="col-lg-6">
                <div className="esam-detail-media">
                    {
                        imagen
                        ? <img src={imagen} alt={product?.nombre ?? ""} className="esam-detail-img"/>
                        : <i className="bi bi-image fs-1 text-secondary"></i>
                    }
                </div>
            </div>
            <div className="col-lg-6">
                <h1 className="esam-detail-title">{product?.nombre}</h1>
                <p className="esam-detail-desc">{product?.descripcion}</p>
                <p className="esam-detail-price">{product ? formatearPrecio(product.precio) : ""}</p>
                <p className="esam-detail-stock">
                    <i className="bi bi-box-seam me-1" aria-hidden="true"></i>
                    Quedan: {product ? disponible : "—"} un
                </p>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <label htmlFor="cantidadProducto" className="form-label mb-0">Cantidad</label>
                    <div className="input-group" style={{maxWidth:'9rem'}}>
                        <button
                            type="button"
                            className="btn btn-outline-dark"
                            onClick={() => manejarCantidad(cantidad - 1)}
                            disabled={sinStock || cantidad <= 1}
                            aria-label="Disminuir cantidad"
                        >
                            −
                        </button>
                        <input
                            id="cantidadProducto"
                            type="number"
                            className="form-control text-center"
                            value={cantidad}
                            min="1"
                            max={Math.max(1, maxAgregar)}
                            onChange={(evento) => manejarCantidad(evento.target.value)}
                            disabled={sinStock}
                        />
                        <button
                            type="button"
                            className="btn btn-outline-dark"
                            onClick={() => manejarCantidad(cantidad + 1)}
                            disabled={sinStock || cantidad >= maxAgregar}
                            aria-label="Aumentar cantidad"
                        >
                            +
                        </button>
                    </div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleClick} disabled={sinStock}>
                    <i className="bi bi-cart me-2" aria-hidden="true"></i>
                    Añadir
                </button>
            </div>
        </div>
        <div className="container p-0 mt-5 mb-5">
            <h3 className="mb-4">Productos relacionados</h3>
            {
                relacionados.length > 0
                ? <ProductCarousel products={relacionados}/>
                : <p className="text-secondary">No hay otros productos relacionados por ahora.</p>
            }
        </div>
        <Toast trigger={toastTrigger} message={`${product?.nombre ?? ""} agregado al carrito.`} />
    </div>
    )
}