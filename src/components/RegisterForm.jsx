import { useEffect, useState } from "react"
import { obtenerRegionesComunas } from "../services/regionComunaService"


export function RegisterForm(){

    const [regionesComunas, setRegionesComunas] = useState([])
    const [mensajeFormulario, setMensajeFormulario] = useState("")
    const dominiosPermitidos = ["duoc.cl", "gmail.com", "profesor.duoc.cl"]

    useEffect(()=>{

        const loadRegionesComunas = async () =>{
            try{
                const data = await obtenerRegionesComunas()
                setRegionesComunas(data)
            }catch(error){
                console.error("Error al cargar comunas de regiones", error)
            }
        }

        loadRegionesComunas()
    },[])

    const [comunas, setComunas] = useState([])

    const [formulario, setFormulario] = useState({
        nombre:"",
        email:"",
        emailConfirm:"",
        password:"",
        passwordConfirm:"",
        telefono:"",
        selectRegion:"", 
        selectComuna:"",
    })

    const handleChange = (e)=>{
        const {name, value} = e.target

        setFormulario({
            ...formulario,
            [name]:value
        })

        if(name === "selectRegion"){
            if(value != ""){

                const listaComunas = regionesComunas.find((item) => item.idRegion == value).comunas
                setComunas(
                    listaComunas.map((c)=>{
                        return <option value={c.idComuna} key={c.idComuna}>{c.nombre}</option>
                    })
                )
            }
        }
    }

    const handleSubmit = (e)=>{
        e.preventDefault()
        setMensajeFormulario("")

        console.log(formulario)
        console.log(formulario.email.split("@")[1])

        // Validación dominios permitidos
        if(!dominiosPermitidos.includes(formulario.email.split("@")[1])){
            setMensajeFormulario("Dominio de correo no permitido")
            return
        }

        // Mensajes de error
        if(formulario.email != formulario.emailConfirm){
            setMensajeFormulario("Los correos no coinciden")
            return
        }

        if(formulario.password != formulario.passwordConfirm){
            setMensajeFormulario("Las contraseñas no coinciden")
            return
        }

        if(formulario.selectRegion === ""){
            setMensajeFormulario("Seleccione una región")
            return
        }

        if(formulario.selectComuna === ""){
            setMensajeFormulario("Seleccione una comuna")
            return
        }
    }


    return(
        <div className="register-form border border-black p-5 rounded-2 shadow">
            <form onSubmit={handleSubmit}>
                <div className="h3 mb-5 text-center">Formulario de Registro</div>
                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre completo</label>
                    <input 
                        type="text" 
                        className="form-control border-black" 
                        name="nombre"
                        maxLength={100} 
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo*</label>
                    <input 
                        type="email" 
                        className="form-control border-black" 
                        name="email" 
                        maxLength={100}
                        onChange={handleChange}
                        required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="emailConfirm" className="form-label">Confirme correo*</label>
                    <input 
                        type="email" 
                        className="form-control border-black" 
                        name="emailConfirm"
                        maxLength={100} 
                        onChange={handleChange}
                        required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña*</label>
                    <input 
                        type="password" 
                        className="form-control border-black" 
                        name="password"
                        minLength={4}
                        maxLength={10}
                        onChange={handleChange}
                        required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="passwordConfirm" className="form-label">Confirme Contraseña*</label>
                    <input 
                        type="password" 
                        className="form-control border-black" 
                        name="passwordConfirm"
                        minLength={4}
                        maxLength={10}
                        onChange={handleChange}
                        required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="telefono" className="form-label">Teléfono</label>
                    <input 
                        type="text" 
                        className="form-control border-black" 
                        name="telefono"
                        maxLength={9}
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <div className="row">
                        <div className="col">
                            <label htmlFor="selectRegion" className="form-label">Region*</label>
                            <select name="selectRegion" className="form-select border-black" onChange={handleChange}>
                                <option value="">-- Seleccione Región --</option>
                                {
                                    regionesComunas.map((r)=>{
                                        return <option value={r.idRegion} key={r.idRegion}>{r.region}</option>
                                    })
                                    
                                }
                            </select>
                        </div>
                        <div className="col">
                            <label htmlFor="selectComuna" className="form-label">Comuna*</label>
                            <select name="selectComuna" className="form-select border-black" onChange={handleChange}>
                                <option value="">-- Seleccione Comuna --</option>
                                {comunas}
                            </select>
                        </div>
                    </div>
                    
                </div>

                {
                /* Mensaje de validación de campos */
                mensajeFormulario != "" && <p className="text-danger">{mensajeFormulario}</p>
                }
                
                <button type="submit" className="btn btn-dark mt-4">Registrar</button>
            </form>
        </div>
    )
}