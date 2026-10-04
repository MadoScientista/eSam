import axios from "axios";

const TOKEN_KEY = "eSamToken";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "/api"
});

export function guardarToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

export function obtenerToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function limpiarToken() {
    localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
    const token = obtenerToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const listenersSesionExpirada = new Set();

export function onSesionExpirada(listener) {
    listenersSesionExpirada.add(listener);

    return () => listenersSesionExpirada.delete(listener);
}

function normalizarDetalleErrores(data) {
    if (Array.isArray(data?.errores) && data.errores.length > 0) {
        return data.errores;
    }

    // Algunos errores de validación no poblan "errores" y dejan el detalle
    // dentro de "message" con el formato "campo: mensaje".
    const mensaje = data?.message;

    if (typeof mensaje === "string" && /^[^\s:]+:\s.+/.test(mensaje)) {
        const [campo, ...resto] = mensaje.split(":");

        return [{ campo: campo.trim(), mensaje: resto.join(":").trim() }];
    }

    return [];
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const data = error.response?.data;
        const status = error.response?.status ?? null;

        if (status === 401) {
            limpiarToken();
            localStorage.removeItem("eSamSession");

            listenersSesionExpirada.forEach((listener) => listener());
        }

        const mensaje =
            data?.message ??
            data?.mensaje ??
            (error.response ? `Error ${status}` : "No se pudo conectar con el servidor");

        const normalizado = new Error(mensaje);
        normalizado.status = status;
        normalizado.code = data?.code ?? null;
        normalizado.path = data?.path ?? data?.ruta ?? null;
        normalizado.errores = normalizarDetalleErrores(data);

        return Promise.reject(normalizado);
    }
);