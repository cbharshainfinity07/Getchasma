import React from "react";

export const OpticalBlueprint = ({ dimensions, name = "Frame Architecture" }) => {
  const { lensWidth = 51, bridgeWidth = 19, templeLength = 148, lensHeight = 42 } = dimensions || {};

  return (
    <div className="relative border border-brand-black/10 bg-[#f8f8f7] p-8 overflow-hidden">
      {/* Precision Corner Registration Marks */}
      <div className="absolute top-2 left-2 font-mono text-[9px] text-zinc-400">FIG. 01 // ORTHOGONAL PROJECTION</div>
      <div className="absolute top-2 right-2 font-mono text-[9px] text-zinc-400">SCALE: 1:1 CAD METRIC</div>

      <div className="flex flex-col items-center justify-center my-6">
        <svg
          viewBox="0 0 500 220"
          className="w-full max-w-xl stroke-brand-black fill-none select-none"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Subtle Grid Matrix Background */}
          <defs>
            <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(9, 9, 11, 0.04)" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="500" height="220" fill="url(#cadGrid)" stroke="none" />

          {/* Left Lens Rim Outline */}
          <rect x="70" y="50" width="130" height="90" rx="14" strokeDasharray="none" />
          {/* Right Lens Rim Outline */}
          <rect x="290" y="50" width="130" height="90" rx="14" strokeDasharray="none" />

          {/* Bridge Architectural Arch */}
          <path d="M 200 80 C 225 68, 265 68, 290 80" />
          <path d="M 205 92 C 225 84, 265 84, 285 92" opacity="0.4" />

          {/* Temple Hinge Mounts */}
          <line x1="70" y1="75" x2="35" y2="75" />
          <circle cx="35" cy="75" r="2.5" className="fill-brand-black" />
          <line x1="420" y1="75" x2="455" y2="75" />
          <circle cx="455" cy="75" r="2.5" className="fill-brand-black" />

          {/* Extension & Dimension Lines: Lens Width */}
          <g className="stroke-zinc-400" strokeWidth="0.75">
            <line x1="70" y1="150" x2="70" y2="175" strokeDasharray="2 2" />
            <line x1="200" y1="150" x2="200" y2="175" strokeDasharray="2 2" />
            <line x1="70" y1="170" x2="200" y2="170" />
            {/* Dimension Arrows */}
            <path d="M 74 167 L 70 170 L 74 173" fill="none" />
            <path d="M 196 167 L 200 170 L 196 173" fill="none" />
          </g>
          <text x="135" y="165" textAnchor="middle" className="font-mono text-[10px] fill-brand-black font-semibold stroke-none">
            {lensWidth} mm
          </text>

          {/* Extension & Dimension Lines: Bridge */}
          <g className="stroke-zinc-400" strokeWidth="0.75">
            <line x1="200" y1="40" x2="200" y2="25" strokeDasharray="2 2" />
            <line x1="290" y1="40" x2="290" y2="25" strokeDasharray="2 2" />
            <line x1="200" y1="30" x2="290" y2="30" />
            <path d="M 204 27 L 200 30 L 204 33" fill="none" />
            <path d="M 286 27 L 290 30 L 286 33" fill="none" />
          </g>
          <text x="245" y="25" textAnchor="middle" className="font-mono text-[10px] fill-[#0f766e] font-semibold stroke-none">
            {bridgeWidth} mm
          </text>

          {/* Extension & Dimension Lines: Lens Height */}
          <g className="stroke-zinc-400" strokeWidth="0.75">
            <line x1="430" y1="50" x2="455" y2="50" strokeDasharray="2 2" />
            <line x1="430" y1="140" x2="455" y2="140" strokeDasharray="2 2" />
            <line x1="450" y1="50" x2="450" y2="140" />
            <path d="M 447 54 L 450 50 L 453 54" fill="none" />
            <path d="M 447 136 L 450 140 L 453 136" fill="none" />
          </g>
          <text x="475" y="100" textAnchor="middle" className="font-mono text-[10px] fill-brand-black font-semibold stroke-none">
            {lensHeight} mm
          </text>
        </svg>
      </div>

      {/* Blueprint Legend Footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-brand-black/10 pt-3 text-[11px] font-mono text-zinc-500">
        <span>NOMENCLATURE: {name}</span>
        <span>TEMPLE RUN: {templeLength} mm STRUCTURAL TITANIUM</span>
        <span className="text-[#0f766e]">BOX ACCURACY: ±0.2 mm</span>
      </div>
    </div>
  );
};

export default OpticalBlueprint;
