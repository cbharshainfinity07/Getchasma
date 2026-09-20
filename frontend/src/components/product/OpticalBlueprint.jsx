import React, { useState } from 'react';
import { Ruler, HelpCircle, Check, X, CreditCard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OpticalBlueprint({ specs, productName }) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Optical measurements (standard eyewear millimeter parameters)
  const measurements = {
    lensWidth: specs?.LensWidth || '52 mm',
    bridgeWidth: specs?.BridgeWidth || '18 mm',
    templeLength: specs?.TempleLength || '142 mm',
    frameHeight: specs?.FrameHeight || '43 mm',
    totalWidth: specs?.TotalWidth || '138 mm',
    fit: 'Medium (Calibrated for Standard Ergonomic Equilibrium)'
  };

  return (
    <div className="relative border border-brand-black/10 bg-white p-6 md:p-8 space-y-6 antialiased font-sans">
      {/* Precision Corner Crosshairs */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-black/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-black/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-black/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-black/40" />
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-black/10">
        <div>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-zinc-400 block mb-1">
            OPTICAL SCHEMATICS // SPEC-MM
          </span>
          <h3 className="text-xl font-bold tracking-tight text-brand-black flex items-center gap-2">
            Frame Blueprint &amp; Millimeter Calibrations
          </h3>
        </div>

        <button
          onClick={() => setSizeGuideOpen(true)}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-600 hover:text-brand-black uppercase tracking-wider cursor-pointer transition-colors"
        >
          <HelpCircle size={14} className="text-[#0f766e]" />
          <span>[ Size Guide ]</span>
        </button>
      </div>

      {/* Visual Blueprint Schematic Diagram */}
      <div className="bg-[#09090b] text-white p-6 relative overflow-hidden border border-brand-black/20">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-6 font-mono">
            <span className="tracking-widest uppercase">SCHEMATIC // SCALE: 1:1 OPHTHALMIC</span>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e] animate-pulse" />
              <span className="text-[#0f766e] font-bold tracking-wider uppercase text-[11px]">TITANIUM VERIFIED</span>
            </div>
          </div>

          {/* SVG Frame Schematic with Dimension Callouts */}
          <div className="flex flex-col items-center justify-center py-4">
            <svg viewBox="0 0 500 160" className="w-full max-w-md stroke-zinc-400 fill-none" strokeWidth="2">
              {/* Left Lens Rim */}
              <rect x="40" y="30" width="160" height="90" rx="20" className="stroke-white/80" strokeWidth="2" />
              {/* Right Lens Rim */}
              <rect x="300" y="30" width="160" height="90" rx="20" className="stroke-white/80" strokeWidth="2" />
              
              {/* Nose Bridge with Laboratory Accent */}
              <path d="M 200 65 Q 250 48 300 65" className="stroke-[#0f766e]" strokeWidth="3" strokeLinecap="square" />
              
              {/* Left Temple Hinge */}
              <path d="M 40 45 L 10 45" className="stroke-white/60" strokeWidth="2" />
              {/* Right Temple Hinge */}
              <path d="M 460 45 L 490 45" className="stroke-white/60" strokeWidth="2" />

              {/* Lens Width Indicator (Left) */}
              <line x1="40" y1="135" x2="200" y2="135" className="stroke-[#0f766e]" strokeDasharray="3 3" />
              <text x="120" y="152" fill="#0f766e" fontSize="11" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                {measurements.lensWidth} Lens
              </text>

              {/* Bridge Width Indicator */}
              <line x1="200" y1="20" x2="300" y2="20" className="stroke-[#0f766e]" strokeDasharray="3 3" />
              <text x="250" y="15" fill="#0f766e" fontSize="11" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                {measurements.bridgeWidth} Bridge
              </text>

              {/* Height Indicator */}
              <line x1="25" y1="30" x2="25" y2="120" className="stroke-zinc-500" strokeDasharray="2 2" />
              <text x="18" y="80" fill="#a1a1aa" fontSize="10" textAnchor="middle" transform="rotate(-90 18 80)" fontFamily="JetBrains Mono, monospace">
                {measurements.frameHeight}
              </text>
            </svg>
          </div>

          {/* Technical Specs Key Values */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-800 text-xs font-mono">
            <div className="p-3 bg-zinc-900/90 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider mb-1">TOTAL WIDTH</span>
              <span className="text-white font-bold text-sm tracking-tight">{measurements.totalWidth}</span>
            </div>
            <div className="p-3 bg-zinc-900/90 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider mb-1">TEMPLE LENGTH</span>
              <span className="text-white font-bold text-sm tracking-tight">{measurements.templeLength}</span>
            </div>
            <div className="p-3 bg-zinc-900/90 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider mb-1">FRAME MASS</span>
              <span className="text-white font-bold text-sm tracking-tight">{specs?.Weight || '19g Featherweight'}</span>
            </div>
            <div className="p-3 bg-zinc-900/90 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider mb-1">FACIAL FIT</span>
              <span className="text-[#0f766e] font-bold text-xs">Calibrated Fit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Face Fit Recommendation Strip */}
      <div className="p-4 bg-[#f5f5f3] border border-brand-black/10 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-brand-black text-white flex items-center justify-center font-bold text-xs">
            M
          </div>
          <div>
            <span className="font-bold text-brand-black block">CRITERIA // MEDIUM TO WIDE CRANIAL ARCH</span>
            <span className="text-zinc-500 text-[11px] font-sans">Ideal for cheekbone width 130 mm to 142 mm.</span>
          </div>
        </div>
        <button
          onClick={() => setSizeGuideOpen(true)}
          className="text-xs font-bold text-brand-black hover:text-[#0f766e] transition-colors cursor-pointer"
        >
          Verify Dimensions &rarr;
        </button>
      </div>

      {/* SIZE GUIDE MODAL (Precision Debit Card Calibration Standard) */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white p-6 md:p-8 max-w-lg w-full border border-brand-black/10 relative text-xs shadow-2xl font-sans"
            >
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-brand-black cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>

              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                CALIBRATION BENCHMARK // ISO-7810
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-brand-black mb-3">
                Determining Frame Proportions
              </h3>
              <p className="text-zinc-600 mb-6 leading-relaxed">
                Standard ISO banking cards share the exact proportion of an optical lens. Use this 10-second reference test before a mirror:
              </p>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-[#f5f5f3] border border-brand-black/10 flex items-start gap-3">
                  <CreditCard size={18} className="text-brand-black flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-black mb-1">1. Place Card at Center Bridge</h4>
                    <p className="text-zinc-600 leading-relaxed font-sans">
                      Align the short edge of any standard card vertically against the crest of your nasal bridge.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-[11px] font-mono">
                  <div className="p-3 bg-white border border-brand-black/10">
                    <span className="font-bold text-brand-black block mb-1">Past Outer Eye</span>
                    <span className="text-zinc-500">Small (&lt;130mm)</span>
                  </div>
                  <div className="p-3 bg-[#f5f5f3] border-2 border-brand-black text-brand-black">
                    <span className="font-bold text-brand-black block mb-1">Edges Match</span>
                    <span className="text-[#0f766e] font-bold">Standard Match</span>
                  </div>
                  <div className="p-3 bg-white border border-brand-black/10">
                    <span className="font-bold text-brand-black block mb-1">Inside Outer Eye</span>
                    <span className="text-zinc-500">Wide (&gt;140mm)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSizeGuideOpen(false)}
                className="w-full py-3.5 bg-brand-black hover:bg-[#0f766e] text-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                CONFIRM CALIBRATION
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
