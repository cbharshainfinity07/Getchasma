import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  Check, 
  Droplets, 
  SunMedium, 
  Laptop, 
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LENS_TREATMENTS = [
  {
    id: 'blucut',
    name: 'BlueShield™ 420nm',
    category: 'Digital Defense',
    subtitle: 'High-Energy Visible Screen Filter',
    icon: Laptop,
    badge: 'HEV 420nm Certified',
    coatingColor: 'from-blue-500/15 via-cyan-400/10 to-transparent',
    coatingSheen: 'rgba(56, 189, 248, 0.25)',
    description: 'Bespoke optical coating that reflects and absorbs harmful blue-violet light emitted by smartphones, tablets, and LED displays, alleviating digital ocular strain.',
    specs: [
      { label: 'Blue Light Attenuation', val: '420nm HEV' },
      { label: 'Light Transmittance', val: '99.2%' },
      { label: 'Color Cast', val: 'True Neutral' },
      { label: 'Hardcoat Rating', val: '9H ScratchGuard' }
    ],
    idealFor: 'Software engineers, designers, and daily screen users'
  },
  {
    id: 'polarized',
    name: 'Polarized Category 3',
    category: 'Solar Protection',
    subtitle: 'Zero-Glare Optical Contrast',
    icon: SunMedium,
    badge: '100% UV400 Shield',
    coatingColor: 'from-amber-950/40 via-neutral-900/30 to-amber-950/20',
    coatingSheen: 'rgba(245, 158, 11, 0.2)',
    description: 'Micro-aligned vertical polarizing filters neutralize blinding horizontal glare from roads, water, and glass surfaces while maximizing depth perception.',
    specs: [
      { label: 'Glare Elimination', val: '99.8%' },
      { label: 'UV Wavelength Cutoff', val: '400nm (UVA/UVB)' },
      { label: 'Contrast Boost', val: '+38% Dynamic' },
      { label: 'Polarizing Core', val: 'High-Purity Film' }
    ],
    idealFor: 'Driving, coastal outdoor activities, and high-altitude sunlight'
  },
  {
    id: 'photochromic',
    name: 'Adaptive Transitions™',
    category: 'Dynamic Molecular',
    subtitle: 'Instant Indoor Clear to Outdoor Tint',
    icon: Eye,
    badge: 'Dual-State Reactivity',
    coatingColor: 'from-neutral-900/45 via-neutral-950/35 to-neutral-900/25',
    coatingSheen: 'rgba(148, 163, 184, 0.2)',
    description: 'Photo-sensitive molecular dye matrix dynamically activates within 30 seconds of UV exposure, transitioning seamlessly from clear glasses to dark sunglasses.',
    specs: [
      { label: 'Activation Speed', val: '< 30 Seconds' },
      { label: 'Indoor Clarity', val: '98.5% Clear' },
      { label: 'Outdoor Tint', val: 'Cat 3 (85% Dark)' },
      { label: 'Fadeback Time', val: 'Under 2 Minutes' }
    ],
    idealFor: 'Seamless lifestyle versatility from office desk to bright outdoors'
  },
  {
    id: 'diamond_ar',
    name: 'Diamond AR™ Coating',
    category: 'Ultra-Clear Optics',
    subtitle: '7-Layer Hydrophobic Anti-Reflective',
    icon: Droplets,
    badge: '115° Water Beading',
    coatingColor: 'from-emerald-500/15 via-teal-400/10 to-transparent',
    coatingSheen: 'rgba(16, 185, 129, 0.2)',
    description: '7-layer ion-assisted vacuum deposition eliminates surface reflections, halo glare during night driving, and repels water droplets, dust, and fingerprint smudges.',
    specs: [
      { label: 'Surface Reflection', val: '< 0.4% Glare' },
      { label: 'Abbe Dispersion', val: 'Abbe 58 High-Index' },
      { label: 'Hydrophobic Angle', val: '115° Contact' },
      { label: 'Cleaning Resistance', val: 'Anti-Static Seal' }
    ],
    idealFor: 'Night driving, studio photography, video calls, and minimal maintenance'
  }
];

export default function OpticalLabSimulator() {
  const [activeTreatment, setActiveTreatment] = useState(LENS_TREATMENTS[0]);
  const [isCoatedView, setIsCoatedView] = useState(true);

  return (
    <section className="bg-neutral-50/60 py-10 sm:py-16 md:py-24 border-t border-neutral-200/70 text-neutral-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200/80 text-neutral-700 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 shadow-xs">
              <Layers size={11} className="text-neutral-500" />
              <span>Precision Optical Laboratory</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-neutral-950 leading-tight">
              Lens Technology &amp; Coatings<span className="text-neutral-400">.</span>
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm max-w-xl mt-1.5 leading-relaxed">
              Every GetChasma prescription is crafted in our optical laboratory using medical-grade ophthalmic lenses treated with aerospace anti-reflective nanocoatings.
            </p>
          </div>

          {/* Treatment Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-neutral-200/80 overflow-x-auto self-start md:self-auto scrollbar-hide shadow-xs max-w-full">
            {LENS_TREATMENTS.map((treatment) => {
              const isSelected = activeTreatment.id === treatment.id;
              const IconComp = treatment.icon;

              return (
                <button
                  key={treatment.id}
                  onClick={() => setActiveTreatment(treatment)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-neutral-950 text-white font-bold shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70'
                  }`}
                >
                  <IconComp size={12} className={isSelected ? 'text-amber-400' : 'text-neutral-400'} />
                  <span>{treatment.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interactive Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-stretch">
          
          {/* Optical Frame Visualizer Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 p-5 sm:p-8 relative flex flex-col justify-between shadow-xs overflow-hidden min-h-[340px] sm:min-h-[420px]">
              
              {/* Stage Header Info */}
              <div className="flex items-center justify-between z-10 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 block mb-0.5">
                    {activeTreatment.category}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-950">
                    {activeTreatment.name}
                  </h3>
                </div>

                {/* Coated vs Uncoated Switch */}
                <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-full border border-neutral-200/80">
                  <button
                    onClick={() => setIsCoatedView(false)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      !isCoatedView
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Uncoated
                  </button>
                  <button
                    onClick={() => setIsCoatedView(true)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      isCoatedView
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Sparkles size={10} className="text-amber-400" />
                    <span>Lab Coated</span>
                  </button>
                </div>
              </div>

              {/* Central Eyewear Frame Stage */}
              <div className="relative my-auto py-6 sm:py-10 flex items-center justify-center">
                
                {/* Clean Frame Image */}
                <div className="relative max-w-sm sm:max-w-md w-full aspect-[16/10] flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800&auto=format&fit=crop"
                    alt="Precision Eyewear Frame"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.1)] transition-all duration-700"
                  />

                  {/* Optical Coating Visual Filter Effect */}
                  <AnimatePresence>
                    {isCoatedView && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`absolute inset-x-8 inset-y-4 rounded-3xl bg-gradient-to-tr ${activeTreatment.coatingColor} mix-blend-multiply pointer-events-none`}
                        style={{
                          boxShadow: `inset 0 0 30px ${activeTreatment.coatingSheen}`
                        }}
                      >
                        {/* AR Coating Luster Light Glint */}
                        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/4 bg-white/20 blur-md rounded-full -rotate-45 pointer-events-none" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Glare Reflection overlay if Uncoated */}
                  {!isCoatedView && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3/4 h-1/2 bg-white/40 blur-xl -rotate-12 mix-blend-screen" />
                    </div>
                  )}
                </div>

                {/* Status Indicator Chip */}
                <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/85 backdrop-blur-md text-white text-[10px] font-mono tracking-wider shadow-sm">
                    {isCoatedView ? (
                      <>
                        <Check size={11} className="text-emerald-400" />
                        <span>Nanocoat Active: Surface Glare Neutralized</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>Uncoated: Surface Glare &amp; Blue Light Unfiltered</span>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Stage Sub-footer */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                  Test Standard: ISO 8980-3 Optical
                </span>
                <span className="text-neutral-700 font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  German Lab Grade
                </span>
              </div>

            </div>
          </div>

          {/* Technical Laboratory Specifications (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-bold">
                  OPTICAL PROFILE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 font-bold text-[9px] font-mono uppercase tracking-wider">
                  {activeTreatment.badge}
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight mb-1">
                {activeTreatment.name}
              </h3>
              <p className="text-xs text-neutral-700 font-semibold mb-3">
                {activeTreatment.subtitle}
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed mb-5">
                {activeTreatment.description}
              </p>

              {/* Specs Table */}
              <div className="space-y-2.5 pt-4 border-t border-neutral-100">
                {activeTreatment.specs.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                    <span className="text-neutral-500">{s.label}</span>
                    <span className="font-mono font-bold text-neutral-900 bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-200/60">
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recommended Application */}
              <div className="mt-5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/60">
                <span className="text-[10px] font-mono uppercase font-bold text-neutral-500 tracking-wider block mb-0.5">
                  Optimal Recommendation
                </span>
                <p className="text-xs text-neutral-800 font-medium">
                  {activeTreatment.idealFor}
                </p>
              </div>
            </div>

            {/* Quality Guarantee Footnote */}
            <div className="pt-4 mt-5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
              <span className="flex items-center gap-1.5 text-neutral-800 font-bold">
                <ShieldCheck size={14} className="text-emerald-700" /> 1-Year Lab Anti-Scratch Warranty
              </span>
              <span className="font-mono text-[10px] text-neutral-400">100% Prescription Ready</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
