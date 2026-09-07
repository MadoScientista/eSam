export function CamposUsuario({ formulario, handleChange, handleChangeRut, esEdicion, regionesComunas, comunas }) {
    return (
        <>
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
                    <label htmlFor="aMaterno" className="form-label">Apellido Materno</label>
                    <input
                        type="text"
                        className="form-control border-black"
                        name="aMaterno"
                        maxLength={50}
                        value={formulario.aMaterno}
                        onChange={handleChange}/>
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
                    disabled={esEdicion}
                    readOnly={esEdicion}
                    required/>
                <small className="text-secondary">{esEdicion ? "El RUN no es editable." : "Sin puntos ni guión."}</small>
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
                    <label htmlFor="telefono" className="form-label">Teléfono (Opcional)</label>
                    <input
                        type="tel"
                        className="form-control border-black"
                        name="telefono"
                        maxLength={9}
                        value={formulario.telefono}
                        onChange={handleChange}/>
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
        </>
    )
}