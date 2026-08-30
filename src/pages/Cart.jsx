import { useState } from "react"
import { ProductCardH } from "../components/ProductCardH"
import { cartProducts } from "../const/cartProducts"

export function Cart(){

    const [nProductos, setNProductos] = useState(calcularNProductos())
    const [subtotal, setSubTotal] = useState(calcularTotal())

    function calcularTotal(){
        const t = 0

        for(let i=0; i < cartProducts.length; i++){
            t += (cartProducts[i]["precio"]*cartProducts[i]["cantidad"])
        }

        return t
    }

    function calcularNProductos(){
        const n = 0

        for(let i=0; i < cartProducts.length; i++){
            n += cartProducts[i]["cantidad"]
        }

        return n
    }


    return (
        <div className="container pt-5">
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
    )
}