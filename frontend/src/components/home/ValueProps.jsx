import React from 'react';
import { ShieldCheck, Sparkles, Truck, Eye, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const PERKS = [
  {
    icon: Sparkles,
    tag: "AEROSPACE GRADE",
    title: "Pure Japanese Titanium",
    desc: "Milled from Grade-1 titanium and Mazzucchelli acetate for effortless, featherweight balance."
  },
  {
    icon: Eye,
    tag: "PRECISION OPTICS",
    title: "Optical Lab Calibration",
    desc: "Precision anti-glare, blue-light digital shields, and 100% UV400 multi-layer coatings."
  },
  {
    icon: Truck,
    tag: "SECURE DELIVERY",
    title: "Complimentary Express Courier",
    desc: "Dispatched in signature hard-shell presentation vaults with tracking and microfiber cloth."
  },
  {
    icon: ShieldCheck,
    tag: "MAISON PROMISE",
    title: "1-Year Optical Warranty",
    desc: "Comprehensive coverage including frame tuning, hinge adjustments, and nose pad service."
  }
];

export default function ValueProps() {
  return (
    <div className="bg-white py-12 sm:py-20 md:py-28 border-t border-slate-200/70 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold uppercase tracking-widest mb-2.5">
            <Award size={13} className="text-slate-700" /> The Standard of Excellence
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight">
            Crafted for Connoisseurs &bull; Built to Last
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            From hand-finished aerospace titanium to certified optical lenses, experience the craftsmanship behind GetChasma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 text-slate-800 shadow-sm group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition-all">
                    <Icon size={19} />
                  </div>
                  <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-slate-400 block mb-1">
                    {perk.tag}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-slate-950 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {perk.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {perk.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
