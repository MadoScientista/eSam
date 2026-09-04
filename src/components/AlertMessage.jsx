const iconos = {
    success: "bi-check-circle",
    danger: "bi-x-circle",
    warning: "bi-exclamation-triangle"
}

export function AlertMessage({ type = "success", message, onClose }){

    if(!message) return null

    return (
        <div className={`alert alert-${type} alert-dismissible d-flex align-items-center shadow`} role="alert">
            <i className={`bi ${iconos[type]} me-2`}></i>
            <div>{message}</div>
            {onClose &&
                <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
            }
        </div>
    )
}
