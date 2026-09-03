
import { useEffect, useState } from "react"
import { UsersTable } from "../../components/UsersTable"

import { obtenerUsuarios } from "../../services/usuarioService"


export function AdminControlUser(){

    const [users, setUsers] = useState([])

    // Cargar usuarios
    useEffect(()=>{
        const loadUsers = async ()=>{
            try{
                const data = await obtenerUsuarios()
                setUsers(data)
                console.log("Usuarios cargados", users)
            }catch(error){
                console.error("Error al cargar usuarios", error)
            }
        }
        loadUsers()
    },[])

    return(
        <div className="container mb-5">
            <h2 className="mb-5">Adminitración Usuarios</h2>
            <UsersTable dataUser={users}/>
            <div>
                <button className="btn btn-dark">Editar</button>
            </div>
        </div>
        
    )
}