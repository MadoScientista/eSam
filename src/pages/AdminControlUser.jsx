
import { UsersTable } from "../components/UsersTable"
import {users} from "../const/users"

export function AdminControlUser(){
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