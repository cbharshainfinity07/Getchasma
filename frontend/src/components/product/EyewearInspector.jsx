import React, { useState, useRef } from 'react';
import { 
  Eye, 
  Sun, 
  ShieldAlert, 
  Sparkles, 
  RotateCw, 
  ZoomIn, 
  Layers, 
  Maximize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ANGLE_MODES = [
  { id: 'front', label: 'Front Angle' },
  { id: 'threeQuarter', label: '45° Studio' },
  { id: 'side', label: 'Temple Profile' },
  { id: 'craft', label: 'Hinge Detail' }
];

const LENS_COATINGS = [
  { id: 'clear', label: 'Clear Optical', desc: 'Standard ultra-clear anti-reflective lens' },
  { id: 'blucut', label: 'BluCut Shield', desc: 'Anti-blue light digital screen protection filter' },
  { id: 'transition', label: 'Photochromic UV', desc: 'Auto-darkens outdoors in sunlight' },
  { id: 'polarized', label: 'Polarized Dark', desc: 'Category 3 glare-cutting sunglasses' }
];

export default function EyewearInspector({ product }) {
  const [activeAngle, setActiveAngle] = useState('front');
  const [lensCoating, setLensCoating] = useState('clear');
  const [transitionUV, setTransitionUV] = useState(70); // 0 to 100%
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // Select photo based on angle
  const getDisplayImage = () => {
    if (activeAngle === 'front') return product?.image || '/images/product-1.jpg';
    if (activeAngle === 'threeQuarter') return (product?.images && product.images[1]) || product?.image;
    if (activeAngle === 'side') return 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=700&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=700&auto=format&fit=crop';
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-6">
      
      {/* Inspector Top Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400 block">
            Studio Inspector
          </span>
          <h3 className="font-serif text-lg font-bold text-black flex items-center gap-2">
            360° Frame &amp; Lens Simulation
          </h3>
        </div>

        {/* Angle Selection Chips */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-200/60 overflow-x-auto">
          {ANGLE_MODES.map((angle) => (
            <button
              key={angle.id}
              onClick={() => setActiveAngle(angle.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeAngle === angle.id
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {angle.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection Viewport with Zoom Magnifier & Lens Overlay */}
      <div
        ref={containerRef}
        onMouseEnter={() => setZoomActive(true)}
        onMouseLeave={() => setZoomActive(false)}
        onMouseMove={handleMouseMove}
        className="relative aspect-square bg-[#fbfbfb] rounded-2xl border border-gray-100 flex items-center justify-center p-8 overflow-hidden cursor-crosshair group select-none"
      >
        {/* Base Product Image */}
        <motion.img
          key={`${activeAngle}-${lensCoating}`}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          src={getDisplayImage()}
          alt={product?.name || "Eyewear"}
          className={`w-full h-full object-contain mix-blend-multiply transition-all duration-300 pointer-events-none ${
            lensCoating === 'polarized' ? 'brightness-90 contrast-110' : ''
          }`}
        />

        {/* Simulated Lens Effects Overlay */}
        {lensCoating === 'blucut' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Realistic blue anti-reflective glint on the lens area */}
            <div className="w-2/3 h-1/3 bg-gradient-to-tr from-sky-400/25 via-blue-500/20 to-transparent rounded-full blur-xl mix-blend-screen animate-pulse" />
          </div>
        )}

        {lensCoating === 'transition' && (
          <div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center transition-all duration-500"
            style={{
              backgroundColor: `rgba(20, 24, 30, ${(transitionUV / 100) * 0.45})`,
              mixBlendMode: 'multiply'
            }}
          />
        )}

        {lensCoating === 'polarized' && (
          <div className="absolute inset-0 pointer-events-none bg-neutral-900/25 mix-blend-multiply transition-opacity duration-300" />
        )}

        {/* Magnifier Lens Loupe on Hover */}
        {zoomActive && (
          <div
            className="absolute pointer-events-none w-36 h-36 rounded-full border-2 border-black/80 shadow-2xl bg-white overflow-hidden hidden md:block z-30"
            style={{
              left: `calc(${zoomPos.x}% - 72px)`,
              top: `calc(${zoomPos.y}% - 72px)`,
              backgroundImage: `url(${getDisplayImage()})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: '350%',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 border-2 border-white/60 rounded-full" />
          </div>
        )}

        {/* Hover Hint */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-gray-500 border border-gray-200/80 pointer-events-none flex items-center gap-1">
          <ZoomIn size={12} />
          <span>Hover to magnify frame details</span>
        </div>

        {/* Active Angle Badge */}
        <span className="absolute top-3 right-3 text-[10px] font-mono text-gray-400 bg-white/80 px-2.5 py-1 rounded-lg border border-gray-100">
          Viewing: {ANGLE_MODES.find(a => a.id === activeAngle)?.label}
        </span>
      </div>

      {/* Lens Coating Simulator Controls (Lenskart Signature Feature) */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/70 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Layers size={15} className="text-black" />
            Inspect Lens Coatings &amp; Technology
          </span>
          <span className="text-[11px] text-gray-400 font-medium">Click to test live tint</span>
        </div>

        {/* Lens Coating Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LENS_COATINGS.map((coating) => (
            <button
              key={coating.id}
              onClick={() => setLensCoating(coating.id)}
              className={`p-3 rounded-xl text-left border transition-all ${
                lensCoating === coating.id
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200/80 hover:border-gray-300'
              }`}
            >
              <span className="block text-xs font-bold mb-0.5">{coating.label}</span>
              <span className={`text-[10px] block leading-tight ${lensCoating === coating.id ? 'text-gray-300' : 'text-gray-400'}`}>
                {coating.id === 'blucut' && 'Blue reflection'}
                {coating.id === 'transition' && 'Sunlight adaptive'}
                {coating.id === 'polarized' && 'UV400 Glare cut'}
                {coating.id === 'clear' && 'Zero distortion'}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic UV Sunlight Slider for Photochromic Transition */}
        {lensCoating === 'transition' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <Sun size={14} className="text-amber-500" />
                Simulate Ambient UV Exposure
              </span>
              <span className="font-bold text-black">{transitionUV}% Sunlight Tint</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={transitionUV}
              onChange={(e) => setTransitionUV(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>Indoors (Clear 10%)</span>
              <span>Cloudy Daylight (50%)</span>
              <span>Bright Outdoor Sun (100%)</span>
            </div>
          </motion.div>
        )}

        {lensCoating === 'blucut' && (
          <div className="p-3 bg-sky-50 text-sky-900 border border-sky-200/80 rounded-xl text-[11px] flex items-center gap-2">
            <Sparkles size={16} className="text-sky-600 flex-shrink-0" />
            <span>
              <strong>BluCut Protection Active:</strong> Specially treated monomer filters 45% of high-energy blue-violet light from screens and smartphones.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
