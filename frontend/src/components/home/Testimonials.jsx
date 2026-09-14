import React from 'react';
import { Star, CheckCircle, Quote, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const REVIEWS = [
  {
    name: "Dr. Rohini Kulkarni",
    role: "Ophthalmologist & Optical Specialist",
    location: "Bengaluru, IN",
    rating: 5,
    comment: "The Cybershield blue-light mineral lenses cut high-energy 420nm screen fatigue immediately without warping color balance. The featherweight Japanese titanium temples exert zero pinch pressure over 12-hour clinic days.",
    frame: "Cybershield 420nm Screen Armor"
  },
  {
    name: "Devendra Mehta",
    role: "Design Principal, Studio D",
    location: "Mumbai, IN",
    rating: 5,
    comment: "The craft standard matches bespoke international optical maisons charging ₹25,000+. The Havana tortoise acetate possesses deep optical depth, and the five-barrel hinges have that distinct, damped mechanical feel.",
    frame: "Round Tortoise Masterwork"
  },
  {
    name: "Karan Singhania",
    role: "Aviation Logistics Director",
    location: "New Delhi, IN",
    rating: 5,
    comment: "Received via express courier in a magnetic presentation vault. The Aurelia Aviator is astonishingly featherweight (sub-20 grams), and the Zeiss polarized lenses cut horizontal glare completely.",
    frame: "Aurelia Signature Titanium Aviator"
  }
];

export default function Testimonials() {
  return (
    <section className="bg-[#f8fafc] py-12 sm:py-20 md:py-28 border-t border-slate-200/70 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-14 gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold uppercase tracking-widest mb-2.5">
              <ShieldCheck size={13} className="text-slate-700" /> Verified Eyewear Clients
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight">
              Endorsed by Discerning Eyes<span className="text-neutral-400">.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg">
              Read verified testimonials from surgeons, architects, and designers wearing GetChasma daily.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-2.5 px-4 shadow-sm self-start md:self-auto">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400" />
              ))}
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="font-bold text-xs sm:text-sm text-slate-950 block">4.92 / 5.0</span>
              <span className="text-[10px] text-slate-500">10,000+ Reviews</span>
            </div>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {REVIEWS.map((rev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400" />
                    ))}
                  </div>
                  <Quote size={20} className="text-blue-200" />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-6 italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-950 flex items-center gap-1.5">
                    {rev.name}
                    <CheckCircle size={14} className="text-emerald-600 fill-emerald-100" />
                  </h4>
                  <p className="text-[11px] text-slate-500">{rev.role} &bull; {rev.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
