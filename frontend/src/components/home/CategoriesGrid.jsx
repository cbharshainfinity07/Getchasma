import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    title: 'Women',
    link: '/shop?category=women',
    image: '/curated/cat-women.jpg'
  },
  {
    title: 'Men',
    link: '/shop?category=men',
    image: '/curated/cat-men.jpg'
  },
  {
    title: 'Kids',
    link: '/shop?category=kids',
    image: '/curated/cat-kids.jpg'
  },
  {
    title: 'Sunglasses',
    link: '/shop?category=sun-glass',
    image: '/curated/cat-sunglasses.jpg'
  }
];

export default function CategoriesGrid() {
  return (
    <section className="bg-white py-10 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 font-sans">
          Our Categories
        </h2>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-neutral-900 hover:text-neutral-600 transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {CATEGORIES.map((cat, idx) => (
          <Link
            key={idx}
            to={cat.link}
            className="group relative aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shadow-xs cursor-pointer block"
          >
            <img 
              src={cat.image} 
              alt={cat.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            {/* Subtle bottom gradient overlay for clean text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Title Label */}
            <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-6 flex items-center justify-between text-white">
              <span className="text-base sm:text-xl font-bold tracking-tight">
                {cat.title}
              </span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
