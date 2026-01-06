import 'vite/modulepreload-polyfill'
import React from 'react'
import ReactDOM from 'react-dom/client'
import LandingPage from '../components/LandingPage'
import './theme.css'

ReactDOM.createRoot(document.getElementById('cashback-page')).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>
)