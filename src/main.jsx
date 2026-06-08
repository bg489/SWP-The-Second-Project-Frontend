import React from 'react'
import ReactDOM from 'react-dom/client'
import Login from './features/users/login/Login'
import './index.css'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div id="center">
      <Login />
    </div>
  </React.StrictMode>,
)