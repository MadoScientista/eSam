import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { obtenerProductoSku } from "../../services/productoService"

export function AdminProductForm(){
    
    const {sku} = useParams()
    const [formulario, setFormulario] = useState({})
    const [mensajeFormulario, setMensajeFormulario] = useState("")

    useEffect(()=>{
        if(sku){
            const cargarProducto = async () =>{
                try{
                    const data = await obtenerProductoSku(sku)
                    setFormulario(data)
                }catch(error){
                    console.error("Error al cargar producto", error)
                }
            }
            cargarProducto()
        }
    },[])


    const handleChange = (e) => {
        const {name, value} = e.target

        setFormulario(
            {
                ...formulario,
                [name]:value
            }
        )
    }

    const handleSubmit = () =>{
        e.preventDefault()
    }

    return(
        <>
        <div className="register-form border border-dark p-5 rounded-2">
            <form onSubmit={handleSubmit}>
                {sku ?
                    <div className="h3 mb-5 text-center">Detalle producto sku: {sku}</div>:
                    <div className="h3 mb-5 text-center">Nuevo Producto</div>
                }
                
                <div className="mb-4">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <input 
                        type="text" 
                        className="form-control border-black" 
                        name="nombre"
                        maxLength={100}
                        placeholder="Nombre producto"
                        value={formulario.nombre || ""}
                        onChange={handleChange}/>
                </div>

                <div className="d-flex mb-4 gap-3 text-center">
                    <div className="mb-3">
                        <label htmlFor="precio" className="form-label">Precio</label>
                        <input 
                            type="text" 
                            className="form-control text-center border-black" 
                            name="precio"
                            maxLength={10}
                            placeholder="$1.000"
                            value={formulario.precio || ""}
                            onChange={handleChange}/>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="stock" className="form-label">Stock</label>
                        <input 
                            type="text" 
                            className="form-control text-center border-black"
                            name="stock"
                            maxLength={10}
                            placeholder="10"
                            value={formulario.stock || ""}
                            onChange={handleChange}/>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="marca" className="form-label">Marca</label>
                        <input 
                            type="text" 
                            className="form-control text-center border-black"
                            name="marca"
                            maxLength={10}
                            placeholder="Marca producto"
                            value={formulario.marca || ""}
                            onChange={handleChange}/>
                    </div>
                </div>
                

                <div className="mb-4">
                    <label htmlFor="img" className="form-label">Ruta imagen</label>
                    <input 
                        type="text" 
                        className="form-control border-black" 
                        name="img"
                        maxLength={10}
                        placeholder="https://imagen.com"
                        value={formulario.img || ""}
                        onChange={handleChange}/>
                </div>

                <div className="mb-4">
                    <label htmlFor="descripcion" className="form-label">Descripcion</label>
                    <textarea 
                        className="form-control border-black"
                        name="descripcion" 
                        rows="3"
                        placeholder="Descripción de producto"
                        value = {formulario.descripcion || ""}
                        onChange={handleChange}>
                    </textarea>
                </div>

                {
                /* Mensaje de validación de campos */
                mensajeFormulario != "" && <p className="text-danger">{mensajeFormulario}</p>
                }
                
                <button type="submit" className="btn btn-dark mt-4">Guardar</button>
            </form>
        </div>
        </>
    )
}