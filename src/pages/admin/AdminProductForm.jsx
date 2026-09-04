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
        }else{
            setFormulario({})
        }
    },[sku])


    const handleChange = (e) => {
        const {name, value} = e.target

        setFormulario(
            {
                ...formulario,
                [name]:value
            }
        )
    }

    const handleSubmit = (e) =>{
        e.preventDefault()
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
                                onChange={handleChange}/>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="descripcion" className="form-label fw-bold">Descripción</label>
                            <textarea 
                                className="form-control border-black"
                                name="descripcion" 
                                rows="3"
                                placeholder="Descripción de producto"
                                value={formulario.descripcion || ""}
                                onChange={handleChange}>
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
                                    onChange={handleChange}/>
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
                                    onChange={handleChange}/>
                            </div>
                            {formulario.stock && <small className="text-secondary">Quedan: {formulario.stock}</small>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="marca" className="form-label fw-bold">Marca</label>
                            <div className="w-50">
                                <input 
                                    type="text" 
                                    className="form-control border-black"
                                    name="marca"
                                    maxLength={10}
                                    placeholder="Marca producto"
                                    value={formulario.marca || ""}
                                    onChange={handleChange}/>
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
                                onChange={handleChange}/>
                        </div>

                        {
                            /* Mensaje de validación de campos */
                            mensajeFormulario != "" && <p className="text-danger">{mensajeFormulario}</p>
                        }
                        
                        <div className="mt-4">
                            <button type="submit" className="btn btn-dark me-3">Guardar</button>
                            
                            {sku && <button type="button" className="btn btn-danger">Eliminar</button>}
                        </div>
                        
                    </div>
                </div>
            </form>
        </div>
        </>
    )
}