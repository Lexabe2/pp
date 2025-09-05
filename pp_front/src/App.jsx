import React, {useState} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import AuthPage from './components/AuthPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import UsersPage from './components/UsersPage.jsx';
import EnvError from './components/EnvError.jsx';
import HomePage from './components/Home.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import OperationsList from "./components/EditingWorks.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    const handleLogin = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
    };

    if (!API_URL) {
        return <EnvError/>;
    }

    return (
        <Routes>
            {/* Публичная страница */}
            {!token && <Route path="/" element={<AuthPage onLogin={handleLogin}/>}/>}

            {/* Приватные страницы */}
            <Route
                path="/"
                element={
                    <ProtectedRoute token={token}>
                        <Dashboard onLogout={handleLogout}/>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <ProtectedRoute token={token}>
                        <UsersPage onLogout={handleLogout}/>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/home"
                element={
                    <ProtectedRoute token={token}>
                        <HomePage onLogout={handleLogout}/>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/editing_works/"
                element={
                    <ProtectedRoute token={token}>
                        <OperationsList onLogout={handleLogout}/>
                    </ProtectedRoute>
                }
            />

            {/* Все остальные пути */}
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}