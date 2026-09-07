export function AboutUs(){
    const valores = [
        { icon: "bi-patch-check", text: "Calidad: marcas confiables que duran todo el año." },
        { icon: "bi-chat-heart", text: "Cercanía: te asesoramos antes, durante y después de la compra." },
        { icon: "bi-hand-thumbs-up", text: "Compromiso: precios transparentes y entregas puntuales." },
        { icon: "bi-people-fill", text: "Comunidad: apoyamos a escuelas y proyectos educativos locales." },
    ]

    return (
        <div className="container pt-5 pb-5">
            <div className="col-lg-8 mx-auto">
                <h2 className="mb-4">Sobre nosotros</h2>

                <p className="lead">
                    En eSam creemos que comprar útiles escolares no debería ser una odisea.
                    Desde 2018 ayudamos a estudiantes, docentes y familias a encontrar todo lo
                    que necesitan para el inicio de clases, con precios justos y un trato cercano.
                </p>

                <h4 className="mt-5">Nuestra historia</h4>
                <p className="lh-lg">
                    eSam nació en un pequeño local de barrio con una sola vitrina y mucho entusiasmo.
                    Lo que empezó como un negocio familiar de cuadernos y lápices, hoy es una tienda
                    que surte a escuelas de toda la región. A lo largo de los años mantuvimos intacta
                    la idea que nos dio origen: atender a cada cliente como si fuera parte de la familia.
                </p>

                <h4 className="mt-5">Nuestra misión</h4>
                <p className="lh-lg">
                    Facilitar el acceso a materiales de calidad para que nadie se quede sin herramientas
                    para aprender. Queremos que cada estudiante llegue a su aula con todo lo necesario,
                    sin que el bolsillo sea un obstáculo.
                </p>

                <h4 className="mt-5">Nuestros valores</h4>
                <ul className="list-unstyled mt-3">
                    {valores.map((valor, index) => (
                        <li className="mb-2 d-flex align-items-start" key={index}>
                            <i className={`bi ${valor.icon} text-primary me-2`}></i>
                            <span>{valor.text}</span>
                        </li>
                    ))}
                </ul>

                <h4 className="mt-5 mb-3">Dónde encontrarnos</h4>
                <p className="mb-1"><i className="bi bi-geo-alt text-primary me-2"></i>Av. de los Estudiantes 1234, Ciudad Central</p>
                <p className="mb-1"><i className="bi bi-telephone text-primary me-2"></i>(11) 555-0199</p>
                <p className="mb-0"><i className="bi bi-envelope text-primary me-2"></i>hola@esam.com</p>
            </div>
        </div>
    )
}