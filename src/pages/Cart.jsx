import { useEffect, useState } from "react"
import { ProductCardH } from "../components/ProductCardH"
import { ProductList } from "../components/ProductList"
import { useCart } from "../context/CartContext"
import { obtenerProductos } from "../services/productoService"

export function Cart(){

    const { cart, addProduct, increaseUnits, decreaseUnits, removeProduct } = useCart()
    const [products, setProducts ] = useState([])

    
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


    return (
        <div className="container pt-5">
            <div className="container mb-5" style={{minHeight:"60vh"}}>
                <h2 className="mb-5">Carrito de compras</h2>
                <div className="row">
                    <div className="col border-end me-5">
                        {cart.map((item)=>{
                            return (
                                <div className="row" key={item.product.sku}>
                                    <ProductCardH 
                                        item={item}
                                        handleClickPlus={()=>{increaseUnits(item.product.sku)}}
                                        handleClicklMinus={()=>{decreaseUnits(item.product.sku)}}
                                        handleTrash={()=>{removeProduct(item.product.sku)}}
                                    />
                                </div>)
                        })}
                    </div>
                    <div className="col">
                        <h3>Resumen</h3>
                        <hr />
                        <p>Productos en el carro: {nProducts}</p>
                        {
                            cart.map((item)=>{
                                return <p key={item.product.sku}>
                                            {item.units} x {item.product.nombre}
                                        </p>
                            })
                        }
                        <hr />
                        <p>Sub total: ${subtotal}</p>
                        <button className="btn btn-dark">Pagar</button>
                    </div>
                </div>
            </div>
            <h3 className="mb-5">Productos relacionados</h3>
            <div className="container p-0">
                <ProductList products={products.slice(0,5)} cols={5}/>
            </div>
        </div>
    )
}