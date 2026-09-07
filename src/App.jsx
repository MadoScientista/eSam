import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Navigate, useLocation } from 'react-router-dom'
import { MainLayout } from './components/layout/main/MainLayout'
import { AboutUs } from './pages/AboutUs'
import { Blogs } from './pages/Blogs'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { ProductDetails } from './pages/ProductDetails'
import { Products } from './pages/Products'
import { Register } from './pages/Register'
import { CustomerProfile } from './pages/CustomerProfile'
import { BlogArticle } from './pages/BlogArticle'
import { Cart } from './pages/Cart'

import { AdminLayout } from './components/layout/admin/AdminLayout'
import { CustomerLayout } from './components/layout/customer/CustomerLayout'
import { AdminProfile } from './pages/admin/AdminProfile'
import { AdminControlProduct } from './pages/admin/AdminControlProduct'
import { AdminProductForm } from './pages/admin/AdminProductForm'
import { AdminControlUser } from './pages/admin/AdminControlUser'
import { AdminUserForm } from './pages/admin/AdminUserForm'

import { useAuth } from './context/authContext'

function RequireAuth({ children, rol }) {
    const { usuario } = useAuth()
    const location = useLocation()

    if (!usuario || (rol && usuario.rol?.nombre !== rol)) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return children
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
        element:<RequireAuth rol="admin"><AdminLayout/></RequireAuth>,
        children:[
          {index: true, element:<AdminProfile/>},
          {path: "productos", element:<AdminControlProduct/>},
          {path: "productos/:sku", element: <AdminProductForm/>},
          {path: "productos/nuevo", element: <AdminProductForm/>},
          {path: "usuarios", element: <AdminControlUser/>},
          {path: "usuarios/:id", element: <AdminUserForm/>},
          {path: "usuarios/nuevo", element: <AdminUserForm/>}
        ] 
      },
      { path:"blogs",element:<Blogs/> },
      { path:"entradaBlog/:idEntrada",element:<BlogArticle/> },
      { path:"contacto",element:<Contact/> },
      { path:"carrito",element:<Cart/> },
      { path:"login",element:<Login/> },
      { path:"detalleProducto/:sku",element:<ProductDetails/> },
      { path:"productos",element: <Products/> },
      { path:"registro",element:<Register/> },
      {
        path:"usuario",
        element:<RequireAuth rol="cliente"><CustomerLayout/></RequireAuth>,
        children:[
          {index: true, element:<CustomerProfile/>},
          {path: "carrito", element:<Cart/>}
        ]
      }
    ]
  }
])

function App() {  
  
  return <RouterProvider router={router}/>
}

export default App
