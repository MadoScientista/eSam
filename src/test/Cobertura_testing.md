# Cobertura de testing

Documento de referencia sobre el estado actual de los tests de eSam.

## Stack y comandos

- Framework: **Vitest** con `jsdom` como entorno y `@testing-library/react` para componentes (config en `vite.config.js`).
- Setup: `src/setupTests.js` (carga `@testing-library/jest-dom/vitest` para matchers como `toBeInTheDocument`, `toBeDisabled`).
- Comandos:
  - `npm test` — corre los tests en modo watch.
  - `npm run coverage` — corre los tests una vez con reporte de cobertura.
- Estado actual: **5 archivos, 37 tests, todos en verde**.

## Estructura de archivos

Los tests están separados en categorías según la responsabilidad de la vista:

```
src/test/
├── catalogo/
│   └── producto.test.js                 (funciones de catálogo y stock)
├── carrito/
│   ├── CartProvider.test.jsx            (contexto: límite de stock disponible)
│   ├── CartProvider.persistencia.test.jsx (contexto: sincronización con backend)
│   └── carritoService.test.js           (fusionarCarritoLocal)
├── pedidos/
│   └── pedidoService.test.js            (crearPedido)
├── registro-login/                      (pendiente)
├── admin/                               (pendiente)
└── Cobertura_testing.md                 (este documento)
```

Convención por test:

- **Test de componente**: renderiza la vista/componente y verifica comportamiento en el DOM (`render`, `fireEvent`, queries con `getByRole`/`getByText`).
- **Test de función**: verifica lógica pura (utilidades, servicios con mocks, contexto vía `renderHook`) sin renderizar UI.

---

## 1. Catálogo

Vistas: `/` (Home), `/productos` (Products), `/categorias` (Category), `/detalleProducto/:idProducto` (ProductDetails).

### Home
#### Productos destacados
- Componente: `ProductCarousel`
- Funciones: No requiere (usa `obtenerProductos` del servicio)
- Test de componente: No existe
- Test de funciones: No requiere

### Products (catálogo de productos)
#### Listado y grilla de productos
- Componente: `ProductList`, `ProductCard`
- Funciones: `filtrarProductos`, `ordenarProductos`, `marcasCatalogo` (`src/utils/producto.js`)
- Test de componente: No existe
- Test de funciones: **Sí** — `src/test/catalogo/producto.test.js` (`filtrarProductos` 10 tests, `ordenarProductos` 3 tests, `marcasCatalogo`/`nombreMarcaProducto` 2 tests)

#### Filtros y barra de ordenamiento
- Componente: `ProductFilterSidebar`, `ProductToolbar`
- Funciones: `idsCategoriaConDescendientes`, `categoriasCatalogo` (`src/utils/categoria.js`), `ORDENES_PRODUCTO`
- Test de componente: No existe
- Test de funciones: **Parcial** — `src/test/catalogo/producto.test.js` cubre `categoriasCatalogo` (4 tests) y `normalizarTexto` (2 tests, base del filtro de búsqueda). No hay tests para `idsCategoriaConDescendientes`, `validarNombreCategoria`, `validarImagenCategoria`, `aplanarCategorias` ni `ORDENES_PRODUCTO`.

### Category (categoría puntual)
#### Productos de la categoría
- Componente: `CategoryBanner`, `ProductCarousel`
- Funciones: `productosDeCategoria`
- Test de componente: No existe
- Test de funciones: No existe

### ProductDetails (detalle de producto)
#### Información, stock y recomendados
- Componente: `ProductCarousel`, `Toast`
- Funciones: `imagenPrincipalProducto`, `stockDisponible`, `productosRecomendados`
- Test de componente: No existe
- Test de funciones: **Parcial** — `src/test/catalogo/producto.test.js` cubre `stockDisponible` (4 tests). No hay tests para `imagenPrincipalProducto`, `productosRecomendados` ni `productosDeCategoria`.

### Componentes compartidos del catálogo
- `ProductCardH` (fila horizontal del carrito): usa `imagenPrincipalProducto` y `stockDisponible` — sin test de componente; `stockDisponible` cubierto en `src/test/catalogo/producto.test.js`.
- `formatearPrecio` (`src/utils/moneda.js`): sin tests.

**Resumen de la categoría:** solo tests de funciones (25 tests en `src/test/catalogo/producto.test.js`). Cero tests de componente.

---

## 2. Carrito

Vistas: `/carrito` y `/usuario/carrito` (Cart).

### Cart (vista de carrito)
#### Línea de producto y cantidades
- Componente: `Cart`, `ProductCardH`
- Funciones: `categoriaMasPresente`, `productosRecomendados` (`src/utils/producto.js`)
- Test de componente: No existe
- Test de funciones: No existe

#### Agregar / incrementar / decrementar / eliminar unidades
- Componente: —
- Funciones: `addProduct`, `increaseUnits`, `decreaseUnits`, `removeProduct` (`src/context/CartProvider.jsx`)
- Test de componente: No existe
- Test de funciones: **Sí** — `src/test/carrito/CartProvider.test.jsx` (3 tests: no agrega más que lo disponible, no agrega sin disponible, bloquea incrementos sobre lo disponible). Se ejecutan con `renderHook` sobre el contexto, sin renderizar la UI.

#### Persistencia del carrito en backend
- Componente: —
- Funciones: `persistir`/`sincronizarProducto` + `carritoService` (`agregarItemCarrito`, `actualizarCantidadItem`, `eliminarItemCarrito`, `obtenerCarrito`, `vaciarCarrito`)
- Test de componente: No existe
- Test de funciones: **Sí** — `src/test/carrito/CartProvider.persistencia.test.jsx` (6 tests: alta, cambio de cantidad, eliminación, vaciado, sin sesión no toca backend, serialización de operaciones)

#### Fusión del carrito local con el persistido (login/checkout)
- Componente: —
- Funciones: `fusionarCarritoLocal` (`src/services/carritoService.js`)
- Test de componente: No existe
- Test de funciones: **Sí** — `src/test/carrito/carritoService.test.js` (1 test: cantidades locales en coincidencias, conserva productos propios de la cuenta)

### Validación de stock
- Funciones: `stockDisponible` (`src/utils/producto.js`)
- Test de funciones: **Sí** — `src/test/catalogo/producto.test.js` (4 tests: resta reservado, disponible a cero, compatibilidad sin `stockReservado`, datos inválidos)

**Resumen de la categoría:** 14 tests de funciones/contexto. Cero tests de componente (la vista `Cart` y sus componentes no están cubiertos).

---

## 3. Pedidos

Vistas: `/usuario/checkout` (Checkout), `/usuario/pedidos` (CustomerOrders), `/usuario/pedidos/:idPedido` (CustomerOrderDetail).

### Checkout
#### Confirmación del pedido
- Componente: `Checkout`
- Funciones: `crearPedido` (`src/services/pedidoService.js`), `fusionarCarritoLocal`, `obtenerDirecciones`, `crearDireccion`, `obtenerRegionesComunas`
- Test de componente: No existe
- Test de funciones: **Parcial** — `src/test/pedidos/pedidoService.test.js` cubre `crearPedido` (2 tests: envía modalidad e ID de dirección para despacho, omite dirección para retiro en tienda). Sin tests para `direccionService` ni `regionComunaService`.

### CustomerOrders (listado de mis pedidos)
- Componente: `CustomerOrders`, `EstadoPedidoBadge`
- Funciones: `obtenerMisPedidos`
- Test de componente: No existe
- Test de funciones: No existe

### CustomerOrderDetail (detalle de mi pedido)
- Componente: `CustomerOrderDetail`
- Funciones: `obtenerMiPedido`
- Test de componente: No existe
- Test de funciones: No existe

**Resumen de la categoría:** 2 tests de funciones (servicio `crearPedido`). Cero tests de componente.

---

## 4. Registro y Login

Vistas: `/login` (Login), `/registro` (Register), `/usuario` (CustomerProfile).

### Login
- Componente: `Login`, `LoginForm`
- Funciones: `iniciarSesion`, `guardarToken`, `obtenerToken`, `limpiarToken` (`src/services/usuarioService.js`, `src/services/api.js`)
- Test de componente: No existe
- Test de funciones: No existe

### Registro
- Componente: `Register`, `RegisterForm`
- Funciones: `crearUsuario`, `validarRut`, `digitoVerificador`, `descomponerRut` (`src/utils/rut.js`)
- Test de componente: No existe
- Test de funciones: No existe

### Perfil de cliente
- Componente: `CustomerProfile`
- Funciones: `obtenerPerfil`, `actualizarPerfil`
- Test de componente: No existe
- Test de funciones: No existe

### Control de acceso (`RequireAuth`)
- Componente: `RequireAuth` (`src/App.jsx`) — redirige según sesión y rol
- Funciones: `tieneRol`
- Test de componente: No existe
- Test de funciones: No existe

**Resumen de la categoría:** sin tests. Es la categoría con mayor riesgo (validación de RUT, token y redirecciones por rol).

---

## 5. Admin

Vistas bajo `/admin`: `AdminDashboard`, `AdminOrders`, `AdminProfile`, `AdminControlProduct`, `AdminProductForm`, `AdminControlUser`, `AdminUserForm`, `AdminControlCategoria`, `AdminCategoriaForm`.

### Productos
- Componente: `AdminControlProduct`, `AdminProductForm`, `ProductTable`, `ProductoImagenesAdmin`
- Funciones: `crearProducto`, `actualizarProducto`, `eliminarProducto`, `setearStock`, `aumentarStock`, `disminuirStock`, `marcarImagenPrincipal`, `validarImagenCategoria`
- Test de componente: No existe
- Test de funciones: No existe

### Usuarios
- Componente: `AdminControlUser`, `AdminUserForm`, `UsersTable`
- Funciones: `obtenerUsuarios`, `crearUsuarioAdmin`, `actualizarUsuario`, `eliminarUsuario`, `obtenerRolesUsuario`
- Test de componente: No existe
- Test de funciones: No existe

### Categorías
- Componente: `AdminControlCategoria`, `AdminCategoriaForm`, `CategoriasTable`, `CategoriasSelector`, `CategoriaImagenAdmin`
- Funciones: `crearCategoria`, `actualizarCategoria`, `eliminarCategoria`, `subirImagenCategoria`, `validarNombreCategoria`
- Test de componente: No existe
- Test de funciones: No existe

### Órdenes y dashboard
- Componente: `AdminDashboard`, `AdminOrders`, `EstadoPedidoBadge`
- Funciones: `obtenerPedidosAdmin`, `obtenerPedidoAdmin`, `actualizarEstadoPedido`
- Test de componente: No existe
- Test de funciones: No existe

**Resumen de la categoría:** sin tests.

---

## Resumen general

| Categoría | Tests de componente | Tests de funciones | Archivos |
|---|---|---|---|
| 1. Catálogo | 0 | 25 | `src/test/catalogo/producto.test.js` |
| 2. Carrito | 0 | 14 | `src/test/carrito/CartProvider.test.jsx`, `src/test/carrito/CartProvider.persistencia.test.jsx`, `src/test/carrito/carritoService.test.js` (1), `src/test/catalogo/producto.test.js` (4) |
| 3. Pedidos | 0 | 2 | `src/test/pedidos/pedidoService.test.js` |
| 4. Registro y Login | 0 | 0 | — |
| 5. Admin | 0 | 0 | — |
| **Total** | **0** | **37** | 5 archivos |

### Pendientes principales

1. **Tests de componente: ninguno.** Todas las vistas (`Home`, `Products`, `Cart`, `Checkout`, `Login`, `Register`, pantallas admin) están sin cubrir. Las utilidades y el contexto del carrito son lo único con cobertura.
2. **Registro/Login y Admin sin ningún test.** Validación de RUT, manejo de token y guardas por rol (`RequireAuth`, `tieneRol`) son candidatos prioritarios por el impacto de un error.
3. **Servicios sin cubrir:** `direccionService`, `regionComunaService`, `productoService`, `categoriaService`, `usuarioService` (salvo lo mockeado por los tests del carrito), `pedidoService` (salvo `crearPedido`).
4. **Utilidades sin cubrir:** `moneda.js`, `rut.js`, `blog.js`, y de `producto.js`: `imagenPrincipalProducto`, `productosRecomendados`, `productosDeCategoria`, `categoriaMasPresente`.
5. **Directorios `registro-login/` y `admin/` vacíos:** creados para recibir los próximos tests de esas categorías.
