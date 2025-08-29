import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import QrScanner from 'qr-scanner';
import jsQR from 'jsqr';
import { X, Camera, AlertCircle, CheckCircle, ZoomIn, ZoomOut } from 'lucide-react';

export default function QRScanner({ isOpen, onClose, onScan }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedResult, setScannedResult] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // Дополнительная обработка для маленьких QR-кодов
  const processImageForSmallQR = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Устанавливаем размер canvas равным размеру видео
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Рисуем текущий кадр
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Получаем данные изображения
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Пробуем разные варианты обработки
    const variations = [
      imageData, // Оригинал
      enhanceContrast(imageData), // Увеличенный контраст
      sharpenImage(imageData), // Резкость
    ];

    for (const data of variations) {
      const code = jsQR(data.data, data.width, data.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        setScannedResult(code.data);
        onScan(code.data);
        setTimeout(() => onClose(), 1500);
        setIsProcessing(false);
        return;
      }
    }

    setIsProcessing(false);
  };

  // Увеличение контраста
  const enhanceContrast = (imageData) => {
    const data = new Uint8ClampedArray(imageData.data);
    const factor = 1.5; // Коэффициент контраста

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, (data[i] - 128) * factor + 128);     // R
      data[i + 1] = Math.min(255, (data[i + 1] - 128) * factor + 128); // G
      data[i + 2] = Math.min(255, (data[i + 2] - 128) * factor + 128); // B
    }

    return new ImageData(data, imageData.width, imageData.height);
  };

  // Увеличение резкости
  const sharpenImage = (imageData) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    // Простой фильтр резкости
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB каналы
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += imageData.data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          const idx = (y * width + x) * 4 + c;
          data[idx] = Math.max(0, Math.min(255, sum));
        }
      }
    }

    return new ImageData(data, width, height);
  };

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const initScanner = async () => {
      try {
        setError('');
        setIsScanning(true);

        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        setHasCamera(hasCamera);

        if (!hasCamera) {
          setError('Камера не найдена на устройстве');
          setIsScanning(false);
          return;
        }

        // Create scanner instance
        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            setScannedResult(result.data);
            onScan(result.data);

            // Auto close after successful scan
            setTimeout(() => {
              onClose();
            }, 1500);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment', // Use back camera if available
            maxScansPerSecond: 5, // Уменьшаем для стабильности
            returnDetailedScanResult: true,
          }
        );

        scannerRef.current = scanner;
        await scanner.start();
        setIsScanning(true);

        // Запускаем дополнительную обработку каждые 500мс
        const interval = setInterval(processImageForSmallQR, 500);

        return () => clearInterval(interval);
      } catch (err) {
        console.error('Scanner initialization error:', err);
        setError('Не удалось запустить камеру. Проверьте разрешения.');
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScan, onClose]);

  // Функция для изменения зума
  const handleZoom = async (direction) => {
    if (!scannerRef.current) return;

    const newZoom = direction === 'in'
      ? Math.min(zoomLevel + 0.5, 3)
      : Math.max(zoomLevel - 0.5, 1);

    setZoomLevel(newZoom);

    try {
      const track = scannerRef.current._qrEnginePromise?.then(() => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack && videoTrack.getCapabilities().zoom) {
            videoTrack.applyConstraints({
              advanced: [{ zoom: newZoom }]
            });
          }
        }
      });
    } catch (err) {
      console.log('Zoom not supported on this device');
    }
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setScannedResult('');
    setError('');
    setZoomLevel(1);
    setManualInput('');
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      setScannedResult(manualInput.trim());
      onScan(manualInput.trim());
      setTimeout(() => onClose(), 1500);
    }
  };

  const handleManualInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Camera size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Сканер QR-кодов</h2>
                <p className="text-blue-100 text-sm">Наведите на код или введите вручную</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        </div>


        {/* Scanner Content */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-16">
              <div className="p-4 bg-red-50 rounded-2xl inline-block mb-4">
                <AlertCircle className="text-red-500" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Ошибка камеры</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 font-medium hover:shadow-lg"
              >
                Закрыть
              </button>
            </div>
          ) : scannedResult ? (
            <div className="text-center py-16">
              <div className="p-4 bg-green-50 rounded-2xl inline-block mb-4">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Успешно!</h3>
              <p className="text-green-600 font-medium mb-4">QR-код отсканирован</p>
              <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
                <p className="text-sm text-gray-700 break-all font-mono">{scannedResult}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Video Container */}
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden aspect-square shadow-inner">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ transform: `scale(${zoomLevel})` }}
                  playsInline
                  muted
                />

                {/* Скрытый canvas для обработки */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Scanning Frame */}
                    <div className="w-56 h-56 border-2 border-white/70 rounded-2xl relative shadow-lg">
                      {/* Corner indicators */}
                      <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl shadow-lg"></div>
                      <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl shadow-lg"></div>
                      <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl shadow-lg"></div>
                      <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-blue-400 rounded-br-2xl shadow-lg"></div>

                      {/* Scanning line animation */}
                      <div className="absolute inset-x-2 top-1/2 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse transform -translate-y-1/2 rounded-full shadow-lg"></div>
                    </div>

                    {/* Индикатор дополнительной обработки */}
                    {isProcessing && (
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                        <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg animate-pulse">
                          Анализ...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-3">
                  <button
                    onClick={() => handleZoom('in')}
                    disabled={zoomLevel >= 3}
                    className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button
                    onClick={() => handleZoom('out')}
                    disabled={zoomLevel <= 1}
                    className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <ZoomOut size={18} />
                  </button>
                </div>

                {/* Loading indicator */}
                {!isScanning && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
                      <p className="text-sm font-medium">Запуск камеры...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Наведите камеру на QR-код
                  </p>
                  <p className="text-xs text-blue-600">
                    Зум: {zoomLevel}x {isProcessing && '• Анализ изображения...'}
                  </p>
                </div>
              </div>

              {/* Manual Input Section */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-700">Ручной ввод</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyPress={handleManualInputKeyPress}
                    placeholder="Введите содержимое QR-кода"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 bg-white shadow-sm"
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-lg"
                  >
                    {manualInput.trim() ? 'Подтвердить' : 'Введите код'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}