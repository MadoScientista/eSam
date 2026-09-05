# eSam - Tienda de Útiles Escolares

Aplicación web de comercio electrónico para la venta de útiles escolares, desarrollada como proyecto académico. La interfaz está íntegramente en español e incorpora características locales de Chile: validación de RUT, selección de región y comuna, y roles de usuario.

> **Nota:** eSam es el frontend de una arquitectura cliente-servidor. Consume una API REST (no incluida en este repositorio).

## Tecnologías utilizadas

| Tecnología | Versión | Rol en el proyecto |
|---|---|---|
| [React](https://react.dev/) | ^19 | Librería de interfaces de usuario (SPA) |
| [Vite](https://vite.dev/) | ^8 | Bundler y servidor de desarrollo |
| [react-router-dom](https://reactrouter.com/) | ^7 | Enrutamiento del lado del cliente (Data Router) |
| [Bootstrap](https://getbootstrap.com/) | ^5.3 | Framework CSS y componentes de UI |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | ^1.13 | Iconografía |
| [Axios](https://axios-http.com/) | ^1.20 | Cliente HTTP para consumir la API REST |
| Context API | React | Gestión de estado global (autenticación y carrito) |
| React Compiler (Babel) | ^1.0 | Optimización automática de rendimiento (memoización) |
| ESLint | ^10 | Linting y calidad de código |

## Arquitectura y estructura

```
src/
├── components/        # Componentes reutilizables (UI, formularios, tablas, layout)
│   └── layout/        # Layouts: main (NavBar/Footer), customer, admin (sidebar)
├── const/             # Datos locales: productos, blog, regiones/comunas, usuarios
├── context/           # AuthProvider y CartProvider (Context + localStorage)
├── pages/             # Páginas públicas y áreas privadas (admin/usuario)
├── services/          # Capa de acceso a API (axios): producto, usuario, marca, región/comuna
└── utils/             # Utilidades: algoritmo y validación de RUT chileno
```

- **Frontend/Servicios:** cada página consume la API a través de `services/`, separando la lógica de red del resto de la app.
- **Estado global:** `AuthProvider` persiste la sesión en `localStorage` (`eSamSession`) y `CartProvider` el carrito (`eSamCart`), sobreviviendo a recargas.

## Instalación y ejecución

Requisitos: Node.js (>= 20).

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar servidor de desarrollo (proxy /api → http://localhost:8080)
npm run dev

# Otros comandos
npm run build     # Build de producción (salida en /dist)
npm run preview   # Previsualizar el build
npm run lint      # Linting con ESLint
```

> El backend debe estar en ejecución en `http://localhost:8080`; el proxy de Vite (`vite.config.js`) redirige las peticiones `/api/*`.

## API consumida

| Método | Endpoint | Función | Servicio |
|---|---|---|---|
| GET | `/productos` | Listar productos | `productoService` |
| GET | `/productos/:sku` | Producto por SKU | `productoService` |
| POST | `/productos` | Crear producto | `productoService` |
| POST | `/productos/:sku` | Actualizar producto | `productoService` |
| DELETE | `/productos/:sku` | Eliminar producto | `productoService` |
| GET | `/marcas` | Listar marcas | `marcaService` |
| GET | `/usuarios` | Listar usuarios | `usuarioService` |
| GET | `/usuarios/:id` | Usuario por ID | `usuarioService` |
| POST | `/usuarios` | Crear usuario | `usuarioService` |
| POST | `/usuarios/:id` | Actualizar usuario | `usuarioService` |
| DELETE | `/usuarios/:id` | Eliminar usuario | `usuarioService` |
| POST | `/usuarios/login` | Autenticación | `usuarioService` |
| GET | `/roles` | Roles de usuario | `usuarioService` |
| GET | `/regiones/comunas` | Regiones y comunas | `regionComunaService` |
| GET | `/regiones/:id/comunas` | Comunas de una región | `regionComunaService` |

## Funcionalidades

- **Catálogo:** lista de productos (SKU, nombre, marca, precio, stock, imagen) con destacados en el inicio y productos relacionados.
- **Detalle de producto:** ficha y botón "Añadir" al carrito con notificación (Toast).
- **Carrito de compras:** agregar, incrementar/decrementar unidades y eliminar productos; resumen con unidades y subtotal. Persistente en `localStorage`.
- **Blog:** listado de entradas y artículo completo (contenido local).
- **Autenticación:** registro, inicio/cierre de sesión, sesión persistida y rutas protegidas.
- **Registro validado:** algoritmo de dígito verificador de RUT chileno, confirmación de correo/clave y dominios de correo permitidos; selector dependiente región → comuna.
- **Roles:** `cliente` (perfil y carrito) y `admin` (panel de administración).
- **Panel administración:** CRUD de productos y de usuarios (crear, editar, eliminar).

## Rutas

### Públicas (MainLayout)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | Home | Inicio con banner/carrusel y productos destacados |
| `/productos` | Products | Catálogo general |
| `/detalleProducto/:sku` | ProductDetails | Ficha de un producto por SKU |
| `/nosotros` | AboutUs | Información de la tienda |
| `/contacto` | Contact | Formulario de contacto |
| `/blogs` | Blogs | Listado del blog |
| `/entradaBlog/:idEntrada` | BlogArticle | Artículo de blog |
| `/carrito` | Cart | Carrito y resumen |
| `/login` | Login | Inicio de sesión |
| `/registro` | Register | Registro de usuario |

### Zona de usuario (protegida, requiere sesión)

| Ruta | Componente | Descripción |
|---|---|---|
| `/usuario` | CustomerProfile | Perfil del cliente |
| `/usuario/carrito` | Cart | Carrito dentro del área de cliente |

### Administración (requiere sesión con rol admin)

| Ruta | Componente | Descripción |
|---|---|---|
| `/admin` | AdminProfile | Panel de administración |
| `/admin/productos` | AdminControlProduct | Listado y gestión de productos |
| `/admin/productos/nuevo` | AdminProductForm | Crear producto |
| `/admin/productos/:sku` | AdminProductForm | Editar producto |
| `/admin/usuarios` | AdminControlUser | Listado y gestión de usuarios |
| `/admin/usuarios/nuevo` | AdminUserForm | Crear usuario |
| `/admin/usuarios/:id` | AdminUserForm | Editar usuario |

## Estado actual y próximos pasos

- Blog con contenido **local** (pendiente de conectar a API).
- Botón **"Pagar"** del carrito sin implementación.
- Perfil de usuario en desarrollo.

## Licencia

Proyecto académico sin fines comerciales.