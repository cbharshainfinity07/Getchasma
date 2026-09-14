import React from 'react';
import { MapPin, Phone, Mail, Truck, Crown, Sparkles, Globe, ShieldCheck, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#f8fafc] text-slate-700 pt-16 pb-12 border-t border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        
        {/* Brand Column */}
        <div>
          <Link to="/" className="font-serif text-3xl tracking-tight mb-3 inline-block font-bold text-slate-950">
            GetChasma<span className="text-blue-600">.</span>
          </Link>
          <p className="text-slate-600 text-xs leading-relaxed mb-5 font-normal">
            Designer eyewear maison engineered with aerospace titanium, Zeiss crystalline optics, and contemporary ergonomics.
          </p>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-bold block mb-1 flex items-center gap-1">
              <Globe size={12} /> Global Lab Network
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Bengaluru Optical Lab &bull; Kalaburagi Flagship Studio &bull; 150+ Partner Clinics
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 mb-4">
            Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li><Link to="/shop" className="hover:text-blue-600 transition-colors">All Eyewear</Link></li>
            <li><Link to="/shop?category=eye-glasses" className="hover:text-blue-600 transition-colors">Classic Eyeglasses</Link></li>
            <li><Link to="/shop?category=sun-glass" className="hover:text-blue-600 transition-colors">Polarized Sunglasses</Link></li>
            <li><Link to="/shop?category=blue-light" className="hover:text-blue-600 transition-colors">Computer Screen BluCut</Link></li>
            <li><Link to="/membership" className="hover:text-blue-600 transition-colors text-amber-600 font-bold flex items-center gap-1"><Crown size={12} /> Gold VIP Club</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 mb-4">
            Customer Care
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li><Link to="/track-order" className="hover:text-blue-600 transition-colors">Track Consignment</Link></li>
            <li><Link to="/account" className="hover:text-blue-600 transition-colors">My Orders & Prescriptions</Link></li>
            <li><a href="https://wa.me/919740310101" target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">WhatsApp Optometrist</a></li>
            <li><span className="text-slate-500">Toll-Free: 1800-CHASMA</span></li>
            <li><span className="text-slate-500">Email: care@getchasma.com</span></li>
          </ul>
        </div>

        {/* Newsletter & Guarantee */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 mb-4">
            Join VIP Privilege Club
          </h4>
          <p className="text-slate-600 text-xs leading-relaxed mb-3">
            Subscribe for secret vault drops, complimentary eye test vouchers, and seasonal releases.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-white border border-slate-200 rounded-full px-4 py-2.5 text-xs outline-none focus:border-blue-600 flex-1 text-slate-900"
            />
            <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 active:scale-95 transition-all">
              Join
            </button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>&copy; 2026 GetChasma Optique Ltd. All rights reserved. 100% genuine optics certified.</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1">Made with <Heart size={12} className="text-rose-500 fill-rose-500" /> for India</span>
          <Link to="/admin/login" className="hover:text-slate-900 transition-colors">Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
}
