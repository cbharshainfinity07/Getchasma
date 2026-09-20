import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, Plus, Minus, ShieldCheck, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";

const SPEC_COLLECTION = [
  {
    id: "gc-01",
    name: "KINETIC GEOMETRIC SQUARE",
    sku: "SKU // GC-7820-T",
    material: "JAPANESE AEROSPACE TITANIUM / GRADE 1",
    dimensions: "51 mm Lens  ·  19 mm Bridge  ·  148 mm Temple",
    image: "/curated/prod-retro-square.jpg",
    rawPrice: 24500,
    price: "₹24,500"
  },
  {
    id: "gc-02",
    name: "AERONAUTICAL POLARIZED AVIATOR",
    sku: "SKU // GC-9940-A",
    material: "AEROSPACE MONEL & HAND-MILLED ACETATE",
    dimensions: "58 mm Lens  ·  16 mm Bridge  ·  145 mm Temple",
    image: "/curated/prod-classic-aviator.jpg",
    rawPrice: 18900,
    price: "₹18,900"
  }
];

const LENS_CONFIGS = [
  { id: "blucut", name: "BluCut 1.56 Standard Essential", cost: 0, tag: "+₹0" },
  { id: "aspheric", name: "Ultra-Thin Aspheric 1.67 (High Prescription)", cost: 3500, tag: "+₹3,500" },
  { id: "zeiss", name: "Zeiss UV400 Mineral Adaptive Photochromic", cost: 6800, tag: "+₹6,800" }
];

export default function ProductAtelierSpec() {
  const [activeItem, setActiveItem] = useState(SPEC_COLLECTION[0]);
  const [lensExpanded, setLensExpanded] = useState(false);
  const [selectedLens, setSelectedLens] = useState(LENS_CONFIGS[0]);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAcquire = () => {
    const totalAmount = (activeItem.rawPrice || 24500) + selectedLens.cost;
    addToCart({
      id: `${activeItem.id}-${selectedLens.id}`,
      name: `${activeItem.name} (${selectedLens.name})`,
      price: totalAmount,
      image: activeItem.image,
      selectedLens: selectedLens.name,
      material: activeItem.material,
      dimensions: activeItem.dimensions,
    }, 1);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  return (
    <section className="w-full min-h-screen bg-brand-offwhite px-6 py-20 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans border-t border-brand-black/5">
      
      {/* COLUMN 1: CINEMATIC VISUAL CANVAS (Asymmetrical 7-cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between group">
        <div className="flex justify-between items-baseline border-b border-brand-black/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-black/60">COLLECTION 2026 // CAPSULE 01</span>
            {/* Quick Capsule Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              {SPEC_COLLECTION.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    activeItem.id === item.id
                      ? "bg-brand-black text-brand-offwhite"
                      : "text-brand-black/40 hover:text-brand-black"
                  }`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-brand-black/60">{activeItem.sku}</span>
        </div>
        
        <div className="my-8 overflow-hidden bg-brand-cream relative aspect-[4/3] flex items-center justify-center border border-brand-black/5">
          <motion.img 
            key={activeItem.id}
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            src={activeItem.image} 
            alt={activeItem.name} 
            className="w-full h-full object-cover grayscale tracking-tight group-hover:grayscale-0 transition-all duration-700 ease-atelier"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-black/10 pt-4 font-mono text-xs text-brand-black/60">
          <div>MATERIAL // {activeItem.material}</div>
          <div className="sm:text-right">CALIBRATION // {activeItem.dimensions}</div>
        </div>
      </div>

      {/* COLUMN 2: ARCHITECTURAL SPEC DETAILS (5-cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between border-l border-brand-black/0 lg:border-l lg:border-brand-black/10 lg:pl-12">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold font-sans tracking-tight text-brand-black mb-2 leading-none">
            {activeItem.name}
          </h1>
          <div className="font-mono text-lg font-medium text-brand-accent mt-4">
            {activeItem.price} <span className="text-xs text-brand-black/40 font-sans tracking-normal font-normal">incl. of all taxes</span>
          </div>

          <p className="mt-8 text-brand-black/70 text-sm leading-relaxed max-w-md">
            Sculpted with sharp, industrial facets from pure aerospace-grade titanium blanks. Engineered with bespoke raw acetate inner rim accents, micro-machined functional hex hinges, and signature weighted temple tips for absolute structural equilibrium.
          </p>

          {/* PROGRESSIVE DISCLOSURE VIA PHYSICS LAYOUT */}
          <div className="mt-12 border-t border-b border-brand-black/10 py-2">
            <button 
              onClick={() => setLensExpanded(!lensExpanded)}
              className="w-full flex justify-between items-center py-4 text-left font-mono text-xs uppercase tracking-wider font-semibold text-brand-black cursor-pointer"
            >
              <span>[ + ] CONFIG CUSTOM LABORATORY LENSES</span>
              <motion.div animate={{ rotate: lensExpanded ? 180 : 0 }} transition={{ ease: "easeOut" }}>
                {lensExpanded ? <Minus size={14} /> : <Plus size={14} />}
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {lensExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden font-sans text-xs text-brand-black/80 space-y-4 pb-4"
                >
                  <div className="p-4 bg-brand-cream border border-brand-black/5 space-y-3">
                    {LENS_CONFIGS.map((config) => {
                      const isSelected = selectedLens.id === config.id;
                      return (
                        <label 
                          key={config.id}
                          onClick={() => setSelectedLens(config)}
                          className="flex items-center justify-between cursor-pointer py-1.5 transition-colors hover:text-brand-accent"
                        >
                          <span className={`font-medium flex items-center gap-2 ${isSelected ? "text-brand-black font-bold" : "text-brand-black/70"}`}>
                            <span className={`w-3 h-3 rounded-full border border-brand-black/40 flex items-center justify-center ${isSelected ? "bg-brand-accent border-brand-accent" : ""}`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                            </span>
                            {config.name}
                          </span>
                          <span className="font-mono text-brand-accent font-semibold">{config.tag}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-brand-black/50 font-mono">
                    <ShieldCheck size={12} className="text-brand-accent flex-shrink-0" /> CERTIFIED ZEISS ACCREDITED OPTICAL DISPENSARY
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* HIGH-END CALL TO ACTION */}
        <div className="mt-12 lg:mt-0">
          <button 
            onClick={handleAcquire}
            className="w-full group bg-brand-black hover:bg-brand-accent text-brand-offwhite font-mono text-xs uppercase tracking-widest py-5 flex items-center justify-center gap-3 transition-colors duration-500 ease-atelier rounded-none cursor-pointer active:scale-[0.99]"
          >
            {isAdded ? (
              <>
                <Check size={14} className="text-white" />
                FRAME ACQUIRED // ADDED TO ATELIER BAG
              </>
            ) : (
              <>
                ACQUIRE FRAME
                <MoveRight size={14} className="group-hover:translate-x-2 transition-transform duration-500 ease-atelier" />
              </>
            )}
          </button>
          
          <div className="mt-4 text-center">
            <span className="font-mono text-[10px] text-brand-black/40 tracking-wider">
              OR COMPLIMENTARY ACCESS WITH CHASMA GOLD PRIVILEGE PASS
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
