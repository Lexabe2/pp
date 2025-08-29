import { useState, useEffect } from "react";
import { ArrowLeft, LogOut, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRScanner from "./QRScanner";

export default function HeaderActions({ onLogout }) {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Показываем заголовок если:
      // 1. В самом верху страницы (scrollY < 10)
      // 2. Скроллим вверх
      if (currentScrollY < 10 || currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Скрываем при скролле вниз (но только после 100px)
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleQrScan = (result) => {
    console.log("Отсканировано:", result);
  };

  return (
    <>
      {/* Minimalist PWA Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Back button - minimal design */}
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-2xl transition-all duration-200 active:scale-95 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="text-sm font-medium hidden sm:block">Главная</span>
            </button>

            {/* Action buttons - floating style */}
            <div className="flex items-center gap-2">
              {/* QR Scanner button */}
              <button
                onClick={() => setIsScannerOpen(true)}
                className="relative p-3 bg-gradient-to-br from-blue-500/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-600 text-white rounded-2xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl group overflow-hidden"
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <QrCode size={18} className="relative z-10" />
              </button>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="relative p-3 bg-gradient-to-br from-red-500/90 to-rose-600/90 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl group overflow-hidden"
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-white/20 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <LogOut size={18} className="relative z-10" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content offset */}
      <div className="h-16"></div>

      {/* QR Scanner */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQrScan}
      />
    </>
  );
}