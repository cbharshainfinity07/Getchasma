import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Camera, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL } from '../../config/api';
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
    fetch(`${API_BASE_URL}/api/products`)
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
    <section className="bg-[#f8fafc] py-12 sm:py-20 md:py-28 border-t border-slate-200/70 text-slate-900 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-slate-300/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold uppercase tracking-widest mb-2.5">
              Atelier Vault Allocations &bull; 24H Drop
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight">
              Vault Drops of the Day<span className="text-neutral-400">.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-lg font-normal">
              Limited-run allocations forged with aerospace titanium and Zeiss precision glass. Available until vault lock.
            </p>
          </div>

          {/* Minimalist Countdown Clock */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-2.5 px-3.5 shadow-sm">
            <div className="text-right">
              <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-slate-500 block">
                Vault Lock
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-xs sm:text-sm">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold">
                {String(timeLeft.hours).padStart(2, '0')}h
              </div>
              <span className="text-slate-400">:</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </div>
              <span className="text-slate-400">:</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900">
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
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8"
        >
          {deals.map((deal, idx) => {
            const currentLensIdx = selectedLens[deal.id || idx] ?? 0;
            const currentLens = LENS_TINTS[currentLensIdx];

            return (
              <motion.div 
                key={deal.id || idx}
                variants={cardVariants}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-slate-400 shadow-sm hover:shadow-xl transition-all duration-500 relative flex-1"
              >
                {/* Top Badge & Try-On Quick Action */}
                <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 text-white text-[9px] uppercase tracking-widest font-bold pointer-events-auto shadow-sm">
                    20% OFF
                  </div>

                  <button
                    onClick={() => setTryOnProduct(deal)}
                    className="pointer-events-auto px-2.5 py-1 rounded-full bg-white/95 hover:bg-slate-950 hover:text-white border border-slate-200 text-[10px] font-bold tracking-wider text-slate-700 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Launch AR Virtual Try-On"
                  >
                    <Camera size={11} />
                    <span>Try-On</span>
                  </button>
                </div>

                {/* Product Imagery Showcase */}
                <Link 
                  to={`/product/${deal.id || idx}`}
                  className="w-full aspect-[16/10] sm:aspect-[4/3] bg-[#11141c] flex items-center justify-center relative overflow-hidden p-5 sm:p-8 block group-hover:bg-[#161a24] transition-colors"
                >
                  <img 
                    src={deal.image} 
                    alt={deal.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle glass reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                </Link>

                {/* Card Body */}
                <div className="p-4 sm:p-6 flex flex-col flex-1 bg-white border-t border-slate-100">
                  
                  {/* Category & Optical Spec */}
                  <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono tracking-wider uppercase text-slate-500">
                    <span>{deal.category || 'Atelier Collection'}</span>
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <ShieldCheck size={11} /> Zeiss Optic
                    </span>
                  </div>

                  {/* Title */}
                  <Link to={`/product/${deal.id || idx}`}>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-950 hover:text-blue-600 transition-colors mb-2.5 line-clamp-1">
                      {deal.name}
                    </h3>
                  </Link>

                  {/* Interactive Optical Lens Tint Selector */}
                  <div className="mb-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                      <span className="uppercase tracking-widest text-[9px] text-slate-400 font-bold">Lens Tint:</span>
                      <span className="text-slate-700 font-mono text-[10px]">{currentLens.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {LENS_TINTS.map((tint, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => setSelectedLens(prev => ({ ...prev, [deal.id || idx]: tIdx }))}
                          className={`w-5 h-5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                            currentLensIdx === tIdx ? 'ring-2 ring-slate-950 scale-110' : 'opacity-60 hover:opacity-100'
                          }`}
                          title={tint.name}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full shadow-inner" 
                            style={{ backgroundColor: tint.color }} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Add to Cart */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg sm:text-xl font-black font-mono text-slate-950">₹{deal.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-400 line-through font-mono">₹{(deal.originalPrice || (deal.price + 800)).toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold block mt-0.5">
                        Free Express Courier
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
                      className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
                    >
                      <ShoppingBag size={13} />
                      <span>Bag</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Atelier Vault Guarantee Banner */}
        <div className="mt-10 sm:mt-16 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 flex-shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-950 text-xs sm:text-sm">Every Vault Allocation Includes Maison Presentation Case</p>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">Handcrafted leather vault case, Zeiss microfiber polishing cloth, and optical certificate.</p>
            </div>
          </div>
          <Link 
            to="/shop" 
            className="text-slate-950 hover:text-blue-600 font-bold uppercase tracking-widest text-[10px] sm:text-[11px] flex items-center gap-1.5 flex-shrink-0"
          >
            Explore Complete Archive &rarr;
          </Link>
        </div>

      </div>

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
