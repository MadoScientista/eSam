
import { Link } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { ProductCarousel } from '../components/ProductCarousel'
import { Carousel } from '../components/Carousel'
import { obtenerCategorias } from '../services/categoriaService'
import { obtenerProductos } from '../services/productoService'
import { idsCategoriaConDescendientes } from '../utils/categoria'
import { nombreMarcaProducto, normalizarTexto, productosDeCategoria } from '../utils/producto'
import { useEffect, useState } from 'react'

export function Home(){
    
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])

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

        const cargarCategorias = async () => {
            try {
                const data = await obtenerCategorias()
                setCategories(data)
            } catch(error) {
                console.error("Error al cargar categorias", error)
            }
        }

        cargarCategorias()
    }, [])

    const cuadernos = categories.find((category) => normalizarTexto(category.nombre) === "cuadernos")
    const productosCuadernos = cuadernos
        ? productosDeCategoria(
            products,
            [...idsCategoriaConDescendientes(categories, cuadernos.idCategoria)]
        )
        : []
    const productosArtel = products.filter(
        (product) => normalizarTexto(nombreMarcaProducto(product)) === "artel"
    )
    const marcasIncluidas = new Set()
    const productosDestacados = products.filter((product) => {
        const marca = normalizarTexto(nombreMarcaProducto(product))

        if (!marca || marcasIncluidas.has(marca)) return false

        marcasIncluidas.add(marca)
        return true
    })

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
                <ProductCarousel products={productosDestacados}/>
            </div>
        </section>
        {productosArtel.length > 0 && (
            <section className='esam-section esam-home-section'>
                <div className='container'>
                    <div className='esam-section-head'>
                        <h2 className='esam-section-title'>Productos Artel</h2>
                        <Link className='esam-section-link' to='/productos'>
                            Ver todo el catálogo
                            <i className='bi bi-arrow-right' aria-hidden='true'></i>
                        </Link>
                    </div>
                    <ProductCarousel products={productosArtel}/>
                </div>
            </section>
        )}
        {productosCuadernos.length > 0 && (
            <section className='esam-section esam-home-section'>
                <div className='container'>
                    <div className='esam-section-head'>
                        <h2 className='esam-section-title text-capitalize'>{cuadernos.nombre}</h2>
                        <Link className='esam-section-link' to={`/productos?categoria=${cuadernos.idCategoria}`}>
                            Ver todo
                            <i className='bi bi-arrow-right' aria-hidden='true'></i>
                        </Link>
                    </div>
                    <ProductCarousel products={productosCuadernos}/>
                </div>
            </section>
        )}
    </>
}