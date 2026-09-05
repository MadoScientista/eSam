

import { useEffect, useRef } from "react"
import { Carousel as BootstrapCarousel } from "bootstrap"

export function Carousel(){
    const carouselRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = carouselRef.current
        if (!element) return

        const instancia = new BootstrapCarousel(element, { ride: "carousel", interval: 2500 })

        return () => instancia.dispose()
    }, [])

    return(
        <>
        <div ref={carouselRef} id="carouselExampleIndicators" className="carousel slide">
        <div className="carousel-indicators">
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div className="carousel-inner">
            <div className="carousel-item active">
            <img 
                src="https://www.papelaria.cl/cdn/shop/files/9781441321343_1800x1800_7ef6ffe9-83df-40a8-b6cd-193bd5d311f2.jpg?v=1756996325&width=1000" 
                className="d-block w-100" 
                style={{ height: "400px", objectFit: "cover" }}
                alt="..."/>
            </div>
            <div className="carousel-item">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtjboPUMEqo9re7Hkk6YnT9uKxBIbNaPidtjvWarXtQCkhf1mAH84A2lDP&s=10" 
                className="d-block w-100" 
                style={{ height: "400px", objectFit: "cover" }}
                alt="..."/>
            </div>
            <div className="carousel-item">
            <img src="https://dimeiggsschl.vtexassets.com/arquivos/ids/172314-800-auto?v=638448973001900000&width=800&height=auto&aspect=true" 
                className="d-block w-100" 
                style={{ height: "400px", objectFit: "cover" }}
                alt="..."/>
            </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
        </button>
        </div>
        </>
    )
}