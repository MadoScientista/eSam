import { useState } from "react"
import { regionesComunas } from "../const/regionesComunas"


export function RegisterForm(){
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

    const [comunas, setComunas] = useState([])

    const handleChange = (e)=>{
        const {name, value} = e.target

        setFormulario({
            ...formulario,
            [name]:value
        })

        if(name === "selectRegion"){
            if(value != ""){
                const listaComunas = regionesComunas[value]["comunas"]
                setComunas(
                    listaComunas.map((c,i)=>{
                        return <option value={i} key={`c${i}`}>{c}</option>
                    })
                )
            }
        }
    }

    const handleSubmit = (e)=>{
        e.preventDefault()
        console.log(formulario)
    }


    return(
        <div className="register-form border p-5 rounded-2">
            <form onSubmit={handleSubmit}>
                <div className="h3 mb-5 text-center">Formulario de Registro</div>
                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre completo</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="nombre"
                        maxLength={100} 
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        name="email" 
                        maxLength={100}
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="emailConfirm" className="form-label">Confirme correo</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        name="emailConfirm"
                        maxLength={100} 
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        name="password"
                        minLength={4}
                        maxLength={10}
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="passwordConfirm" className="form-label">Confirme Contraseña</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        name="passwordConfirm"
                        minLength={4}
                        maxLength={10}
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="telefono" className="form-label">Teléfono</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="telefono"
                        maxLength={9}
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <div className="row">
                        <div className="col">
                            <label htmlFor="selectRegion" className="form-label">Region</label>
                            <select name="selectRegion" className="form-select" onChange={handleChange}>
                                <option value="">-- Seleccione Región --</option>
                                {
                                    regionesComunas.map((r, i)=>{
                                        return <option value={i} key={`r${i}`}>{r.region}</option>
                                    })
                                    
                                }
                            </select>
                        </div>
                        <div className="col">
                            <label htmlFor="selectComuna" className="form-label">Comuna</label>
                            <select name="selectComuna" className="form-select" onChange={handleChange}>
                                <option value="">-- Seleccione Comuna --</option>
                                {comunas}
                            </select>
                        </div>
                    </div>
                    
                </div>
                <button type="submit" className="btn btn-dark mt-4">Registrar</button>
            </form>
        </div>
    )
}