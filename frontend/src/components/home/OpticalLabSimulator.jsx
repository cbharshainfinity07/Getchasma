import React, { useState } from 'react';
import { 
  Sun, 
  Eye, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Sliders, 
  CheckCircle2 
} from 'lucide-react';

const SIMULATION_MODES = [
  {
    id: 'polarized',
    name: 'Zeiss Polarized Mineral',
    subtitle: 'Glare Reduction & High-Contrast Vision',
    badge: 'Category 3 Polarized',
    sceneImageStandard: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    sceneImageEnhanced: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    specs: [
      { label: 'Glare Elimination', val: '99.4%' },
      { label: 'Optical Abbe Value', val: '58 (Ultra-Crisp)' },
      { label: 'UV Protection', val: '100% UV400 Shield' },
      { label: 'Lens Material', val: 'Precision Mineral Glass' }
    ],
    description: 'Eliminates blinding reflective glare from water, wet highways, and snow without distorting natural chromatic balance.'
  },
  {
    id: 'blucut',
    name: 'CyberShield 420nm',
    subtitle: 'Digital Blue-Violet Screen Armor',
    badge: 'HEV 420nm Filter',
    sceneImageStandard: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
    sceneImageEnhanced: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
    specs: [
      { label: 'High-Energy Blue Light Cut', val: '420nm Protection' },
      { label: 'Anti-Fatigue Index', val: '+45% Contrast' },
      { label: 'Residual Yellow Tint', val: 'Zero (Color Neutral)' },
      { label: 'Coating Hardness', val: '2H Diamond AR' }
    ],
    description: 'Filters destructive high-energy digital wavelength peaks from OLED screens and studio LEDs while preserving true color fidelity.'
  },
  {
    id: 'photochromic',
    name: 'Atelier Gen-8 Photochromic',
    subtitle: 'Adaptive Sunlight Reactive Technology',
    badge: 'Indoors 10% → Outdoors 85%',
    sceneImageStandard: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&q=80&w=1200',
    sceneImageEnhanced: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&q=80&w=1200',
    specs: [
      { label: 'Activation Speed', val: '< 25 Seconds' },
      { label: 'Indoor Clear State', val: '98.5% Transmittance' },
      { label: 'Outdoor Full Tint', val: '85% Deep Charcoal' },
      { label: 'UV Sensor Reactivity', val: 'Smart Dynamic Lux' }
    ],
    description: 'Instantly responds to solar lux levels, converting from clear prescription optical frames indoors to deep Category-3 polarized sunglasses outdoors.'
  }
];

export default function OpticalLabSimulator() {
  const [activeMode, setActiveMode] = useState(SIMULATION_MODES[0]);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [uvExposure, setUvExposure] = useState(85);

  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    if (clientX === undefined) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  };

  return (
    <section className="bg-white py-20 md:py-28 border-t border-slate-200/70 text-slate-900 relative overflow-hidden">
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold tracking-[0.25em] uppercase mb-4 shadow-sm">
              <Sparkles size={12} className="text-blue-600" />
              Sabae • Zeiss Certified Optical Lab
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-slate-950 leading-tight">
              Interactive Lens Engineering<span className="text-blue-600">.</span>
            </h2>
            <p className="text-slate-600 text-xs md:text-sm max-w-lg mt-3 leading-relaxed">
              Experience the visual physics of bespoke optical glass. Drag the calibration slider to witness glare elimination, blue-light blocking, and photochromic activation.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto self-start md:self-auto">
            {SIMULATION_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode);
                  setSliderPos(50);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeMode.id === mode.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-white/80'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>
        </div>

        {/* Viewfinder Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Viewfinder (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <div
              onMouseMove={(e) => { if (isDragging || e.buttons === 1) handleSliderMove(e); }}
              onTouchMove={handleSliderMove}
              onTouchStart={handleSliderMove}
              onClick={handleSliderMove}
              className="relative w-full aspect-[16/10] md:aspect-[16/9] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-black select-none cursor-ew-resize group touch-none"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${activeMode.sceneImageStandard})` }}
              >
                {activeMode.id === 'polarized' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/20 to-transparent mix-blend-screen pointer-events-none" />
                )}
                {activeMode.id === 'blucut' && (
                  <div className="absolute inset-0 bg-blue-500/25 mix-blend-color pointer-events-none" />
                )}
              </div>

              <div
                className="absolute inset-0 bg-cover bg-center overflow-hidden pointer-events-none"
                style={{ 
                  clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  backgroundImage: `url(${activeMode.sceneImageEnhanced})`
                }}
              >
                {activeMode.id === 'polarized' && (
                  <div className="absolute inset-0 bg-amber-950/20 mix-blend-multiply contrast-125 saturate-110 pointer-events-none" />
                )}
                {activeMode.id === 'blucut' && (
                  <div className="absolute inset-0 bg-amber-50/10 mix-blend-soft-light contrast-110 pointer-events-none" />
                )}
                {activeMode.id === 'photochromic' && (
                  <div 
                    className="absolute inset-0 bg-neutral-950 mix-blend-multiply transition-opacity duration-300 pointer-events-none"
                    style={{ opacity: (uvExposure / 100) * 0.85 }}
                  />
                )}

                <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-blue-600" />
                  Zeiss Haute Optique Active
                </div>
              </div>

              <div className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                Uncoated Standard
              </div>

              <div
                className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-white to-indigo-500 shadow-lg z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-2 border-blue-600 shadow-2xl flex items-center justify-center text-blue-600">
                  <Sliders size={16} />
                </div>
              </div>

              <div className="absolute bottom-6 inset-x-6 flex items-center justify-between pointer-events-none z-20 text-[11px] font-mono uppercase tracking-wider text-white/80 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Interactive Calibration: {sliderPos}%
                </span>
                <span>&larr; Drag Slider Across Frame &rarr;</span>
              </div>
            </div>

            {activeMode.id === 'photochromic' && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-slate-900">
                <div className="flex items-center gap-2.5 text-xs">
                  <Sun size={18} className="text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
                  <div>
                    <span className="font-bold text-slate-900 block">Simulate Ambient Solar UV Index</span>
                    <span className="text-[10px] text-slate-500">Indoor Diffused (0%) &bull; Full Outdoor Solar (100%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-1/2 max-w-xs">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={uvExposure}
                    onChange={(e) => setUvExposure(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold text-blue-600 min-w-[36px] text-right">{uvExposure}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Technical Specs Card (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl rounded-3xl relative overflow-hidden text-slate-900">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-blue-600 font-bold">
                  LAB CERTIFICATE N° 8492
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[9px] font-black uppercase tracking-wider">
                  {activeMode.badge}
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-slate-950 tracking-tight mb-1">
                {activeMode.name}
              </h3>
              <p className="text-xs text-blue-600 font-bold mb-3">
                {activeMode.subtitle}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                {activeMode.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                {activeMode.specs.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{s.label}</span>
                    <span className="font-mono font-bold text-slate-950">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                <ShieldCheck size={14} /> Carl Zeiss Verified
              </span>
              <span className="font-mono text-gray-500">ISO 12312-1 COMPLIANT</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
