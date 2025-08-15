import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useRegisterSW } from 'virtual:pwa-register/react'

// Компонент для кнопки обновления приложения
function SWUpdater() {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      console.log('Service worker registered:', r)
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    }
  })

  return needRefresh ? (
    <button
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 16px',
        background: '#317EFB',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
      onClick={() => updateServiceWorker()}
    >
      Обновить приложение
    </button>
  ) : null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <SWUpdater />
  </React.StrictMode>
)