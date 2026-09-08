import { useState } from "react"
import { AlertMessage } from "./AlertMessage"

export function ContactForm() {

    const [mensajeAlerta, setMensajeAlerta] = useState(null)
    const [formulario, setFormulario] = useState({
        nombre: "",
        correo: "",
        motivo: "Consulta general",
        mensaje: ""
    })

    const handleChange = (e) => {
        setFormulario({
            ...formulario,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!formulario.nombre || !formulario.correo || !formulario.mensaje) return

        setMensajeAlerta({
            type: "success",
            message: "Tu mensaje fue enviado. Te responderemos a la brevedad."
        })

        setFormulario({
            nombre: "",
            correo: "",
            motivo: "Consulta general",
            mensaje: ""
        })
    }

    return (
        <form className="register-form border border-black p-5 rounded-2 shadow-sm" onSubmit={handleSubmit}>
            <div className="h3 mb-5 text-center">Enviános un mensaje</div>

            <div className="mb-3">
                <label htmlFor="contactNombre" className="form-label">Nombre completo</label>
                <div className="input-group">
                    <span className="input-group-text bg-white border-black"><i className="bi bi-person"></i></span>
                    <input
                        type="text"
                        className="form-control border-black"
                        id="contactNombre"
                        name="nombre"
                        value={formulario.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        required
                    />
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="contactCorreo" className="form-label">Correo</label>
                <div className="input-group">
                    <span className="input-group-text bg-white border-black"><i className="bi bi-envelope"></i></span>
                    <input
                        type="email"
                        className="form-control border-black"
                        id="contactCorreo"
                        name="correo"
                        value={formulario.correo}
                        onChange={handleChange}
                        placeholder="tucorreo@ejemplo.com"
                        required
                    />
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="contactMotivo" className="form-label">Motivo</label>
                <div className="input-group">
                    <span className="input-group-text bg-white border-black"><i className="bi bi-tag"></i></span>
                    <select
                        className="form-select border-black"
                        id="contactMotivo"
                        name="motivo"
                        value={formulario.motivo}
                        onChange={handleChange}
                    >
                        <option>Consulta general</option>
                        <option>Pedidos y compras</option>
                        <option>Ventas a escuelas</option>
                        <option>Reclamos</option>
                        <option>Otro</option>
                    </select>
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="contactMensaje" className="form-label">Mensaje</label>
                <textarea
                    className="form-control border-black"
                    id="contactMensaje"
                    name="mensaje"
                    rows="5"
                    value={formulario.mensaje}
                    onChange={handleChange}
                    placeholder="Dinos en qué te podemos ayudar"
                    required
                ></textarea>
            </div>

            <button type="submit" className="btn btn-dark mt-2">
                <i className="bi bi-send me-2"></i>
                Enviar
            </button>

            <div className="mt-3">
                <AlertMessage
                    type={mensajeAlerta?.type}
                    message={mensajeAlerta?.message}
                    onClose={() => setMensajeAlerta(null)}
                />
            </div>
        </form>
    )
}