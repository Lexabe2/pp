"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiUser,
  FiLock,
  FiSmartphone,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiLogOut,
  FiSettings,
  FiUsers,
  FiShield,
} from "react-icons/fi"
import { HiSparkles } from "react-icons/hi2"
import "./App.css"

const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLoginSendCode = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/login-send-code/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (response.ok) {
        setStep(2)
      } else {
        setError(data.error || "Ошибка при логине")
      }
    } catch {
      setError("Ошибка сети")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/verify-code/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code }),
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem("token", data.token)
        setToken(data.token)
      } else {
        setError(data.error || "Неверный код")
      }
    } catch {
      setError("Ошибка сети")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken("")
    setUsername("")
    setPassword("")
    setCode("")
    setStep(1)
    setError("")
  }

  const handleBackToLogin = () => {
    setStep(1)
    setError("")
    setCode("")
  }

  if (!API_URL) {
    return (
      <motion.div
        className="env-error-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="env-error-card"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="env-error-icon"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
          >
            <FiAlertCircle size={48} />
          </motion.div>
          <h2>Настройка окружения</h2>
          <p>Для работы приложения необходимо настроить переменную окружения:</p>
          <motion.code whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
            NEXT_PUBLIC_API_URL
          </motion.code>
          <p>Добавьте её в настройках проекта со значением URL вашего API сервера.</p>
        </motion.div>
      </motion.div>
    )
  }

  if (!token) {
    return (
      <div className="auth-container">
        <motion.div
          className="auth-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="floating-shapes">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`shape shape-${i + 1}`}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 180, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
        >
          <motion.div
            className="auth-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div
              className="logo"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="logo-icon">
                <FiShield size={48} />
              </div>
            </motion.div>
            <h1>Добро пожаловать</h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                className="subtitle"
                initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step === 1 ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 ? "Войдите в свой аккаунт" : "Введите код из Telegram"}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="login-form"
                onSubmit={handleLoginSendCode}
                className="auth-form"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="input-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="username">
                    <FiUser className="input-icon" />
                    Логин
                  </label>
                  <motion.input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </motion.div>

                <motion.div
                  className="input-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="password">
                    <FiLock className="input-icon" />
                    Пароль
                  </label>
                  <motion.input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="error-message"
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <FiAlertCircle className="error-icon" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="spinner"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                      Отправка...
                    </>
                  ) : (
                    <>
                      Продолжить
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        →
                      </motion.div>
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="verify-form"
                onSubmit={handleVerifyCode}
                className="auth-form"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="telegram-info"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    className="telegram-icon"
                    animate={{
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                  >
                    <FiSmartphone size={32} />
                  </motion.div>
                  <p>Мы отправили код подтверждения в ваш Telegram</p>
                </motion.div>

                <motion.div
                  className="input-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="code">Код подтверждения</label>
                  <motion.input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    disabled={loading}
                    maxLength="6"
                    className="code-input"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="error-message"
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <FiAlertCircle className="error-icon" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  className="button-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    type="button"
                    onClick={handleBackToLogin}
                    className="back-button"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiArrowLeft />
                    Назад
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="auth-button"
                    disabled={loading}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          className="spinner"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                        Проверка...
                      </>
                    ) : (
                      <>
                        <FiCheck />
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
    )
  }

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="dashboard-background"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="success-shapes">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className={`success-shape success-shape-${i + 1}`}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 1.5,
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="dashboard-card"
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
      >
        <motion.div
          className="success-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div
            className="success-icon"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 2,
            }}
          >
            <HiSparkles size={64} />
          </motion.div>
          <h1>Добро пожаловать сэр!</h1>
          <p>Вы успешно авторизованы и можете использовать приложение</p>
        </motion.div>

        <motion.div
          className="dashboard-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="feature-grid">
            {[
              { icon: FiSettings, title: "Настройки", desc: "Управляйте параметрами", delay: 0.2 },
              { icon: FiUsers, title: "Команда", desc: "Работайте с коллегами", delay: 0.3 },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + feature.delay, duration: 0.5 }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: { type: "spring", stiffness: 400 },
                }}
              >
                <motion.div className="feature-icon" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  <feature.icon size={32} />
                </motion.div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.button
          onClick={handleLogout}
          className="logout-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          whileHover={{
            scale: 1.02,
            y: -3,
            boxShadow: "0 12px 30px rgba(239, 68, 68, 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <FiLogOut className="logout-icon" />
          Выйти из системы
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
