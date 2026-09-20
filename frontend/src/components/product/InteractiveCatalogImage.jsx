import React, { useState } from "react";

export const InteractiveCatalogImage = ({ angles, fallbackImage, name }) => {
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);

  // If no multi-angle array exists, fallback to standard image
  const displayAngles = angles?.length > 0 ? angles : [{ url: fallbackImage, angle: "0°" }];

  const handleMouseMove = (e) => {
    if (displayAngles.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const nextIndex = Math.min(
      Math.floor(xRatio * displayAngles.length),
      displayAngles.length - 1
    );
    setActiveAngleIndex(nextIndex);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActiveAngleIndex(0)}
      className="relative aspect-square w-full bg-[#f8f8f7] overflow-hidden group cursor-crosshair border-b border-brand-black/5"
    >
      <img
        src={displayAngles[activeAngleIndex]?.url || fallbackImage}
        alt={name}
        className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Angle Telemetry Pill */}
      {displayAngles.length > 1 && (
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest bg-white/90 backdrop-blur-xs border border-brand-black/10 px-2 py-0.5 text-brand-black shadow-xs">
            VIEW: {displayAngles[activeAngleIndex]?.angle || `${activeAngleIndex * 45}°`}
          </span>
        </div>
      )}

      {/* Scrub indicator track */}
      {displayAngles.length > 1 && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-black/5 flex pointer-events-none z-10">
          {displayAngles.map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-colors duration-200 ${
                i === activeAngleIndex ? "bg-brand-black" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InteractiveCatalogImage;
