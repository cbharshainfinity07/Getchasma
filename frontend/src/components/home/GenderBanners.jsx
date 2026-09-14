import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function GenderBanners() {
  return (
    <section className="bg-white py-6 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        
        {/* For Men Card */}
        <Link 
          to="/shop?gender=Men"
          className="group bg-[#F7F5F2] hover:bg-[#F0ECE6] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[140px] sm:min-h-[170px] border border-neutral-200/60 shadow-xs"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mb-2 group-hover:text-black transition-colors">
            For Men
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-600 group-hover:text-black transition-colors">
            <span>Shop Now</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* For Women Card */}
        <Link 
          to="/shop?gender=Women"
          className="group bg-[#F7F5F2] hover:bg-[#F0ECE6] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[140px] sm:min-h-[170px] border border-neutral-200/60 shadow-xs"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mb-2 group-hover:text-black transition-colors">
            For Women
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-600 group-hover:text-black transition-colors">
            <span>Shop Now</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

      </div>
    </section>
  );
}
