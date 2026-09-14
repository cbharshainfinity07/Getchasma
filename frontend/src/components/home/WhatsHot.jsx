import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function WhatsHot() {
  const scrollContainerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5001/api/categories')
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
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (loading) return null;

  if (loading) return null;

  return (
    <div id="categories" className="py-20 md:py-28 overflow-hidden bg-white border-t border-slate-200/70 text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-[0.28em] text-blue-600 font-extrabold block mb-2">
              ATELIER ARCHIVE &bull; VOL. 2026
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-slate-950 tracking-tight">
              Curated Optical Editions<span className="text-neutral-400">.</span>
            </h2>
          </div>
          <Link 
            to="/shop" 
            className="text-xs font-mono font-bold tracking-widest uppercase text-blue-600 hover:text-indigo-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Explore All Frames</span> <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Slider Area */}
        <div className="relative group">
          {/* Left Arrow */}
          <button 
            onClick={scrollLeft}
            className="absolute -left-3 md:-left-5 top-[40%] z-20 w-12 h-12 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 rounded-full flex items-center justify-center shadow-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex items-start gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 -mx-6 px-6 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((item, idx) => (
              <Link 
                key={item.id || idx} 
                to={`/shop?category=${encodeURIComponent(item.id || item.name)}`}
                className="flex flex-col group/card cursor-pointer min-w-[280px] md:min-w-[320px] snap-start shrink-0"
              >
                <div className="overflow-hidden bg-slate-50/90 hover:bg-white aspect-[4/5] mb-5 relative flex items-center justify-center rounded-[2rem] border border-slate-200/90 p-8 shadow-sm group-hover/card:shadow-2xl group-hover/card:border-blue-400/50 transition-all duration-500">
                  {/* Subtle noise texture & light reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/5 pointer-events-none" />
                  
                  {/* Edition Tag */}
                  <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[9px] font-mono font-bold tracking-widest text-slate-700 uppercase shadow-sm">
                    EDITION N° 0{idx + 1}
                  </div>

                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover/card:scale-110 filter drop-shadow-[0_15px_25px_rgba(15,23,42,0.15)] mix-blend-multiply"
                  />
                  
                  <span className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 opacity-0 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
                    <ArrowRight size={16} />
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-serif font-bold text-slate-950 group-hover/card:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">
                      HAUTE OPTIQUE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                    {item.description || "Handcrafted Japanese titanium and bespoke cured acetate."}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={scrollRight}
            className="absolute -right-3 md:-right-5 top-[40%] z-20 w-12 h-12 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 rounded-full flex items-center justify-center shadow-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
