import { useEffect, useState } from 'react'
import { ProductList } from '../components/ProductList'
import { AlertMessage } from '../components/AlertMessage'
import { obtenerProductos } from '../services/productoService'

export function Products(){

    const [products, setProducts] = useState([])
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    useEffect(()=>{

        const cargarProductos = async () =>{
            try{
                const data = await obtenerProductos()
                setProducts(data)
            }catch(error){
                console.error("Error al cargar productos", error)
                setMensajeAlerta({ type: "danger", message: error?.message || "No se pudieron cargar los productos." })
            }
        }

        cargarProductos()

    },[])

    return (
    <div className='container mt-4'>
        <h2 className='mb-4'>Nuestros productos</h2>
        <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
        <ProductList products={products} cols={5}/>
    </div>
    )
}