import React from 'react';
import {motion} from 'framer-motion';
import {useNavigate} from 'react-router-dom';
import {
    LogOut,
    Settings,
    Users,
    Star,
    TrendingUp,
    Sparkles,
} from 'lucide-react';

export default function Dashboard({onLogout}) {
    const navigate = useNavigate();

    const handleFeatureClick = (feature) => {
        if (feature.title === 'Команда') {
            navigate('/users');
        } else if (feature.title === 'Настройки') {
            navigate('/test');
        } else if (feature.title === 'Задачи') {
            navigate('/tasks');
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <motion.div
                className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full border border-white/20 p-8"
                initial={{opacity: 0, y: 60, scale: 0.9}}
                animate={{opacity: 1, y: 0, scale: 1}}
                transition={{
                    duration: 0.8,
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                }}
            >
                <motion.div
                    className="text-center mb-8"
                    initial={{opacity: 0, y: 30}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.4, duration: 0.6}}
                >
                    <motion.div
                        className="inline-flex p-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl shadow-lg mb-6"
                        animate={{
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: 'easeInOut',
                        }}
                    >
                        <Sparkles size={64} className="text-white"/>
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent mb-4">Добро
                        пожаловать!</h1>
                    <p className="text-xl text-slate-600">Вы успешно авторизованы и можете использовать приложение</p>
                </motion.div>

                <motion.div
                    className="mb-8"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.6, duration: 0.6}}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {icon: Settings, title: 'Настройки', desc: 'Управляйте параметрами системы', delay: 0.2},
                            {icon: Users, title: 'Команда', desc: 'Работайте с коллегами эффективно', delay: 0.3},
                            {icon: Star, title: 'Избранное', desc: 'Быстрый доступ к важному', delay: 0.4},
                            {icon: TrendingUp, title: 'Аналитика', desc: 'Отслеживайте прогресс', delay: 0.5},
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                                initial={{opacity: 0, y: 30}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.7 + feature.delay, duration: 0.5}}
                                whileHover={{
                                    scale: 1.08,
                                    y: -8,
                                    transition: {type: 'spring', stiffness: 400},
                                }}
                                onClick={() => handleFeatureClick(feature)}
                                style={{cursor: 'pointer'}}
                            >
                                <motion.div
                                    className="inline-flex p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300"
                                    whileHover={{rotate: 360, scale: 1.1}}
                                    transition={{duration: 0.6, type: 'spring'}}
                                >
                                    <feature.icon size={32} className="text-indigo-600"/>
                                </motion.div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-900 transition-colors">{feature.title}</h3>
                                <p className="text-slate-600 group-hover:text-slate-700 transition-colors">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.button
                    onClick={onLogout}
                    className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 1, duration: 0.5}}
                    whileHover={{
                        scale: 1.05,
                        y: -3,
                    }}
                    whileTap={{scale: 0.98}}
                >
                    <LogOut className="h-5 w-5"/>
                    Выйти из системы
                </motion.button>
                {/* Version Block */}
                <motion.div
                    className="mt-6 text-center"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 1.2, duration: 0.5}}
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 text-sm text-slate-500">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">Версия 0.0.2</span>
                        <span className="text-slate-400">•</span>
                        <span>Обновлено 29.08.2025 09:30</span>
                    </div>

                </motion.div>
            </motion.div>
        </div>
    )
        ;
}