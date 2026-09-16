import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SpecialProduct() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="bg-white py-16 sm:py-24 md:py-32 border-t border-neutral-200/70 text-neutral-900 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-neutral-100 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 lg:gap-14 bg-white rounded-3xl md:rounded-[2.5rem] p-5 sm:p-8 md:p-12 border border-slate-200 shadow-xl relative overflow-hidden">
          
          {/* Subtle line accent */}
          <div className="absolute top-0 right-0 w-1/2 h-[2px] bg-gradient-to-l from-slate-400 to-transparent" />

          {/* Left: Text Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="flex-1 md:pr-4 relative z-10 flex flex-col items-start w-full"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold tracking-widest uppercase mb-3">
              Maison Haute Optique &bull; Limited Run
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-slate-950 leading-tight mb-3 tracking-tight">
              The Aurelia Aviator<span className="text-neutral-400">.</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed mb-5 max-w-md">
              Hand-forged from Japanese Grade-1 titanium with polarized Zeiss mineral crystal lenses. The Aurelia unites mid-century aeronautical heritage with featherweight modern comfort.
            </motion.p>

            {/* Atelier Highlights */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-6 w-full max-w-sm text-xs">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Frame Material</span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">Japanese Titanium</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Mass</span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">19g Featherweight</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full sm:w-auto">
              <Link to="/product/8" className="block w-full sm:w-auto">
                <button className="w-full sm:w-auto px-7 sm:px-8 py-3.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer">
                  <span>Acquire Aurelia &bull; ₹4,999</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Showcase Viewport */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full relative z-10"
          >
            <Link to="/product/8" className="block aspect-square max-w-xs sm:max-w-md mx-auto md:max-w-none w-full rounded-2xl sm:rounded-[2rem] overflow-hidden relative flex items-center justify-center bg-slate-50 shadow-sm border border-slate-200 p-5 sm:p-8 group">
              <img 
                src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800" 
                alt="Aurelia Signature Aviator" 
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 filter drop-shadow-[0_10px_20px_rgba(15,23,42,0.12)]"
              />
              <span className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-semibold border border-slate-200 shadow-sm group-hover:bg-slate-950 group-hover:text-white transition-all">
                Studio View &rarr;
              </span>
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
