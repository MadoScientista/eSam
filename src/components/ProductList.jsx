import { useNavigate } from "react-router-dom"
import { ProductCard } from "./ProductCard"

export function ProductList({ products, cols }) {

  const classCol = `row-cols-1 row-cols-sm-2 row-cols-md-${cols}`
  const navigate = useNavigate()

  const cards = []
  for (let i = 0; i < products.length; i++) {
    cards.push(
      <div className="col d-flex" key={i}>
        <ProductCard 
          product={products[i]} 
          handleClick={() => {navigate(`/detalleProducto/${products[i].sku}`)}}
        />
      </div>
    )
  }

  return (
    <div className={`mb-5 row ${classCol} g-4`}>
      {cards}
    </div>
  )
}