import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Navigate, useLocation } from 'react-router-dom'

import { MainLayout, AdminLayout, CustomerLayout } from './components'
import {
  AboutUs, Blogs, Contact, Home, Login, ProductDetails, Products,
  Register, CustomerProfile, BlogArticle, Cart, Checkout, Category,
  CustomerOrders, CustomerOrderDetail,
  AdminDashboard, AdminOrders, AdminProfile, AdminControlProduct, AdminProductForm,
  AdminControlUser, AdminUserForm,
  AdminControlCategoria, AdminCategoriaForm
} from './pages'

import { useAuth, tieneRol } from './context/authContext'


function RequireAuth({ children, rol }) {
    const { estaAutenticado, usuario, sesionCerrada } = useAuth()
    const location = useLocation()
    const rolesPermitidos = Array.isArray(rol) ? rol : [rol]

    if (!estaAutenticado) {
        return <Navigate to="/login" replace state={{ from: location, sesionCerrada }} />
    }

    if (rol && !rolesPermitidos.some((rolPermitido) => tieneRol(usuario, rolPermitido))) {
        const destino = rolesPermitidos.includes("admin") && tieneRol(usuario, "vendedor")
            ? "/admin"
            : "/login"
        return <Navigate to={destino} replace state={{ from: location, sesionCerrada }} />
    }

    return children
}

function AdminOnly({ children }) {
    return <RequireAuth rol="admin">{children}</RequireAuth>
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>,
    children: [
      { index: true, element: <Home/> },
      { path:"nosotros",element: <AboutUs/> },
      { 
        path:"admin",
        element:<RequireAuth rol={["admin", "vendedor"]}><AdminLayout/></RequireAuth>,
        children:[
          {index: true, element:<AdminDashboard/>},
          {path: "ordenes", element:<AdminOrders/>},
          {path: "perfil", element:<AdminProfile/>},
          {path: "productos", element:<AdminControlProduct/>},
          {path: "productos/:idProducto", element: <AdminOnly><AdminProductForm/></AdminOnly>},
          {path: "productos/nuevo", element: <AdminProductForm/>},
          {path: "usuarios", element: <AdminOnly><AdminControlUser/></AdminOnly>},
          {path: "usuarios/:id", element: <AdminOnly><AdminUserForm/></AdminOnly>},
          {path: "usuarios/nuevo", element: <AdminOnly><AdminUserForm/></AdminOnly>},
          {path: "categorias", element: <AdminControlCategoria/>},
          {path: "categorias/:idCategoria", element: <AdminOnly><AdminCategoriaForm/></AdminOnly>},
          {path: "categorias/nuevo", element: <AdminOnly><AdminCategoriaForm/></AdminOnly>}
        ] 
      },
      { path:"blogs",element:<Blogs/> },
      { path:"entradaBlog/:idEntrada",element:<BlogArticle/> },
      { path:"contacto",element:<Contact/> },
      { path:"carrito",element:<Cart/> },
      { path:"login",element:<Login/> },
      { path:"detalleProducto/:idProducto",element:<ProductDetails/> },
      { path:"productos",element: <Products/> },
      { path:"categorias",element: <Category/> },
      { path:"registro",element:<Register/> },
      {
        path:"usuario",
        element:<RequireAuth rol="cliente"><CustomerLayout/></RequireAuth>,
        children:[
          {index: true, element:<CustomerProfile/>},
          {path: "carrito", element:<Cart/>},
          {path: "checkout", element:<Checkout/>},
          {path: "pedidos", element:<CustomerOrders/>},
          {path: "pedidos/:idPedido", element:<CustomerOrderDetail/>}
        ]
      }
    ]
  }
])

function App() {  
  
  return <RouterProvider router={router}/>
}

export default App
