import 'vite/modulepreload-polyfill'
import React from 'react'
import ReactDOM from 'react-dom/client'
import Widget from '../components/Widget'
import './theme.css'

ReactDOM.createRoot(document.getElementById('widget')).render(
  <React.StrictMode>
    <Widget />
  </React.StrictMode>
)