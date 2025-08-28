import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {useRegisterSW} from 'virtual:pwa-register/react'
import {BrowserRouter} from 'react-router-dom'

function SWUpdater() {
    const [hasUpdate, setHasUpdate] = useState(false)

    const {registration, updateServiceWorker} = useRegisterSW({
        onRegistered(r) {
            console.log('Service Worker registered:', r)
        },
        onRegisterError(error) {
            console.error('SW registration error:', error)
        }
    })

    // Следим за registration.waiting
    useEffect(() => {
        if (registration?.waiting) {
            setHasUpdate(true)
        }
    }, [registration])

    if (!hasUpdate) return null

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
                updateServiceWorker(true).then(() => window.location.reload())
            }}
        >
            Обновить приложение
        </button>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App/>
            <SWUpdater/>
        </BrowserRouter>
    </React.StrictMode>
)