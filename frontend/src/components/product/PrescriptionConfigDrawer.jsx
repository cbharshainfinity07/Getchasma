import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

const LENS_TIERS = [
  {
    id: "1.56",
    title: "1.56 Classic BluCut",
    spec: "Refractive Index 1.56 · Abbe 38",
    detail: "Ideal for low corrections (-2.00 to +2.00). Built-in blue-light filter.",
    price: 0,
  },
  {
    id: "1.60",
    title: "1.60 High-Index Polycarbonate",
    spec: "Refractive Index 1.60 · Abbe 42",
    detail: "High impact resistance. Recommended for semi-rimless and active wear.",
    price: 1800,
  },
  {
    id: "1.67",
    title: "1.67 Aspheric Precision",
    spec: "Refractive Index 1.67 · Abbe 32",
    detail: "35% thinner than standard. Minimizes eye magnification for stronger scripts.",
    price: 3400,
  },
  {
    id: "1.74",
    title: "1.74 Ultra-Thin Lab Surfaced",
    spec: "Refractive Index 1.74 · Abbe 33",
    detail: "Maximum edge thinness. Diamond-turned Japanese monomer.",
    price: 5800,
  },
];

export const PrescriptionConfigDrawer = ({ isOpen, onClose, onApplyConfig, basePrice = 24500 }) => {
  const [selectedTier, setSelectedTier] = useState(LENS_TIERS[0]);
  const [prescriptionType, setPrescriptionType] = useState("Single Vision");
  const [hydrophobicCoating, setHydrophobicCoating] = useState(true);

  const finalPrice = basePrice + selectedTier.price + (hydrophobicCoating ? 1200 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
          />

          {/* Side Drawer */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white border-l border-brand-black/10 flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-brand-black/10 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                    DISPENSARY CONFIGURATION
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-brand-black">Select Optical Grade</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 border border-brand-black/10 hover:border-brand-black transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-brand-black" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Prescription Type */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">
                    01 // Prescription Use
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Single Vision", "Zero Power / BlueCut", "Progressive / Bifocal", "Frame Only"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setPrescriptionType(type)}
                        className={`p-3 text-left border font-sans text-xs transition-colors cursor-pointer ${
                          prescriptionType === type
                            ? "border-brand-black bg-brand-black text-white font-medium"
                            : "border-brand-black/10 bg-[#f9fafb] text-brand-black hover:border-brand-black/30"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Index / Surfacing Tiers */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">
                    02 // Surfacing Index & Thinness
                  </label>
                  <div className="space-y-2">
                    {LENS_TIERS.map((tier) => {
                      const isSelected = selectedTier.id === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setSelectedTier(tier)}
                          className={`p-3.5 border cursor-pointer transition-all ${
                            isSelected
                              ? "border-brand-black bg-[#fcfcfb] ring-1 ring-brand-black"
                              : "border-brand-black/10 hover:border-brand-black/30"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-xs text-brand-black">{tier.title}</span>
                            <span className="font-mono text-xs text-brand-black">
                              {tier.price === 0 ? "Included" : `+₹${tier.price.toLocaleString("en-IN")}`}
                            </span>
                          </div>
                          <span className="block font-mono text-[10px] text-[#0f766e] mb-1">{tier.spec}</span>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">{tier.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tactical Add-on */}
                <div className="pt-2 border-t border-brand-black/10">
                  <div
                    onClick={() => setHydrophobicCoating(!hydrophobicCoating)}
                    className="flex items-center justify-between p-3 border border-brand-black/10 bg-[#f9fafb] cursor-pointer select-none"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-brand-black">Hydrophobic Oleophobic Glaze</span>
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#0f766e]/10 text-[#0f766e]">
                          LAB SPEC
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">Repels oils, fingerprints &amp; water beading</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-brand-black">+₹1,200</span>
                      <div
                        className={`w-4 h-4 border flex items-center justify-center ${
                          hydrophobicCoating ? "border-brand-black bg-brand-black" : "border-brand-black/20 bg-white"
                        }`}
                      >
                        {hydrophobicCoating && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Footer */}
              <div className="p-6 border-t border-brand-black/10 bg-white">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Configured Total</span>
                  <span className="font-mono text-xl font-bold text-brand-black">
                    ₹{finalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onApplyConfig({ prescriptionType, lensTier: selectedTier, hydrophobicCoating, finalPrice });
                    onClose();
                  }}
                  className="w-full py-3.5 bg-brand-black text-white font-mono text-xs uppercase tracking-widest hover:bg-black active:scale-[0.99] transition-transform cursor-pointer"
                >
                  Lock In Calibration
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PrescriptionConfigDrawer;
