import React, { useState, useEffect } from 'react';
import { Sparkles, X, Copy, Check, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchCoupons = () => {
    fetch('http://localhost:5001/api/coupons?display=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCoupons(data);
        } else {
          setCoupons([]);
        }
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  };

  useEffect(() => {
    fetchCoupons();
    // Poll every 3s so admin toggles immediately reflect on the user storefront
    const interval = setInterval(fetchCoupons, 3000);

    const handleStorage = (e) => {
      if (e.key === 'chasma_coupons_updated') {
        fetchCoupons();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('chasma_coupon_toggle', fetchCoupons);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('chasma_coupon_toggle', fetchCoupons);
    };
  }, []);

  // If user dismissed, or data loaded and NO coupons are configured to display on site, HIDE BANNER COMPLETELY
  if (dismissed || !loaded || coupons.length === 0) return null;

  const handleCopy = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Only broadcast live coupons configured to display
  const marqueeItems = coupons;

  // Repeat for continuous seamless infinite marquee
  const repeatedItems = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 border-b border-indigo-500/30 text-white overflow-hidden z-50 select-none py-2 md:py-2.5 shadow-sm">
      {/* Ambient gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* Marquee Track with Pause on Hover */}
      <div className="w-full flex items-center overflow-hidden">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {repeatedItems.map((item, idx) => {
            const isCopied = copiedCode === item.code;

            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={(e) => handleCopy(item.code, e)}
                className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-sm transition-all text-xs group"
                title="Click to copy coupon code"
              >
                <span className="flex items-center gap-1 text-yellow-300 font-bold uppercase tracking-wider text-[10px]">
                  <Sparkles size={11} className="animate-spin-slow" />
                  PROMO
                </span>

                <span className="text-white font-semibold">
                  {item.description}
                </span>

                {/* Coupon Code Pill */}
                <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider transition-all ${
                  isCopied
                    ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                    : 'bg-white text-indigo-900 font-black shadow-sm'
                }`}>
                  <Tag size={10} />
                  <span>{item.code}</span>
                  {isCopied ? (
                    <Check size={11} className="text-black stroke-[3]" />
                  ) : (
                    <Copy size={10} className="text-indigo-900 opacity-80 group-hover:opacity-100" />
                  )}
                </span>

                {isCopied && (
                  <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                    Copied!
                  </span>
                )}

                <span className="text-white/20 ml-2">&bull;</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1 rounded-full border border-white/30 transition-colors z-20"
        title="Dismiss announcement banner"
      >
        <X size={12} />
      </button>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 32s linear infinite;
        }
      `}</style>
    </div>
  );
}
