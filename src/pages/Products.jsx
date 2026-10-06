import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductList } from '../components/ProductList'
import { ProductToolbar } from '../components/ProductToolbar'
import { ProductFilterSidebar } from '../components/ProductFilterSidebar'
import { AlertMessage } from '../components/AlertMessage'
import { obtenerCategorias } from '../services/categoriaService'
import { obtenerProductos } from '../services/productoService'
import { idsCategoriaConDescendientes, categoriasCatalogo } from '../utils/categoria'
import { filtrarProductos, marcasCatalogo, ordenarProductos } from '../utils/producto'

export function Products(){

    const [searchParams, setSearchParams] = useSearchParams()

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    const [busqueda, setBusqueda] = useState("")
    const [orden, setOrden] = useState("destacados")
    const [marcasSeleccionadas, setMarcasSeleccionadas] = useState([])
    const [precioMin, setPrecioMin] = useState("")
    const [precioMax, setPrecioMax] = useState("")

    useEffect(()=>{

        const cargarDatos = async () =>{
            try{
                const [productosData, categoriasData] = await Promise.all([
                    obtenerProductos(),
                    obtenerCategorias()
                ])

                setProducts(productosData)
                setCategories(categoriasData)
            }catch(error){
                console.error("Error al cargar productos", error)
                setMensajeAlerta({ type: "danger", message: error?.message || "No se pudieron cargar los productos." })
            }
        }

        cargarDatos()

    },[])

    // Las tarjetas de la página de categorías llegan con ?categoria=<id>. Se acepta
    // más de uno separadas por coma para que el enlace siga siendo un solo clic.
    const idsCategoriaUrl = useMemo(
        () => (searchParams.get("categoria") ?? "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
            .map(Number)
            .filter((id) => Number.isFinite(id)),
        [searchParams]
    )

    const actualizarUrl = (ids) => {
        if (ids.length === 0) {
            setSearchParams({})
            return
        }

        setSearchParams({ categoria: ids.join(",") })
    }

    // Al filtrar entra también lo que esté en las subcategorías, igual que en los
    // bloques de la página de categorías.
    const idsVisibles = useMemo(() => {
        const ids = new Set()

        idsCategoriaUrl.forEach((id) => {
            idsCategoriaConDescendientes(categories, id).forEach((c) => ids.add(c))
        })

        return [...ids]
    }, [categories, idsCategoriaUrl])

    const marcas = useMemo(() => marcasCatalogo(products), [products])

    const handleToggleMarca = (clave) => {
        setMarcasSeleccionadas((actuales) =>
            actuales.includes(clave)
            ? actuales.filter((m) => m !== clave)
            : [...actuales, clave])
    }

    // Las categorías viven en la URL para que un filtro se pueda compartir y los
    // enlaces de la página de categorías sigan funcionando.
    const handleToggleCategoria = (idCategoria) => {
        actualizarUrl(idsCategoriaUrl.includes(idCategoria)
            ? idsCategoriaUrl.filter((id) => id !== idCategoria)
            : [...idsCategoriaUrl, idCategoria])
    }

    const hayFiltros = busqueda.trim() !== "" || orden !== "destacados" || marcasSeleccionadas.length > 0 || precioMin !== "" || precioMax !== "" || idsCategoriaUrl.length > 0

    const limpiarFiltros = () => {
        setBusqueda("")
        setOrden("destacados")
        setMarcasSeleccionadas([])
        setPrecioMin("")
        setPrecioMax("")
        actualizarUrl([])
    }

    const productosVisibles = useMemo(() => {
        const filtrados = filtrarProductos(products, {
            busqueda,
            idsCategoria: idsVisibles,
            marcas: marcasSeleccionadas,
            precioMin,
            precioMax
        })

        return ordenarProductos(filtrados, orden)
    }, [products, busqueda, idsVisibles, marcasSeleccionadas, precioMin, precioMax, orden])

    // Con una sola categoría el encabezado toma su nombre; con varias ya no
    // describe el listado, así que se queda el título general.
    const categoriaUnica = categories.find((c) => idsCategoriaUrl.length === 1 && c.idCategoria === idsCategoriaUrl[0])

    const categoriasFiltro = useMemo(() => categoriasCatalogo(products, categories), [products, categories])

    return (
    <div className='container mt-4'>
        <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />

        <div className='row g-4'>
            <aside className='col-lg-3 mb-4 mb-lg-0'>
                <ProductFilterSidebar
                    marcas={marcas}
                    marcasSeleccionadas={marcasSeleccionadas}
                    onToggleMarca={handleToggleMarca}
                    categorias={categoriasFiltro}
                    idsCategoria={idsCategoriaUrl}
                    onToggleCategoria={handleToggleCategoria}
                    precioMin={precioMin}
                    precioMax={precioMax}
                    onPrecioChange={(campo, valor) => campo === "precioMin" ? setPrecioMin(valor) : setPrecioMax(valor)}
                    hayFiltros={hayFiltros}
                    onLimpiar={limpiarFiltros}
                    mostrados={productosVisibles.length}
                    total={products.length}
                />
            </aside>

            <div className='col-lg-9'>
                <ProductToolbar
                    busqueda={busqueda}
                    onBusquedaChange={setBusqueda}
                    orden={orden}
                    onOrdenChange={setOrden}
                />

                <div className='d-flex flex-wrap align-items-center justify-content-between mb-4'>
                    <h2 className='fs-4 mb-0 text-capitalize'>
                        {categoriaUnica ? categoriaUnica.nombre : "Productos"}
                    </h2>
                    {
                        idsCategoriaUrl.length > 0 &&
                        <button
                            type='button'
                            className='btn btn-outline-secondary btn-sm'
                            onClick={limpiarFiltros}
                        >
                            Ver todos los productos
                        </button>
                    }
                </div>

                {
                    productosVisibles.length > 0
                    ? <ProductList products={productosVisibles} cols={4}/>
                    : <p className='text-secondary'>No se encontraron productos con esos filtros.</p>
                }
            </div>
        </div>
    </div>
    )
}