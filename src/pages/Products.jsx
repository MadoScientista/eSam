import { ProductList } from '../components/ProductList'
import { products } from '../const/products'

export function Products(){
    return (
    <div className='container mt-4'>
        <h2 className='mb-4'>Nuestros productos</h2>
        <ProductList products={products} cols={5}/>
    </div>
    )
}