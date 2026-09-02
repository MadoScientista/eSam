import { useEffect, useState } from 'react'
import { ProductList } from '../components/ProductList'
import { obtenerProductos } from '../services/productoService'

export function Products(){

    const [products, setProducts] = useState([])

    useEffect(()=>{

        const cargarProductos = async () =>{
            try{
                const data = await obtenerProductos()
                setProducts(data)
            }catch(error){
                console.error("Error al cargar productos", error)
            }
        }

        cargarProductos()

    },[])

    return (
    <div className='container mt-4'>
        <h2 className='mb-4'>Nuestros productos</h2>
        <ProductList products={products} cols={5}/>
    </div>
    )
}