import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto } from "../../services/productoService"
import { obtenerMarcas } from "../../services/marcaService"
import { obtenerCategorias } from "../../services/categoriaService"
import { ConfirmModal } from "../../components/ConfirmModal"
import { AlertMessage } from "../../components/AlertMessage"
import { formatearPrecio } from "../../utils/moneda"
import { imagenPrincipalProducto } from "../../utils/producto"

export function AdminProductForm(){

    const { idProducto } = useParams()
    const navigate = useNavigate()
    const [formulario, setFormulario] = useState({})
    const [categorias, setCategorias] = useState([])

    // Esstados para modales de confirmación y alertas
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [eliminado, setEliminado] = useState(false)
    const [accion, setAccion] = useState(null)
    const [mensajeAlerta, setMensajeAlerta] = useState(null)
    const [cargando, setCargando] = useState(false)

    const [mensajeFormulario, setMensajeFormulario] = useState("")
    const [marcas, setMarcas] = useState([])

    // Al cambiar de ruta (idProducto) se limpia el formulario (patrón oficial de React:
    // ajustar estado durante el render cuando un prop cambia)
    const [prevIdProducto, setPrevIdProducto] = useState(idProducto)
    if (idProducto !== prevIdProducto) {
        setPrevIdProducto(idProducto)
        setFormulario({})
    }

    const esEdicion = Boolean(idProducto)

    // Cargar marcas y categorías al montar. Las categorías requieren token.
    useEffect(()=>{
        const cargarMarcas = async ()=>{
            try{
                const data = await obtenerMarcas()
                setMarcas(data)
            }catch(error){
                console.error("Error al cargar marcas", error)
            }
        }
        cargarMarcas()

        const cargarCategorias = async ()=>{
            try{
                const data = await obtenerCategorias()
                setCategorias(data)
            }catch(error){
                console.error("Error al cargar categorías", error)
            }
        }
        cargarCategorias()
    },[])

    // En caso de existir un idProducto en la ruta
    // carga los datos en el formulario (espera a que marcas estén cargadas)
    useEffect(()=>{
        if(idProducto && marcas.length > 0){
            const cargarProducto = async ()=>{
                try{
                    const data = await obtenerProductoPorId(idProducto)

                    setFormulario({
                        sku: data.sku ?? "",
                        nombre: data.nombre ?? "",
                        descripcion: data.descripcion ?? "",
                        precio: data.precio ?? "",
                        stock: data.stock ?? "",
                        idMarca: data.idMarca ?? "",
                        idCategorias: data.categorias?.map(c => c.idCategoria) ?? data.idCategorias ?? []
                    })
                }catch(error){
                    console.error("Error al cargar producto", error)
                    setMensajeAlerta({type: "danger", message: error?.message || "No se pudo cargar el producto."})
                }
            }
            cargarProducto()
        }
    },[idProducto, marcas])

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

    const handleChangeCategorias = (e) => {
        const { selectedOptions } = e.target
        const seleccion = Array.from(selectedOptions).map(o => Number(o.value))

        setFormulario((prev) => ({ ...prev, idCategorias: seleccion }))
    }

    // El DTO sólo acepta estos campos; el resto de la respuesta no se envía.
    const construirPayload = () => {
        const payload = {
            sku: (formulario.sku ?? "").trim(),
            nombre: (formulario.nombre ?? "").trim(),
            descripcion: (formulario.descripcion ?? "").trim(),
            precio: Number(formulario.precio),
            stock: Number(formulario.stock),
            idMarca: Number(formulario.idMarca),
            idCategorias: (formulario.idCategorias ?? []).map(Number)
        }

        return payload
    }

    // Muestra modal de confirmación
    // La acción de actualizar o crear depende del idProducto en la ruta
    const handleSubmit = (e) => {
        e.preventDefault()

        const camposRequeridos = ["sku", "nombre", "descripcion", "precio", "stock", "idMarca"]
        const camposFaltantes = camposRequeridos.filter(campo => !formulario[campo])

        if(camposFaltantes.length > 0){
            setMensajeFormulario("Todos los campos son obligatorios.")
            return
        }

        if((formulario.idCategorias ?? []).length === 0){
            setMensajeFormulario("Debes seleccionar al menos una categoría.")
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
        setAccion(esEdicion ? "actualizar" : "crear")
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
                await crearProducto(construirPayload())
                setMensajeAlerta({type: "success", message: "Producto creado correctamente."})
            }else if(accion === "actualizar"){
                await actualizarProducto(idProducto, construirPayload())
                setMensajeAlerta({type: "success", message: `Producto ${idProducto} actualizado correctamente.`})
            }else if(accion === "eliminar"){
                await eliminarProducto(idProducto)
                setEliminado(true)
                setMostrarConfirmacion(true)
                return
            }
            setMostrarConfirmacion(false)
        }catch(error){
            console.error("Error al guardar producto", error)
            setMensajeAlerta({
                type: "danger",
                message: accion === "eliminar"
                    ? error?.message || "No se pudo eliminar el producto."
                    : error?.message || "No se pudo guardar el producto."
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

    const imagen = imagenPrincipalProducto({ imagenes: formulario.imagenes })

    return(
        <>
        <div className="container">
            {
                esEdicion
                ? <h2 className="mb-4">Detalle producto id: {idProducto}</h2>
                : <h2 className="mb-4">Nuevo Producto</h2>
            }

            <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                    <div className="col border me-5" style={{maxWidth:'35rem', padding:'2rem'}}>
                        {
                            imagen
                            ? <img
                                src={imagen}
                                alt={formulario.nombre ?? ""}
                                className="figure-img img-fluid rounded"
                                style={{maxWidth:'30rem', padding:'2rem'}}
                            />
                            : <i className="bi bi-image fs-1 text-secondary"></i>
                        }
                    </div>

                    <div className="col" style={{maxWidth:'30rem'}}>
                        <div className="mb-3">
                            <label htmlFor="sku" className="form-label fw-bold">SKU</label>
                            <input
                                type="text"
                                className="form-control border-black"
                                name="sku"
                                maxLength={50}
                                placeholder="CUAD-001"
                                value={formulario.sku ?? ""}
                                onChange={handleChange}
                                required/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="nombre" className="form-label fw-bold">Nombre</label>
                            <input
                                type="text"
                                className="form-control border-black"
                                name="nombre"
                                maxLength={100}
                                placeholder="Nombre producto"
                                value={formulario.nombre ?? ""}
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
                                value={formulario.descripcion ?? ""}
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
                                    value={formulario.precio ?? ""}
                                    onChange={handleChange}
                                    required/>
                            </div>
                            {formulario.precio ? <small className="text-secondary">{formatearPrecio(formulario.precio)}</small> : null}
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
                                    value={formulario.stock ?? ""}
                                    onChange={handleChange}
                                    required/>
                            </div>
                            {formulario.stock !== "" && formulario.stock != null
                                ? <small className="text-secondary">Quedan: {formulario.stock}</small>
                                : null}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="idMarca" className="form-label fw-bold">Marca</label>
                            <div className="w-50">
                                <select
                                    className="form-select border-black"
                                    name="idMarca"
                                    value={formulario.idMarca ?? ""}
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

                        <div className="mb-3">
                            <label htmlFor="idCategorias" className="form-label fw-bold">Categorías</label>
                            <select
                                multiple
                                className="form-select border-black"
                                name="idCategorias"
                                value={(formulario.idCategorias ?? []).map(String)}
                                onChange={handleChangeCategorias}
                                style={{ minHeight: "8rem" }}
                                required>
                                {categorias.map(categoria => (
                                    <option key={categoria.idCategoria} value={categoria.idCategoria}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                            <small className="text-secondary">Mantén Ctrl para seleccionar varias.</small>
                        </div>

                        {
                            /* Mensaje de validación de campos */
                            mensajeFormulario != "" && <p className="text-danger">{mensajeFormulario}</p>
                        }

                        <div className="mt-4">
                            <button type="submit" className="btn btn-dark me-3">Guardar</button>

                            {esEdicion && <button type="button" className="btn btn-danger" onClick={handleEliminar}>Eliminar</button>}
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
                        eliminado ? `El producto ${idProducto} fue eliminado.` :
                        accion === "crear" ? "¿Estás seguro de guardar el nuevo producto?" :
                        accion === "actualizar" ? `¿Estás seguro de actualizar el producto ${idProducto}?` :
                        `¿Estás seguro de eliminar el producto ${idProducto}?`
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