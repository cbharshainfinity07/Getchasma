import React, { useRef } from 'react';
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], ["-20px", "20px"]);
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], ["-20px", "20px"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleTouchMove = (e) => {
    if (!ref.current || !e.touches[0]) return;
    const rect = ref.current.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = (touch.clientX - rect.left) / rect.width - 0.5;
    const touchY = (touch.clientY - rect.top) / rect.height - 0.5;
    x.set(touchX);
    y.set(touchY);
  };

  const handleTouchEnd = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-[90dvh] md:min-h-[92dvh] bg-black overflow-hidden flex flex-col justify-center items-center py-12 md:py-0 select-none"
      style={{ perspective: "1000px" }}
    >
      {/* Clean neutral ambient lighting */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0">
        <div className="w-[75vw] h-[75vw] max-w-[700px] max-h-[700px] bg-neutral-700 rounded-full blur-[140px]" />
      </div>

      {/* 3D Floating Glasses Image with Levitation + Interactive Tilt */}
      <motion.div
        className="absolute z-10 w-full max-w-5xl pointer-events-none flex justify-center items-center px-4 -translate-y-4 sm:translate-y-0"
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformStyle: "preserve-3d"
        }}
      >
        <motion.img
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          src="/3d-glasses.png"
          alt="Floating 3D Glasses"
          className="w-full max-w-[240px] sm:max-w-[340px] md:max-w-2xl lg:max-w-4xl h-auto object-contain drop-shadow-2xl"
          style={{ transform: "translateZ(80px)" }}
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-20 text-center px-4 mt-6 sm:mt-10 md:mt-12 flex flex-col items-center pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gray-400 text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-5"
        >
          Up To 15% Off
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white font-sans text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] max-w-3xl mx-auto mb-5 sm:mb-8 px-2"
          style={{ textShadow: "0 10px 30px rgba(0,0,0,0.85)" }}
        >
          Perfect Glasses For Your<br className="hidden sm:inline" /> Unique Style
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="pointer-events-auto"
        >
          <Link to="/shop">
            <button
              className="bg-white text-black font-semibold text-xs tracking-widest uppercase px-8 py-3.5 rounded-full hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer shadow-xl"
            >
              See More
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-6 md:bottom-12 z-30 flex items-center gap-6 text-white text-xs md:text-sm font-semibold tracking-widest">
        <button className="hover:text-gray-400 transition-colors pointer-events-auto cursor-pointer p-2" aria-label="Previous slide">
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <span>01/02</span>
        <button className="hover:text-gray-400 transition-colors pointer-events-auto cursor-pointer p-2" aria-label="Next slide">
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
