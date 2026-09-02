# eSam - Tienda de Útiles Escolares

## Resumen

eSam es una aplicación web de comercio electrónico dedicada a la venta de útiles escolares en Chile. Permite a estudiantes, profesores y familias navegar un catálogo de productos (cuadernos, lápices, estuches, pinturas, etc.), consultar detalles, gestionar un carrito de compras y leer artículos de un blog. La interfaz está íntegramente en español y incluye funcionalidades específicas para Chile, como la selección de región y comuna en el formulario de registro.

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | ^19.2.8 | Librería de interfaces |
| Vite | ^8.2.2 | Herramienta de build y servidor de desarrollo |
| react-router-dom | ^7.18.2 | Enrutamiento del lado del cliente |
| Bootstrap | ^5.3.8 | Framework CSS |
| Bootstrap Icons | ^1.13.1 | Librería de íconos |
| React Compiler | ^1.0.0 | Optimización de rendimiento (memoización automática) |
| ESLint | ^10.9.0 | Linting |
| Babel | ^7.29.7 | Compilación de código |

## Rutas

### Públicas (MainLayout)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | Home | Página de inicio con carrusel y productos destacados |
| `/nosotros` | AboutUs | Información de la empresa |
| `/productos` | Products | Catálogo completo de productos |
| `/detalleProducto/:sku` | ProductDetails | Detalle de un producto por su SKU |
| `/blogs` | Blogs | Listado de artículos del blog |
| `/entradaBlog/:idEntrada` | BlogArticle | Artículo completo del blog |
| `/contacto` | Contact | Formulario de contacto |
| `/carrito` | Cart | Carrito de compras con resumen y subtotal |
| `/login` | Login | Inicio de sesión |
| `/registro` | Register | Registro de usuario con regiones/comunas de Chile |
| `/usuario` | UserProfile | Perfil del usuario (en desarrollo) |

### Administración (AdminLayout)

| Ruta | Componente | Descripción |
|---|---|---|
| `/admin` | AdminProfile | Panel de administración (perfil) |
| `/admin/productos` | AdminControlProduct | Gestión de productos |
| `/admin/usuarios` | AdminControlUser | Gestión de usuarios |
