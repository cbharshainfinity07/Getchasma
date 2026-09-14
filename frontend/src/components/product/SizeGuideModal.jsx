import React, { useState } from 'react';
import { X, Ruler, CreditCard, Check, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SizeGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('measure'); // 'measure', 'creditcard', 'faceshape'

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between bg-[#fafafa]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                <Ruler size={18} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-950">Frame Size & Fit Guide</h3>
                <p className="text-xs text-gray-500">Find the perfect millimeter-precision fit for your face</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b border-gray-100 px-6 bg-white">
            <button
              onClick={() => setActiveTab('measure')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'measure'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Frame Sizes (mm)
            </button>
            <button
              onClick={() => setActiveTab('creditcard')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'creditcard'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <CreditCard size={14} />
              Card Method
            </button>
            <button
              onClick={() => setActiveTab('faceshape')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'faceshape'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Face Shape Guide
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-gray-700 text-sm">
            {activeTab === 'measure' && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Narrow / Small</span>
                    <span className="text-xl font-bold font-serif text-black block">&lt; 130 mm</span>
                    <span className="text-[11px] text-gray-500 mt-1 block">Best for petite, slender face profiles</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-center relative overflow-hidden">
                    <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-cyan-600 text-white px-1.5 py-0.5 rounded-full">POPULAR</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-800 block mb-1">Medium / Standard</span>
                    <span className="text-xl font-bold font-serif text-cyan-950 block">130 - 139 mm</span>
                    <span className="text-[11px] text-cyan-800 mt-1 block">Fits 80% of adults universally</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Wide / Large</span>
                    <span className="text-xl font-bold font-serif text-black block">&gt; 140 mm</span>
                    <span className="text-[11px] text-gray-500 mt-1 block">Best for broad jawlines & wider temples</span>
                  </div>
                </div>

                <div className="bg-neutral-900 text-white p-5 rounded-2xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <Sparkles size={14} /> Look on the inside of your current spectacles
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                    Every optical frame has three numbers stamped on the inside temple arm (e.g. <span className="font-mono font-bold text-white bg-white/15 px-1.5 py-0.5 rounded">51 [] 18 148</span>).
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="bg-white/10 p-2 rounded-xl">
                      <span className="font-mono font-bold text-white text-sm block">51 mm</span>
                      <span className="text-neutral-400">Lens Width</span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl">
                      <span className="font-mono font-bold text-white text-sm block">18 mm</span>
                      <span className="text-neutral-400">Bridge Width</span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl">
                      <span className="font-mono font-bold text-white text-sm block">148 mm</span>
                      <span className="text-neutral-400">Temple Length</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'creditcard' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-amber-800" /> Standard Card Measurement Trick
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    A standard credit/ATM card is the exact proportional width of a standard human face half! Stand in front of a mirror, place the short edge of the card against the center of your nose bridge, and observe where the outer edge falls relative to the outer corner of your eye.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-black transition-colors">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs flex-shrink-0">1</div>
                    <div>
                      <h5 className="font-bold text-xs text-black">Card edge extends past the corner of your eye</h5>
                      <p className="text-xs text-gray-500">Your face requires a <strong className="text-black">Narrow / Small size frame (under 130mm)</strong>.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-black transition-colors bg-cyan-50/40">
                    <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-xs flex-shrink-0">2</div>
                    <div>
                      <h5 className="font-bold text-xs text-black">Card edge aligns exactly with the corner of your eye</h5>
                      <p className="text-xs text-gray-500">Your face requires a <strong className="text-black">Medium / Standard size frame (130-139mm)</strong>.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-black transition-colors">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs flex-shrink-0">3</div>
                    <div>
                      <h5 className="font-bold text-xs text-black">Card edge ends before reaching the corner of your eye</h5>
                      <p className="text-xs text-gray-500">Your face requires a <strong className="text-black">Wide / Large size frame (140mm+)</strong>.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faceshape' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <h5 className="font-bold text-xs text-black mb-1">Oval Face</h5>
                  <p className="text-[11px] text-gray-500 mb-2">Balanced proportions with softly rounded jawline.</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Recommended: Aviator, Wayfarer, Rectangle
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <h5 className="font-bold text-xs text-black mb-1">Round Face</h5>
                  <p className="text-[11px] text-gray-500 mb-2">Equal width and length with curved cheeks.</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Recommended: Square, Geometric, Wayfarer
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <h5 className="font-bold text-xs text-black mb-1">Square Face</h5>
                  <p className="text-[11px] text-gray-500 mb-2">Prominent broad jawline and angular cheekbones.</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Recommended: Round, Oval, Browline
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <h5 className="font-bold text-xs text-black mb-1">Heart Face</h5>
                  <p className="text-[11px] text-gray-500 mb-2">Wider forehead narrowing to a delicate chin.</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    Recommended: Cat Eye, Rimless, Light Acetate
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-gray-100 bg-[#fafafa] flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <HelpCircle size={14} /> Unsure? Try our Virtual 3D Try-On
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
