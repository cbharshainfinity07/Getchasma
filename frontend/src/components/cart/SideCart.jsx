import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import PuffyButton from '../ui/PuffyButton';

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
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-gray-100 z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-black">Shopping Bag</h2>
                <span className="text-xs text-gray-400 font-medium">{cartItems.length} unique frames</span>
              </div>
              <button 
                onClick={closeCart} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200/80">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-neutral-700">
                  {remainingForFreeShipping > 0 
                    ? `Add ₹${Math.round(remainingForFreeShipping).toLocaleString('en-IN')} more for FREE Delivery` 
                    : 'You unlocked FREE Express Delivery!'}
                </span>
                <span className="text-neutral-950 font-bold">{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neutral-950 transition-all duration-500 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 text-center">
                  <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-neutral-900 mb-1">Your bag is empty</h3>
                    <p className="text-xs text-neutral-500 max-w-[200px]">
                      Discover our collection of handcrafted sunglasses and optical frames.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      closeCart();
                      navigate('/shop');
                    }}
                    className="mt-4 px-7 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    Browse Eyewear
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 border border-neutral-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm line-clamp-1 text-neutral-900">{item.name}</h3>
                        {item.lensDetails && (
                          <span className="text-[10px] font-semibold text-emerald-700 block truncate">
                            &bull; {item.lensDetails.lensPackage}
                          </span>
                        )}
                        <p className="text-neutral-950 font-bold text-sm mt-0.5 font-mono">₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-white border border-neutral-200 rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-neutral-100 rounded-l-lg transition-colors text-neutral-500"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-neutral-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-neutral-100 rounded-r-lg transition-colors text-neutral-500"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
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
