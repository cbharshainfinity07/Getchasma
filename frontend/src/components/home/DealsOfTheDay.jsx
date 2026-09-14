import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Camera, ShoppingBag, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import VirtualTryOnModal from '../product/VirtualTryOnModal';

const LENS_TINTS = [
  { name: 'Zeiss Emerald Polarized', color: '#10b981' },
  { name: '24K Gold Mirror', color: '#fbbf24' },
  { name: 'Smoked Onyx Gradient', color: '#64748b' },
  { name: 'CyberShield 420nm Blue', color: '#38bdf8' },
];

export default function DealsOfTheDay() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLens, setSelectedLens] = useState({});
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const { addToCart } = useCart();

  // Mechanical countdown clock
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5001/api/products')
      .then(res => res.json())
      .then(data => {
        setDeals(data.slice(0, 3));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching deals:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="bg-[#f8fafc] py-20 md:py-28 border-t border-slate-200/70 text-slate-900 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold uppercase tracking-widest mb-3">
              <Flame size={12} className="text-rose-600 animate-pulse" /> Atelier Vault Allocations &bull; 24H Drop
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-slate-950 tracking-tight">
              Vault Drops of the Day<span className="text-rose-600">.</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-2 max-w-lg font-normal">
              Limited-run allocations forged with aerospace titanium and Zeiss precision glass. Available until vault lock.
            </p>
          </div>

          {/* Mechanical Gold Countdown Clock */}
          <div className="flex items-center gap-4 bg-white border border-rose-200/80 rounded-2xl p-3.5 px-4 shadow-md shadow-rose-500/5">
            <div className="text-right">
              <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-rose-700 font-extrabold block">
                Vault Lock In
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-extrabold text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-sm text-rose-700 font-black shadow-inner">
                {String(timeLeft.hours).padStart(2, '0')}h
              </div>
              <span className="text-rose-400">:</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-sm text-rose-700 font-black shadow-inner">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </div>
              <span className="text-rose-400">:</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-sm text-rose-600 font-black shadow-inner animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {deals.map((deal, idx) => {
            const currentLensIdx = selectedLens[deal.id || idx] ?? 0;
            const currentLens = LENS_TINTS[currentLensIdx];

            return (
              <motion.div 
                key={deal.id || idx}
                variants={cardVariants}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-rose-400/50 shadow-sm hover:shadow-2xl transition-all duration-500 relative flex-1"
              >
                {/* Top Badge & Try-On Quick Action */}
                <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 text-white text-[9px] uppercase tracking-widest font-black pointer-events-auto shadow-sm">
                    <Sparkles size={10} className="text-white" /> Vault &minus;20%
                  </div>

                  <button
                    onClick={() => setTryOnProduct(deal)}
                    className="pointer-events-auto px-3 py-1 rounded-full bg-white/95 hover:bg-blue-600 hover:text-white border border-slate-200 text-[10px] font-bold tracking-wider text-slate-800 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                    title="Launch AR Virtual Try-On"
                  >
                    <Camera size={12} />
                    <span>Virtual Try-On</span>
                  </button>
                </div>

                {/* Product Imagery Showcase */}
                <Link 
                  to={`/product/${deal.id || idx}`}
                  className="w-full aspect-[4/3] bg-gradient-to-b from-[#121622] to-[#0c0f17] flex items-center justify-center relative overflow-hidden p-8 block group-hover:bg-[#151926] transition-colors"
                >
                  <img 
                    src={deal.image} 
                    alt={deal.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  {/* Subtle glass reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                </Link>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-1 bg-white border-t border-slate-100">
                  
                  {/* Category & Optical Spec */}
                  <div className="flex items-center justify-between mb-2 text-[10px] font-mono tracking-wider uppercase text-slate-500">
                    <span>{deal.category || 'Atelier Collection'}</span>
                    <span className="text-neutral-400 font-bold flex items-center gap-1">
                      <ShieldCheck size={11} /> Zeiss Calibrated
                    </span>
                  </div>

                  {/* Title */}
                  <Link to={`/product/${deal.id || idx}`}>
                    <h3 className="font-serif text-xl font-bold text-slate-950 hover:text-rose-600 transition-colors mb-3 line-clamp-1">
                      {deal.name}
                    </h3>
                  </Link>

                  {/* Interactive Optical Lens Tint Selector */}
                  <div className="mb-6 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                      <span className="uppercase tracking-widest text-[9px] text-slate-500 font-bold">Lens Tuning:</span>
                      <span className="text-neutral-300 font-mono text-[10px]">{currentLens.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {LENS_TINTS.map((tint, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => setSelectedLens(prev => ({ ...prev, [deal.id || idx]: tIdx }))}
                          className={`w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                            currentLensIdx === tIdx ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                          }`}
                          title={tint.name}
                        >
                          <span 
                            className="w-4 h-4 rounded-full shadow-inner" 
                            style={{ backgroundColor: tint.color }} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Add to Cart */}
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-mono text-slate-950">₹{deal.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-500 line-through font-mono">₹{(deal.originalPrice || (deal.price + 800)).toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold block mt-0.5">
                        Complimentary Courier Included
                      </span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart({
                          id: deal.id || idx,
                          name: deal.name,
                          price: deal.price,
                          image: deal.image,
                          lensOption: currentLens.name
                        });
                      }}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-black uppercase tracking-[0.14em] shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0 cursor-pointer"
                    >
                      <ShoppingBag size={14} />
                      <span>Acquire</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Atelier Vault Guarantee Banner */}
        <div className="mt-16 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Every Vault Drop Includes Maison Presentation Case</p>
              <p className="text-slate-500 text-xs mt-0.5">Includes handcrafted leather travel vault, Zeiss microfiber polishing cloth, and optical warranty certificate.</p>
            </div>
          </div>
          <Link 
            to="/shop" 
            className="text-rose-600 hover:text-rose-700 font-bold uppercase tracking-widest text-[11px] flex items-center gap-1.5 flex-shrink-0"
          >
            Explore Complete Archive <ArrowRight size={13} />
          </Link>
        </div>

      </div>

      {/* AR Virtual Try-On Modal */}
      {tryOnProduct && (
        <VirtualTryOnModal
          product={tryOnProduct}
          isOpen={Boolean(tryOnProduct)}
          onClose={() => setTryOnProduct(null)}
        />
      )}
    </section>
  );
}
