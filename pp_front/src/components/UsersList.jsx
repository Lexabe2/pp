"use client"

import {useEffect, useState} from "react"
import "../UsersList.css"

export default function UsersList({onEdit}) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRole, setFilterRole] = useState("all")
    const [viewMode, setViewMode] = useState("grid") // grid or table

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/users/`)
            const data = await response.json()
            // Добавляем mock данные для демонстрации
            const enrichedData = data.map((user) => ({
                ...user,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
                first_name: user.first_name,
                last_name: user.last_name,
            }))
            setUsers(enrichedData)
        } catch (err) {
            console.error("Ошибка загрузки пользователей:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Вы уверены, что хотите удалить пользователя "${username}"?`)) return

        try {
            await fetch(`${API_URL}/users/${id}/`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
            })
            setUsers(users.filter((u) => u.id !== id))
        } catch (err) {
            alert("Ошибка при удалении пользователя")
        }
    }

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        telegram_id: "",
        role: "",
    })

    const handleChange = (e) => {
        const {name, value} = e.target
        setFormData((prev) => ({...prev, [name]: value}))
    }

    const handleAddUser = async () => {
        try {
            const response = await fetch(`${API_URL}/users/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    telegram_id: formData.telegram_id,
                    role: formData.role,
                }),
            })

            if (!response.ok) {
                const errData = await response.json()

                // Преобразуем объект ошибок в строку
                const errorMessages = Object.entries(errData)
                    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
                    .join("\n")

                alert(`Ошибка при добавлении пользователя:\n${errorMessages}`)
                return
            }

            alert("✅ Пользователь успешно добавлен")
        } catch (err) {
            alert(`Ошибка запроса: ${err.message}`)
        }
    }

    const filteredAndSortedUsers = users.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesRole = filterRole === "all" || user.role === filterRole
        return matchesSearch && matchesRole
    })

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Загрузка пользователей...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>👥 Управление пользователями</h1>
                        <p>Полный контроль над пользователями системы</p>
                    </div>
                    <button className="btn btn-primary" name='add_user' onClick={() => setShowModal(true)}>
                        <span className="btn-icon">➕</span> Добавить пользователя
                    </button>

                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>Добавить пользователя</h2>
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label htmlFor="username">Логин</label>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            autoComplete="username"
                                            placeholder="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="email">Почта</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="name@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="password">Пароль</label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="role">Роль</label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="" disabled>Выберите роль</option>
                                            <option value="user">Пользователь</option>
                                            <option value="admin">Администратор</option>
                                            <option value='moderator'>Модератор</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="first_name">Имя</label>
                                        <input
                                            id="first_name"
                                            name="first_name"
                                            type="text"
                                            placeholder="Иван"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="last_name">Фамилия</label>
                                        <input
                                            id="last_name"
                                            name="last_name"
                                            type="text"
                                            placeholder="Иванов"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-field wide">
                                        <label htmlFor="telegram_id">Telegram ID</label>
                                        <input
                                            id="telegram_id"
                                            name="telegram_id"
                                            type="text"
                                            placeholder="123456789"
                                            value={formData.telegram_id}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>


                                <div className="modal-actions">
                                    <button className="btn btn-success" onClick={handleAddUser}>
                                        Сохранить
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Controls */}
            <section className="controls-section">
                <div className="search-bar">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Поиск по имени, email или городу..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm("")}>
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="filters-bar">
                    <div className="filter-group">
                        <label>Роль:</label>
                        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                                className="filter-select">
                            <option value="all">Все роли</option>
                            <option value="admin">👑 Администраторы</option>
                            <option value="moderator">🛡️ Модераторы</option>
                            <option value="user">👤 Пользователи</option>
                        </select>
                    </div>

                    <div className="view-toggle">
                        <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                                onClick={() => setViewMode("grid")}>
                            ⊞ Сетка
                        </button>
                        <button className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                                onClick={() => setViewMode("table")}>
                            ☰ Таблица
                        </button>
                    </div>
                </div>
            </section>

            {/* Users Content */}
            <section className="users-section">
                {filteredAndSortedUsers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Пользователи не найдены</h3>
                        <p>Попробуйте изменить параметры поиска или добавить нового пользователя</p>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="users-grid">
                        {filteredAndSortedUsers.map((user) => (
                            <div key={user.id} className="user-card">
                                <div className="user-card-header">
                                    <div className="user-avatar-wrapper">
                                        <img src={user.avatar || "/placeholder.svg"} alt={user.username}
                                             className="user-avatar"/>
                                    </div>

                                    <div className="user-basic-info">
                                        <h3 className="user-name">{user.username}</h3>
                                        <p className="user-email">{user.email}</p>
                                    </div>

                                    <div className="user-role-badge">
                    <span className={`role-badge ${user.role}`}>
                      {user.role === "admin" && "👑"}
                        {user.role === "moderator" && "🛡️"}
                        {user.role === "user" && "👤"}
                        {user.role}
                    </span>
                                    </div>
                                </div>

                                <div className="user-activity">
                                    {user.last_name && (
                                        <div className="activity-item">
                                            <span className="activity-label">Фамилия:</span>
                                            <span className="activity-value">{user.last_name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="user-activity">
                                    {user.first_name && (
                                        <div className="activity-item">
                                            <span className="activity-label">Имя:</span>
                                            <span className="activity-value">{user.first_name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="user-activity">
                                    {user.telegram_id && (
                                        <div className="activity-item">
                                            <span className="activity-label">Telegram:</span>
                                            <span className="activity-value">📱 {user.telegram_id}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="user-actions">
                                    <button className="action-btn primary" onClick={() => onEdit(user)}>
                                        ✏️ Редактировать
                                    </button>
                                    <button className="action-btn danger"
                                            onClick={() => handleDelete(user.id, user.username)}>
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="users-table-wrapper">
                        <table className="users-table">
                            <thead>
                            <tr>
                                <th>Пользователь</th>
                                <th>Роль</th>
                                <th>Фамилия</th>
                                <th>Имя</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAndSortedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="table-user-info">
                                            <img src={user.avatar || "/placeholder.svg"} alt={user.username}
                                                 className="table-avatar"/>
                                            <div>
                                                <div className="table-username">{user.username}</div>
                                                <div className="table-email">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                      <span className={`table-role-badge ${user.role}`}>
                        {user.role === "admin" && "👑"}
                          {user.role === "moderator" && "🛡️"}
                          {user.role === "user" && "👤"}
                          {user.role}
                      </span>
                                    </td>
                                    <td>{user.last_name}</td>
                                    <td>{user.first_name}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="table-action-btn edit" onClick={() => onEdit(user)}
                                                    title="Редактировать">
                                                ✏️
                                            </button>
                                            <button
                                                className="table-action-btn delete"
                                                onClick={() => handleDelete(user.id, user.username)}
                                                title="Удалить"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}
