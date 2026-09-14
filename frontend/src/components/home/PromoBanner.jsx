import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="bg-white py-4 sm:py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-neutral-200/80 shadow-xs">
        
        {/* Left Side: Deep Black */}
        <div className="bg-[#0a0a0a] text-white p-8 sm:p-12 md:p-16 flex flex-col justify-center items-start">
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase mb-3">
            Limited Time Offer
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            25% Off Summer<br />Collection
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-widest uppercase text-white hover:text-neutral-300 border-b border-white pb-1 transition-all group"
          >
            <span>Discover Now</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Right Side: Clean White Studio Showcase */}
        <div className="bg-white p-6 sm:p-10 flex items-center justify-center min-h-[240px] sm:min-h-[300px]">
          <img
            src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop"
            alt="Summer Collection Eyewear"
            className="w-full max-w-md h-auto max-h-56 sm:max-h-72 object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

      </div>
    </section>
  );
}
