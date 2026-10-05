import { useEffect, useState } from "react";
import { CategoryBanner } from "../components/CategoryBanner";
import { obtenerCategorias } from "../services/categoriaService";

export function Category(){

    const [categories, setCategories] = useState([])

    useEffect(() => {
            const cargarCategorias = async () =>{
                try{
                    const data = await obtenerCategorias();
                    setCategories(data)
                }catch(error){
                    console.error("Error al cargar categorias", error)
                }
            }
    
            cargarCategorias()
        }, [])

    return (
        <>
            <div className="container mt-5">
                <h2>Categorías</h2>
                <CategoryBanner categories={categories}/>
            </div> 
        </>
    )
}