import { NavLink } from "react-router-dom"



export function Banner( {children} ){
    return(
        <div className="container-fluid mb-4 border p-5 rounded">
            <div className="container">
                <div className="row">
                    <div className="col">
                    <div className='h1'>Bienvenido a ESam</div>
                    <p>Encuentra todos los productos escolares que necesitas</p>
                    <NavLink className='btn btn-dark' to="productos">Revisa nuestro catálogo</NavLink>
                    </div>
                    <div className="col">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}