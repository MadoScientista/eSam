
import { Banner } from '../components/Banner'
import { ProductList } from '../components/ProductList'
import { Carousel } from '../components/Carousel'
import {products} from '../const/products'

export function Home(){
    return <>
        <Banner><Carousel/></Banner>
        <div className='container p-0'>
            <h2 className='mb-4'>Productos destacados</h2>
            <ProductList products={products.slice(0,5)} cols={5}/>
        </div>
    </>
}