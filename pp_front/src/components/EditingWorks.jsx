import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit3, Trash2, Save, X, Plus, Search, Filter, Activity, Clock, Hash, ArrowLeft } from "lucide-react";

const OperationsManager = () => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOperationName, setNewOperationName] = useState("");
  const [newOperationDuration, setNewOperationDuration] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Загрузка всех операций
  const fetchOperations = () => {
    axios
      .get(`${API_URL}/operations/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setOperations(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  // Редактирование операции
  const handleEdit = (op) => {
    setEditingId(op.id);
    setNewName(op.name);
    setNewDuration(op.duration_minutes || "");
  };

  const handleSave = (id) => {
    if (!newName.trim()) return;

    axios
      .put(
        `${API_URL}/operations/${id}/`,
        { name: newName, duration_minutes: Number(newDuration) || 0 },
        { headers: { Authorization: `Token ${token}` } }
      )
      .then(() => {
        setEditingId(null);
        setNewName("");
        setNewDuration("");
        fetchOperations();
      })
      .catch((err) => console.error(err));
  };

  // Удаление операции
  const handleDelete = (id) => {
    if (!window.confirm("Удалить эту операцию?")) return;
    axios
      .delete(`${API_URL}/operations/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(() => fetchOperations())
      .catch((err) => console.error(err));
  };

  // Добавление новой операции
  const handleAddOperation = () => {
    if (!newOperationName.trim()) return;

    axios
      .post(
        `${API_URL}/operations/`,
        { name: newOperationName, duration_minutes: Number(newOperationDuration) || 0 },
        { headers: { Authorization: `Token ${token}` } }
      )
      .then(() => {
        setNewOperationName("");
        setNewOperationDuration("");
        setShowAddForm(false);
        fetchOperations();
      })
      .catch((err) => console.error(err));
  };

  // Фильтрация операций по поиску
  const filteredOperations = operations.filter(op =>
    op.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Форматирование времени
  const formatDuration = (minutes) => {
    if (!minutes) return "0 мин";
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
    }
    return `${minutes} мин`;
  };

  // Функция для возврата назад
  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 border border-white/20">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-2">Загрузка операций</h3>
            <p className="text-slate-600 text-center">Пожалуйста, подождите...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-x-hidden">
      {/* Декоративные элементы */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-6 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Кнопка назад */}
          <div className="mb-6">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>
          </div>

          {/* Заголовок */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-xl">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Управление операциями
            </h1>
          </div>

          {/* Панель управления */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Поиск */}
              <div className="relative flex-1 max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск операций..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Кнопка добавления */}
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Добавить операцию
              </button>
            </div>

            {/* Форма добавления */}
            {showAddForm && (
              <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Новая операция
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Название операции</label>
                    <input
                      type="text"
                      placeholder="Введите название операции"
                      value={newOperationName}
                      onChange={(e) => setNewOperationName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddOperation()}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Время выполнения (мин)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        placeholder="0"
                        value={newOperationDuration}
                        onChange={(e) => setNewOperationDuration(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddOperation}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Save className="w-4 h-4" />
                    Сохранить
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewOperationName("");
                      setNewOperationDuration("");
                    }}
                    className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Контейнер для скролла операций */}
          <div className="max-h-96 sm:max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50 rounded-3xl">
            {filteredOperations.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-3">
                  {searchTerm ? "Операции не найдены" : "Нет операций"}
                </h3>
                <p className="text-slate-600 text-lg max-w-md mx-auto">
                  {searchTerm
                    ? "Попробуйте изменить поисковый запрос или добавить новую операцию"
                    : "Добавьте первую операцию, чтобы начать работу с системой"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOperations.map((op, index) => (
                  <div
                    key={op.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]"
                  >
                    {editingId === op.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Название операции</label>
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                              onKeyPress={(e) => e.key === 'Enter' && handleSave(op.id)}
                              autoFocus
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Время выполнения (мин)</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input
                                type="number"
                                value={newDuration}
                                onChange={(e) => setNewDuration(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSave(op.id)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <Save className="w-4 h-4" />
                            Сохранить
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setNewName("");
                              setNewDuration("");
                            }}
                            className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                          >
                            <X className="w-4 h-4" />
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                              {op.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500 ml-6">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4" />
                              <span className="bg-slate-100 px-2 py-1 rounded-full font-medium text-xs">ID: {op.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium text-xs">
                                {formatDuration(op.duration_minutes)}
                              </span>
                            </div>
                            {op.created_at && (
                              <span className="text-slate-400 text-xs">
                                Создано: {new Date(op.created_at).toLocaleDateString('ru-RU')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(op)}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-blue-200 hover:border-blue-300 hover:shadow-md text-sm"
                          >
                            <Edit3 className="w-4 h-4" />
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(op.id)}
                            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-red-200 hover:border-red-300 hover:shadow-md text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Удалить
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsManager;