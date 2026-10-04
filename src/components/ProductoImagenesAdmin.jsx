import { useState } from "react"
import {
    obtenerImagenesProducto,
    subirImagenProducto,
    eliminarImagenProducto,
    eliminarTodasImagenesProducto
} from "../services/productoService"
import { AlertMessage } from "./AlertMessage"
import { ConfirmModal } from "./ConfirmModal"

// El backend sólo expone POST /productos/{idProducto}/imagenes: la imagen se
// sube una vez que el producto existe, y su carga usa multipart con el campo
// "file". El controlador no acepta principal, orden ni texto alternativo.
export function ProductoImagenesAdmin({ idProducto, imagenes = [], onSincronizar }){

    const [cargando, setCargando] = useState(false)
    const [imagenAEliminar, setImagenAEliminar] = useState(null)
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    // Tras cada escritura se relee GET /productos/{idProducto}/imagenes porque la
    // respuesta del POST de subida no siempre trae el campo "principal".
    const sincronizar = async () => {
        const data = await obtenerImagenesProducto(idProducto)

        onSincronizar(Array.isArray(data) ? data : [])
    }

    const handleArchivo = async (e) => {
        const archivo = e.target.files?.[0]
        e.target.value = ""

        if(!archivo) return

        setCargando(true)
        try{
            await subirImagenProducto(idProducto, archivo)
            await sincronizar()
            setMensajeAlerta({type: "success", message: "Imagen subida correctamente."})
        }catch(error){
            console.error("Error al subir imagen del producto", error)
            setMensajeAlerta({type: "danger", message: error?.message || "No se pudo subir la imagen."})
        }finally{
            setCargando(false)
        }
    }

    const handleConfirmarEliminar = async () => {
        setMostrarConfirmacion(false)
        setCargando(true)

        try{
            if(imagenAEliminar === "todas"){
                await eliminarTodasImagenesProducto(idProducto)
                setMensajeAlerta({type: "success", message: "Se quitaron todas las imágenes del producto."})
            }else{
                await eliminarImagenProducto(idProducto, imagenAEliminar)
                setMensajeAlerta({type: "success", message: "Imagen eliminada correctamente."})
            }

            await sincronizar()
        }catch(error){
            console.error("Error al eliminar imagen del producto", error)
            setMensajeAlerta({type: "danger", message: error?.message || "No se pudo eliminar la imagen."})
        }finally{
            setImagenAEliminar(null)
            setCargando(false)
        }
    }

    const pedirEliminacion = (idImagenProducto) => {
        setImagenAEliminar(idImagenProducto)
        setMostrarConfirmacion(true)
    }

    const cancelarEliminacion = () => {
        setImagenAEliminar(null)
        setMostrarConfirmacion(false)
    }

    return(
        <>
        <div className="border border-black rounded p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Imágenes</h5>

                <div className="d-flex gap-2">
                    <label className={`btn btn-dark btn-sm mb-0${cargando ? " disabled" : ""}`}>
                        <i className="bi bi-upload me-1"></i>
                        Subir imagen
                        <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            disabled={cargando}
                            onChange={handleArchivo}/>
                    </label>

                    {
                        imagenes.length > 0 &&
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={cargando}
                            onClick={()=>pedirEliminacion("todas")}>
                            <i className="bi bi-trash me-1"></i>
                            Quitar todas
                        </button>
                    }
                </div>
            </div>

            {
                imagenes.length === 0
                ? <p className="text-secondary mb-0">Este producto todavía no tiene imágenes.</p>
                : <div className="d-flex flex-wrap gap-2">
                    {
                        imagenes.map((imagen, indice) => (
                            <div key={imagen.idImagenProducto ?? indice} className="position-relative">
                                <img
                                    src={imagen.url}
                                    alt={imagen.textoAlternativo ?? ""}
                                    className="rounded border"
                                    style={{ width:"6rem", height:"6rem", objectFit:"cover" }}/>
                                {
                                    imagen.principal &&
                                    <span className="badge text-bg-dark position-absolute top-0 start-0 m-1">Principal</span>
                                }
                                <button
                                    type="button"
                                    className="btn btn-danger position-absolute top-0 end-0 m-1 py-0 px-1"
                                    disabled={cargando}
                                    aria-label="Eliminar imagen"
                                    onClick={()=>pedirEliminacion(imagen.idImagenProducto)}>
                                    <i className="bi bi-x"></i>
                                </button>
                            </div>
                        ))
                    }
                </div>
            }

            <div className="mt-3">
                <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={()=>setMensajeAlerta(null)}/>
            </div>
        </div>

        {
            mostrarConfirmacion &&
            <ConfirmModal
                show={mostrarConfirmacion}
                title="Eliminar imagen"
                message={
                    imagenAEliminar === "todas"
                    ? "¿Estás seguro de quitar todas las imágenes del producto?"
                    : "¿Estás seguro de eliminar esta imagen?"
                }
                confirmText="Eliminar"
                variant="danger"
                icon="bi-trash"
                onConfirm={handleConfirmarEliminar}
                onCancel={cancelarEliminacion}
                disabled={cargando}/>
        }
        </>
    )
}