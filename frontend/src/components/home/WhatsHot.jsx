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
    <div id="categories" className="py-10 sm:py-16 md:py-24 overflow-hidden bg-white border-t border-neutral-200/60 text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 gap-3"
        >
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-[0.25em] text-neutral-500 block mb-1.5">
              ATELIER ARCHIVE &bull; VOL. 2026
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-neutral-950 tracking-tight">
              Curated Optical Editions<span className="text-neutral-400">.</span>
            </h2>
          </div>
          <Link 
            to="/shop" 
            className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-2 self-start sm:self-auto pt-1"
          >
            <span>Explore All Frames</span> <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Slider Area */}
        <div className="relative group">
          {/* Left Arrow */}
          <button 
            onClick={scrollLeft}
            className="hidden sm:flex absolute -left-3 md:-left-5 top-[38%] z-20 w-11 h-11 bg-white/95 backdrop-blur-md border border-neutral-200 text-neutral-800 rounded-full items-center justify-center shadow-xl hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex items-start gap-3.5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((item, idx) => (
              <Link 
                key={item.id || idx} 
                to={`/shop?category=${encodeURIComponent(item.id || item.name)}`}
                className="flex flex-col group/card cursor-pointer w-[210px] sm:w-[250px] md:w-[270px] shrink-0 snap-start"
              >
                <div className="w-full h-44 sm:h-52 bg-gradient-to-b from-neutral-50 to-neutral-100/70 rounded-2xl border border-neutral-200/80 p-4 sm:p-6 mb-2.5 relative flex items-center justify-center overflow-hidden shadow-xs group-hover/card:shadow-md group-hover/card:border-neutral-400 transition-all duration-300">
                  {/* Subtle light reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40 pointer-events-none" />
                  
                  {/* Edition Tag */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/95 border border-neutral-200/80 text-[8px] sm:text-[9px] font-mono font-bold tracking-widest text-neutral-700 uppercase shadow-xs z-10">
                    EDITION 0{idx + 1}
                  </div>

                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full max-h-32 sm:max-h-36 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)] group-hover/card:scale-105 transition-transform duration-500 relative z-0"
                    loading="lazy"
                  />
                  
                  <span className="absolute bottom-3 right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center shadow-md opacity-0 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 z-10">
                    <ArrowRight size={13} />
                  </span>
                </div>
                <div className="px-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-serif font-bold text-neutral-950 group-hover/card:text-neutral-700 transition-colors truncate">
                      {item.name}
                    </h3>
                    <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-wider">
                      ARCHIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 leading-normal">
                    {item.description || "Bespoke handcrafted titanium and acetate."}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={scrollRight}
            className="hidden sm:flex absolute -right-3 md:-right-5 top-[38%] z-20 w-11 h-11 bg-white/95 backdrop-blur-md border border-neutral-200 text-neutral-800 rounded-full items-center justify-center shadow-xl hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
