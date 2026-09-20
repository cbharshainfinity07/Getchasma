import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL } from '../../config/api';

const CURATED_WHATS_HOT = [
  {
    id: 1,
    name: "Classic Aviator",
    category: "Sun Glass",
    price: 120,
    originalPrice: 145,
    discount: "15%",
    image: "/curated/prod-classic-aviator.jpg"
  },
  {
    id: 2,
    name: "Retro Square",
    category: "Eye Glasses",
    price: 95,
    originalPrice: 120,
    discount: "15%",
    image: "/curated/prod-retro-square.jpg"
  },
  {
    id: 3,
    name: "Round Tortoise",
    category: "Sun Glass",
    price: 110,
    originalPrice: 135,
    discount: "15%",
    image: "/curated/prod-round-tortoise.jpg"
  }
];

export default function WhatsHot() {
  const [products, setProducts] = useState(CURATED_WHATS_HOT);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length >= 3) {
          const mapped = data.slice(0, 3).map((item, idx) => ({
            ...item,
            image: item.image || CURATED_WHATS_HOT[idx % 3].image,
            category: item.category || CURATED_WHATS_HOT[idx % 3].category
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {
        // Keep curated fallback
      });
  }, []);

  const leadProduct = products[0] || CURATED_WHATS_HOT[0];
  const sideProducts = products.slice(1, 3);

  return (
    <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 border-b border-neutral-100 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 block mb-1">
            CURATED SELECTION // ATELIER
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 font-sans">
            Whats Hot
          </h2>
        </div>
        <Link 
          to="/shop" 
          className="mt-3 sm:mt-0 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-neutral-950 hover:text-neutral-500 transition-colors"
        >
          <span>Explore All Archive</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Asymmetrical Structural Tension Layout: Lead Hero Spotlight (7 cols) + Dual Stacked Sidecars (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* LEAD SPOTLIGHT: Dominant Hero Showcase (7 cols) */}
        {leadProduct && (
          <div className="lg:col-span-7 bg-neutral-50/80 rounded-3xl border border-neutral-200/90 overflow-hidden flex flex-col justify-between group hover:border-neutral-400 transition-all duration-300">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/11] flex items-center justify-center p-8 sm:p-12 overflow-hidden">
              <span className="absolute top-5 left-5 bg-neutral-950 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                15% OFF // TRENDING
              </span>

              <Link to={`/product/${leadProduct.id}`} className="w-full h-full flex items-center justify-center">
                <img 
                  src={leadProduct.image} 
                  alt={leadProduct.name}
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </Link>
            </div>

            <div className="p-6 sm:p-8 bg-white border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                  {leadProduct.category || 'Sun Glass'} &bull; BESPOKE ACETATE
                </span>
                <Link to={`/product/${leadProduct.id}`}>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 hover:text-neutral-600 transition-colors">
                    {leadProduct.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2.5 mt-1">
                  <span className="text-xs text-neutral-400 line-through font-mono">
                    ₹{leadProduct.originalPrice || Math.round(leadProduct.price * 1.25)}/-
                  </span>
                  <span className="text-lg font-bold text-neutral-950 font-mono">
                    ₹{leadProduct.price}/-
                  </span>
                </div>
              </div>

              <button
                onClick={() => addToCart(leadProduct)}
                className="w-full sm:w-auto px-8 py-3.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              >
                Acquire Frame
              </button>
            </div>
          </div>
        )}

        {/* COMPLEMENTARY SIDECARS: Dual Stacked Horizontal Panels (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          {sideProducts.map((product, idx) => (
            <div 
              key={product.id || idx}
              className="flex-1 bg-neutral-50/60 rounded-3xl border border-neutral-200/90 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 group hover:bg-white hover:border-neutral-400 transition-all duration-300 shadow-xs"
            >
              {/* Square Thumbnail */}
              <div className="w-full sm:w-36 h-36 sm:h-auto aspect-square bg-white rounded-2xl border border-neutral-200/70 flex items-center justify-center p-3 relative overflow-hidden flex-shrink-0">
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs">
                  {product.discount || '15%'}
                </span>
                <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </Link>
              </div>

              {/* Product Info & Action */}
              <div className="flex-1 w-full flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                    {product.category || 'Eye Glasses'}
                  </span>
                  <Link to={`/product/${product.id}`}>
                    <h4 className="text-base font-bold text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1 mb-1">
                      {product.name}
                    </h4>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-neutral-400 line-through font-mono">
                      ₹{product.originalPrice || Math.round(product.price * 1.25)}/-
                    </span>
                    <span className="text-sm font-bold text-neutral-950 font-mono">
                      ₹{product.price}/-
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-neutral-950 hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer active:scale-98 text-center"
                >
                  Quick Add
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
