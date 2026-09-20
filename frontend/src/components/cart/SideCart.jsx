import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartLineItem from './CartLineItem';

export { CartLineItem };

export default function SideCart() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 1999;
  const progressToFreeShipping = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white border-l border-brand-black/10 z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-brand-black/10">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block mb-0.5">
                  ATELIER ACQUISITIONS
                </span>
                <h2 className="text-lg font-bold tracking-tight text-brand-black">Shopping Bag</h2>
                <span className="text-xs text-zinc-400 font-mono">{cartItems.length} unique frames</span>
              </div>
              <button 
                onClick={closeCart} 
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-brand-black cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="px-6 py-3 bg-[#f8f8f7] border-b border-brand-black/10">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-600">
                  {remainingForFreeShipping > 0 
                    ? `Add ₹${Math.round(remainingForFreeShipping).toLocaleString('en-IN')} for Free Courier` 
                    : 'Unlocked FREE Express Courier'}
                </span>
                <span className="text-brand-black font-bold">{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="w-full h-1 bg-zinc-200 rounded-none overflow-hidden">
                <div 
                  className="h-full bg-brand-black transition-all duration-500"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 divide-y divide-brand-black/5">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4 text-center py-12">
                  <div className="w-14 h-14 bg-[#f5f5f3] text-zinc-400 rounded-full flex items-center justify-center border border-brand-black/10">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-mono font-semibold text-sm text-brand-black mb-1">Your bag is empty</h3>
                    <p className="text-xs text-zinc-500 font-mono max-w-[220px]">
                      Discover our collection of handcrafted sunglasses and optical frames.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      closeCart();
                      navigate('/shop');
                    }}
                    className="mt-4 px-6 py-3 bg-brand-black hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Browse Eyewear
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-neutral-200 bg-white">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-neutral-500 text-sm font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-neutral-950 font-mono">₹{Number(cartTotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-4">Taxes and shipping calculated at checkout</p>
                
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight size={15} />
                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Secure 256-bit SSL Encrypted Checkout</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
