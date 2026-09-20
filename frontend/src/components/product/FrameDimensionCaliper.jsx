import React from "react";

export const FrameDimensionCaliper = ({ dimensions }) => {
  // dimensions: { lensWidth: 51, bridgeWidth: 19, templeLength: 148 }
  const dims = {
    lensWidth: dimensions?.lensWidth || 51,
    bridgeWidth: dimensions?.bridgeWidth || 19,
    templeLength: dimensions?.templeLength || 148
  };

  return (
    <div className="my-6 border border-brand-black/10 bg-white p-4">
      <div className="flex items-center justify-between border-b border-brand-black/5 pb-2 mb-3">
        <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
          FRAME GEOMETRY / BOX MEASUREMENT SYSTEM
        </span>
        <span className="font-mono text-xs font-semibold text-brand-black">
          {dims.lensWidth}□{dims.bridgeWidth}-{dims.templeLength}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="relative py-2 bg-[#f9fafb]">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400">Lens Width</span>
          <span className="font-mono text-sm font-semibold text-brand-black">{dims.lensWidth} mm</span>
          <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-brand-black/20" />
        </div>
        <div className="relative py-2 bg-[#f9fafb]">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400">Bridge</span>
          <span className="font-mono text-sm font-semibold text-brand-black">{dims.bridgeWidth} mm</span>
          <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-brand-black/20" />
        </div>
        <div className="relative py-2 bg-[#f9fafb]">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400">Temple</span>
          <span className="font-mono text-sm font-semibold text-brand-black">{dims.templeLength} mm</span>
          <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-brand-black/20" />
        </div>
      </div>
    </div>
  );
};

export default FrameDimensionCaliper;
