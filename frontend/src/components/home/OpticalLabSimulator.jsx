import React, { useState } from 'react';
import { 
  Sun, 
  ShieldCheck, 
  SlidersHorizontal,
  Check
} from 'lucide-react';

const SIMULATION_MODES = [
  {
    id: 'polarized',
    name: 'Polarized Crystal',
    subtitle: 'Glare Reduction & High-Contrast Vision',
    badge: 'Category 3 Polarized',
    sceneImageStandard: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    sceneImageEnhanced: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    specs: [
      { label: 'Glare Elimination', val: '99.4%' },
      { label: 'Optical Clarity Index', val: 'Abbe 58' },
      { label: 'UV Shielding', val: '100% UV400' },
      { label: 'Core Material', val: 'High-Index Mineral' }
    ],
    description: 'Cuts harsh horizontal reflections from wet roads, water surfaces, and direct sunlight while maintaining crisp chromatic fidelity.'
  },
  {
    id: 'blucut',
    name: 'CyberShield 420nm',
    subtitle: 'Digital Blue-Violet Screen Armor',
    badge: 'HEV 420nm Filter',
    sceneImageStandard: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
    sceneImageEnhanced: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
    specs: [
      { label: 'Blue Light Cut', val: '420nm Filter' },
      { label: 'Screen Contrast', val: '+45% Boost' },
      { label: 'Color Cast', val: 'Neutral (No Yellow)' },
      { label: 'Hard-Coat Layer', val: 'Diamond AR' }
    ],
    description: 'Filters high-energy visible light from monitors and mobile screens, reducing eye strain during extended digital sessions.'
  },
  {
    id: 'photochromic',
    name: 'Adaptive Photochromic',
    subtitle: 'Smart Sunlight Reactive Technology',
    badge: 'Indoor Clear → Outdoor Tint',
    sceneImageStandard: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&q=80&w=1200',
    sceneImageEnhanced: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&q=80&w=1200',
    specs: [
      { label: 'Response Time', val: '< 30 Seconds' },
      { label: 'Indoor Clarity', val: '98% Transmittance' },
      { label: 'Full Sunlight Tint', val: '85% Charcoal' },
      { label: 'Reactivity', val: 'Dynamic UV Sensor' }
    ],
    description: 'Seamlessly transitions from crystal-clear optical lenses indoors to deep tinted protective sunglasses when stepping outside.'
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
    <section className="bg-white py-12 sm:py-20 md:py-28 border-t border-slate-200/70 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-14 gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold tracking-widest uppercase mb-2.5">
              Precision Optical Engineering
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-950 leading-tight">
              Lens Technology &amp; Coatings<span className="text-neutral-400">.</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mt-2 leading-relaxed">
              Compare our specialized lens coatings in real-world lighting. Drag the slider to inspect optical contrast, blue-light filtering, and photochromic activation.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto self-start md:self-auto scrollbar-hide">
            {SIMULATION_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode);
                  setSliderPos(50);
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeMode.id === mode.id
                    ? 'bg-slate-950 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>
        </div>

        {/* Viewfinder Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Viewfinder (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <div
              onMouseMove={(e) => { if (isDragging || e.buttons === 1) handleSliderMove(e); }}
              onTouchMove={handleSliderMove}
              onTouchStart={handleSliderMove}
              onClick={handleSliderMove}
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-black select-none cursor-ew-resize group touch-none"
            >
              {/* Standard scene background */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${activeMode.sceneImageStandard})` }}
              >
                {activeMode.id === 'polarized' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/20 to-transparent mix-blend-screen pointer-events-none" />
                )}
                {activeMode.id === 'blucut' && (
                  <div className="absolute inset-0 bg-blue-500/20 mix-blend-color pointer-events-none" />
                )}
              </div>

              {/* Enhanced coated scene */}
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

                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check size={11} className="text-emerald-400" />
                  Enhanced Coating
                </div>
              </div>

              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                Standard
              </div>

              {/* Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-300 shadow-xl flex items-center justify-center text-slate-800">
                  <SlidersHorizontal size={13} />
                </div>
              </div>

              {/* Bottom Instruction Bar */}
              <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-5 flex items-center justify-between pointer-events-none z-20 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/90 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <span>Lens View: {sliderPos}%</span>
                <span>Drag to Compare</span>
              </div>
            </div>

            {/* Photochromic UV Controller */}
            {activeMode.id === 'photochromic' && (
              <div className="mt-3 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-slate-900">
                <div className="flex items-center gap-2 text-xs">
                  <Sun size={16} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Ambient Sunlight Level</span>
                    <span className="text-[10px] text-slate-500">Indoor (0%) &bull; Full Sun (100%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 w-1/2 max-w-xs">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={uvExposure}
                    onChange={(e) => setUvExposure(Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold text-slate-900 min-w-[32px] text-right">{uvExposure}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Technical Specs Card (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 shadow-sm relative overflow-hidden text-slate-900">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">
                  OPTICAL PROFILE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 font-bold text-[9px] font-mono uppercase tracking-wider">
                  {activeMode.badge}
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 tracking-tight mb-1">
                {activeMode.name}
              </h3>
              <p className="text-xs text-slate-700 font-semibold mb-2.5">
                {activeMode.subtitle}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                {activeMode.description}
              </p>

              <div className="space-y-2.5 pt-3 border-t border-slate-200">
                {activeMode.specs.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{s.label}</span>
                    <span className="font-mono font-bold text-slate-950">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                <ShieldCheck size={14} className="text-emerald-700" /> Optical Lab Verified
              </span>
              <span className="font-mono text-[10px] text-slate-400">100% UV400</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
