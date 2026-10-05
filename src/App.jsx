import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Navigate, useLocation } from 'react-router-dom'

import { MainLayout, AdminLayout, CustomerLayout } from './components'
import {
  AboutUs, Blogs, Contact, Home, Login, ProductDetails, Products,
  Register, CustomerProfile, BlogArticle, Cart, Category,
  AdminProfile, AdminControlProduct, AdminProductForm,
  AdminControlUser, AdminUserForm,
  AdminControlCategoria, AdminCategoriaForm
} from './pages'

import { useAuth, tieneRol } from './context/authContext'


function RequireAuth({ children, rol }) {
    const { estaAutenticado, usuario, sesionCerrada } = useAuth()
    const location = useLocation()

    if (!estaAutenticado) {
        return <Navigate to="/login" replace state={{ from: location, sesionCerrada }} />
    }

    if (rol && !tieneRol(usuario, rol)) {
        return <Navigate to="/login" replace state={{ from: location, sesionCerrada }} />
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
          {path: "productos/:idProducto", element: <AdminProductForm/>},
          {path: "productos/nuevo", element: <AdminProductForm/>},
          {path: "usuarios", element: <AdminControlUser/>},
          {path: "usuarios/:id", element: <AdminUserForm/>},
          {path: "usuarios/nuevo", element: <AdminUserForm/>},
          {path: "categorias", element: <AdminControlCategoria/>},
          {path: "categorias/:idCategoria", element: <AdminCategoriaForm/>},
          {path: "categorias/nuevo", element: <AdminCategoriaForm/>}
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
