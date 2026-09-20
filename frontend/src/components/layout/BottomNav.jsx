import React from 'react';
import { Home, Compass, Truck, ShoppingBag, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function BottomNav() {
  const location = useLocation();
  const { cartCount, toggleCart } = useCart();

  // Don't show mobile bottom nav when on admin dashboard, checkout, or PDP
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout' || location.pathname.startsWith('/product/')) {
    return null;
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Catalog', path: '/shop' },
    { icon: Crown, label: 'VIP Club', path: '/membership', isVip: true },
    { icon: Truck, label: 'Track', path: '/track-order' },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-2xl border-t border-neutral-800/80 z-40 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={idx} 
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 space-y-1 transition-all active:scale-90 ${
                isActive 
                  ? item.isVip ? 'text-amber-400' : 'text-white' 
                  : item.isVip ? 'text-amber-400/70 hover:text-amber-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.2 : 1.6} 
                  className={item.isVip && isActive ? 'fill-amber-400/20' : ''}
                />
                {isActive && (
                  <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${item.isVip ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'}`} />
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Floating Cart Trigger */}
        <button
          onClick={toggleCart}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 space-y-1 text-neutral-400 hover:text-white relative active:scale-90 transition-all cursor-pointer"
          aria-label={`Shopping bag with ${cartCount} items`}
        >
          <div className="relative">
            <ShoppingBag size={20} strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center shadow-lg">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Bag</span>
        </button>
      </div>
    </nav>
  );
}
