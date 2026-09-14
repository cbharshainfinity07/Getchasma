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
    <div className="bg-gradient-to-b from-white via-indigo-50/25 to-white py-16 sm:py-24 md:py-32 border-t border-slate-200/70 text-slate-900 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-200/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16 bg-white rounded-3xl md:rounded-[2.5rem] p-6 sm:p-10 md:p-14 border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          
          {/* Subtle line accent */}
          <div className="absolute top-0 right-0 w-1/2 h-[2px] bg-gradient-to-l from-blue-500 to-transparent" />

          {/* Left: Text Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="flex-1 md:pr-4 relative z-10 flex flex-col items-start"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold tracking-[0.25em] uppercase mb-4 shadow-sm">
              <Sparkles size={12} className="text-blue-600" /> Maison Haute Optique &bull; Limited Run
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-5xl font-bold text-slate-950 leading-tight mb-4 tracking-tight">
              The Aurelia Aviator<span className="text-blue-600">.</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              Hand-forged from Japanese Grade-1 titanium with polarized Zeiss mineral crystal lenses. The Aurelia unites mid-century aeronautical heritage with featherweight modern comfort.
            </motion.p>

            {/* Atelier Highlights */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Frame Material</span>
                <span className="font-bold text-slate-900">Pure Japanese Titanium</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Mass</span>
                <span className="font-bold text-slate-900">19g Featherweight</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full sm:w-auto">
              <Link to="/product/8" className="block w-full sm:w-auto">
                <button className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-xs font-extrabold uppercase tracking-[0.18em] rounded-full transition-all shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 group">
                  <span>Acquire Aurelia &bull; ₹4,999</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
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
            <Link to="/product/8" className="block aspect-[4/3] md:aspect-square w-full rounded-[2rem] overflow-hidden relative flex items-center justify-center bg-slate-50 shadow-md border border-slate-200 p-8 group">
              <img 
                src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800" 
                alt="Aurelia Signature Aviator" 
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 filter drop-shadow-[0_15px_25px_rgba(15,23,42,0.18)]"
              />
              <span className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold border border-slate-200 shadow-md group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                View Studio Inspection &rarr;
              </span>
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
