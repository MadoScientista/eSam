import { useEffect, useState } from "react"
import { obtenerRegionesComunas } from "../services/regionComunaService"
import { obtenerRolesUsuario, obtenerUsuarioId } from "../services/usuarioService"
import { validarRut, descomponerRut } from "../utils/rut"


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

const dominiosPermitidos = ["duoc.cl", "gmail.com", "profesor.duoc.cl", "duocuc.cl"]

export function useUsuarioForm({ idUsuario, esAdmin = false }) {

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
        const loadRoles = async () =>{
            try{
                const data = await obtenerRolesUsuario()
                setRoles(data)
            }catch(error){
                console.error("Error al cargar roles", error)
            }
        }
        loadRoles()
    },[])

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

    const construirPayload = () => {
        setMensajeAlerta(null)

        // Nombres y apellidos
        const datosPersonales = [
            ["nombres", "El nombre es obligatorio"],
            ["aPaterno", "El apellido paterno es obligatorio"]
        ]

        for(const [campo, mensaje] of datosPersonales){
            if(!formulario[campo].trim()){
                setMensajeAlerta({type: "danger", message: mensaje})
                return null
            }
        }

        if([formulario.nombres, formulario.aPaterno, formulario.aMaterno].some((v) => v.length > 50)){
            setMensajeAlerta({type: "danger", message: "Nombres y apellidos no pueden superar los 50 caracteres."})
            return null
        }

        // RUN
        const rutLimpio = formulario.rut.trim()

        if(rutLimpio.length < 7 || rutLimpio.length > 9){
            setMensajeAlerta({type: "danger", message: "El RUN debe tener entre 7 y 9 caracteres."})
            return null
        }

        if(!validarRut(rutLimpio)){
            setMensajeAlerta({type: "danger", message: "El RUN ingresado no es válido."})
            return null
        }

        // Correo
        if(!dominiosPermitidos.includes(formulario.correo.split("@")[1])){
            setMensajeAlerta({type: "danger", message: "Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com."})
            return null
        }

        if(formulario.correo !== formulario.correoConfirm){
            setMensajeAlerta({type: "danger", message: "Los correos no coinciden."})
            return null
        }

        // Contraseña
        if(formulario.password !== formulario.passwordConfirm){
            setMensajeAlerta({type: "danger", message: "Las contraseñas no coinciden."})
            return null
        }

        // Teléfono
        if(formulario.telefono){
            if(!/^\d{8,9}$/.test(formulario.telefono)){
            setMensajeAlerta({type: "danger", message: "El teléfono no es válido."})
            return null
            }
        }
        

        // Dirección
        if(!formulario.direccion.trim()){
            setMensajeAlerta({type: "danger", message: "La dirección es obligatoria."})
            return null
        }

        if(formulario.direccion.length > 300){
            setMensajeAlerta({type: "danger", message: "La dirección no puede superar los 300 caracteres."})
            return null
        }

        // Región y comuna
        if(formulario.idRegion === ""){
            setMensajeAlerta({type: "danger", message: "Seleccione una región."})
            return null
        }

        if(formulario.idComuna === ""){
            setMensajeAlerta({type: "danger", message: "Seleccione una comuna."})
            return null
        }

        // Rol (solo admin)
        if(esAdmin && formulario.idRolUsuario === ""){
            setMensajeAlerta({type: "danger", message: "Seleccione un tipo de usuario."})
            return null
        }

        // Rol cliente por defecto (registro público)
        const rolCliente = roles.find((r) => r.nombre === "cliente")

        if(!esAdmin && !esEdicion && !rolCliente){
            setMensajeAlerta({type: "danger", message: "No se pudo determinar el rol de cliente."})
            return null
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
            correo: formulario.correo,
            telefono: formulario.telefono ? Number(formulario.telefono) : null,
            nombreUsuario: formulario.correo,
            idRolUsuario: esAdmin ? Number(formulario.idRolUsuario) : esEdicion ? Number(formulario.idRolUsuario) : rolCliente.idRolUsuario,
            idRegion: Number(formulario.idRegion),
            idComuna: Number(formulario.idComuna)
        }

        if(!esEdicion){
            payload.password = formulario.password
        }else if(formulario.password !== ""){
            payload.password = formulario.password
        }

        return payload
    }

    const limpiarFormulario = () => {
        setFormulario(formularioVacio)
        setComunas([])
    }

    return {
        esEdicion,
        formulario,
        regionesComunas,
        comunas,
        roles,
        mensajeAlerta,
        setMensajeAlerta,
        handleChange,
        handleChangeRut,
        construirPayload,
        limpiarFormulario
    }
}