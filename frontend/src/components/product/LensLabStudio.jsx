import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Shield, Activity, Layers, ArrowRight, CornerDownRight, Check, X } from "lucide-react";
import { useCart } from "../../context/CartContext";

const LENS_LAB_VARIANTS = [
  {
    id: "v156",
    index: "01",
    name: "BLUCUT 1.56 STANDARD ESSENTIAL",
    sku: "LAB-SKU // BC-156-CR",
    description: "Precision-cast organic monomer optimized for digital display shielding and lighter corrections.",
    priceDelta: 0,
    specs: { index: "1.56 Aspheric", abbe: "38 Value", uv: "400nm Block" }
  },
  {
    id: "v160",
    index: "02",
    name: "THIN HYDROPHOBIC 1.60 MILITARY-GRADE",
    sku: "LAB-SKU // HY-160-TI",
    description: "Ultra-tough polycarbonate core with premium anti-smudge Oleophobic coatings. 20% thinner than standard.",
    priceDelta: 2200,
    specs: { index: "1.61 MR-8", abbe: "41 Value", uv: "420nm Block" }
  },
  {
    id: "v167",
    index: "03",
    name: "ULTRA-THIN ASPHERIC 1.67 HIGH-INDEX",
    sku: "LAB-SKU // AS-167-PT",
    description: "Engineered specifically for high prescription fields. Suppresses peripheral distortion flawlessly.",
    priceDelta: 4500,
    specs: { index: "1.67 High-Index", abbe: "32 Value", uv: "400nm Block" }
  }
];

export default function LensLabStudio({ product, onClose, onComplete }) {
  const [selectedLens, setSelectedLens] = useState(LENS_LAB_VARIANTS[0]);
  const [coatingSelected, setCoatingSelected] = useState(true);
  const [isCommitted, setIsCommitted] = useState(false);
  const { addToCart } = useCart();

  const coatingFee = coatingSelected ? 1200 : 0;
  const basePrice = product?.price ? Number(product.price) : 24500;
  const totalPrice = basePrice + selectedLens.priceDelta + coatingFee;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCommit = () => {
    const customizedItem = {
      id: product ? `${product.id}-lab-${selectedLens.id}` : `lab-${selectedLens.id}-${Date.now()}`,
      name: product
        ? `${product.name} [${selectedLens.name}]`
        : `Atelier Custom Frame [${selectedLens.name}]`,
      price: totalPrice,
      image: product?.image || "/curated/summer-glasses.jpg",
      selectedLens: selectedLens.name,
      refractiveIndex: selectedLens.specs.index,
      abbeDispersion: selectedLens.specs.abbe,
      uvAttenuance: selectedLens.specs.uv,
      hydrophobicCoating: coatingSelected,
      isCustomLabCalibrated: true
    };

    if (onComplete) {
      onComplete(customizedItem);
    } else {
      addToCart(customizedItem, 1);
    }

    setIsCommitted(true);
    setTimeout(() => {
      setIsCommitted(false);
      if (onClose) onClose();
    }, 1800);
  };

  return (
    <div className="w-full min-h-screen bg-[#fcfcfb] text-zinc-950 font-sans antialiased selection:bg-teal-800 selection:text-white">
      
      {/* ATELIER TOP UTILITY BAR */}
      <header className="w-full border-b border-zinc-900/10 px-6 py-4 lg:px-12 flex justify-between items-center font-mono text-[11px] tracking-widest text-zinc-500">
        <div className="flex items-center gap-4">
          <span>ATELIER CALIBRATION MODULE v4.3.3</span>
          {product && (
            <span className="hidden sm:inline text-zinc-900 font-bold">
              // TARGET: {product.name.toUpperCase()}
            </span>
          )}
        </div>
        <div className="hidden md:block">CHASMA LABS // TOKYO - MILAN - BENGALURU</div>
        <div className="flex items-center gap-4">
          <div className="text-zinc-900 font-bold uppercase">STATUS: ACTIVE LAB PROFILE</div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:text-zinc-950 transition-colors cursor-pointer text-zinc-400"
              title="Close Calibration"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* SPLIT EXPERIENTIAL GRID */}
      <main className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-53px)]">
        
        {/* LEFT COLUMN: HERO ARCHITECTURAL VISUAL (7 Cols) */}
        <section className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-zinc-900/10 p-6 lg:p-12 flex flex-col justify-between bg-[#f5f5f3]">
          <div className="flex justify-between items-start font-mono text-xs text-zinc-400">
            <div>[ VISUAL RECONSTRUCTION ]</div>
            <div className="text-right">{selectedLens.sku}</div>
          </div>

          {/* Dynamic Render Showcase Area */}
          <div className="my-12 relative w-full aspect-[16/10] bg-white border border-zinc-900/5 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-radial from-transparent to-zinc-900/5 opacity-40 pointer-events-none" />
            
            {/* Structural Technical Grid lines overlaid */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-[0.03] pointer-events-none font-mono text-[9px] text-zinc-900 p-2">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="border-t border-l border-zinc-950 p-1">+{i * 10}</div>
              ))}
            </div>

            <motion.div 
              key={selectedLens.id}
              initial={{ scale: 0.96, opacity: 0, filter: "blur(4px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center p-8 space-y-4 z-10"
            >
              <span className="font-mono text-[10px] bg-zinc-900 text-white px-2 py-0.5 tracking-widest uppercase">
                {selectedLens.specs.index} SPEC
              </span>
              <h3 className="text-2xl font-bold tracking-tighter text-zinc-900 max-w-md mx-auto leading-none">
                {selectedLens.name}
              </h3>
              <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
                SURFACED MICRON TOLERANCE // ZERO SPHERICAL ABERRATION
              </p>
            </motion.div>
          </div>

          {/* Precision Metrics Banner */}
          <div className="grid grid-cols-3 gap-4 border-t border-zinc-900/10 pt-6">
            <div className="space-y-1">
              <span className="block font-mono text-[10px] text-zinc-400 tracking-wider">REFRACTIVE INDEX</span>
              <span className="font-mono text-sm font-semibold text-zinc-800">{selectedLens.specs.index}</span>
            </div>
            <div className="space-y-1 border-x border-zinc-900/10 px-4">
              <span className="block font-mono text-[10px] text-zinc-400 tracking-wider">ABBE DISPERSION</span>
              <span className="font-mono text-sm font-semibold text-zinc-800">{selectedLens.specs.abbe}</span>
            </div>
            <div className="space-y-1 text-right">
              <span className="block font-mono text-[10px] text-zinc-400 tracking-wider">UV ATTENUANCE</span>
              <span className="font-mono text-sm font-semibold text-zinc-800">{selectedLens.specs.uv}</span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: INDUSTRIAL SELECTION MATRIX (5 Cols) */}
        <section className="lg:col-span-5 p-6 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="space-y-2">
              <span className="font-mono text-xs text-teal-800 tracking-widest block font-semibold">// CRITERIA SELECTION</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 leading-none">LENS CONFIGURATION MATRIX</h2>
              <p className="text-zinc-500 text-sm pt-2 leading-relaxed">
                Choose the architectural foundation of your optics. All custom laboratory prescriptions are surfaced digitally under micron-level robotic calibration tolerances.
              </p>
            </div>

            {/* HIGH-FIDELITY INTERACTIVE ROW SELECTORS */}
            <div className="mt-10 space-y-3">
              {LENS_LAB_VARIANTS.map((lens) => {
                const isSelected = selectedLens.id === lens.id;
                return (
                  <button
                    key={lens.id}
                    onClick={() => setSelectedLens(lens)}
                    className={`w-full text-left p-5 transition-all duration-500 ease-[0.16,1,0.3,1] border relative flex flex-col justify-between rounded-none cursor-pointer ${
                      isSelected 
                        ? "border-zinc-950 bg-[#fcfcfb] ring-1 ring-zinc-950" 
                        : "border-zinc-900/10 bg-transparent hover:border-zinc-900/30"
                    }`}
                  >
                    <div className="flex justify-between items-baseline w-full">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-zinc-400">[{lens.index}]</span>
                        <span className="font-bold tracking-tight text-sm text-zinc-900">{lens.name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-teal-800">
                        {lens.priceDelta === 0 ? "BASE SPEC" : `+ ${formatCurrency(lens.priceDelta)}`}
                      </span>
                    </div>

                    {/* Progressive disclosure of content only on active choice */}
                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="text-zinc-500 text-xs leading-relaxed max-w-sm border-t border-zinc-900/5 pt-2">
                            {lens.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>

            {/* ADALON PREX COATING TOGGLE (ADDITIONAL TECHNICAL PARAMETER) */}
            <div className="mt-8 pt-6 border-t border-zinc-900/10">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-zinc-400 font-bold uppercase">
                    <Layers size={12} className="text-zinc-900" /> LAB INTEGRATED COATING
                  </div>
                  <h4 className="text-xs font-bold text-zinc-800">Sartorial Anti-Reflective Hydrophobic Glaze</h4>
                  <span className="font-mono text-[10px] text-teal-800 font-bold block">+ ₹1,200 (INCLUDED)</span>
                </div>
                
                <button 
                  onClick={() => setCoatingSelected(!coatingSelected)}
                  className={`w-12 h-6 flex items-center p-0.5 transition-colors duration-300 rounded-none border cursor-pointer ${
                    coatingSelected ? "bg-zinc-950 border-zinc-950 justify-end" : "bg-zinc-100 border-zinc-900/20 justify-start"
                  }`}
                >
                  <motion.div layout className="w-4 h-4 bg-white border border-zinc-900/10" />
                </button>
              </div>
            </div>

          </div>

          {/* FIXED BOTTOM LAB ACTIONS */}
          <div className="mt-12 pt-6 border-t border-zinc-900/10 space-y-4">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-xs uppercase tracking-wider text-zinc-400">TOTAL CALIBRATION VALUE</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-zinc-900">
                  {formatCurrency(totalPrice)}
                </span>
                <span className="block text-[10px] text-zinc-400 font-mono">
                  (INCL. OF ALL TAXES &amp; CERTIFICATION)
                </span>
              </div>
            </div>

            <button
              onClick={handleCommit}
              className="w-full bg-zinc-950 hover:bg-teal-800 text-white font-mono text-xs uppercase tracking-widest py-4 px-6 flex items-center justify-between transition-colors duration-500 ease-[0.16,1,0.3,1] rounded-none group cursor-pointer active:scale-[0.99]"
            >
              <span>{isCommitted ? "CALIBRATION COMMITTED // ADDED TO BAG" : "COMMIT CALIBRATION TO ATELIER BAG"}</span>
              {isCommitted ? (
                <Check size={14} className="text-white" />
              ) : (
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              )}
            </button>

            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 tracking-wider pt-2">
              <span className="flex items-center gap-1.5">
                <Shield size={11} className="text-teal-800" /> ISO 8980-3 COMPLIANT // ZEISS LAB
              </span>
              <span>ZERO TOLERANCE ROBOTIC SURFACING</span>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
