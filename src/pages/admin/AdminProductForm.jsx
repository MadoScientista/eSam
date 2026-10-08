import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto, subirImagenProducto, eliminarImagenProducto, marcarImagenPrincipal } from "../../services/productoService"
import { obtenerMarcas } from "../../services/marcaService"
import { obtenerCategorias } from "../../services/categoriaService"
import { ConfirmModal } from "../../components/ConfirmModal"
import { CategoriasSelector } from "../../components/CategoriasSelector"
import { AlertMessage } from "../../components/AlertMessage"
import { formatearPrecio } from "../../utils/moneda"
import { imagenPrincipalProducto } from "../../utils/producto"
import { tieneRol, useAuth } from "../../context/authContext"

export function AdminProductForm(){

    const { idProducto } = useParams()
    const navigate = useNavigate()
    const { usuario } = useAuth()
    const esAdmin = tieneRol(usuario, "admin")

    // Esstados para modales de confirmación y alertas
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [eliminado, setEliminado] = useState(false)
    const [accion, setAccion] = useState(null)
    const [mensajeAlerta, setMensajeAlerta] = useState(null)
    const [cargando, setCargando] = useState(false)

    const [mensajeFormulario, setMensajeFormulario] = useState("")
    const [marcas, setMarcas] = useState([])
    const [categorias, setCategorias] = useState([])
    const [formulario, setFormulario] = useState({})

    // Estado para imágenes (staging local + existentes)
    const [imagenesLocales, setImagenesLocales] = useState([])
    const [imagenesExistentes, setImagenesExistentes] = useState([])
    const [portadaPendiente, setPortadaPendiente] = useState({ tipo: null, valor: null })

    // Al cambiar de ruta (idProducto) se limpia el formulario (patrón oficial de React:
    // ajustar estado durante el render cuando un prop cambia)
    const [prevIdProducto, setPrevIdProducto] = useState(idProducto)
    if (idProducto !== prevIdProducto) {
        setPrevIdProducto(idProducto)
        setFormulario({})
        setImagenesLocales([])
        setImagenesExistentes([])
        setPortadaPendiente({ tipo: null, valor: null })
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

                    const imagenesData = Array.isArray(data.imagenes) ? data.imagenes : []

                    setFormulario({
                        sku: data.sku ?? "",
                        nombre: data.nombre ?? "",
                        descripcion: data.descripcion ?? "",
                        precio: data.precio ?? "",
                        stock: data.stock ?? "",
                        idMarca: data.marcaDetalle?.idMarca ?? data.idMarca ?? "",
                        idCategorias: data.categorias?.map(c => c.idCategoria) ?? data.idCategorias ?? [],
                        imagenes: imagenesData
                    })
                    setImagenesExistentes(imagenesData.map(img => ({ ...img, marcadaEliminar: false })))
                    setImagenesLocales([])
                    const portadaExistente = imagenesData.find(img => img.principal === true)
                    if (portadaExistente) {
                        setPortadaPendiente({ tipo: 'existente', valor: portadaExistente.idImagenProducto })
                    } else {
                        setPortadaPendiente({ tipo: null, valor: null })
                    }
                }catch(error){
                    console.error("Error al cargar producto", error)
                    setMensajeAlerta({type: "danger", message: error?.message || "No se pudo cargar el producto."})
                }
            }
            cargarProducto()
        }
    },[idProducto, marcas])

    // Limpiar previews de imágenes locales al desmontar o cambiar
    useEffect(() => {
        return () => {
            imagenesLocales.forEach(img => {
                if (img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl)
                }
            })
        }
    }, [imagenesLocales])

    // Handlers de imágenes locales
    const manejarSeleccionImagenesLocales = (e) => {
        const archivos = Array.from(e.target.files || [])
        if (archivos.length === 0) return

        const nuevas = archivos.map((archivo) => ({
            file: archivo,
            previewUrl: URL.createObjectURL(archivo),
            esPortada: false
        }))

        setImagenesLocales((prev) => {
            const actualizadas = [...prev, ...nuevas]
            // Asignar portada pendiente si no existe
            if (portadaPendiente.tipo === null) {
                setPortadaPendiente({ tipo: 'nueva', valor: prev.length })
            }
            return actualizadas
        })
        e.target.value = ''
    }

    const establecerPortadaNueva = (idx) => {
        setPortadaPendiente({ tipo: 'nueva', valor: idx })
    }

    const establecerPortadaExistente = (id) => {
        setPortadaPendiente({ tipo: 'existente', valor: id })
    }

    const eliminarImagenLocal = (idx) => {
        setImagenesLocales((prev) => {
            const img = prev[idx]
            if (img && img.previewUrl) {
                URL.revokeObjectURL(img.previewUrl)
            }
            const nuevas = prev.filter((_, i) => i !== idx)
            // Reasignar portada si era la portada pendiente
            if (portadaPendiente.tipo === 'nueva' && portadaPendiente.valor === idx) {
                if (nuevas.length > 0) {
                    // Asignar la primera nueva restante
                    setPortadaPendiente({ tipo: 'nueva', valor: 0 })
                } else {
                    // Buscar portada existente no eliminada
                    const existentePortada = imagenesExistentes.find(img => !img.marcadaEliminar && img.principal === true)
                    if (existentePortada) {
                        setPortadaPendiente({ tipo: 'existente', valor: existentePortada.idImagenProducto })
                    } else {
                        const primeraExistente = imagenesExistentes.find(img => !img.marcadaEliminar)
                        if (primeraExistente) {
                            setPortadaPendiente({ tipo: 'existente', valor: primeraExistente.idImagenProducto })
                        } else {
                            setPortadaPendiente({ tipo: null, valor: null })
                        }
                    }
                }
            } else if (portadaPendiente.tipo === 'nueva' && portadaPendiente.valor > idx) {
                setPortadaPendiente({ tipo: 'nueva', valor: portadaPendiente.valor - 1 })
            }
            return nuevas
        })
    }

    const marcarEliminarExistente = (idImagenProducto) => {
        setImagenesExistentes((prev) => {
            const actualizadas = prev.map(img => 
                img.idImagenProducto === idImagenProducto 
                    ? { ...img, marcadaEliminar: true }
                    : img
            )
            // Reasignar portada si era la portada pendiente
            if (portadaPendiente.tipo === 'existente' && portadaPendiente.valor === idImagenProducto) {
                const existentePortadaOriginal = actualizadas.find(img => !img.marcadaEliminar && img.principal === true)
                if (existentePortadaOriginal) {
                    setPortadaPendiente({ tipo: 'existente', valor: existentePortadaOriginal.idImagenProducto })
                } else {
                    const primeraExistente = actualizadas.find(img => !img.marcadaEliminar)
                    if (primeraExistente) {
                        setPortadaPendiente({ tipo: 'existente', valor: primeraExistente.idImagenProducto })
                    } else if (imagenesLocales.length > 0) {
                        setPortadaPendiente({ tipo: 'nueva', valor: 0 })
                    } else {
                        setPortadaPendiente({ tipo: null, valor: null })
                    }
                }
            }
            return actualizadas
        })
    }

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

    const handleChangeCategorias = (seleccion) => {
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
                const creado = await crearProducto(construirPayload())

                setMostrarConfirmacion(false)

                const idProdCreado = creado?.idProducto
                if (idProdCreado != null) {
                    let erroresImagenes = []
                    // 1. Eliminar imágenes existentes marcadas (no aplica en creación)
                    const aEliminar = imagenesExistentes.filter(img => img.marcadaEliminar)
                    for (const img of aEliminar) {
                        try {
                            await eliminarImagenProducto(idProdCreado, img.idImagenProducto)
                        } catch (e) {
                            erroresImagenes.push({ operacion: 'eliminar', error: e })
                        }
                    }
                    // 2. Subir imágenes nuevas
                    const subidas = []
                    for (const [i, imgLocal] of imagenesLocales.entries()) {
                        try {
                            const creadaImg = await subirImagenProducto(idProdCreado, imgLocal.file)
                            subidas.push({ indexLocal: i, ...creadaImg })
                        } catch (e) {
                            erroresImagenes.push({ operacion: 'subir', index: i, error: e })
                            subidas.push({ indexLocal: i, error: e })
                        }
                    }
                    // 3. Establecer portada
                    let portadaEstablecida = false
                    if (portadaPendiente.tipo === 'nueva') {
                        const idx = portadaPendiente.valor
                        const subidaExitosa = subidas.find(s => !s.error && s.indexLocal === idx)
                        if (subidaExitosa && subidaExitosa.idImagenProducto) {
                            try {
                                await marcarImagenPrincipal(idProdCreado, subidaExitosa.idImagenProducto)
                                portadaEstablecida = true
                            } catch (e) {
                                erroresImagenes.push({ operacion: 'portada', error: e })
                            }
                        }
                    } else if (portadaPendiente.tipo === 'existente') {
                        const idPortada = portadaPendiente.valor
                        try {
                            await marcarImagenPrincipal(idProdCreado, idPortada)
                            portadaEstablecida = true
                        } catch (e) {
                            erroresImagenes.push({ operacion: 'portada', error: e })
                        }
                    }
                    if (!portadaEstablecida) {
                        const primeraExitosa = subidas.find(s => !s.error && s.idImagenProducto)
                        if (primeraExitosa) {
                            try {
                                await marcarImagenPrincipal(idProdCreado, primeraExitosa.idImagenProducto)
                            } catch (e) {
                                erroresImagenes.push({ operacion: 'portada', error: e })
                            }
                        }
                    }

                    const alertaCreacion = erroresImagenes.length > 0
                        ? {
                            type: "warning",
                            message: esAdmin
                                ? `Producto ${idProdCreado} creado correctamente, pero no se pudieron subir algunas imágenes. Puedes gestionarlas desde la edición.`
                                : `Producto ${idProdCreado} creado correctamente, pero no se pudieron subir algunas imágenes. Contacta a un administrador para gestionarlas.`
                        }
                        : {
                            type: "success",
                            message: `Producto ${idProdCreado} creado correctamente.`
                        }

                    if (esAdmin) {
                        setMensajeAlerta(alertaCreacion)
                        navigate(`/admin/productos/${idProdCreado}`, { replace: true })
                    } else {
                        navigate("/admin/productos", {
                            replace: true,
                            state: { mensajeAlerta: alertaCreacion }
                        })
                    }
                } else {
                    setMensajeAlerta({type: "success", message: "Producto creado correctamente."})
                }

                return
            }else if(accion === "actualizar"){
                await actualizarProducto(idProducto, construirPayload())
                const idProd = idProducto
                let erroresImagenes = []
                // 1. Eliminar existentes marcadas
                const aEliminar = imagenesExistentes.filter(img => img.marcadaEliminar)
                for (const img of aEliminar) {
                    try {
                        await eliminarImagenProducto(idProd, img.idImagenProducto)
                    } catch (e) {
                        erroresImagenes.push({ operacion: 'eliminar', error: e })
                    }
                }
                // 2. Subir nuevas
                const subidas = []
                for (const [i, imgLocal] of imagenesLocales.entries()) {
                    try {
                        const creadaImg = await subirImagenProducto(idProd, imgLocal.file)
                        subidas.push({ indexLocal: i, ...creadaImg })
                    } catch (e) {
                        erroresImagenes.push({ operacion: 'subir', index: i, error: e })
                        subidas.push({ indexLocal: i, error: e })
                    }
                }
                // 3. Portada
                let portadaEstablecida = false
                if (portadaPendiente.tipo === 'nueva') {
                    const idx = portadaPendiente.valor
                    const subidaExitosa = subidas.find(s => !s.error && s.indexLocal === idx)
                    if (subidaExitosa && subidaExitosa.idImagenProducto) {
                        try {
                            await marcarImagenPrincipal(idProd, subidaExitosa.idImagenProducto)
                            portadaEstablecida = true
                        } catch (e) {
                            erroresImagenes.push({ operacion: 'portada', error: e })
                        }
                    }
                } else if (portadaPendiente.tipo === 'existente') {
                    const idPortada = portadaPendiente.valor
                    const siguePresente = imagenesExistentes.find(img => !img.marcadaEliminar && img.idImagenProducto === idPortada)
                    if (siguePresente) {
                        try {
                            await marcarImagenPrincipal(idProd, idPortada)
                            portadaEstablecida = true
                        } catch (e) {
                            erroresImagenes.push({ operacion: 'portada', error: e })
                        }
                    }
                }
                if (!portadaEstablecida) {
                    const primeraExitosa = subidas.find(s => !s.error && s.idImagenProducto)
                    if (primeraExitosa) {
                        try {
                            await marcarImagenPrincipal(idProd, primeraExitosa.idImagenProducto)
                        } catch (e) {
                            erroresImagenes.push({ operacion: 'portada', error: e })
                        }
                    }
                }

                if (erroresImagenes.length > 0) {
                    setMensajeAlerta({
                        type: "warning",
                        message: `Producto ${idProd} actualizado correctamente, pero hubo errores al actualizar imágenes.`
                    })
                } else {
                    setMensajeAlerta({
                        type: "success",
                        message: `Producto ${idProd} actualizado correctamente.`
                    })
                }
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
                            <label htmlFor="categorias" className="form-label fw-bold">Categorías</label>
                            <CategoriasSelector
                                categorias={categorias}
                                seleccionadas={formulario.idCategorias ?? []}
                                onChange={handleChangeCategorias}/>
                            {categorias.length === 0 && <small className="text-danger">No hay categorías disponibles. Crea una en Categorías del panel de administración.</small>}
                        </div>

                        {
                            /* Mensaje de validación de campos */
                            mensajeFormulario != "" && <p className="text-danger">{mensajeFormulario}</p>
                        }

                    </div>
                </div>

                <div className="mb-4">
                    <div className="mb-3">
                        <label className="form-label fw-bold">Imágenes</label>
                        <input
                            type="file"
                            className="form-control border-black"
                            accept="image/*"
                            multiple
                            onChange={manejarSeleccionImagenesLocales}
                            disabled={cargando}
                        />
                        <small className="text-muted">
                            Selecciona imágenes (sin subir). Elige la imagen de portada. Los cambios se aplican al guardar.
                        </small>

                        {esEdicion && imagenesExistentes.length > 0 && (
                            <div className="mt-3">
                                <h6 className="small text-muted mb-2">Imágenes existentes</h6>
                                <div className="row g-2">
                                    {imagenesExistentes.map((img) => {
                                        if (img.marcadaEliminar) return null
                                        const esPortadaActual = portadaPendiente.tipo === 'existente'
                                            ? (portadaPendiente.valor === img.idImagenProducto)
                                            : (img.principal === true)
                                        return (
                                            <div key={img.idImagenProducto} className="col-6 col-md-3">
                                                <div className="card h-100 border-secondary">
                                                    <img src={img.url} className="card-img-top" style={{ objectFit: 'cover', height: 120 }} />
                                                    <div className="card-body p-2">
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                name="portada"
                                                                className="form-check-input"
                                                                checked={esPortadaActual}
                                                                onChange={() => establecerPortadaExistente(img.idImagenProducto)}
                                                                disabled={cargando}
                                                            />
                                                            <label className="form-check-label small">Portada</label>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger w-100 mt-1"
                                                            onClick={() => marcarEliminarExistente(img.idImagenProducto)}
                                                            disabled={cargando}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {imagenesLocales.length > 0 && (
                            <div className="mt-3">
                                <h6 className="small text-muted mb-2">Imágenes nuevas (por subir al guardar)</h6>
                                <div className="row g-2">
                                    {imagenesLocales.map((img, idx) => {
                                        const esPortadaNueva = portadaPendiente.tipo === 'nueva' && portadaPendiente.valor === idx
                                        return (
                                            <div key={idx} className="col-6 col-md-3">
                                                <div className="card h-100">
                                                    <img src={img.previewUrl} className="card-img-top" style={{ objectFit: 'cover', height: 120 }} />
                                                    <div className="card-body p-2">
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                name="portada"
                                                                className="form-check-input"
                                                                checked={esPortadaNueva}
                                                                onChange={() => establecerPortadaNueva(idx)}
                                                                disabled={cargando}
                                                            />
                                                            <label className="form-check-label small">Portada</label>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger w-100 mt-1"
                                                            onClick={() => eliminarImagenLocal(idx)}
                                                            disabled={cargando}
                                                        >
                                                            Quitar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <button type="submit" className="btn btn-dark me-3" disabled={cargando}>Guardar</button>

                    {esEdicion && <button type="button" className="btn btn-danger" onClick={handleEliminar} disabled={cargando}>Eliminar</button>}
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
                        eliminado ? `El producto se eliminó correctamente.` :
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