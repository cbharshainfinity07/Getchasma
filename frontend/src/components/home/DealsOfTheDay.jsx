import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL } from '../../config/api';

const CURATED_DEALS = [
  {
    id: 4,
    name: "Classic Aviator",
    category: "Sun Glass",
    price: 120,
    originalPrice: 145,
    image: "/curated/prod-classic-aviator.jpg"
  },
  {
    id: 5,
    name: "Retro Square",
    category: "Eye Glasses",
    price: 95,
    originalPrice: 120,
    image: "/curated/prod-retro-square.jpg"
  },
  {
    id: 6,
    name: "Round Tortoise",
    category: "Sun Glass",
    price: 110,
    originalPrice: 135,
    image: "/curated/prod-round-tortoise.jpg"
  }
];

export default function DealsOfTheDay() {
  const [deals, setDeals] = useState(CURATED_DEALS);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length >= 6) {
          const mapped = data.slice(3, 6).map((item, idx) => ({
            ...item,
            image: item.image || CURATED_DEALS[idx % 3].image,
            category: item.category || CURATED_DEALS[idx % 3].category
          }));
          setDeals(mapped);
        }
      })
      .catch(() => {
        // Keep curated fallback
      });
  }, []);

  const primaryDeals = deals.slice(0, 2);

  return (
    <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Editorial Split Panel Layout (5 cols dark editorial manifesto + 7 cols dual product cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* LEFT: Dark Editorial Manifesto Panel (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-950 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border border-neutral-900 shadow-lg">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SPECIAL RELEASE // 24H ALLOCATION
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans leading-tight mb-4">
              Deals of the Day
            </h2>

            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              Curated luxury optical silhouettes calibrated with Zeiss optics. Hand-selected for immediate atelier dispatch at privileged values.
            </p>

            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>BATCH CODE:</span>
                <span className="text-white font-bold">GC-ALLOC-2026</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>WARRANTY:</span>
                <span className="text-emerald-400 font-bold">1-YEAR ATELIER CARE</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-sm"
            >
              <span>Explore All Special Rates</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* RIGHT: Dual Product Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {primaryDeals.map((deal, idx) => (
            <div 
              key={deal.id || idx}
              className="group bg-neutral-50/70 rounded-3xl border border-neutral-200/90 overflow-hidden flex flex-col justify-between hover:bg-white hover:border-neutral-400 transition-all duration-300 shadow-xs"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] bg-white flex items-center justify-center p-6 overflow-hidden border-b border-neutral-100">
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10">
                  SALE // 15% OFF
                </span>

                <Link to={`/product/${deal.id || idx}`} className="w-full h-full flex items-center justify-center">
                  <img 
                    src={deal.image} 
                    alt={deal.name}
                    className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </Link>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                    {deal.category || 'Sun Glass'}
                  </span>
                  <Link to={`/product/${deal.id || idx}`}>
                    <h3 className="text-base font-bold text-neutral-950 hover:text-neutral-600 transition-colors line-clamp-1 mb-2">
                      {deal.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-neutral-400 line-through font-mono">
                      ₹{deal.originalPrice || Math.round(deal.price * 1.25)}/-
                    </span>
                    <span className="text-base font-bold text-neutral-950 font-mono">
                      ₹{deal.price}/-
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(deal)}
                  className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-3 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 text-center"
                >
                  Acquire Deal
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
