import { ProductCard } from "./ProductCard"


export function ProductList({products, cols}){

    let row = []
    let productList = []

    for(let n = 0 ; n < products.length; n += cols){
        row = []
        for(let nCol = 0; nCol < cols; nCol++){
            row.push(<ProductCard product={products[n]} key={products[n].nombre}/>)

            if(n == products.length){
                break
            }
        }
        
        productList.push(row)
    }

    
    return (
        productList
    )
}