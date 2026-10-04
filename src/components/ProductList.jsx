import { useNavigate } from "react-router-dom"
import { ProductCard } from "./ProductCard"

export function ProductList({ products, cols }) {

  const classCol = `row-cols-1 row-cols-sm-2 row-cols-md-${cols}`
  const navigate = useNavigate()

  const cards = []
  for (let i = 0; i < products.length; i++) {
    cards.push(
      <div className="col d-flex" key={products[i].idProducto}>
        <ProductCard
          product={products[i]}
          handleClick={() => {navigate(`/detalleProducto/${products[i].idProducto}`)}}
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