import { useState } from "react"
import { ProductCardH } from "../components/ProductCardH"
import { ProductList } from "../components/ProductList"
import { cartProducts } from "../const/cartProducts"
import { products } from "../const/products"

export function Cart(){

    const [nProductos, setNProductos] = useState(calcularNProductos())
    const [subtotal, setSubTotal] = useState(calcularTotal())

    function calcularTotal(){
        let t = 0

        for(let i=0; i < cartProducts.length; i++){
            t += (cartProducts[i]["precio"]*cartProducts[i]["cantidad"])
        }

        return t
    }

    function calcularNProductos(){
        let n = 0

        for(let i=0; i < cartProducts.length; i++){
            n += cartProducts[i]["cantidad"]
        }

        return n
    }


    return (
        <div className="container pt-5">
            <div className="container mb-5" style={{minHeight:"60vh"}}>
                <h2 className="mb-5">Carrito de compras</h2>
                <div className="row">
                    <div className="col border-end me-5">
                        {cartProducts.map((p)=>{
                            return <div className="row"><ProductCardH product={p}/></div>
                        })}
                    </div>
                    <div className="col">
                        <h3>Resumen</h3>
                        <hr />
                        <p>Productos en el carro: {nProductos}</p>
                        {
                            cartProducts.map((p)=>{
                                return <p>{p.cantidad} x {p.nombre}</p>
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