import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { 
  Crown, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Truck, 
  Gift, 
  Eye, 
  ArrowRight, 
  Star, 
  Zap, 
  Clock, 
  Layers,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Membership() {
  const { user, isLoggedIn, activateMembership } = useUserAuth();
  const navigate = useNavigate();

  const handleSelectPlan = async (planName, years) => {
    if (!isLoggedIn) {
      navigate('/account/login', { state: { from: '/membership' } });
      return;
    }
    try {
      await activateMembership(planName, years);
      navigate('/account');
    } catch (err) {
      alert(err.message || 'Failed to activate membership');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-slate-50 text-slate-900 pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Sunlit golden ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-amber-300/20 via-orange-200/15 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-80 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-20 relative z-10">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-300/60 text-amber-900 text-[11px] font-bold uppercase tracking-widest shadow-sm">
            <Crown size={14} className="fill-amber-500 text-amber-500" />
            Lenskart & Atelier-Grade Privilege Club
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            Chasma Gold <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 bg-clip-text text-transparent">VIP Privilege</span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Modeled after the world&rsquo;s most prestigious luxury clubs and optical ateliers. Unlock 365 days of complimentary second frames, half-price bespoke lenses, and white-glove express logistics.
          </p>

          {/* Digital 24K Gold VIP Card Showcase */}
          <div className="pt-6">
            <motion.div 
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative max-w-md mx-auto rounded-3xl p-8 bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#0c0a09] border-2 border-amber-400/60 shadow-[0_20px_50px_rgba(217,119,6,0.25)] text-left space-y-6 text-white overflow-hidden group"
            >
              {/* Metallic shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold block">
                    GETCHASMA CONCIERGE
                  </span>
                  <h4 className="font-serif text-xl font-bold text-white flex items-center gap-1.5">
                    <Crown size={18} className="text-amber-400 fill-amber-400" />
                    GOLD VIP PASS
                  </h4>
                </div>
                <div className="w-12 h-10 rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300 shadow-lg flex items-center justify-center text-slate-950 font-black text-[9px] uppercase tracking-wider">
                  VIP CHIP
                </div>
              </div>

              <div className="py-2 relative z-10">
                <span className="text-[10px] text-amber-200/80 uppercase tracking-widest block mb-1">PRIVILEGE NUMBER</span>
                <p className="font-mono text-xl tracking-[0.25em] font-bold text-amber-300">
                  GC &bull; GOLD &bull; 7821 &bull; VIP
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-amber-400/20 text-xs relative z-10">
                <div>
                  <span className="text-[9px] text-amber-200/70 uppercase tracking-wider block">TIER</span>
                  <p className="font-bold text-white uppercase tracking-wide">UNLIMITED 365 ACCESS</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-amber-200/70 uppercase tracking-wider block">PERKS</span>
                  <p className="font-bold text-amber-300">BOGO + 50% LENSES</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 4 Pillars of Chasma Gold VIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Gift,
              tag: 'MOST POPULAR',
              title: 'Buy 1 Get 1 Free',
              desc: 'Get an extra pair free for yourself or your family across all handcrafted frames and polarized sunglasses for 1 full year.',
              accent: 'border-amber-200 bg-amber-50/80 text-amber-600'
            },
            {
              icon: Eye,
              tag: 'OPTICAL LAB',
              title: '50% Off Prescription Lenses',
              desc: 'Half-price privilege on premium anti-glare, blue-cut screen shields, and ultra-lightweight high-index lenses.',
              accent: 'border-blue-200 bg-blue-50/80 text-blue-600'
            },
            {
              icon: Truck,
              tag: 'WHITE-GLOVE',
              title: 'Zero Delivery Fees',
              desc: 'Priority express courier shipping on every commission, with signature confirmation and complimentary case.',
              accent: 'border-emerald-200 bg-emerald-50/80 text-emerald-600'
            },
            {
              icon: ShieldCheck,
              tag: 'LIFETIME CARE',
              title: 'Atelier Warranty & Fit',
              desc: 'Free frame adjustments, ultrasonic lens cleanings, and nose pad replacements at any partner showroom.',
              accent: 'border-violet-200 bg-violet-50/80 text-violet-600'
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md shadow-slate-100 hover:shadow-xl hover:border-amber-300/80 transition-all group relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.accent}`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 block mb-1">
                    {feature.tag}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* COMPARISON TABLE: Regular vs Gold VIP */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200/80 shadow-xl">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Unrivaled Optical Value</span>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 mt-1">
              Privilege Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1">See how much value Chasma Gold unlocks across every purchase</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-4 font-bold">Eyewear Privilege</th>
                  <th className="py-4 px-4 font-bold text-center">Standard Guest</th>
                  <th className="py-4 px-4 font-bold text-center text-amber-800 bg-amber-50/80 rounded-t-2xl border-t-2 border-amber-400">
                    Chasma Gold VIP Member
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { perk: 'Buy 1 Get 1 Free on all Eyewear & Sunglasses', reg: 'None', gold: 'Unlimited for 365 Days' },
                  { perk: 'Prescription Lens Discount', reg: 'Full Price', gold: 'Flat 50% Off All Lenses' },
                  { perk: 'Anti-Glare & Scratch Resistance Coating', reg: '₹999 Add-on', gold: 'FREE Complimentary' },
                  { perk: 'White-Glove Express Shipping', reg: '₹99 Standard', gold: 'Always FREE Priority' },
                  { perk: 'Early Access to Limited Atelier Drops', reg: 'No', gold: '48-Hour VIP Window' },
                  { perk: 'Family Sharing (2 Users per Pass)', reg: 'No', gold: 'Yes (Shareable)' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-800">{row.perk}</td>
                    <td className="py-4 px-4 text-center text-slate-400">{row.reg}</td>
                    <td className="py-4 px-4 text-center font-bold text-amber-900 bg-amber-50/50">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                        <Check size={15} className="text-emerald-600 stroke-[3]" />
                        {row.gold}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRICING & ENROLLMENT PLANS */}
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">Exclusive Membership</span>
          <h3 className="font-serif text-3xl md:text-4xl font-bold text-slate-900">
            Choose Your Atelier Pass
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            One-time membership fee. Pays for itself on your very first order.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left">
            {/* 1 Year Plan */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white border-2 border-amber-400 shadow-xl shadow-amber-500/10 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  MOST POPULAR
                </div>
                <div>
                  <h4 className="font-serif text-2xl font-bold text-slate-900">1-Year Gold VIP Pass</h4>
                  <p className="text-xs text-slate-500 mt-1">365 Days of BOGO, 50% off lenses & free courier</p>
                </div>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="font-serif text-4xl font-bold text-slate-900 font-mono">₹999</span>
                  <span className="text-xs text-slate-500">/ 1 full year</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2"><Check size={15} className="text-amber-500 stroke-[2.5]" /> BOGO on all frames</li>
                  <li className="flex items-center gap-2"><Check size={15} className="text-amber-500 stroke-[2.5]" /> 50% off all prescription lenses</li>
                  <li className="flex items-center gap-2"><Check size={15} className="text-amber-500 stroke-[2.5]" /> Free white-glove express courier</li>
                  <li className="flex items-center gap-2"><Check size={15} className="text-amber-500 stroke-[2.5]" /> Digital 24K Gold VIP Card</li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('1-Year Chasma Gold Pass', 1)}
                className="w-full mt-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-lg shadow-amber-500/25 active:scale-95 text-center cursor-pointer"
              >
                Activate 1-Year Pass (₹999)
              </button>
            </motion.div>

            {/* 2 Year Plan */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-400/80 transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  BEST VALUE (SAVE ₹499)
                </div>
                <div>
                  <h4 className="font-serif text-2xl font-bold text-slate-900">2-Year Connoisseur</h4>
                  <p className="text-xs text-slate-500 mt-1">730 Days of uninterrupted VIP eyewear privilege</p>
                </div>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="font-serif text-4xl font-bold text-slate-900 font-mono">₹1,499</span>
                  <span className="text-xs text-slate-500">/ 2 years (₹749/yr)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2"><Check size={15} className="text-emerald-600 stroke-[2.5]" /> All 1-Year benefits included</li>
                  <li className="flex items-center gap-2"><Check size={15} className="text-emerald-600 stroke-[2.5]" /> Share with up to 3 family members</li>
                  <li className="flex items-center gap-2"><Check size={15} className="text-emerald-600 stroke-[2.5]" /> Priority Atelier private stylist consultation</li>
                  <li className="flex items-center gap-2"><Check size={15} className="text-emerald-600 stroke-[2.5]" /> Free replacement nose pads & screw kit</li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('2-Year Luxury Connoisseur Pass', 2)}
                className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-lg shadow-blue-500/25 active:scale-95 text-center cursor-pointer"
              >
                Activate 2-Year Pass (₹1,499)
              </button>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
