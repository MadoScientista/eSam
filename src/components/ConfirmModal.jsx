export function ConfirmModal({
    show,
    title = "Confirmar",
    message = "¿Estás seguro?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "dark",
    icon,
    disabled,
    success,
    onConfirm,
    onCancel
}){

    if(!show) return null

    return (
        <>
        <div className="modal-backdrop show"></div>
        <div className="modal d-block" tabIndex="-1" onClick={onCancel}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e)=>e.stopPropagation()}>
                <div className="modal-content shadow-lg">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {icon && <i className={`${icon} me-2`}></i>}
                            {title}
                        </h5>
                        <button type="button" className="btn-close" onClick={onCancel} disabled={disabled} aria-label="Cerrar"></button>
                    </div>
                    <div className="modal-body">
                        <p className="mb-0">{message}</p>
                    </div>
                    {success ?
                        <div className="modal-footer">
                            <button type="button" className={`btn btn-${variant}`} onClick={onCancel}>
                                Aceptar
                            </button>
                        </div>
                        :
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={disabled}>
                                {cancelText}
                            </button>
                            <button type="button" className={`btn btn-${variant}`} onClick={onConfirm} disabled={disabled}>
                                {confirmText}
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
        </>
    )
}
