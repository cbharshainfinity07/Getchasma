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

  return (
    <section className="bg-white py-10 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 font-sans">
          Whats Hot
        </h2>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-neutral-900 hover:text-neutral-600 transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* 3 Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
        {products.map((product, idx) => (
          <div 
            key={product.id || idx}
            className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            {/* Image Container - Clean Studio Box */}
            <div className="relative w-full aspect-[4/3] bg-neutral-50 flex items-center justify-center p-6 sm:p-8 overflow-hidden">
              {/* Discount Pill */}
              <span className="absolute top-3 left-3 bg-[#10b981] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-xs z-10">
                15%
              </span>

              <Link to={`/product/${product.id || idx}`} className="w-full h-full flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </Link>
            </div>

            {/* Product Body */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                  {product.category || 'Sun Glass'}
                </span>
                <Link to={`/product/${product.id || idx}`}>
                  <h3 className="text-base font-bold text-neutral-900 hover:text-neutral-600 transition-colors truncate mb-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-neutral-400 line-through">
                    ₹{product.originalPrice || Math.round(product.price * 1.25)}/-
                  </span>
                  <span className="text-sm sm:text-base font-bold text-neutral-950">
                    ₹{product.price}/-
                  </span>
                </div>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-neutral-950 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-98"
              >
                BUY NOW
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
