# Cobertura de testing

Documento de referencia sobre el estado actual de los tests de eSam.

## Stack y comandos

- Framework: **Vitest** con `jsdom` como entorno y `@testing-library/react` para componentes (config en `vite.config.js`).
- Setup: `src/setupTests.js` (carga `@testing-library/jest-dom/vitest` para matchers como `toBeInTheDocument`, `toBeDisabled`).
- Comandos:
  - `npm test` — corre los tests en modo watch.
  - `npm run coverage` — corre los tests una vez con reporte de cobertura.
- Estado actual: **24 archivos, 212 tests, todos en verde** (41 tests de componente + 171 de funciones/contexto).
- Objetivo en curso: **al menos 1 test de componente y 1 test de función por cada Page** (ver "Convención por Page").

## Estructura de archivos

Los tests se agrupan **por dominio de la vista**, y cada carpeta contiene tanto los
tests de función (servicios, utils, hooks, contexto) como los **tests de componente
de las Pages** de ese dominio. Cada Page debe tener su test de componente en la
carpeta del dominio al que pertenece, no en una carpeta aparte.

```
src/test/
├── catalogo/                 (Home, Products, Category, ProductDetails)
│   ├── producto.test.js                 (funciones de catálogo y stock)
│   ├── productoService.test.js          (servicio de productos)
│   ├── categoria.test.js                (árbol de categorías y validaciones)
│   ├── categoriaService.test.js         (servicio de categorías)
│   ├── moneda.test.js                   (formatearPrecio)
│   ├── ProductCarousel.test.jsx         (carrusel: tarjetas, flechas, carrito y navegación)
│   ├── Home.test.jsx                    (banner y carga de productos)
│   ├── Products.test.jsx                (filtros, orden y navegación)
│   ├── Category.test.jsx                (bloques por categoría y accesos rápidos)
│   └── ProductDetails.test.jsx          (detalle, stock y recomendados)
├── carrito/
│   ├── CartProvider.test.jsx            (contexto: límite de stock disponible)
│   ├── CartProvider.persistencia.test.jsx (contexto: sincronización con backend)
│   ├── carritoService.test.js           (fusionarCarritoLocal)
│   └── Cart.test.jsx                    (líneas, totales y flujo de pago)
├── pedidos/
│   ├── pedidoService.test.js            (crearPedido, mis pedidos y admin)
│   ├── direccionService.test.js         (direcciones del usuario)
│   ├── regionComunaService.test.js      (regiones y comunas)
│   ├── Checkout.test.jsx                (PENDIENTE)
│   ├── CustomerOrders.test.jsx          (PENDIENTE)
│   └── CustomerOrderDetail.test.jsx     (PENDIENTE)
├── registro-login/
│   ├── rut.test.js                      (validarRut, digitoVerificador, descomponerRut)
│   ├── token.test.js                    (guardarToken, obtenerToken, limpiarToken, iniciarSesion)
│   ├── usuarioService.test.js           (crearUsuario, perfil, admin usuarios)
│   ├── useUsuarioForm.test.js           (construirPayload con renderHook)
│   ├── Login.test.jsx                   (PENDIENTE)
│   ├── Register.test.jsx                (PENDIENTE)
│   └── CustomerProfile.test.jsx         (PENDIENTE)
├── admin/
│   ├── ordenarProductosAdmin.test.js    (ordenarProductosAdmin y selectores de orden)
│   ├── marcaService.test.js             (servicio de marcas)
│   ├── marca.test.js                    (validarNombreMarca)
│   ├── AdminDashboard.test.jsx          (PENDIENTE)
│   ├── AdminOrders.test.jsx             (PENDIENTE)
│   ├── AdminProfile.test.jsx            (PENDIENTE)
│   ├── AdminControlProduct.test.jsx     (PENDIENTE)
│   ├── AdminProductForm.test.jsx        (PENDIENTE)
│   ├── AdminControlUser.test.jsx        (PENDIENTE)
│   ├── AdminUserForm.test.jsx           (PENDIENTE)
│   ├── AdminControlCategoria.test.jsx   (PENDIENTE)
│   ├── AdminCategoriaForm.test.jsx      (PENDIENTE)
│   ├── AdminControlMarca.test.jsx       (PENDIENTE)
│   └── AdminMarcaForm.test.jsx          (PENDIENTE)
├── estaticas/               (AboutUs, Blogs, BlogArticle, Contact — solo componente)
│   ├── AboutUs.test.jsx                 (PENDIENTE)
│   ├── Blogs.test.jsx                   (PENDIENTE)
│   ├── BlogArticle.test.jsx             (PENDIENTE)
│   └── Contact.test.jsx                 (PENDIENTE)
└── Cobertura_testing.md                 (este documento)
```

Convención por test:

- **Test de componente**: renderiza la vista/componente y verifica comportamiento en el DOM (`render`, `fireEvent`, queries con `getByRole`/`getByText`).
- **Test de función**: verifica lógica pura (utilidades, servicios con mocks, contexto vía `renderHook`) sin renderizar UI.

## Convención por Page

Para que cada vista quede cubierta, se exige **por cada Page**:

1. **Test de componente**: renderiza la Page con sus providers (`MemoryRouter`, `CartProvider`, `AuthProvider`) y mocks de servicios, verificando el comportamiento clave de la vista.
   - Se coloca en la carpeta del **dominio** de la Page (no en `src/test/pages/`).
   - Páginas sin lógica mutable (`AboutUs`, `Blogs`, `BlogArticle`, `Contact`) solo requieren test de componente.
2. **Test de función**: testea la lógica que consume la Page (servicio, utilidad o hook apuntado en el apartado "Funciones"). Se ubica en la misma carpeta de dominio (nuevos archivos en `services/`… se integran al dominio).

Reglas vigentes:

- **Home**: cuenta con `ProductCarousel.test.jsx` (carrusel) y `Home.test.jsx` propio (banner + carga de productos con `productoService` mockeado), ambos en `src/test/catalogo/`.
- **`utils/blog.js`** (`formatearFecha`, `tiempoLectura`, `parsearCuerpo`): **fuera de alcance** por decisión previa. `BlogArticle` recibe solo test de componente.
- **Páginas estáticas**: no se les exige test de función (no tienen funciones propias).
- **Servicios**: los nuevos tests de servicio viven en la carpeta de dominio correspondiente (p.ej. `productoService.test.js` en `catalogo/`, `usuarioService.test.js` en `registro-login/`).

---

## 1. Catálogo

Vistas: `/` (Home), `/productos` (Products), `/categorias` (Category), `/detalleProducto/:idProducto` (ProductDetails).

### Home
#### Productos destacados
- Componente: `Banner`, `Carousel`, `ProductCarousel`
- Funciones: `obtenerProductos` (`src/services/productoService.js`)
- Test de componente: **Sí** — `src/test/catalogo/ProductCarousel.test.jsx` (6 tests) + `Home.test.jsx` (4 tests: banner, carga con datos y sin datos, error de carga).
- Test de funciones: **Sí** — `src/test/catalogo/productoService.test.js` (16 tests) cubre `obtenerProductos`.

### Products (catálogo de productos)
#### Listado y grilla de productos
- Componente: `ProductList`, `ProductCard`, `ProductFilterSidebar`, `ProductToolbar`
- Funciones: `filtrarProductos`, `ordenarProductos`, `marcasCatalogo`, `categoriasCatalogo`, `idsCategoriaConDescendientes`, `ORDENES_PRODUCTO` (`src/utils/producto.js`, `src/utils/categoria.js`)
- Test de componente: **Sí** — `src/test/catalogo/Products.test.jsx` (9 tests: carga, alerta de error, búsqueda, orden por precio, marca, categoría por URL, limpiar filtros, vacío y navegación al detalle).
- Test de funciones: **Sí** — `src/test/catalogo/producto.test.js` + `categoria.test.js` (ver resumen).

### Category (categoría puntual)
#### Productos de la categoría
- Componente: `CategoryBanner`, `ProductCarousel`
- Funciones: `productosDeCategoria`, `obtenerCategorias`/`obtenerProductos`
- Test de componente: **Sí** — `src/test/catalogo/Category.test.jsx` (6 tests: bloques con productos, accesos rápidos, error de carga, sin productos y navegación a /productos).
- Test de funciones: **Sí** — `productosDeCategoria` en `producto.test.js`; `obtenerProductos` en `productoService.test.js`; `obtenerCategorias` en `categoriaService.test.js`.

### ProductDetails (detalle de producto)
#### Información, stock y recomendados
- Componente: `ProductCarousel`, `Toast`
- Funciones: `imagenPrincipalProducto`, `stockDisponible`, `productosRecomendados`, `obtenerProductoPorId`
- Test de componente: **Sí** — `src/test/catalogo/ProductDetails.test.jsx` (7 tests: carga por id, imagen principal, añadir + toast, límite de stock, relacionados, sin relacionados y error).
- Test de funciones: **Sí** — utils cubiertas en `producto.test.js`; `obtenerProductoPorId` en `productoService.test.js`.

**Resumen de la categoría (actual):** 88 tests de funciones y 32 tests de componente. Pendientes: ninguno.

---

## 2. Carrito

Vistas: `/carrito` y `/usuario/carrito` (Cart).

### Cart (vista de carrito)
- Componente: `Cart`, `ProductCardH`, `ProductCarousel`
- Funciones: `categoriaMasPresente`, `productosRecomendados`, `stockDisponible`, contexto `CartProvider`, `carritoService`
- Test de componente: **Sí** — `src/test/carrito/Cart.test.jsx` (9 tests con carrito seed en `CartProvider`: líneas, cantidades, total, recomendados y flujo de pago con AuthProvider).
- Test de funciones: **Sí** — `CartProvider.test.jsx` (3), `CartProvider.persistencia.test.jsx` (6), `carritoService.test.js` (1); utils en `catalogo/producto.test.js`.

**Resumen de la categoría (actual):** 10 tests de contexto/función y 9 tests de componente. Pendientes: ninguno.

---

## 3. Pedidos

Vistas: `/usuario/checkout` (Checkout), `/usuario/pedidos` (CustomerOrders), `/usuario/pedidos/:idPedido` (CustomerOrderDetail).

### Checkout
- Componente: `Checkout`
- Funciones: `crearPedido`, `fusionarCarritoLocal`, `obtenerDirecciones`, `crearDireccion`, `obtenerRegionesComunas`
- Test de componente: **Pendiente** — `src/test/pedidos/Checkout.test.jsx`
- Test de funciones: **Sí** — `crearPedido` (2 tests), `obtenerDirecciones`/`crearDireccion` en `direccionService.test.js` (7), `obtenerRegionesComunas` en `regionComunaService.test.js` (3).

### CustomerOrders (listado de mis pedidos)
- Componente: `CustomerOrders`, `EstadoPedidoBadge`
- Funciones: `obtenerMisPedidos`
- Test de componente: **Pendiente** — `src/test/pedidos/CustomerOrders.test.jsx` (tabla, vacío, error).
- Test de funciones: **Sí** — `pedidoService.test.js` cubre `obtenerMisPedidos`.

### CustomerOrderDetail (detalle de mi pedido)
- Componente: `CustomerOrderDetail`, `EstadoPedidoBadge`
- Funciones: `obtenerMiPedido`
- Test de componente: **Pendiente** — `src/test/pedidos/CustomerOrderDetail.test.jsx` (DESPACHO vs retiro, estados, 404).
- Test de funciones: **Sí** — `pedidoService.test.js` cubre `obtenerMiPedido`.

**Resumen de la categoría (actual):** 17 tests de funciones. Pendientes: 3 tests de componente.

---

## 4. Registro y Login

Vistas: `/login` (Login), `/registro` (Register), `/usuario` (CustomerProfile).

### Login
- Componente: `Login`, `LoginForm`
- Funciones: `iniciarSesion`, `guardarToken`, `obtenerToken`, `limpiarToken`
- Test de componente: **Pendiente** — `src/test/registro-login/Login.test.jsx` (error 401, éxito redirige).
- Test de funciones: **Sí (parcial)** — `token.test.js` (7 tests). Quedan sin probar los `interceptors` de axios.

### Registro
- Componente: `Register`, `RegisterForm`
- Funciones: `crearUsuario`, `validarRut`, `digitoVerificador`, `descomponerRut`
- Test de componente: **Pendiente** — `src/test/registro-login/Register.test.jsx` (validación + submit navega a `/login`).
- Test de funciones: **Sí** — RUT cubierto en `rut.test.js` (12 tests); `crearUsuario` en `usuarioService.test.js` y `construirPayload` en `useUsuarioForm.test.js`.

### Perfil de cliente
- Componente: `CustomerProfile`, `RegisterForm`
- Funciones: `obtenerPerfil`, `actualizarPerfil`, `useUsuarioForm`
- Test de componente: **Pendiente** — `src/test/registro-login/CustomerProfile.test.jsx` (modo "Editar Perfil").
- Test de funciones: **Sí** — `usuarioService.test.js` (`obtenerPerfil`, `actualizarPerfil`) y `useUsuarioForm.test.js`.

### Control de acceso (`RequireAuth`)
- Componente: `RequireAuth` (`src/App.jsx`) — redirige según sesión y rol
- Funciones: `tieneRol`, `nombreRol`
- Test de componente/funciones: **No existe** (fuera del criterio "por Page"; pendiente de triaje aparte).

**Resumen de la categoría (actual):** 39 tests de funciones. Pendientes: 3 tests de componente.

---

## 5. Admin

Vistas bajo `/admin`: las 11 pantallas del panel.

- **AdminDashboard** — comp: `AdminDashboard.test.jsx` (PENDIENTE, variantes admin/vendedor); func: `obtenerPedidosAdmin`/`obtenerProductos`/`obtenerUsuarios` → `pedidoService.test.js` (Sí)/`productoService.test.js` (Sí)/`usuarioService.test.js` (Sí).
- **AdminOrders** — comp: `AdminOrders.test.jsx` (PENDIENTE); func: `obtenerPedidosAdmin`, `actualizarEstadoPedido` → `pedidoService.test.js` (Sí).
- **AdminProfile** — comp: `AdminProfile.test.jsx` (PENDIENTE); func: `actualizarPerfil` + `useUsuarioForm` → `usuarioService.test.js`/`useUsuarioForm.test.js` (Sí).
- **AdminControlProduct** — comp: `AdminControlProduct.test.jsx` (PENDIENTE); func: **Sí** (`ordenarProductosAdmin.test.js`, 10 tests).
- **AdminProductForm** — comp: `AdminProductForm.test.jsx` (PENDIENTE); func: `crearProducto`, `actualizarProducto`, `eliminarProducto`, stock e imágenes → `productoService.test.js` (Sí).
- **AdminControlUser** — comp: `AdminControlUser.test.jsx` (PENDIENTE); func: `obtenerUsuarios` → `usuarioService.test.js` (Sí).
- **AdminUserForm** — comp: `AdminUserForm.test.jsx` (PENDIENTE); func: `crearUsuarioAdmin`, `actualizarUsuario`, `eliminarUsuario` → `usuarioService.test.js` (Sí).
- **AdminControlCategoria** — comp: `AdminControlCategoria.test.jsx` (PENDIENTE); func: `obtenerCategorias` → `categoriaService.test.js` (Sí).
- **AdminCategoriaForm** — comp: `AdminCategoriaForm.test.jsx` (PENDIENTE); func: crear/actualizar/eliminar/subir imagen + `validarNombreCategoria` (cubierto en `categoria.test.js`) → `categoriaService.test.js` (Sí).
- **AdminControlMarca** — comp: `AdminControlMarca.test.jsx` (PENDIENTE); func: `obtenerMarcas` → `marcaService.test.js` (Sí).
- **AdminMarcaForm** — comp: `AdminMarcaForm.test.jsx` (PENDIENTE); func: crear/actualizar/eliminar + `validarNombreMarca` → `marcaService.test.js`/`marca.test.js` (Sí).

**Resumen de la categoría (actual):** 17 tests de funciones (`ordenarProductosAdmin.test.js` 10, `marcaService.test.js` 4, `marca.test.js` 3). Pendientes: 11 tests de componente (uno por página).

---

## 6. Páginas estáticas

Vistas sin dominio funcional: `/nosotros` (AboutUs), `/blogs` (Blogs), `/entradaBlog/:idEntrada` (BlogArticle), `/contacto` (Contact).

- Sin funciones propias → **solo test de componente** (carpeta `src/test/estaticas/`):
  - `AboutUs.test.jsx` (PENDIENTE)
  - `Blogs.test.jsx` (PENDIENTE)
  - `BlogArticle.test.jsx` (PENDIENTE; `utils/blog.js` fuera de alcance)
  - `Contact.test.jsx` (PENDIENTE; submit del formulario y alerta)

## Matriz por Page

Estado por vista (criterio: 1 test de componente + 1 de función por Page):

| # | Page | Dominio | Componente | Función | Archivo de componente |
|---|---|---|---|---|---|
| 1 | Home | catalogo | Cubierto (`ProductCarousel` + `Home`) | Cubierto | `Home.test.jsx` |
| 2 | Products | catalogo | Cubierto | Cubierto | `Products.test.jsx` |
| 3 | Category | catalogo | Cubierto | Cubierto | `Category.test.jsx` |
| 4 | ProductDetails | catalogo | Cubierto | Cubierto | `ProductDetails.test.jsx` |
| 5 | Cart | carrito | Cubierto | Cubierto | `Cart.test.jsx` |
| 6 | Checkout | pedidos | Pendiente | Cubierto | `Checkout.test.jsx` |
| 7 | CustomerOrders | pedidos | Pendiente | Cubierto | `CustomerOrders.test.jsx` |
| 8 | CustomerOrderDetail | pedidos | Pendiente | Cubierto | `CustomerOrderDetail.test.jsx` |
| 9 | Login | registro-login | Pendiente | Cubierto (parcial) | `Login.test.jsx` |
| 10 | Register | registro-login | Pendiente | Cubierto (parcial) | `Register.test.jsx` |
| 11 | CustomerProfile | registro-login | Pendiente | Cubierto | `CustomerProfile.test.jsx` |
| 12 | AdminDashboard | admin | Pendiente | Cubierto | `AdminDashboard.test.jsx` |
| 13 | AdminOrders | admin | Pendiente | Cubierto | `AdminOrders.test.jsx` |
| 14 | AdminProfile | admin | Pendiente | Cubierto | `AdminProfile.test.jsx` |
| 15 | AdminControlProduct | admin | Pendiente | Cubierto | `AdminControlProduct.test.jsx` |
| 16 | AdminProductForm | admin | Pendiente | Cubierto | `AdminProductForm.test.jsx` |
| 17 | AdminControlUser | admin | Pendiente | Cubierto | `AdminControlUser.test.jsx` |
| 18 | AdminUserForm | admin | Pendiente | Cubierto | `AdminUserForm.test.jsx` |
| 19 | AdminControlCategoria | admin | Pendiente | Cubierto | `AdminControlCategoria.test.jsx` |
| 20 | AdminCategoriaForm | admin | Pendiente | Cubierto | `AdminCategoriaForm.test.jsx` |
| 21 | AdminControlMarca | admin | Pendiente | Cubierto | `AdminControlMarca.test.jsx` |
| 22 | AdminMarcaForm | admin | Pendiente | Cubierto | `AdminMarcaForm.test.jsx` |
| 23 | AboutUs | estaticas | Pendiente | N/A (solo componente) | `AboutUs.test.jsx` |
| 24 | Blogs | estaticas | Pendiente | N/A (solo componente) | `Blogs.test.jsx` |
| 25 | BlogArticle | estaticas | Pendiente | N/A (`blog.js` excluido) | `BlogArticle.test.jsx` |
| 26 | Contact | estaticas | Pendiente | N/A (solo componente) | `Contact.test.jsx` |

---

## Resumen general

### Estado actual (tests existentes)

| Categoría | Tests de componente | Tests de funciones | Archivos |
|---|---|---|---|
| 1. Catálogo | 32 | 88 | `src/test/catalogo/producto.test.js` (44), `src/test/catalogo/categoria.test.js` (16), `src/test/catalogo/productoService.test.js` (16), `src/test/catalogo/categoriaService.test.js` (9), `src/test/catalogo/moneda.test.js` (3), `src/test/catalogo/ProductCarousel.test.jsx` (6), `Home.test.jsx` (4), `Products.test.jsx` (9), `Category.test.jsx` (6), `ProductDetails.test.jsx` (7) |
| 2. Carrito | 9 | 10 | `src/test/carrito/CartProvider.test.jsx` (3), `src/test/carrito/CartProvider.persistencia.test.jsx` (6), `src/test/carrito/carritoService.test.js` (1), `src/test/carrito/Cart.test.jsx` (9) |
| 3. Pedidos | 0 | 17 | `src/test/pedidos/pedidoService.test.js` (7), `src/test/pedidos/direccionService.test.js` (7), `src/test/pedidos/regionComunaService.test.js` (3) |
| 4. Registro y Login | 0 | 39 | `src/test/registro-login/rut.test.js` (12), `src/test/registro-login/token.test.js` (7), `src/test/registro-login/usuarioService.test.js` (11), `src/test/registro-login/useUsuarioForm.test.js` (9) |
| 5. Admin | 0 | 17 | `src/test/admin/ordenarProductosAdmin.test.js` (10), `src/test/admin/marcaService.test.js` (4), `src/test/admin/marca.test.js` (3) |
| **Total** | **41** | **171** | 24 archivos |

### Pendientes (objetivo: 1 test de función + 1 de componente por Page)

- **Tests de componente: 20 páginas pendientes** (cubiertas hasta ahora `Home`, `Products`, `Category`, `ProductDetails` y `Cart`). Se colocan en la carpeta de dominio de cada Page (`pedidos/`, `registro-login/`, `admin/`, `estaticas/`).
- **Tests de función pendientes por servicio/util/hook: ninguno.** Todos los servicios/utiles/hook están cubiertos:
  - `catalogo/`: `productoService.test.js` (16) y `categoriaService.test.js` (9).
  - `pedidos/`: `pedidoService.test.js` (7), `direccionService.test.js` (7), `regionComunaService.test.js` (3).
  - `registro-login/`: `usuarioService.test.js` (11) y `useUsuarioForm.test.js` (9).
  - `admin/`: `marcaService.test.js` (4) y `marca.test.js` (3).
- **Fuera de alcance:** `utils/blog.js`; páginas estáticas sin test de función; tests de componente de `RequireAuth`/interceptors de axios (pendiente de decisión aparte).