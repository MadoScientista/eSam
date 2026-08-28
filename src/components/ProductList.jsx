import { ProductCard } from "./ProductCard"


export function ProductList({products, rows, cols}){


    const productList = products.map((p)=>{

        
        return (
            <ProductCard product={p} key={p.nombre}/>
        )
    })

    return (
        productList
    )
}