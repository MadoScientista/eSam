import { useEffect, useState } from "react"
import {obtenerProductos} from "../../services/productoService"
import { ProductTable } from "../../components/ProductTable"
import { TableCard } from "../../components/TableCard"
import { AlertMessage } from "../../components/AlertMessage"
import { ORDENES_ADMIN_PRODUCTO, DIRECCIONES_ORDEN, ordenarProductosAdmin } from "../../utils/producto"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth, tieneRol } from "../../context/authContext"


export function AdminControlProduct(){
    
    const navigate = useNavigate()
    const location = useLocation()
    const { usuario } = useAuth()
    const esAdmin = tieneRol(usuario, "admin")
    const [products, setProducts] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [orden, setOrden] = useState("sku")
    const [direccion, setDireccion] = useState("desc")
    const [mensajeAlerta, setMensajeAlerta] = useState(location.state?.mensajeAlerta ?? null)

    useEffect(() => {
        const cargarProductos = async () =>{
            try{
                const data = await obtenerProductos();
                setProducts(data)
            }catch(error){
                console.error("Error al cargar productos", error)
                setMensajeAlerta({ type: "danger", message: error?.message || "No se pudieron cargar los productos." })
            }
        }

        cargarProductos()
    }, [])
        
    const handleClick = (idProducto) =>{
        navigate(`${idProducto}`)
    }

    const productosFiltrados = products.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(p.sku).toLowerCase().includes(busqueda.toLowerCase()) ||
        String(p.idProducto).includes(busqueda)
    )

    const productosOrdenados = ordenarProductosAdmin(productosFiltrados, orden, direccion)

    return(
        <>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                <h2 className="mb-0">Administración Productos</h2>
                <button
                    className="btn btn-dark"
                    onClick={()=>{navigate("nuevo")}}
                >
                    Nuevo producto
                </button>
            </div>
            <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={() => setMensajeAlerta(null)} />
            <TableCard
                title="Todos los productos"
                subtitle="Listado de productos de la tienda"
                toolbar={
                    <div className="admin-product-filters" role="group" aria-label="Filtros de productos">
                        <div className="input-group" style={{ maxWidth: "25rem" }}>
                            <span className="input-group-text border-black"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                className="form-control border-black"
                                placeholder="Buscar por nombre o ID"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <div style={{ maxWidth: "11rem" }}>
                            <label htmlFor="ordenarProductosAdmin" className="form-label mb-1">Ordenar por</label>
                            <select
                                id="ordenarProductosAdmin"
                                className="form-select border-black"
                                value={orden}
                                onChange={(e) => setOrden(e.target.value)}
                            >
                                {ORDENES_ADMIN_PRODUCTO.map((o) => (
                                    <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ maxWidth: "11rem" }}>
                            <label htmlFor="direccionOrdenAdmin" className="form-label mb-1">Dirección</label>
                            <select
                                id="direccionOrdenAdmin"
                                className="form-select border-black"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                            >
                                {DIRECCIONES_ORDEN.map((d) => (
                                    <option key={d.valor} value={d.valor}>{d.etiqueta}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                }
            >
                <ProductTable products={productosOrdenados} handleClick={handleClick} editable={esAdmin}/>
            </TableCard>
        </>
    )
}