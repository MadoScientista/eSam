import { ProductCard } from '../components/ProductCard'
import { Banner } from '../components/Banner'
import { ProductList } from '../components/ProductList'

import {products} from '../const/products'

export function Home(){
    return <>
        <Banner/>
        <div className='container p-0'>
            <h2 className='mb-3'>Productos destacados</h2>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                <ProductList products={products} cols={2}/>
            </div>
        </div>
    </>
}