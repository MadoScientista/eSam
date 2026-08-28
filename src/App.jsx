import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'

import { AboutUs } from './pages/AboutUs'
import { AdminProfile } from './pages/AdminProfile'
import { Blogs } from './pages/Blogs'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { ProductDetails } from './pages/ProductDetails'
import { Products } from './pages/Products'
import { Register } from './pages/Register'
import { UserProfile } from './pages/UserProfile'

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>,
    children: [
      {
        index: true,
        element: <Home/>
      },
      {
        path:"nosotros",
        element: <AboutUs/>
      },
      {
        path:"admin",
        element:<AdminProfile/>
      },
      {
        path:"blogs",
        element:<Blogs/>
      },
      {
        path:"contacto",
        element:<Contact/>
      },
      {
        path:"login",
        element:<Login/>
      },
      {
        path:"detalleProducto",
        element:<ProductDetails/>
      },
      {
        path:"productos",
        element: <Products/>
      },
      {
        path:"registro",
        element:<Register/>
      },
      {
        path:"usuario",
        element:<UserProfile/>
      }
    ]
  }
])

function App() {  

  return <RouterProvider router={router}/>
}

export default App
