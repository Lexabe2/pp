import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Lock,
    Smartphone,
    ArrowLeft,
    Check,
    AlertCircle,
    Shield,
    ArrowRight,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthPage({ onLogin }) {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const codeInputRefs = useRef([]);

    useEffect(() => {
        setCode(codeDigits.join(''));
    }, [codeDigits]);

    const handleCodeDigitChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...codeDigits];
        newDigits[index] = value.slice(-1);
        setCodeDigits(newDigits);
        setError('');

        if (value && index < 5) {
            codeInputRefs.current[index + 1]?.focus();
        }
    };

    const handleCodeDigitKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
            codeInputRefs.current[index - 1]?.focus();
        }

        if (e.key === 'ArrowLeft' && index > 0) {
            codeInputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            codeInputRefs.current[index + 1]?.focus();
        }

        if (e.key === 'Enter' && codeDigits.every(digit => digit)) {
            handleVerifyCode(e);
        }
    };

    const handleCodeDigitPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newDigits = [...codeDigits];

        for (let i = 0; i < 6; i++) {
            newDigits[i] = pastedData[i] || '';
        }

        setCodeDigits(newDigits);

        const nextEmptyIndex = newDigits.findIndex(digit => !digit);
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        codeInputRefs.current[focusIndex]?.focus();
    };

    const handleLoginSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login-send-code/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setStep(2);
            } else {
                setError(data.error || 'Ошибка при логине');
            }
        } catch {
            setError('Ошибка сети');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/verify-code/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, code }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                onLogin(data.token);
            } else {
                setError(data.error || 'Неверный код');
            }
        } catch {
            setError('Ошибка сети');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setStep(1);
        setError('');
        setCode('');
        setCodeDigits(['', '', '', '', '', '']);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <motion.div
                className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                }}
            >
                <motion.div
                    className="text-center p-8 pb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <motion.div
                        className="logo"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                    >
                        <div className="logo-icon">
                            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                                <Shield size={48} className="text-white"/>
                            </div>
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2 mt-4">Добро пожаловать</h1>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={step}
                            className="text-indigo-200"
                            initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: step === 1 ? 20 : -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 ? 'Войдите в свой аккаунт' : 'Введите код из Telegram'}
                        </motion.p>
                    </AnimatePresence>
                </motion.div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="login-form"
                            onSubmit={handleLoginSendCode}
                            className="p-8 pt-4 space-y-6"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <label htmlFor="username" className="flex items-center gap-2 text-white font-medium">
                                    <User className="h-4 w-4"/>
                                    <span>Логин</span>
                                </label>
                                <motion.input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Введите логин"
                                    whileFocus={{ scale: 1.02, y: -2 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                />
                            </motion.div>

                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label htmlFor="password" className="flex items-center gap-2 text-white font-medium">
                                    <Lock className="h-4 w-4"/>
                                    <span>Пароль</span>
                                </label>
                                <motion.input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Введите пароль"
                                    whileFocus={{ scale: 1.02, y: -2 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                />
                            </motion.div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200"
                                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        <AlertCircle className="h-5 w-5 flex-shrink-0"/>
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                disabled={loading}
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        />
                                        Отправка...
                                    </>
                                ) : (
                                    <>
                                        Продолжить
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form
                            key="verify-form"
                            onSubmit={handleVerifyCode}
                            className="p-8 pt-4 space-y-6"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <motion.div
                                className="text-center space-y-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            >
                                <motion.div
                                    className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg"
                                    animate={{
                                        rotate: [0, -10, 10, 0],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <Smartphone size={32} className="text-white"/>
                                </motion.div>
                                <p className="text-indigo-200">Мы отправили код подтверждения в ваш Telegram</p>
                            </motion.div>

                            <motion.div
                                className="space-y-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label htmlFor="code" className="block text-white font-medium text-center">Код подтверждения</label>

                                <motion.div
                                    className="w-full bg-white/20 rounded-full h-2 mb-4"
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(codeDigits.filter(digit => digit).length / 6) * 100}%`
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.div>

                                <motion.div
                                    className="flex gap-2 justify-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    {codeDigits.map((digit, index) => (
                                        <motion.input
                                            key={index}
                                            ref={(el) => (codeInputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            value={digit}
                                            onChange={(e) => handleCodeDigitChange(index, e.target.value)}
                                            onKeyDown={(e) => handleCodeDigitKeyDown(index, e)}
                                            onPaste={handleCodeDigitPaste}
                                            disabled={loading}
                                            className={`w-12 h-12 text-center text-lg font-bold bg-white/20 backdrop-blur-sm border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${digit ? 'border-indigo-500 bg-white/30' : 'border-white/30'} ${error ? 'border-red-500 bg-red-500/20' : ''}`}
                                            maxLength="1"
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{
                                                delay: 0.5 + index * 0.1,
                                                duration: 0.4,
                                                type: 'spring',
                                                stiffness: 200,
                                            }}
                                            whileFocus={{
                                                scale: 1.05,
                                                y: -3,
                                                transition: { type: 'spring', stiffness: 400 },
                                            }}
                                        />
                                    ))}
                                </motion.div>

                                <motion.p
                                    className="text-sm text-indigo-200 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                >
                                    Введите 6-значный код или вставьте его из буфера обмена
                                </motion.p>
                            </motion.div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200"
                                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        <AlertCircle className="h-5 w-5 flex-shrink-0"/>
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div
                                className="flex gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.button
                                    type="button"
                                    onClick={handleBackToLogin}
                                    className="flex-1 py-3 px-6 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <ArrowLeft className="h-5 w-5"/>
                                    Назад
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    disabled={loading || !codeDigits.every(digit => digit)}
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? (
                                        <>
                                            <motion.div
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                            />
                                            Проверка...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-5 w-5"/>
                                            Войти
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}