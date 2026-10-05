import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductList } from '../components/ProductList'
import { AlertMessage } from '../components/AlertMessage'
import { obtenerCategorias } from '../services/categoriaService'
import { obtenerProductos } from '../services/productoService'
import { idsCategoriaConDescendientes } from '../utils/categoria'
import { productosDeCategoria } from '../utils/producto'

export function Products(){

    const [searchParams, setSearchParams] = useSearchParams()

    const idCategoria = searchParams.get("categoria")

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
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

    // Las categorías solo hacen falta para poner el nombre en el encabezado y para
    // traer los productos de las subcategorías.
    useEffect(()=>{
        if (!idCategoria) return

        const cargarCategorias = async () =>{
            try{
                setCategories(await obtenerCategorias())
            }catch(error){
                console.error("Error al cargar categorias", error)
            }
        }

        cargarCategorias()

    },[idCategoria])

    const categoriaSeleccionada = useMemo(
        () => categories.find((c) => c.idCategoria == idCategoria) ?? null,
        [categories, idCategoria]
    )

    const productosVisibles = useMemo(() => {
        if (!idCategoria) return products

        const ids = idsCategoriaConDescendientes(categories, idCategoria)

        return productosDeCategoria(products, [...ids])
    }, [products, categories, idCategoria])

    return (
    <div className='container mt-4'>
        <div className='d-flex align-items-center justify-content-between mb-4'>
            <h2 className='mb-0'>
                {
                    categoriaSeleccionada
                    ? categoriaSeleccionada.nombre
                    : "Nuestros productos"
                }
            </h2>
            {
                categoriaSeleccionada &&
                <button
                    type='button'
                    className='btn btn-outline-secondary btn-sm'
                    onClick={() => setSearchParams({})}
                >
                    Ver todos los productos
                </button>
            }
        </div>
        <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
        {
            productosVisibles.length > 0
            ? <ProductList products={productosVisibles} cols={5}/>
            : <p className='text-secondary'>No hay productos en esta categoría por ahora.</p>
        }
    </div>
    )
}