import { NavLink } from "react-router-dom"
import { Carousel } from './Carousel'


export function Banner(){
    return(
        <div className="container mb-4 border p-5 rounded">
            <div className="row">
                <div className="col">
                <div className='h1'>Bienvenido a ESam</div>
                <p>Encuentra todos los productos escolares que necesitas</p>
                <NavLink className='btn btn-dark' to="productos">Revisa nuestro catálogo</NavLink>
                </div>
                <div className="col">
                    <Carousel/>
                </div>
                
            </div>
        </div>
    )
}