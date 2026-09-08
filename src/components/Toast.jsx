import { useEffect, useRef } from "react"
import { Toast as BootstrapToast } from "bootstrap"

export function Toast({ trigger = 0, message, title = "Carrito", delay = 3000 }) {
    const toastRef = useRef(null)

    useEffect(() => {
        const element = toastRef.current
        if (!element) return

        const instancia = new BootstrapToast(element, { autohide: true, delay })

        return () => instancia.dispose()
    }, [delay])

    useEffect(() => {
        if (trigger <= 0) return

        const element = toastRef.current
        if (!element) return

        BootstrapToast.getOrCreateInstance(element).show()
    }, [trigger])

    return (
        <div
            className="toast-container position-fixed top-0 end-0 p-3"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                ref={toastRef}
                className="toast align-items-center text-bg-success border-0"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                <div className="d-flex">
                    <div className="toast-body">
                        <strong className="me-auto">{title}:</strong> {message}
                    </div>
                    <button
                        type="button"
                        className="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast"
                        aria-label="Cerrar"
                    ></button>
                </div>
            </div>
        </div>
    )
}