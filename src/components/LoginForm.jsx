import { useState } from "react"

export function LoginForm(){
    
    const [ formulario, setFormulario ] = useState({
        email: "",
        password: ""
    })

    const handleChange = (e)=>{

        // Almacena en un objeto el nombre
        // y valor del objetivo del evento
        const {name, value} = e.target

        // Copia el objeto formulario actual
        // y modifica el campo objetivo
        setFormulario({
            ...formulario,
            [name]: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if(validarFormulario()){
            console.log("Sesión iniciada")
        }else{
            console.log("Error al iniciar sesión")
        }

    }

    const validarFormulario = () =>{
        
        // Validación dominio del correo
        const dominiosValidos = ["duoc.cl", "profesor.duoc.cl", "gmail.com"]
        const dominio = formulario.email.split("@")[1]

        if(!dominiosValidos.includes(dominio)){
            console.log("Dominio inválido")
            return false
        }

        return true
    }

    return (
        <div className="login-form border p-5 rounded-2 mb-5">
            <form onSubmit={handleSubmit}>
                <div className="h3">Inicio de Sesión</div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        name="email" 
                        maxLength={100} // Longitud máxma 100 caracteres
                        required        // Correo requerido
                        value={formulario.email} 
                        onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Contraseña</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        name="password" 
                        minLength={4}   // Longitud mínima 4 caracteres
                        maxLength={10}  // Longitud máxima 10 caracteres
                        required        // Contraseña requerida
                        value={formulario.password}
                        onChange={handleChange}/>
                </div>
                <button type="submit" className="btn btn-dark">Entrar</button>
            </form>
        </div>
    )
}