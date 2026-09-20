import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Truck, 
  ShoppingBag, 
  Check, 
  Camera, 
  Ruler, 
  Sparkles, 
  Phone, 
  Share2, 
  Heart, 
  Glasses 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';

// Studio & Inspection Modals
import VirtualTryOnModal from '../components/product/VirtualTryOnModal';
import SizeGuideModal from '../components/product/SizeGuideModal';
import FrameDimensionCaliper from '../components/product/FrameDimensionCaliper';
import PrescriptionConfigDrawer from '../components/product/PrescriptionConfigDrawer';
import OpticalBlueprint from '../components/product/OpticalBlueprint';

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
  const COLOR_OPTIONS = [
    { name: 'Matte Black', hex: '#18181b', temple: 'Matte Black' },
    { name: 'Tortoise Amber', hex: '#78350f', temple: 'Tortoise Gold' },
    { name: 'Champagne Gold', hex: '#d97706', temple: 'Polished Gold' },
    { name: 'Midnight Navy', hex: '#1e293b', temple: 'Navy Gunmetal' }
  ];

  const [activeColorway, setActiveColorway] = useState(COLOR_OPTIONS[0]);
  const [selectedSize, setSelectedSize] = useState('Standard (51mm)');
  const [selectedAngleUrl, setSelectedAngleUrl] = useState('');
  const [isPrescriptionDrawerOpen, setIsPrescriptionDrawerOpen] = useState(false);

  // Delivery checker & Progressive disclosure
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [showDeliveryInput, setShowDeliveryInput] = useState(false);
  const [activeSpecTab, setActiveSpecTab] = useState('specs'); // 'specs' | 'dimensions' | 'care'

  // Share & Wishlist
  const [shareSuccess, setShareSuccess] = useState(false);

  // Wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Modals
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Sticky bottom bar trigger on scroll
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buySectionRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setSelectedAngleUrl(data.image);
        if (data.colorways && data.colorways.length > 0) {
          setActiveColorway(data.colorways[0]);
        }
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

  const handleDirectAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      sku: product.sku || sku,
      name: product.name,
      price: productPrice,
      finalPrice: productPrice,
      image: selectedAngleUrl || product.image,
      selectedColor: activeColorway.name,
      selectedSize: selectedSize,
      lensConfig: null
    }, quantity);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleCustomLensAdd = (customItem) => {
    addToCart({
      ...customItem,
      selectedColor: activeColorway.name,
      selectedSize: selectedSize
    }, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-offwhite pt-24 px-6 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-black border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-widest">
            Calibrating Optical Specifications &amp; Multi-Angle Photos...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-offwhite pt-24 px-6 max-w-7xl mx-auto text-center py-20">
        <Glasses size={48} className="mx-auto text-zinc-400 mb-3" />
        <h2 className="font-serif text-3xl font-bold mb-4 text-brand-black">Eyewear Model Not Found</h2>
        <p className="text-zinc-500 mb-8 font-mono text-xs">The requested frame design could not be found in our collection.</p>
        <Link to="/shop" className="px-6 py-3 bg-brand-black text-white text-xs font-mono uppercase tracking-wider">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Derive shape and specs
  const productPrice = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : Math.round(productPrice * 1.45);
  const discountPct = Math.round(((originalPrice - productPrice) / originalPrice) * 100);
  const brand = product.brand || 'GetChasma Atelier';
  const sku = product.sku || `FT-${product.id}-721-MFP1`;
  const frameDimensions = {
    lensWidth: product?.dimensions?.lensWidth || product?.specs?.LensWidth || 51,
    bridgeWidth: product?.dimensions?.bridgeWidth || product?.specs?.BridgeWidth || 19,
    templeLength: product?.dimensions?.templeLength || product?.specs?.TempleLength || 148
  };

  const colorways = product?.colorways?.length > 0 ? product.colorways : COLOR_OPTIONS;

  // Multi-angle photo collection (5 angles)
  const displayAngles = product?.multiAngles?.length > 0
    ? product.multiAngles
    : [
        { angle: '0°', label: 'Front Angle', url: product.image },
        { angle: '45°', label: '3/4 Perspective', url: product.images?.[1] || product.image },
        { angle: '90°', label: 'Side Temple Profile', url: product.images?.[0] || product.image },
        { angle: '180°', label: 'Inside Rim View', url: product.images?.[1] || product.image },
        { angle: 'Top', label: 'Top Caliper View', url: product.images?.[0] || product.image }
      ];

  return (
    <div className="min-h-screen bg-brand-offwhite text-brand-black antialiased pb-36">
      
      {/* 1. TOP BREADCRUMB & UTILITY BAR */}
      <div className="bg-white border-b border-brand-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs font-mono">
          <nav className="flex items-center gap-2 text-zinc-500 flex-wrap">
            <Link to="/" className="hover:text-brand-black transition-colors uppercase">Home</Link>
            <span className="text-zinc-300">/</span>
            <Link to="/shop" className="hover:text-brand-black transition-colors uppercase">Eyewear</Link>
            <span className="text-zinc-300">/</span>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-black transition-colors uppercase">
              {product.category}
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="text-brand-black font-semibold uppercase">{product.name}</span>
          </nav>

          <button 
            onClick={() => navigate(-1)}
            className="hidden sm:flex items-center gap-1 text-zinc-400 hover:text-brand-black font-mono uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>
      </div>

      {/* 2. ASYMMETRIC PDP 12-COLUMN WIREFRAME (7:5 SPLIT) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" ref={buySectionRef}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* ========================================================
              LEFT GALLERY: 7 Columns (Off-center Hero + 5 Angle Strip)
             ======================================================== */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Viewport Meta Header */}
            <div className="flex items-center justify-between pb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                ATELIER STUDIO // PERSPECTIVE ARCHIVE
              </span>
              <button
                onClick={() => setTryOnOpen(true)}
                className="px-3 py-1 border border-brand-black/20 hover:border-brand-black bg-white text-brand-black text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Camera size={12} />
                <span>Virtual Try-On</span>
              </button>
            </div>

            {/* Hero Studio Viewport */}
            <div className="relative aspect-[4/3] w-full bg-[#f5f5f3] border border-brand-black/10 flex items-center justify-center p-8 group overflow-hidden">
              {/* Precision Crosshairs */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-brand-black/40" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-brand-black/40" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-brand-black/40" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-brand-black/40" />

              {/* Angle Telemetry Tag */}
              <div className="absolute top-3 left-3 z-10">
                <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase bg-white/90 backdrop-blur-xs px-2.5 py-0.5 border border-brand-black/10">
                  ANGLE // {displayAngles.find(item => item.url === (selectedAngleUrl || product.image))?.angle || '0°'}
                </span>
              </div>

              <img
                src={selectedAngleUrl || product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Angle Thumbnails */}
            <div className="grid grid-cols-5 gap-2">
              {displayAngles.map((item, idx) => {
                const isSelected = (selectedAngleUrl || product.image) === item.url;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedAngleUrl(item.url)}
                    className={`aspect-square border p-2 bg-white flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-brand-black ring-1 ring-brand-black shadow-xs' 
                        : 'border-brand-black/10 hover:border-brand-black/40'
                    }`}
                  >
                    <img src={item.url} alt={item.angle} className="max-h-8 object-contain mb-1" />
                    <span className="font-mono text-[9px] text-zinc-400">{item.angle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              RIGHT STICKY SIDEBAR: 5 Columns
             ======================================================== */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
                  {brand} // {sku}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleShare}
                    className="w-8 h-8 border border-brand-black/10 hover:border-brand-black flex items-center justify-center text-zinc-500 hover:text-brand-black transition-colors relative cursor-pointer"
                    title="Share Eyewear"
                  >
                    <Share2 size={14} />
                    {shareSuccess && (
                      <span className="absolute -top-7 right-0 text-[9px] font-mono bg-brand-black text-white px-2 py-0.5 whitespace-nowrap">
                        Copied
                      </span>
                    )}
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className="w-8 h-8 border border-brand-black/10 hover:border-brand-black flex items-center justify-center transition-colors cursor-pointer"
                    title="Save to Wishlist"
                  >
                    <Heart
                      size={14}
                      className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-zinc-500 hover:text-rose-500'}
                    />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-brand-black mt-1.5">{product.name}</h1>
              
              <div className="flex items-baseline gap-3 mt-2">
                <p className="text-xl font-mono font-bold text-brand-black">
                  ₹{productPrice.toLocaleString('en-IN')}
                </p>
                {originalPrice > productPrice && (
                  <span className="text-xs font-mono text-zinc-400 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="font-mono text-[9px] text-[#0f766e] bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 uppercase tracking-wider">
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              <span className="text-[11px] text-zinc-400 block mt-1 font-mono">
                Tax Included · Free Express Courier
              </span>
            </div>

            {/* Physical Millimeter Caliper */}
            <FrameDimensionCaliper dimensions={product.dimensions || frameDimensions} />

            {/* Colorway Finishes */}
            <div>
              <label className="font-mono text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                Acetate &amp; Metal Finish: <span className="text-brand-black font-semibold">{activeColorway.name}</span>
              </label>
              <div className="flex gap-2">
                {colorways.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setActiveColorway(c)}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                      activeColorway.name === c.name 
                        ? 'ring-2 ring-brand-black ring-offset-2 scale-110' 
                        : 'border-brand-black/20 hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Frame Size Option */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
                  Frame Fit: <span className="text-brand-black font-semibold">{selectedSize}</span>
                </label>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="font-mono text-[10px] text-zinc-500 hover:text-brand-black underline flex items-center gap-1 cursor-pointer"
                >
                  <Ruler size={11} />
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['Narrow (49mm)', 'Standard (51mm)', 'Wide (54mm)'].map((sz) => {
                  const isSelected = selectedSize.startsWith(sz.split(' ')[0]);
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz.split(' ')[0])}
                      className={`py-2 text-xs font-mono border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-black bg-brand-black text-white'
                          : 'border-brand-black/10 bg-white text-zinc-700 hover:border-brand-black/40'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Action Triggers */}
            <div className="space-y-2 pt-4 border-t border-brand-black/10">
              <button
                onClick={() => setIsPrescriptionDrawerOpen(true)}
                className="w-full bg-brand-black text-brand-offwhite py-4 font-mono text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-99 shadow-xs"
              >
                <Sparkles size={14} className="text-[#0f766e]" />
                <span>Select Lens &amp; Prescription</span>
              </button>
              <button
                onClick={handleDirectAddToCart}
                className="w-full border border-brand-black/20 text-brand-black py-4 font-mono text-xs uppercase tracking-widest hover:border-brand-black transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-99"
              >
                {isAdded ? (
                  <>
                    <Check size={14} className="text-[#0f766e]" />
                    <span>Acquired to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    <span>Acquire Frame Only</span>
                  </>
                )}
              </button>
            </div>

            {/* Courier Dispatch & WhatsApp Assistance Accordion */}
            <div className="pt-4 border-t border-brand-black/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <button
                  onClick={() => setShowDeliveryInput(!showDeliveryInput)}
                  className="flex items-center gap-1.5 hover:text-brand-black cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  <Truck size={13} />
                  <span>Courier Dispatch Estimate</span>
                </button>
                {deliveryResult && (
                  <span className="text-[#0f766e] font-semibold text-[11px]">By {deliveryResult.date}</span>
                )}
              </div>

              {showDeliveryInput && (
                <form onSubmit={handleCheckDelivery} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 border border-brand-black/20 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-brand-black"
                  />
                  <button
                    type="submit"
                    disabled={pincode.length < 6 || checkingPincode}
                    className="px-4 py-2 bg-brand-black text-white text-[11px] uppercase tracking-wider font-mono hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                  >
                    {checkingPincode ? '...' : 'Check'}
                  </button>
                </form>
              )}

              <div className="p-3 bg-[#f5f5f3] border border-brand-black/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Phone size={13} className="text-[#0f766e]" />
                  <span className="text-[11px] uppercase tracking-wider">Optician Verification</span>
                </div>
                <a
                  href="https://wa.me/919740310101"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#0f766e] font-bold uppercase tracking-widest underline hover:text-teal-950"
                >
                  WhatsApp Consultation &rarr;
                </a>
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
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  Orthogonal CAD Metric Schematics · Dimension Line Extensions
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-mono text-brand-black underline cursor-pointer"
                >
                  Interactive Size Guide &rarr;
                </button>
              </div>

              <OpticalBlueprint dimensions={product.dimensions || frameDimensions} name={product.name} />
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
          STICKY PURCHASE & PRESCRIPTION BAR ON SCROLL
         ======================================================== */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-black/10 py-3 px-4 sm:px-8 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              {/* Left: Frame Name & Subtitle */}
              <div className="min-w-0 flex-1 hidden sm:block">
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand-black truncate font-mono">
                  {brand} // {product.name}
                </h4>
                <p className="text-[11px] text-zinc-500 truncate font-mono">
                  {product.category} &bull; {selectedSize} &bull; {activeColorway.name}
                </p>
              </div>

              {/* Price */}
              <div className="text-left sm:text-right flex-shrink-0">
                <span className="text-lg sm:text-xl font-bold text-brand-black font-mono block">
                  ₹{productPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#0f766e] font-mono font-medium uppercase tracking-wider block sm:hidden">
                  Free Express Courier
                </span>
              </div>

              {/* Right: Triggers */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={toggleWishlist}
                  className="w-10 h-10 border border-brand-black/20 hover:border-brand-black flex items-center justify-center transition-colors cursor-pointer"
                  title="Wishlist"
                >
                  <Heart
                    size={16}
                    className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-zinc-500'}
                  />
                </button>

                <button
                  onClick={() => setIsPrescriptionDrawerOpen(true)}
                  className="hidden md:flex px-4 py-2.5 bg-brand-black hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles size={13} className="text-[#0f766e]" />
                  <span>Select Lens</span>
                </button>

                <button
                  onClick={handleDirectAddToCart}
                  className="px-5 sm:px-6 py-2.5 bg-brand-black md:bg-white md:border md:border-brand-black text-white md:text-brand-black hover:bg-zinc-800 md:hover:bg-zinc-100 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  {isAdded ? (
                    <>
                      <Check size={14} className="text-[#0f766e]" />
                      <span>Acquired</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      <span>Acquire Frame</span>
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

      {/* LUXURY MULTI-STEP OPTICAL SURFACING DRAWER */}
      <PrescriptionConfigDrawer
        isOpen={isPrescriptionDrawerOpen}
        onClose={() => setIsPrescriptionDrawerOpen(false)}
        basePrice={productPrice}
        onApplyConfig={(config) => {
          handleCustomLensAdd({
            id: `${product.id}-calibrated-${Date.now()}`,
            sku: product.sku || sku,
            name: `${product.name} [${config.lensTier.title}]`,
            price: config.finalPrice,
            finalPrice: config.finalPrice,
            image: selectedAngleUrl || product.image,
            lensConfig: config,
            lensDetails: {
              visionType: config.prescriptionType,
              lensPackage: config.lensTier.title,
              specs: config.lensTier.spec,
              hydrophobicCoating: config.hydrophobicCoating
            }
          });
          setIsPrescriptionDrawerOpen(false);
        }}
      />

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

    </div>
  );
}
