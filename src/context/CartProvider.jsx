import { useEffect, useState } from "react";
import { CartContext } from "./cartContext";
import { stockDisponible } from "../utils/producto";

export function CartProvider({children}){

    // Carrito
    const [cart, setCart] = useState(()=>{
        const savedCart = localStorage.getItem("eSamCart")

        return savedCart ? JSON.parse(savedCart):[]
    })


    // Guardar cambios en el carrito en localStorage
    useEffect(()=>{
        localStorage.setItem("eSamCart", JSON.stringify(cart))
    },[cart])

    // Agregar producto
    const addProduct = (p, n = 1) =>{
        setCart((currentCart)=>{
            const productFound = currentCart.find((item)=>{
                return item.product.idProducto == p.idProducto
            })

            const disponible = stockDisponible(p)
            const unidadesActuales = productFound?.units ?? 0
            const unidadesAgregar = Math.min(Math.max(0, n), disponible - unidadesActuales)

            if (unidadesAgregar <= 0) return currentCart

            if(productFound){
              return currentCart.map((item)=>{
                return item.product.idProducto == p.idProducto
                    ? {...item, product: p, units: item.units + unidadesAgregar}
                    : item
              })  
            }
            
            return [...currentCart, 
                {
                    product: p,
                    units: unidadesAgregar
                }]
        })
    }

    // Aumentar cantidad
    const increaseUnits = (idProducto) => {
        setCart((currentCart) => {
            return currentCart.map((item)=>{
                const disponible = stockDisponible(item.product)
                return item.product.idProducto == idProducto && item.units < disponible
                    ? {...item, units: item.units + 1}
                    : item
            })
        })
    }

    // Disminuir cantidad hasta un mínimo de 1
    // Para llegar a 0 se debe eliminar el producto
    const decreaseUnits = (idProducto) =>{
        setCart((currentCart) => {
            return currentCart.map((item) => {
                if(item.product.idProducto === idProducto && item.units > 1){
                    return {...item, units: item.units - 1}
                }else{
                    return item
                }
            })
        })
    }

    // Eliminar producto
    const removeProduct = (idProducto) => {
        setCart((currentCart) => {
            return currentCart.filter((item) => {
                return item.product.idProducto != idProducto
            })
        })
    }

    const clearCart = () => setCart([])

    return (
        <CartContext.Provider 
            value={{
                cart,
                addProduct, 
                increaseUnits, 
                decreaseUnits, 
                removeProduct,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    )
}