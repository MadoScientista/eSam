

export function LoginForm(){
    return (
        <div className="login-form border p-5 rounded-2 mb-5">
            <form>
                <div className="h3">Inicio de Sesión</div>
                <div className="mb-3">
                    <label for="exampleInputEmail1" className="form-label">Correo</label>
                    <input type="email" className="form-control" id="userEmail" aria-describedby="emailHelp"/>
                </div>
                <div className="mb-3">
                    <label for="exampleInputPassword1" className="form-label">Contraseña</label>
                    <input type="password" className="form-control" id="userPassword"/>
                </div>
                <button type="submit" className="btn btn-dark">Entrar</button>
            </form>
        </div>
    )
}