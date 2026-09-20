import React from "react";

export const CartLineItem = ({ item, onRemove, onUpdateQuantity }) => {
  const displaySku = item.sku || `FT-${item.id}-RAW`;
  const displayPrice = item.finalPrice !== undefined ? item.finalPrice : item.price;
  const lensConfig = item.lensConfig || (item.lensDetails ? {
    lensTier: { title: item.lensDetails.lensPackage || "Classic Precision" },
    prescriptionType: item.lensDetails.visionType || "Single Vision",
    hydrophobicCoating: item.lensDetails.hydrophobicCoating || false
  } : null);

  return (
    <div className="py-4 border-b border-brand-black/10 flex gap-4">
      {/* Product Image Frame */}
      <div className="w-20 h-20 bg-[#f5f5f3] border border-brand-black/5 flex-shrink-0 flex items-center justify-center p-2">
        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block">
              {displaySku}
            </span>
            <h4 className="font-sans font-semibold text-sm text-brand-black truncate">{item.name}</h4>
          </div>
          <span className="font-mono text-xs font-bold text-brand-black">
            ₹{Number(displayPrice || 0).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Prescription Metadata Chip */}
        {lensConfig ? (
          <div className="mt-2 bg-[#fcfcfb] border border-brand-black/10 p-2 font-mono text-[10px] text-zinc-600 space-y-0.5">
            <div className="flex justify-between">
              <span className="text-zinc-400">SURFACING:</span>
              <span className="font-semibold text-brand-black">{lensConfig.lensTier?.title || "Custom Lab Monomer"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">APPLICATION:</span>
              <span>{lensConfig.prescriptionType || "Single Vision"}</span>
            </div>
            {lensConfig.hydrophobicCoating && (
              <div className="flex justify-between text-[#0f766e]">
                <span>ADD-ON:</span>
                <span>Hydrophobic Glaze Active</span>
              </div>
            )}
          </div>
        ) : (
          <span className="inline-block mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400 border border-brand-black/10 px-1.5 py-0.5">
            FRAME ONLY // RAW SHIPMENT
          </span>
        )}

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-zinc-400">QTY: {item.quantity}</span>
            {onUpdateQuantity && (
              <div className="flex items-center border border-brand-black/10 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="px-1.5 py-0.5 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                  title="Decrease quantity"
                >
                  -
                </button>
                <span className="px-1.5 text-brand-black font-semibold border-x border-brand-black/10">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="px-1.5 py-0.5 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                  title="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="font-mono text-[10px] text-zinc-400 uppercase hover:text-brand-black underline underline-offset-2 cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartLineItem;
