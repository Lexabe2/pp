import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function EnvError() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-yellow-600/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <motion.div
                className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/20 text-center"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <motion.div
                    className="inline-flex p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg mb-6"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                    <AlertCircle size={48} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Настройка окружения</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">Для работы приложения необходимо настроить переменную окружения:</p>
                <motion.code
                    className="inline-block px-4 py-2 bg-slate-100 text-slate-800 rounded-lg font-mono text-sm mb-6 hover:bg-slate-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                >
                    VITE_API_URL
                </motion.code>
                <p className="text-slate-600 leading-relaxed">Добавьте её в настройки проекта со значением URL вашего API сервера.</p>
            </motion.div>
        </div>
    );
}