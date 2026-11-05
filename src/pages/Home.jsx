
import { Link } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { ProductCarousel } from '../components/ProductCarousel'
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
        <section className='esam-section'>
            <div className='container'>
                <div className='esam-section-head'>
                    <h2 className='esam-section-title'>Productos destacados</h2>
                    <Link className='esam-section-link' to='/productos'>
                        Ver todo el catálogo
                        <i className='bi bi-arrow-right' aria-hidden='true'></i>
                    </Link>
                </div>
                <ProductCarousel products={products}/>
            </div>
        </section>
    </>
}