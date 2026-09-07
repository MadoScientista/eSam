import { ContactForm } from "../components/ContactForm";

const datosContacto = [
    { icon: "bi-geo-alt", text: "Av. de los Estudiantes 1234, Ciudad Central" },
    { icon: "bi-telephone", text: "(+56) 22554878" },
    { icon: "bi-envelope", text: "hola@esam.com" },
    { icon: "bi-clock", text: "Lun a Vie de 08:00 a 19:00 · Sáb de 09:00 a 15:00" },]

const redesSociales = [
    { icon: "bi-instagram", label: "Instagram" },
    { icon: "bi-facebook", label: "Facebook" },
    { icon: "bi-whatsapp", label: "WhatsApp" },
]

export function Contact(){
    return (
        <div className="container pt-5 pb-5">
            <div className="row g-5">
                <div className="col-lg-6 order-lg-2">
                    <h2 className="mb-3 mt-5">Contáctanos</h2>
                    <p className="text-secondary">
                        ¿Tienes dudas, quieres hacer un pedido especial o querés comprar para tu escuela?
                        Envíanos un mensaje y cuéntanos en qué te podemos ayudar.
                    </p>

                    <div className="mt-4">
                        {datosContacto.map((dato, index) => (
                            <div className="d-flex align-items-start" key={index}>
                                <i className={`bi ${dato.icon} fs-5 text-primary me-3`}></i>
                                <span className="fs-6">{dato.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex align-items-center gap-3 mt-5">
                        <span className="fw-bold">Seguinos en redes</span>
                        {redesSociales.map((red, index) => (
                            <a href="#" className="btn btn-outline-dark btn-sm" aria-label={red.label} key={index}>
                                <i className={`bi ${red.icon}`}></i>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="col-lg-6 order-lg-1">
                    <ContactForm/>
                </div>
            </div>
        </div>
    )
}