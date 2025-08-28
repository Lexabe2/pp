import { useState } from "react";
import { ArrowLeft, LogOut, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRScanner from "./QRScanner"; // подключаем твой компонент

export default function HeaderActions({ onLogout }) {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleQrScan = (result) => {
    console.log("Отсканировано:", result);
    // здесь можешь вызвать API или что-то сохранить
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Кнопка "На главную" */}
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors duration-300 font-medium"
          >
            <ArrowLeft size={20} />
            На главную
          </button>

          <div className="flex items-center gap-3">
            {/* Кнопка сканера */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-300 font-medium"
            >
              <QrCode size={20} />
              Сканировать QR
            </button>

            {/* Кнопка выхода */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-300 font-medium"
            >
              <LogOut size={20} />
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* QR-сканер */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQrScan}
      />
    </header>
  );
}