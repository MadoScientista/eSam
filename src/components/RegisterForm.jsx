

export function RegisterForm(){
    return(
        <div className="login-form border p-5 rounded-2">
            <form>
                <div className="h3">Formulario de Registro</div>
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
                <button type="submit" className="btn btn-dark">Entrar</button>
            </form>
        </div>
    )
}