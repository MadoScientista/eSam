
import { Banner } from '../components/Banner'
import { ProductList } from '../components/ProductList'
import { Carousel } from '../components/Carousel'
import { obtenerProductos } from '../services/productoService'
import { useEffect, useState } from 'react'

export function Home(){
    
    const [products, setProducts] = useState([])

    useEffect(() => {
        const cargarProductos = async () =>{
            try{
                const data = await obtenerProductos();
                setProducts(data)
            }catch(error){
                console.error("Error al cargar productos", error)
            }
        }

        cargarProductos()
    }, [])

    return <>
        <Banner><Carousel/></Banner>
        <div className='container p-0'>
            <h2 className='mb-4'>Productos destacados</h2>
            <ProductList products={products.slice(0,5)} cols={5}/>
        </div>
    </>
}