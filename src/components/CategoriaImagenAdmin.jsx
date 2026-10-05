import { useState } from "react"
import { subirImagenCategoria, eliminarImagenCategoria } from "../services/categoriaService"
import { validarImagenCategoria } from "../utils/categoria"
import { AlertMessage } from "./AlertMessage"
import { ConfirmModal } from "./ConfirmModal"

// La categoría tiene una sola imagen de portada. El backend la sube o reemplaza
// con multipart en el campo "file" (no admite principal, orden ni texto
// alternativo) y devuelve el CategoriaDTO con "imagenUrl" ya actualizado.
export function CategoriaImagenAdmin({ idCategoria, imagenUrl, onSincronizar }) {

    const [cargando, setCargando] = useState(false)
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    const handleArchivo = async (e) => {
        const archivo = e.target.files?.[0]
        e.target.value = ""

        if(!archivo) return

        const errorValidacion = validarImagenCategoria(archivo)

        if(errorValidacion){
            setMensajeAlerta({type: "danger", message: errorValidacion})
            return
        }

        setCargando(true)
        try{
            const actualizada = await subirImagenCategoria(idCategoria, archivo)

            onSincronizar(actualizada?.imagenUrl ?? null)
            setMensajeAlerta({type: "success", message: "Imagen de portada actualizada correctamente."})
        }catch(error){
            console.error("Error al subir imagen de la categoría", error)
            setMensajeAlerta({type: "danger", message: error?.message || "No se pudo subir la imagen."})
        }finally{
            setCargando(false)
        }
    }

    const handleConfirmarEliminar = async () => {
        setMostrarConfirmacion(false)
        setCargando(true)

        try{
            await eliminarImagenCategoria(idCategoria)

            onSincronizar(null)
            setMensajeAlerta({type: "success", message: "Imagen de portada eliminada correctamente."})
        }catch(error){
            console.error("Error al eliminar imagen de la categoría", error)
            setMensajeAlerta({type: "danger", message: error?.message || "No se pudo eliminar la imagen."})
        }finally{
            setCargando(false)
        }
    }

    return(
        <>
        <div className="border border-black rounded p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Imagen de portada</h5>

                <div className="d-flex gap-2">
                    <label className={`btn btn-dark btn-sm mb-0${cargando ? " disabled" : ""}`}>
                        <i className="bi bi-upload me-1"></i>
                        {imagenUrl ? "Reemplazar imagen" : "Subir imagen"}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="d-none"
                            disabled={cargando}
                            onChange={handleArchivo}/>
                    </label>

                    {
                        imagenUrl &&
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={cargando}
                            onClick={()=>setMostrarConfirmacion(true)}>
                            <i className="bi bi-trash me-1"></i>
                            Quitar imagen
                        </button>
                    }
                </div>
            </div>

            {
                imagenUrl
                ? <img
                    src={imagenUrl}
                    alt="Imagen de portada de la categoría"
                    className="rounded border"
                    style={{ width:"10rem", height:"7rem", objectFit:"cover" }}/>
                : <p className="text-secondary mb-0">
                    Esta categoría todavía no tiene imagen de portada. Se aceptan JPEG, PNG y WebP de hasta 5 MB.
                </p>
            }

            <div className="mt-3">
                <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={()=>setMensajeAlerta(null)}/>
            </div>
        </div>

        {
            mostrarConfirmacion &&
            <ConfirmModal
                show={mostrarConfirmacion}
                title="Quitar imagen de portada"
                message="¿Estás seguro de quitar la imagen de portada de la categoría?"
                confirmText="Quitar"
                variant="danger"
                icon="bi-trash"
                onConfirm={handleConfirmarEliminar}
                onCancel={()=>setMostrarConfirmacion(false)}
                disabled={cargando}/>
        }
        </>
    )
}