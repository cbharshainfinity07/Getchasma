import React, { useState } from 'react';
import { Ruler, HelpCircle, Check, X, CreditCard, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OpticalBlueprint({ specs, productName }) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Optical measurements (standard eyewear millimeter parameters)
  const measurements = {
    lensWidth: '52 mm',
    bridgeWidth: '18 mm',
    templeLength: '142 mm',
    frameHeight: '43 mm',
    totalWidth: '138 mm',
    fit: 'Medium (Fits 85% of Indian Face Structures)'
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 border border-gray-200/80 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400 block">
            Optical Precision Specs
          </span>
          <h3 className="font-serif text-lg font-bold text-black flex items-center gap-2">
            Frame Blueprint &amp; Millimeter Dimensions
          </h3>
        </div>

        <button
          onClick={() => setSizeGuideOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black hover:underline"
        >
          <HelpCircle size={14} />
          <span>Size Guide</span>
        </button>
      </div>

      {/* Visual Blueprint Schematic Diagram */}
      <div className="bg-[#0f1115] text-white rounded-2xl p-6 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-6 font-mono">
            <span>SCHEMATIC // CALIBRATION: 1:1 SCALE</span>
            <span className="text-amber-400 font-bold">TITANIUM REINFORCED</span>
          </div>

          {/* SVG Frame Schematic with Dimension Callouts */}
          <div className="flex flex-col items-center justify-center py-4">
            <svg viewBox="0 0 500 160" className="w-full max-w-md stroke-neutral-400 fill-none" strokeWidth="2">
              {/* Left Lens Rim */}
              <rect x="40" y="30" width="160" height="90" rx="35" className="stroke-white/80" strokeWidth="2.5" />
              {/* Right Lens Rim */}
              <rect x="300" y="30" width="160" height="90" rx="35" className="stroke-white/80" strokeWidth="2.5" />
              
              {/* Nose Bridge */}
              <path d="M 200 65 Q 250 50 300 65" className="stroke-amber-400" strokeWidth="3" />
              
              {/* Left Temple Hinge */}
              <path d="M 40 45 L 10 45" className="stroke-white/60" strokeWidth="2" />
              {/* Right Temple Hinge */}
              <path d="M 460 45 L 490 45" className="stroke-white/60" strokeWidth="2" />

              {/* Lens Width Indicator (Left) */}
              <line x1="40" y1="135" x2="200" y2="135" className="stroke-amber-400" strokeDasharray="3 3" />
              <text x="120" y="152" fill="#fbbf24" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                52 mm Lens
              </text>

              {/* Bridge Width Indicator */}
              <line x1="200" y1="20" x2="300" y2="20" className="stroke-amber-400" strokeDasharray="3 3" />
              <text x="250" y="15" fill="#fbbf24" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                18 mm Bridge
              </text>

              {/* Height Indicator */}
              <line x1="25" y1="30" x2="25" y2="120" className="stroke-white/60" strokeDasharray="2 2" />
              <text x="18" y="80" fill="#a3a3a3" fontSize="10" textAnchor="middle" transform="rotate(-90 18 80)" fontFamily="monospace">
                43 mm
              </text>
            </svg>
          </div>

          {/* Technical Specs Key Values */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-800 text-xs font-mono">
            <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">TOTAL WIDTH</span>
              <span className="text-white font-bold text-sm">{measurements.totalWidth}</span>
            </div>
            <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">TEMPLE LENGTH</span>
              <span className="text-white font-bold text-sm">{measurements.templeLength}</span>
            </div>
            <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">FRAME WEIGHT</span>
              <span className="text-white font-bold text-sm">{specs?.Weight || '19 grams'}</span>
            </div>
            <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">FACE FIT</span>
              <span className="text-emerald-400 font-bold text-xs">Standard Fit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Face Fit Recommendation Pill */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
            M
          </div>
          <div>
            <span className="font-bold text-gray-900 block">Recommended for: Medium to Wide Faces</span>
            <span className="text-gray-500 text-[11px]">Ideal for cheekbone width 130mm to 142mm.</span>
          </div>
        </div>
        <button
          onClick={() => setSizeGuideOpen(true)}
          className="text-xs font-bold text-black underline hover:text-gray-600"
        >
          Check My Size
        </button>
      </div>

      {/* SIZE GUIDE MODAL (Credit Card Test used by Lenskart & Warby Parker) */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-200 relative text-xs"
            >
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>

              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 block mb-1">
                Lenskart Optical Standard
              </span>
              <h3 className="font-serif text-2xl font-bold text-black mb-3">
                How to Find Your Frame Size
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Standard debit/credit cards share the exact proportion of a standard eyewear lens. Use this 10-second mirror test to check your fit:
              </p>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <CreditCard size={20} className="text-black flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-black mb-1">1. Place Card at Center of Nose</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Stand before a mirror and place the short edge of any credit card under the bridge of your nose.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="font-bold text-black block mb-1">Card Extends Past Eye</span>
                    <span className="text-emerald-700 font-semibold">Small Fit (&lt;130mm)</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="font-bold text-black block mb-1">Card Ends at Edge of Eye</span>
                    <span className="text-amber-800 font-bold">Medium Fit (Matches this frame)</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="font-bold text-black block mb-1">Card Inside Edge of Eye</span>
                    <span className="text-purple-700 font-semibold">Wide Fit (&gt;140mm)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSizeGuideOpen(false)}
                className="w-full py-3.5 bg-black text-white font-semibold uppercase tracking-wider rounded-full hover:bg-neutral-800"
              >
                Got It, Thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
