import React from 'react';
import { ShieldCheck, Sparkles, Truck, Eye, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const PERKS = [
  {
    icon: Sparkles,
    tag: "FUKUI & BELLUNO",
    title: "Japanese Pure Titanium",
    desc: "Milled from aerospace Grade-1 titanium and Mazzucchelli acetate for effortless, featherweight elegance.",
    color: "from-blue-600 to-indigo-600",
    bg: "bg-blue-50/70",
    border: "border-blue-200/80",
    iconColor: "text-blue-600"
  },
  {
    icon: Eye,
    tag: "ZEISS CERTIFIED",
    title: "Master Optical Calibration",
    desc: "Precision anti-glare, blue-light digital shields, and 100% UV400 multi-layer diamond coatings.",
    color: "from-emerald-600 to-teal-600",
    bg: "bg-emerald-50/70",
    border: "border-emerald-200/80",
    iconColor: "text-emerald-600"
  },
  {
    icon: Truck,
    tag: "WHITE-GLOVE VIP",
    title: "Complimentary Express Courier",
    desc: "Dispatched in signature presentation vaults with tamper-evident tracking and microfiber cloth.",
    color: "from-violet-600 to-purple-600",
    bg: "bg-purple-50/70",
    border: "border-purple-200/80",
    iconColor: "text-purple-600"
  },
  {
    icon: ShieldCheck,
    tag: "MAISON PROMISE",
    title: "1-Year Full Optical Warranty",
    desc: "Complete coverage including ultrasonic frame cleanings, hinge adjustments, and nose pad replacements.",
    color: "from-amber-600 to-orange-600",
    bg: "bg-amber-50/70",
    border: "border-amber-200/80",
    iconColor: "text-amber-600"
  }
];

export default function ValueProps() {
  return (
    <div className="bg-white py-20 md:py-28 border-t border-slate-200/70 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest mb-3 shadow-sm">
            <Award size={13} className="text-blue-600" /> The Standard of Excellence
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-slate-950 tracking-tight">
            Crafted for Connoisseurs &bull; Built to Last
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-3 max-w-lg mx-auto leading-relaxed">
            From hand-polished aerospace titanium to certified medical-grade optics, experience the craftsmanship behind GetChasma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-blue-400/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${perk.bg} ${perk.border} border flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className={perk.iconColor} />
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 block mb-1.5">
                    {perk.tag}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
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
