import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, MessageCircle, Shield, AlertCircle, Crown, UserCheck, Lock, ChevronDown, Sparkles, Upload, Camera } from 'lucide-react';

export default function UserForm({ user, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telegram_id: '',
    role: 'user',
    first_name: '',
    last_name: '',
    password: '',
    avatar: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        telegram_id: user.telegram_id || '',
        role: user.role || 'user',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        password: '',
        avatar: user.avatar || ''
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

    if (!user && !formData.password) {
      newErrors.password = 'Пароль обязателен для нового пользователя';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSave({ ...formData, id: user?.id || Date.now().toString() });
    } catch (err) {
      setErrors({ submit: 'Ошибка при сохранении' });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case 'admin':
        return {
          icon: Crown,
          gradient: 'from-rose-500 to-pink-500',
          description: 'Полный доступ ко всем функциям системы'
        };
      case 'moderator':
        return {
          icon: Shield,
          gradient: 'from-amber-500 to-orange-500',
          description: 'Управление контентом и пользователями'
        };
      default:
        return {
          icon: UserCheck,
          gradient: 'from-emerald-500 to-teal-500',
          description: 'Базовые права пользователя'
        };
    }
  };

  const roleConfig = getRoleConfig(formData.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="relative p-8 border-b border-slate-200/50">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-t-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`p-4 bg-gradient-to-r ${user ? 'from-slate-600 to-slate-700' : 'from-indigo-600 to-purple-600'} rounded-3xl shadow-xl`}>
                {user ? <User className="h-8 w-8 text-white" /> : <Sparkles className="h-8 w-8 text-white" />}
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                  {user ? 'Редактировать пользователя' : 'Создать пользователя'}
                </h2>
                <p className="text-slate-600 mt-2 text-lg">
                  {user ? 'Измените данные пользователя' : 'Заполните информацию о новом пользователе'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-3 hover:bg-white/50 rounded-2xl transition-all duration-300 group"
            >
              <X className="h-6 w-6 text-slate-500 group-hover:text-slate-700" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${roleConfig.gradient} p-1 shadow-lg`}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-slate-400" />
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Загрузить фото
                </button>
              </div>

              {/* Username */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 mb-3">
                  <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  Имя пользователя
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-5 py-4 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm hover:shadow-md ${
                    errors.username ? 'ring-2 ring-rose-500 bg-rose-50/80' : ''
                  }`}
                  placeholder="Введите имя пользователя"
                  required
                />
                {errors.username && (
                  <div className="flex items-center gap-2 text-rose-600 text-sm mt-2 p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.username}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                    <Mail className="h-4 w-4 text-emerald-600" />
                  </div>
                  Email адрес
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-5 py-4 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm hover:shadow-md ${
                    errors.email ? 'ring-2 ring-rose-500 bg-rose-50/80' : ''
                  }`}
                  placeholder="example@email.com"
                  required
                />
                {errors.email && (
                  <div className="flex items-center gap-2 text-rose-600 text-sm mt-2 p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* First Name */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 mb-3">
                  <div className="p-2 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  Имя
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm hover:shadow-md"
                  placeholder="Иван"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Last Name */}
              <div className="group mt-16 lg:mt-0">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                  Фамилия
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm hover:shadow-md"
                  placeholder="Иванов"
                />
              </div>

              {/* Telegram ID */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 mb-3">
                  <div className="p-2 bg-cyan-100 rounded-xl group-hover:bg-cyan-200 transition-colors">
                    <MessageCircle className="h-4 w-4 text-cyan-600" />
                  </div>
                  Telegram ID
                </label>
                <input
                  type="text"
                  name="telegram_id"
                  value={formData.telegram_id}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm hover:shadow-md"
                  placeholder="@username или ID"
                />
              </div>

              {/* Role */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 mb-3">
                  <div className="p-2 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                    <Shield className="h-4 w-4 text-amber-600" />
                  </div>
                  Роль пользователя
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 backdrop-blur-sm transition-all duration-300 text-slate-900 appearance-none shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <option value="admin">Администратор</option>
                    <option value="moderator">Модератор</option>
                    <option value="user">Пользователь</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  </div>
                </div>
                <div className={`mt-3 p-4 rounded-2xl bg-gradient-to-r ${roleConfig.gradient} bg-opacity-10 border border-opacity-20`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-r ${roleConfig.gradient} rounded-xl text-white shadow-lg`}>
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 capitalize">{formData.role}</div>
                      <div className="text-sm text-slate-600">{roleConfig.description}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password */}
              {!user && (
                <div className="group">
                  <label className="flex items-center gap-3 text-sm font-bold text-slate-700 mb-3">
                    <div className="p-2 bg-rose-100 rounded-xl group-hover:bg-rose-200 transition-colors">
                      <Lock className="h-4 w-4 text-rose-600" />
                    </div>
                    Пароль
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 backdrop-blur-sm transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm hover:shadow-md ${
                      errors.password ? 'ring-2 ring-rose-500 bg-rose-50/80' : ''
                    }`}
                    placeholder="••••••••"
                    required={!user}
                    minLength={6}
                  />
                  {errors.password && (
                    <div className="flex items-center gap-2 text-rose-600 text-sm mt-2 p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.password}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Минимум 6 символов
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-6 flex items-center gap-4 p-5 bg-rose-50 border border-rose-200 rounded-2xl">
              <div className="p-2 bg-rose-100 rounded-xl">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <div className="font-semibold text-rose-800">Ошибка сохранения</div>
                <div className="text-rose-700">{errors.submit}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-8 mt-8 border-t border-slate-200/50">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 text-slate-700 bg-slate-100/80 backdrop-blur-sm rounded-2xl hover:bg-slate-200/80 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {user ? 'Обновить' : 'Создать'} пользователя
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}