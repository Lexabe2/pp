import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {useRegisterSW} from 'virtual:pwa-register/react'

// Компонент для кнопки обновления приложения
function SWUpdater() {
    const {needRefresh, updateServiceWorker} = useRegisterSW({
        onRegistered(r) {
            console.log('Service worker registered:', r)
        },
        onRegisterError(error) {
            console.error('SW registration error:', error)
        }
    })

    // Показываем кнопку только если есть новая версия
    if (!needRefresh) return null

    return (
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
            onClick={() => {
                updateServiceWorker(true).then(() => {
                    window.location.reload()
                })
            }}
        >
            Обновить приложение
        </button>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App/>
        <SWUpdater/>
    </React.StrictMode>
)