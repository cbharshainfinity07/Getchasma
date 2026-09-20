import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, Layers, Sparkles } from "lucide-react";
import { useCart } from "../../context/CartContext";

const SIMULATOR_PROFILES = {
  standard: {
    name: "Standard Monomer (1.50)",
    index: "1.50",
    abbe: "58",
    uvProtection: "UV380",
    edgeThickness: "4.8 mm",
    distortionLevel: 12,
    blurRadius: 5,
  },
  polycarbonate: {
    name: "High-Impact Poly (1.60)",
    index: "1.60",
    abbe: "42",
    uvProtection: "UV400",
    edgeThickness: "3.6 mm",
    distortionLevel: 7,
    blurRadius: 3,
  },
  aspheric: {
    name: "Precision Aspheric (1.67)",
    index: "1.67",
    abbe: "32",
    uvProtection: "UV400 PureCut",
    edgeThickness: "2.8 mm",
    distortionLevel: 3,
    blurRadius: 1,
  },
  ultraHigh: {
    name: "Diamond-Turned Ultra (1.74)",
    index: "1.74",
    abbe: "33",
    uvProtection: "UV420 DualGuard",
    edgeThickness: "2.1 mm",
    distortionLevel: 0,
    blurRadius: 0,
  },
};

export const LensLabStudio = ({ product, onClose, onComplete }) => {
  const [activeProfileKey, setActiveProfileKey] = useState("aspheric");
  const [simulatedPower, setSimulatedPower] = useState("-4.50");
  const [coatingActive, setCoatingActive] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const profile = SIMULATOR_PROFILES[activeProfileKey];

  const handleAcquire = () => {
    const lensTierPrice =
      profile.index === "1.50" ? 0 : profile.index === "1.60" ? 1800 : profile.index === "1.67" ? 3400 : 5800;
    const coatingPrice = coatingActive ? 1200 : 0;
    const basePrice = product?.price ? Number(product.price) : 2499;
    const computedFinalPrice = basePrice + lensTierPrice + coatingPrice;

    const calibratedItem = {
      id: product ? `${product.id}-lab-${activeProfileKey}-${Date.now()}` : `lab-${activeProfileKey}-${Date.now()}`,
      sku: product?.sku || `FT-${product?.id || "CAL"}-721-LAB`,
      name: product ? `${product.name} [${profile.name}]` : `Atelier Custom Frame [${profile.name}]`,
      price: computedFinalPrice,
      finalPrice: computedFinalPrice,
      image: product?.image || "/curated/summer-glasses.jpg",
      lensConfig: {
        prescriptionType: `Single Vision (${simulatedPower} D)`,
        lensTier: { title: profile.name, spec: `Refractive Index ${profile.index} · Abbe ${profile.abbe}` },
        hydrophobicCoating: coatingActive,
        finalPrice: computedFinalPrice,
      },
    };

    if (onComplete) {
      onComplete(calibratedItem);
    } else {
      addToCart(calibratedItem, 1);
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="border-b border-brand-black/10 pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#0f766e] flex items-center gap-1.5 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e] animate-pulse" />
            <Sparkles className="w-3 h-3 text-[#0f766e]" />
            VIRTUAL OPTICAL RETICLE // SPEC-SURFACING
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-brand-black">
            Laboratory Aberration &amp; Thickness Visualizer
          </h2>
          {product && (
            <p className="font-mono text-xs text-zinc-500 mt-1">
              TARGET EYEWEAR: <span className="text-brand-black font-semibold uppercase">{product.name}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-[11px] text-zinc-500">
            POWER CALIBRATION: <span className="text-brand-black font-semibold">{simulatedPower} D</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1 border border-brand-black/20 hover:border-brand-black text-brand-black text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              ✕ Close Studio
            </button>
          )}
        </div>
      </div>

      {/* 7:5 Atelier Laboratory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visualizer Lens Chamber: 7 Columns */}
        <div className="lg:col-span-7 bg-[#09090b] border border-brand-black p-6 relative overflow-hidden text-white">
          {/* Grid Calibration Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg width="100%" height="100%">
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#fff" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#fff" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="50%" cy="50%" r="80" stroke="#fff" strokeWidth="1" fill="none" />
              <circle cx="50%" cy="50%" r="160" stroke="#fff" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Optical Target Chamber */}
          <div className="relative aspect-[4/3] w-full flex items-center justify-center p-8">
            {/* The Lens Element */}
            <motion.div
              layout
              transition={{ duration: 0.4 }}
              className="relative w-64 h-64 rounded-full border border-white/30 flex items-center justify-center overflow-hidden"
              style={{
                boxShadow: coatingActive ? "0 0 35px rgba(15, 118, 110, 0.25)" : "none",
                backdropFilter: `blur(${profile.blurRadius}px)`,
              }}
            >
              {/* Refraction Target Card */}
              <div
                className="text-center font-mono select-none transition-all duration-300"
                style={{
                  filter: `blur(${profile.blurRadius}px)`,
                  transform: `scale(${1 - profile.distortionLevel * 0.015})`,
                }}
              >
                <span className="block text-2xl font-bold tracking-tight text-white mb-1">
                  E D F C Z P
                </span>
                <span className="block text-xs text-zinc-400 tracking-widest">
                  100% SNELLEN 20/20 RETICLE
                </span>
                <span className="block text-[9px] text-[#0f766e] mt-2 uppercase tracking-wider">
                  {coatingActive ? "AR GLAZE: 99.4% LUMEN TRANSMISSION" : "RAW SPEC: SURFACE REFLECTION ACTIVE"}
                </span>
              </div>

              {/* Edge Glare Ring for Lower Indices */}
              {profile.distortionLevel > 5 && (
                <div className="absolute inset-0 rounded-full border-4 border-white/20 pointer-events-none" />
              )}
            </motion.div>

            {/* Live Telemetry Overlay */}
            <div className="absolute top-4 left-4 font-mono text-[9px] text-zinc-400 space-y-1">
              <div>ABBE: {profile.abbe}</div>
              <div>INDEX: {profile.index}</div>
              <div className="text-[#0f766e]">{profile.uvProtection}</div>
            </div>

            <div className="absolute bottom-4 right-4 font-mono text-[9px] text-zinc-400 text-right">
              <div>EDGE GAUGE:</div>
              <div className="text-white font-semibold text-xs">{profile.edgeThickness}</div>
            </div>
          </div>
        </div>

        {/* Index Selector Matrix: 5 Columns */}
        <div className="lg:col-span-5 space-y-4">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#0f766e]" />
            01 // Select Monomer Surfacing Grade
          </span>

          <div className="space-y-2.5">
            {Object.entries(SIMULATOR_PROFILES).map(([key, item]) => {
              const isSelected = activeProfileKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveProfileKey(key)}
                  className={`w-full text-left p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? "border-brand-black bg-white ring-1 ring-brand-black"
                      : "border-brand-black/10 bg-[#fbfbfa] hover:border-brand-black/30"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-sans font-semibold text-xs text-brand-black">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-[#0f766e]">
                      Index {item.index}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-zinc-500 mt-2 pt-2 border-t border-brand-black/5">
                    <div>Abbe: <span className="text-brand-black">{item.abbe}</span></div>
                    <div>Edge: <span className="text-brand-black">{item.edgeThickness}</span></div>
                    <div>Prism: <span className="text-brand-black">0.{item.distortionLevel}Δ</span></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Glaze & Diopter Calibration */}
          <div className="border border-brand-black/10 p-4 bg-white space-y-4 mt-4">
            <div>
              <div className="flex justify-between items-center mb-2 font-mono text-[10px] uppercase text-zinc-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-[#0f766e]" />
                  Diopter Simulation (-8.00 to +4.00)
                </span>
                <span className="text-brand-black font-semibold">{simulatedPower} D</span>
              </div>
              <input
                type="range"
                min="-8.00"
                max="4.00"
                step="0.25"
                value={simulatedPower}
                onChange={(e) => setSimulatedPower(parseFloat(e.target.value).toFixed(2))}
                className="w-full h-1 bg-zinc-200 accent-black appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-brand-black/10">
              <span className="font-sans text-xs text-brand-black flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0f766e]" />
                Zeiss Anti-Reflective Glaze
              </span>
              <button
                onClick={() => setCoatingActive(!coatingActive)}
                className={`font-mono text-[10px] uppercase px-3 py-1 border transition-colors cursor-pointer ${
                  coatingActive
                    ? "bg-brand-black text-white border-brand-black"
                    : "bg-white text-zinc-500 border-brand-black/20"
                }`}
              >
                {coatingActive ? "Coating Applied" : "Uncoated"}
              </button>
            </div>
          </div>

          {/* Acquire Calibrated Option */}
          <button
            onClick={handleAcquire}
            className="w-full py-3.5 bg-brand-black text-white font-mono text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
          >
            {isAdded ? "Optics Calibrated & In Bag ✓" : "Acquire Calibrated Optics"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LensLabStudio;
