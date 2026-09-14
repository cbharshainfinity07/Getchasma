import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Users, 
  X, 
  RotateCcw, 
  Sliders, 
  AlertCircle, 
  Sparkles, 
  Check, 
  Smile, 
  Maximize2 
} from 'lucide-react';
import { motion } from 'framer-motion';

const MODEL_FACES = [
  {
    id: 'oval-female',
    name: 'Priya S.',
    faceShape: 'Oval Face',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    glassesPos: { top: '39%', left: '50%', scale: 1.05 }
  },
  {
    id: 'square-male',
    name: 'Vikram M.',
    faceShape: 'Square Face',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    glassesPos: { top: '38%', left: '50%', scale: 1.08 }
  },
  {
    id: 'round-female',
    name: 'Ananya D.',
    faceShape: 'Round Face',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
    glassesPos: { top: '40%', left: '50%', scale: 1.02 }
  },
  {
    id: 'heart-male',
    name: 'Dev R.',
    faceShape: 'Heart Shape',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    glassesPos: { top: '37%', left: '50%', scale: 1.04 }
  }
];

export default function VirtualTryOnModal({ product, isOpen, onClose }) {
  const [tryOnMode, setTryOnMode] = useState('model'); // 'camera' or 'model'
  const [selectedModel, setSelectedModel] = useState(MODEL_FACES[0]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  // Overlay sliders
  const [overlayScale, setOverlayScale] = useState(1.0);
  const [verticalOffset, setVerticalOffset] = useState(0); // in pixels
  const [horizontalOffset, setHorizontalOffset] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start webcam
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      setCameraError('Camera access unavailable. Please grant webcam permissions or enjoy our curated Model Face Studio.');
      setTryOnMode('model');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && tryOnMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, tryOnMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-500">
                Virtual 3D Studio
              </span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-bold">
                Lenskart Benchmark
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-black">
              Try On &ldquo;{product?.name}&rdquo;
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTryOnMode('model')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  tryOnMode === 'model' ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Users size={14} /> Model Faces
              </button>
              <button
                onClick={() => setTryOnMode('camera')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  tryOnMode === 'camera' ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Camera size={14} /> Live Webcam
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-black min-h-[380px] max-h-[440px] flex items-center justify-center overflow-hidden">
          
          {/* CAMERA FEED MODE */}
          {tryOnMode === 'camera' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100" // Mirror feed
              />
              
              {/* Overlaid Glasses */}
              <div
                className="absolute pointer-events-none transition-transform duration-75 flex items-center justify-center"
                style={{
                  top: `calc(44% + ${verticalOffset}px)`,
                  left: `calc(50% + ${horizontalOffset}px)`,
                  transform: `translate(-50%, -50%) scale(${overlayScale * 1.3})`,
                  width: '260px'
                }}
              >
                <img
                  src={product?.image}
                  alt="Glasses Overlay"
                  className="w-full h-auto object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/* Camera Guide Lines */}
              <div className="absolute inset-0 pointer-events-none border border-white/15 m-8 rounded-3xl flex items-center justify-center">
                <span className="text-[11px] text-white/70 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full absolute top-4">
                  Center your eyes with the virtual frame
                </span>
              </div>
            </div>
          )}

          {/* MODEL FACES MODE */}
          {tryOnMode === 'model' && (
            <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
              <img
                src={selectedModel.image}
                alt={selectedModel.name}
                className="w-full h-full object-cover max-w-lg"
              />

              {/* Overlaid Glasses accurately positioned on model's bridge */}
              <div
                className="absolute pointer-events-none transition-all duration-300 flex items-center justify-center"
                style={{
                  top: `calc(${selectedModel.glassesPos.top} + ${verticalOffset}px)`,
                  left: `calc(${selectedModel.glassesPos.left} + ${horizontalOffset}px)`,
                  transform: `translate(-50%, -50%) scale(${selectedModel.glassesPos.scale * overlayScale * 1.25})`,
                  width: '250px'
                }}
              >
                <img
                  src={product?.image}
                  alt="Glasses Overlay"
                  className="w-full h-auto object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.55)]"
                />
              </div>

              {/* Face Shape Badge */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20">
                <Smile size={13} className="text-amber-400" />
                <span>{selectedModel.name} &bull; {selectedModel.faceShape}</span>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 bg-neutral-900/95 flex flex-col items-center justify-center p-6 text-center text-white">
              <AlertCircle size={32} className="text-amber-400 mb-3" />
              <p className="text-xs text-neutral-300 max-w-sm mb-4 leading-relaxed">{cameraError}</p>
              <button
                onClick={() => setTryOnMode('model')}
                className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-full uppercase tracking-wider"
              >
                Switch to Model Studio
              </button>
            </div>
          )}
        </div>

        {/* Model Selector Strip (when in model mode) */}
        {tryOnMode === 'model' && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 overflow-x-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Select Face Type:
            </span>
            <div className="flex items-center gap-2">
              {MODEL_FACES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    selectedModel.id === m.id
                      ? 'bg-black text-white border-black shadow-sm font-bold'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={m.image} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{m.faceShape}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fine Adjustment Sliders */}
        <div className="p-5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Scale slider */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <span className="text-gray-500 font-semibold whitespace-nowrap">Size:</span>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.02"
                value={overlayScale}
                onChange={(e) => setOverlayScale(Number(e.target.value))}
                className="w-24 accent-black cursor-pointer"
              />
            </div>

            {/* Height slider */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <span className="text-gray-500 font-semibold whitespace-nowrap">Bridge Position:</span>
              <input
                type="range"
                min="-25"
                max="25"
                step="1"
                value={verticalOffset}
                onChange={(e) => setVerticalOffset(Number(e.target.value))}
                className="w-24 accent-black cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                setOverlayScale(1.0);
                setVerticalOffset(0);
                setHorizontalOffset(0);
              }}
              className="p-1 text-gray-400 hover:text-black"
              title="Reset Alignment"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-neutral-800"
          >
            Done Inspecting &rarr;
          </button>
        </div>

      </motion.div>
    </div>
  );
}
