import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SpecialOfferBanner() {
  return (
    <section className="bg-white py-6 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-neutral-200/80 shadow-xs">
        
        {/* Left Side: Lifestyle Eyewear Photo */}
        <div className="relative min-h-[220px] sm:min-h-[280px] bg-neutral-100 overflow-hidden">
          <img
            src="/curated/special-offer-beach.jpg"
            alt="Special Offer Eyewear"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1000&auto=format&fit=crop";
            }}
          />
        </div>

        {/* Right Side: Cream Special Offer Card */}
        <div className="bg-[#F7F5F2] p-8 sm:p-12 md:p-16 flex flex-col justify-center items-start">
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2">
            Special Offer
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 mb-6 leading-tight">
            Frames from ₹999
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-widest uppercase text-neutral-900 hover:text-neutral-600 border-b border-neutral-900 pb-1 transition-all group"
          >
            <span>Shop The Sale</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
