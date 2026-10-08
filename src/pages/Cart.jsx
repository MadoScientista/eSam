import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ProductCardH } from "../components/ProductCardH"
import { ProductCarousel } from "../components/ProductCarousel"
import { useCart } from "../context/cartContext"
import { obtenerProductos } from "../services/productoService"
import { formatearPrecio } from "../utils/moneda"
import { categoriaMasPresente, productosRecomendados, stockDisponible } from "../utils/producto"
import { useAuth, tieneRol } from "../context/authContext"
import { AlertMessage } from "../components/AlertMessage"

export function Cart(){

    const { cart, increaseUnits, decreaseUnits, removeProduct } = useCart()
    const { estaAutenticado, usuario } = useAuth()
    const navigate = useNavigate()
    const [products, setProducts ] = useState([])
    const [mensaje, setMensaje] = useState(null)

    
    useEffect(()=>{
        const cargarProductos = async () => {
            try{
                const data = await obtenerProductos()
                setProducts(data)
            }catch(error){
                console.error("Error al cargar productos", error)
            }
        }
        cargarProductos()
        }
    ,[])


    let nProducts = 0
    let subtotal = 0

    cart.forEach((item)=>{
        nProducts += item.units
        subtotal += (item.units * item.product.precio)
    })

    // Los relacionados seguided desde la categoría que más se repite en el carrito.
    // Los productos que ya están en el carrito quedan excluidos y, si no llenan la
    // fila, el resto se completa con los primeros del catálogo (los destacados).
    const relacionados = useMemo(()=>{
        const enCarrito = cart.map((item)=>item.product)

        if(enCarrito.length === 0) return []

        const idCategoria = categoriaMasPresente(enCarrito)
        const idsExcluidos = enCarrito.map((p)=>p.idProducto)

        return productosRecomendados(products, idCategoria != null ? [idCategoria] : [], idsExcluidos)
    },[cart, products])

    const iniciarCheckout = () => {
        setMensaje(null)
        if (!cart.length) {
            setMensaje({ type: "warning", message: "Agrega productos al carrito antes de continuar." })
            return
        }
        if (estaAutenticado && !tieneRol(usuario, "cliente")) {
            setMensaje({ type: "warning", message: "Inicia sesión con una cuenta de cliente para finalizar la compra." })
            return
        }
        if (!estaAutenticado) {
            setMensaje({ type: "warning", message: "Inicia sesión o regístrate para continuar con la compra." })
            navigate("/login", { state: { from: { pathname: "/usuario/checkout" } } })
            return
        }
        navigate("/usuario/checkout")
    }


    return (
        <div className="container pt-5">
            <div className="container mb-5" style={{minHeight:"60vh"}}>
                <h2 className="mb-5">Carrito de compras</h2>
                <div className="row">
                    <div className="col border-end me-5">
                        {cart.map((item)=>{
                            return (
                                <div className="row" key={item.product.idProducto}>
                                    <ProductCardH 
                                        item={item}
                                        handleClickPlus={()=>{increaseUnits(item.product.idProducto)}}
                                        handleClicklMinus={()=>{decreaseUnits(item.product.idProducto)}}
                                        handleTrash={()=>{removeProduct(item.product.idProducto)}}
                                    />
                                    {item.units > stockDisponible(item.product) &&
                                        <p className="text-danger">La cantidad supera el stock disponible actualizado.</p>
                                    }
                                </div>)
                        })}
                    </div>
                    <div className="col">
                        <h3>Resumen</h3>
                        <hr />
                        <p>Productos en el carro: {nProducts}</p>
                        {
                            cart.map((item)=>{
                                return <p key={item.product.idProducto}>
                                            {item.units} x {item.product.nombre}
                                        </p>
                            })
                        }
                        <hr />
                        <p>Sub total: {formatearPrecio(subtotal)}</p>
                        <AlertMessage type={mensaje?.type} message={mensaje?.message} />
                        <button className="btn btn-dark" onClick={iniciarCheckout} disabled={cart.length === 0}>
                            Pagar
                        </button>
                    </div>
                </div>
            </div>
            {
                relacionados.length > 0
                && <>
                    <h3 className="mb-5">Productos relacionados</h3>
                    <div className="container mb-5">
                        <ProductCarousel products={relacionados}/>
                    </div>
                </>
            }
        </div>
    )
}