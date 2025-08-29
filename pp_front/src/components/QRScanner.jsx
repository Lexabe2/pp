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
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera size={24} />
              <h2 className="text-xl font-semibold">Сканирование QR-кода</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scanner Content */}
        <div className="p-8">
          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Закрыть
              </button>
            </div>
          ) : scannedResult ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
              <p className="text-green-600 font-medium mb-2">QR-код успешно отсканирован!</p>
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600 break-all">{scannedResult}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Container */}
              <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
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
                    <div className="w-48 h-48 border-2 border-white/50 rounded-xl relative">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>

                      {/* Scanning line animation */}
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse transform -translate-y-1/2"></div>
                    </div>

                    {/* Индикатор дополнительной обработки */}
                    {isProcessing && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                          Анализ...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleZoom('in')}
                    disabled={zoomLevel >= 3}
                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ZoomIn size={20} />
                  </button>
                  <button
                    onClick={() => handleZoom('out')}
                    disabled={zoomLevel <= 1}
                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ZoomOut size={20} />
                  </button>
                </div>
                {/* Loading indicator */}
                {!isScanning && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Запуск камеры...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center text-gray-600">
                <p className="text-sm">
                  Наведите камеру на QR-код. Держите устойчиво для маленьких кодов.
                </p>
                <p className="text-xs mt-1 text-gray-500">
                  Зум: {zoomLevel}x {isProcessing && '• Анализ изображения...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}