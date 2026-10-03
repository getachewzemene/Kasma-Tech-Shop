import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';
import { QRCodeSVG } from 'qrcode.react';
import { Product } from '../types';
import {
  QrCode,
  Camera,
  X,
  Zap,
  ZapOff,
  RefreshCw,
  Upload,
  CheckCircle2,
  Search,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Tag,
  ArrowRight,
  Maximize2,
  FileText,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

interface QrCodeScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onApplySearchQuery: (query: string) => void;
  language?: 'en' | 'am';
  showToast?: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const QrCodeScannerOverlay: React.FC<QrCodeScannerOverlayProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onApplySearchQuery,
  language = 'en',
  showToast
}) => {
  const isEn = language === 'en';

  // State Management
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'FILE' | 'SAMPLE_TAGS'>('CAMERA');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    code: string;
    product: Product | null;
    timestamp: Date;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [selectedSampleProduct, setSelectedSampleProduct] = useState<Product | null>(null);

  // Refs for video processing
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Synthesize soft audio chime when QR tag is detected
  const playScanChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignore audio context autoplay restrictions gracefully
    }
  }, [soundEnabled]);

  // Match decoded QR payload to store products catalog
  const matchProductFromCode = useCallback((rawCode: string): Product | null => {
    const cleanCode = rawCode.trim();
    if (!cleanCode) return null;

    // 1. Direct match by Product ID
    let found = products.find(p => p.id.toLowerCase() === cleanCode.toLowerCase());
    if (found) return found;

    // 2. Direct match by SKU in product variants
    found = products.find(p => p.variants?.some(v => v.sku.toLowerCase() === cleanCode.toLowerCase()));
    if (found) return found;

    // 3. Search for SKU or Product ID inside URL or JSON payload
    // e.g. "https://kasmashop.com/product/prod-s24-ultra" or {"id":"prod-s24-ultra"}
    try {
      if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
        const parsed = JSON.parse(cleanCode);
        if (parsed.id || parsed.sku) {
          return matchProductFromCode(parsed.id || parsed.sku);
        }
      }
    } catch {
      // ignore JSON parse error
    }

    // 4. Match URL path params
    const urlMatch = cleanCode.match(/(?:product|id|sku)[=/]([a-zA-Z0-9_-]+)/i);
    if (urlMatch && urlMatch[1]) {
      const extractedId = urlMatch[1];
      found = products.find(p => p.id.toLowerCase() === extractedId.toLowerCase() || p.variants?.some(v => v.sku.toLowerCase() === extractedId.toLowerCase()));
      if (found) return found;
    }

    // 5. Partial text match on product name
    found = products.find(p => 
      p.nameEn.toLowerCase().includes(cleanCode.toLowerCase()) || 
      p.nameAm.toLowerCase().includes(cleanCode.toLowerCase()) ||
      p.brand.toLowerCase().includes(cleanCode.toLowerCase())
    );

    return found || null;
  }, [products]);

  // Process decoded QR payload
  const handleDecodedCode = useCallback((code: string) => {
    if (!code || scannedResult?.code === code) return;

    playScanChime();
    
    // Haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    const matchedProd = matchProductFromCode(code);
    setScannedResult({
      code,
      product: matchedProd,
      timestamp: new Date()
    });

    if (matchedProd && showToast) {
      showToast(
        isEn 
          ? `🏷️ Scanned QR Tag: ${matchedProd.nameEn}` 
          : `🏷️ የQR ኮድ ተለይቷል: ${matchedProd.nameAm}`,
        'success'
      );
    } else if (showToast) {
      showToast(
        isEn ? `Scanned QR Code: "${code}"` : `የተነበበ QR ኮድ: "${code}"`,
        'info'
      );
    }
  }, [matchProductFromCode, playScanChime, scannedResult, showToast, isEn]);

  // Continuously scan video stream using jsQR
  const scanVideoFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        handleDecodedCode(code.data);
      }
    }

    animationFrameId.current = requestAnimationFrame(scanVideoFrame);
  }, [handleDecodedCode]);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);

        // Check torch support
        const track = stream.getVideoTracks()[0];
        if (track && (track.getCapabilities as any)) {
          const capabilities = (track.getCapabilities as any)();
          setHasTorchSupport(Boolean(capabilities.torch));
        }

        // Start scanning loop
        scanVideoFrame();
      }
    } catch (err: any) {
      console.warn("Camera initialization error:", err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(isEn ? 'Camera access was denied. Please grant permission in browser settings.' : 'የካሜራ ፈቃድ አልተሰጠም። እባክዎን በብራውዘር መቼት ይፍቀዱ።');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError(isEn ? 'No video camera detected on your device.' : 'በመሳሪያዎ ላይ ምንም ካሜራ አልተገኘም።');
      } else {
        setCameraError(isEn ? 'Unable to access camera. You can still test with sample product tags or image upload.' : 'ካሜራውን መክፈት አልተቻለም። ናሙና QR ኮዶችን በመጠቀም መሞከር ይችላሉ።');
      }
    }
  }, [cameraFacing, isEn, scanVideoFrame, stopCamera]);

  // Toggle Flashlight/Torch
  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track && hasTorchSupport) {
      try {
        const nextState = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState }] as any
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn("Torch toggle failed:", err);
      }
    }
  };

  // Process uploaded image file for QR decoding
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDecodedCode(code.data);
          } else {
            if (showToast) {
              showToast(
                isEn ? 'No QR code tag detected in the uploaded image.' : 'በተጫነው ምስል ላይ ምንም የQR ኮድ አልተገኘም።',
                'warning'
              );
            }
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle manual code or sample selection
  const handleManualSearch = (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    handleDecodedCode(codeToSearch.trim());
  };

  // Manage camera lifecycle based on modal open/tab state
  useEffect(() => {
    if (isOpen && activeTab === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, cameraFacing, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto"
        >
          {/* Header Bar */}
          <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0052FF] to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white tracking-tight">
                    {isEn ? 'Product Tag QR Scanner' : 'የምርት QR ኮድ ስካነር'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Live Camera
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEn ? 'Scan any store product tag or barcode for instant lookup' : 'ማንኛውንም የምርት QR ኮድ በካሜራው ይቃኙ'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  soundEnabled 
                    ? 'bg-slate-800 text-amber-400 border-slate-700' 
                    : 'bg-slate-800/50 text-slate-500 border-slate-800'
                }`}
                title={soundEnabled ? 'Mute Scan Sound' : 'Enable Scan Sound'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-950/80 p-1.5 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('CAMERA'); setScannedResult(null); }}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'CAMERA'
                  ? 'bg-[#0052FF] text-white font-bold shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isEn ? 'Live Camera' : 'ቀጥታ ካሜራ'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('SAMPLE_TAGS'); setScannedResult(null); }}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'SAMPLE_TAGS'
                  ? 'bg-[#0052FF] text-white font-bold shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>{isEn ? 'Sample Tags' : 'ናሙና ኮዶች'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('FILE'); setScannedResult(null); }}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'FILE'
                  ? 'bg-[#0052FF] text-white font-bold shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isEn ? 'Upload Photo' : 'ምስል ጫን'}</span>
            </button>
          </div>

          {/* Content Body Area */}
          <div className="p-5 space-y-5">
            {/* Hidden Canvas element used for frame decoding */}
            <canvas ref={canvasRef} className="hidden" />

            {/* TAB 1: LIVE CAMERA VIEWPORT */}
            {activeTab === 'CAMERA' && (
              <div className="space-y-4">
                <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner group">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Camera Controls Overlay Bar */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    {hasTorchSupport && (
                      <button
                        onClick={toggleTorch}
                        className={`p-2 rounded-xl backdrop-blur-md border transition-colors cursor-pointer ${
                          isTorchOn
                            ? 'bg-amber-500/90 text-slate-950 border-amber-300 font-bold'
                            : 'bg-slate-900/80 text-white border-slate-700/80 hover:bg-slate-800'
                        }`}
                        title="Toggle Flashlight"
                      >
                        {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      onClick={() => setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment')}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md transition-colors cursor-pointer"
                      title="Switch Front/Back Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Target Frame corners and laser scanning line */}
                  {isCameraActive && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-8">
                      <div className="relative w-56 h-56 rounded-2xl border-2 border-dashed border-blue-400/50 flex items-center justify-center">
                        {/* Corner Brackets */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#0052FF] rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#0052FF] rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#0052FF] rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#0052FF] rounded-br-lg" />

                        {/* Animated Laser Scanning Line */}
                        <motion.div
                          animate={{ y: [-90, 90, -90] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                          className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#0052FF] to-transparent shadow-[0_0_12px_#0052FF]"
                        />

                        {/* Target reticle dot */}
                        <div className="w-2 h-2 rounded-full bg-blue-500/80 animate-ping" />
                      </div>
                    </div>
                  )}

                  {/* Camera Error or Loading state */}
                  {!isCameraActive && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="max-w-xs space-y-1">
                        <h4 className="font-bold text-sm text-white">
                          {cameraError ? (isEn ? 'Camera Unavailable' : 'ካሜራ አልተከፈተም') : (isEn ? 'Starting Camera Stream...' : 'ካሜራው በመከፈት ላይ...')}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {cameraError || (isEn ? 'Please allow camera access when prompted by your browser.' : 'እባክዎን ካሜራውን ለመጠቀም ፈቃድ ይስጡ።')}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          {isEn ? 'Retry Camera' : 'እንደገና ሞክር'}
                        </button>
                        <button
                          onClick={() => setActiveTab('SAMPLE_TAGS')}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                        >
                          {isEn ? 'Use Sample Tags' : 'ናሙናዎች ተመልከት'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-center text-xs text-slate-400">
                  {isEn ? '💡 Hold any product QR tag in front of the camera.' : '💡 የምርት QR ኮድ ካሜራው ፊት ለፊት ይያዙ።'}
                </p>
              </div>
            )}

            {/* TAB 2: SAMPLE TAGS SELECTOR & TEST GENERATOR */}
            {activeTab === 'SAMPLE_TAGS' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-blue-400">
                    <Sparkles className="w-4 h-4" />
                    <span>{isEn ? 'Interactive Product QR Tag Demo' : 'የምርቶች QR ኮድ ናሙናዎች'}</span>
                  </div>
                  <p className="text-slate-400">
                    {isEn 
                      ? 'Click any store product tag below to simulate a instant scan lookup or view printable barcode tags.' 
                      : 'ከታች ባሉት ምርቶች ላይ በመንካት በቀላሉ የQR ኮዱን ይሞክሩ።'}
                  </p>
                </div>

                {/* Grid of Store Products with Live Scannable QR Codes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {products.slice(0, 6).map((product) => {
                    const primarySku = product.variants[0]?.sku || product.id;
                    return (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSelectedSampleProduct(product);
                          handleDecodedCode(primarySku);
                        }}
                        className="bg-slate-950 hover:bg-slate-800/80 p-3 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer flex items-center gap-3 group"
                      >
                        <div className="relative w-14 h-14 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                          <QRCodeSVG
                            value={primarySku}
                            size={48}
                            level="M"
                            includeMargin={false}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors truncate">
                            {isEn ? product.nameEn : product.nameAm}
                          </h5>
                          <span className="text-[10px] font-mono text-slate-400 block truncate">
                            SKU: {primarySku}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">
                            ETB {product.price.toLocaleString()}
                          </span>
                        </div>

                        <button 
                          className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 group-hover:bg-[#0052FF] group-hover:text-white transition-all text-[11px] font-bold shrink-0"
                        >
                          {isEn ? 'Scan' : 'ቃኝ'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: FILE UPLOAD */}
            {activeTab === 'FILE' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-16/9 w-full rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-blue-600/20 text-slate-400 group-hover:text-blue-400 flex items-center justify-center mb-3 transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {isEn ? 'Upload QR Tag Photo' : 'የQR ኮድ ምስል ይጫኑ'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {isEn ? 'Drag & drop or browse image file containing product tag barcode' : 'ምስል ለመምረጥ እዚህ ይጫኑ'}
                  </p>
                </div>
              </div>
            )}

            {/* MANUAL SKU/CODE INPUT BAR */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                {isEn ? 'Or Enter SKU / Tag Code Manually' : 'ወይም SKU/ኮድ በእጅ ያስገቡ'}
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleManualSearch(manualCode);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder={isEn ? 'e.g. S24U-TIT-BLK or prod-s24-ultra' : 'ምሳሌ፡ S24U-TIT-BLK'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                  />
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
                >
                  {isEn ? 'Lookup' : 'ፈልግ'}
                </button>
              </form>
            </div>

            {/* SCANNED RESULT DETECTED CARD */}
            <AnimatePresence>
              {scannedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 rounded-2xl border shadow-xl space-y-3 ${
                    scannedResult.product
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100'
                      : 'bg-blue-950/40 border-blue-500/60 text-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        scannedResult.product ? 'bg-emerald-500 text-slate-950' : 'bg-blue-500 text-white'
                      }`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          {scannedResult.product ? (isEn ? 'MATCHED STORE PRODUCT' : 'የተገኘ ምርት') : (isEn ? 'SCANNED PAYLOAD' : 'የተነበበ ኮድ')}
                        </span>
                        <h4 className="font-extrabold text-sm text-white">
                          {scannedResult.product 
                            ? (isEn ? scannedResult.product.nameEn : scannedResult.product.nameAm)
                            : scannedResult.code
                          }
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => setScannedResult(null)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Metadata Breakdown if matched */}
                  {scannedResult.product && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Brand & Category</span>
                        <strong className="text-slate-200">{scannedResult.product.brand}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">Listed Price</span>
                        <strong className="text-emerald-400 font-bold">ETB {scannedResult.product.price.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}

                  {/* Actions for matched product */}
                  <div className="flex items-center gap-2 pt-1">
                    {scannedResult.product ? (
                      <>
                        <button
                          onClick={() => {
                            if (scannedResult.product) {
                              onSelectProduct(scannedResult.product);
                              onClose();
                            }
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{isEn ? 'Open Product Details' : 'የምርት ዝርዝር ክፈት'}</span>
                        </button>

                        <button
                          onClick={() => {
                            onApplySearchQuery(scannedResult.product?.variants[0]?.sku || scannedResult.code);
                            onClose();
                          }}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                        >
                          {isEn ? 'Filter Store' : 'ማጣሪያ አድርግ'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          onApplySearchQuery(scannedResult.code);
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        <span>{isEn ? `Search Catalog for "${scannedResult.code}"` : `በ"${scannedResult.code}" ፈልግ`}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QrCodeScannerOverlay;
