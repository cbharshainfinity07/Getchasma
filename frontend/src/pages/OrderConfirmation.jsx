import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5001/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching order confirmation:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-12 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm text-center mb-8"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={40} />
          </div>

          <span className="text-xs uppercase font-bold tracking-[0.2em] text-emerald-600 mb-2 block">
            Thank You For Choosing GetChasma
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black mb-3">
            Your Order is Confirmed!
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            We are crafting and inspecting your eyewear lenses. An SMS and email confirmation have been sent.
          </p>

          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs font-semibold mb-8">
            <span className="text-gray-400">Order Reference:</span>
            <span className="text-black font-bold text-sm tracking-wider">{order?.id || id}</span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/track-order?id=${order?.id || id}`}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <Truck size={16} /> Track Order Status
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-3.5 border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              Continue Browsing
            </Link>
          </div>
        </motion.div>

        {/* Order Details Breakdown */}
        {order && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-black">Delivery Details</h3>
              <span className="text-xs text-gray-400">
                Ordered: {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
              <div>
                <span className="font-bold text-gray-900 block mb-1">Recipient</span>
                <p>{order.customer?.name}</p>
                <p>{order.customer?.phone}</p>
                <p>{order.customer?.email}</p>
              </div>

              <div>
                <span className="font-bold text-gray-900 block mb-1">Shipping Destination</span>
                <p>{order.customer?.address}</p>
                <p>{order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <span className="font-bold text-gray-900 text-xs block mb-3">Purchased Eyewear</span>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl overflow-hidden p-1 flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-gray-900 block">{item.name}</span>
                        <span className="text-[11px] text-gray-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-black font-mono">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
              <div>
                <span className="text-gray-500">
                  Payment: <strong className="text-black">{order.paymentMethod}</strong> ({order.paymentStatus})
                </span>
                {order.paymentDetails?.utrNumber && (
                  <span className="block text-[11px] font-mono text-gray-500 mt-0.5">
                    UPI UTR: <strong className="text-black">{order.paymentDetails.utrNumber}</strong>
                  </span>
                )}
                {order.paymentDetails?.cardLast4 && (
                  <span className="block text-[11px] font-mono text-gray-500 mt-0.5">
                    Card: {order.paymentDetails.cardNetwork} •••• {order.paymentDetails.cardLast4}
                  </span>
                )}
              </div>
              <span className="text-base font-bold text-black font-mono">Total: ₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
