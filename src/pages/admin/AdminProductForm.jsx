import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { obtenerProductoSku, crearProductoSku, actualizarProductoSku, eliminarProducto } from "../../services/productoService"
import { obtenerMarcas } from "../../services/marcaService"
import { ConfirmModal } from "../../components/ConfirmModal"
import { AlertMessage } from "../../components/AlertMessage"

export function AdminProductForm(){
    
    const {sku} = useParams()
    const navigate = useNavigate()
    const [formulario, setFormulario] = useState({})
    
    // Esstados para modales de confirmación y alertas
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [eliminado, setEliminado] = useState(false)
    const [accion, setAccion] = useState(null)
    const [mensajeAlerta, setMensajeAlerta] = useState(null)
    const [cargando, setCargando] = useState(false)

    const [mensajeFormulario, setMensajeFormulario] = useState("")
    const [marcas, setMarcas] = useState([])

    // Cargar marcas al montar
    useEffect(()=>{
        const cargarMarcas = async () =>{
            try{
                const data = await obtenerMarcas()
                setMarcas(data)
            }catch(error){
                console.error("Error al cargar marcas", error)
            }
        }
        cargarMarcas()
    },[])

    // En caso de existir un sku en la ruta
    // carga los datos en el formulario (espera a que marcas estén cargadas)
    useEffect(()=>{
        if(sku && marcas.length > 0){
            const cargarProducto = async () =>{
                try{
                    const data = await obtenerProductoSku(sku)
                    const marcaEncontrada = marcas.find(m => m.nombre === data.marca)
                    setFormulario({ ...data, idMarca: marcaEncontrada?.idMarca || "" })
                }catch(error){
                    console.error("Error al cargar producto", error)
                }
            }
            cargarProducto()
        }else if(!sku){
            setFormulario({})
        }
    },[sku, marcas])

    // Guarda los cambios en los inputs
    const handleChange = (e) => {
        const {name, value} = e.target

        setFormulario(
            {
                ...formulario,
                [name]:value
            }
        )
    }

    // Muestra modal de confirmación
    // La acción de actualizar o crear depende del sku en la ruta
    const handleSubmit = (e) => {
        e.preventDefault()

        const camposRequeridos = ["nombre", "descripcion", "precio", "stock", "idMarca", "img"]
        const camposFaltantes = camposRequeridos.filter(campo => !formulario[campo])

        if(camposFaltantes.length > 0){
            setMensajeFormulario("Todos los campos son obligatorios.")
            return
        }

        const precio = Number(formulario.precio)
        const stock = Number(formulario.stock)

        if(!Number.isInteger(precio) || precio <= 0){
            setMensajeFormulario("El precio debe ser un número entero positivo mayor a cero.")
            return
        }

        if(!Number.isInteger(stock) || stock < 0){
            setMensajeFormulario("El stock debe ser un número entero mayor o igual a cero.")
            return
        }

        setMensajeFormulario("")
        setAccion(sku ? "actualizar" : "crear")
        setMostrarConfirmacion(true)
    }

    // Muestra modal de confirmación
    const handleEliminar = () => {
        setAccion("eliminar")
        setMostrarConfirmacion(true)
    }

    // Función de confirmación en el modal
    const handleConfirmar = async () => {
        setCargando(true)
        try{
            if(accion === "crear"){
                await crearProductoSku(formulario)
                setMensajeAlerta({type: "success", message: "Producto creado correctamente."})
            }else if(accion === "actualizar"){
                await actualizarProductoSku(sku, formulario)
                setMensajeAlerta({type: "success", message: `Producto ${sku} actualizado correctamente.`})
            }else if(accion === "eliminar"){
                await eliminarProducto(sku)
                setEliminado(true)
                setMostrarConfirmacion(true)
                return
            }
            setMostrarConfirmacion(false)
        }catch(error){
            console.error("Error al guardar producto", error)
            setMensajeAlerta({
                type: "danger",
                message: accion === "eliminar" ? "No se pudo eliminar el producto." : "No se pudo guardar el producto."
            })
            setMostrarConfirmacion(false)
        }finally{
            setCargando(false)
        }
    }

    const cerrarModal = () => {
        setMostrarConfirmacion(false)
        if(eliminado){
            navigate("/admin/productos")
        }
    }

    return(
        <>
        <div className="container">
            {sku ?
                <h2 className="mb-4">Detalle producto sku: {sku}</h2>:
                <h2 className="mb-4">Nuevo Producto</h2>
            }

            <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                    <div className="col border me-5" style={{maxWidth:'35rem', padding:'2rem'}}>
                        {!formulario.img=="" ?
                            <img
                                src={formulario.img}
                                alt=""
                                className="figure-img img-fluid rounded"
                                style={{maxWidth:'30rem', padding:'2rem'}}
                            />:
                            <i className="bi bi-image"></i>
                        }
                    </div>

                    <div className="col" style={{maxWidth:'30rem'}}>
                        <div className="mb-3">
                            <label htmlFor="nombre" className="form-label fw-bold">Nombre</label>
                            <input 
                                type="text" 
                                className="form-control border-black" 
                                name="nombre"
                                maxLength={100}
                                placeholder="Nombre producto"
                                value={formulario.nombre || ""}
                                onChange={handleChange}
                                required/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="descripcion" className="form-label fw-bold">Descripción</label>
                            <textarea 
                                className="form-control border-black"
                                name="descripcion" 
                                rows="3"
                                placeholder="Descripción de producto"
                                value={formulario.descripcion || ""}
                                onChange={handleChange}
                                required>
                            </textarea>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="precio" className="form-label fw-bold">Precio</label>
                            <div className="w-50">
                                <input 
                                    type="text" 
                                    className="form-control border-black" 
                                    name="precio"
                                    maxLength={10}
                                    placeholder="1000"
                                    value={formulario.precio || ""}
                                    onChange={handleChange}
                                    required/>
                            </div>
                            {formulario.precio && <small className="text-secondary">${formulario.precio}</small>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="stock" className="form-label fw-bold">Stock</label>
                            <div className="w-50">
                                <input 
                                    type="text" 
                                    className="form-control border-black"
                                    name="stock"
                                    maxLength={10}
                                    placeholder="10"
                                    value={formulario.stock || ""}
                                    onChange={handleChange}
                                    required/>
                            </div>
                            {formulario.stock && <small className="text-secondary">Quedan: {formulario.stock}</small>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="idMarca" className="form-label fw-bold">Marca</label>
                            <div className="w-50">
                                <select 
                                    className="form-select border-black"
                                    name="idMarca"
                                    value={formulario.idMarca || ""}
                                    onChange={handleChange}
                                    required>
                                    <option value="">Seleccionar marca</option>
                                    {marcas.map(marca => (
                                        <option key={marca.idMarca} value={marca.idMarca}>
                                            {marca.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-3 mt-3">
                            <label htmlFor="img" className="form-label fw-bold">Ruta imagen</label>
                            <input 
                                type="text" 
                                className="form-control border-black" 
                                name="img"
                                placeholder="https://imagen.com"
                                value={formulario.img || ""}
                                onChange={handleChange}
                                required/>
                        </div>

                        {
                            /* Mensaje de validación de campos */
                            mensajeFormulario != "" && <p className="text-danger">{mensajeFormulario}</p>
                        }
                        
                        <div className="mt-4">
                            <button type="submit" className="btn btn-dark me-3">Guardar</button>
                            
                            {sku && <button type="button" className="btn btn-danger" onClick={handleEliminar}>Eliminar</button>}
                        </div>
                        
                    </div>
                </div>
            </form>

            <div className="mb-3">
                <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={()=>setMensajeAlerta(null)}/>
            </div>

            {
                mostrarConfirmacion &&
                <ConfirmModal
                    show={mostrarConfirmacion}
                    title={
                        eliminado ? "Producto eliminado" :
                        accion === "crear" ? "Guardar producto" :
                        accion === "actualizar" ? "Actualizar producto" : "Eliminar producto"
                    }
                    message={
                        eliminado ? `El producto ${sku} fue eliminado.` :
                        accion === "crear" ? "¿Estás seguro de guardar el nuevo producto?" :
                        accion === "actualizar" ? `¿Estás seguro de actualizar el producto ${sku}?` :
                        `¿Estás seguro de eliminar el producto ${sku}?`
                    }
                    confirmText={
                        accion === "crear" || accion === "actualizar" ? "Guardar" : "Eliminar"
                    }
                    variant={accion === "eliminar" ? "danger" : "dark"}
                    icon={
                        eliminado ? "bi-check-circle" :
                        accion === "eliminar" ? "bi-trash" : "bi-check2-circle"
                    }
                    success={eliminado}
                    onConfirm={handleConfirmar}
                    onCancel={cerrarModal}
                    disabled={cargando}
                />
            }
        </div>
        </>
    )
}