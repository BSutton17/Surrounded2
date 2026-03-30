import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './Home.jsx'
import { GameProvider } from './Contex.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <Home />
    </GameProvider>
  </StrictMode>,
)
