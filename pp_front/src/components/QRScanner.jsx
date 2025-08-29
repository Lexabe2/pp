import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import QrScanner from 'qr-scanner';
import jsQR from 'jsqr';
import Quagga from "@ericblade/quagga2";
import { X, Camera, AlertCircle, CheckCircle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function QRScanner({ isOpen, onClose, onScan }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const barcodeContainerRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedResult, setScannedResult] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scanMode, setScanMode] = useState('qr'); // 'qr' или 'barcode'
  const [isInitializing, setIsInitializing] = useState(false);

  // Инициализация QR сканера
  const initQRScanner = async () => {
    try {
      setError('');
      setIsInitializing(true);

      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);

      if (!hasCamera) {
        setError('Камера не найдена на устройстве');
        setIsInitializing(false);
        return;
      }

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          setScannedResult(result.data);
          onScan(result.data);
          setTimeout(() => onClose(), 1500);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          maxScansPerSecond: 5,
          returnDetailedScanResult: true,
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
      setIsScanning(true);
      setIsInitializing(false);

      // Дополнительная обработка каждые 500мс
      const interval = setInterval(processImageForSmallQR, 500);
      return () => clearInterval(interval);
    } catch (err) {
      console.error('QR Scanner error:', err);
      setError('Не удалось запустить камеру для QR-кодов');
      setIsInitializing(false);
    }
  };

  // Инициализация сканера штрих-кодов
  const initBarcodeScanner = async () => {
    try {
      setError('');
      setIsInitializing(true);

      // Проверяем доступность камеры
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Останавливаем поток, так как Quagga создаст свой
      stream.getTracks().forEach(track => track.stop());

      await new Promise((resolve, reject) => {
        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: barcodeContainerRef.current,
            constraints: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              facingMode: "environment",
              aspectRatio: { min: 1, max: 2 }
            }
          },
          locator: {
            patchSize: "medium",
            halfSample: true
          },
          numOfWorkers: 2,
          frequency: 10,
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "code_39_reader",
              "code_39_vin_reader",
              "codabar_reader",
              "upc_reader",
              "upc_e_reader",
              "i2of5_reader",
              "2of5_reader",
              "code_93_reader"
            ]
          },
          locate: true
        }, (err) => {
          if (err) {
            console.error('Quagga init error:', err);
            reject(err);
            return;
          }
          console.log('Quagga initialized successfully');
          resolve();
        });
      });

      Quagga.start();
      setIsScanning(true);
      setIsInitializing(false);

      // Обработчик успешного сканирования
      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        console.log('Barcode detected:', code);
        setScannedResult(code);
        onScan(code);
        setTimeout(() => onClose(), 1500);
      });

    } catch (err) {
      console.error('Barcode scanner error:', err);
      setError('Не удалось запустить сканер штрих-кодов. Проверьте разрешения камеры.');
      setIsInitializing(false);
    }
  };

  // Остановка сканера штрих-кодов
  const stopBarcodeScanner = () => {
    try {
      if (Quagga && typeof Quagga.stop === 'function') {
        Quagga.stop();
        Quagga.offDetected();
        Quagga.offProcessed();
      }
    } catch (err) {
      console.log('Error stopping barcode scanner:', err);
    }
  };

  // Дополнительная обработка для маленьких QR-кодов
  const processImageForSmallQR = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || scanMode !== 'qr') return;

    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const variations = [
      imageData,
      enhanceContrast(imageData),
      sharpenImage(imageData),
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
    const factor = 1.5;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, (data[i] - 128) * factor + 128);
      data[i + 1] = Math.min(255, (data[i + 1] - 128) * factor + 128);
      data[i + 2] = Math.min(255, (data[i + 2] - 128) * factor + 128);
    }

    return new ImageData(data, imageData.width, imageData.height);
  };

  // Увеличение резкости
  const sharpenImage = (imageData) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
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
    if (!isOpen) return;

    const cleanup = async () => {
      // Очищаем предыдущие сканеры
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
      stopBarcodeScanner();

      // Небольшая задержка для корректной очистки
      await new Promise(resolve => setTimeout(resolve, 100));

      // Инициализируем новый сканер
      if (scanMode === 'qr') {
        await initQRScanner();
      } else {
        await initBarcodeScanner();
      }
    };

    cleanup();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
      stopBarcodeScanner();
    };
  }, [isOpen, scanMode]);

  const handleZoom = async (direction) => {
    if (!scannerRef.current || scanMode !== 'qr') return;

    const newZoom = direction === 'in'
      ? Math.min(zoomLevel + 0.5, 3)
      : Math.max(zoomLevel - 0.5, 1);

    setZoomLevel(newZoom);
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    stopBarcodeScanner();
    setScannedResult('');
    setError('');
    setZoomLevel(1);
    setManualInput('');
    setScanMode('qr');
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      setScannedResult(manualInput.trim());
      onScan(manualInput.trim());
      setTimeout(() => onClose(), 1500);
    }
  };

  const toggleScanMode = () => {
    const newMode = scanMode === 'qr' ? 'barcode' : 'qr';
    setScanMode(newMode);
    setError('');
    setScannedResult('');
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-sm border border-white/20">
                <Camera size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Сканер кодов</h2>
                <p className="text-slate-300 text-sm">
                  {scanMode === 'qr' ? 'QR-коды и 2D коды' : 'Штрих-коды'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleScanMode}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-medium transition-all duration-200 border border-white/20"
              >
                {scanMode === 'qr' ? 'QR' : 'Штрих'}
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/15 rounded-xl transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-16">
              <div className="p-4 bg-red-50 rounded-2xl inline-block mb-4">
                <AlertCircle className="text-red-500" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Ошибка</h3>
              <p className="text-red-600 mb-6 text-sm">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setError('');
                    setScanMode('qr');
                  }}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 font-medium"
                >
                  Попробовать снова
                </button>
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 font-medium"
                >
                  Закрыть
                </button>
              </div>
            </div>
          ) : scannedResult ? (
            <div className="text-center py-16">
              <div className="p-4 bg-green-50 rounded-2xl inline-block mb-4">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Успешно!</h3>
              <p className="text-green-600 font-medium mb-4">
                {scanMode === 'qr' ? 'QR-код' : 'Штрих-код'} отсканирован
              </p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-700 break-all font-mono">{scannedResult}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Scanner Container */}
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-inner">
                {/* QR Scanner */}
                {scanMode === 'qr' && (
                  <div className="aspect-square">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      style={{ transform: `scale(${zoomLevel})` }}
                      playsInline
                      muted
                    />

                    {/* QR Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-56 h-56 border-2 border-white/70 rounded-2xl relative">
                        <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl"></div>
                        <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl"></div>
                        <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl"></div>
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-blue-400 rounded-br-2xl"></div>
                        <div className="absolute inset-x-2 top-1/2 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse transform -translate-y-1/2 rounded-full"></div>
                      </div>

                      {isProcessing && (
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                          <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                            Анализ...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                      <button
                        onClick={() => handleZoom('in')}
                        disabled={zoomLevel >= 3}
                        className="p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg"
                      >
                        <ZoomIn size={16} />
                      </button>
                      <button
                        onClick={() => handleZoom('out')}
                        disabled={zoomLevel <= 1}
                        className="p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg"
                      >
                        <ZoomOut size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Barcode Scanner */}
                {scanMode === 'barcode' && (
                  <div style={{ aspectRatio: '4/3' }}>
                    <div
                      ref={barcodeContainerRef}
                      className="w-full h-full relative"
                    />

                    {/* Barcode Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-80 h-20 border-2 border-white/70 rounded-xl relative">
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl"></div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl"></div>
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl"></div>
                        <div className="absolute inset-x-2 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse transform -translate-y-1/2"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden canvas for QR processing */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Loading */}
                {(isInitializing || (!isScanning && !error)) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
                      <p className="text-sm font-medium">
                        {isInitializing ? 'Инициализация...' : 'Запуск камеры...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center">
                <div className={`${scanMode === 'qr' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-xl p-4 mb-4`}>
                  <p className={`text-sm ${scanMode === 'qr' ? 'text-blue-800' : 'text-green-800'} font-medium mb-1`}>
                    {scanMode === 'qr' ? 'Наведите на QR-код' : 'Наведите на штрих-код'}
                  </p>
                  <p className={`text-xs ${scanMode === 'qr' ? 'text-blue-600' : 'text-green-600'}`}>
                    {scanMode === 'qr'
                      ? `Зум: ${zoomLevel}x ${isProcessing ? '• Анализ...' : ''}`
                      : 'EAN, Code128, Code39, UPC и другие'
                    }
                  </p>
                </div>
              </div>

              {/* Manual Input */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Ручной ввод
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                    placeholder={scanMode === 'qr' ? 'Введите QR-код' : 'Введите штрих-код'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl disabled:shadow-none"
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