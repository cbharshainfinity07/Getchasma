import React from 'react';
import { Home, Compass, Truck, LayoutDashboard, ShoppingBag, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function BottomNav() {
  const location = useLocation();
  const { cartCount, toggleCart } = useCart();

  // Don't show mobile bottom nav when on admin dashboard
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Shop', path: '/shop' },
    { icon: Crown, label: 'VIP Club', path: '/membership', isVip: true },
    { icon: Truck, label: 'Track', path: '/track-order' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200/70 z-40 pb-safe shadow-[0_-8px_25px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={idx} 
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all active:scale-95 ${
                isActive 
                  ? 'text-blue-600 font-bold' 
                  : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon 
                  size={19} 
                  strokeWidth={isActive ? 2.3 : 1.7} 
                />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold text-blue-600' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Floating Cart Trigger */}
        <button
          onClick={toggleCart}
          className="flex flex-col items-center justify-center flex-1 h-full space-y-1 text-slate-500 hover:text-blue-600 relative active:scale-95 transition-all"
        >
          <div className="relative">
            <ShoppingBag size={19} strokeWidth={1.7} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Bag</span>
        </button>
      </div>
    </div>
  );
}
