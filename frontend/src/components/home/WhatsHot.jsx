import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

export default function WhatsHot() {
  const scrollContainerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  if (loading) return null;

  return (
    <div id="categories" className="py-12 sm:py-20 md:py-28 overflow-hidden bg-white border-t border-slate-200/70 text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3"
        >
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-[0.25em] text-slate-500 block mb-1.5">
              ATELIER ARCHIVE &bull; VOL. 2026
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight">
              Curated Optical Editions<span className="text-neutral-400">.</span>
            </h2>
          </div>
          <Link 
            to="/shop" 
            className="text-xs font-mono font-bold tracking-widest uppercase text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-2 self-start sm:self-auto pt-1"
          >
            <span>Explore All Frames</span> <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Slider Area */}
        <div className="relative group">
          {/* Left Arrow */}
          <button 
            onClick={scrollLeft}
            className="hidden sm:flex absolute -left-3 md:-left-5 top-[40%] z-20 w-11 h-11 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 rounded-full items-center justify-center shadow-xl hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex items-start gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((item, idx) => (
              <Link 
                key={item.id || idx} 
                to={`/shop?category=${encodeURIComponent(item.id || item.name)}`}
                className="flex flex-col group/card cursor-pointer min-w-[200px] sm:min-w-[260px] md:min-w-[300px] snap-start shrink-0"
              >
                <div className="overflow-hidden bg-slate-50/90 hover:bg-white aspect-square sm:aspect-[4/5] mb-3 sm:mb-4 relative flex items-center justify-center rounded-2xl sm:rounded-[2rem] border border-slate-200/90 p-4 sm:p-7 shadow-sm group-hover/card:shadow-xl group-hover/card:border-slate-400 transition-all duration-500">
                  {/* Subtle light reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/5 pointer-events-none" />
                  
                  {/* Edition Tag */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-200 text-[8px] sm:text-[9px] font-mono font-bold tracking-widest text-slate-700 uppercase shadow-sm">
                    EDITION N° 0{idx + 1}
                  </div>

                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover/card:scale-105 filter drop-shadow-[0_10px_20px_rgba(15,23,42,0.12)] mix-blend-multiply"
                  />
                  
                  <span className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-md opacity-0 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
                    <ArrowRight size={14} />
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm sm:text-base font-serif font-bold text-slate-950 group-hover/card:text-blue-600 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                      EDITION
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 leading-relaxed">
                    {item.description || "Handcrafted Japanese titanium and bespoke cured acetate."}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={scrollRight}
            className="hidden sm:flex absolute -right-3 md:-right-5 top-[40%] z-20 w-11 h-11 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 rounded-full items-center justify-center shadow-xl hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
