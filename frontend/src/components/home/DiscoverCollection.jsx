import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL } from '../../config/api';

const TABS = ['ALL', 'MEN', 'WOMEN'];

const CURATED_COLLECTION = [
  { id: 101, name: "Classic Aviator", category: "Sun Glass", gender: "Unisex", price: 120, originalPrice: 145, discount: "10%", image: "/curated/prod-classic-aviator.jpg" },
  { id: 102, name: "Retro Square", category: "Eye Glasses", gender: "Men", price: 95, originalPrice: 120, discount: null, image: "/curated/prod-retro-square.jpg" },
  { id: 103, name: "Round Tortoise", category: "Sun Glass", gender: "Women", price: 110, originalPrice: 135, discount: null, image: "/curated/prod-round-tortoise.jpg" },
  { id: 104, name: "Classic Aviator", category: "Sun Glass", gender: "Unisex", price: 120, originalPrice: 145, discount: "10%", image: "/curated/prod-classic-aviator.jpg" },
  { id: 105, name: "Retro Square", category: "Eye Glasses", gender: "Men", price: 95, originalPrice: 120, discount: null, image: "/curated/prod-retro-square.jpg" },
  { id: 106, name: "Round Tortoise", category: "Sun Glass", gender: "Women", price: 110, originalPrice: 135, discount: null, image: "/curated/prod-round-tortoise.jpg" },
  { id: 107, name: "Classic Aviator", category: "Sun Glass", gender: "Unisex", price: 120, originalPrice: 145, discount: "10%", image: "/curated/prod-classic-aviator.jpg" },
  { id: 108, name: "Retro Square", category: "Eye Glasses", gender: "Men", price: 95, originalPrice: 120, discount: null, image: "/curated/prod-retro-square.jpg" },
];

export default function DiscoverCollection() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [products, setProducts] = useState(CURATED_COLLECTION);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length >= 8) {
          setProducts(data);
        }
      })
      .catch(() => {
        // Keep curated fallback
      });
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeTab === 'MEN') return p.gender === 'Men' || p.gender === 'Unisex';
    if (activeTab === 'WOMEN') return p.gender === 'Women' || p.gender === 'Unisex';
    return true;
  }).slice(0, 8);

  return (
    <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Centered Heading */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-950 mb-6 font-sans">
          Discover our collection
        </h2>

        {/* Filter Pills */}
        <div className="inline-flex items-center gap-2 p-1 bg-neutral-100 rounded-full border border-neutral-200/80">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Asymmetrical Bento Grid: 1 Dominant Editorial Anchor + Supporting Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
        {filteredProducts.map((product, idx) => {
          const isLead = idx === 0;

          if (isLead) {
            return (
              <div
                key={product.id || idx}
                className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2 bg-neutral-50/80 rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Large Lead Image Container */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/11] flex items-center justify-center p-6 sm:p-10 overflow-hidden">
                  <span className="absolute top-4 left-4 bg-neutral-950 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                    FEATURED // ATELIER SELECTION
                  </span>

                  <Link to={`/product/${product.id || idx}`} className="w-full h-full flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = CURATED_COLLECTION[0].image;
                      }}
                    />
                  </Link>
                </div>

                {/* Lead Product Body */}
                <div className="p-6 sm:p-7 bg-white border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                      {product.category || 'Sun Glass'} &bull; BESPOKE SERIES
                    </span>
                    <Link to={`/product/${product.id || idx}`}>
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-950 hover:text-neutral-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-neutral-400 line-through font-mono">
                        ₹{product.originalPrice || Math.round(product.price * 1.25)}/-
                      </span>
                      <span className="text-base font-bold text-neutral-950 font-mono">
                        ₹{product.price}/-
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full sm:w-auto px-7 py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    Acquire Frame
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={product.id || idx}
              className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Box */}
              <div className="relative w-full aspect-square bg-neutral-50 flex items-center justify-center p-4 sm:p-5 overflow-hidden">
                {product.discount && (
                  <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs shadow-xs z-10 uppercase">
                    {product.discount}
                  </span>
                )}

                <Link to={`/product/${product.id || idx}`} className="w-full h-full flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = CURATED_COLLECTION[idx % 8].image;
                    }}
                  />
                </Link>
              </div>

              {/* Product Body */}
              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
                    {product.category || 'Sun Glass'}
                  </span>
                  <Link to={`/product/${product.id || idx}`}>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 hover:text-neutral-600 transition-colors truncate mb-1.5">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[10px] sm:text-xs text-neutral-400 line-through font-mono">
                      ₹{product.originalPrice || Math.round(product.price * 1.25)}/-
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-neutral-950 font-mono">
                      ₹{product.price}/-
                    </span>
                  </div>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-neutral-950 hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider py-2 rounded-full transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  Quick Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-10 sm:mt-14">
        <Link
          to="/shop"
          className="px-8 py-3 rounded-full border border-neutral-300 text-xs font-bold tracking-widest uppercase text-neutral-900 hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-all shadow-xs cursor-pointer"
        >
          Load More
        </Link>
      </div>
    </section>
  );
}
