import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertMessage } from "../components/AlertMessage";
import { CategoryBanner } from "../components/CategoryBanner";
import { ProductCarousel } from "../components/ProductCarousel";
import { obtenerCategorias } from "../services/categoriaService";
import { obtenerProductos } from "../services/productoService";
import { idsCategoriaConDescendientes } from "../utils/categoria";
import { productosDeCategoria } from "../utils/producto";

export function Category(){

    const navigate = useNavigate()

    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    useEffect(() => {
            const cargarDatos = async () =>{
                try{
                    // Ambas consultas se resuelven juntas: la página necesita las
                    // categorías para los títulos y los productos para las filas.
                    const [categoriasData, productosData] = await Promise.all([
                        obtenerCategorias(),
                        obtenerProductos()
                    ])

                    setCategories(categoriasData)
                    setProducts(productosData)
                }catch(error){
                    console.error("Error al cargar categorias", error)
                    setMensajeAlerta({ type: "danger", message: error?.message || "No se pudo cargar la información de categorías." })
                }
            }

            cargarDatos()
        }, [])

    // Arriba van los accesos rápidos y abajo un bloque por categoría, así que
    // ambas listas parten de las mismas categorías raíz.
    const raices = useMemo(
        () => categories.filter((c) => c.idCategoriaPadre == null),
        [categories]
    )

    // Cada bloque reúne los productos de su categoría y de sus subcategorías. Las
    // categorías sin productos no se muestran para no dejar un título solo.
    const secciones = useMemo(
        () => raices
            .map((categoria) => {
                const ids = idsCategoriaConDescendientes(categories, categoria.idCategoria)

                return {
                    categoria,
                    products: productosDeCategoria(products, [...ids])
                }
            })
            .filter((s) => s.products.length > 0),
        [raices, categories, products]
    )

    return (
        <>
            <div className="container mt-5">
                <h2>Categorías</h2>
                <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
                <CategoryBanner categories={raices}/>

                {
                    secciones.map((s) => {
                        return (
                            <section className="mb-5" key={s.categoria.idCategoria}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <h3 className="mb-0 text-capitalize">{s.categoria.nombre}</h3>
                                    <button
                                        type="button"
                                        className="btn btn-link btn-sm p-0"
                                        onClick={() => navigate(`/productos?categoria=${s.categoria.idCategoria}`)}
                                    >
                                        Ver todo
                                    </button>
                                </div>
                                <ProductCarousel products={s.products}/>
                            </section>
                        )
                    })
                }

                {
                    categories.length > 0 && secciones.length === 0 &&
                    <p className="text-secondary">Todavía no hay productos publicados en las categorías.</p>
                }
            </div> 
        </>
    )
}