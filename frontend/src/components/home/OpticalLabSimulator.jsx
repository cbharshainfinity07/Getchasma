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

export const LaboratoryTelemetry = ({ abbeValue = "58.2", refractiveIndex = "1.67", uvCut = "400nm" }) => {
  return (
    <div className="relative border border-brand-black/10 bg-[#f5f5f3] p-6 text-brand-black antialiased">
      {/* Precision Corner Crosshairs */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-black/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-black/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-black/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-black/40" />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-brand-black/10 pb-3 mb-5">
        <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-zinc-500">
          SURFACING TELEMETRY // CAL-49
        </span>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e] animate-pulse" />
          <span className="font-mono text-[10px] tracking-wider text-[#0f766e] uppercase">
            CALIBRATED
          </span>
        </div>
      </div>

      {/* Telemetry Matrix */}
      <div className="grid grid-cols-3 gap-4 font-mono">
        <div>
          <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Index</span>
          <span className="text-lg font-semibold tracking-tight text-brand-black">{refractiveIndex}</span>
        </div>
        <div className="border-x border-brand-black/10 px-3">
          <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Abbe Value</span>
          <span className="text-lg font-semibold tracking-tight text-brand-black">{abbeValue}</span>
        </div>
        <div>
          <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Spectral Cut</span>
          <span className="text-lg font-semibold tracking-tight text-brand-black">{uvCut}</span>
        </div>
      </div>
    </div>
  );
};

const LENS_TREATMENTS = [
  {
    id: 'blucut',
    name: 'BlueShield™ 420nm',
    category: 'Digital Defense',
    subtitle: 'High-Energy Visible Screen Filter',
    icon: Laptop,
    badge: 'HEV 420nm Certified',
    refractiveIndex: '1.56',
    abbeValue: '38.0',
    uvCut: '420nm',
    coatingColor: 'from-[#0f766e]/20 via-zinc-900/10 to-transparent',
    coatingSheen: 'rgba(15, 118, 110, 0.25)',
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
    refractiveIndex: '1.60',
    abbeValue: '41.0',
    uvCut: '400nm',
    coatingColor: 'from-zinc-950/40 via-zinc-900/30 to-zinc-950/20',
    coatingSheen: 'rgba(9, 9, 11, 0.25)',
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
    refractiveIndex: '1.61',
    abbeValue: '42.0',
    uvCut: '400nm',
    coatingColor: 'from-zinc-950/50 via-zinc-900/35 to-zinc-950/25',
    coatingSheen: 'rgba(9, 9, 11, 0.3)',
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
    refractiveIndex: '1.67',
    abbeValue: '58.2',
    uvCut: '400nm',
    coatingColor: 'from-[#0f766e]/25 via-zinc-800/15 to-transparent',
    coatingSheen: 'rgba(15, 118, 110, 0.3)',
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
    <section className="bg-[#fcfcfb] py-12 sm:py-16 md:py-24 border-t border-brand-black/10 text-brand-black relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 border-b border-brand-black/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-zinc-500 mb-2">
              <Layers size={12} className="text-[#0f766e]" />
              <span>CHASMA ATELIER // OPTICAL LAB DISPENSARY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-black leading-tight">
              SURFACING &amp; NANOCOAT LAB
            </h2>
            <p className="text-zinc-600 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
              Every prescription is surfaced under micron robotic calibration tolerances using medical-grade ophthalmic monomers and ion-assisted vacuum nanocoatings.
            </p>
          </div>

          {/* Treatment Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-brand-cream border border-brand-black/10 overflow-x-auto self-start md:self-auto scrollbar-hide max-w-full rounded-none">
            {LENS_TREATMENTS.map((treatment) => {
              const isSelected = activeTreatment.id === treatment.id;
              const IconComp = treatment.icon;

              return (
                <button
                  key={treatment.id}
                  onClick={() => setActiveTreatment(treatment)}
                  className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 rounded-none ${
                    isSelected
                      ? 'bg-brand-black text-white font-bold'
                      : 'text-zinc-600 hover:text-brand-black hover:bg-white'
                  }`}
                >
                  <IconComp size={12} className={isSelected ? 'text-[#0f766e]' : 'text-zinc-400'} />
                  <span>{treatment.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interactive Stage Grid (7 / 5 Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Optical Frame Visualizer Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between border border-brand-black/10 bg-[#f5f5f3] p-6 sm:p-8 relative min-h-[380px] sm:min-h-[440px]">
            {/* Corner Crosshairs */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-black/40" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-black/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-black/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-black/40" />
            
            {/* Stage Header Info */}
            <div className="flex items-center justify-between z-10 mb-4 border-b border-brand-black/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-0.5">
                  CATEGORY // {activeTreatment.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-brand-black font-sans">
                  {activeTreatment.name}
                </h3>
              </div>

              {/* Coated vs Uncoated Switch */}
              <div className="flex items-center gap-1 p-1 bg-white border border-brand-black/10">
                <button
                  onClick={() => setIsCoatedView(false)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    !isCoatedView
                      ? 'bg-brand-black text-white font-bold'
                      : 'text-zinc-500 hover:text-brand-black'
                  }`}
                >
                  Uncoated
                </button>
                <button
                  onClick={() => setIsCoatedView(true)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCoatedView
                      ? 'bg-[#0f766e] text-white font-bold'
                      : 'text-zinc-500 hover:text-brand-black'
                  }`}
                >
                  <Sparkles size={10} className="text-white" />
                  <span>Lab Coated</span>
                </button>
              </div>
            </div>

            {/* Central Eyewear Frame Stage */}
            <div className="relative my-auto py-6 sm:py-8 flex items-center justify-center">
              
              {/* Clean Frame Image */}
              <div className="relative max-w-sm sm:max-w-md w-full aspect-[16/10] flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800&auto=format&fit=crop"
                  alt="Precision Eyewear Frame"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)] transition-all duration-700"
                />

                {/* Optical Coating Visual Filter Effect */}
                <AnimatePresence>
                  {isCoatedView && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`absolute inset-x-8 inset-y-4 rounded-none bg-gradient-to-tr ${activeTreatment.coatingColor} mix-blend-multiply pointer-events-none`}
                      style={{
                        boxShadow: `inset 0 0 30px ${activeTreatment.coatingSheen}`
                      }}
                    >
                      {/* AR Coating Luster Light Glint */}
                      <div className="absolute top-1/4 left-1/4 w-1/3 h-1/4 bg-white/25 blur-md rounded-full -rotate-45 pointer-events-none" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Glare Reflection overlay if Uncoated */}
                {!isCoatedView && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3/4 h-1/2 bg-white/50 blur-xl -rotate-12 mix-blend-screen" />
                  </div>
                )}
              </div>

              {/* Status Indicator Chip */}
              <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-black text-white text-[10px] font-mono tracking-wider">
                  {isCoatedView ? (
                    <>
                      <Check size={11} className="text-[#0f766e]" />
                      <span>NANOCOAT ACTIVE // ZERO SURFACE GLARE</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                      <span>UNCOATED // UNFILTERED AMBIENT DISPERSION</span>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Stage Sub-footer */}
            <div className="pt-4 border-t border-brand-black/10 flex items-center justify-between font-mono text-[10px] text-zinc-500">
              <span className="uppercase tracking-wider">
                TEST STANDARD: ISO 8980-3 OPHTHALMIC
              </span>
              <span className="text-brand-black font-semibold flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#0f766e]" />
                ZERO TOLERANCE ACCREDITATION
              </span>
            </div>

          </div>

          {/* Technical Laboratory Specifications (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Live Surfacing Telemetry Panel */}
            <LaboratoryTelemetry 
              abbeValue={activeTreatment.abbeValue}
              refractiveIndex={activeTreatment.refractiveIndex}
              uvCut={activeTreatment.uvCut}
            />

            {/* Spec Matrix Card */}
            <div className="bg-white border border-brand-black/10 p-6 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-brand-black/10 pb-3">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold">
                    CALIBRATION METRICS
                  </span>
                  <span className="px-2 py-0.5 bg-brand-cream text-brand-black border border-brand-black/10 font-mono text-[9px] uppercase tracking-wider">
                    {activeTreatment.badge}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed mb-6 font-sans">
                  {activeTreatment.description}
                </p>

                {/* Specs Table */}
                <div className="space-y-2 font-mono text-xs">
                  {activeTreatment.specs.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-brand-black/5">
                      <span className="text-zinc-500 text-[11px]">{s.label}</span>
                      <span className="font-semibold text-brand-black bg-brand-cream px-2 py-0.5 border border-brand-black/5 text-[11px]">
                        {s.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recommended Application */}
                <div className="mt-5 p-3.5 bg-brand-cream border border-brand-black/10">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider block mb-1">
                    CLINICAL INDICATION
                  </span>
                  <p className="text-xs text-brand-black font-sans leading-relaxed">
                    {activeTreatment.idealFor}
                  </p>
                </div>
              </div>

              {/* Quality Guarantee Footnote */}
              <div className="pt-4 mt-6 border-t border-brand-black/10 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5 text-brand-black font-bold">
                  <ShieldCheck size={13} className="text-[#0f766e]" /> 1-YEAR LAB WARRANTY
                </span>
                <span>ZEISS COMPLIANT</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
