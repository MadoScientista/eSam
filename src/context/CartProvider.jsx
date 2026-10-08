import { useEffect, useRef, useState } from "react";
import { CartContext } from "./cartContext";
import { useAuth, tieneRol } from "./authContext";
import { stockDisponible } from "../utils/producto";
import {
    agregarItemCarrito,
    actualizarCantidadItem,
    eliminarItemCarrito,
    obtenerCarrito,
    vaciarCarrito
} from "../services/carritoService";

export function CartProvider({children}){

    // El carrito de un cliente autenticado se replica en el backend con cada
    // alta, cambio de cantidad y eliminación; el localStorage sigue siendo la
    // vista local y, en el checkout, se fusiona con el persistido.
    const auth = useAuth() ?? {}
    const puedePersistir = Boolean(auth.estaAutenticado && tieneRol(auth.usuario, "cliente"))

    // Carrito
    const [cart, setCart] = useState(()=>{
        const savedCart = localStorage.getItem("eSamCart")

        return savedCart ? JSON.parse(savedCart):[]
    })

    // Ref con el carrito más reciente: los cambios se calculan sobre este
    // valor para no perder actualizaciones pendientes de render y para poder
    // encolar la sincronización con la cantidad resultante.
    const cartRef = useRef(cart)

    // Guardar cambios en el carrito en localStorage
    useEffect(()=>{
        localStorage.setItem("eSamCart", JSON.stringify(cart))
    },[cart])

    // Las llamadas al backend se serializan para que la lectura del carrito
    // persistido de una operación no se pise con la de la siguiente.
    const colaSincronizacion = useRef(Promise.resolve())
    const encolar = (operacion) => {
        colaSincronizacion.current = colaSincronizacion.current
            .then(operacion)
            .catch((error) => {
                console.error("No se pudo sincronizar el carrito con el backend", error)
            })
    }

    const aplicarCambio = (siguiente) => {
        cartRef.current = siguiente
        setCart(siguiente)
    }

    // Deja el carrito del servidor con la misma cantidad que el local:
    // crea el ítem si falta, ajusta si difiere o lo elimina si ya no existe.
    const sincronizarProducto = async (idProducto, cantidad) => {
        const carritoServidor = await obtenerCarrito()
        const items = Array.isArray(carritoServidor?.items) ? carritoServidor.items : []
        const item = items.find(
            (item) => Number(item.producto?.idProducto ?? item.idProducto) === Number(idProducto)
        )

        if (cantidad == null) {
            if (item) await eliminarItemCarrito(idProducto)
            return
        }

        if (!item) {
            await agregarItemCarrito(idProducto, cantidad)
        } else if (Number(item.cantidad) !== Number(cantidad)) {
            await actualizarCantidadItem(idProducto, cantidad)
        }
    }

    const persistir = (idProducto, cantidad) => {
        if (!puedePersistir) return

        encolar(() => sincronizarProducto(idProducto, cantidad))
    }

    // Agregar producto
    const addProduct = (p, n = 1) =>{
        const actual = cartRef.current
        const productFound = actual.find((item)=>{
            return item.product.idProducto == p.idProducto
        })

        const disponible = stockDisponible(p)
        const unidadesActuales = productFound?.units ?? 0
        const unidadesAgregar = Math.min(Math.max(0, n), disponible - unidadesActuales)

        if (unidadesAgregar <= 0) return

        const unidadesFinales = unidadesActuales + unidadesAgregar
        const siguiente = productFound
            ? actual.map((item)=>{
                return item.product.idProducto == p.idProducto
                    ? {...item, product: p, units: unidadesFinales}
                    : item
              })
            : [...actual,
                {
                    product: p,
                    units: unidadesFinales
                }]

        aplicarCambio(siguiente)
        persistir(p.idProducto, unidadesFinales)
    }

    // Aumentar cantidad
    const increaseUnits = (idProducto) => {
        const actual = cartRef.current
        const item = actual.find((item)=> item.product.idProducto == idProducto)

        if (!item) return

        const disponible = stockDisponible(item.product)
        if (item.units >= disponible) return

        aplicarCambio(actual.map((item)=>{
            return item.product.idProducto == idProducto
                ? {...item, units: item.units + 1}
                : item
        }))
        persistir(idProducto, item.units + 1)
    }

    // Disminuir cantidad hasta un mínimo de 1
    // Para llegar a 0 se debe eliminar el producto
    const decreaseUnits = (idProducto) =>{
        const actual = cartRef.current
        const item = actual.find((item)=> item.product.idProducto == idProducto)

        if (!item || item.units <= 1) return

        aplicarCambio(actual.map((item) => {
            if(item.product.idProducto === idProducto && item.units > 1){
                return {...item, units: item.units - 1}
            }else{
                return item
            }
        }))
        persistir(idProducto, item.units - 1)
    }

    // Eliminar producto
    const removeProduct = (idProducto) => {
        const actual = cartRef.current
        const siguiente = actual.filter((item) => {
            return item.product.idProducto != idProducto
        })

        if (siguiente.length === actual.length) return

        aplicarCambio(siguiente)
        persistir(idProducto, null)
    }

    const clearCart = () => {
        aplicarCambio([])

        if (puedePersistir) {
            encolar(() => vaciarCarrito())
        }
    }

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
