import { useEffect, useState } from "react"
import { Search, Grid, List, Plus, Edit, Trash2, Users, Filter, X, Eye, MoreVertical, UserCheck, Crown, Shield, ChevronDown, Star, Calendar, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function UsersList({ onEdit }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRole, setFilterRole] = useState("all")
    const [viewMode, setViewMode] = useState("grid")
    const [showModal, setShowModal] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState([])
    const [sortBy, setSortBy] = useState("username")
    const [sortOrder, setSortOrder] = useState("asc")
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        telegram_id: "",
        role: "",
    })

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/users/`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`)
            }

            const data = await response.json()
            const enrichedData = data.map((user) => ({
                ...user,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
                first_name: user.first_name,
                last_name: user.last_name,
                isOnline: Math.random() > 0.3, // Симуляция онлайн статуса
                lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
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
            const token = localStorage.getItem("token")
            await fetch(`${API_URL}/users/${id}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
            })
            setUsers(users.filter((u) => u.id !== id))
        } catch (err) {
            alert("Ошибка при удалении пользователя")
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleAddUser = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/users/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
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
                const errorMessages = Object.entries(errData)
                    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
                    .join("\n")
                alert(`Ошибка при добавлении пользователя:\n${errorMessages}`)
                return
            }

            alert("✅ Пользователь успешно добавлен")
            setShowModal(false)
            setFormData({
                username: "",
                email: "",
                password: "",
                first_name: "",
                last_name: "",
                telegram_id: "",
                role: "",
            })
            fetchUsers()
        } catch (err) {
            alert(`Ошибка запроса: ${err.message}`)
        }
    }

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("asc")
        }
    }

    const filteredAndSortedUsers = users
        .filter((user) => {
            const matchesSearch =
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
            const matchesRole = filterRole === "all" || user.role === filterRole
            return matchesSearch && matchesRole
        })
        .sort((a, b) => {
            const aValue = a[sortBy] || ""
            const bValue = b[sortBy] || ""
            if (sortOrder === "asc") {
                return aValue.toString().localeCompare(bValue.toString())
            } else {
                return bValue.toString().localeCompare(aValue.toString())
            }
        })

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25'
            case 'moderator':
                return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
            case 'user':
                return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
            default:
                return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-lg shadow-slate-500/25'
        }
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <Crown className="w-3 h-3" />
            case 'moderator':
                return <Shield className="w-3 h-3" />
            case 'user':
                return <UserCheck className="w-3 h-3" />
            default:
                return <UserCheck className="w-3 h-3" />
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="relative w-16 h-16 mx-auto mb-6"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600"></div>
                    </motion.div>
                    <motion.h3
                        className="text-xl font-semibold text-slate-800 mb-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Загрузка пользователей
                    </motion.h3>
                    <p className="text-slate-600">Подождите немного...</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div>
                            <motion.h1
                                className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <motion.div
                                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <Users className="h-8 w-8 text-white" />
                                </motion.div>
                                Управление пользователями
                            </motion.h1>
                            <motion.p
                                className="mt-3 text-slate-600 text-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Всего пользователей: <span className="font-semibold text-indigo-600">{users.length}</span>
                            </motion.p>
                        </div>
                        <motion.button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 font-medium"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Plus className="h-5 w-5" />
                            Добавить пользователя
                        </motion.button>
                    </div>
                </motion.div>

                {/* Controls */}
                <motion.div
                    className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Поиск по имени, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 text-slate-900 placeholder-slate-500"
                            />
                            {searchTerm && (
                                <motion.button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Filter */}
                            <div className="flex items-center gap-3">
                                <Filter className="h-5 w-5 text-slate-500" />
                                <div className="relative">
                                    <select
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="appearance-none bg-white/80 backdrop-blur-sm border-0 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-300 text-slate-900"
                                    >
                                        <option value="all">Все роли</option>
                                        <option value="admin">Администраторы</option>
                                        <option value="moderator">Модераторы</option>
                                        <option value="user">Пользователи</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* View Toggle */}
                            <div className="flex bg-slate-100/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm">
                                <motion.button
                                    onClick={() => setViewMode("grid")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${
                                        viewMode === "grid"
                                            ? "bg-white text-indigo-600 shadow-md"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Grid className="h-4 w-4" />
                                    Сетка
                                </motion.button>
                                <motion.button
                                    onClick={() => setViewMode("table")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${
                                        viewMode === "table"
                                            ? "bg-white text-indigo-600 shadow-md"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <List className="h-4 w-4" />
                                    Список
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Users Content */}
                <AnimatePresence mode="wait">
                    {filteredAndSortedUsers.length === 0 ? (
                        <motion.div
                            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-16 text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                className="text-8xl mb-6"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                🔍
                            </motion.div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Пользователи не найдены</h3>
                            <p className="text-slate-600 text-lg">Попробуйте изменить параметры поиска или фильтры</p>
                        </motion.div>
                    ) : viewMode === "grid" ? (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {filteredAndSortedUsers.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    className="group bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <motion.img
                                                    src={user.avatar || "/placeholder.svg"}
                                                    alt={user.username}
                                                    className="w-16 h-16 rounded-2xl border-3 border-white shadow-lg"
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    transition={{ type: "spring", stiffness: 400 }}
                                                />
                                                <motion.div
                                                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-lg ${
                                                        user.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                                                    }`}
                                                    animate={user.isOnline ? { scale: [1, 1.2, 1] } : {}}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-slate-900 truncate text-lg">{user.username}</h3>
                                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {user.isOnline ? 'Онлайн' : `Был ${user.lastSeen}`}
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 hover:bg-slate-100/50 rounded-xl"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                        </motion.button>
                                    </div>

                                    <div className="mb-6">
                                        <motion.span
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            {getRoleIcon(user.role)}
                                            {user.role}
                                        </motion.span>
                                    </div>

                                    <div className="space-y-3 mb-6 text-sm">
                                        {user.first_name && (
                                            <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-xl">
                                                <span className="text-slate-500 font-medium">Имя:</span>
                                                <span className="text-slate-900 font-semibold">{user.first_name}</span>
                                            </div>
                                        )}
                                        {user.last_name && (
                                            <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-xl">
                                                <span className="text-slate-500 font-medium">Фамилия:</span>
                                                <span className="text-slate-900 font-semibold">{user.last_name}</span>
                                            </div>
                                        )}
                                        {user.telegram_id && (
                                            <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-xl">
                                                <span className="text-slate-500 font-medium">Telegram:</span>
                                                <span className="text-slate-900 font-semibold">{user.telegram_id}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <motion.button
                                            onClick={() => onEdit(user)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 text-sm font-semibold shadow-lg shadow-blue-500/25"
                                            whileHover={{ scale: 1.02, y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Edit className="h-4 w-4" />
                                            Изменить
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleDelete(user.id, user.username)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 text-sm font-semibold shadow-lg shadow-rose-500/25"
                                            whileHover={{ scale: 1.02, y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Удалить
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50">
                                        <tr>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                <motion.button
                                                    onClick={() => handleSort('username')}
                                                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    Пользователь
                                                    <ChevronDown className={`h-3 w-3 transition-transform ${sortBy === 'username' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                                </motion.button>
                                            </th>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                <motion.button
                                                    onClick={() => handleSort('role')}
                                                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    Роль
                                                    <ChevronDown className={`h-3 w-3 transition-transform ${sortBy === 'role' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                                </motion.button>
                                            </th>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Статус
                                            </th>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Контакты
                                            </th>
                                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/50">
                                        {filteredAndSortedUsers.map((user, index) => (
                                            <motion.tr
                                                key={user.id}
                                                className="hover:bg-slate-50/50 transition-all duration-300"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                                whileHover={{ scale: 1.01 }}
                                            >
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <motion.img
                                                                src={user.avatar || "/placeholder.svg"}
                                                                alt={user.username}
                                                                className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg"
                                                                whileHover={{ scale: 1.1 }}
                                                                transition={{ type: "spring", stiffness: 400 }}
                                                            />
                                                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                                                user.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                                                            }`} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-lg">{user.username}</div>
                                                            <div className="text-sm text-slate-500">{user.email}</div>
                                                            {(user.first_name || user.last_name) && (
                                                                <div className="text-xs text-slate-400 mt-1">
                                                                    {user.first_name} {user.last_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <motion.span
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        {getRoleIcon(user.role)}
                                                        {user.role}
                                                    </motion.span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                        <span className="text-sm font-medium text-slate-900">
                                                            {user.isOnline ? 'Онлайн' : 'Офлайн'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {user.isOnline ? 'Сейчас активен' : `Был ${user.lastSeen}`}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-sm">
                                                    <div className="space-y-1">
                                                        <div className="text-slate-900 font-medium">{user.email}</div>
                                                        {user.telegram_id && (
                                                            <div className="text-slate-500">TG: {user.telegram_id}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <motion.button
                                                            onClick={() => onEdit(user)}
                                                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                                                            title="Редактировать"
                                                            whileHover={{ scale: 1.1, y: -1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => handleDelete(user.id, user.username)}
                                                            className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                                                            title="Удалить"
                                                            whileHover={{ scale: 1.1, y: -1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add User Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
                                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            >
                                <div className="p-8 border-b border-slate-200/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg"
                                                whileHover={{ scale: 1.05, rotate: 5 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                <Plus className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Добавить пользователя</h2>
                                                <p className="text-slate-600 mt-1">Заполните информацию о новом пользователе</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={() => setShowModal(false)}
                                            className="p-3 hover:bg-slate-100/50 rounded-2xl transition-all duration-300"
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X className="h-6 w-6 text-slate-500" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-3">
                                                Логин
                                            </label>
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                placeholder="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm"
                                                required
                                            />
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-3">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm"
                                            />
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-3">
                                                Пароль
                                            </label>
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm"
                                                required
                                                minLength={6}
                                            />
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <label htmlFor="role" className="block text-sm font-bold text-slate-700 mb-3">
                                                Роль
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="role"
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 backdrop-blur-sm transition-all duration-300 text-slate-900 appearance-none shadow-sm"
                                                    required
                                                >
                                                    <option value="" disabled>Выберите роль</option>
                                                    <option value="user">Пользователь</option>
                                                    <option value="moderator">Модератор</option>
                                                    <option value="admin">Администратор</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <label htmlFor="first_name" className="block text-sm font-bold text-slate-700 mb-3">
                                                Имя
                                            </label>
                                            <input
                                                id="first_name"
                                                name="first_name"
                                                type="text"
                                                placeholder="Иван"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm"
                                            />
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <label htmlFor="last_name" className="block text-sm font-bold text-slate-700 mb-3">
                                                Фамилия
                                            </label>
                                            <input
                                                id="last_name"
                                                name="last_name"
                                                type="text"
                                                placeholder="Иванов"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm"
                                            />
                                        </motion.div>

                                        <motion.div
                                            className="md:col-span-2"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                        >
                                            <label htmlFor="telegram_id" className="block text-sm font-bold text-slate-700 mb-3">
                                                Telegram ID
                                            </label>
                                            <input
                                                id="telegram_id"
                                                name="telegram_id"
                                                type="text"
                                                placeholder="123456789"
                                                value={formData.telegram_id}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm"
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="p-8 border-t border-slate-200/50 bg-slate-50/30 backdrop-blur-sm flex gap-4 justify-end rounded-b-3xl">
                                    <motion.button
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl hover:bg-slate-50 transition-all duration-300 font-semibold shadow-sm"
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Отмена
                                    </motion.button>
                                    <motion.button
                                        onClick={handleAddUser}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg shadow-indigo-500/25"
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Сохранить
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}