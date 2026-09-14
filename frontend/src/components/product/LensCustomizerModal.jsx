import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Sun, 
  Eye, 
  Upload, 
  Phone, 
  FileText, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VISION_TYPES = [
  {
    id: 'zero-power',
    title: 'Zero Power / Computer Glasses',
    desc: 'Block digital screen blue-light & reduce eye fatigue. No prescription required.',
    price: 0,
    badge: 'Most Popular'
  },
  {
    id: 'single-vision',
    title: 'Single Vision (Distance or Reading)',
    desc: 'For nearsightedness or reading. Standard single focal field.',
    price: 799,
    badge: 'Prescription'
  },
  {
    id: 'progressive',
    title: 'Bifocal / Progressive (No Lines)',
    desc: 'Seamless multi-focal lenses for both distance and close-up reading.',
    price: 1899,
    badge: 'Advanced Multi-Focus'
  },
  {
    id: 'frame-only',
    title: 'Frame Only (Dummy Clear Lenses)',
    desc: 'Receive frame with demo lenses to fit custom prescription with your local optician.',
    price: 0,
    badge: 'Frame Only'
  }
];

const LENS_PACKAGES = [
  {
    id: 'standard-blucut',
    name: 'Standard BluCut 1.56 Index',
    price: 0,
    features: ['Anti-reflective coating', '100% UV400 shield', 'Digital blue-light filter', 'Standard scratch resistance'],
    recommended: false
  },
  {
    id: 'thin-blucut',
    name: 'Thin Hydrophobic BluCut 1.60 Index',
    price: 899,
    features: ['25% thinner & lighter', 'Oleophobic anti-smudge coating', 'Water & dust repellent', 'High impact resistance'],
    recommended: true
  },
  {
    id: 'feather-aspheric',
    name: 'Ultra-Thin Aspheric 1.67 Index',
    price: 1499,
    features: ['40% thinner flat aspheric profile', 'Eliminates eye magnification distortion', 'Diamond-grade scratch guard', 'For high prescriptions'],
    recommended: false
  },
  {
    id: 'photochromic',
    name: 'Photochromic Sunlight Adaptive',
    price: 1299,
    features: ['Auto-darkens to sunglasses outdoors', 'Crystal clear indoors', '100% UVA/UVB protection', 'Blue block combined'],
    recommended: false
  }
];

export default function LensCustomizerModal({ product, isOpen, onClose, onAddToCart }) {
  const [step, setStep] = useState(1); // 1: Vision Type, 2: Lens Package, 3: Prescription Method
  const [selectedVision, setSelectedVision] = useState(VISION_TYPES[0]);
  const [selectedPackage, setSelectedPackage] = useState(LENS_PACKAGES[1]);
  const [prescriptionMethod, setPrescriptionMethod] = useState('whatsapp'); // 'whatsapp', 'manual', 'upload'
  
  // Manual power fields
  const [manualPower, setManualPower] = useState({
    rightSph: '0.00',
    rightCyl: '0.00',
    rightAxis: '0',
    leftSph: '0.00',
    leftCyl: '0.00',
    leftAxis: '0'
  });

  if (!isOpen) return null;

  const framePrice = product?.price || 120;
  const lensUpgradePrice = selectedVision.price + (selectedVision.id !== 'frame-only' ? selectedPackage.price : 0);
  const totalPrice = framePrice + lensUpgradePrice;

  const handleFinishCustomization = () => {
    const lensDetails = {
      visionType: selectedVision.title,
      lensPackage: selectedVision.id === 'frame-only' ? 'Frame Only' : selectedPackage.name,
      prescriptionMethod: selectedVision.id === 'zero-power' || selectedVision.id === 'frame-only' 
        ? 'Not Applicable' 
        : prescriptionMethod === 'whatsapp' 
        ? 'Send Via WhatsApp (+91 97403 10101)' 
        : prescriptionMethod === 'manual'
        ? `R: ${manualPower.rightSph}/${manualPower.rightCyl}x${manualPower.rightAxis} | L: ${manualPower.leftSph}/${manualPower.leftCyl}x${manualPower.leftAxis}`
        : 'Uploaded Prescription',
      lensUpgradePrice
    };

    onAddToCart({
      id: `${product.id}-custom-${Date.now()}`,
      productId: product.id,
      name: `${product.name} (${selectedVision.title.split(' ')[0]} Lenses)`,
      price: totalPrice,
      image: product.image,
      lensDetails
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto flex flex-col justify-between"
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400">
                  Optical Lens Configurator
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  Step {step} of {selectedVision.id === 'zero-power' || selectedVision.id === 'frame-only' ? '2' : '3'}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-black">
                Select Your Prescription Lenses
              </h3>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          {/* STEP 1: SELECT VISION NEED */}
          {step === 1 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                1. What is your vision requirement?
              </span>

              <div className="grid grid-cols-1 gap-3">
                {VISION_TYPES.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVision(v)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                      selectedVision.id === v.id
                        ? 'border-black bg-gray-50/80 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-black">{v.title}</h4>
                        {v.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.id === 'zero-power' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-800'
                          }`}>
                            {v.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-sm text-black font-mono">
                        {v.price === 0 ? 'Included' : `+₹${v.price}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT LENS PACKAGE */}
          {step === 2 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                2. Choose Your Lens Package &amp; Thinness
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LENS_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedPackage.id === pkg.id
                        ? 'border-black bg-gray-50/80 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs text-black">{pkg.name}</h4>
                        {pkg.recommended && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-bold uppercase">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-sm text-black block mb-3 font-mono">
                        {pkg.price === 0 ? 'Included' : `+₹${pkg.price}`}
                      </span>
                      <ul className="space-y-1 text-[11px] text-gray-600">
                        {pkg.features.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Check size={12} className="text-emerald-600 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SUBMIT PRESCRIPTION (Only for Powered glasses) */}
          {step === 3 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                3. How would you like to provide your prescription?
              </span>

              {/* Method Selection Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setPrescriptionMethod('whatsapp')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                    prescriptionMethod === 'whatsapp' ? 'border-black bg-gray-50 font-bold' : 'border-gray-200'
                  }`}
                >
                  <Phone size={22} className="mx-auto mb-2 text-emerald-600" />
                  <span className="text-xs block font-bold text-black">WhatsApp / Call Later</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Send photo post-checkout</span>
                </div>

                <div
                  onClick={() => setPrescriptionMethod('manual')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                    prescriptionMethod === 'manual' ? 'border-black bg-gray-50 font-bold' : 'border-gray-200'
                  }`}
                >
                  <FileText size={22} className="mx-auto mb-2 text-black" />
                  <span className="text-xs block font-bold text-black">Enter Numbers</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Sph, Cyl, Axis</span>
                </div>

                <div
                  onClick={() => setPrescriptionMethod('upload')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                    prescriptionMethod === 'upload' ? 'border-black bg-gray-50 font-bold' : 'border-gray-200'
                  }`}
                >
                  <Upload size={22} className="mx-auto mb-2 text-indigo-600" />
                  <span className="text-xs block font-bold text-black">Upload Slip</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Photo or PDF</span>
                </div>
              </div>

              {/* Sub-form based on method */}
              {prescriptionMethod === 'whatsapp' && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed">
                  <strong>Zero hassle option:</strong> Proceed with order now. Our certified optometrist team will WhatsApp and call you at your checkout phone number to verify and confirm your prescription!
                </div>
              )}

              {prescriptionMethod === 'manual' && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-3">
                  <div className="grid grid-cols-4 gap-2 font-bold text-[11px] text-gray-500 text-center">
                    <span>Eye</span>
                    <span>Sphere (SPH)</span>
                    <span>Cylinder (CYL)</span>
                    <span>Axis</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <span className="font-bold text-black">Right (OD)</span>
                    <input
                      type="text"
                      placeholder="-1.25"
                      value={manualPower.rightSph}
                      onChange={(e) => setManualPower({ ...manualPower, rightSph: e.target.value })}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-center text-xs"
                    />
                    <input
                      type="text"
                      placeholder="-0.50"
                      value={manualPower.rightCyl}
                      onChange={(e) => setManualPower({ ...manualPower, rightCyl: e.target.value })}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-center text-xs"
                    />
                    <input
                      type="text"
                      placeholder="90"
                      value={manualPower.rightAxis}
                      onChange={(e) => setManualPower({ ...manualPower, rightAxis: e.target.value })}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-center text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <span className="font-bold text-black">Left (OS)</span>
                    <input
                      type="text"
                      placeholder="-1.50"
                      value={manualPower.leftSph}
                      onChange={(e) => setManualPower({ ...manualPower, leftSph: e.target.value })}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-center text-xs"
                    />
                    <input
                      type="text"
                      placeholder="-0.50"
                      value={manualPower.leftCyl}
                      onChange={(e) => setManualPower({ ...manualPower, leftCyl: e.target.value })}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-center text-xs"
                    />
                    <input
                      type="text"
                      placeholder="85"
                      value={manualPower.leftAxis}
                      onChange={(e) => setManualPower({ ...manualPower, leftAxis: e.target.value })}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-center text-xs"
                    />
                  </div>
                </div>
              )}

              {prescriptionMethod === 'upload' && (
                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 text-center text-xs text-gray-500">
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-semibold text-black mb-1">Click to browse or drop doctor prescription slip</p>
                  <p className="text-[11px] text-gray-400">Supports JPG, PNG, PDF up to 10MB</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Price Breakdown and Next / Add Button */}
        <div className="pt-6 border-t border-gray-100 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-400 block">Total Frame + Customized Lenses</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-black font-mono">₹{totalPrice.toLocaleString('en-IN')}</span>
              {lensUpgradePrice > 0 && (
                <span className="text-xs text-emerald-600 font-semibold font-mono">
                  (Includes ₹{lensUpgradePrice.toLocaleString('en-IN')} lens package)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
            )}

            {/* If Zero Power or Frame Only, Step 2 is final. If prescription, Step 3 is final */}
            {(step === 2 && (selectedVision.id === 'zero-power' || selectedVision.id === 'frame-only')) || step === 3 ? (
              <button
                type="button"
                onClick={handleFinishCustomization}
                className="flex-1 sm:flex-initial px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                Add To Bag &bull; ₹{totalPrice.toLocaleString('en-IN')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex-1 sm:flex-initial px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                Continue <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
