import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Navigate, useLocation } from 'react-router-dom'

import { MainLayout, AdminLayout, CustomerLayout } from './components'
import {
  AboutUs, Blogs, Contact, Home, Login, ProductDetails, Products,
  Register, CustomerProfile, BlogArticle, Cart,
  AdminProfile, AdminControlProduct, AdminProductForm,
  AdminControlUser, AdminUserForm
} from './pages'

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
