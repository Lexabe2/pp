import { useState } from "react";
import { ArrowLeft, LogOut, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRScanner from "./QRScanner";

export default function HeaderActions({ onLogout }) {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleQrScan = (result) => {
    console.log("Отсканировано:", result);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50">
        <div className="px-3 py-2">
          <div className="flex justify-between items-center">
            {/* Кнопка "На главную" - минимальная */}
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-sm active:scale-95"
            >
              <ArrowLeft size={14} />
              <span className="hidden xs:inline text-xs">Главная</span>
            </button>

            <div className="flex items-center gap-1.5">
              {/* Кнопка сканера - минимальная */}
              <button
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-1 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 text-sm active:scale-95"
              >
                <QrCode size={14} />
                <span className="hidden xs:inline text-xs">QR</span>
              </button>

              {/* Кнопка выхода - минимальная */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-sm active:scale-95"
              >
                <LogOut size={14} />
                <span className="hidden xs:inline text-xs">Выход</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Отступ для фиксированного заголовка */}
      <div className="h-12"></div>

      {/* QR-сканер */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQrScan}
      />
    </>
  );
}