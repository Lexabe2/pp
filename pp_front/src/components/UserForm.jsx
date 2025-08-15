import React, {useState, useEffect} from 'react';
import '../UserForm.css';

export default function UserForm({user, onCancel, onSave}) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        telegram_id: '',
        role: 'user',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                telegram_id: user.telegram_id || '',
                role: user.role || 'user',
            });
        } else {
            setFormData({
                username: '',
                email: '',
                telegram_id: '',
                role: 'user',
            });
        }
        setErrors({});
    }, [user]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Имя пользователя обязательно';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный формат email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = e => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));

        // Очищаем ошибку для поля при изменении
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const method = user ? 'PUT' : 'POST';
            const url = user ? `${API_URL}/users/${user.id}/` : `${API_URL}/users/`;

            const response = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Ошибка при сохранении');
            }

            const data = await response.json();
            onSave(data);
        } catch (err) {
            setErrors({submit: err.message});
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return '👑';
            case 'moderator':
                return '🛡️';
            case 'user':
                return '👤';
            default:
                return '👤';
        }
    };

    return (
        <div className="user-form-overlay">
            <div className="user-form-container">
                <div className="user-form-header">
                    <h2 className="user-form-title">
                        {user ? (
                            <>
                                <span className="form-icon">✏️</span>
                                Редактировать пользователя
                            </>
                        ) : (
                            <>
                                <span className="form-icon">➕</span>
                                Добавить пользователя
                            </>
                        )}
                    </h2>
                    <button className="close-button" onClick={onCancel} type="button">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">👤</span>
                            Имя пользователя
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`form-input ${errors.username ? 'error' : ''}`}
                            placeholder="Введите имя пользователя"
                            required
                        />
                        {errors.username && <span className="error-message">{errors.username}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">📧</span>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="example@email.com"
                            required
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">📱</span>
                            Telegram ID
                        </label>
                        <input
                            type="text"
                            name="telegram_id"
                            value={formData.telegram_id}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="@username или ID"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-icon">🔐</span>
                            Роль
                        </label>
                        <div className="select-wrapper">
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="admin">{getRoleIcon('admin')} Администратор</option>
                                <option value="moderator">{getRoleIcon('moderator')} Модератор</option>
                                <option value="user">{getRoleIcon('user')} Пользователь</option>
                            </select>
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="error-banner">
                            <span className="error-icon">⚠️</span>
                            {errors.submit}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">💾</span>
                                    Сохранить
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-secondary"
                            disabled={isLoading}
                        >
                            <span className="btn-icon">❌</span>
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
