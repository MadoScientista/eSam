

export function ContactForm(){
    return(
        <div className="register-form border border-black p-5 rounded-2 shadow">
            <form>
                <div className="h3 mb-5 text-center">Formulario de Contacto</div>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Nombre completo</label>
                    <input type="text" className="form-control border-black" id="userFullName" aria-describedby="emailHelp"/>
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Correo</label>
                    <input type="email" className="form-control border-black" id="userEmail" aria-describedby="emailHelp"/>
                </div>
                 <div className="form-group">
                    <label htmlFor="userMessage">Example textarea</label>
                    <textarea className="form-control border-black" id="userMessage" rows="3"></textarea>
                </div>
                <button type="submit" className="btn btn-dark mt-4">Enviar</button>
            </form>
        </div>
    )
}