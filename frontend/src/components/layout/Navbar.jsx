import React, { useState, useEffect, useRef } from 'react';
import { Badge } from "@heroui/react";
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  Truck, 
  ArrowRight, 
  Crown, 
  User, 
  Phone, 
  MapPin, 
  Heart, 
  Glasses, 
  Sparkles 
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useUserAuth } from '../../context/UserAuthContext';
import { API_BASE_URL } from '../../config/api';

export default function AppNavbar() {
  const { cartCount, toggleCart, lastAddedItem } = useCart();
  const { user, isMember, logout } = useUserAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 50);
    }
  }, [searchOpen]);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`${API_BASE_URL}/api/products?search=${encodeURIComponent(searchQuery.trim())}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.slice(0, 5));
          setIsSearching(false);
        })
        .catch(err => {
          console.error("Search error:", err);
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* 1. TOP UTILITY STRIP (Shown on shop & inner pages only) */}
      {location.pathname !== '/' && (
        <div className="hidden md:block bg-black border-b border-neutral-800 text-gray-400 text-[11px] py-1.5 px-4 sm:px-6 select-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6 font-medium">
              <span className="flex items-center gap-1.5 text-gray-300">
                <Phone size={11} className="text-gray-400" />
                Toll Free: <strong className="text-white font-mono font-bold">1800-CHASMA</strong> (9 AM - 9 PM IST)
              </span>
              <span className="text-neutral-800">|</span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <MapPin size={11} className="text-gray-400" />
                Store Locator: <span className="text-gray-400">Kalaburagi Flagship &bull; Free Eye Checkup</span>
              </span>
            </div>

            <div className="flex items-center gap-5 font-medium">
              <Link to="/membership" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
                <Crown size={11} className="fill-amber-400" />
                Gold VIP Club
              </Link>
              <Link to="/track-order" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                <Truck size={11} />
                Track Package
              </Link>
              <a 
                href="https://wa.me/919740310101" 
                target="_blank" 
                rel="noreferrer" 
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
              >
                WhatsApp Optometrist
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN NAVIGATION HEADER */}
      <header className="sticky top-0 w-full z-40 bg-black text-white border-b border-neutral-800/80 shadow-[0_4px_25px_rgba(0,0,0,0.8)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
          
          {/* Left: Navigation Links & Mobile Menu Toggle */}
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider flex-1">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-white hover:opacity-75 transition-opacity cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>

            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className={`transition-colors ${location.pathname === '/' ? 'text-white border-b-2 border-white pb-0.5 font-extrabold' : 'text-gray-300 hover:text-white'}`}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className={`transition-colors ${location.pathname === '/shop' && !location.search ? 'text-white border-b-2 border-white pb-0.5 font-extrabold' : 'text-gray-300 hover:text-white'}`}
              >
                All Eyewear
              </Link>
              <Link 
                to="/shop?category=eye-glasses" 
                className={`transition-colors ${location.search.includes('eye-glasses') ? 'text-white border-b-2 border-white pb-0.5 font-extrabold' : 'text-gray-300 hover:text-white'}`}
              >
                Eyeglasses
              </Link>
              <Link 
                to="/shop?category=sun-glass" 
                className={`transition-colors ${location.search.includes('sun-glass') ? 'text-white border-b-2 border-white pb-0.5 font-extrabold' : 'text-gray-300 hover:text-white'}`}
              >
                Sunglasses
              </Link>
              <Link 
                to="/membership" 
                className={`transition-colors flex items-center gap-1 ${location.pathname === '/membership' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5 font-extrabold' : 'text-amber-400/90 hover:text-amber-300'}`}
              >
                <Crown size={12} className="fill-amber-400" />
                VIP Club
              </Link>
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex justify-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.webp"
                alt="GetChasma Logo"
                className="h-8 md:h-11 object-contain group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden font-serif text-2xl md:text-3xl tracking-tight text-white font-bold">
                GetChasma.
              </span>
            </Link>
          </div>

          {/* Right: Actions (Search, Account, Cart) */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-4 flex-1">
            
            {/* Search Trigger Button */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-300 hover:text-white hover:bg-neutral-800/80 rounded-full transition-all cursor-pointer"
              title="Search products"
            >
              <Search size={18} strokeWidth={1.75} />
            </button>

            {/* Customer Account / VIP Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-neutral-800/80 transition-colors cursor-pointer"
                  title="My Account"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {isMember && (
                    <Crown size={12} className="text-amber-400 fill-amber-400 -ml-1" />
                  )}
                </button>
              ) : (
                <Link
                  to="/account/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                >
                  <User size={13} />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 text-xs text-white divide-y divide-neutral-800"
                  >
                    <div className="p-2.5">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      {isMember && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                          <Crown size={10} className="fill-amber-400" /> Gold VIP Member
                        </span>
                      )}
                    </div>
                    <div className="py-1.5">
                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors"
                      >
                        My Orders &amp; Prescriptions
                      </Link>
                      <Link
                        to="/membership"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors"
                      >
                        <Crown size={13} className="fill-amber-400" />
                        VIP Club Benefits
                      </Link>
                      <Link
                        to="/track-order"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors"
                      >
                        Track Packages
                      </Link>
                    </div>
                    <div className="pt-1.5">
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Bag Trigger with Animated Count Badge */}
            <button 
              onClick={toggleCart}
              className="p-2 text-gray-300 hover:text-white hover:bg-neutral-800/80 rounded-full transition-all relative flex items-center justify-center group cursor-pointer"
              aria-label="View cart"
            >
              <ShoppingBag size={19} strokeWidth={1.75} className="group-hover:scale-105 transition-transform text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-black text-[11px] font-black flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Instant Add-to-Bag Dropdown Toast */}
        <AnimatePresence>
          {lastAddedItem && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute right-4 top-full mt-2 w-80 bg-neutral-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 shadow-2xl z-50 text-white flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex-shrink-0 flex items-center justify-center">
                <img src={lastAddedItem.image} alt={lastAddedItem.name} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  ✓ Added to Bag
                </span>
                <p className="text-xs font-bold truncate text-white">{lastAddedItem.name}</p>
                <p className="text-[11px] text-gray-400 font-mono">₹{Number(lastAddedItem.price).toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={toggleCart}
                className="px-2.5 py-1.5 bg-white text-black hover:bg-neutral-200 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer"
              >
                View
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-neutral-950 text-white z-50 p-6 flex flex-col justify-between md:hidden shadow-2xl border-r border-neutral-800"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
                  <span className="font-serif text-2xl font-bold tracking-tight text-white">GetChasma.</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-5 py-6 text-xs font-bold uppercase tracking-wider">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                  <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">
                    All Eyewear
                  </Link>
                  <Link to="/shop?category=eye-glasses" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">
                    Eyeglasses
                  </Link>
                  <Link to="/shop?category=sun-glass" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">
                    Sunglasses
                  </Link>
                  <Link to="/membership" onClick={() => setMobileMenuOpen(false)} className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2">
                    <Crown size={15} className="fill-amber-400" /> VIP Club
                  </Link>
                  <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                    <Truck size={15} /> Track Order
                  </Link>
                  <Link to={user ? "/account" : "/account/login"} onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                    <User size={15} /> {user ? "My Account" : "Sign In"}
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800 text-xs text-gray-400 space-y-1">
                <p className="font-bold text-white">GetChasma Care</p>
                <p>Call or WhatsApp: +91 97403 10101</p>
                <p>Kalaburagi Flagship &bull; Karnataka</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Live Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-neutral-900 text-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-800"
            >
              {/* Search input header */}
              <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
                <Search size={20} className="text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search metal eyeglasses, wayfarer, aviator, blue light..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchOpen(false);
                    }
                  }}
                  className="flex-1 text-base outline-none placeholder-gray-500 font-medium bg-transparent text-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-white cursor-pointer">
                    Clear
                  </button>
                )}
                <button onClick={() => setSearchOpen(false)} className="p-1 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-neutral-800">
                {isSearching ? (
                  <div className="py-8 text-center text-sm text-gray-400">Searching eyewear catalog...</div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2">
                      Matching Designs ({searchResults.length})
                    </p>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-neutral-800/60 transition-colors group"
                      >
                        <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-white group-hover:text-white truncate">{product.name}</h4>
                          <span className="text-xs text-gray-400">{product.category} &bull; {product.gender}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-white">₹{Number(product.price).toLocaleString('en-IN')}</span>
                          <ArrowRight size={14} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all inline-block ml-2" />
                        </div>
                      </Link>
                    ))}
                    <div className="pt-3 px-3 text-center">
                      <button
                        onClick={() => {
                          navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                          setSearchOpen(false);
                        }}
                        className="text-xs font-bold text-gray-300 hover:text-white underline cursor-pointer"
                      >
                        View all results in Shop &rarr;
                      </button>
                    </div>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    No glasses found matching &ldquo;{searchQuery}&rdquo;. Try &ldquo;Aviator&rdquo;, &ldquo;Sun Glass&rdquo;, or &ldquo;Square&rdquo;.
                  </div>
                ) : (
                  <div className="py-4 px-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Popular Eyewear Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {['Aviator', 'Sun Glass', 'Blue Light', 'Titanium', 'Retro Square', 'Tortoise'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-3 py-1.5 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white transition-colors font-medium cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
