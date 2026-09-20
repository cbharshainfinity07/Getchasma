import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  Star, 
  ShoppingBag, 
  Eye, 
  X, 
  Check, 
  Heart, 
  Camera, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Tag, 
  Filter, 
  RotateCcw,
  Glasses
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';
import VirtualTryOnModal from '../components/product/VirtualTryOnModal';
import InteractiveCatalogImage from '../components/product/InteractiveCatalogImage';

const TABS = [
  { id: 'all', label: 'All Eyewear', icon: 'grid' },
  { id: 'classic', label: 'Classic Collection', category: 'eye-glasses' },
  { id: 'premium', label: 'Premium Haute', isPremium: true },
  { id: 'blue-light', label: 'Computer BluCut', category: 'blue-light' },
  { id: 'sun-glass', label: 'Sun Polarized', category: 'sun-glass' }
];

const SHAPES = ['All Shapes', 'Aviator', 'Wayfarer', 'Square', 'Rectangle', 'Round', 'Geometric'];
const SIZES = ['All Sizes', 'Narrow (S)', 'Medium (M)', 'Wide (L)'];
const GENDERS = ['All', 'Unisex', 'Men', 'Women'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialCategory);
  
  // Filter states
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedShape, setSelectedShape] = useState('All Shapes');
  const [selectedSize, setSelectedSize] = useState('All Sizes');
  const [priceMax, setPriceMax] = useState(7000);
  const [tryIn3DOnly, setTryIn3DOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Accordion toggle states
  const [priceOpen, setPriceOpen] = useState(true);
  const [genderOpen, setGenderOpen] = useState(true);
  const [shapeOpen, setShapeOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);

  // Modals & Active items
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [addedProductId, setAddedProductId] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chasma_wishlist') || '[]');
    } catch {
      return [];
    }
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState({});

  const { addToCart } = useCart();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveTab(cat);
    const search = searchParams.get('search');
    if (search) setSearchTerm(search);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/products?`;
    if (activeTab && activeTab !== 'all' && activeTab !== 'classic' && activeTab !== 'premium') {
      url += `category=${encodeURIComponent(activeTab)}&`;
    }
    if (searchTerm) {
      url += `search=${encodeURIComponent(searchTerm)}&`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, [activeTab, searchTerm]);

  // Wishlist toggle
  const toggleWishlist = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (wishlist.includes(productId)) {
      updated = wishlist.filter(id => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    localStorage.setItem('chasma_wishlist', JSON.stringify(updated));
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1600);
  };

  const handleCopyCoupon = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleResetFilters = () => {
    setSelectedGender('All');
    setSelectedShape('All Shapes');
    setSelectedSize('All Sizes');
    setPriceMax(7000);
    setTryIn3DOnly(false);
    setSortBy('recommended');
    setSearchTerm('');
    setActiveTab('all');
    setSearchParams({});
  };

  // Helper to determine shape from product name/specs
  const getProductShape = (product) => {
    const text = (product.name + ' ' + (product.description || '')).toLowerCase();
    if (text.includes('aviator')) return 'Aviator';
    if (text.includes('wayfarer')) return 'Wayfarer';
    if (text.includes('square')) return 'Square';
    if (text.includes('rectangle')) return 'Rectangle';
    if (text.includes('round')) return 'Round';
    if (text.includes('geometric') || text.includes('hex')) return 'Geometric';
    return 'Wayfarer';
  };

  // Helper to determine size
  const getProductSize = (product) => {
    const fit = product.specs?.Fit || '';
    if (fit.toLowerCase().includes('narrow') || fit.toLowerCase().includes('small')) return 'Narrow (S)';
    if (fit.toLowerCase().includes('wide') || fit.toLowerCase().includes('large')) return 'Wide (L)';
    return 'Medium (M)';
  };

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Tab filter for classic / premium
      if (activeTab === 'classic' && product.category !== 'Eye Glasses') return false;
      if (activeTab === 'premium' && product.price < 3000) return false;

      // Price filter
      if (product.price > priceMax) return false;

      // Gender filter
      if (selectedGender !== 'All') {
        if (selectedGender === 'Unisex' && product.gender !== 'Unisex') return false;
        if (selectedGender === 'Men' && product.gender !== 'Men' && product.gender !== 'Unisex') return false;
        if (selectedGender === 'Women' && product.gender !== 'Women' && product.gender !== 'Unisex') return false;
      }

      // Shape filter
      if (selectedShape !== 'All Shapes') {
        if (getProductShape(product) !== selectedShape) return false;
      }

      // Size filter
      if (selectedSize !== 'All Sizes') {
        if (getProductSize(product) !== selectedSize) return false;
      }

      // 3D Try-On filter
      if (tryIn3DOnly) {
        // High quality models with 3D capability
        return true;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return b.id - a.id;
      return 0; // recommended
    });
  }, [products, activeTab, priceMax, selectedGender, selectedShape, selectedSize, tryIn3DOnly, sortBy]);

  // Color options per frame style
  const COLOR_PALETTES = [
    { name: 'Matte Black', hex: '#1c1917' },
    { name: 'Tortoise Brown', hex: '#78350f' },
    { name: 'Champagne Gold', hex: '#d97706' },
    { name: 'Gunmetal Slate', hex: '#475569' }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-gray-900 pb-28">
      
      {/* 1. LENSKART STYLE SUB-HEADER TABS BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-14 md:top-20 z-30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto scrollbar-hide py-2.5 gap-2">
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'all') {
                      searchParams.delete('category');
                    } else if (tab.category) {
                      searchParams.set('category', tab.category);
                    }
                    setSearchParams(searchParams);
                  }}
                  className={`px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive 
                      ? 'bg-black text-white shadow-md' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black border border-gray-200/60'
                  }`}
                >
                  {tab.id === 'all' && <Glasses size={14} />}
                  {tab.isPremium && <Sparkles size={13} className="text-amber-400" />}
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-neutral-500 flex-shrink-0 font-mono">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 font-bold border border-neutral-200 text-[10px] uppercase tracking-wider">
              100% Genuine Optics
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 font-bold border border-neutral-200 text-[10px] uppercase tracking-wider">
              Standard Lenses Included
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CATALOG BODY: LEFT FILTERS SIDEBAR + RIGHT PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Mobile Filter Toggle & Quick Bar */}
        <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 mb-6 shadow-sm">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 py-2.5 px-4 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
          >
            <Filter size={15} />
            <span>Filters &amp; Sort ({filteredProducts.length})</span>
          </button>

          {/* Quick 3D Try-On Switch */}
          <button
            onClick={() => setTryIn3DOnly(!tryIn3DOnly)}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              tryIn3DOnly 
                ? 'bg-black text-white border-black shadow-md' 
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <Camera size={14} />
            <span>3D Try-On</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================
              LEFT COLUMN (3 COLS): LENSKART STICKY FILTER SIDEBAR
             ======================================================== */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36 space-y-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            
            {/* Header / Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-black" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-black">Refine Frames</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            </div>

            {/* 1. Sort By Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 outline-none hover:border-black transition-colors cursor-pointer pr-8"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating ★</option>
                  <option value="newest">New Arrivals</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 2. Try in 3D Switch Toggle */}
            <div className="p-3.5 rounded-2xl bg-neutral-100 border border-neutral-200/80 text-neutral-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Camera size={14} />
                </div>
                <div>
                  <span className="font-bold text-xs text-neutral-950 block">Try in 3D</span>
                  <span className="text-[10px] text-neutral-500">Virtual Face Fitting</span>
                </div>
              </div>

              {/* Animated Switch */}
              <button
                onClick={() => setTryIn3DOnly(!tryIn3DOnly)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  tryIn3DOnly ? 'bg-black' : 'bg-neutral-300'
                }`}
              >
                <motion.div
                  animate={{ x: tryIn3DOnly ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-5 h-5 rounded-full bg-white shadow-md"
                />
              </button>
            </div>

            {/* 3. Price Filter Accordion */}
            <div className="border-t border-gray-100 pt-3.5">
              <button
                onClick={() => setPriceOpen(!priceOpen)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-800 mb-2"
              >
                <span>Price (INR)</span>
                {priceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {priceOpen && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-mono">₹1,000</span>
                    <span className="font-bold text-black font-mono px-2 py-0.5 bg-gray-100 rounded-lg">
                      Up to ₹{priceMax.toLocaleString('en-IN')}
                    </span>
                    <span className="text-gray-400 font-mono">₹7,000</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="7000"
                    step="250"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                  {/* Quick price chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { label: '< ₹2,000', val: 2000 },
                      { label: '< ₹3,500', val: 3500 },
                      { label: 'All', val: 7000 }
                    ].map(chip => (
                      <button
                        key={chip.label}
                        onClick={() => setPriceMax(chip.val)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          priceMax === chip.val
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-black'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Gender Filter Accordion */}
            <div className="border-t border-gray-100 pt-3.5">
              <button
                onClick={() => setGenderOpen(!genderOpen)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-800 mb-2"
              >
                <span>Gender</span>
                {genderOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {genderOpen && (
                <div className="space-y-1 pt-1">
                  {GENDERS.map(g => {
                    const count = g === 'All' 
                      ? products.length 
                      : products.filter(p => p.gender === g || (g !== 'Unisex' && p.gender === 'Unisex')).length;
                    const isChecked = selectedGender === g;

                    return (
                      <label
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className={isChecked ? 'font-bold text-black' : 'text-gray-700'}>{g}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">{count}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Frame Shape Accordion */}
            <div className="border-t border-gray-100 pt-3.5">
              <button
                onClick={() => setShapeOpen(!shapeOpen)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-800 mb-2"
              >
                <span>Frame Shape</span>
                {shapeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {shapeOpen && (
                <div className="space-y-1 pt-1 max-h-48 overflow-y-auto scrollbar-hide">
                  {SHAPES.map(s => {
                    const isChecked = selectedShape === s;
                    return (
                      <label
                        key={s}
                        onClick={() => setSelectedShape(s)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className={isChecked ? 'font-bold text-black' : 'text-gray-700'}>{s}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Frame Size Accordion */}
            <div className="border-t border-gray-100 pt-3.5">
              <button
                onClick={() => setSizeOpen(!sizeOpen)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-800 mb-2"
              >
                <span>Frame Size</span>
                {sizeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {sizeOpen && (
                <div className="space-y-1 pt-1">
                  {SIZES.map(sz => {
                    const isChecked = selectedSize === sz;
                    return (
                      <label
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className={isChecked ? 'font-bold text-black' : 'text-gray-700'}>{sz}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

          </aside>

          {/* ========================================================
              RIGHT COLUMN (9 COLS): LENSKART / TITAN PRODUCT GRID
             ======================================================== */}
          <main className="lg:col-span-9">
            
            {/* Results Counter & Active Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                <span className="font-bold text-black">{filteredProducts.length}</span>
                <span>Eyewear Designs Found</span>
                
                {/* Active filter badges */}
                {selectedGender !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-black text-[11px] font-semibold">
                    {selectedGender}
                    <X size={12} className="cursor-pointer hover:text-rose-500" onClick={() => setSelectedGender('All')} />
                  </span>
                )}
                {selectedShape !== 'All Shapes' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-black text-[11px] font-semibold">
                    {selectedShape}
                    <X size={12} className="cursor-pointer hover:text-rose-500" onClick={() => setSelectedShape('All Shapes')} />
                  </span>
                )}
                {selectedSize !== 'All Sizes' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-black text-[11px] font-semibold">
                    {selectedSize}
                    <X size={12} className="cursor-pointer hover:text-rose-500" onClick={() => setSelectedSize('All Sizes')} />
                  </span>
                )}
                {priceMax < 7000 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-black text-[11px] font-semibold">
                    &le; ₹{priceMax.toLocaleString('en-IN')}
                    <X size={12} className="cursor-pointer hover:text-rose-500" onClick={() => setPriceMax(7000)} />
                  </span>
                )}
                {tryIn3DOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold border border-amber-200">
                    3D Try-On Only
                    <X size={12} className="cursor-pointer hover:text-black" onClick={() => setTryIn3DOnly(false)} />
                  </span>
                )}
              </div>

              {/* Desktop Sort indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                <span>Showing:</span>
                <span className="font-bold text-black capitalize">{sortBy.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-5 border border-gray-200 animate-pulse space-y-4">
                    <div className="aspect-[4/3] bg-gray-100 rounded-2xl" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-5 bg-gray-100 rounded w-3/4" />
                    <div className="h-8 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  const discountPct = product.originalPrice && product.originalPrice > product.price
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 33;
                  const shape = getProductShape(product);
                  const size = getProductSize(product);
                  const activeColor = selectedColors[product.id] || 0;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
                    >
                      {/* TOP BADGES ROW */}
                      <div className="absolute top-2 left-2 right-2 sm:top-3.5 sm:left-3.5 sm:right-3.5 z-20 flex items-center justify-between pointer-events-none">
                        {/* Rating Pill */}
                        <div className="pointer-events-auto inline-flex items-center gap-0.5 sm:gap-1 bg-white/95 backdrop-blur-md px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-slate-800 shadow-sm border border-slate-200/80">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span>{product.rating || 4.8}</span>
                        </div>

                        {/* Wishlist Heart Button */}
                        <button
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className="pointer-events-auto w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-rose-500 shadow-sm border border-gray-200/60 hover:scale-110 active:scale-95 transition-all"
                          title="Save to Wishlist"
                        >
                          <Heart
                            size={13}
                            className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}
                          />
                        </button>
                      </div>

                      {/* PRODUCT IMAGE CONTAINER: STUDIO MULTI-ANGLE HOVER SCRUB */}
                      <div className="relative aspect-square w-full overflow-hidden">
                        <Link to={`/product/${product.id}`} className="block w-full h-full">
                          <InteractiveCatalogImage
                            angles={product.angles || (product.images?.length > 1 ? product.images.map((img, i) => ({ url: img, angle: `${i * 45}°` })) : [
                              { url: product.image, angle: "0° Frontal" },
                              { url: product.images?.[0] || product.image, angle: "45° Angle" },
                              { url: product.images?.[1] || product.image, angle: "90° Profile" },
                              { url: product.images?.[2] || product.image, angle: "180° Folded" }
                            ])}
                            fallbackImage={product.image}
                            name={product.name}
                          />
                        </Link>

                        {/* Hover Quick Actions Pill (Try-On + Inspect) */}
                        <div className="hidden sm:flex absolute bottom-3 right-3 items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setTryOnProduct(product);
                            }}
                            className="px-2.5 py-1 bg-brand-black text-white font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-xs hover:bg-[#0f766e] transition-colors cursor-pointer"
                          >
                            <Camera size={10} />
                            <span>Try-On</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuickViewProduct(product);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-brand-cream text-brand-black font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-xs border border-brand-black/10 transition-colors cursor-pointer"
                          >
                            <Eye size={10} />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>

                      {/* PRODUCT DETAILS BODY */}
                      <div className="p-2.5 sm:p-5 flex flex-col flex-1 space-y-1.5 sm:space-y-3">
                        
                        {/* Swatches & Size Tag Row */}
                        <div className="flex items-center justify-between">
                          {/* Color Swatches */}
                          <div className="flex items-center gap-1">
                            {COLOR_PALETTES.slice(0, 3).map((swatch, idx) => (
                              <button
                                key={swatch.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedColors(prev => ({ ...prev, [product.id]: idx }));
                                }}
                                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border transition-all ${
                                  activeColor === idx
                                    ? 'ring-1 sm:ring-2 ring-black ring-offset-1 scale-110'
                                    : 'border-gray-300 hover:scale-105'
                                }`}
                                style={{ backgroundColor: swatch.hex }}
                                title={swatch.name}
                              />
                            ))}
                          </div>

                          {/* Size Pill */}
                          <span className="px-1.5 py-0.5 rounded border border-gray-200 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-50">
                            {size.includes('M') ? 'M' : size.includes('L') ? 'L' : 'S'}
                          </span>
                        </div>

                        {/* Brand & Model Name */}
                        <div>
                          <span className="text-[8px] sm:text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400 block mb-0.5 truncate">
                            {shape}
                          </span>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-bold text-xs sm:text-sm text-gray-950 line-clamp-1 sm:line-clamp-2 hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        {/* Price Row */}
                        <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 pt-0.5">
                          <span className="text-sm sm:text-lg font-black text-black font-mono">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                              ₹{product.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          <span className="text-[8px] sm:text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full">
                            {discountPct}% OFF
                          </span>
                        </div>

                        {/* LENSKART COUPON CALLOUT CONTAINER (Visible on Desktop) */}
                        <div 
                          onClick={(e) => handleCopyCoupon('SINGLE', e)}
                          className="hidden sm:flex p-2 rounded-xl bg-gray-50 hover:bg-neutral-100 border border-dashed border-neutral-300 hover:border-neutral-900 transition-colors items-center justify-between text-xs cursor-pointer group/coupon"
                          title="Click to copy promo code"
                        >
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-700">
                            <Tag size={12} className="text-slate-700 flex-shrink-0" />
                            <span>Code <strong className="text-slate-950 font-mono font-bold">SINGLE</strong></span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover/coupon:text-slate-900 flex-shrink-0">
                            {copiedCoupon === 'SINGLE' ? 'Copied ✓' : 'Copy'}
                          </span>
                        </div>

                        {/* ADD TO BAG BUTTON */}
                        <div className="pt-1 sm:pt-2 mt-auto">
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`w-full py-2 sm:py-3 px-2 sm:px-5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all duration-200 cursor-pointer ${
                              addedProductId === product.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-950 text-white hover:bg-slate-800'
                            }`}
                          >
                            {addedProductId === product.id ? (
                              <>
                                <Check size={12} className="text-white" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={12} />
                                <span>Add to Bag</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <Glasses size={40} className="mx-auto text-gray-300 mb-3" />
                <h3 className="font-serif text-2xl font-bold text-black mb-2">No Eyewear Matches Your Criteria</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  Try loosening your price limit, changing your frame shape, or clearing active filters to view our full collection.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </main>

        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 border border-gray-200"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-6 border border-gray-100">
                  <img
                    src={quickViewProduct.image}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 block">
                    {quickViewProduct.category} &bull; {quickViewProduct.gender}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-black leading-tight">
                    {quickViewProduct.name}
                  </h2>

                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor(quickViewProduct.rating || 5) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-700">{quickViewProduct.rating || 4.9}</span>
                    <span className="text-xs text-gray-400">({quickViewProduct.reviewsCount || 48} reviews)</span>
                  </div>

                  <p className="text-2xl font-black text-black font-mono pt-1">
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </p>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {quickViewProduct.description}
                  </p>

                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={(e) => {
                        handleAddToCart(quickViewProduct, e);
                        setQuickViewProduct(null);
                      }}
                      className="flex-1 py-3 px-5 bg-black text-white rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-neutral-800 transition-colors shadow-md"
                    >
                      Add To Cart
                    </button>
                    <Link
                      to={`/product/${quickViewProduct.id}`}
                      onClick={() => setQuickViewProduct(null)}
                      className="py-3 px-5 border border-gray-300 rounded-xl text-xs font-bold tracking-wider uppercase hover:border-black transition-colors"
                    >
                      Full Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIRTUAL 3D TRY-ON MODAL */}
      <VirtualTryOnModal
        product={tryOnProduct}
        isOpen={Boolean(tryOnProduct)}
        onClose={() => setTryOnProduct(null)}
      />

      {/* MOBILE FILTER SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm lg:hidden">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-4/5 max-w-sm bg-white h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-black" />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-black">Filters</h3>
                  </div>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 text-gray-400 hover:text-black">
                    <X size={20} />
                  </button>
                </div>

                {/* Sort in Mobile Drawer */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-semibold text-gray-900"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating ★</option>
                    <option value="newest">New Arrivals</option>
                  </select>
                </div>

                {/* Price in Mobile Drawer */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold uppercase tracking-wider text-gray-500">Max Price</span>
                    <span className="font-mono font-bold text-black">₹{priceMax.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="7000"
                    step="250"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-black"
                  />
                </div>

                {/* Gender in Mobile Drawer */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Gender</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GENDERS.map(g => (
                      <button
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                          selectedGender === g
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shape in Mobile Drawer */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Shape</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SHAPES.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedShape(s)}
                        className={`p-2 rounded-xl text-xs font-bold border truncate transition-colors ${
                          selectedShape === s
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply / Reset in Mobile Drawer */}
              <div className="pt-6 border-t border-gray-200 flex items-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Apply ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
