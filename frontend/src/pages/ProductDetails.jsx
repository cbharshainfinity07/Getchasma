import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Check, 
  Camera, 
  Layers, 
  Ruler, 
  Sparkles,
  Phone,
  Share2,
  Heart,
  Tag,
  Copy,
  Info,
  ChevronRight,
  Eye,
  Glasses
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';

// Studio & Inspection Modals
import EyewearInspector from '../components/product/EyewearInspector';
import VirtualTryOnModal from '../components/product/VirtualTryOnModal';
import LensCustomizerModal from '../components/product/LensCustomizerModal';
import SizeGuideModal from '../components/product/SizeGuideModal';
import FrameDimensionCaliper from '../components/product/FrameDimensionCaliper';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  // Selection states
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [selectedAngleIdx, setSelectedAngleIdx] = useState(0);
  const [galleryMode, setGalleryMode] = useState('grid'); // 'grid' (Titan 2x2) | 'strip' (Lenskart strip) | 'studio' (360 inspector)

  // Delivery checker & Progressive disclosure
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [showDeliveryInput, setShowDeliveryInput] = useState(false);
  const [activeSpecTab, setActiveSpecTab] = useState('specs'); // 'specs' | 'dimensions' | 'care'

  // Offers & Copy
  const [copiedCode, setCopiedCode] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Modals
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Sticky bottom bar trigger on scroll
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buySectionRef = useRef(null);

  // Colors available for the frame
  const COLOR_OPTIONS = [
    { name: 'Matte Black', hex: '#18181b', temple: 'Matte Black' },
    { name: 'Tortoise Amber', hex: '#78350f', temple: 'Tortoise Gold' },
    { name: 'Champagne Gold', hex: '#d97706', temple: 'Polished Gold' },
    { name: 'Midnight Navy', hex: '#1e293b', temple: 'Navy Gunmetal' }
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setQuantity(1);
        setLoading(false);

        // Check wishlist
        try {
          const savedWishlist = JSON.parse(localStorage.getItem('chasma_wishlist') || '[]');
          setIsWishlisted(savedWishlist.includes(data.id));
        } catch {}

        // Fetch related products
        fetch(`${API_BASE_URL}/api/products?category=${encodeURIComponent(data.category)}`)
          .then(res => res.json())
          .then(related => {
            setRelatedProducts(related.filter(item => item.id !== data.id).slice(0, 4));
          })
          .catch(() => {});
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setLoading(false);
      });
  }, [id]);

  // Scroll listener for sticky purchase bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const savedWishlist = JSON.parse(localStorage.getItem('chasma_wishlist') || '[]');
      let updated;
      if (savedWishlist.includes(product.id)) {
        updated = savedWishlist.filter(item => item !== product.id);
        setIsWishlisted(false);
      } else {
        updated = [...savedWishlist, product.id];
        setIsWishlisted(true);
      }
      localStorage.setItem('chasma_wishlist', JSON.stringify(updated));
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on GetChasma`,
          url: window.location.href
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handleCopyOffer = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCheckDelivery = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length < 6) return;
    setCheckingPincode(true);
    setTimeout(() => {
      setCheckingPincode(false);
      // Calculate estimated delivery date: 3-4 days from today
      const today = new Date();
      const estDate = new Date(today);
      estDate.setDate(today.getDate() + 3);
      const formattedDate = estDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      setDeliveryResult({
        pincode,
        date: formattedDate,
        freeShipping: true,
        codAvailable: true
      });
    }, 600);
  };

  const handleQuickAdd = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      selectedColor: COLOR_OPTIONS[selectedColorIdx].name,
      selectedSize: selectedSize
    }, quantity);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleCustomLensAdd = (customItem) => {
    addToCart({
      ...customItem,
      selectedColor: COLOR_OPTIONS[selectedColorIdx].name,
      selectedSize: selectedSize
    }, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 px-6 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Calibrating Optical Specifications &amp; Multi-Angle Photos...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-24 px-6 max-w-7xl mx-auto text-center py-20">
        <Glasses size={48} className="mx-auto text-gray-300 mb-3" />
        <h2 className="font-serif text-3xl font-bold mb-4">Eyewear Model Not Found</h2>
        <p className="text-gray-500 mb-8">The requested frame design could not be found in our collection.</p>
        <Link to="/shop" className="px-6 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Derive shape and specs
  const productName = product.name;
  const productPrice = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : Math.round(productPrice * 1.45);
  const discountPct = Math.round(((originalPrice - productPrice) / originalPrice) * 100);
  const sku = `FT${product.id}721MFP1${COLOR_OPTIONS[selectedColorIdx].name.charAt(0)}KCGV | 51`;
  const frameDimensions = {
    lensWidth: product?.dimensions?.lensWidth || product?.specs?.LensWidth || 51,
    bridgeWidth: product?.dimensions?.bridgeWidth || product?.specs?.BridgeWidth || 19,
    templeLength: product?.dimensions?.templeLength || product?.specs?.TempleLength || 148
  };

  // Multi-angle photo collection
  const multiAngles = [
    { label: 'Front Angle', url: product.image, angle: '0°' },
    { label: '3/4 Perspective', url: product.images?.[1] || product.image, angle: '45°' },
    { label: 'Side Temple Profile', url: product.images?.[0] || product.image, angle: '90°' },
    { label: 'Inside Rim View', url: product.images?.[1] || product.image, angle: '180°' }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-36">
      
      {/* 1. TOP BREADCRUMB & UTILITY BAR */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
          <nav className="flex items-center gap-1.5 text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-400" />
            <Link to="/shop" className="hover:text-black transition-colors">Eyewear</Link>
            <ChevronRight size={12} className="text-gray-400" />
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-black transition-colors">
              {product.category}
            </Link>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="text-gray-400">{product.gender}</span>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="text-black font-semibold truncate max-w-[200px]">{product.name}</span>
          </nav>

          <button 
            onClick={() => navigate(-1)}
            className="hidden sm:flex items-center gap-1 text-gray-500 hover:text-black font-bold uppercase tracking-wider text-[11px] transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8" ref={buySectionRef}>
        
        {/* TOP SECTION: LEFT MULTI-ANGLE GALLERY + RIGHT BUY DOSSIER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ========================================================
              LEFT COLUMN (7 COLS): TITAN / LENSKART MULTI-ANGLE STUDIO
             ======================================================== */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* View Mode Switcher + 3D Try-On Launch */}
            <div className="flex items-center justify-between gap-2 pb-2">
              {/* Mode Toggle Chips */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/80 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setGalleryMode('grid')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                    galleryMode === 'grid' 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <span className="hidden sm:inline">2x2 Studio Grid</span>
                  <span className="sm:hidden">Studio</span>
                </button>
                <button
                  onClick={() => setGalleryMode('strip')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                    galleryMode === 'strip' 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <span className="hidden sm:inline">Focus Strip</span>
                  <span className="sm:hidden">Focus</span>
                </button>
                <button
                  onClick={() => setGalleryMode('studio')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                    galleryMode === 'studio' 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <span>360°</span>
                </button>
              </div>

              {/* 3D Try-On Trigger Button */}
              <button
                onClick={() => setTryOnOpen(true)}
                className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-950 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                <Camera size={13} />
                <span>3D Try-On</span>
              </button>
            </div>

            {/* VIEW MODE 1: TITAN EYEPLUS MULTI-ANGLE STUDIO */}
            {galleryMode === 'grid' && (
              <>
                {/* Mobile View (< sm): Single Stage + Compact Thumbnails */}
                <div className="block sm:hidden space-y-2.5">
                  <div className="relative aspect-[4/3] max-h-[260px] bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm flex items-center justify-center overflow-hidden">
                    {/* Angle Chip */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                        {multiAngles[selectedAngleIdx].label}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-gray-200 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                      <span>{product.rating || 4.9}</span>
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                    </div>

                    <img
                      src={multiAngles[selectedAngleIdx].url}
                      alt={product.name}
                      className="w-full h-full max-h-[220px] object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Mobile Thumbnail Selector Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {multiAngles.map((angle, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAngleIdx(idx)}
                        className={`flex-1 min-w-[60px] py-1.5 px-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          selectedAngleIdx === idx
                            ? 'border-slate-950 bg-slate-50 ring-1 ring-slate-950'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <img src={angle.url} alt={angle.label} className="w-8 h-6 object-contain mix-blend-multiply" />
                        <span className="text-[8px] font-mono font-bold text-slate-600 truncate max-w-[54px]">{angle.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop View (>= sm): 2x2 Multi-Angle Studio Grid */}
                <div className="hidden sm:grid sm:grid-cols-2 gap-3.5">
                  {multiAngles.map((angle, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedAngleIdx(idx);
                        setGalleryMode('strip');
                      }}
                      className="group relative aspect-[4/3] bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm hover:shadow-md transition-all cursor-zoom-in flex items-center justify-center overflow-hidden"
                    >
                      {/* Corner Tag on First View (Titan Eyeplus 'New' badge) */}
                      {idx === 0 && (
                        <div className="absolute top-3.5 left-3.5 z-10">
                          <span className="bg-slate-950 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
                            NEW
                          </span>
                        </div>
                      )}

                      {/* Angle Chip */}
                      <div className="absolute bottom-3 right-3.5 z-10">
                        <span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-black bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200 transition-colors">
                          {angle.label}
                        </span>
                      </div>

                      <img
                        src={angle.url}
                        alt={`${product.name} ${angle.label}`}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-500 ease-out"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* VIEW MODE 2: LENSKART VERTICAL THUMBNAIL STRIP + LARGE VIEW */}
            {galleryMode === 'strip' && (
              <div className="flex flex-col-reverse sm:flex-row gap-4">
                {/* Vertical Thumbnails */}
                <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto scrollbar-hide flex-shrink-0">
                  {multiAngles.map((angle, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAngleIdx(idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 border transition-all flex-shrink-0 flex items-center justify-center overflow-hidden ${
                        selectedAngleIdx === idx
                          ? 'border-black ring-2 ring-black/10 shadow-sm'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={angle.url}
                        alt={angle.label}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>

                {/* Big Main Stage View */}
                <div className="relative flex-1 aspect-[4/3] sm:aspect-auto sm:min-h-[440px] bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                  {/* Rating Chip (Lenskart signature: 4.9 ★ 191) */}
                  <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-gray-200 text-xs font-extrabold flex items-center gap-1 shadow-sm">
                    <span>{product.rating || 4.9}</span>
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="text-gray-400 font-normal">({product.reviewsCount || 191})</span>
                  </div>

                  <img
                    src={multiAngles[selectedAngleIdx].url}
                    alt={product.name}
                    className="w-full h-full max-h-[380px] object-contain mix-blend-multiply hover:scale-110 transition-transform duration-500 cursor-zoom-in"
                  />

                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100/90 px-3 py-1 rounded-full border border-gray-200">
                      {multiAngles[selectedAngleIdx].label}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 3: 360° STUDIO SIMULATOR */}
            {galleryMode === 'studio' && (
              <EyewearInspector product={product} />
            )}

          </div>

          {/* ========================================================
              RIGHT COLUMN (5 COLS): TITAN & LENSKART BUY DOSSIER
             ======================================================== */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
            
            {/* 1. TOP ACTION CHIPS (Titan Eyeplus signature) */}
            <div className="grid grid-cols-2 gap-2.5 pb-2">
              <button
                onClick={() => {
                  const el = document.getElementById('delivery-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-2.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-full flex items-center justify-center gap-2 text-xs font-bold text-blue-900 transition-all shadow-sm active:scale-95"
              >
                <Truck size={15} className="text-neutral-900" />
                <span>Check Delivery</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('similar-frames-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-2.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-full flex items-center justify-center gap-2 text-xs font-bold text-blue-900 transition-all shadow-sm active:scale-95"
              >
                <Layers size={15} className="text-neutral-900" />
                <span>View Similar</span>
              </button>
            </div>

            {/* 2. BRAND, TITLE & SIZE ROW */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-extrabold uppercase tracking-wider text-black">
                  GetChasma Signature
                </span>
                <span className="text-xs font-bold text-gray-500">
                  Size: <strong className="text-black font-semibold">{selectedSize}</strong>
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 mb-1.5">
                {product.name}
              </h1>

              {/* Bespoke Millimeter Caliper Component (Box Measurement System) */}
              <FrameDimensionCaliper dimensions={frameDimensions} />

              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                {product.description || 'Premium handcrafted eyewear built with aerospace grade durability and zero-strain optics.'}
              </p>
            </div>

            {/* 3. SOCIAL PROOF BADGE */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                PURCHASED BY 168+ THIS WEEK
              </span>
            </div>

            {/* 4. PRICE & SAVINGS BLOCK WITH SHARE/WISHLIST */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-black font-mono">
                    ₹{productPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gray-400 line-through font-mono">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {discountPct}% OFF
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Inclusive of all taxes &amp; standard lenses
                </span>
              </div>

              {/* Share & Wishlist action icons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-600 hover:text-black transition-colors relative"
                  title="Share Eyewear"
                >
                  <Share2 size={17} />
                  {shareSuccess && (
                    <span className="absolute -top-7 right-0 text-[10px] bg-black text-white px-2 py-0.5 rounded-md whitespace-nowrap">
                      Link Copied!
                    </span>
                  )}
                </button>

                <button
                  onClick={toggleWishlist}
                  className="w-10 h-10 rounded-full border border-gray-200 hover:border-rose-400 flex items-center justify-center transition-colors"
                  title="Save to Wishlist"
                >
                  <Heart
                    size={18}
                    className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600 hover:text-rose-500'}
                  />
                </button>
              </div>
            </div>

            {/* 5. PRODUCT OFFERS CARD */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-600 block mb-1">
                PRODUCT OFFERS
              </span>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-neutral-950">
                    Flat ₹500 Off with code <span className="font-mono text-black font-extrabold">ATELIER500</span>
                  </p>
                  <p className="text-[11px] text-neutral-500">Applicable on prepaid cards, UPI &amp; NetBanking</p>
                </div>
                <button
                  onClick={() => handleCopyOffer('ATELIER500')}
                  className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm active:scale-95 cursor-pointer"
                >
                  {copiedCode === 'ATELIER500' ? (
                    <>
                      <Check size={12} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 6. FRAME COLOR SWATCHES SELECTOR */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Frame Color: <strong className="text-black">{COLOR_OPTIONS[selectedColorIdx].name}</strong>
              </label>
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map((col, idx) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`group flex items-center gap-1.5 p-1 rounded-full transition-all ${
                      selectedColorIdx === idx
                        ? 'ring-2 ring-black ring-offset-2 scale-105'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    title={col.name}
                  >
                    <span
                      className="w-7 h-7 rounded-full border border-gray-300 shadow-inner block"
                      style={{ backgroundColor: col.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 7. FRAME SIZE SELECTOR WITH SIZE GUIDE LINK */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700">
                  Frame Size: <strong className="text-black">{selectedSize}</strong>
                </label>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-bold text-neutral-900 hover:text-neutral-950 underline flex items-center gap-1"
                >
                  <Ruler size={13} />
                  Size Guide
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {['Narrow (S)', 'Medium (M)', 'Wide (L)'].map((sz) => {
                  const isSelected = selectedSize.startsWith(sz.split(' ')[0]);
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz.split(' ')[0])}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 8. DUAL CTAs: ADD TO CART & ADD POWER (PRESCRIPTION) */}
            <div className="space-y-3 pt-2">
              
              {/* PRIMARY CTA: LUXURY SOLID BLACK PILL */}
              <button
                onClick={handleQuickAdd}
                className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer ${
                  isAdded 
                    ? 'bg-emerald-600 text-white shadow-emerald-200' 
                    : 'bg-black hover:bg-neutral-800 text-white shadow-md'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={18} />
                    <span>Added to Bag Successfully</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Cart &bull; ₹{productPrice.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              {/* SECONDARY CTA: CLEAN BORDER PILL */}
              <button
                onClick={() => setCustomizerOpen(true)}
                className="w-full py-3.5 rounded-full border-2 border-black hover:bg-black hover:text-white text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 shadow-sm active:scale-95 group cursor-pointer"
              >
                <Sparkles size={16} className="text-neutral-600 group-hover:text-white group-hover:rotate-12 transition-transform" />
                <span>Add Power / Select Prescription Lenses</span>
              </button>

            </div>

            {/* 9. PROGRESSIVE DISCLOSURE: PINCODE DELIVERY ESTIMATOR */}
            <div id="delivery-section" className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowDeliveryInput(!showDeliveryInput)}
                  className="text-xs font-bold text-gray-800 hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Truck size={14} className="text-gray-500" />
                  <span>Check Estimated Delivery Date</span>
                  <span className="text-[10px] text-neutral-400 font-mono underline ml-1">
                    {showDeliveryInput ? '(Hide)' : '(Calculate)'}
                  </span>
                </button>

                {deliveryResult && !showDeliveryInput && (
                  <span className="text-[11px] font-mono font-bold text-emerald-700">
                    By {deliveryResult.date}
                  </span>
                )}
              </div>

              {(showDeliveryInput || deliveryResult) && (
                <div className="mt-2.5 space-y-2">
                  <form onSubmit={handleCheckDelivery} className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit Pincode (e.g. 560001)"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 outline-none focus:border-black transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={pincode.length < 6 || checkingPincode}
                      className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {checkingPincode ? 'Checking...' : 'Check'}
                    </button>
                  </form>

                  {deliveryResult && (
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                      <Check size={15} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[11px]">
                          ⚡ Expected Delivery by {deliveryResult.date}
                        </span>
                        <span className="text-[10px] text-emerald-800 block">
                          Free Express Shipping &bull; COD Available &bull; Optical Lab QC Inspected
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 10. WHATSAPP OPTICIAN ASSISTANCE STRIP */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/60 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-emerald-700 flex-shrink-0" />
                <div>
                  <span className="font-bold block text-[11px]">Need Prescription Assistance?</span>
                  <span className="text-[10px] text-emerald-800">Send your power slip on WhatsApp for verification</span>
                </div>
              </div>
              <a
                href="https://wa.me/919740310101"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm"
              >
                Chat Now
              </a>
            </div>

            {/* 11. TRUST GUARANTEES */}
            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center text-xs text-gray-500">
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <ShieldCheck size={18} className="mx-auto text-black mb-1" />
                <span className="font-bold text-black text-[11px] block">1-Yr Warranty</span>
                <span className="text-[10px] text-gray-400">Frame &amp; Hinge</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <Truck size={18} className="mx-auto text-black mb-1" />
                <span className="font-bold text-black text-[11px] block">Free Delivery</span>
                <span className="text-[10px] text-gray-400">Express Air Shipping</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <RotateCcw size={18} className="mx-auto text-black mb-1" />
                <span className="font-bold text-black text-[11px] block">30-Day Returns</span>
                <span className="text-[10px] text-gray-400">Instant Approval</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================
            TITAN EYEPLUS BOTTOM SECTION: FRAME DIMENSIONS & SPECS
            (As seen in user screenshot media_1789048121798.png)
           ======================================================== */}
        {/* ========================================================
            PROGRESSIVE DISCLOSURE: SPECIFICATIONS & MEASUREMENTS HUB
           ======================================================== */}
        <div className="mt-14 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs">
          
          {/* Progressive Disclosure Navigation Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-neutral-100">
            <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-2xl">
              {[
                { id: 'specs', label: 'Technical Specs' },
                { id: 'dimensions', label: 'Frame Dimensions' },
                { id: 'care', label: 'Optics & Warranty' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSpecTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeSpecTab === tab.id
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-neutral-400">
              ATELIER // CERTIFIED QC
            </span>
          </div>

          {/* TAB 1: TECHNICAL SPECS */}
          {activeSpecTab === 'specs' && (
            <div className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">SKU</span>
                  <span className="font-mono font-bold text-neutral-950 break-all">{sku}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">Brand</span>
                  <span className="font-bold text-neutral-950">GetChasma Atelier</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">Gender</span>
                  <span className="font-bold text-neutral-950">{product.gender || 'Unisex'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">Frame Fit</span>
                  <span className="font-bold text-neutral-950">{selectedSize}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">Colorway</span>
                  <span className="font-bold text-neutral-950">{COLOR_OPTIONS[selectedColorIdx].name}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">Temple Material</span>
                  <span className="font-bold text-neutral-950">{COLOR_OPTIONS[selectedColorIdx].temple}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">Composition</span>
                  <span className="font-bold text-neutral-950">{product.specs?.['Frame Material'] || 'Aerospace Grade-1 Titanium'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">Silhouette</span>
                  <span className="font-bold text-neutral-950">Geometric Aviator / Wayfarer</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">Hinge Design</span>
                  <span className="font-bold text-neutral-950">German 5-Barrel Screws</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] font-mono uppercase tracking-wider">Origin</span>
                  <span className="font-bold text-neutral-950">Handcrafted in India</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FRAME DIMENSIONS & SCHEMATICS */}
          {activeSpecTab === 'dimensions' && (
            <div className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Precision schematics engineered for comfortable Indian facial contours.
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-bold text-neutral-950 underline cursor-pointer"
                >
                  Interactive Size Guide &rarr;
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-3">
                  <svg viewBox="0 0 100 40" className="w-12 h-8 stroke-neutral-900 fill-none flex-shrink-0">
                    <path d="M 10 15 L 75 15 Q 90 15 85 35" strokeWidth="3" strokeLinecap="round" />
                    <line x1="10" y1="5" x2="85" y2="5" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="2 2" />
                  </svg>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Temple</span>
                    <span className="text-base font-bold font-mono text-neutral-950">148 mm</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-3">
                  <svg viewBox="0 0 100 40" className="w-12 h-8 stroke-neutral-400 fill-none flex-shrink-0">
                    <rect x="10" y="10" width="30" height="22" rx="6" strokeWidth="2" />
                    <rect x="60" y="10" width="30" height="22" rx="6" strokeWidth="2" />
                    <path d="M 40 18 Q 50 12 60 18" stroke="#18181b" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Bridge</span>
                    <span className="text-base font-bold font-mono text-neutral-950">18 mm</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-3">
                  <svg viewBox="0 0 100 40" className="w-12 h-8 stroke-neutral-400 fill-none flex-shrink-0">
                    <rect x="25" y="8" width="50" height="26" rx="8" stroke="#18181b" strokeWidth="3" />
                    <line x1="25" y1="37" x2="75" y2="37" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="2 2" />
                  </svg>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Lens Width</span>
                    <span className="text-base font-bold font-mono text-neutral-950">51 mm</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-3">
                  <svg viewBox="0 0 100 40" className="w-12 h-8 stroke-neutral-400 fill-none flex-shrink-0">
                    <rect x="30" y="8" width="40" height="26" rx="8" strokeWidth="2" />
                    <line x1="80" y1="8" x2="80" y2="34" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Lens Height</span>
                    <span className="text-base font-bold font-mono text-neutral-950">43 mm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPTICS & WARRANTY */}
          {activeSpecTab === 'care' && (
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                  365-DAY ATELIER WARRANTY
                </span>
                <p className="text-neutral-600 leading-relaxed">
                  Complimentary repair or direct replacement for structural hinge fractures, solder failures, and manufacturing anomalies.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                  ZEISS COATING CALIBRATION
                </span>
                <p className="text-neutral-600 leading-relaxed">
                  Clean lenses exclusively with microfiber cloth. Rinse with lukewarm water before wiping to preserve anti-reflective coatings.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                  COMPLIMENTARY TUNE-UPS
                </span>
                <p className="text-neutral-600 leading-relaxed">
                  Lifetime free ultrasonic sanitization, screw tightening, and nose-pad replacements at any GetChasma flagship atelier.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* RELATED / SIMILAR FRAMES SECTION */}
        {relatedProducts.length > 0 && (
          <div id="similar-frames-section" className="mt-16 pt-10 border-t border-gray-200">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                  Curated Collection
                </span>
                <h2 className="font-serif text-2xl font-bold text-black">
                  Similar Styles in {product.category}
                </h2>
              </div>
              <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-xs font-bold uppercase tracking-wider text-black hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/product/${rel.id}`}
                  className="group bg-white rounded-3xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#fbfbfb] rounded-2xl mb-3 p-4 flex items-center justify-center overflow-hidden border border-gray-100">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    {rel.category}
                  </span>
                  <h4 className="font-bold text-sm text-gray-950 mb-1 group-hover:text-neutral-700 truncate">
                    {rel.name}
                  </h4>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <span className="font-black text-black font-mono text-sm">
                      ₹{Number(rel.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-neutral-900 group-hover:underline">
                      Inspect &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          TITAN EYEPLUS SIGNATURE STICKY BOTTOM BAR ON SCROLL
          (As seen in user screenshot media_1789048121798.png)
         ======================================================== */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-3 px-4 sm:px-8 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              {/* Left: Frame Name & Subtitle */}
              <div className="min-w-0 flex-1 hidden sm:block">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-950 truncate">
                  {product.name}
                </h4>
                <p className="text-[11px] text-gray-500 truncate">
                  {product.category} &bull; {selectedSize} Size &bull; {COLOR_OPTIONS[selectedColorIdx].name}
                </p>
              </div>

              {/* Price */}
              <div className="text-left sm:text-right flex-shrink-0">
                <span className="text-lg sm:text-xl font-black text-black font-mono block">
                  ₹{productPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block sm:hidden">
                  Free Delivery
                </span>
              </div>

              {/* Right: Wishlist + Add to Cart Pill Button */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  onClick={toggleWishlist}
                  className="w-11 h-11 rounded-full border border-gray-300 hover:border-black flex items-center justify-center transition-colors"
                  title="Wishlist"
                >
                  <Heart
                    size={18}
                    className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-700'}
                  />
                </button>

                <button
                  onClick={handleQuickAdd}
                  className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  {isAdded ? (
                    <>
                      <Check size={15} /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={15} /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <VirtualTryOnModal
        product={product}
        isOpen={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
      />

      <LensCustomizerModal
        product={product}
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        onAddToCart={handleCustomLensAdd}
      />

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

    </div>
  );
}
