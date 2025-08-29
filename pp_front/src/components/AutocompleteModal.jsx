import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Database, CheckCircle, X, Loader2, ArrowUp, ArrowDown, Clock, Sparkles, Zap, TrendingUp } from 'lucide-react';

// Симуляция базы данных (позже заменим на Supabase)
const mockDatabase = [
  'Y123456789',
  'Y987654321',
  'Y456789123',
  'Y789123456',
  'Y321654987',
  'Y654987321',
  'Y147258369',
  'Y963852741',
  'Y258147963',
  'Y741852963',
  'Y159357486',
  'Y486159357',
  'Y357486159',
  'Y852963741',
  'Y963741852',
  'Y111222333',
  'Y444555666',
  'Y777888999',
  'Y000111222',
  'Y333444555',
  'Y555666777',
  'Y888999000',
  'Y222333444',
  'Y666777888',
  'Y999000111',
  'Y101010101',
  'Y202020202',
  'Y303030303',
  'Y404040404',
  'Y505050505',
  'Y606060606',
  'Y707070707',
  'Y808080808',
  'Y909090909',
  'Y121212121',
  'Y131313131',
  'Y141414141',
  'Y151515151',
  'Y161616161'
];

export default function AutocompleteModal({ isOpen, onClose, onSubmit }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Поиск подсказок в базе данных
  const searchDatabase = async (query) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    // Симуляция задержки API с реалистичным временем
    await new Promise(resolve => setTimeout(resolve, 200));

    const filtered = mockDatabase.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    // Сортировка: точные совпадения в начале, затем по алфавиту
    const sorted = filtered.sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(query.toLowerCase());
      const bStarts = b.toLowerCase().startsWith(query.toLowerCase());

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    });

    setSuggestions(sorted.slice(0, 2)); // Показываем только 2 подсказки
    setShowSuggestions(true);
    setSelectedIndex(-1);
    setIsLoading(false);
  };

  // Обработка изменения ввода
  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
    searchDatabase(value);
  };

  // Обработка клавиш
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && inputValue.trim()) {
        if (inputValue.length === 10 && inputValue.startsWith('Y')) {
          handleSubmit();
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        } else if (inputValue.trim() && inputValue.length === 10 && inputValue.startsWith('Y')) {
          handleSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Выбор подсказки
  const selectSuggestion = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Автоматически отправляем при выборе из подсказок (они точно есть в БД)
    setIsAnimating(true);

    // Добавляем в недавние поиски
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== suggestion);
      return [suggestion, ...filtered].slice(0, 6); // Максимум 6
    });

    // Отправляем результат
    onSubmit(suggestion);

    // Закрываем модальное окно через анимацию
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
      setInputValue('');
      setSuggestions([]);
    }, 800);
  };

  // Отправка формы
  const handleSubmit = () => {
    if (!inputValue.trim() || inputValue.length !== 10 || !inputValue.startsWith('Y')) return;

    // Проверяем существование в базе данных
    if (!mockDatabase.includes(inputValue)) {
      alert(`❌ Серийный номер ${inputValue} не найден в базе данных!`);
      return;
    }

    setIsAnimating(true);

    // Добавляем в недавние поиски
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== inputValue);
      return [inputValue, ...filtered].slice(0, 6);
    });

    // Отправляем результат
    onSubmit(inputValue);

    // Закрываем модальное окно
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
      setInputValue('');
      setSuggestions([]);
    }, 800);
  };

  // Закрытие подсказок при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Автофокус при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 150);
    }
  }, [isOpen]);

  // Сброс состояния при закрытии
  const handleClose = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setIsAnimating(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-gray-900/90 to-black/95 backdrop-blur-lg z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
      <div className={`bg-white/98 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md overflow-hidden border-t border-white/30 sm:border border-white/20 ${
        isAnimating ? 'animate-pulse' : 'animate-in slide-in-from-bottom-4 duration-300'
      }`}>

        {/* Animated Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-6 text-white overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-indigo-400/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 sm:p-3 bg-white/15 rounded-2xl backdrop-blur-sm border border-white/25">
                <Search size={20} sm:size={24} className="animate-pulse" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  Поиск кодов
                  <Sparkles size={14} sm:size={16} className="text-cyan-300 animate-bounce" />
                </h2>
                <p className="text-blue-200 text-xs sm:text-sm font-medium">
                  Умный поиск по базе данных
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Success Animation */}
        {isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/90 to-emerald-600/90 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Успешно!</h3>
              <p className="text-green-100">Данные отправлены</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-none overflow-y-auto">
          {/* Main Input Section */}
          <div className="relative" ref={suggestionsRef}>
            {/* Input Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-blue-400" size={18} sm:size={20} />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => inputValue && setShowSuggestions(true)}
                placeholder="Введите код Y123..."
                className="w-full pl-11 sm:pl-12 pr-12 sm:pr-16 py-3 sm:py-4 text-base sm:text-lg font-mono bg-gradient-to-r from-slate-50 to-blue-50/50 border-2 border-blue-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all duration-300 shadow-lg placeholder-blue-300"
                maxLength={10}
              />

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                  <div className="relative">
                    <Loader2 className="text-blue-500 animate-spin" size={18} sm:size={20} />
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>
              )}

              {/* Clear button */}
              {inputValue && !isLoading && (
                <button
                  onClick={() => {
                    setInputValue('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors hover:scale-110"
                >
                  <X size={18} sm:size={20} />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-2xl border border-blue-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="py-1 sm:py-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left font-mono text-sm sm:text-base transition-all duration-200 flex items-center gap-2 sm:gap-3 group ${
                        index === selectedIndex
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                          : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 text-slate-700 active:bg-blue-50'
                      }`}
                    >
                      <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all duration-200 ${
                        index === selectedIndex ? 'bg-blue-500 animate-pulse' : 'bg-green-400'
                      }`}></div>
                      <span className="flex-1 group-hover:translate-x-0.5 transition-transform duration-200 tracking-wide">{suggestion}</span>
                      {index === selectedIndex && (
                        <CheckCircle className="text-blue-500 animate-bounce" size={14} sm:size={16} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
                  <div className="flex items-center justify-between text-xs text-blue-600">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={10} sm:size={12} />
                      Показано 2 из {mockDatabase.filter(item =>
                        item.toLowerCase().includes(inputValue.toLowerCase())
                      ).length}
                    </span>
                    <div className="hidden sm:flex items-center gap-3 text-blue-500">
                      <span className="flex items-center gap-1 text-xs">
                        <ArrowUp size={10} />
                        <ArrowDown size={10} />
                        навигация
                      </span>
                      <span className="text-xs">Enter - выбор</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || inputValue.length !== 10 || !inputValue.startsWith('Y') || !mockDatabase.includes(inputValue)}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10 text-sm sm:text-base">
              {inputValue.trim() && inputValue.length === 10 && inputValue.startsWith('Y') && mockDatabase.includes(inputValue)
                ? `🚀 Отправить: ${inputValue}`
                : inputValue.trim() && inputValue.length === 10 && inputValue.startsWith('Y') && !mockDatabase.includes(inputValue)
                ? `❌ Не найден в БД: ${inputValue}`
                : inputValue.trim()
                  ? `⚠️ Введите полный код Y + 9 символов (${inputValue.length}/10)`
                  : '✨ Введите код Y123456789'
              }
            </span>
          </button>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Clock size={14} sm:size={16} className="text-slate-500" />
                Недавние поиски
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={`${search}-${index}`}
                    onClick={() => {
                      setInputValue(search);
                      inputRef.current?.focus();
                    }}
                    className="px-2 py-1.5 bg-white/90 hover:bg-white hover:shadow-md text-slate-700 rounded-xl text-xs font-mono transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-200/50 backdrop-blur-sm group"
                  >
                    <span className="group-hover:animate-pulse tracking-wide">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl text-center border border-blue-200/50 backdrop-blur-sm group hover:scale-105 transition-transform duration-200">
              <div className="text-sm font-bold text-blue-600 group-hover:animate-bounce">{mockDatabase.length}</div>
              <div className="text-xs text-blue-700 font-medium">В базе</div>
            </div>
            <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl text-center border border-green-200/50 backdrop-blur-sm group hover:scale-105 transition-transform duration-200">
              <div className="text-sm font-bold text-green-600 group-hover:animate-bounce">
                {mockDatabase.filter(item =>
                  item.toLowerCase().includes(inputValue.toLowerCase())
                ).length}
              </div>
              <div className="text-xs text-green-700 font-medium">Найдено</div>
            </div>
            <div className="p-2 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl text-center border border-slate-200/50 backdrop-blur-sm group hover:scale-105 transition-transform duration-200">
              <div className="text-sm font-bold text-slate-600 group-hover:animate-bounce">{recentSearches.length}</div>
              <div className="text-xs text-slate-700 font-medium">Недавних</div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}