

export function RegisterForm(){
    return(
        <div className="register-form border p-5 rounded-2">
            <form>
                <div className="h3 mb-5 text-center">Formulario de Registro</div>
                <div className="mb-3">
                    <label for="exampleInputEmail1" className="form-label">Nombre completo</label>
                    <input type="text" className="form-control" id="userFullName" aria-describedby="emailHelp"/>
                </div>
                <div className="mb-3">
                    <label for="exampleInputEmail1" className="form-label">Correo</label>
                    <input type="email" className="form-control" id="userEmail" aria-describedby="emailHelp"/>
                </div>
                <div className="mb-3">
                    <label for="exampleInputEmail1" className="form-label">Confirme correo</label>
                    <input type="email" className="form-control" id="userEmailConfirm" aria-describedby="emailHelp"/>
                </div>
                <div className="mb-3">
                    <label for="exampleInputPassword1" className="form-label">Contraseña</label>
                    <input type="password" className="form-control" id="userPassword"/>
                </div>
                <div className="mb-3">
                    <label for="exampleInputPassword1" className="form-label">Confirme Contraseña</label>
                    <input type="password" className="form-control" id="userPasswordConfirm"/>
                </div>
                <div className="mb-3">
                    <label for="exampleInputPassword1" className="form-label">Teléfono</label>
                    <input type="text" className="form-control" id="userPasswordConfirm"/>
                </div>
                <div className="mb-3">
                    <div className="row">
                        <div className="col">
                            <label htmlFor="selectRegion" className="form-label">Region</label>
                            <select id="selectRegion" class="form-select" aria-label="Default select example">
                                <option selected value="0">-- Seleccione Región --</option>
                                <option value="1">Región Metropolitana</option>
                                <option value="2">Atacama</option>
                                <option value="3">Antofagasta</option>
                            </select>
                        </div>
                        <div className="col">
                            <label htmlFor="selectComuna" className="form-label">Comuna</label>
                            <select id="selectRegion" class="form-select" aria-label="Default select example">
                                <option selected value="0">-- Seleccione Comuna --</option>
                                <option value="1">Región Metropolitana</option>
                                <option value="2">Atacama</option>
                                <option value="3">Antofagasta</option>
                            </select>
                        </div>
                    </div>
                    
                </div>
                <button type="submit" className="btn btn-dark mt-4">Registrar</button>
            </form>
        </div>
    )
}