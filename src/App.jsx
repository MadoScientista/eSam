import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { ProductCard } from './components/ProductCard'
import { NavBar } from './components/layout/NavBar'
import { LoginForm } from './components/LoginForm'
import { Login } from './pages/Login'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavBar/>
      <main className='main-content'>
        <Login/>
      </main>
      
    </>
    
  )
}

export default App
