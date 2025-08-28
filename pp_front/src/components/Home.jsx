import React from 'react';
import {ArrowRight, Star, Users, Shield, Zap, Heart, Globe} from 'lucide-react';
import HeaderActions from "./HeaderActions";

export default function HomePage({onLogout}) {
    const features = [
        {
            icon: Shield,
            title: 'Безопасность',
            description: 'Надежная защита ваших данных'
        },
        {
            icon: Zap,
            title: 'Быстрота',
            description: 'Молниеносная скорость работы'
        },
        {
            icon: Users,
            title: 'Команда',
            description: 'Эффективная работа в команде'
        },
        {
            icon: Heart,
            title: 'Удобство',
            description: 'Интуитивно понятный интерфейс'
        }
    ];

    const stats = [
        {number: '10K+', label: 'Пользователей'},
        {number: '99.9%', label: 'Время работы'},
        {number: '24/7', label: 'Поддержка'},
        {number: '50+', label: 'Стран'}
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <div>
                <HeaderActions onLogout={onLogout}/>
            </div>

            {/* Hero Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="mb-8">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                            <Star className="h-4 w-4"/>
                            Новая версия доступна
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
                            Добро пожаловать в
                            <br/>
                            <span
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                будущее
              </span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                            Современное приложение для управления проектами и командной работы.
                            Простое, быстрое и надежное решение для вашего бизнеса.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 flex items-center justify-center gap-3">
                                Начать работу
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform"/>
                            </button>
                            <button
                                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-2xl hover:bg-white transition-all duration-300 shadow-lg border border-white/20">
                                Узнать больше
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div
                                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
                                    <div
                                        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-slate-600 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent mb-6">
                            Почему выбирают нас?
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Мы предлагаем лучшие решения для вашего бизнеса с фокусом на качество и удобство
                            использования.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="group">
                                <div
                                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2">
                                    <div className="mb-6">
                                        <div
                                            className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                                            <feature.icon className="h-8 w-8 text-indigo-600"/>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-indigo-500/25">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Готовы начать?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                            Присоединяйтесь к тысячам довольных пользователей и откройте новые возможности для вашего
                            бизнеса.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                className="group px-8 py-4 bg-white text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 font-semibold">
                                Попробовать бесплатно
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform"/>
                            </button>
                            <button
                                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-300 border border-white/20">
                                Связаться с нами
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white/80 backdrop-blur-xl border-t border-white/20 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                                    <Globe className="h-6 w-6 text-white"/>
                                </div>
                                <span
                                    className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  MyApp
                </span>
                            </div>
                            <p className="text-slate-600 mb-6 max-w-md">
                                Современное решение для управления проектами и командной работы.
                                Делаем вашу работу проще и эффективнее.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-900 mb-4">Продукт</h3>
                            <ul className="space-y-2 text-slate-600">
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Возможности</a></li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Цены</a></li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Безопасность</a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-900 mb-4">Поддержка</h3>
                            <ul className="space-y-2 text-slate-600">
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Документация</a>
                                </li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Помощь</a></li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Контакты</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 mt-12 pt-8 text-center text-slate-600">
                        <p>&copy; 2024 MyApp. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}