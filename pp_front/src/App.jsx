import React, {useState} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import AuthPage from './components/AuthPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import UsersPage from './components/UsersPage.jsx';
import EnvError from './components/EnvError.jsx';
import HomePage from './components/Home.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    const handleLogin = (newToken) => {
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
    };

    if (!API_URL) {
        return <EnvError/>;
    }

    if (!token) {
        return <AuthPage onLogin={handleLogin}/>;
    }

    return (
        <Routes>
            <Route path="/" element={<Dashboard onLogout={handleLogout}/>}/>
            <Route path="/users" element={<UsersPage onLogout={handleLogout}/>}/>
            <Route path="/test" element={<HomePage onLogout={handleLogout}/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}