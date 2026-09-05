import { useEffect, useState } from "react"
import { obtenerRegionesComunas } from "../services/regionComunaService"
import { crearUsuario, actualizarUsuario, obtenerUsuarioId, obtenerRolesUsuario } from "../services/usuarioService"
import { validarRut, descomponerRut } from "../utils/rut"
import { AlertMessage } from "./AlertMessage"


const ID_ROL_CLIENTE = 3

const formularioVacio = {
    nombres: "",
    aPaterno: "",
    aMaterno: "",
    rut: "",
    correo: "",
    correoConfirm: "",
    password: "",
    passwordConfirm: "",
    telefono: "",
    fechaNacimiento: "",
    direccion: "",
    idRegion: "",
    idComuna: "",
    idRolUsuario: ""
}

const dominiosPermitidos = ["duoc.cl", "gmail.com", "profesor.duoc.cl"]

export function RegisterForm({ modo = "cliente", idUsuario }){

    const esAdmin = modo === "admin"
    const esEdicion = Boolean(idUsuario)

    const [regionesComunas, setRegionesComunas] = useState([])
    const [roles, setRoles] = useState([])
    const [comunas, setComunas] = useState([])
    const [formulario, setFormulario] = useState(formularioVacio)
    const [mensajeAlerta, setMensajeAlerta] = useState(null)

    useEffect(()=>{
        const loadRegionesComunas = async () =>{
            try{
                const data = await obtenerRegionesComunas()
                setRegionesComunas(data)
            }catch(error){
                console.error("Error al cargar regiones y comunas", error)
            }
        }

        loadRegionesComunas()
    },[])

    useEffect(()=>{
        if(esAdmin){
            const loadRoles = async () =>{
                try{
                    const data = await obtenerRolesUsuario()
                    setRoles(data)
                }catch(error){
                    console.error("Error al cargar roles", error)
                }
            }
            loadRoles()
        }
    },[esAdmin])

    // Carga los datos del usuario para edición
    useEffect(()=>{
        const loadUsuario = async () =>{
            try{
                const data = await obtenerUsuarioId(idUsuario)

                setFormulario({
                    nombres: data.nombres || "",
                    aPaterno: data.aPaterno || "",
                    aMaterno: data.aMaterno || "",
                    rut: `${data.rut}${data.dv}`,
                    correo: data.correo || "",
                    correoConfirm: data.correo || "",
                    password: "",
                    passwordConfirm: "",
                    telefono: data.telefono != null ? String(data.telefono) : "",
                    fechaNacimiento: data.fechaNacimiento || "",
                    direccion: data.direccion || "",
                    idRegion: data.region?.idRegion != null ? String(data.region.idRegion) : "",
                    idComuna: data.comuna?.idComuna != null ? String(data.comuna.idComuna) : "",
                    idRolUsuario: data.rol?.idRolUsuario != null ? String(data.rol.idRolUsuario) : ""
                })

                const region = regionesComunas.find((r) => r.idRegion == data.region?.idRegion)
                setComunas(region ? region.comunas : [])
            }catch(error){
                console.error("Error al cargar usuario", error)
            }
        }

        if(esEdicion && regionesComunas.length > 0){
            loadUsuario()
        }
    },[esEdicion, idUsuario, regionesComunas])

    const handleChange = (e)=>{
        const {name, value} = e.target
        const esCorreo = name === "correo" || name === "correoConfirm"
        const valor = esCorreo ? value.toLowerCase() : value

        setFormulario((prev)=>({
            ...prev,
            [name]: valor
        }))

        if(name === "idRegion"){
            setFormulario((prev) => ({...prev, idComuna: ""}))
            const region = regionesComunas.find((item) => item.idRegion == value)
            setComunas(region ? region.comunas : [])
        }
    }

    const handleChangeRut = (e)=>{
        const valor = e.target.value.replace(/[.\-\s]/g, "").replace(/[^0-9kK]/g, "").toUpperCase()

        setFormulario((prev) => ({
            ...prev,
            rut: valor
        }))
    }

    const handleSubmit = async (e)=>{
        e.preventDefault()
        setMensajeAlerta(null)

        // Nombres y apellidos
        const datosPersonales = [
            ["nombres", "El nombre es obligatorio"],
            ["aPaterno", "El apellido paterno es obligatorio"],
            ["aMaterno", "El apellido materno es obligatorio"]
        ]

        for(const [campo, mensaje] of datosPersonales){
            if(!formulario[campo].trim()){
                setMensajeAlerta({type: "danger", message: mensaje})
                return
            }
        }

        if([formulario.nombres, formulario.aPaterno, formulario.aMaterno].some((v) => v.length > 50)){
            setMensajeAlerta({type: "danger", message: "Nombres y apellidos no pueden superar los 50 caracteres."})
            return
        }

        // RUN
        const rutLimpio = formulario.rut.trim()

        if(rutLimpio.length < 7 || rutLimpio.length > 9){
            setMensajeAlerta({type: "danger", message: "El RUN debe tener entre 7 y 9 caracteres."})
            return
        }

        if(!validarRut(rutLimpio)){
            setMensajeAlerta({type: "danger", message: "El RUN ingresado no es válido."})
            return
        }

        // Correo
        if(!dominiosPermitidos.includes(formulario.correo.split("@")[1])){
            setMensajeAlerta({type: "danger", message: "Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com."})
            return
        }

        if(formulario.correo !== formulario.correoConfirm){
            setMensajeAlerta({type: "danger", message: "Los correos no coinciden."})
            return
        }

        // Contraseña
        if(formulario.password !== formulario.passwordConfirm){
            setMensajeAlerta({type: "danger", message: "Las contraseñas no coinciden."})
            return
        }

        // Teléfono
        if(!/^\d{8,9}$/.test(formulario.telefono)){
            setMensajeAlerta({type: "danger", message: "El teléfono no es válido."})
            return
        }

        // Dirección
        if(!formulario.direccion.trim()){
            setMensajeAlerta({type: "danger", message: "La dirección es obligatoria."})
            return
        }

        if(formulario.direccion.length > 300){
            setMensajeAlerta({type: "danger", message: "La dirección no puede superar los 300 caracteres."})
            return
        }

        // Región y comuna
        if(formulario.idRegion === ""){
            setMensajeAlerta({type: "danger", message: "Seleccione una región."})
            return
        }

        if(formulario.idComuna === ""){
            setMensajeAlerta({type: "danger", message: "Seleccione una comuna."})
            return
        }

        // Rol (solo admin)
        if(esAdmin && formulario.idRolUsuario === ""){
            setMensajeAlerta({type: "danger", message: "Seleccione un tipo de usuario."})
            return
        }

        const {rut, dv} = descomponerRut(rutLimpio)

        const payload = {
            nombres: formulario.nombres,
            aPaterno: formulario.aPaterno,
            aMaterno: formulario.aMaterno,
            rut,
            dv,
            fechaNacimiento: formulario.fechaNacimiento || null,
            direccion: formulario.direccion,
            correo:formulario.correo,
            telefono: Number(formulario.telefono),
            nombreUsuario: formulario.correo,
            idRolUsuario: esAdmin ? Number(formulario.idRolUsuario) : ID_ROL_CLIENTE,
            idRegion: Number(formulario.idRegion),
            idComuna: Number(formulario.idComuna)
        }

        if(!esEdicion){
            payload.password = formulario.password
        }else if(formulario.password !== ""){
            payload.password = formulario.password
        }

        try{
            if(esEdicion){
                await actualizarUsuario(idUsuario, payload)
                setMensajeAlerta({type: "success", message: "Usuario actualizado correctamente."})
            }else{
                await crearUsuario(payload)
                setMensajeAlerta({type: "success", message: "Usuario registrado correctamente."})
                setFormulario(formularioVacio)
                setComunas([])
            }
        }catch(error){
            console.error("Error al guardar usuario", error)
            setMensajeAlerta({type: "danger", message: "No se pudo guardar el usuario."})
        }
    }

    return(
        <div className="register-form border border-black p-5 rounded-2 shadow">
            <form onSubmit={handleSubmit}>
                <div className="h3 mb-5 text-center">
                    {esEdicion ? "Editar Usuario" : esAdmin ? "Nuevo Usuario" : "Formulario de Registro"}
                </div>

                <div className="mb-3">
                    <label htmlFor="nombres" className="form-label">Nombres*</label>
                    <input
                        type="text"
                        className="form-control border-black"
                        name="nombres"
                        maxLength={50}
                        value={formulario.nombres}
                        onChange={handleChange}
                        required/>
                </div>

                <div className="row mb-3">
                    <div className="col mb-3 mb-md-0">
                        <label htmlFor="aPaterno" className="form-label">Apellido Paterno*</label>
                        <input
                            type="text"
                            className="form-control border-black"
                            name="aPaterno"
                            maxLength={50}
                            value={formulario.aPaterno}
                            onChange={handleChange}
                            required/>
                    </div>
                    <div className="col">
                        <label htmlFor="aMaterno" className="form-label">Apellido Materno*</label>
                        <input
                            type="text"
                            className="form-control border-black"
                            name="aMaterno"
                            maxLength={50}
                            value={formulario.aMaterno}
                            onChange={handleChange}
                            required/>
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="rut" className="form-label">RUN*</label>
                    <input
                        type="text"
                        className="form-control border-black"
                        name="rut"
                        placeholder="19011022K"
                        minLength={7}
                        maxLength={9}
                        value={formulario.rut}
                        onChange={handleChangeRut}
                        required/>
                    <small className="text-secondary">Sin puntos ni guión.</small>
                </div>

                <div className="row mb-3">
                    <div className="col mb-3 mb-md-0">
                        <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento</label>
                        <input
                            type="date"
                            className="form-control border-black"
                            name="fechaNacimiento"
                            value={formulario.fechaNacimiento}
                            onChange={handleChange}/>
                    </div>
                    <div className="col">
                        <label htmlFor="telefono" className="form-label">Teléfono*</label>
                        <input
                            type="tel"
                            className="form-control border-black"
                            name="telefono"
                            maxLength={9}
                            value={formulario.telefono}
                            onChange={handleChange}
                            required/>
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="correo" className="form-label">Correo*</label>
                    <input
                        type="email"
                        className="form-control border-black"
                        name="correo"
                        maxLength={100}
                        value={formulario.correo}
                        onChange={handleChange}
                        required/>
                </div>

                <div className="mb-3">
                    <label htmlFor="correoConfirm" className="form-label">Confirme correo*</label>
                    <input
                        type="email"
                        className="form-control border-black"
                        name="correoConfirm"
                        maxLength={100}
                        value={formulario.correoConfirm}
                        onChange={handleChange}
                        required/>
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        {esEdicion ? "Contraseña (dejar en blanco para mantener)*" : "Contraseña*"}
                    </label>
                    <input
                        type="password"
                        className="form-control border-black"
                        name="password"
                        minLength={4}
                        maxLength={20}
                        value={formulario.password}
                        onChange={handleChange}
                        required={!esEdicion}/>
                </div>

                <div className="mb-3">
                    <label htmlFor="passwordConfirm" className="form-label">Confirme Contraseña*</label>
                    <input
                        type="password"
                        className="form-control border-black"
                        name="passwordConfirm"
                        minLength={4}
                        maxLength={20}
                        value={formulario.passwordConfirm}
                        onChange={handleChange}
                        required={!esEdicion}/>
                </div>

                {
                    esAdmin &&
                    <div className="mb-3">
                        <label htmlFor="idRolUsuario" className="form-label">Tipo de Usuario*</label>
                        <select
                            className="form-select border-black"
                            name="idRolUsuario"
                            value={formulario.idRolUsuario}
                            onChange={handleChange}
                            required>
                            <option value="">-- Seleccione Rol --</option>
                            {
                                roles.map((rol) => (
                                    <option value={rol.idRolUsuario} key={rol.idRolUsuario}>{rol.nombre}</option>
                                ))
                            }
                        </select>
                    </div>
                }

                <div className="row mb-3">
                    <div className="col mb-3 mb-md-0">
                        <label htmlFor="idRegion" className="form-label">Región*</label>
                        <select name="idRegion" className="form-select border-black" value={formulario.idRegion} onChange={handleChange}>
                            <option value="">-- Seleccione Región --</option>
                            {
                                regionesComunas.map((r) => (
                                    <option value={r.idRegion} key={r.idRegion}>{r.region}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="col">
                        <label htmlFor="idComuna" className="form-label">Comuna*</label>
                        <select name="idComuna" className="form-select border-black" value={formulario.idComuna} onChange={handleChange}>
                            <option value="">-- Seleccione Comuna --</option>
                            {
                                comunas.map((c) => (
                                    <option value={c.idComuna} key={c.idComuna}>{c.nombre}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="direccion" className="form-label">Dirección*</label>
                    <textarea
                        className="form-control border-black"
                        name="direccion"
                        rows="2"
                        maxLength={300}
                        placeholder="Ej: Av. Providencia 1234, Depto 501"
                        value={formulario.direccion}
                        onChange={handleChange}
                        required>
                    </textarea>
                </div>

                <div className="mt-4">
                    <button type="submit" className="btn btn-dark">
                        {esEdicion ? "Guardar Cambios" : esAdmin ? "Guardar Usuario" : "Registrar"}
                    </button>
                </div>

                <div className="mt-3">
                    <AlertMessage type={mensajeAlerta?.type} message={mensajeAlerta?.message} onClose={()=>setMensajeAlerta(null)}/>
                </div>
            </form>
        </div>
    )
}