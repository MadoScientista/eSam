import { Children, createContext, useContext, useEffect, useState } from "react";


const CartContext = createContext()

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
    const addProduct = (p) =>{
        setCart((currentCart)=>{
            const productFound = currentCart.find((item)=>{
                return item.product.sku == p.sku
            })

            if(productFound){
              return currentCart.map((item)=>{
                return item.product.sku == p.sku ? {...item, units: item.units + 1}: item
              })  
            }
            
            return [...currentCart, 
                {
                    product: p,
                    units: 1
                }]
        })
    }

    // Aumentar cantidad
    const increaseUnits = (sku) => {
        setCart((currentCart) => {
            return currentCart.map((item)=>{
                return item.product.sku == sku? {...item, units: item.units + 1}:item
            })
        })
    }

    // Disminuir cantidad hasta un mínimo de 1
    // Para llegar a 0 se debe eliminar el producto
    const decreaseUnits = (sku) =>{
        setCart((currentCart) => {
            return currentCart.map((item) => {
                if(item.product.sku === sku && item.units > 1){
                    return {...item, units: item.units - 1}
                }else{
                    return item
                }
            })
        })
    }

    // Eliminar producto
    const removeProduct = (sku) => {
        setCart((currentCart) => {
            return currentCart.filter((item) => {
                return item.product.sku != sku
            })
        })
    }

    return (
        <CartContext.Provider 
            value={{
                cart,
                addProduct, 
                increaseUnits, 
                decreaseUnits, 
                removeProduct
            }}
        >
            {children}
        </CartContext.Provider>
    )
}


export function useCart(){
    return useContext(CartContext)
}