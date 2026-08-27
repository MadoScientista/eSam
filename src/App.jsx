import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { ProductCard } from './components/ProductCard'
import { NavBar } from './components/layout/NavBar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavBar/>
      <ProductCard/>
    </>
    
  )
}

export default App
